import { test, expect } from '@playwright/test';

// ============================================================
// SYSTEM TESTS — ShopEasy API
// Health checks, performance, concurrency, and reliability
// ============================================================

// ── Health Check ──────────────────────────────────────────────

test.describe('GET /health — Health Check', () => {

  test('TC-SYS-01 | /health returns 200', async ({ request }) => {
    const res = await request.get('/health');
    expect(res.status()).toBe(200);
  });

  test('TC-SYS-02 | /health response has status "ok"', async ({ request }) => {
    const res = await request.get('/health');
    const body = await res.json();
    expect(body.status).toBe('ok');
  });

  test('TC-SYS-03 | /health response has service name', async ({ request }) => {
    const res = await request.get('/health');
    const body = await res.json();
    expect(body.service).toBe('ShopEasy API');
  });

  test('TC-SYS-04 | /health response has version', async ({ request }) => {
    const res = await request.get('/health');
    const body = await res.json();
    expect(body.version).toBeTruthy();
  });

  test('TC-SYS-05 | /health schema has status, service, version', async ({ request }) => {
    const res = await request.get('/health');
    const body = await res.json();
    expect(body).toHaveProperty('status');
    expect(body).toHaveProperty('service');
    expect(body).toHaveProperty('version');
  });

});

// ── Response Time / Performance ───────────────────────────────

test.describe('Performance — Response Time Validation', () => {

  test('TC-SYS-06 | GET /health responds under 500ms', async ({ request }) => {
    const start = Date.now();
    await request.get('/health');
    expect(Date.now() - start).toBeLessThan(500);
  });

  test('TC-SYS-07 | GET /products responds under 1000ms', async ({ request }) => {
    const start = Date.now();
    await request.get('/products');
    expect(Date.now() - start).toBeLessThan(1000);
  });

  test('TC-SYS-08 | GET /products/:id responds under 1000ms', async ({ request }) => {
    const start = Date.now();
    await request.get('/products/1');
    expect(Date.now() - start).toBeLessThan(1000);
  });

  test('TC-SYS-09 | POST /auth/login responds under 1000ms', async ({ request }) => {
    const start = Date.now();
    await request.post('/auth/login', {
      data: { email: 'admin@shopeasy.com', password: 'password123' },
    });
    expect(Date.now() - start).toBeLessThan(1000);
  });

});

// ── Concurrent Requests ───────────────────────────────────────

test.describe('Concurrency — Parallel Request Handling', () => {

  test('TC-SYS-10 | 10 concurrent GET /products all return 200', async ({ request }) => {
    const promises = Array.from({ length: 10 }, () => request.get('/products'));
    const responses = await Promise.all(promises);
    for (const res of responses) {
      expect(res.status()).toBe(200);
    }
  });

  test('TC-SYS-11 | 10 concurrent GET /health all return 200', async ({ request }) => {
    const promises = Array.from({ length: 10 }, () => request.get('/health'));
    const responses = await Promise.all(promises);
    for (const res of responses) {
      expect(res.status()).toBe(200);
    }
  });

  test('TC-SYS-12 | 10 concurrent GET /products/:id with same ID return consistent data', async ({ request }) => {
    const promises = Array.from({ length: 10 }, () => request.get('/products/1'));
    const responses = await Promise.all(promises);
    const bodies = await Promise.all(responses.map(r => r.json()));

    for (const body of bodies) {
      expect(body.id).toBe(1);
      expect(body.name).toBe('Wireless Headphones');
      expect(body.price).toBe(99.99);
    }
  });

  test('TC-SYS-13 | 5 concurrent logins return unique tokens each', async ({ request }) => {
    const promises = Array.from({ length: 5 }, () =>
      request.post('/auth/login', {
        data: { email: 'admin@shopeasy.com', password: 'password123' },
      })
    );
    const responses = await Promise.all(promises);
    const tokens = await Promise.all(responses.map(async r => (await r.json()).token));

    const uniqueTokens = new Set(tokens);
    expect(uniqueTokens.size).toBe(5);
  });

});

// ── Public Endpoints (No Auth) ────────────────────────────────

test.describe('Public Access — No Authentication Required', () => {

  test('TC-SYS-14 | GET /products is publicly accessible', async ({ request }) => {
    const res = await request.get('/products');
    expect(res.status()).toBe(200);
  });

  test('TC-SYS-15 | GET /products/:id is publicly accessible', async ({ request }) => {
    const res = await request.get('/products/1');
    expect(res.status()).toBe(200);
  });

  test('TC-SYS-16 | GET /health is publicly accessible', async ({ request }) => {
    const res = await request.get('/health');
    expect(res.status()).toBe(200);
  });

  test('TC-SYS-17 | POST /auth/login is publicly accessible', async ({ request }) => {
    const res = await request.post('/auth/login', {
      data: { email: 'admin@shopeasy.com', password: 'password123' },
    });
    expect(res.status()).toBe(200);
  });

  test('TC-SYS-18 | POST /auth/register is publicly accessible', async ({ request }) => {
    const res = await request.post('/auth/register', {
      data: {
        email: `sysreg-${Date.now()}@test.com`,
        password: 'pass123',
        name: 'Sys Test',
      },
    });
    expect(res.status()).toBe(201);
  });

});

// ── Malformed Request Handling ────────────────────────────────

test.describe('Robustness — Malformed Request Handling', () => {

  test('TC-SYS-19 | Unknown route returns 404', async ({ request }) => {
    const res = await request.get('/nonexistent-endpoint');
    expect(res.status()).toBe(404);
  });

  test('TC-SYS-20 | GET /products with unknown query param still returns 200', async ({ request }) => {
    const res = await request.get('/products', { params: { unknownParam: 'test' } });
    expect(res.status()).toBe(200);
  });

  test('TC-SYS-21 | All error responses include an "error" field', async ({ request }) => {
    const errorCases = [
      request.post('/auth/login', { data: {} }),
      request.post('/auth/register', { data: {} }),
      request.get('/products/99999'),
    ];
    const responses = await Promise.all(errorCases);
    for (const res of responses) {
      const body = await res.json();
      expect(body).toHaveProperty('error');
    }
  });

  test('TC-SYS-22 | API never returns HTML for JSON endpoints', async ({ request }) => {
    const endpoints = [
      request.get('/products'),
      request.get('/products/1'),
      request.get('/health'),
      request.post('/auth/login', { data: {} }),
    ];
    const responses = await Promise.all(endpoints);
    for (const res of responses) {
      expect(res.headers()['content-type']).toContain('application/json');
    }
  });

});
