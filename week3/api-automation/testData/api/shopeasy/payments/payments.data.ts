// ============================================================
// Payments Test Data — ShopEasy API
// File: testData/api/shopeasy/payments/payments.data.ts
// ============================================================

// Payment ID format validation
export const paymentIdPattern = /^PAY-\d+$/;

// Valid payment methods per the OpenAPI spec
export const validPaymentMethods = ['credit_card', 'debit_card', 'upi', 'net_banking'];

// Invalid / edge-case payment payloads
export const invalidPaymentPayloads = {
  missingOrderId:    { method: 'credit_card' },
  missingMethod:     { orderId: 'ORD-1001' },
  emptyBody:         {},
  nonExistentOrder:  { orderId: 'ORD-99999', method: 'credit_card' },
};

// Expected schema fields for process-payment response
export const processPaymentSchemaFields = ['paymentId', 'status', 'amount', 'message'];

// Expected schema fields for get-payment response
export const getPaymentSchemaFields = ['paymentId', 'orderId', 'method', 'amount', 'status', 'processedAt'];
