// ============================================================
// Auth Test Data — ShopEasy API
// File: testData/api/shopeasy/shared/auth.data.ts
// ============================================================

export interface UserCredentials {
  email: string;
  password: string;
  name?: string;
  role?: string;
}

// Pre-seeded admin user (always available on fresh server start)
export const seedAdmin: UserCredentials = {
  email: 'admin@shopeasy.com',
  password: 'password123',
  name: 'Admin User',
  role: 'admin',
};

// Valid new user for registration tests (use unique email per run)
export function newUserPayload(suffix: string) {
  return {
    email: `testuser-${suffix}@shopeasy.com`,
    password: 'testpass123',
    name: 'Test User',
  };
}

// Invalid credential scenarios
export const invalidCredentials = {
  wrongPassword: {
    email: 'admin@shopeasy.com',
    password: 'wrongpassword',
  },
  nonExistentUser: {
    email: 'nobody@shopeasy.com',
    password: 'password123',
  },
  missingEmail: {
    password: 'password123',
  },
  missingPassword: {
    email: 'admin@shopeasy.com',
  },
  emptyBody: {},
};

// Invalid registration scenarios
export const invalidRegistrations = {
  missingEmail: {
    password: 'pass123',
    name: 'No Email',
  },
  missingPassword: {
    email: 'nopw@shopeasy.com',
    name: 'No Password',
  },
  missingName: {
    email: 'noname@shopeasy.com',
    password: 'pass123',
  },
  emptyBody: {},
};

// Security / malicious inputs
export const maliciousInputs = {
  sqlInjection: {
    email: "admin@shopeasy.com' OR '1'='1",
    password: "' OR '1'='1' --",
  },
  xssInEmail: {
    email: '<script>alert(1)</script>@test.com',
    password: 'password123',
  },
  xssInPassword: {
    email: 'admin@shopeasy.com',
    password: '<script>alert(1)</script>',
  },
  longInput: {
    email: 'a'.repeat(256) + '@test.com',
    password: 'a'.repeat(256),
    name: 'a'.repeat(256),
  },
};

// Token test values
export const tokenEdgeCases = {
  malformed: 'Bearer this.is.not.valid',
  noBearer: 'tok_justthetoken',
  empty: '',
  invalidToken: 'Bearer tok_invalidtoken123',
};
