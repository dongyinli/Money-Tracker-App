import { useCallback, useEffect, useState } from 'react';
import type { CategoryOption, Expense, ExpenseFilter, ExpenseInput } from './db';
import { ExpenseFilters } from './ExpenseFilters';
import { ExpenseForm } from './ExpenseForm';
import { ExpenseList } from './ExpenseList';

export function App() {
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filter, setFilter] = useState<ExpenseFilter>({});
  const [error, setError] = useState<string | null>(null);

  const refreshExpenses = useCallback(
    (currentFilter: ExpenseFilter) => {
      window.api.listExpenses(currentFilter).then(setExpenses).catch((err) => setError(String(err)));
    },
    [],
  );

  useEffect(() => {
    window.api.listCategoryOptions().then(setCategoryOptions).catch((err) => setError(String(err)));
  }, []);

  useEffect(() => {
    refreshExpenses(filter);
  }, [filter, refreshExpenses]);

  const handleSubmit = (input: ExpenseInput) => {
    const request = editingExpense
      ? window.api.updateExpense(editingExpense.id, input)
      : window.api.createExpense(input);

    request
      .then(() => {
        setEditingExpense(null);
        refreshExpenses(filter);
      })
      .catch((err) => setError(String(err)));
  };

  const handleDelete = (expense: Expense) => {
    const confirmed = window.confirm(
      `Delete this $${expense.amountUsd.toFixed(2)} expense from ${expense.expenseDate}?`,
    );
    if (!confirmed) {
      return;
    }
    window.api
      .deleteExpense(expense.id)
      .then(() => {
        if (editingExpense?.id === expense.id) {
          setEditingExpense(null);
        }
        refreshExpenses(filter);
      })
      .catch((err) => setError(String(err)));
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem', maxWidth: '48rem', margin: '0 auto' }}>
      <h1>Expense Tracker</h1>

      {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}

      <ExpenseForm
        categoryOptions={categoryOptions}
        editingExpense={editingExpense}
        onSubmit={handleSubmit}
        onCancelEdit={() => setEditingExpense(null)}
      />

      <h2 style={{ marginTop: '2rem' }}>Expenses</h2>
      <ExpenseFilters categoryOptions={categoryOptions} filter={filter} onChange={setFilter} />
      <div style={{ marginTop: '1rem' }}>
        <ExpenseList expenses={expenses} onEdit={setEditingExpense} onDelete={handleDelete} />
      </div>
    </div>
  );
}
