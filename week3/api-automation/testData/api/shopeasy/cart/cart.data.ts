// ============================================================
// Cart Test Data — ShopEasy API
// File: testData/api/shopeasy/cart/cart.data.ts
// ============================================================

// Valid cart item payloads
export const validCartItems = {
  headphones: { productId: 1, quantity: 1, expectedPrice: 99.99, name: 'Wireless Headphones' },
  shoes:       { productId: 2, quantity: 2, expectedPrice: 59.99, name: 'Running Shoes' },
  coffeeMaker: { productId: 3, quantity: 1, expectedPrice: 149.99, name: 'Coffee Maker' },
  yogaMat:     { productId: 4, quantity: 3, expectedPrice: 29.99, name: 'Yoga Mat' },
  laptopStand: { productId: 5, quantity: 1, expectedPrice: 45.00, name: 'Laptop Stand' },
};

// Invalid cart item payloads
export const invalidCartItems = {
  missingProductId: { quantity: 1 },
  missingQuantity:  { productId: 1 },
  emptyBody:        {},
  nonExistentProduct: { productId: 999, quantity: 1 },
};

// Cart total calculation cases
export const cartTotalCases = [
  {
    items: [{ productId: 1, quantity: 1 }],
    expectedTotal: 99.99,
    desc: 'Single item',
  },
  {
    items: [{ productId: 1, quantity: 2 }],
    expectedTotal: 199.98,
    desc: 'Single item, quantity 2',
  },
  {
    items: [
      { productId: 1, quantity: 1 },
      { productId: 2, quantity: 1 },
    ],
    expectedTotal: 159.98,
    desc: 'Two different items',
  },
];

// Expected schema fields for cart response
export const cartSchemaFields = ['items', 'subtotal', 'itemCount'];

// Expected schema fields for add-to-cart response
export const addToCartSchemaFields = ['message', 'cartTotal'];

// Expected schema fields for remove-from-cart response
export const removeFromCartSchemaFields = ['message', 'cartTotal'];
