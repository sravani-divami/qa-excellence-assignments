# Store Module Test Cases

This file contains detailed test cases for the Store module of the Swagger Petstore API.

---

## Basic Test Cases

### TC-STORE-01
**Title:** Place an order for a pet (valid data)
**Description:** Verify that an order can be placed for a pet with valid data.
**Preconditions:**
- Pet exists in the store
- API is available
**Test Steps:**
1. Prepare valid order data (petId, quantity, status, etc.)
2. Send POST request to /store/order
3. Verify response status is 200
4. Verify response body contains the order with correct data
**Expected Result:**
- Order is placed successfully and returned in the response


### TC-STORE-02
**Title:** Place an order for a pet (invalid data)
**Description:** Verify error is returned when placing an order with invalid data.
**Preconditions:**
- API is available
**Test Steps:**
1. Prepare invalid order data (e.g., missing petId)
2. Send POST request to /store/order
3. Verify response status is 400
4. Verify error message indicates invalid order
**Expected Result:**
- Error response indicating invalid order

### TC-STORE-03
**Title:** Get order by ID (valid)
**Description:** Verify an order can be retrieved by valid ID.
**Preconditions:**
- Order exists in the store
**Test Steps:**
1. Send GET request to /store/order/{orderId} with valid ID
2. Verify response status is 200
3. Verify response contains correct order details
**Expected Result:**
- Order details are returned for the given ID

### TC-STORE-04
**Title:** Get order by ID (not found)
**Description:** Verify error is returned for non-existent order ID.
**Preconditions:**
- API is available
**Test Steps:**
1. Send GET request to /store/order/{orderId} with non-existent ID
2. Verify response status is 404
3. Verify error message indicates order not found
**Expected Result:**
- Error response indicating order not found

### TC-STORE-05
**Title:** Delete order (valid)
**Description:** Verify an order can be deleted by valid ID.
**Preconditions:**
- Order exists in the store
**Test Steps:**
1. Send DELETE request to /store/order/{orderId} with valid ID
2. Verify response status is 200 or 204
3. Verify order is deleted
**Expected Result:**
- Order is deleted successfully

### TC-STORE-06
**Title:** Delete order (not found)
**Description:** Verify error is returned when deleting a non-existent order.
**Preconditions:**
- API is available
**Test Steps:**
1. Send DELETE request to /store/order/{orderId} with non-existent ID
2. Verify response status is 404
3. Verify error message indicates order not found
**Expected Result:**
- Error response indicating order not found

### TC-STORE-07
**Title:** Get inventory
**Description:** Verify inventory can be retrieved successfully.
**Preconditions:**
- API is available
**Test Steps:**
1. Send GET request to /store/inventory
2. Verify response status is 200
3. Verify response contains inventory data
**Expected Result:**
- Inventory data is returned successfully


---

## Integration, Data Chaining, System, Rate Limiting, and E2E Test Cases


---

## Integration, Data Chaining, System, Rate Limiting, and E2E Test Cases

### TC-STORE-INT-01
**Title:** Place order and get order (integration)
**Description:** Verify an order can be placed and then retrieved by ID.
**Preconditions:**
- API is available
**Test Steps:**
1. Place a new order (POST /store/order)
2. Get order by ID (GET /store/order/{orderId})
3. Verify order details match
**Expected Result:**
- Order is placed and can be retrieved immediately

### TC-STORE-CHAIN-01
**Title:** Order lifecycle (data chaining)
**Description:** Verify order creation, retrieval, and deletion in sequence.
**Preconditions:**
- API is available
**Test Steps:**
1. Place a new order (POST /store/order)
2. Get order by ID (GET /store/order/{orderId})
3. Delete order (DELETE /store/order/{orderId})
4. Try to get order again (GET /store/order/{orderId})
**Expected Result:**
- Order is created, retrieved, deleted, and not found after deletion

### TC-STORE-SYS-01
**Title:** Concurrent order placement (system/load)
**Description:** Verify system can handle 100 concurrent order placements.
**Preconditions:**
- API is available
**Test Steps:**
1. Prepare 100 unique order data entries
2. Send 100 POST requests to /store/order concurrently
3. Verify all orders are placed
**Expected Result:**
- System handles concurrent order placement without errors

### TC-STORE-RATE-01
**Title:** Rate limiting on order placement
**Description:** Verify API enforces rate limiting on order placement.
**Preconditions:**
- API has rate limiting enabled
**Test Steps:**
1. Send rapid POST requests to /store/order exceeding rate limit
2. Monitor response status codes
3. Verify 429 responses are received after threshold
**Expected Result:**
- API returns 429 Too Many Requests after rate limit is exceeded

### TC-STORE-E2E-01
**Title:** Full order workflow (end-to-end)
**Description:** Verify complete order workflow from placement to deletion.
**Preconditions:**
- API is available
**Test Steps:**
1. Place a new order (POST /store/order)
2. Get order by ID (GET /store/order/{orderId})
3. Delete order (DELETE /store/order/{orderId})
4. Get inventory (GET /store/inventory)
**Expected Result:**
- Order can be placed, retrieved, deleted, and inventory is updated accordingly
