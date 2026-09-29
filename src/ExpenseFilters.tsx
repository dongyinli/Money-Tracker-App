import type { CategoryOption, ExpenseFilter } from './db';

interface ExpenseFiltersProps {
  categoryOptions: CategoryOption[];
  filter: ExpenseFilter;
  onChange: (filter: ExpenseFilter) => void;
}

export function ExpenseFilters({ categoryOptions, filter, onChange }: ExpenseFiltersProps) {
  const primaryCategories = [...new Map(categoryOptions.map((o) => [o.primaryId, o.primaryName]))];

  const subcategoriesForSelectedPrimary = filter.primaryCategoryId
    ? categoryOptions.filter((o) => o.primaryId === filter.primaryCategoryId)
    : categoryOptions;

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
    filter.startDate || filter.endDate || filter.primaryCategoryId || filter.subcategoryId;

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
            onChange({ ...filter, subcategoryId: e.target.value ? Number(e.target.value) : undefined })
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

      {hasActiveFilter && (
        <button type="button" onClick={() => onChange({})}>
          Clear Filters
        </button>
      )}
    </div>
  );
}
