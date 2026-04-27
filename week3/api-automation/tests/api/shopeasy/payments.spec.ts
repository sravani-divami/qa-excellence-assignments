import { test, expect } from '@playwright/test';
import {
  paymentIdPattern,
  validPaymentMethods,
  invalidPaymentPayloads,
  processPaymentSchemaFields,
  getPaymentSchemaFields,
} from '../../../testData/api/shopeasy/payments/payments.data';

// ============================================================
// PAYMENTS MODULE — ShopEasy API
// Endpoints: POST /payments, GET /payments/:paymentId
// All endpoints require Bearer token authentication
// ============================================================

test.describe.configure({ mode: 'serial' });

// ── Helpers ───────────────────────────────────────────────────

async function registerAndLogin(
  request: Parameters<Parameters<typeof test>[1]>[0]['request'],
  suffix: string
): Promise<string> {
  const email = `pay-user-${suffix}@test.com`;
  await request.post('/auth/register', {
    data: { email, password: 'paypass123', name: 'Payment Test User' },
  });
  const res = await request.post('/auth/login', {
    data: { email, password: 'paypass123' },
  });
  const body = await res.json();
  return body.token;
}

async function setupOrderForPayment(
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

test.describe('Payments — Authentication Guard', () => {

  test('TC-PAY-01 | POST /payments without token returns 401', async ({ request }) => {
    const res = await request.post('/payments', {
      data: { orderId: 'ORD-1001', method: 'credit_card' },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body).toHaveProperty('error');
  });

  test('TC-PAY-02 | POST /payments with invalid token returns 401', async ({ request }) => {
    const res = await request.post('/payments', {
      headers: { Authorization: 'Bearer tok_invalidtoken' },
      data: { orderId: 'ORD-1001', method: 'credit_card' },
    });
    expect(res.status()).toBe(401);
  });

  test('TC-PAY-03 | GET /payments/:paymentId without token returns 401', async ({ request }) => {
    const res = await request.get('/payments/PAY-5001');
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body).toHaveProperty('error');
  });

  test('TC-PAY-04 | GET /payments/:paymentId with invalid token returns 401', async ({ request }) => {
    const res = await request.get('/payments/PAY-5001', {
      headers: { Authorization: 'Bearer tok_invalidtoken' },
    });
    expect(res.status()).toBe(401);
  });

});

// ── POST /payments ────────────────────────────────────────────

test.describe('POST /payments', () => {

  test.describe('Positive Tests — Valid Payment Methods', () => {

    for (const method of validPaymentMethods) {
      test(`TC-PAY-METHOD | Process payment via ${method} returns 201`, async ({ request }) => {
        const token = await registerAndLogin(request, `pay-${method}-${Date.now()}`);
        const orderId = await setupOrderForPayment(request, token);

        const res = await request.post('/payments', {
          headers: { Authorization: `Bearer ${token}` },
          data: { orderId, method },
        });
        expect(res.status()).toBe(201);
        const body = await res.json();
        expect(body.status).toBe('success');
      });
    }

  });

  test.describe('Positive Tests — Response Validation', () => {

    test('TC-PAY-05 | Payment response has paymentId, status, amount, message', async ({ request }) => {
      const token = await registerAndLogin(request, `payschema-${Date.now()}`);
      const orderId = await setupOrderForPayment(request, token);

      const res = await request.post('/payments', {
        headers: { Authorization: `Bearer ${token}` },
        data: { orderId, method: 'credit_card' },
      });
      const body = await res.json();
      for (const field of processPaymentSchemaFields) {
        expect(body).toHaveProperty(field);
      }
    });

    test('TC-PAY-06 | paymentId matches PAY-XXXX format', async ({ request }) => {
      const token = await registerAndLogin(request, `payformat-${Date.now()}`);
      const orderId = await setupOrderForPayment(request, token);

      const res = await request.post('/payments', {
        headers: { Authorization: `Bearer ${token}` },
        data: { orderId, method: 'upi' },
      });
      const body = await res.json();
      expect(body.paymentId).toMatch(paymentIdPattern);
    });

    test('TC-PAY-07 | Payment status is "success"', async ({ request }) => {
      const token = await registerAndLogin(request, `paystatus-${Date.now()}`);
      const orderId = await setupOrderForPayment(request, token);

      const res = await request.post('/payments', {
        headers: { Authorization: `Bearer ${token}` },
        data: { orderId, method: 'net_banking' },
      });
      const body = await res.json();
      expect(body.status).toBe('success');
    });

    test('TC-PAY-08 | Payment amount matches order total', async ({ request }) => {
      const token = await registerAndLogin(request, `payamount-${Date.now()}`);

      await request.post('/cart/items', {
        headers: { Authorization: `Bearer ${token}` },
        data: { productId: 1, quantity: 1 }, // $99.99
      });
      const orderRes = await request.post('/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const order = await orderRes.json();

      const payRes = await request.post('/payments', {
        headers: { Authorization: `Bearer ${token}` },
        data: { orderId: order.orderId, method: 'credit_card' },
      });
      const payment = await payRes.json();
      expect(payment.amount).toBeCloseTo(order.total, 2);
    });

    test('TC-PAY-09 | Payment message is "Payment processed"', async ({ request }) => {
      const token = await registerAndLogin(request, `paymsg-${Date.now()}`);
      const orderId = await setupOrderForPayment(request, token);

      const res = await request.post('/payments', {
        headers: { Authorization: `Bearer ${token}` },
        data: { orderId, method: 'debit_card' },
      });
      const body = await res.json();
      expect(body.message).toBe('Payment processed');
    });

    test('TC-PAY-10 | Order status is "paid" after successful payment', async ({ request }) => {
      const token = await registerAndLogin(request, `paypaid-${Date.now()}`);
      const orderId = await setupOrderForPayment(request, token);

      await request.post('/payments', {
        headers: { Authorization: `Bearer ${token}` },
        data: { orderId, method: 'credit_card' },
      });

      const orderRes = await request.get(`/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const order = await orderRes.json();
      expect(order.status).toBe('paid');
    });

    test('TC-PAY-11 | Payment amount is a positive number', async ({ request }) => {
      const token = await registerAndLogin(request, `paypositive-${Date.now()}`);
      const orderId = await setupOrderForPayment(request, token);

      const res = await request.post('/payments', {
        headers: { Authorization: `Bearer ${token}` },
        data: { orderId, method: 'upi' },
      });
      const body = await res.json();
      expect(typeof body.amount).toBe('number');
      expect(body.amount).toBeGreaterThan(0);
    });

  });

  test.describe('Negative Tests', () => {

    test('TC-PAY-12 | Duplicate payment for same order returns 409', async ({ request }) => {
      const token = await registerAndLogin(request, `paydupe-${Date.now()}`);
      const orderId = await setupOrderForPayment(request, token);

      await request.post('/payments', {
        headers: { Authorization: `Bearer ${token}` },
        data: { orderId, method: 'credit_card' },
      });

      const res2 = await request.post('/payments', {
        headers: { Authorization: `Bearer ${token}` },
        data: { orderId, method: 'debit_card' },
      });
      expect(res2.status()).toBe(409);
      const body = await res2.json();
      expect(body).toHaveProperty('error');
    });

    test('TC-PAY-13 | Non-existent orderId returns 404', async ({ request }) => {
      const token = await registerAndLogin(request, `pay404-${Date.now()}`);
      const res = await request.post('/payments', {
        headers: { Authorization: `Bearer ${token}` },
        data: invalidPaymentPayloads.nonExistentOrder,
      });
      expect(res.status()).toBe(404);
      const body = await res.json();
      expect(body).toHaveProperty('error');
    });

    test('TC-PAY-14 | Missing orderId returns 400', async ({ request }) => {
      const token = await registerAndLogin(request, `paynoid-${Date.now()}`);
      const res = await request.post('/payments', {
        headers: { Authorization: `Bearer ${token}` },
        data: invalidPaymentPayloads.missingOrderId,
      });
      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body).toHaveProperty('error');
    });

    test('TC-PAY-15 | Missing method returns 400', async ({ request }) => {
      const token = await registerAndLogin(request, `paynomethod-${Date.now()}`);
      const res = await request.post('/payments', {
        headers: { Authorization: `Bearer ${token}` },
        data: invalidPaymentPayloads.missingMethod,
      });
      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body).toHaveProperty('error');
    });

    test('TC-PAY-16 | Empty body returns 400', async ({ request }) => {
      const token = await registerAndLogin(request, `payempty-${Date.now()}`);
      const res = await request.post('/payments', {
        headers: { Authorization: `Bearer ${token}` },
        data: invalidPaymentPayloads.emptyBody,
      });
      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body).toHaveProperty('error');
    });

  });

});

// ── GET /payments/:paymentId ──────────────────────────────────

test.describe('GET /payments/:paymentId', () => {

  test('TC-PAY-17 | Get valid payment returns 200', async ({ request }) => {
    const token = await registerAndLogin(request, `getpay-${Date.now()}`);
    const orderId = await setupOrderForPayment(request, token);
    const payRes = await request.post('/payments', {
      headers: { Authorization: `Bearer ${token}` },
      data: { orderId, method: 'credit_card' },
    });
    const pay = await payRes.json();

    const res = await request.get(`/payments/${pay.paymentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
  });

  test('TC-PAY-18 | Payment response schema: paymentId, orderId, method, amount, status, processedAt', async ({ request }) => {
    const token = await registerAndLogin(request, `getpayschema-${Date.now()}`);
    const orderId = await setupOrderForPayment(request, token);
    const payRes = await request.post('/payments', {
      headers: { Authorization: `Bearer ${token}` },
      data: { orderId, method: 'upi' },
    });
    const pay = await payRes.json();

    const res = await request.get(`/payments/${pay.paymentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json();
    for (const field of getPaymentSchemaFields) {
      expect(body).toHaveProperty(field);
    }
  });

  test('TC-PAY-19 | Returned payment has correct orderId', async ({ request }) => {
    const token = await registerAndLogin(request, `getpaylink-${Date.now()}`);
    const orderId = await setupOrderForPayment(request, token);
    const payRes = await request.post('/payments', {
      headers: { Authorization: `Bearer ${token}` },
      data: { orderId, method: 'net_banking' },
    });
    const pay = await payRes.json();

    const res = await request.get(`/payments/${pay.paymentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json();
    expect(body.orderId).toBe(orderId);
  });

  test('TC-PAY-20 | processedAt is a valid ISO date string', async ({ request }) => {
    const token = await registerAndLogin(request, `getpaydate-${Date.now()}`);
    const orderId = await setupOrderForPayment(request, token);
    const payRes = await request.post('/payments', {
      headers: { Authorization: `Bearer ${token}` },
      data: { orderId, method: 'debit_card' },
    });
    const pay = await payRes.json();

    const res = await request.get(`/payments/${pay.paymentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json();
    expect(new Date(body.processedAt).toString()).not.toBe('Invalid Date');
  });

  test('TC-PAY-21 | Non-existent paymentId returns 404', async ({ request }) => {
    const token = await registerAndLogin(request, `getpay404-${Date.now()}`);
    const res = await request.get('/payments/PAY-99999', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body).toHaveProperty('error');
  });

  test('TC-PAY-22 | Returned payment method matches what was submitted', async ({ request }) => {
    const token = await registerAndLogin(request, `getpaymethod-${Date.now()}`);
    const orderId = await setupOrderForPayment(request, token);
    const payRes = await request.post('/payments', {
      headers: { Authorization: `Bearer ${token}` },
      data: { orderId, method: 'upi' },
    });
    const pay = await payRes.json();

    const res = await request.get(`/payments/${pay.paymentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json();
    expect(body.method).toBe('upi');
  });

});
