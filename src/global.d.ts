import type { CategoryOption, Expense, ExpenseFilter, ExpenseInput } from './db';

export interface ExpenseTrackerApi {
  listCategoryOptions: () => Promise<CategoryOption[]>;
  listExpenses: (filter?: ExpenseFilter) => Promise<Expense[]>;
  createExpense: (input: ExpenseInput) => Promise<Expense>;
  updateExpense: (id: number, input: ExpenseInput) => Promise<Expense>;
  deleteExpense: (id: number) => Promise<void>;
}

declare global {
  interface Window {
    api: ExpenseTrackerApi;
  }
}
