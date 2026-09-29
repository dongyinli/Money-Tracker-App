import type { Transaction } from './db';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

function categoryLabel(transaction: Transaction): string {
  if (transaction.type === 'income') {
    return transaction.incomeCategoryName ?? '';
  }
  return `${transaction.primaryCategoryName ?? ''} > ${transaction.subcategoryName ?? ''}`;
}

export function TransactionList({ transactions, onEdit, onDelete }: TransactionListProps) {
  if (transactions.length === 0) {
    return <p>No transactions recorded yet.</p>;
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ textAlign: 'left' }}>Date</th>
          <th style={{ textAlign: 'left' }}>Type</th>
          <th style={{ textAlign: 'right' }}>Amount</th>
          <th style={{ textAlign: 'left' }}>Category</th>
          <th style={{ textAlign: 'left' }}>Merchant/Payer</th>
          <th style={{ textAlign: 'left' }}>Note</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {transactions.map((transaction) => {
          const isIncome = transaction.type === 'income';
          return (
            <tr key={transaction.id} style={{ borderTop: '1px solid #ddd' }}>
              <td>{transaction.transactionDate}</td>
              <td style={{ color: isIncome ? 'seagreen' : 'crimson' }}>
                {isIncome ? 'Income' : 'Expense'}
              </td>
              <td
                style={{
                  textAlign: 'right',
                  color: isIncome ? 'seagreen' : 'crimson',
                  fontWeight: 600,
                }}
              >
                {isIncome ? '+' : '-'}
                {currencyFormatter.format(transaction.amountUsd)}
              </td>
              <td>{categoryLabel(transaction)}</td>
              <td>{transaction.merchant ?? ''}</td>
              <td>{transaction.note ?? ''}</td>
              <td style={{ whiteSpace: 'nowrap' }}>
                <button type="button" onClick={() => onEdit(transaction)}>
                  Edit
                </button>{' '}
                <button type="button" onClick={() => onDelete(transaction)}>
                  Delete
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
