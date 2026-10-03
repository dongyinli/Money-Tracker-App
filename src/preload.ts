import { contextBridge, ipcRenderer } from 'electron';
import type {
  BalancePeriod,
  BalanceSummary,
  CategoryOption,
  IncomeCategoryOption,
  Transaction,
  TransactionFilter,
  TransactionInput,
} from './db';

contextBridge.exposeInMainWorld('api', {
  listCategoryOptions: (): Promise<CategoryOption[]> => ipcRenderer.invoke('categories:list'),
  listIncomeCategoryOptions: (): Promise<IncomeCategoryOption[]> =>
    ipcRenderer.invoke('incomeCategories:list'),
  listTransactions: (filter?: TransactionFilter): Promise<Transaction[]> =>
    ipcRenderer.invoke('transactions:list', filter),
  createTransaction: (input: TransactionInput): Promise<Transaction> =>
    ipcRenderer.invoke('transactions:create', input),
  updateTransaction: (id: number, input: TransactionInput): Promise<Transaction> =>
    ipcRenderer.invoke('transactions:update', id, input),
  deleteTransaction: (id: number): Promise<void> => ipcRenderer.invoke('transactions:delete', id),
  getBalanceSummary: (period?: BalancePeriod): Promise<BalanceSummary> =>
    ipcRenderer.invoke('transactions:balance', period),
});
