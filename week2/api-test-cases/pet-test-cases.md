# Pet Module Test Cases

This file contains detailed test cases for the Pet module of the Swagger Petstore API.

---

## Basic Test Cases

### TC-PET-01
**Title:** Add a new pet (valid data)
**Description:** Verify that a new pet can be added with valid data.
**Preconditions:**
- User is authenticated (if required)
- API is available
**Test Steps:**
1. Prepare valid pet data (name, photoUrls, status, etc.)
2. Send POST request to /pet with valid data
3. Verify response status is 200 or 201
4. Verify response body contains the created pet with correct data
**Expected Result:**
- Pet is created successfully and returned in the response

### TC-PET-02
**Title:** Add a new pet (missing required fields)
**Description:** Verify that adding a pet with missing required fields returns an error.
**Preconditions:**
- User is authenticated (if required)
- API is available
**Test Steps:**
1. Prepare pet data missing required fields (e.g., no name)
2. Send POST request to /pet
3. Verify response status is 405 or 400
4. Verify error message indicates missing required fields
**Expected Result:**
- Error response indicating missing required fields


### TC-PET-03
**Title:** Update an existing pet (valid data)
**Description:** Verify that an existing pet can be updated with valid data.
**Preconditions:**
- Pet exists in the store
- API is available
**Test Steps:**
1. Prepare updated pet data
2. Send PUT request to /pet with updated data
3. Verify response status is 200 or 204
4. Verify pet details are updated
**Expected Result:**
- Pet is updated successfully

### TC-PET-04
**Title:** Update an existing pet (invalid ID)
**Description:** Verify error is returned when updating a pet with an invalid ID.
**Preconditions:**
- API is available
**Test Steps:**
1. Prepare pet data with invalid ID
2. Send PUT request to /pet
3. Verify response status is 400 or 404
4. Verify error message indicates invalid ID or pet not found
**Expected Result:**
- Error response indicating invalid ID or pet not found

### TC-PET-05
**Title:** Find pets by status (valid)
**Description:** Verify pets can be found by valid status values.
**Preconditions:**
- API is available
**Test Steps:**
1. Send GET request to /pet/findByStatus with valid status (available, pending, sold)
2. Verify response status is 200
3. Verify response contains pets with the requested status
**Expected Result:**
- Pets with the requested status are returned

### TC-PET-06
**Title:** Find pets by status (invalid)
**Description:** Verify error is returned for invalid status value.
**Preconditions:**
- API is available
**Test Steps:**
1. Send GET request to /pet/findByStatus with invalid status
2. Verify response status is 400
3. Verify error message indicates invalid status
**Expected Result:**
- Error response indicating invalid status value

### TC-PET-07
**Title:** Find pets by tags
**Description:** Verify pets can be found by tags.
**Preconditions:**
- API is available
**Test Steps:**
1. Send GET request to /pet/findByTags with valid tags
2. Verify response status is 200
3. Verify response contains pets with the requested tags
**Expected Result:**
- Pets with the requested tags are returned

### TC-PET-08
**Title:** Get pet by ID (valid)
**Description:** Verify a pet can be retrieved by valid ID.
**Preconditions:**
- Pet exists in the store
**Test Steps:**
1. Send GET request to /pet/{petId} with valid ID
2. Verify response status is 200
3. Verify response contains correct pet details
**Expected Result:**
- Pet details are returned for the given ID

### TC-PET-09
**Title:** Get pet by ID (not found)
**Description:** Verify error is returned for non-existent pet ID.
**Preconditions:**
- API is available
**Test Steps:**
1. Send GET request to /pet/{petId} with non-existent ID
2. Verify response status is 404
3. Verify error message indicates pet not found
**Expected Result:**
- Error response indicating pet not found

### TC-PET-10
**Title:** Update pet with form data
**Description:** Verify a pet can be updated using form data.
**Preconditions:**
- Pet exists in the store
**Test Steps:**
1. Send POST request to /pet/{petId} with form data (name, status)
2. Verify response status is 200 or 204
3. Verify pet details are updated
**Expected Result:**
- Pet is updated successfully using form data

### TC-PET-11
**Title:** Delete pet (valid)
**Description:** Verify a pet can be deleted by valid ID.
**Preconditions:**
- Pet exists in the store
**Test Steps:**
1. Send DELETE request to /pet/{petId} with valid ID
2. Verify response status is 200 or 204
3. Verify pet is deleted
**Expected Result:**
- Pet is deleted successfully

### TC-PET-12
**Title:** Delete pet (not found)
**Description:** Verify error is returned when deleting a non-existent pet.
**Preconditions:**
- API is available
**Test Steps:**
1. Send DELETE request to /pet/{petId} with non-existent ID
2. Verify response status is 404
3. Verify error message indicates pet not found
**Expected Result:**
- Error response indicating pet not found

### TC-PET-13
**Title:** Upload image for pet
**Description:** Verify an image can be uploaded for a pet.
**Preconditions:**
- Pet exists in the store
**Test Steps:**
1. Prepare image file and metadata
2. Send POST request to /pet/{petId}/uploadImage with file and metadata
3. Verify response status is 200
4. Verify response contains upload confirmation
**Expected Result:**
- Image is uploaded and confirmation is returned


---

## Integration, Data Chaining, System, Rate Limiting, and E2E Test Cases


---

## Integration, Data Chaining, System, Rate Limiting, and E2E Test Cases

### TC-PET-INT-01
**Title:** Create pet and place order (integration)
**Description:** Verify a pet can be created and then ordered.
**Preconditions:**
- API is available
**Test Steps:**
1. Create a new pet (POST /pet)
2. Place an order for the pet (POST /store/order)
3. Verify order is placed for the created pet
**Expected Result:**
- Pet is created and can be ordered immediately

### TC-PET-CHAIN-01
**Title:** Pet lifecycle (data chaining)
**Description:** Verify pet creation, retrieval, update, and deletion in sequence.
**Preconditions:**
- API is available
**Test Steps:**
1. Create a new pet (POST /pet)
2. Get pet by ID (GET /pet/{petId})
3. Update pet (PUT /pet)
4. Delete pet (DELETE /pet/{petId})
5. Try to get pet again (GET /pet/{petId})
**Expected Result:**
- Pet is created, updated, deleted, and not found after deletion

### TC-PET-SYS-01
**Title:** Concurrent pet creation (system/load)
**Description:** Verify system can handle 100 concurrent pet creations.
**Preconditions:**
- API is available
**Test Steps:**
1. Prepare 100 unique pet data entries
2. Send 100 POST requests to /pet concurrently
3. Verify all pets are created
**Expected Result:**
- System handles concurrent pet creation without errors

### TC-PET-RATE-01
**Title:** Rate limiting on pet creation
**Description:** Verify API enforces rate limiting on pet creation.
**Preconditions:**
- API has rate limiting enabled
**Test Steps:**
1. Send rapid POST requests to /pet exceeding rate limit
2. Monitor response status codes
3. Verify 429 responses are received after threshold
**Expected Result:**
- API returns 429 Too Many Requests after rate limit is exceeded

### TC-PET-E2E-01
**Title:** Pet full workflow (end-to-end)
**Description:** Verify complete pet workflow from creation to deletion.
**Preconditions:**
- API is available
**Test Steps:**
1. Create a new pet (POST /pet)
2. Update pet (PUT /pet)
3. Upload image (POST /pet/{petId}/uploadImage)
4. Delete pet (DELETE /pet/{petId})
**Expected Result:**
- Pet can be created, updated, image uploaded, and deleted successfully
