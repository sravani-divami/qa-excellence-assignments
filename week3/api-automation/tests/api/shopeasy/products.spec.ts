import { test, expect } from '@playwright/test';
import {
  seededProducts,
  totalProductCount,
  validProductIds,
  invalidProductIds,
  categoryFilters,
  nonExistentCategory,
  paginationCases,
  productSchemaFields,
  productListSchemaFields,
} from '../../../testData/api/shopeasy/products/products.data';

// ============================================================
// PRODUCTS MODULE — ShopEasy API
// Endpoints: GET /products, GET /products/:id
// No authentication required
// ============================================================

test.describe('GET /products', () => {

  test.describe('Positive Tests', () => {

    test('TC-PROD-01 | Returns 200 status', async ({ request }) => {
      const res = await request.get('/products');
      expect(res.status()).toBe(200);
    });

    test('TC-PROD-02 | Returns all 5 seeded products by default', async ({ request }) => {
      const res = await request.get('/products');
      const body = await res.json();
      expect(body.total).toBe(totalProductCount);
      expect(body.data).toHaveLength(totalProductCount);
    });

    test('TC-PROD-03 | Response schema has total, page, limit, data', async ({ request }) => {
      const res = await request.get('/products');
      const body = await res.json();
      for (const field of productListSchemaFields) {
        expect(body).toHaveProperty(field);
      }
    });

    test('TC-PROD-04 | Default page is 1', async ({ request }) => {
      const res = await request.get('/products');
      const body = await res.json();
      expect(body.page).toBe(1);
    });

    test('TC-PROD-05 | Default limit is 10', async ({ request }) => {
      const res = await request.get('/products');
      const body = await res.json();
      expect(body.limit).toBe(10);
    });

    test('TC-PROD-06 | Each product has all required schema fields', async ({ request }) => {
      const res = await request.get('/products');
      const body = await res.json();
      for (const product of body.data) {
        for (const field of productSchemaFields) {
          expect(product).toHaveProperty(field);
        }
      }
    });

    test('TC-PROD-07 | Product id is a number', async ({ request }) => {
      const res = await request.get('/products');
      const body = await res.json();
      for (const product of body.data) {
        expect(typeof product.id).toBe('number');
      }
    });

    test('TC-PROD-08 | Product price is a number', async ({ request }) => {
      const res = await request.get('/products');
      const body = await res.json();
      for (const product of body.data) {
        expect(typeof product.price).toBe('number');
        expect(product.price).toBeGreaterThan(0);
      }
    });

    test('TC-PROD-09 | Product stock is a non-negative number', async ({ request }) => {
      const res = await request.get('/products');
      const body = await res.json();
      for (const product of body.data) {
        expect(typeof product.stock).toBe('number');
        expect(product.stock).toBeGreaterThanOrEqual(0);
      }
    });

    test('TC-PROD-10 | data is an array', async ({ request }) => {
      const res = await request.get('/products');
      const body = await res.json();
      expect(Array.isArray(body.data)).toBe(true);
    });

    test('TC-PROD-11 | No authentication required for product listing', async ({ request }) => {
      const res = await request.get('/products');
      expect(res.status()).toBe(200);
    });

    test('TC-PROD-12 | Content-Type is application/json', async ({ request }) => {
      const res = await request.get('/products');
      expect(res.headers()['content-type']).toContain('application/json');
    });

  });

  test.describe('Category Filter Tests', () => {

    for (const { category, expectedCount, productNames } of categoryFilters) {
      test(`TC-PROD-CAT | Filter by category=${category} returns ${expectedCount} product(s)`, async ({ request }) => {
        const res = await request.get('/products', { params: { category } });
        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body.total).toBe(expectedCount);
        expect(body.data).toHaveLength(expectedCount);
        for (const name of productNames) {
          expect(body.data.map((p: { name: string }) => p.name)).toContain(name);
        }
      });
    }

    test('TC-PROD-13 | Non-existent category returns 0 products', async ({ request }) => {
      const res = await request.get('/products', { params: { category: nonExistentCategory } });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.total).toBe(0);
      expect(body.data).toHaveLength(0);
    });

    test('TC-PROD-14 | Category filter is case-sensitive (uppercase returns 0)', async ({ request }) => {
      const res = await request.get('/products', { params: { category: 'ELECTRONICS' } });
      const body = await res.json();
      expect(body.total).toBe(0);
    });

    test('TC-PROD-15 | Filtered total matches data array length', async ({ request }) => {
      const res = await request.get('/products', { params: { category: 'electronics' } });
      const body = await res.json();
      expect(body.total).toBe(body.data.length);
    });

  });

  test.describe('Pagination Tests', () => {

    for (const { page, limit, expectedCount, desc } of paginationCases) {
      test(`TC-PROD-PAGE | ${desc} (page=${page}, limit=${limit})`, async ({ request }) => {
        const res = await request.get('/products', { params: { page, limit } });
        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body.data).toHaveLength(expectedCount);
        expect(body.page).toBe(page);
        expect(body.limit).toBe(limit);
      });
    }

    test('TC-PROD-16 | page and limit are reflected in response', async ({ request }) => {
      const res = await request.get('/products', { params: { page: 2, limit: 3 } });
      const body = await res.json();
      expect(body.page).toBe(2);
      expect(body.limit).toBe(3);
    });

    test('TC-PROD-17 | Total is not affected by pagination (reflects full count)', async ({ request }) => {
      const res = await request.get('/products', { params: { page: 1, limit: 2 } });
      const body = await res.json();
      expect(body.total).toBe(totalProductCount);
    });

  });

});

