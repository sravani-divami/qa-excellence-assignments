// ============================================================
// User Test Data — Petstore API
// File: testData/api/petstore/user/user.data.ts
// ============================================================

export interface User {
  id?: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  userStatus?: number;
}

// Generate unique username to avoid conflicts
const generateUsername = () => `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

export const validUser: User = {
  id: Math.floor(Math.random() * 900000) + 100000,
  username: generateUsername(),
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  password: 'password123',
  phone: '1234567890',
  userStatus: 1
};

export const validUser2: User = {
  id: Math.floor(Math.random() * 900000) + 100000,
  username: generateUsername(),
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane.smith@example.com',
  password: 'password456',
  phone: '0987654321',
  userStatus: 1
};

export const updatedUser: User = {
  username: validUser.username,
  firstName: 'John Updated',
  lastName: 'Doe Updated',
  email: 'john.updated@example.com',
  password: 'newpassword123',
  phone: '1111111111',
  userStatus: 2
};

// Invalid user data (missing required fields)
export const invalidUser = {
  // missing username
  firstName: 'Invalid',
  lastName: 'User',
  email: 'invalid@example.com'
};

// User credentials
export const validCredentials = {
  username: validUser.username,
  password: validUser.password
};

export const invalidCredentials = {
  username: 'nonexistent_user',
  password: 'wrong_password'
};

// Array of users for batch creation
export const userArray: User[] = [
  {
    id: Math.floor(Math.random() * 900000) + 100000,
    username: generateUsername(),
    firstName: 'User1',
    lastName: 'Test1',
    email: 'user1@example.com',
    password: 'pass1',
    phone: '1111111111',
    userStatus: 1
  },
  {
    id: Math.floor(Math.random() * 900000) + 100000,
    username: generateUsername(),
    firstName: 'User2',
    lastName: 'Test2',
    email: 'user2@example.com',
    password: 'pass2',
    phone: '2222222222',
    userStatus: 1
  },
  {
    id: Math.floor(Math.random() * 900000) + 100000,
    username: generateUsername(),
    firstName: 'User3',
    lastName: 'Test3',
    email: 'user3@example.com',
    password: 'pass3',
    phone: '3333333333',
    userStatus: 1
  }
];

// Non-existent username
export const nonExistentUsername = 'nonexistent_user_9999999';
