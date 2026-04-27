import { test, expect } from '@playwright/test';
import {
  validCartItems,
  invalidCartItems,
  cartSchemaFields,
  addToCartSchemaFields,
  removeFromCartSchemaFields,
} from '../../../testData/api/shopeasy/cart/cart.data';

// ============================================================
// CART MODULE — ShopEasy API
// Endpoints: POST /cart/items, GET /cart, DELETE /cart/items/:itemId
// All endpoints require Bearer token authentication
// ============================================================

// Run cart tests serially — server holds cart state in memory
test.describe.configure({ mode: 'serial' });

// ── Helpers ───────────────────────────────────────────────────

async function registerAndLogin(
  request: Parameters<Parameters<typeof test>[1]>[0]['request'],
  suffix: string
): Promise<string> {
  const email = `cart-user-${suffix}@test.com`;
  await request.post('/auth/register', {
    data: { email, password: 'cartpass123', name: 'Cart Test User' },
  });
  const res = await request.post('/auth/login', {
    data: { email, password: 'cartpass123' },
  });
  const body = await res.json();
  return body.token;
}

// ── Unauthenticated access ────────────────────────────────────

test.describe('Cart — Authentication Guard', () => {

  test('TC-CART-01 | GET /cart without token returns 401', async ({ request }) => {
    const res = await request.get('/cart');
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body).toHaveProperty('error');
  });

  test('TC-CART-02 | GET /cart with invalid token returns 401', async ({ request }) => {
    const res = await request.get('/cart', {
      headers: { Authorization: 'Bearer tok_invalidtoken' },
    });
    expect(res.status()).toBe(401);
  });

  test('TC-CART-03 | POST /cart/items without token returns 401', async ({ request }) => {
    const res = await request.post('/cart/items', {
      data: validCartItems.headphones,
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body).toHaveProperty('error');
  });

  test('TC-CART-04 | POST /cart/items with invalid token returns 401', async ({ request }) => {
    const res = await request.post('/cart/items', {
      headers: { Authorization: 'Bearer tok_invalidtoken' },
      data: validCartItems.headphones,
    });
    expect(res.status()).toBe(401);
  });

  test('TC-CART-05 | DELETE /cart/items/:itemId without token returns 401', async ({ request }) => {
    const res = await request.delete('/cart/items/1');
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body).toHaveProperty('error');
  });

  test('TC-CART-06 | DELETE /cart/items/:itemId with invalid token returns 401', async ({ request }) => {
    const res = await request.delete('/cart/items/1', {
      headers: { Authorization: 'Bearer tok_invalidtoken' },
    });
    expect(res.status()).toBe(401);
  });

});

// ── GET /cart ─────────────────────────────────────────────────

