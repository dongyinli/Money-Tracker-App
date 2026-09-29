import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import {
  closeDb,
  createTransaction,
  deleteTransaction,
  getBalanceSummary,
  listCategoryOptions,
  listIncomeCategoryOptions,
  listTransactions,
  TransactionFilter,
  TransactionInput,
  updateTransaction,
} from './db';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }
};

ipcMain.handle('categories:list', () => listCategoryOptions());
ipcMain.handle('incomeCategories:list', () => listIncomeCategoryOptions());
ipcMain.handle('transactions:list', (_event, filter?: TransactionFilter) =>
  listTransactions(filter),
);
ipcMain.handle('transactions:create', (_event, input: TransactionInput) =>
  createTransaction(input),
);
ipcMain.handle('transactions:update', (_event, id: number, input: TransactionInput) =>
  updateTransaction(id, input),
);
ipcMain.handle('transactions:delete', (_event, id: number) => deleteTransaction(id));
ipcMain.handle('transactions:balance', () => getBalanceSummary());

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('before-quit', () => {
  closeDb();
});
