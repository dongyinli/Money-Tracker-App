import type { CategoryOption, IncomeCategoryOption, TransactionFilter } from './db';

interface TransactionFiltersProps {
  categoryOptions: CategoryOption[];
  incomeCategoryOptions: IncomeCategoryOption[];
  filter: TransactionFilter;
  onChange: (filter: TransactionFilter) => void;
}

export function TransactionFilters({
  categoryOptions,
  incomeCategoryOptions,
  filter,
  onChange,
}: TransactionFiltersProps) {
  const primaryCategories = [...new Map(categoryOptions.map((o) => [o.primaryId, o.primaryName]))];

  const subcategoriesForSelectedPrimary = filter.primaryCategoryId
    ? categoryOptions.filter((o) => o.primaryId === filter.primaryCategoryId)
    : categoryOptions;

  const handleTypeChange = (value: string) => {
    onChange({
      ...filter,
      type: value ? (value as 'expense' | 'income') : undefined,
      // A category chosen under one type doesn't apply to the other.
      primaryCategoryId: undefined,
      subcategoryId: undefined,
      incomeCategoryId: undefined,
    });
  };

  const handlePrimaryChange = (value: string) => {
    onChange({
      ...filter,
      primaryCategoryId: value ? Number(value) : undefined,
      // Changing the primary category invalidates a previously chosen subcategory
      // that might belong to a different primary category.
      subcategoryId: undefined,
    });
  };

  const hasActiveFilter =
    filter.startDate ||
    filter.endDate ||
    filter.type ||
    filter.primaryCategoryId ||
    filter.subcategoryId ||
    filter.incomeCategoryId;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'end' }}>
      <label>
        From
        <input
          type="date"
          value={filter.startDate ?? ''}
          onChange={(e) => onChange({ ...filter, startDate: e.target.value || undefined })}
          style={{ display: 'block' }}
        />
      </label>

      <label>
        To
        <input
          type="date"
          value={filter.endDate ?? ''}
          onChange={(e) => onChange({ ...filter, endDate: e.target.value || undefined })}
          style={{ display: 'block' }}
        />
      </label>

      <label>
        Type
        <select
          value={filter.type ?? ''}
          onChange={(e) => handleTypeChange(e.target.value)}
          style={{ display: 'block' }}
        >
          <option value="">All</option>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </label>

      {filter.type === 'income' && (
        <label>
          Income Source
          <select
            value={filter.incomeCategoryId ?? ''}
            onChange={(e) =>
              onChange({
                ...filter,
                incomeCategoryId: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            style={{ display: 'block' }}
          >
            <option value="">All Sources</option>
            {incomeCategoryOptions.map((o) => (
              <option key={o.incomeCategoryId} value={o.incomeCategoryId}>
                {o.incomeCategoryName}
              </option>
            ))}
          </select>
        </label>
      )}

      {filter.type === 'expense' && (
        <>
          <label>
            Category
            <select
              value={filter.primaryCategoryId ?? ''}
              onChange={(e) => handlePrimaryChange(e.target.value)}
              style={{ display: 'block' }}
            >
              <option value="">All Categories</option>
              {primaryCategories.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Subcategory
            <select
              value={filter.subcategoryId ?? ''}
              onChange={(e) =>
                onChange({
                  ...filter,
                  subcategoryId: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              style={{ display: 'block' }}
            >
              <option value="">All Subcategories</option>
              {subcategoriesForSelectedPrimary.map((o) => (
                <option key={o.subcategoryId} value={o.subcategoryId}>
                  {o.subcategoryName}
                </option>
              ))}
            </select>
          </label>
        </>
      )}

      {hasActiveFilter && (
        <button type="button" onClick={() => onChange({})}>
          Clear Filters
        </button>
      )}
    </div>
  );
}
