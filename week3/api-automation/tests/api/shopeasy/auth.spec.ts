import { test, expect } from '@playwright/test';
import {
  seedAdmin,
  newUserPayload,
  invalidCredentials,
  invalidRegistrations,
  maliciousInputs,
} from '../../../testData/api/shopeasy/shared/auth.data';

// ============================================================
// AUTH MODULE — ShopEasy API
// Endpoints: POST /auth/login, POST /auth/register
// ============================================================

// ── LOGIN ────────────────────────────────────────────────────

test.describe('POST /auth/login', () => {

  test.describe('Positive Tests', () => {

    test('TC-AUTH-01 | Valid credentials returns 200 with token', async ({ request }) => {
      const res = await request.post('/auth/login', { data: seedAdmin });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.token).toBeTruthy();
      expect(typeof body.token).toBe('string');
      expect(body.token).toMatch(/^tok_/);
    });

    test('TC-AUTH-02 | Valid login returns userId as number', async ({ request }) => {
      const res = await request.post('/auth/login', { data: seedAdmin });
      const body = await res.json();
      expect(typeof body.userId).toBe('number');
      expect(body.userId).toBe(1);
    });

    test('TC-AUTH-03 | Valid login returns success message', async ({ request }) => {
      const res = await request.post('/auth/login', { data: seedAdmin });
      const body = await res.json();
      expect(body.message).toBe('Login successful');
    });

    test('TC-AUTH-04 | Response schema has token, userId, message', async ({ request }) => {
      const res = await request.post('/auth/login', { data: seedAdmin });
      const body = await res.json();
      expect(body).toHaveProperty('token');
      expect(body).toHaveProperty('userId');
      expect(body).toHaveProperty('message');
    });

    test('TC-AUTH-05 | Response Content-Type is application/json', async ({ request }) => {
      const res = await request.post('/auth/login', { data: seedAdmin });
      expect(res.headers()['content-type']).toContain('application/json');
    });

    test('TC-AUTH-06 | Each login call returns a new unique token', async ({ request }) => {
      const res1 = await request.post('/auth/login', { data: seedAdmin });
      const res2 = await request.post('/auth/login', { data: seedAdmin });
      const body1 = await res1.json();
      const body2 = await res2.json();
      expect(body1.token).not.toBe(body2.token);
    });

  });

  test.describe('Negative Tests', () => {

    test('TC-AUTH-07 | Wrong password returns 401', async ({ request }) => {
      const res = await request.post('/auth/login', { data: invalidCredentials.wrongPassword });
      expect(res.status()).toBe(401);
      const body = await res.json();
      expect(body).toHaveProperty('error');
      expect(body).not.toHaveProperty('token');
    });

    test('TC-AUTH-08 | Non-existent email returns 401', async ({ request }) => {
      const res = await request.post('/auth/login', { data: invalidCredentials.nonExistentUser });
      expect(res.status()).toBe(401);
      const body = await res.json();
      expect(body).toHaveProperty('error');
    });

    test('TC-AUTH-09 | Missing email returns 400', async ({ request }) => {
      const res = await request.post('/auth/login', { data: invalidCredentials.missingEmail });
      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body).toHaveProperty('error');
    });

    test('TC-AUTH-10 | Missing password returns 400', async ({ request }) => {
      const res = await request.post('/auth/login', { data: invalidCredentials.missingPassword });
      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body).toHaveProperty('error');
    });

    test('TC-AUTH-11 | Empty body returns 400', async ({ request }) => {
      const res = await request.post('/auth/login', { data: invalidCredentials.emptyBody });
      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body).toHaveProperty('error');
    });

    test('TC-AUTH-12 | Error response does NOT contain a token', async ({ request }) => {
      const res = await request.post('/auth/login', { data: invalidCredentials.wrongPassword });
      const body = await res.json();
      expect(body).not.toHaveProperty('token');
    });

  });

  test.describe('Security Tests', () => {

    test('TC-AUTH-13 | SQL injection in email does not cause 500', async ({ request }) => {
      const res = await request.post('/auth/login', { data: maliciousInputs.sqlInjection });
      expect(res.status()).not.toBe(500);
      expect([400, 401]).toContain(res.status());
    });

    test('TC-AUTH-14 | XSS payload in email does not cause 500', async ({ request }) => {
      const res = await request.post('/auth/login', { data: maliciousInputs.xssInEmail });
      expect(res.status()).not.toBe(500);
    });

    test('TC-AUTH-15 | XSS payload in password does not cause 500', async ({ request }) => {
      const res = await request.post('/auth/login', { data: maliciousInputs.xssInPassword });
      expect(res.status()).not.toBe(500);
    });

    test('TC-AUTH-16 | Oversized input does not cause 500', async ({ request }) => {
      const res = await request.post('/auth/login', { data: maliciousInputs.longInput });
      expect(res.status()).not.toBe(500);
    });

  });

});

