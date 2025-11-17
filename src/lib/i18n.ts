type Dictionary = Record<string, string>;

let currentLocale = 'en';

const dictionaries: Record<string, Dictionary> = {
  en: {
    ordersProducts: 'Orders & Products',
    manageOrdersProducts: 'Manage orders and products',
    tabOrders: 'Orders',
    tabProducts: 'Products',
    searchPlaceholder: 'Search by name, SKU, or ID',
    filterStatus: 'Status',
    sortBy: 'Sort by',
    statusAll: 'All',
    statusPending: 'Pending',
    statusPaid: 'Paid',
    statusFulfilled: 'Fulfilled',
    statusCancelled: 'Cancelled',
    sortDateDesc: 'Date (newest)',
    sortDateAsc: 'Date (oldest)',
    sortAmountDesc: 'Amount (high → low)',
    sortAmountAsc: 'Amount (low → high)',
    noResults: 'No results found for current filters.',
    view: 'View',
    edit: 'Edit',
    delete: 'Delete',
    details: 'Details',
    close: 'Close',
    productStatusActive: 'Active',
    productStatusInactive: 'Inactive',
  },
};

export const setLocale = (locale: string) => {
  currentLocale = dictionaries[locale] ? locale : 'en';
};

export const t = (key: string) => {
  const dict = dictionaries[currentLocale] || dictionaries.en;
  return dict[key] || key;
};