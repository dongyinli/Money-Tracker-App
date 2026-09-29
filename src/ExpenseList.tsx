import type { Expense } from './db';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export function ExpenseList({ expenses, onEdit, onDelete }: ExpenseListProps) {
  if (expenses.length === 0) {
    return <p>No expenses recorded yet.</p>;
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ textAlign: 'left' }}>Date</th>
          <th style={{ textAlign: 'right' }}>Amount</th>
          <th style={{ textAlign: 'left' }}>Category</th>
          <th style={{ textAlign: 'left' }}>Merchant</th>
          <th style={{ textAlign: 'left' }}>Note</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {expenses.map((expense) => (
          <tr key={expense.id} style={{ borderTop: '1px solid #ddd' }}>
            <td>{expense.expenseDate}</td>
            <td style={{ textAlign: 'right' }}>{currencyFormatter.format(expense.amountUsd)}</td>
            <td>
              {expense.primaryCategoryName} &gt; {expense.subcategoryName}
            </td>
            <td>{expense.merchant ?? ''}</td>
            <td>{expense.note ?? ''}</td>
            <td style={{ whiteSpace: 'nowrap' }}>
              <button type="button" onClick={() => onEdit(expense)}>
                Edit
              </button>{' '}
              <button type="button" onClick={() => onDelete(expense)}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