test.describe('GET /cart', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    token = await registerAndLogin(request, `getcart-${Date.now()}`);
  });

  test('TC-CART-07 | Empty cart returns 200', async ({ request }) => {
    const res = await request.get('/cart', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
  });

  test('TC-CART-08 | Empty cart has items=[], subtotal=0, itemCount=0', async ({ request }) => {
    const res = await request.get('/cart', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json();
    expect(body.items).toEqual([]);
    expect(body.subtotal).toBe(0);
    expect(body.itemCount).toBe(0);
  });

  test('TC-CART-09 | Cart response schema has items, subtotal, itemCount', async ({ request }) => {
    const res = await request.get('/cart', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json();
    for (const field of cartSchemaFields) {
      expect(body).toHaveProperty(field);
    }
  });

  test('TC-CART-10 | Cart items is an array', async ({ request }) => {
    const res = await request.get('/cart', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json();
    expect(Array.isArray(body.items)).toBe(true);
  });

  test('TC-CART-11 | Content-Type is application/json', async ({ request }) => {
    const res = await request.get('/cart', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.headers()['content-type']).toContain('application/json');
  });

});

// ── POST /cart/items ──────────────────────────────────────────

test.describe('POST /cart/items', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    token = await registerAndLogin(request, `addcart-${Date.now()}`);
  });

  test.describe('Positive Tests', () => {

    test('TC-CART-12 | Add valid item returns 201', async ({ request }) => {
      const res = await request.post('/cart/items', {
        headers: { Authorization: `Bearer ${token}` },
        data: { productId: validCartItems.headphones.productId, quantity: validCartItems.headphones.quantity },
      });
      expect(res.status()).toBe(201);
    });

    test('TC-CART-13 | Add item response has message and cartTotal', async ({ request }) => {
      const res = await request.post('/cart/items', {
        headers: { Authorization: `Bearer ${token}` },
        data: { productId: validCartItems.shoes.productId, quantity: 1 },
      });
      const body = await res.json();
      for (const field of addToCartSchemaFields) {
        expect(body).toHaveProperty(field);
      }
    });

    test('TC-CART-14 | Add item message is "Item added to cart"', async ({ request }) => {
      const res = await request.post('/cart/items', {
        headers: { Authorization: `Bearer ${token}` },
        data: { productId: validCartItems.yogaMat.productId, quantity: 1 },
      });
      const body = await res.json();
      expect(body.message).toBe('Item added to cart');
    });

    test('TC-CART-15 | cartTotal is a positive number', async ({ request }) => {
      const res = await request.post('/cart/items', {
        headers: { Authorization: `Bearer ${token}` },
        data: { productId: validCartItems.laptopStand.productId, quantity: 1 },
      });
      const body = await res.json();
      expect(typeof body.cartTotal).toBe('number');
      expect(body.cartTotal).toBeGreaterThan(0);
    });

    test('TC-CART-16 | Adding same product again increases quantity (no duplicate)', async ({ request }) => {
      const uniqueToken = await registerAndLogin(request, `dupcart-${Date.now()}`);

      await request.post('/cart/items', {
        headers: { Authorization: `Bearer ${uniqueToken}` },
        data: { productId: 1, quantity: 1 },
      });
      await request.post('/cart/items', {
        headers: { Authorization: `Bearer ${uniqueToken}` },
        data: { productId: 1, quantity: 1 },
      });

      const cartRes = await request.get('/cart', {
        headers: { Authorization: `Bearer ${uniqueToken}` },
      });
      const cart = await cartRes.json();
      expect(cart.itemCount).toBe(1);  // still 1 line item, not 2
      expect(cart.items[0].quantity).toBe(2);
    });

    test('TC-CART-17 | GET /cart reflects added items correctly', async ({ request }) => {
      const uniqueToken = await registerAndLogin(request, `cartcheck-${Date.now()}`);

      await request.post('/cart/items', {
        headers: { Authorization: `Bearer ${uniqueToken}` },
        data: { productId: 1, quantity: 2 },
      });

      const cartRes = await request.get('/cart', {
        headers: { Authorization: `Bearer ${uniqueToken}` },
      });
      const cart = await cartRes.json();
      expect(cart.itemCount).toBe(1);
      expect(cart.items[0].productId).toBe(1);
      expect(cart.items[0].quantity).toBe(2);
      expect(cart.subtotal).toBeCloseTo(199.98, 2);
    });

    test('TC-CART-18 | Cart total math: Headphones(1) + Shoes(1) = 159.98', async ({ request }) => {
      const uniqueToken = await registerAndLogin(request, `mathcart-${Date.now()}`);

      await request.post('/cart/items', {
        headers: { Authorization: `Bearer ${uniqueToken}` },
        data: { productId: 1, quantity: 1 },  // $99.99
      });
      const res = await request.post('/cart/items', {
        headers: { Authorization: `Bearer ${uniqueToken}` },
        data: { productId: 2, quantity: 1 },  // $59.99
      });
      const body = await res.json();
      expect(body.cartTotal).toBeCloseTo(159.98, 2);
    });

  });

  test.describe('Negative Tests', () => {

    test('TC-CART-19 | Missing productId returns 400', async ({ request }) => {
      const res = await request.post('/cart/items', {
        headers: { Authorization: `Bearer ${token}` },
        data: invalidCartItems.missingProductId,
      });
      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body).toHaveProperty('error');
    });

    test('TC-CART-20 | Missing quantity returns 400', async ({ request }) => {
      const res = await request.post('/cart/items', {
        headers: { Authorization: `Bearer ${token}` },
        data: invalidCartItems.missingQuantity,
      });
      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body).toHaveProperty('error');
    });

    test('TC-CART-21 | Empty body returns 400', async ({ request }) => {
      const res = await request.post('/cart/items', {
        headers: { Authorization: `Bearer ${token}` },
        data: invalidCartItems.emptyBody,
      });
      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body).toHaveProperty('error');
    });

    test('TC-CART-22 | Non-existent productId returns 404', async ({ request }) => {
      const res = await request.post('/cart/items', {
        headers: { Authorization: `Bearer ${token}` },
        data: invalidCartItems.nonExistentProduct,
      });
      expect(res.status()).toBe(404);
      const body = await res.json();
      expect(body).toHaveProperty('error');
    });

  });

});

