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

function formatDateLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatPeriodLabel(filter: TransactionFilter): string {
  if (filter.startDate && filter.endDate) {
    return `${formatDateLabel(filter.startDate)} – ${formatDateLabel(filter.endDate)}`;
  }
  if (filter.startDate) {
    return `Since ${formatDateLabel(filter.startDate)}`;
  }
  if (filter.endDate) {
    return `Through ${formatDateLabel(filter.endDate)}`;
  }
  return 'All time';
}

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

  const refreshBalance = useCallback((currentFilter: TransactionFilter) => {
    window.api
      .getBalanceSummary({ startDate: currentFilter.startDate, endDate: currentFilter.endDate })
      .then(setBalance)
      .catch((err) => setError(String(err)));
  }, []);

  useEffect(() => {
    window.api.listCategoryOptions().then(setCategoryOptions).catch((err) => setError(String(err)));
    window.api
      .listIncomeCategoryOptions()
      .then(setIncomeCategoryOptions)
      .catch((err) => setError(String(err)));
  }, []);

  useEffect(() => {
    refreshTransactions(filter);
    refreshBalance(filter);
  }, [filter, refreshTransactions, refreshBalance]);

  const handleSubmit = (input: TransactionInput) => {
    const request = editingTransaction
      ? window.api.updateTransaction(editingTransaction.id, input)
      : window.api.createTransaction(input);

    request
      .then(() => {
        setEditingTransaction(null);
        refreshTransactions(filter);
        refreshBalance(filter);
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
        refreshBalance(filter);
      })
      .catch((err) => setError(String(err)));
  };

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Money Tracker</h1>
        <p className="app__subtitle">Track your income and expenses, all in one place.</p>
      </header>

      {error && <div className="error-banner">Error: {error}</div>}

      {balance && (
        <section className="balance-section">
          <p className="balance-section__period">{formatPeriodLabel(filter)}</p>
          <div className="balance-panel">
            <div className="balance-card balance-card--total">
              <div className="balance-card__label">Balance</div>
              <div
                className={`balance-card__value ${balance.balance >= 0 ? 'is-positive' : 'is-negative'}`}
              >
                {currencyFormatter.format(balance.balance)}
              </div>
            </div>
            <div className="balance-card balance-card--income">
              <div className="balance-card__label">Total Income</div>
              <div className="balance-card__value">{currencyFormatter.format(balance.totalIncome)}</div>
            </div>
            <div className="balance-card balance-card--expense">
              <div className="balance-card__label">Total Expenses</div>
              <div className="balance-card__value">{currencyFormatter.format(balance.totalExpense)}</div>
            </div>
          </div>
        </section>
      )}

      <div className="card">
        <TransactionForm
          categoryOptions={categoryOptions}
          incomeCategoryOptions={incomeCategoryOptions}
          editingTransaction={editingTransaction}
          onSubmit={handleSubmit}
          onCancelEdit={() => setEditingTransaction(null)}
        />
      </div>

      <h2 className="section-title">Transactions</h2>
      <div className="card" style={{ marginBottom: '1rem' }}>
        <TransactionFilters
          categoryOptions={categoryOptions}
          incomeCategoryOptions={incomeCategoryOptions}
          filter={filter}
          onChange={setFilter}
        />
      </div>
      <TransactionList transactions={transactions} onEdit={setEditingTransaction} onDelete={handleDelete} />
    </div>
  );
}
