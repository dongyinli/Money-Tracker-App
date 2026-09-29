import { FormEvent, useEffect, useState } from 'react';
import type { CategoryOption, Expense, ExpenseInput } from './db';

interface ExpenseFormProps {
  categoryOptions: CategoryOption[];
  editingExpense: Expense | null;
  onSubmit: (input: ExpenseInput) => void;
  onCancelEdit: () => void;
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ExpenseForm({
  categoryOptions,
  editingExpense,
  onSubmit,
  onCancelEdit,
}: ExpenseFormProps) {
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(todayIsoDate());
  const [subcategoryId, setSubcategoryId] = useState('');
  const [note, setNote] = useState('');
  const [merchant, setMerchant] = useState('');

  useEffect(() => {
    if (editingExpense) {
      setAmount(String(editingExpense.amountUsd));
      setExpenseDate(editingExpense.expenseDate);
      setSubcategoryId(String(editingExpense.subcategoryId));
      setNote(editingExpense.note ?? '');
      setMerchant(editingExpense.merchant ?? '');
    } else {
      setAmount('');
      setExpenseDate(todayIsoDate());
      setSubcategoryId(categoryOptions[0] ? String(categoryOptions[0].subcategoryId) : '');
      setNote('');
      setMerchant('');
    }
  }, [editingExpense, categoryOptions]);

  const groupedByPrimary = categoryOptions.reduce<Map<string, CategoryOption[]>>(
    (groups, option) => {
      const existing = groups.get(option.primaryName) ?? [];
      existing.push(option);
      groups.set(option.primaryName, existing);
      return groups;
    },
    new Map(),
  );

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const amountUsd = Number(amount);
    if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
      window.alert('Please enter an amount greater than $0.');
      return;
    }
    if (!subcategoryId) {
      window.alert('Please choose a category.');
      return;
    }

    onSubmit({
      amountUsd,
      expenseDate,
      subcategoryId: Number(subcategoryId),
      note: note.trim() === '' ? null : note.trim(),
      merchant: merchant.trim() === '' ? null : merchant.trim(),
    });

    if (!editingExpense) {
      setAmount('');
      setNote('');
      setMerchant('');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem', maxWidth: '28rem' }}>
      <h2>{editingExpense ? 'Edit Expense' : 'Add Expense'}</h2>

      <label>
        Amount (USD)
        <input
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          style={{ display: 'block', width: '100%' }}
        />
      </label>

      <label>
        Date
        <input
          type="date"
          value={expenseDate}
          onChange={(e) => setExpenseDate(e.target.value)}
          required
          style={{ display: 'block', width: '100%' }}
        />
      </label>

      <label>
        Category
        <select
          value={subcategoryId}
          onChange={(e) => setSubcategoryId(e.target.value)}
          required
          style={{ display: 'block', width: '100%' }}
        >
          <option value="" disabled>
            Select a category...
          </option>
          {[...groupedByPrimary.entries()].map(([primaryName, options]) => (
            <optgroup key={primaryName} label={primaryName}>
              {options.map((option) => (
                <option key={option.subcategoryId} value={option.subcategoryId}>
                  {option.subcategoryName}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>

      <label>
        Merchant/Payee (optional)
        <input
          type="text"
          value={merchant}
          onChange={(e) => setMerchant(e.target.value)}
          style={{ display: 'block', width: '100%' }}
        />
      </label>

      <label>
        Note (optional)
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{ display: 'block', width: '100%' }}
        />
      </label>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button type="submit">{editingExpense ? 'Save Changes' : 'Add Expense'}</button>
        {editingExpense && (
          <button type="button" onClick={onCancelEdit}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
