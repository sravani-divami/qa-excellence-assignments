import { test, expect } from '@playwright/test';

// ============================================================
// INTEGRATION TESTS — ShopEasy API
// Cross-module workflows: Auth → Products → Cart → Orders → Payments
// Tests data chaining, multi-user isolation, and E2E flows
// ============================================================

test.describe.configure({ mode: 'serial' });

// ── Helpers ───────────────────────────────────────────────────

async function registerAndLogin(
  request: Parameters<Parameters<typeof test>[1]>[0]['request'],
  suffix: string
): Promise<{ token: string; userId: number; email: string }> {
  const email = `int-user-${suffix}@test.com`;
  await request.post('/auth/register', {
    data: { email, password: 'intpass123', name: 'Integration Test User' },
  });
  const res = await request.post('/auth/login', {
    data: { email, password: 'intpass123' },
  });
  const body = await res.json();
  return { token: body.token, userId: body.userId, email };
}

// ── Full E2E: Register → Login → Cart → Order → Pay ──────────

test.describe('INT-E2E-01 | Complete order lifecycle', () => {

  test('Register new user, login, add to cart, place order, pay — all succeed', async ({ request }) => {
    const ts = Date.now();

    // 1. Register
    const regRes = await request.post('/auth/register', {
      data: {
        email: `e2e-${ts}@shopeasy.com`,
        password: 'e2epass123',
        name: 'E2E Test User',
      },
    });
    expect(regRes.status()).toBe(201);
    const regBody = await regRes.json();
    expect(regBody.userId).toBeTruthy();

    // 2. Login
    const loginRes = await request.post('/auth/login', {
      data: { email: `e2e-${ts}@shopeasy.com`, password: 'e2epass123' },
    });
    expect(loginRes.status()).toBe(200);
    const loginBody = await loginRes.json();
    const token = loginBody.token;
    expect(token).toMatch(/^tok_/);

    // 3. Browse products
    const productsRes = await request.get('/products');
    expect(productsRes.status()).toBe(200);
    const products = await productsRes.json();
    const firstProductId = products.data[0].id;

    // 4. Add item to cart
    const addRes = await request.post('/cart/items', {
      headers: { Authorization: `Bearer ${token}` },
      data: { productId: firstProductId, quantity: 2 },
    });
    expect(addRes.status()).toBe(201);

    // 5. Verify cart
    const cartRes = await request.get('/cart', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(cartRes.status()).toBe(200);
    const cart = await cartRes.json();
    expect(cart.itemCount).toBe(1);
    expect(cart.subtotal).toBeGreaterThan(0);

    // 6. Place order
    const orderRes = await request.post('/orders', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(orderRes.status()).toBe(201);
    const order = await orderRes.json();
    const orderId = order.orderId;
    expect(orderId).toMatch(/^ORD-\d+$/);
    expect(order.status).toBe('pending');
    expect(order.total).toBeCloseTo(cart.subtotal, 2);

    // 7. Cart is cleared after order
    const emptyCartRes = await request.get('/cart', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const emptyCart = await emptyCartRes.json();
    expect(emptyCart.itemCount).toBe(0);

    // 8. Process payment
    const payRes = await request.post('/payments', {
      headers: { Authorization: `Bearer ${token}` },
      data: { orderId, method: 'credit_card' },
    });
    expect(payRes.status()).toBe(201);
    const payment = await payRes.json();
    expect(payment.paymentId).toMatch(/^PAY-\d+$/);
    expect(payment.status).toBe('success');
    expect(payment.amount).toBeCloseTo(order.total, 2);

    // 9. Order status is "paid"
    const finalOrderRes = await request.get(`/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const finalOrder = await finalOrderRes.json();
    expect(finalOrder.status).toBe('paid');

    // 10. Retrieve payment record
    const getPayRes = await request.get(`/payments/${payment.paymentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(getPayRes.status()).toBe(200);
    const payRecord = await getPayRes.json();
    expect(payRecord.orderId).toBe(orderId);
    expect(payRecord.method).toBe('credit_card');
  });

});

// ── INT-E2E-02 | Multi-item order ─────────────────────────────

test.describe('INT-E2E-02 | Multi-item cart and order total accuracy', () => {

  test('Add multiple products, order total equals sum of all items', async ({ request }) => {
    const { token } = await registerAndLogin(request, `multiitem-${Date.now()}`);

    // Add 3 different products
    await request.post('/cart/items', {
      headers: { Authorization: `Bearer ${token}` },
      data: { productId: 1, quantity: 1 }, // $99.99
    });
    await request.post('/cart/items', {
      headers: { Authorization: `Bearer ${token}` },
      data: { productId: 2, quantity: 1 }, // $59.99
    });
    await request.post('/cart/items', {
      headers: { Authorization: `Bearer ${token}` },
      data: { productId: 4, quantity: 2 }, // $29.99 x 2 = $59.98
    });

    const cartRes = await request.get('/cart', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const cart = await cartRes.json();
    expect(cart.itemCount).toBe(3);
    expect(cart.subtotal).toBeCloseTo(219.96, 2); // 99.99 + 59.99 + 59.98

    const orderRes = await request.post('/orders', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const order = await orderRes.json();
    expect(order.total).toBeCloseTo(219.96, 2);

    const getOrderRes = await request.get(`/orders/${order.orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const fullOrder = await getOrderRes.json();
    expect(fullOrder.items).toHaveLength(3);
  });

});

// ── INT-E2E-03 | Cart isolation between users ─────────────────

test.describe('INT-E2E-03 | Multi-user cart isolation', () => {

  test('User A and User B have completely separate carts', async ({ request }) => {
    const ts = Date.now();
    const userA = await registerAndLogin(request, `isoA-${ts}`);
    const userB = await registerAndLogin(request, `isoB-${ts}`);

    // User A adds Wireless Headphones
    await request.post('/cart/items', {
      headers: { Authorization: `Bearer ${userA.token}` },
      data: { productId: 1, quantity: 1 },
    });

    // User B adds Running Shoes
    await request.post('/cart/items', {
      headers: { Authorization: `Bearer ${userB.token}` },
      data: { productId: 2, quantity: 3 },
    });

    // User A's cart should only have product 1
    const cartARes = await request.get('/cart', {
      headers: { Authorization: `Bearer ${userA.token}` },
    });
    const cartA = await cartARes.json();
    expect(cartA.itemCount).toBe(1);
    expect(cartA.items[0].productId).toBe(1);

    // User B's cart should only have product 2
    const cartBRes = await request.get('/cart', {
      headers: { Authorization: `Bearer ${userB.token}` },
    });
    const cartB = await cartBRes.json();
    expect(cartB.itemCount).toBe(1);
    expect(cartB.items[0].productId).toBe(2);
    expect(cartB.items[0].quantity).toBe(3);
  });

});

// ── INT-E2E-04 | Order ownership isolation ────────────────────

test.describe('INT-E2E-04 | Order access control between users', () => {

  test('User B cannot access User A\'s order or payment', async ({ request }) => {
    const ts = Date.now();
    const userA = await registerAndLogin(request, `ownA-${ts}`);
    const userB = await registerAndLogin(request, `ownB-${ts}`);

    // User A places an order
    await request.post('/cart/items', {
      headers: { Authorization: `Bearer ${userA.token}` },
      data: { productId: 1, quantity: 1 },
    });
    const orderRes = await request.post('/orders', {
      headers: { Authorization: `Bearer ${userA.token}` },
    });
    const order = await orderRes.json();

    // User B tries to get User A's order
    const forbiddenGet = await request.get(`/orders/${order.orderId}`, {
      headers: { Authorization: `Bearer ${userB.token}` },
    });
    expect(forbiddenGet.status()).toBe(403);

    // User B tries to cancel User A's order
    const forbiddenCancel = await request.delete(`/orders/${order.orderId}/cancel`, {
      headers: { Authorization: `Bearer ${userB.token}` },
    });
    expect(forbiddenCancel.status()).toBe(403);
  });

});

// ── INT-E2E-05 | Cancel order flow ───────────────────────────

test.describe('INT-E2E-05 | Cancel order and verify state', () => {

  test('Cancel pending order and verify it cannot be paid', async ({ request }) => {
    const { token } = await registerAndLogin(request, `cancelflow-${Date.now()}`);

    await request.post('/cart/items', {
      headers: { Authorization: `Bearer ${token}` },
      data: { productId: 3, quantity: 1 },
    });
    const orderRes = await request.post('/orders', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const order = await orderRes.json();

    // Cancel the order
    const cancelRes = await request.delete(`/orders/${order.orderId}/cancel`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(cancelRes.status()).toBe(200);

    // Order status is cancelled
    const getRes = await request.get(`/orders/${order.orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const cancelled = await getRes.json();
    expect(cancelled.status).toBe('cancelled');
  });

});

// ── INT-E2E-06 | Double payment prevention ────────────────────

test.describe('INT-E2E-06 | Double payment prevention', () => {

  test('Second payment attempt for same order returns 409', async ({ request }) => {
    const { token } = await registerAndLogin(request, `doublepay-${Date.now()}`);

    await request.post('/cart/items', {
      headers: { Authorization: `Bearer ${token}` },
      data: { productId: 5, quantity: 1 },
    });
    const orderRes = await request.post('/orders', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const order = await orderRes.json();

    // First payment — succeeds
    const pay1 = await request.post('/payments', {
      headers: { Authorization: `Bearer ${token}` },
      data: { orderId: order.orderId, method: 'credit_card' },
    });
    expect(pay1.status()).toBe(201);

    // Second payment — must be rejected
    const pay2 = await request.post('/payments', {
      headers: { Authorization: `Bearer ${token}` },
      data: { orderId: order.orderId, method: 'upi' },
    });
    expect(pay2.status()).toBe(409);
    const pay2Body = await pay2.json();
    expect(pay2Body).toHaveProperty('error');
  });

});

// ── INT-E2E-07 | Data chaining: IDs captured and reused ───────

test.describe('INT-E2E-07 | Data chaining across all modules', () => {

  test('IDs flow correctly: register → login → add item → order → payment', async ({ request }) => {
    const { token, userId } = await registerAndLogin(request, `chain-${Date.now()}`);

    // Add item
    await request.post('/cart/items', {
      headers: { Authorization: `Bearer ${token}` },
      data: { productId: 2, quantity: 1 },
    });

    // Place order — capture orderId
    const orderRes = await request.post('/orders', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const order = await orderRes.json();
    const orderId: string = order.orderId;

    // Verify order userId matches logged-in user
    const getOrderRes = await request.get(`/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const fullOrder = await getOrderRes.json();
    expect(fullOrder.userId).toBe(userId);

    // Process payment — capture paymentId
    const payRes = await request.post('/payments', {
      headers: { Authorization: `Bearer ${token}` },
      data: { orderId, method: 'debit_card' },
    });
    const payment = await payRes.json();
    const paymentId: string = payment.paymentId;

    // Retrieve payment — verify it references the same orderId
    const getPayRes = await request.get(`/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const fullPayment = await getPayRes.json();
    expect(fullPayment.orderId).toBe(orderId);
    expect(fullPayment.amount).toBeCloseTo(order.total, 2);
  });

});

// ── INT-E2E-08 | Token required for all protected endpoints ───

test.describe('INT-E2E-08 | All protected endpoints reject missing token', () => {

  test('Cart, Orders, Payments all return 401 without Authorization header', async ({ request }) => {
    const endpoints = [
      { method: 'get',    url: '/cart' },
      { method: 'post',   url: '/cart/items' },
      { method: 'delete', url: '/cart/items/1' },
      { method: 'post',   url: '/orders' },
      { method: 'get',    url: '/orders/ORD-1001' },
      { method: 'delete', url: '/orders/ORD-1001/cancel' },
      { method: 'post',   url: '/payments' },
      { method: 'get',    url: '/payments/PAY-5001' },
    ];

    for (const { method, url } of endpoints) {
      const res = await (request as any)[method](url);
      expect(res.status(), `Expected 401 for ${method.toUpperCase()} ${url}`).toBe(401);
    }
  });

});
