# User Module Test Cases

This file contains detailed test cases for the User module of the Swagger Petstore API.

---

## Basic Test Cases

### TC-USER-01
**Title:** Create a new user (valid data)
**Description:** Verify that a new user can be created with valid data.
**Preconditions:**
- API is available
**Test Steps:**
1. Prepare valid user data (username, firstName, lastName, email, password, etc.)
2. Send POST request to /user
3. Verify response status is 200 or 201
4. Verify response body contains the created user with correct data
**Expected Result:**
- User is created successfully and returned in the response


### TC-USER-02
**Title:** Create a new user (missing required fields)
**Description:** Verify error is returned when required fields are missing.
**Preconditions:**
- API is available
**Test Steps:**
1. Prepare user data missing required fields (e.g., no username)
2. Send POST request to /user
3. Verify response status is 400 or 422
4. Verify error message indicates missing fields
**Expected Result:**
- Error response indicating missing required fields

### TC-USER-03
**Title:** Get user by username (valid)
**Description:** Verify user details can be retrieved by username.
**Preconditions:**
- User exists in the system
**Test Steps:**
1. Send GET request to /user/{username} with valid username
2. Verify response status is 200
3. Verify response body contains correct user details
**Expected Result:**
- User details are returned for the given username

### TC-USER-04
**Title:** Get user by username (not found)
**Description:** Verify error is returned for non-existent username.
**Preconditions:**
- API is available
**Test Steps:**
1. Send GET request to /user/{username} with non-existent username
2. Verify response status is 404
3. Verify error message indicates user not found
**Expected Result:**
- Error response indicating user not found

### TC-USER-05
**Title:** Update user (valid data)
**Description:** Verify an existing user can be updated with valid data.
**Preconditions:**
- User exists in the system
**Test Steps:**
1. Prepare updated user data
2. Send PUT request to /user/{username}
3. Verify response status is 200 or 204
4. Verify user details are updated
**Expected Result:**
- User is updated successfully

### TC-USER-06
**Title:** Update user (invalid user)
**Description:** Verify error is returned when updating a non-existent user.
**Preconditions:**
- API is available
**Test Steps:**
1. Send PUT request to /user/{username} with non-existent username
2. Verify response status is 404
3. Verify error message indicates user not found
**Expected Result:**
- Error response indicating user not found

### TC-USER-07
**Title:** Delete user (valid)
**Description:** Verify an existing user can be deleted.
**Preconditions:**
- User exists in the system
**Test Steps:**
1. Send DELETE request to /user/{username}
2. Verify response status is 200 or 204
3. Verify user is deleted
**Expected Result:**
- User is deleted successfully

### TC-USER-08
**Title:** Delete user (not found)
**Description:** Verify error is returned when deleting a non-existent user.
**Preconditions:**
- API is available
**Test Steps:**
1. Send DELETE request to /user/{username} with non-existent username
2. Verify response status is 404
3. Verify error message indicates user not found
**Expected Result:**
- Error response indicating user not found

### TC-USER-09
**Title:** Login user (valid credentials)
**Description:** Verify user can log in with valid credentials.
**Preconditions:**
- User exists in the system
**Test Steps:**
1. Send GET request to /user/login with valid username and password
2. Verify response status is 200
3. Verify response contains token/session info
**Expected Result:**
- User is logged in successfully

### TC-USER-10
**Title:** Login user (invalid credentials)
**Description:** Verify error is returned for invalid login credentials.
**Preconditions:**
- API is available
**Test Steps:**
1. Send GET request to /user/login with invalid username or password
2. Verify response status is 400
3. Verify error message indicates invalid credentials
**Expected Result:**
- Error response indicating invalid credentials

### TC-USER-11
**Title:** Logout user
**Description:** Verify user can log out successfully.
**Preconditions:**
- User is logged in
**Test Steps:**
1. Send GET request to /user/logout
2. Verify response status is 200
**Expected Result:**
- User is logged out successfully

### TC-USER-12
**Title:** Create users with array input
**Description:** Verify multiple users can be created with array input.
**Preconditions:**
- API is available
**Test Steps:**
1. Prepare array of valid user data
2. Send POST request to /user/createWithArray
3. Verify response status is 200 or 201
4. Verify all users are created
**Expected Result:**
- All users in the array are created successfully

### TC-USER-13
**Title:** Create users with list input
**Description:** Verify multiple users can be created with list input.
**Preconditions:**
- API is available
**Test Steps:**
1. Prepare list of valid user data
2. Send POST request to /user/createWithList
3. Verify response status is 200 or 201
4. Verify all users are created
**Expected Result:**
- All users in the list are created successfully


---

## Integration, Data Chaining, System, Rate Limiting, and E2E Test Cases


---

## Integration, Data Chaining, System, Rate Limiting, and E2E Test Cases

### TC-USER-INT-01
**Title:** Create user and login (integration)
**Description:** Verify a user can be created and then logged in using the same credentials.
**Preconditions:**
- API is available
**Test Steps:**
1. Create a new user with valid data (POST /user)
2. Login with the same credentials (GET /user/login)
3. Verify login is successful
**Expected Result:**
- User is created and can log in immediately

### TC-USER-CHAIN-01
**Title:** Create, get, update, and delete user (data chaining)
**Description:** Verify user lifecycle using chained operations.
**Preconditions:**
- API is available
**Test Steps:**
1. Create a new user (POST /user)
2. Get user by username (GET /user/{username})
3. Update user (PUT /user/{username})
4. Delete user (DELETE /user/{username})
5. Try to get user again (GET /user/{username})
**Expected Result:**
- User is created, updated, deleted, and not found after deletion

### TC-USER-SYS-01
**Title:** Concurrent user creation (system/load)
**Description:** Verify system can handle 100 concurrent user creations.
**Preconditions:**
- API is available
**Test Steps:**
1. Prepare 100 unique user data entries
2. Send 100 POST requests to /user concurrently
3. Verify all users are created
**Expected Result:**
- System handles concurrent user creation without errors

### TC-USER-RATE-01
**Title:** Rate limiting on user creation
**Description:** Verify API enforces rate limiting on user creation.
**Preconditions:**
- API has rate limiting enabled
**Test Steps:**
1. Send rapid POST requests to /user exceeding rate limit
2. Monitor response status codes
3. Verify 429 responses are received after threshold
**Expected Result:**
- API returns 429 Too Many Requests after rate limit is exceeded

### TC-USER-E2E-01
**Title:** User registration to login to deletion (end-to-end)
**Description:** Verify complete user journey from registration to deletion.
**Preconditions:**
- API is available
**Test Steps:**
1. Register a new user (POST /user)
2. Login with new user (GET /user/login)
3. Update user details (PUT /user/{username})
4. Logout (GET /user/logout)
5. Delete user (DELETE /user/{username})
**Expected Result:**
- User can register, login, update, logout, and delete account successfully
