import path from 'node:path';
import { app } from 'electron';
import Database from 'better-sqlite3';
import { CATEGORY_SEED } from './categories';

let db: Database.Database | undefined;

function createSchema(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS primary_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      sort_order INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS subcategories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      primary_category_id INTEGER NOT NULL REFERENCES primary_categories(id),
      name TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      UNIQUE (primary_category_id, name)
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount_usd REAL NOT NULL,
      expense_date TEXT NOT NULL,
      subcategory_id INTEGER NOT NULL REFERENCES subcategories(id),
      note TEXT,
      merchant TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

function seedCategories(database: Database.Database) {
  const existingCount = database
    .prepare('SELECT COUNT(*) AS count FROM primary_categories')
    .get() as { count: number };

  if (existingCount.count > 0) {
    return;
  }

  const insertPrimary = database.prepare(
    'INSERT INTO primary_categories (name, sort_order) VALUES (?, ?)',
  );
  const insertSub = database.prepare(
    'INSERT INTO subcategories (primary_category_id, name, sort_order) VALUES (?, ?, ?)',
  );

  const seedAll = database.transaction(() => {
    CATEGORY_SEED.forEach((primary, primaryIndex) => {
      const { lastInsertRowid } = insertPrimary.run(primary.name, primaryIndex);
      primary.subcategories.forEach((subName, subIndex) => {
        insertSub.run(lastInsertRowid, subName, subIndex);
      });
    });
  });

  seedAll();
}

export function getDb(): Database.Database {
  if (!db) {
    const dbPath = path.join(app.getPath('userData'), 'expense-tracker.sqlite3');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    createSchema(db);
    seedCategories(db);
    // Force the schema/seed data out of the WAL file and into the main database
    // file immediately, so it survives even if the app is later killed abruptly
    // (a checkpoint would otherwise only happen on a clean close).
    db.pragma('wal_checkpoint(TRUNCATE)');
  }
  return db;
}

export function closeDb(): void {
  if (db) {
    db.pragma('wal_checkpoint(TRUNCATE)');
    db.close();
    db = undefined;
  }
}

export interface CategoryOption {
  primaryId: number;
  primaryName: string;
  subcategoryId: number;
  subcategoryName: string;
}

export function listCategoryOptions(): CategoryOption[] {
  return getDb()
    .prepare(
      `SELECT pc.id AS primaryId, pc.name AS primaryName,
              sc.id AS subcategoryId, sc.name AS subcategoryName
       FROM primary_categories pc
       JOIN subcategories sc ON sc.primary_category_id = pc.id
       ORDER BY pc.sort_order, sc.sort_order`,
    )
    .all() as CategoryOption[];
}

export interface ExpenseInput {
  amountUsd: number;
  expenseDate: string;
  subcategoryId: number;
  note: string | null;
  merchant: string | null;
}

export interface Expense extends ExpenseInput {
  id: number;
  primaryCategoryName: string;
  subcategoryName: string;
  createdAt: string;
}

const EXPENSE_SELECT = `
  SELECT e.id AS id,
         e.amount_usd AS amountUsd,
         e.expense_date AS expenseDate,
         e.subcategory_id AS subcategoryId,
         e.note AS note,
         e.merchant AS merchant,
         e.created_at AS createdAt,
         sc.name AS subcategoryName,
         pc.name AS primaryCategoryName
  FROM expenses e
  JOIN subcategories sc ON sc.id = e.subcategory_id
  JOIN primary_categories pc ON pc.id = sc.primary_category_id
`;

export interface ExpenseFilter {
  startDate?: string;
  endDate?: string;
  primaryCategoryId?: number;
  subcategoryId?: number;
}

export function listExpenses(filter: ExpenseFilter = {}): Expense[] {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (filter.startDate) {
    conditions.push('e.expense_date >= ?');
    params.push(filter.startDate);
  }
  if (filter.endDate) {
    conditions.push('e.expense_date <= ?');
    params.push(filter.endDate);
  }
  if (filter.subcategoryId) {
    conditions.push('e.subcategory_id = ?');
    params.push(filter.subcategoryId);
  } else if (filter.primaryCategoryId) {
    conditions.push('pc.id = ?');
    params.push(filter.primaryCategoryId);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  return getDb()
    .prepare(`${EXPENSE_SELECT} ${whereClause} ORDER BY e.expense_date DESC, e.id DESC`)
    .all(...params) as Expense[];
}

function getExpenseById(database: Database.Database, id: number): Expense {
  const row = database.prepare(`${EXPENSE_SELECT} WHERE e.id = ?`).get(id) as Expense | undefined;
  if (!row) {
    throw new Error(`Expense ${id} not found`);
  }
  return row;
}

export function createExpense(input: ExpenseInput): Expense {
  const database = getDb();
  const { lastInsertRowid } = database
    .prepare(
      `INSERT INTO expenses (amount_usd, expense_date, subcategory_id, note, merchant)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(input.amountUsd, input.expenseDate, input.subcategoryId, input.note, input.merchant);
  return getExpenseById(database, Number(lastInsertRowid));
}

export function updateExpense(id: number, input: ExpenseInput): Expense {
  const database = getDb();
  database
    .prepare(
      `UPDATE expenses
       SET amount_usd = ?, expense_date = ?, subcategory_id = ?, note = ?, merchant = ?
       WHERE id = ?`,
    )
    .run(input.amountUsd, input.expenseDate, input.subcategoryId, input.note, input.merchant, id);
  return getExpenseById(database, id);
}

export function deleteExpense(id: number): void {
  getDb().prepare('DELETE FROM expenses WHERE id = ?').run(id);
}
