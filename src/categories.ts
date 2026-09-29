export interface CategorySeed {
  name: string;
  subcategories: string[];
}

export const CATEGORY_SEED: CategorySeed[] = [
  {
    name: 'Housing',
    subcategories: ['Rent/Mortgage', 'Utilities', 'Home Maintenance & Repairs', 'Home Insurance'],
  },
  {
    name: 'Transportation',
    subcategories: [
      'Fuel/Gas',
      'Public Transit',
      'Parking & Tolls',
      'Vehicle Maintenance',
      'Ride-share/Taxi',
      'Auto Insurance',
    ],
  },
  {
    name: 'Food & Dining',
    subcategories: ['Groceries', 'Restaurants & Takeout', 'Coffee & Snacks'],
  },
  {
    name: 'Health & Wellness',
    subcategories: ['Medical & Doctor', 'Pharmacy/Medication', 'Health Insurance', 'Fitness/Gym'],
  },
  {
    name: 'Shopping & Personal',
    subcategories: ['Clothing', 'Personal Care', 'Electronics & Gadgets', 'Subscriptions'],
  },
  {
    name: 'Entertainment & Leisure',
    subcategories: ['Movies/Events', 'Hobbies', 'Travel/Vacation', 'Books/Games'],
  },
  {
    name: 'Education',
    subcategories: ['Tuition & Fees', 'Books & Supplies', 'Courses'],
  },
  {
    name: 'Financial',
    subcategories: ['Debt Payments', 'Savings/Investments', 'Bank & ATM Fees', 'Taxes'],
  },
  {
    name: 'Family, Pets & Giving',
    subcategories: ['Childcare', 'Pet Care', 'Gifts & Donations'],
  },
  {
    name: 'Miscellaneous',
    subcategories: ['Other/Uncategorized'],
  },
];
