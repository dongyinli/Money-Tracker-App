import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import {
  closeDb,
  createExpense,
  deleteExpense,
  ExpenseFilter,
  ExpenseInput,
  listCategoryOptions,
  listExpenses,
  updateExpense,
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

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

ipcMain.handle('categories:list', () => listCategoryOptions());
ipcMain.handle('expenses:list', (_event, filter?: ExpenseFilter) => listExpenses(filter));
ipcMain.handle('expenses:create', (_event, input: ExpenseInput) => createExpense(input));
ipcMain.handle('expenses:update', (_event, id: number, input: ExpenseInput) =>
  updateExpense(id, input),
);
ipcMain.handle('expenses:delete', (_event, id: number) => deleteExpense(id));

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
