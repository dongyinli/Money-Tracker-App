import { useCallback, useEffect, useState } from 'react';
import type {
  BalanceSummary,
  CategoryOption,
  IncomeCategoryOption,
  Transaction,
  TransactionFilter,
  TransactionInput,
} from './db';
import { TransactionFilters } from './TransactionFilters';
import { TransactionForm } from './TransactionForm';
import { TransactionList } from './TransactionList';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export function App() {
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [incomeCategoryOptions, setIncomeCategoryOptions] = useState<IncomeCategoryOption[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<BalanceSummary | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filter, setFilter] = useState<TransactionFilter>({});
  const [error, setError] = useState<string | null>(null);

  const refreshTransactions = useCallback(
    (currentFilter: TransactionFilter) => {
      window.api.listTransactions(currentFilter).then(setTransactions).catch((err) => setError(String(err)));
    },
    [],
  );

  const refreshBalance = useCallback(() => {
    window.api.getBalanceSummary().then(setBalance).catch((err) => setError(String(err)));
  }, []);

  useEffect(() => {
    window.api.listCategoryOptions().then(setCategoryOptions).catch((err) => setError(String(err)));
    window.api
      .listIncomeCategoryOptions()
      .then(setIncomeCategoryOptions)
      .catch((err) => setError(String(err)));
    refreshBalance();
  }, [refreshBalance]);

  useEffect(() => {
    refreshTransactions(filter);
  }, [filter, refreshTransactions]);

  const handleSubmit = (input: TransactionInput) => {
    const request = editingTransaction
      ? window.api.updateTransaction(editingTransaction.id, input)
      : window.api.createTransaction(input);

    request
      .then(() => {
        setEditingTransaction(null);
        refreshTransactions(filter);
        refreshBalance();
      })
      .catch((err) => setError(String(err)));
  };

  const handleDelete = (transaction: Transaction) => {
    const kind = transaction.type === 'income' ? 'income' : 'expense';
    const confirmed = window.confirm(
      `Delete this $${transaction.amountUsd.toFixed(2)} ${kind} from ${transaction.transactionDate}?`,
    );
    if (!confirmed) {
      return;
    }
    window.api
      .deleteTransaction(transaction.id)
      .then(() => {
        if (editingTransaction?.id === transaction.id) {
          setEditingTransaction(null);
        }
        refreshTransactions(filter);
        refreshBalance();
      })
      .catch((err) => setError(String(err)));
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem', maxWidth: '48rem', margin: '0 auto' }}>
      <h1>Money Tracker</h1>

      {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}

      {balance && (
        <div
          style={{
            display: 'flex',
            gap: '2rem',
            padding: '1rem',
            marginBottom: '1.5rem',
            border: '1px solid #ddd',
            borderRadius: '0.5rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.85rem', color: '#666' }}>Balance</div>
            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: balance.balance >= 0 ? 'seagreen' : 'crimson',
              }}
            >
              {currencyFormatter.format(balance.balance)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#666' }}>Total Income</div>
            <div style={{ fontSize: '1.1rem', color: 'seagreen' }}>
              {currencyFormatter.format(balance.totalIncome)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#666' }}>Total Expenses</div>
            <div style={{ fontSize: '1.1rem', color: 'crimson' }}>
              {currencyFormatter.format(balance.totalExpense)}
            </div>
          </div>
        </div>
      )}

      <TransactionForm
        categoryOptions={categoryOptions}
        incomeCategoryOptions={incomeCategoryOptions}
        editingTransaction={editingTransaction}
        onSubmit={handleSubmit}
        onCancelEdit={() => setEditingTransaction(null)}
      />

      <h2 style={{ marginTop: '2rem' }}>Transactions</h2>
      <TransactionFilters
        categoryOptions={categoryOptions}
        incomeCategoryOptions={incomeCategoryOptions}
        filter={filter}
        onChange={setFilter}
      />
      <div style={{ marginTop: '1rem' }}>
        <TransactionList transactions={transactions} onEdit={setEditingTransaction} onDelete={handleDelete} />
      </div>
    </div>
  );
}
