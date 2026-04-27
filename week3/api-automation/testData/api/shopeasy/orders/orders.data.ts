// ============================================================
// Orders Test Data — ShopEasy API
// File: testData/api/shopeasy/orders/orders.data.ts
// ============================================================

// Order ID format validation
export const orderIdPattern = /^ORD-\d+$/;

// Invalid order IDs for negative tests
export const invalidOrderIds = {
  nonExistent: 'ORD-99999',
  malformed:   'INVALID-ORDER-ID',
  numeric:     '12345',
  empty:       '',
};

// Expected order status values
export const orderStatuses = {
  pending:   'pending',
  paid:      'paid',
  shipped:   'shipped',
  delivered: 'delivered',
  cancelled: 'cancelled',
};

// Expected schema fields for place-order response
export const placeOrderSchemaFields = ['orderId', 'total', 'status', 'message'];

// Expected schema fields for get-order response
export const getOrderSchemaFields = ['orderId', 'userId', 'items', 'total', 'status', 'createdAt'];

// Expected schema fields for cancel-order response
export const cancelOrderSchemaFields = ['orderId', 'status', 'message'];
