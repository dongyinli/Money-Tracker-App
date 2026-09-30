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
    return (
      <div className="table-card">
        <p className="empty-state">No transactions recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="table-card">
      <table className="transactions-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th className="is-numeric">Amount</th>
            <th>Category</th>
            <th>Merchant/Payer</th>
            <th>Note</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => {
            const isIncome = transaction.type === 'income';
            return (
              <tr key={transaction.id}>
                <td>{transaction.transactionDate}</td>
                <td>
                  <span className={`badge ${isIncome ? 'badge--income' : 'badge--expense'}`}>
                    {isIncome ? 'Income' : 'Expense'}
                  </span>
                </td>
                <td className={`amount ${isIncome ? 'amount--income' : 'amount--expense'}`}>
                  {isIncome ? '+' : '-'}
                  {currencyFormatter.format(transaction.amountUsd)}
                </td>
                <td>{categoryLabel(transaction)}</td>
                <td>{transaction.merchant ?? ''}</td>
                <td>{transaction.note ?? ''}</td>
                <td>
                  <div className="row-actions">
                    <button type="button" onClick={() => onEdit(transaction)} className="btn btn--ghost btn--small">
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(transaction)}
                      className="btn btn--danger btn--small"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
