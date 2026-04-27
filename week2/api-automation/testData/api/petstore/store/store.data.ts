// ============================================================
// Store Test Data — Petstore API
// File: testData/api/petstore/store/store.data.ts
// ============================================================

export interface Order {
  id?: number;
  petId: number;
  quantity: number;
  shipDate?: string;
  status: string;
  complete?: boolean;
}

// Valid order data
export const validOrder: Order = {
  id: Math.floor(Math.random() * 900000) + 100000,
  petId: Math.floor(Math.random() * 900000) + 100000,
  quantity: 1,
  shipDate: new Date().toISOString(),
  status: 'placed',
  complete: false
};

export const validOrder2: Order = {
  id: Math.floor(Math.random() * 900000) + 100000,
  petId: Math.floor(Math.random() * 900000) + 100000,
  quantity: 2,
  shipDate: new Date(Date.now() + 86400000).toISOString(), // tomorrow
  status: 'approved',
  complete: false
};

export const validOrder3: Order = {
  id: Math.floor(Math.random() * 900000) + 100000,
  petId: Math.floor(Math.random() * 900000) + 100000,
  quantity: 3,
  shipDate: new Date().toISOString(),
  status: 'delivered',
  complete: true
};

// Invalid order data (missing required fields)
export const invalidOrder = {
  // missing petId
  quantity: 1,
  status: 'placed'
};

// Order statuses
export const validOrderStatuses = ['placed', 'approved', 'delivered'];

// Invalid order IDs
export const invalidOrderIds = {
  nonExistent: 999999999,
  zero: 0,
  negative: -1,
  invalid: 'abc'
};

// For concurrent testing
export const generateOrderData = (index: number): Order => ({
  id: Math.floor(Math.random() * 900000) + 100000 + index,
  petId: Math.floor(Math.random() * 900000) + 100000,
  quantity: index % 5 + 1,
  shipDate: new Date().toISOString(),
  status: validOrderStatuses[index % validOrderStatuses.length],
  complete: index % 2 === 0
});