// ── DELETE /cart/items/:itemId ────────────────────────────────

test.describe('DELETE /cart/items/:itemId', () => {

  test('TC-CART-23 | Remove valid item from cart returns 200', async ({ request }) => {
    const token = await registerAndLogin(request, `remove1-${Date.now()}`);
    await request.post('/cart/items', {
      headers: { Authorization: `Bearer ${token}` },
      data: { productId: 1, quantity: 1 },
    });

    const res = await request.delete('/cart/items/1', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.message).toBe('Item removed from cart');
  });

  test('TC-CART-24 | Remove item response has message and cartTotal', async ({ request }) => {
    const token = await registerAndLogin(request, `remove2-${Date.now()}`);
    await request.post('/cart/items', {
      headers: { Authorization: `Bearer ${token}` },
      data: { productId: 2, quantity: 1 },
    });

    const res = await request.delete('/cart/items/2', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json();
    for (const field of removeFromCartSchemaFields) {
      expect(body).toHaveProperty(field);
    }
  });

  test('TC-CART-25 | After removal, cart itemCount decreases', async ({ request }) => {
    const token = await registerAndLogin(request, `remove3-${Date.now()}`);
    await request.post('/cart/items', {
      headers: { Authorization: `Bearer ${token}` },
      data: { productId: 1, quantity: 1 },
    });
    await request.post('/cart/items', {
      headers: { Authorization: `Bearer ${token}` },
      data: { productId: 2, quantity: 1 },
    });

    await request.delete('/cart/items/1', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const cartRes = await request.get('/cart', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const cart = await cartRes.json();
    expect(cart.itemCount).toBe(1);
  });

  test('TC-CART-26 | Cart cartTotal is 0 after all items removed', async ({ request }) => {
    const token = await registerAndLogin(request, `remove4-${Date.now()}`);
    await request.post('/cart/items', {
      headers: { Authorization: `Bearer ${token}` },
      data: { productId: 1, quantity: 1 },
    });

    const res = await request.delete('/cart/items/1', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json();
    expect(body.cartTotal).toBe(0);
  });

  test('TC-CART-27 | Remove item not in cart returns 404', async ({ request }) => {
    const token = await registerAndLogin(request, `remove5-${Date.now()}`);
    await request.post('/cart/items', {
      headers: { Authorization: `Bearer ${token}` },
      data: { productId: 1, quantity: 1 },
    });

    const res = await request.delete('/cart/items/999', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body).toHaveProperty('error');
  });

  test('TC-CART-28 | Remove item from empty cart returns 404', async ({ request }) => {
    const token = await registerAndLogin(request, `remove6-${Date.now()}`);
    const res = await request.delete('/cart/items/1', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body).toHaveProperty('error');
  });

});