// ── REGISTER ─────────────────────────────────────────────────

test.describe('POST /auth/register', () => {

  test.describe('Positive Tests', () => {

    test('TC-REG-01 | Valid new user registration returns 201', async ({ request }) => {
      const payload = newUserPayload(`reg01-${Date.now()}`);
      const res = await request.post('/auth/register', { data: payload });
      expect(res.status()).toBe(201);
    });

    test('TC-REG-02 | Successful registration returns userId as number', async ({ request }) => {
      const payload = newUserPayload(`reg02-${Date.now()}`);
      const res = await request.post('/auth/register', { data: payload });
      const body = await res.json();
      expect(typeof body.userId).toBe('number');
      expect(body.userId).toBeGreaterThan(0);
    });

    test('TC-REG-03 | Successful registration returns success message', async ({ request }) => {
      const payload = newUserPayload(`reg03-${Date.now()}`);
      const res = await request.post('/auth/register', { data: payload });
      const body = await res.json();
      expect(body.message).toBe('User registered successfully');
    });

    test('TC-REG-04 | Response schema has userId and message', async ({ request }) => {
      const payload = newUserPayload(`reg04-${Date.now()}`);
      const res = await request.post('/auth/register', { data: payload });
      const body = await res.json();
      expect(body).toHaveProperty('userId');
      expect(body).toHaveProperty('message');
    });

    test('TC-REG-05 | Registered user can login immediately', async ({ request }) => {
      const payload = newUserPayload(`reg05-${Date.now()}`);
      await request.post('/auth/register', { data: payload });

      const loginRes = await request.post('/auth/login', {
        data: { email: payload.email, password: payload.password },
      });
      expect(loginRes.status()).toBe(200);
      const loginBody = await loginRes.json();
      expect(loginBody.token).toBeTruthy();
    });

    test('TC-REG-06 | Each registered user gets a unique userId', async ({ request }) => {
      const ts = Date.now();
      const p1 = newUserPayload(`reg06a-${ts}`);
      const p2 = newUserPayload(`reg06b-${ts}`);

      const r1 = await request.post('/auth/register', { data: p1 });
      const r2 = await request.post('/auth/register', { data: p2 });

      const b1 = await r1.json();
      const b2 = await r2.json();
      expect(b1.userId).not.toBe(b2.userId);
    });

    test('TC-REG-07 | Content-Type response is application/json', async ({ request }) => {
      const payload = newUserPayload(`reg07-${Date.now()}`);
      const res = await request.post('/auth/register', { data: payload });
      expect(res.headers()['content-type']).toContain('application/json');
    });

  });

  test.describe('Negative Tests', () => {

    test('TC-REG-08 | Duplicate email returns 409', async ({ request }) => {
      // Try to register admin who already exists
      const res = await request.post('/auth/register', {
        data: { email: seedAdmin.email, password: 'anypass', name: 'Duplicate' },
      });
      expect(res.status()).toBe(409);
      const body = await res.json();
      expect(body).toHaveProperty('error');
    });

    test('TC-REG-09 | Missing email returns 400', async ({ request }) => {
      const res = await request.post('/auth/register', { data: invalidRegistrations.missingEmail });
      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body).toHaveProperty('error');
    });

    test('TC-REG-10 | Missing password returns 400', async ({ request }) => {
      const res = await request.post('/auth/register', { data: invalidRegistrations.missingPassword });
      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body).toHaveProperty('error');
    });

    test('TC-REG-11 | Missing name returns 400', async ({ request }) => {
      const res = await request.post('/auth/register', { data: invalidRegistrations.missingName });
      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body).toHaveProperty('error');
    });

    test('TC-REG-12 | Empty body returns 400', async ({ request }) => {
      const res = await request.post('/auth/register', { data: invalidRegistrations.emptyBody });
      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body).toHaveProperty('error');
    });

    test('TC-REG-13 | Registering same email twice returns 409 on second call', async ({ request }) => {
      const payload = newUserPayload(`reg13-${Date.now()}`);
      await request.post('/auth/register', { data: payload });
      const res2 = await request.post('/auth/register', { data: payload });
      expect(res2.status()).toBe(409);
    });

  });

  test.describe('Security Tests', () => {

    test('TC-REG-14 | SQL injection in email does not cause 500', async ({ request }) => {
      const res = await request.post('/auth/register', {
        data: { email: "'; DROP TABLE users; --", password: 'pass', name: 'Hack' },
      });
      expect(res.status()).not.toBe(500);
    });

    test('TC-REG-15 | XSS in name does not cause 500', async ({ request }) => {
      const res = await request.post('/auth/register', {
        data: {
          email: `xss-${Date.now()}@test.com`,
          password: 'pass123',
          name: '<script>alert("xss")</script>',
        },
      });
      expect(res.status()).not.toBe(500);
    });

  });

});
