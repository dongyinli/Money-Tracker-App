import type {
  BalancePeriod,
  BalanceSummary,
  CategoryOption,
  IncomeCategoryOption,
  Transaction,
  TransactionFilter,
  TransactionInput,
} from './db';

export interface MoneyTrackerApi {
  listCategoryOptions: () => Promise<CategoryOption[]>;
  listIncomeCategoryOptions: () => Promise<IncomeCategoryOption[]>;
  listTransactions: (filter?: TransactionFilter) => Promise<Transaction[]>;
  createTransaction: (input: TransactionInput) => Promise<Transaction>;
  updateTransaction: (id: number, input: TransactionInput) => Promise<Transaction>;
  deleteTransaction: (id: number) => Promise<void>;
  getBalanceSummary: (period?: BalancePeriod) => Promise<BalanceSummary>;
}

declare global {
  interface Window {
    api: MoneyTrackerApi;
  }
}
