import { contextBridge, ipcRenderer } from 'electron';
import type { CategoryOption, Expense, ExpenseFilter, ExpenseInput } from './db';

contextBridge.exposeInMainWorld('api', {
  listCategoryOptions: (): Promise<CategoryOption[]> => ipcRenderer.invoke('categories:list'),
  listExpenses: (filter?: ExpenseFilter): Promise<Expense[]> =>
    ipcRenderer.invoke('expenses:list', filter),
  createExpense: (input: ExpenseInput): Promise<Expense> =>
    ipcRenderer.invoke('expenses:create', input),
  updateExpense: (id: number, input: ExpenseInput): Promise<Expense> =>
    ipcRenderer.invoke('expenses:update', id, input),
  deleteExpense: (id: number): Promise<void> => ipcRenderer.invoke('expenses:delete', id),
});
