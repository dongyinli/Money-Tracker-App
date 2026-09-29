import { FormEvent, useEffect, useState } from 'react';
import type {
  CategoryOption,
  IncomeCategoryOption,
  Transaction,
  TransactionInput,
  TransactionType,
} from './db';

interface TransactionFormProps {
  categoryOptions: CategoryOption[];
  incomeCategoryOptions: IncomeCategoryOption[];
  editingTransaction: Transaction | null;
  onSubmit: (input: TransactionInput) => void;
  onCancelEdit: () => void;
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function TransactionForm({
  categoryOptions,
  incomeCategoryOptions,
  editingTransaction,
  onSubmit,
  onCancelEdit,
}: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [transactionDate, setTransactionDate] = useState(todayIsoDate());
  const [subcategoryId, setSubcategoryId] = useState('');
  const [incomeCategoryId, setIncomeCategoryId] = useState('');
  const [note, setNote] = useState('');
  const [merchant, setMerchant] = useState('');

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(String(editingTransaction.amountUsd));
      setTransactionDate(editingTransaction.transactionDate);
      setSubcategoryId(
        editingTransaction.subcategoryId ? String(editingTransaction.subcategoryId) : '',
      );
      setIncomeCategoryId(
        editingTransaction.incomeCategoryId ? String(editingTransaction.incomeCategoryId) : '',
      );
      setNote(editingTransaction.note ?? '');
      setMerchant(editingTransaction.merchant ?? '');
    } else {
      setType('expense');
      setAmount('');
      setTransactionDate(todayIsoDate());
      setSubcategoryId(categoryOptions[0] ? String(categoryOptions[0].subcategoryId) : '');
      setIncomeCategoryId(
        incomeCategoryOptions[0] ? String(incomeCategoryOptions[0].incomeCategoryId) : '',
      );
      setNote('');
      setMerchant('');
    }
  }, [editingTransaction, categoryOptions, incomeCategoryOptions]);

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
    if (type === 'expense' && !subcategoryId) {
      window.alert('Please choose a category.');
      return;
    }
    if (type === 'income' && !incomeCategoryId) {
      window.alert('Please choose an income source.');
      return;
    }

    onSubmit({
      type,
      amountUsd,
      transactionDate,
      subcategoryId: type === 'expense' ? Number(subcategoryId) : null,
      incomeCategoryId: type === 'income' ? Number(incomeCategoryId) : null,
      note: note.trim() === '' ? null : note.trim(),
      merchant: merchant.trim() === '' ? null : merchant.trim(),
    });

    if (!editingTransaction) {
      setAmount('');
      setNote('');
      setMerchant('');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem', maxWidth: '28rem' }}>
      <h2>{editingTransaction ? 'Edit Transaction' : 'Add Transaction'}</h2>

      <div role="radiogroup" aria-label="Transaction type" style={{ display: 'flex', gap: '1rem' }}>
        <label>
          <input
            type="radio"
            name="type"
            value="expense"
            checked={type === 'expense'}
            onChange={() => setType('expense')}
          />{' '}
          Expense
        </label>
        <label>
          <input
            type="radio"
            name="type"
            value="income"
            checked={type === 'income'}
            onChange={() => setType('income')}
          />{' '}
          Income
        </label>
      </div>

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
          value={transactionDate}
          onChange={(e) => setTransactionDate(e.target.value)}
          required
          style={{ display: 'block', width: '100%' }}
        />
      </label>

      {type === 'expense' ? (
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
      ) : (
        <label>
          Income Source
          <select
            value={incomeCategoryId}
            onChange={(e) => setIncomeCategoryId(e.target.value)}
            required
            style={{ display: 'block', width: '100%' }}
          >
            <option value="" disabled>
              Select a source...
            </option>
            {incomeCategoryOptions.map((option) => (
              <option key={option.incomeCategoryId} value={option.incomeCategoryId}>
                {option.incomeCategoryName}
              </option>
            ))}
          </select>
        </label>
      )}

      <label>
        {type === 'expense' ? 'Merchant/Payee (optional)' : 'Payer (optional)'}
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
        <button type="submit">{editingTransaction ? 'Save Changes' : 'Add Transaction'}</button>
        {editingTransaction && (
          <button type="button" onClick={onCancelEdit}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
