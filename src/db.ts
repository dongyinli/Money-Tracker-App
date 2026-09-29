import path from 'node:path';
import { app } from 'electron';
import Database from 'better-sqlite3';
import { CATEGORY_SEED, INCOME_CATEGORY_SEED } from './categories';

let db: Database.Database | undefined;

function tableExists(database: Database.Database, name: string): boolean {
  const row = database
    .prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`)
    .get(name);
  return row !== undefined;
}

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

    CREATE TABLE IF NOT EXISTS income_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      sort_order INTEGER NOT NULL
    );
  `);

  // "transactions" replaces the old "expenses" table so income and expenses can
  // share one list. On an app that already has expense data from before income
  // tracking existed, migrate that data in rather than losing it.
  if (!tableExists(database, 'transactions')) {
    const hasLegacyExpenses = tableExists(database, 'expenses');

    database.exec(`
      CREATE TABLE transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL CHECK (type IN ('expense', 'income')),
        amount_usd REAL NOT NULL,
        transaction_date TEXT NOT NULL,
        subcategory_id INTEGER REFERENCES subcategories(id),
        income_category_id INTEGER REFERENCES income_categories(id),
        note TEXT,
        merchant TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    if (hasLegacyExpenses) {
      database.exec(`
        INSERT INTO transactions
          (type, amount_usd, transaction_date, subcategory_id, note, merchant, created_at)
        SELECT 'expense', amount_usd, expense_date, subcategory_id, note, merchant, created_at
        FROM expenses;
      `);
      database.exec('DROP TABLE expenses;');
    }
  }
}

function seedCategories(database: Database.Database) {
  const existingCount = database
    .prepare('SELECT COUNT(*) AS count FROM primary_categories')
    .get() as { count: number };

  if (existingCount.count === 0) {
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

  const existingIncomeCount = database
    .prepare('SELECT COUNT(*) AS count FROM income_categories')
    .get() as { count: number };

  if (existingIncomeCount.count === 0) {
    const insertIncome = database.prepare(
      'INSERT INTO income_categories (name, sort_order) VALUES (?, ?)',
    );

    const seedIncome = database.transaction(() => {
      INCOME_CATEGORY_SEED.forEach((name, index) => {
        insertIncome.run(name, index);
      });
    });

    seedIncome();
  }
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

export interface IncomeCategoryOption {
  incomeCategoryId: number;
  incomeCategoryName: string;
}

export function listIncomeCategoryOptions(): IncomeCategoryOption[] {
  return getDb()
    .prepare(
      `SELECT id AS incomeCategoryId, name AS incomeCategoryName
       FROM income_categories
       ORDER BY sort_order`,
    )
    .all() as IncomeCategoryOption[];
}

export type TransactionType = 'expense' | 'income';

export interface TransactionInput {
  type: TransactionType;
  amountUsd: number;
  transactionDate: string;
  subcategoryId: number | null;
  incomeCategoryId: number | null;
  note: string | null;
  merchant: string | null;
}

export interface Transaction extends TransactionInput {
  id: number;
  primaryCategoryName: string | null;
  subcategoryName: string | null;
  incomeCategoryName: string | null;
  createdAt: string;
}

const TRANSACTION_SELECT = `
  SELECT t.id AS id,
         t.type AS type,
         t.amount_usd AS amountUsd,
         t.transaction_date AS transactionDate,
         t.subcategory_id AS subcategoryId,
         t.income_category_id AS incomeCategoryId,
         t.note AS note,
         t.merchant AS merchant,
         t.created_at AS createdAt,
         sc.name AS subcategoryName,
         pc.name AS primaryCategoryName,
         ic.name AS incomeCategoryName
  FROM transactions t
  LEFT JOIN subcategories sc ON sc.id = t.subcategory_id
  LEFT JOIN primary_categories pc ON pc.id = sc.primary_category_id
  LEFT JOIN income_categories ic ON ic.id = t.income_category_id
`;

export interface TransactionFilter {
  startDate?: string;
  endDate?: string;
  type?: TransactionType;
  primaryCategoryId?: number;
  subcategoryId?: number;
  incomeCategoryId?: number;
}

export function listTransactions(filter: TransactionFilter = {}): Transaction[] {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (filter.startDate) {
    conditions.push('t.transaction_date >= ?');
    params.push(filter.startDate);
  }
  if (filter.endDate) {
    conditions.push('t.transaction_date <= ?');
    params.push(filter.endDate);
  }
  if (filter.type) {
    conditions.push('t.type = ?');
    params.push(filter.type);
  }
  if (filter.subcategoryId) {
    conditions.push('t.subcategory_id = ?');
    params.push(filter.subcategoryId);
  } else if (filter.primaryCategoryId) {
    conditions.push('pc.id = ?');
    params.push(filter.primaryCategoryId);
  }
  if (filter.incomeCategoryId) {
    conditions.push('t.income_category_id = ?');
    params.push(filter.incomeCategoryId);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  return getDb()
    .prepare(`${TRANSACTION_SELECT} ${whereClause} ORDER BY t.transaction_date DESC, t.id DESC`)
    .all(...params) as Transaction[];
}

function getTransactionById(database: Database.Database, id: number): Transaction {
  const row = database.prepare(`${TRANSACTION_SELECT} WHERE t.id = ?`).get(id) as
    | Transaction
    | undefined;
  if (!row) {
    throw new Error(`Transaction ${id} not found`);
  }
  return row;
}

export function createTransaction(input: TransactionInput): Transaction {
  const database = getDb();
  const { lastInsertRowid } = database
    .prepare(
      `INSERT INTO transactions
        (type, amount_usd, transaction_date, subcategory_id, income_category_id, note, merchant)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      input.type,
      input.amountUsd,
      input.transactionDate,
      input.type === 'expense' ? input.subcategoryId : null,
      input.type === 'income' ? input.incomeCategoryId : null,
      input.note,
      input.merchant,
    );
  return getTransactionById(database, Number(lastInsertRowid));
}

export function updateTransaction(id: number, input: TransactionInput): Transaction {
  const database = getDb();
  database
    .prepare(
      `UPDATE transactions
       SET type = ?, amount_usd = ?, transaction_date = ?, subcategory_id = ?,
           income_category_id = ?, note = ?, merchant = ?
       WHERE id = ?`,
    )
    .run(
      input.type,
      input.amountUsd,
      input.transactionDate,
      input.type === 'expense' ? input.subcategoryId : null,
      input.type === 'income' ? input.incomeCategoryId : null,
      input.note,
      input.merchant,
      id,
    );
  return getTransactionById(database, id);
}

export function deleteTransaction(id: number): void {
  getDb().prepare('DELETE FROM transactions WHERE id = ?').run(id);
}

export interface BalanceSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export function getBalanceSummary(): BalanceSummary {
  const row = getDb()
    .prepare(
      `SELECT
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount_usd ELSE 0 END), 0) AS totalIncome,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount_usd ELSE 0 END), 0) AS totalExpense
       FROM transactions`,
    )
    .get() as { totalIncome: number; totalExpense: number };

  return {
    totalIncome: row.totalIncome,
    totalExpense: row.totalExpense,
    balance: row.totalIncome - row.totalExpense,
  };
}
