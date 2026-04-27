import { test, expect } from '@playwright/test';
import {
  orderIdPattern,
  invalidOrderIds,
  orderStatuses,
  placeOrderSchemaFields,
  getOrderSchemaFields,
  cancelOrderSchemaFields,
} from '../../../testData/api/shopeasy/orders/orders.data';

// ============================================================
// ORDERS MODULE — ShopEasy API
// Endpoints: POST /orders, GET /orders/:orderId, DELETE /orders/:orderId/cancel
// All endpoints require Bearer token authentication
// ============================================================

test.describe.configure({ mode: 'serial' });

// ── Helpers ───────────────────────────────────────────────────

async function registerAndLogin(
  request: Parameters<Parameters<typeof test>[1]>[0]['request'],
  suffix: string
): Promise<string> {
  const email = `order-user-${suffix}@test.com`;
  await request.post('/auth/register', {
    data: { email, password: 'orderpass123', name: 'Order Test User' },
  });
  const res = await request.post('/auth/login', {
    data: { email, password: 'orderpass123' },
  });
  const body = await res.json();
  return body.token;
}

async function addItemAndPlaceOrder(
  request: Parameters<Parameters<typeof test>[1]>[0]['request'],
  token: string,
  productId = 1
): Promise<string> {
  await request.post('/cart/items', {
    headers: { Authorization: `Bearer ${token}` },
    data: { productId, quantity: 1 },
  });
  const res = await request.post('/orders', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json();
  return body.orderId;
}

// ── Authentication Guard ──────────────────────────────────────

test.describe('Orders — Authentication Guard', () => {

  test('TC-ORD-01 | POST /orders without token returns 401', async ({ request }) => {
    const res = await request.post('/orders');
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body).toHaveProperty('error');
  });

  test('TC-ORD-02 | POST /orders with invalid token returns 401', async ({ request }) => {
    const res = await request.post('/orders', {
      headers: { Authorization: 'Bearer tok_invalidtoken' },
    });
    expect(res.status()).toBe(401);
  });

  test('TC-ORD-03 | GET /orders/:orderId without token returns 401', async ({ request }) => {
    const res = await request.get('/orders/ORD-1001');
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body).toHaveProperty('error');
  });

  test('TC-ORD-04 | DELETE /orders/:orderId/cancel without token returns 401', async ({ request }) => {
    const res = await request.delete('/orders/ORD-1001/cancel');
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body).toHaveProperty('error');
  });

});

// ── POST /orders ──────────────────────────────────────────────