// ── GET /products/:id ─────────────────────────────────────────

test.describe('GET /products/:id', () => {

  test.describe('Positive Tests', () => {

    for (const id of validProductIds) {
      test(`TC-PROD-ID-0${id} | GET /products/${id} returns 200`, async ({ request }) => {
        const res = await request.get(`/products/${id}`);
        expect(res.status()).toBe(200);
      });
    }

    test('TC-PROD-18 | Returns correct product by ID', async ({ request }) => {
      const expected = seededProducts[0]; // Wireless Headphones
      const res = await request.get(`/products/${expected.id}`);
      const body = await res.json();
      expect(body.id).toBe(expected.id);
      expect(body.name).toBe(expected.name);
      expect(body.price).toBe(expected.price);
      expect(body.category).toBe(expected.category);
      expect(body.stock).toBe(expected.stock);
    });

    test('TC-PROD-19 | Product schema has id, name, price, category, stock', async ({ request }) => {
      const res = await request.get('/products/1');
      const body = await res.json();
      for (const field of productSchemaFields) {
        expect(body).toHaveProperty(field);
      }
    });

    test('TC-PROD-20 | No authentication required for product detail', async ({ request }) => {
      const res = await request.get('/products/1');
      expect(res.status()).toBe(200);
    });

    test('TC-PROD-21 | Content-Type is application/json', async ({ request }) => {
      const res = await request.get('/products/1');
      expect(res.headers()['content-type']).toContain('application/json');
    });

  });

  test.describe('Negative Tests', () => {

    test('TC-PROD-22 | Non-existent product ID returns 404', async ({ request }) => {
      const res = await request.get(`/products/${invalidProductIds.nonExistent}`);
      expect(res.status()).toBe(404);
      const body = await res.json();
      expect(body).toHaveProperty('error');
    });

    test('TC-PROD-23 | Product ID zero returns 404', async ({ request }) => {
      const res = await request.get(`/products/${invalidProductIds.zero}`);
      expect(res.status()).toBe(404);
    });

    test('TC-PROD-24 | Negative product ID returns 404', async ({ request }) => {
      const res = await request.get(`/products/${invalidProductIds.negative}`);
      expect(res.status()).toBe(404);
    });

    test('TC-PROD-25 | String product ID returns 404', async ({ request }) => {
      const res = await request.get(`/products/${invalidProductIds.stringId}`);
      expect(res.status()).toBe(404);
    });

    test('TC-PROD-26 | Error response contains error field', async ({ request }) => {
      const res = await request.get(`/products/999`);
      const body = await res.json();
      expect(body.error).toBe('Product not found');
    });

  });

});
