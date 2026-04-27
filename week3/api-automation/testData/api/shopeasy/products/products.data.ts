// ============================================================
// Products Test Data — ShopEasy API
// File: testData/api/shopeasy/products/products.data.ts
// ============================================================

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
}

// Seeded products (always present on fresh server start)
export const seededProducts: Product[] = [
  { id: 1, name: 'Wireless Headphones', price: 99.99, category: 'electronics', stock: 50 },
  { id: 2, name: 'Running Shoes',        price: 59.99, category: 'footwear',     stock: 30 },
  { id: 3, name: 'Coffee Maker',         price: 149.99, category: 'appliances',  stock: 15 },
  { id: 4, name: 'Yoga Mat',             price: 29.99, category: 'sports',       stock: 100 },
  { id: 5, name: 'Laptop Stand',         price: 45.00, category: 'electronics',  stock: 75 },
];

export const totalProductCount = 5;

// Valid product IDs
export const validProductIds = [1, 2, 3, 4, 5];

// Invalid product IDs
export const invalidProductIds = {
  nonExistent: 999,
  zero: 0,
  negative: -1,
  stringId: 'abc',
};

// Category filter data
export const categoryFilters = [
  { category: 'electronics', expectedCount: 2, productNames: ['Wireless Headphones', 'Laptop Stand'] },
  { category: 'footwear',    expectedCount: 1, productNames: ['Running Shoes'] },
  { category: 'appliances',  expectedCount: 1, productNames: ['Coffee Maker'] },
  { category: 'sports',      expectedCount: 1, productNames: ['Yoga Mat'] },
];

export const nonExistentCategory = 'nonexistent-category';

// Pagination test cases
export const paginationCases = [
  { page: 1, limit: 2, expectedCount: 2, desc: 'First page with limit 2' },
  { page: 2, limit: 2, expectedCount: 2, desc: 'Second page with limit 2' },
  { page: 3, limit: 2, expectedCount: 1, desc: 'Third page with limit 2 (last item)' },
  { page: 1, limit: 5, expectedCount: 5, desc: 'All products in one page' },
  { page: 1, limit: 10, expectedCount: 5, desc: 'Limit larger than total returns all' },
  { page: 2, limit: 10, expectedCount: 0, desc: 'Page 2 with limit 10 returns empty' },
];

// Expected schema fields for a product
export const productSchemaFields = ['id', 'name', 'price', 'category', 'stock'];

// Expected schema fields for list response
export const productListSchemaFields = ['total', 'page', 'limit', 'data'];