test.describe('POST /orders', () => {

  test.describe('Positive Tests', () => {

    test('TC-ORD-05 | Place order from non-empty cart returns 201', async ({ request }) => {
      const token = await registerAndLogin(request, `placeord-${Date.now()}`);
      await request.post('/cart/items', {
        headers: { Authorization: `Bearer ${token}` },
        data: { productId: 1, quantity: 1 },
      });
      const res = await request.post('/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status()).toBe(201);
    });

    test('TC-ORD-06 | Place order response has orderId, total, status, message', async ({ request }) => {
      const token = await registerAndLogin(request, `ordschema-${Date.now()}`);
      await request.post('/cart/items', {
        headers: { Authorization: `Bearer ${token}` },
        data: { productId: 1, quantity: 1 },
      });
      const res = await request.post('/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json();
      for (const field of placeOrderSchemaFields) {
        expect(body).toHaveProperty(field);
      }
    });

    test('TC-ORD-07 | orderId matches ORD-XXXX format', async ({ request }) => {
      const token = await registerAndLogin(request, `ordformat-${Date.now()}`);
      await request.post('/cart/items', {
        headers: { Authorization: `Bearer ${token}` },
        data: { productId: 2, quantity: 1 },
      });
      const res = await request.post('/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json();
      expect(body.orderId).toMatch(orderIdPattern);
    });

    test('TC-ORD-08 | Initial order status is "pending"', async ({ request }) => {
      const token = await registerAndLogin(request, `ordstatus-${Date.now()}`);
      await request.post('/cart/items', {
        headers: { Authorization: `Bearer ${token}` },
        data: { productId: 3, quantity: 1 },
      });
      const res = await request.post('/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json();
      expect(body.status).toBe(orderStatuses.pending);
    });

    test('TC-ORD-09 | Order total is a positive number', async ({ request }) => {
      const token = await registerAndLogin(request, `ordtotal-${Date.now()}`);
      await request.post('/cart/items', {
        headers: { Authorization: `Bearer ${token}` },
        data: { productId: 1, quantity: 1 },
      });
      const res = await request.post('/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json();
      expect(typeof body.total).toBe('number');
      expect(body.total).toBeGreaterThan(0);
    });

    test('TC-ORD-10 | Order total matches cart subtotal before placing', async ({ request }) => {
      const token = await registerAndLogin(request, `ordmatch-${Date.now()}`);
      await request.post('/cart/items', {
        headers: { Authorization: `Bearer ${token}` },
        data: { productId: 1, quantity: 2 },  // $99.99 x 2 = $199.98
      });

      const cartRes = await request.get('/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const cart = await cartRes.json();

      const orderRes = await request.post('/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const order = await orderRes.json();
      expect(order.total).toBeCloseTo(cart.subtotal, 2);
    });

    test('TC-ORD-11 | Cart is empty after order is placed', async ({ request }) => {
      const token = await registerAndLogin(request, `cartclear-${Date.now()}`);
      await request.post('/cart/items', {
        headers: { Authorization: `Bearer ${token}` },
        data: { productId: 1, quantity: 1 },
      });
      await request.post('/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const cartRes = await request.get('/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const cart = await cartRes.json();
      expect(cart.itemCount).toBe(0);
      expect(cart.items).toHaveLength(0);
    });

    test('TC-ORD-12 | success message is "Order placed successfully"', async ({ request }) => {
      const token = await registerAndLogin(request, `ordmsg-${Date.now()}`);
      await request.post('/cart/items', {
        headers: { Authorization: `Bearer ${token}` },
        data: { productId: 4, quantity: 1 },
      });
      const res = await request.post('/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json();
      expect(body.message).toBe('Order placed successfully');
    });

  });

  test.describe('Negative Tests', () => {

    test('TC-ORD-13 | Place order with empty cart returns 400', async ({ request }) => {
      const token = await registerAndLogin(request, `emptycart-${Date.now()}`);
      const res = await request.post('/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body).toHaveProperty('error');
    });

    test('TC-ORD-14 | Placing order twice with empty cart both times returns 400', async ({ request }) => {
      const token = await registerAndLogin(request, `twiceempty-${Date.now()}`);
      const res1 = await request.post('/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const res2 = await request.post('/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res1.status()).toBe(400);
      expect(res2.status()).toBe(400);
    });

  });

});

// ── GET /orders/:orderId ──────────────────────────────────────

test.describe('GET /orders/:orderId', () => {

  test('TC-ORD-15 | Get own order returns 200', async ({ request }) => {
    const token = await registerAndLogin(request, `getord-${Date.now()}`);
    const orderId = await addItemAndPlaceOrder(request, token);

    const res = await request.get(`/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
  });

  test('TC-ORD-16 | Get order response schema: orderId, userId, items, total, status, createdAt', async ({ request }) => {
    const token = await registerAndLogin(request, `ordschema2-${Date.now()}`);
    const orderId = await addItemAndPlaceOrder(request, token);

    const res = await request.get(`/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json();
    for (const field of getOrderSchemaFields) {
      expect(body).toHaveProperty(field);
    }
  });

  test('TC-ORD-17 | Order orderId matches the one from place-order response', async ({ request }) => {
    const token = await registerAndLogin(request, `ordmatch2-${Date.now()}`);
    const orderId = await addItemAndPlaceOrder(request, token);

    const res = await request.get(`/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json();
    expect(body.orderId).toBe(orderId);
  });

  test('TC-ORD-18 | Order items array is non-empty', async ({ request }) => {
    const token = await registerAndLogin(request, `orditems-${Date.now()}`);
    const orderId = await addItemAndPlaceOrder(request, token);

    const res = await request.get(`/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json();
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.items.length).toBeGreaterThan(0);
  });

  test('TC-ORD-19 | Order createdAt is a valid ISO date string', async ({ request }) => {
    const token = await registerAndLogin(request, `orddate-${Date.now()}`);
    const orderId = await addItemAndPlaceOrder(request, token);

    const res = await request.get(`/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json();
    expect(() => new Date(body.createdAt)).not.toThrow();
    expect(new Date(body.createdAt).toString()).not.toBe('Invalid Date');
  });

  test('TC-ORD-20 | Non-existent orderId returns 404', async ({ request }) => {
    const token = await registerAndLogin(request, `ord404-${Date.now()}`);
    const res = await request.get(`/orders/${invalidOrderIds.nonExistent}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body).toHaveProperty('error');
  });

  test('TC-ORD-21 | Fetching another user\'s order returns 403', async ({ request }) => {
    const ts = Date.now();
    const tokenA = await registerAndLogin(request, `orduser-A-${ts}`);
    const tokenB = await registerAndLogin(request, `orduser-B-${ts}`);

    // User A places an order
    const orderId = await addItemAndPlaceOrder(request, tokenA);

    // User B tries to fetch User A's order
    const res = await request.get(`/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    expect(res.status()).toBe(403);
    const body = await res.json();
    expect(body).toHaveProperty('error');
  });

});

// ── DELETE /orders/:orderId/cancel ────────────────────────────

test.describe('DELETE /orders/:orderId/cancel', () => {

  test('TC-ORD-22 | Cancel pending order returns 200', async ({ request }) => {
    const token = await registerAndLogin(request, `cancelord-${Date.now()}`);
    const orderId = await addItemAndPlaceOrder(request, token);

    const res = await request.delete(`/orders/${orderId}/cancel`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
  });

  test('TC-ORD-23 | Cancel response schema: orderId, status, message', async ({ request }) => {
    const token = await registerAndLogin(request, `cancelschema-${Date.now()}`);
    const orderId = await addItemAndPlaceOrder(request, token);

    const res = await request.delete(`/orders/${orderId}/cancel`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json();
    for (const field of cancelOrderSchemaFields) {
      expect(body).toHaveProperty(field);
    }
  });

  test('TC-ORD-24 | Cancelled order has status "cancelled"', async ({ request }) => {
    const token = await registerAndLogin(request, `cancelstatus-${Date.now()}`);
    const orderId = await addItemAndPlaceOrder(request, token);

    const res = await request.delete(`/orders/${orderId}/cancel`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json();
    expect(body.status).toBe(orderStatuses.cancelled);
  });

  test('TC-ORD-25 | Cancelled order status persists on subsequent GET', async ({ request }) => {
    const token = await registerAndLogin(request, `cancelpersist-${Date.now()}`);
    const orderId = await addItemAndPlaceOrder(request, token);

    await request.delete(`/orders/${orderId}/cancel`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const getRes = await request.get(`/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await getRes.json();
    expect(body.status).toBe(orderStatuses.cancelled);
  });

  test('TC-ORD-26 | Cancel non-existent order returns 404', async ({ request }) => {
    const token = await registerAndLogin(request, `cancel404-${Date.now()}`);
    const res = await request.delete(`/orders/${invalidOrderIds.nonExistent}/cancel`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body).toHaveProperty('error');
  });

  test('TC-ORD-27 | Cancelling another user\'s order returns 403', async ({ request }) => {
    const ts = Date.now();
    const tokenA = await registerAndLogin(request, `cancelA-${ts}`);
    const tokenB = await registerAndLogin(request, `cancelB-${ts}`);

    const orderId = await addItemAndPlaceOrder(request, tokenA);

    const res = await request.delete(`/orders/${orderId}/cancel`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    expect(res.status()).toBe(403);
    const body = await res.json();
    expect(body).toHaveProperty('error');
  });

  test('TC-ORD-28 | Cancel message is "Order cancelled successfully"', async ({ request }) => {
    const token = await registerAndLogin(request, `cancelmsg-${Date.now()}`);
    const orderId = await addItemAndPlaceOrder(request, token);

    const res = await request.delete(`/orders/${orderId}/cancel`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json();
    expect(body.message).toBe('Order cancelled successfully');
  });

});
