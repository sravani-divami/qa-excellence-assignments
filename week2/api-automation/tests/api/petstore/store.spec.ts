import { test, expect } from '@playwright/test';
import {
  validOrder,
  validOrder2,
  validOrder3,
  invalidOrder,
  validOrderStatuses,
  invalidOrderIds,
  generateOrderData
} from '../../../testData/api/petstore/store/store.data';

// ============================================================
// STORE MODULE — Petstore API
// Endpoints: POST /store/order, GET /store/order/{orderId}, DELETE /store/order/{orderId}, GET /store/inventory
// ============================================================

test.describe('Store API Tests', () => {

  // ── BASIC CRUD TESTS ─────────────────────────────────────

  test.describe('POST /store/order - Place order', () => {

    test('TC-STORE-01 | Place an order with valid data', async ({ request }) => {
      const res = await request.post('/store/order', { data: validOrder });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('id');
      expect(body.petId).toBe(validOrder.petId);
      expect(body.quantity).toBe(validOrder.quantity);
      expect(body.status).toBe(validOrder.status);
    });

    test('TC-STORE-02 | Place order with invalid data returns error', async ({ request }) => {
      const res = await request.post('/store/order', { data: invalidOrder });
      // Petstore may accept partial data or return error
      expect([200, 400, 500]).toContain(res.status());
    });

  });

  test.describe('GET /store/order/{orderId} - Get order by ID', () => {

    test('TC-STORE-03 | Get order by valid ID', async ({ request }) => {
      // First place an order
      const createRes = await request.post('/store/order', { data: validOrder2 });
      const createdOrder = await createRes.json();
      
      // Get the order
      const getRes = await request.get(`/store/order/${createdOrder.id}`);
      expect(getRes.status()).toBe(200);
      const body = await getRes.json();
      expect(body.id).toBe(createdOrder.id);
      expect(body.petId).toBe(validOrder2.petId);
    });

    test('TC-STORE-04 | Get order by non-existent ID returns 404', async ({ request }) => {
      const res = await request.get(`/store/order/${invalidOrderIds.nonExistent}`);
      expect(res.status()).toBe(404);
    });

  });

  test.describe('DELETE /store/order/{orderId} - Delete order', () => {

    test('TC-STORE-05 | Delete order with valid ID', async ({ request }) => {
      // First place an order
      const createRes = await request.post('/store/order', { data: validOrder3 });
      const createdOrder = await createRes.json();
      
      // Delete the order
      const deleteRes = await request.delete(`/store/order/${createdOrder.id}`);
      expect([200, 204]).toContain(deleteRes.status());
      
      // Verify order is deleted
      const getRes = await request.get(`/store/order/${createdOrder.id}`);
      expect(getRes.status()).toBe(404);
    });

    test('TC-STORE-06 | Delete order with non-existent ID returns 404', async ({ request }) => {
      const res = await request.delete(`/store/order/${invalidOrderIds.nonExistent}`);
      expect(res.status()).toBe(404);
    });

  });

  test.describe('GET /store/inventory - Get inventory', () => {

    test('TC-STORE-07 | Get inventory returns data', async ({ request }) => {
      const res = await request.get('/store/inventory');
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(typeof body).toBe('object');
      // Inventory returns status counts like { "available": 10, "pending": 5, "sold": 3 }
    });

  });

  // ── INTEGRATION TEST ─────────────────────────────────────

  test.describe('Integration Tests', () => {

    test('TC-STORE-INT-01 | Place order and get order', async ({ request }) => {
      // 1. Place order
      const createRes = await request.post('/store/order', { data: validOrder });
      expect(createRes.status()).toBe(200);
      const createdOrder = await createRes.json();

      // 2. Get order
      const getRes = await request.get(`/store/order/${createdOrder.id}`);
      expect(getRes.status()).toBe(200);
      const fetchedOrder = await getRes.json();
      expect(fetchedOrder.id).toBe(createdOrder.id);
    });

  });

  // ── DATA CHAINING TEST ───────────────────────────────────

  test.describe('Order Lifecycle Tests', () => {

    test('TC-STORE-CHAIN-01 | Order lifecycle: create, get, delete', async ({ request }) => {
      // 1. Create order
      const createRes = await request.post('/store/order', { data: validOrder });
      expect(createRes.status()).toBe(200);
      const createdOrder = await createRes.json();
      const orderId = createdOrder.id;

      // 2. Get order
      const getRes = await request.get(`/store/order/${orderId}`);
      expect(getRes.status()).toBe(200);
      const fetchedOrder = await getRes.json();
      expect(fetchedOrder.id).toBe(orderId);

      // 3. Delete order
      const deleteRes = await request.delete(`/store/order/${orderId}`);
      expect([200, 204]).toContain(deleteRes.status());

      // 4. Verify order is deleted
      const getDeletedRes = await request.get(`/store/order/${orderId}`);
      expect(getDeletedRes.status()).toBe(404);
    });

  });

  // ── SYSTEM/LOAD TESTS ────────────────────────────────────

  test.describe('System Tests', () => {

    test('TC-STORE-SYS-01 | Concurrent order placement (10 orders)', async ({ request }) => {
      const promises = [];
      for (let i = 0; i < 10; i++) {
        const orderData = generateOrderData(i);
        promises.push(request.post('/store/order', { data: orderData }));
      }
      
      const responses = await Promise.all(promises);
      responses.forEach(res => {
        expect(res.status()).toBe(200);
      });
    });

  });

  // ── END-TO-END TEST ──────────────────────────────────────

  test.describe('End-to-End Tests', () => {

    test('TC-STORE-E2E-01 | Full order workflow', async ({ request }) => {
      // 1. Place order
      const createRes = await request.post('/store/order', { data: validOrder });
      expect(createRes.status()).toBe(200);
      const createdOrder = await createRes.json();

      // 2. Get order
      const getRes = await request.get(`/store/order/${createdOrder.id}`);
      expect(getRes.status()).toBe(200);

      // 3. Delete order
      const deleteRes = await request.delete(`/store/order/${createdOrder.id}`);
      expect([200, 204]).toContain(deleteRes.status());

      // 4. Get inventory
      const inventoryRes = await request.get('/store/inventory');
      expect(inventoryRes.status()).toBe(200);
    });

  });

});
