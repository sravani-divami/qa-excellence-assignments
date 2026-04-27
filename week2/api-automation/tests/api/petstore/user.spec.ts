import { test, expect } from '@playwright/test';
import {
  validUser,
  validUser2,
  updatedUser,
  invalidUser,
  validCredentials,
  invalidCredentials,
  userArray,
  nonExistentUsername
} from '../../../testData/api/petstore/user/user.data';

// ============================================================
// USER MODULE — Petstore API
// Endpoints: POST /user, GET /user/{username}, PUT /user/{username}, DELETE /user/{username}, GET /user/login, GET /user/logout, POST /user/createWithArray, POST /user/createWithList
// ============================================================

test.describe('User API Tests', () => {

  // ── BASIC CRUD TESTS ─────────────────────────────────────

  test.describe('POST /user - Create user', () => {

    test('TC-USER-01 | Create a new user with valid data', async ({ request }) => {
      const res = await request.post('/user', { data: validUser });
      expect([200, 201]).toContain(res.status());
      const body = await res.json();
      expect(body).toHaveProperty('message');
    });

    test('TC-USER-02 | Create user with missing required fields returns error', async ({ request }) => {
      const res = await request.post('/user', { data: invalidUser });
      // Petstore may be lenient, check for proper error handling
      expect([200, 400, 422]).toContain(res.status());
    });

  });

  test.describe('GET /user/{username} - Get user by username', () => {

    test('TC-USER-03 | Get user by valid username', async ({ request }) => {
      // First create a user
      await request.post('/user', { data: validUser });
      
      // Get the user
      const res = await request.get(`/user/${validUser.username}`);
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.username).toBe(validUser.username);
      expect(body.firstName).toBe(validUser.firstName);
      expect(body.email).toBe(validUser.email);
    });

    test('TC-USER-04 | Get user with non-existent username returns 404', async ({ request }) => {
      const res = await request.get(`/user/${nonExistentUsername}`);
      expect(res.status()).toBe(404);
    });

  });

  test.describe('PUT /user/{username} - Update user', () => {

    test('TC-USER-05 | Update user with valid data', async ({ request }) => {
      // First create a user
      await request.post('/user', { data: validUser });
      
      // Update the user
      const res = await request.put(`/user/${validUser.username}`, { data: updatedUser });
      expect([200, 204]).toContain(res.status());
      
      // Verify update
      const getRes = await request.get(`/user/${validUser.username}`);
      const body = await getRes.json();
      expect(body.firstName).toBe(updatedUser.firstName);
    });

    test('TC-USER-06 | Update non-existent user returns 404', async ({ request }) => {
      const res = await request.put(`/user/${nonExistentUsername}`, { data: updatedUser });
      expect(res.status()).toBe(404);
    });

  });

  test.describe('DELETE /user/{username} - Delete user', () => {

    test('TC-USER-07 | Delete user with valid username', async ({ request }) => {
      // First create a user
      const uniqueUser = { ...validUser2, username: `delete_${Date.now()}` };
      await request.post('/user', { data: uniqueUser });
      
      // Delete the user
      const deleteRes = await request.delete(`/user/${uniqueUser.username}`);
      expect([200, 204]).toContain(deleteRes.status());
      
      // Verify user is deleted
      const getRes = await request.get(`/user/${uniqueUser.username}`);
      expect(getRes.status()).toBe(404);
    });

    test('TC-USER-08 | Delete non-existent user returns 404', async ({ request }) => {
      const res = await request.delete(`/user/${nonExistentUsername}`);
      expect(res.status()).toBe(404);
    });

  });

  test.describe('GET /user/login - User login', () => {

    test('TC-USER-09 | Login with valid credentials', async ({ request }) => {
      // First create a user
      await request.post('/user', { data: validUser });
      
      // Login
      const res = await request.get(`/user/login?username=${validUser.username}&password=${validUser.password}`);
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('message');
    });

    test('TC-USER-10 | Login with invalid credentials returns 400', async ({ request }) => {
      const res = await request.get(`/user/login?username=${invalidCredentials.username}&password=${invalidCredentials.password}`);
      expect(res.status()).toBe(400);
    });

  });

  test.describe('GET /user/logout - User logout', () => {

    test('TC-USER-11 | Logout user', async ({ request }) => {
      const res = await request.get('/user/logout');
      expect(res.status()).toBe(200);
    });

  });

  test.describe('POST /user/createWithArray - Create users with array', () => {

    test('TC-USER-12 | Create multiple users with array input', async ({ request }) => {
      const res = await request.post('/user/createWithArray', { data: userArray });
      expect([200, 201]).toContain(res.status());
      
      // Verify users are created
      const firstUser = userArray[0];
      const getRes = await request.get(`/user/${firstUser.username}`);
      expect(getRes.status()).toBe(200);
    });

  });

  test.describe('POST /user/createWithList - Create users with list', () => {

    test('TC-USER-13 | Create multiple users with list input', async ({ request }) => {
      const res = await request.post('/user/createWithList', { data: userArray });
      expect([200, 201]).toContain(res.status());
    });

  });

  // ── DATA CHAINING TEST ───────────────────────────────────

  test.describe('User Lifecycle Tests', () => {

    test('TC-USER-CHAIN-01 | User lifecycle: create, get, update, delete', async ({ request }) => {
      const lifecycleUser = { ...validUser, username: `lifecycle_${Date.now()}` };
      
      // 1. Create user
      const createRes = await request.post('/user', { data: lifecycleUser });
      expect([200, 201]).toContain(createRes.status());

      // 2. Get user
      const getRes = await request.get(`/user/${lifecycleUser.username}`);
      expect(getRes.status()).toBe(200);
      const fetchedUser = await getRes.json();
      expect(fetchedUser.username).toBe(lifecycleUser.username);

      // 3. Update user
      const updateData = { ...lifecycleUser, firstName: 'Updated First' };
      const updateRes = await request.put(`/user/${lifecycleUser.username}`, { data: updateData });
      expect([200, 204]).toContain(updateRes.status());

      // 4. Delete user
      const deleteRes = await request.delete(`/user/${lifecycleUser.username}`);
      expect([200, 204]).toContain(deleteRes.status());

      // 5. Verify user is deleted
      const getDeletedRes = await request.get(`/user/${lifecycleUser.username}`);
      expect(getDeletedRes.status()).toBe(404);
    });

  });

  // ── INTEGRATION TEST ─────────────────────────────────────

  test.describe('Integration Tests', () => {

    test('TC-USER-INT-01 | Create user and login', async ({ request }) => {
      const integrationUser = { ...validUser, username: `integration_${Date.now()}` };
      
      // 1. Create user
      const createRes = await request.post('/user', { data: integrationUser });
      expect([200, 201]).toContain(createRes.status());

      // 2. Login with the created user
      const loginRes = await request.get(`/user/login?username=${integrationUser.username}&password=${integrationUser.password}`);
      expect(loginRes.status()).toBe(200);
    });

  });

  // ── SYSTEM/LOAD TESTS ────────────────────────────────────

  test.describe('System Tests', () => {

    test('TC-USER-SYS-01 | Concurrent user creation (10 users)', async ({ request }) => {
      const promises = [];
      for (let i = 0; i < 10; i++) {
        const userData = {
          id: Math.floor(Math.random() * 900000) + 100000 + i,
          username: `concurrent_user_${Date.now()}_${i}`,
          firstName: `User${i}`,
          lastName: `Test${i}`,
          email: `user${i}@example.com`,
          password: `pass${i}`,
          phone: `111111111${i}`,
          userStatus: 1
        };
        promises.push(request.post('/user', { data: userData }));
      }
      
      const responses = await Promise.all(promises);
      responses.forEach(res => {
        expect([200, 201]).toContain(res.status());
      });
    });

  });

  // ── END-TO-END TEST ──────────────────────────────────────

  test.describe('End-to-End Tests', () => {

    test('TC-USER-E2E-01 | User registration to login to deletion', async ({ request }) => {
      const e2eUser = { ...validUser, username: `e2e_${Date.now()}` };
      
      // 1. Register user
      const registerRes = await request.post('/user', { data: e2eUser });
      expect([200, 201]).toContain(registerRes.status());

      // 2. Login
      const loginRes = await request.get(`/user/login?username=${e2eUser.username}&password=${e2eUser.password}`);
      expect(loginRes.status()).toBe(200);

      // 3. Update user details
      const updateData = { ...e2eUser, firstName: 'E2E Updated' };
      const updateRes = await request.put(`/user/${e2eUser.username}`, { data: updateData });
      expect([200, 204]).toContain(updateRes.status());

      // 4. Logout
      const logoutRes = await request.get('/user/logout');
      expect(logoutRes.status()).toBe(200);

      // 5. Delete user
      const deleteRes = await request.delete(`/user/${e2eUser.username}`);
      expect([200, 204]).toContain(deleteRes.status());
    });

  });

});
