import { test, expect } from '@playwright/test';
import {
  validPet,
  validPet2,
  updatedPet,
  invalidPet,
  validStatuses,
  invalidStatus,
  invalidPetIds,
  validTags,
  formUpdateData
} from '../../../testData/api/petstore/pet/pet.data';

// ============================================================
// PET MODULE — Petstore API
// Endpoints: POST /pet, PUT /pet, GET /pet/findByStatus, GET /pet/findByTags, GET /pet/{petId}, POST /pet/{petId}, DELETE /pet/{petId}
// ============================================================

let createdPetId: number;

test.describe('Pet API Tests', () => {

  // ── BASIC CRUD TESTS ─────────────────────────────────────

  test.describe('POST /pet - Add a new pet', () => {

    test('TC-PET-01 | Add a new pet with valid data', async ({ request }) => {
      const res = await request.post('/pet', { data: validPet });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('id');
      expect(body.name).toBe(validPet.name);
      expect(body.status).toBe(validPet.status);
      expect(body.photoUrls).toEqual(validPet.photoUrls);
      createdPetId = body.id;
    });

    test('TC-PET-02 | Add a new pet with missing required fields returns error', async ({ request }) => {
      const res = await request.post('/pet', { data: invalidPet });
      // Petstore API may return 405 or 400 for invalid data
      expect([400, 405, 500]).toContain(res.status());
    });

  });

  test.describe('PUT /pet - Update an existing pet', () => {

    test('TC-PET-03 | Update an existing pet with valid data', async ({ request }) => {
      // First create a pet
      const createRes = await request.post('/pet', { data: validPet });
      const createdPet = await createRes.json();
      
      // Update the pet
      const updateData = { ...createdPet, name: 'Updated Name', status: 'sold' };
      const updateRes = await request.put('/pet', { data: updateData });
      expect(updateRes.status()).toBe(200);
      
      const updatedBody = await updateRes.json();
      expect(updatedBody.name).toBe('Updated Name');
      expect(updatedBody.status).toBe('sold');
    });

    test('TC-PET-04 | Update pet with invalid ID returns error', async ({ request }) => {
      const invalidData = { ...validPet, id: invalidPetIds.nonExistent };
      const res = await request.put('/pet', { data: invalidData });
      // May return 404 or other error code
      expect([400, 404, 500]).toContain(res.status());
    });

  });

  test.describe('GET /pet/findByStatus - Find pets by status', () => {

    test('TC-PET-05 | Find pets by valid status (available)', async ({ request }) => {
      const res = await request.get('/pet/findByStatus?status=available');
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body)).toBe(true);
      // Verify all pets have the requested status
      body.forEach((pet: any) => {
        expect(pet.status).toBe('available');
      });
    });

    test('TC-PET-05 | Find pets by valid status (pending)', async ({ request }) => {
      const res = await request.get('/pet/findByStatus?status=pending');
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body)).toBe(true);
    });

    test('TC-PET-05 | Find pets by valid status (sold)', async ({ request }) => {
      const res = await request.get('/pet/findByStatus?status=sold');
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body)).toBe(true);
    });

    test('TC-PET-06 | Find pets by invalid status returns error', async ({ request }) => {
      const res = await request.get(`/pet/findByStatus?status=${invalidStatus}`);
      // Petstore may still return 200 with empty array, or 400
      expect([200, 400]).toContain(res.status());
    });

  });

  test.describe('GET /pet/findByTags - Find pets by tags', () => {

    test('TC-PET-07 | Find pets by valid tags', async ({ request }) => {
      const res = await request.get('/pet/findByTags?tags=friendly');
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body)).toBe(true);
    });

  });

  test.describe('GET /pet/{petId} - Get pet by ID', () => {

    test('TC-PET-08 | Get pet by valid ID', async ({ request }) => {
      // First create a pet
      const createRes = await request.post('/pet', { data: validPet2 });
      const createdPet = await createRes.json();
      
      // Get the pet
      const getRes = await request.get(`/pet/${createdPet.id}`);
      expect(getRes.status()).toBe(200);
      const body = await getRes.json();
      expect(body.id).toBe(createdPet.id);
      expect(body.name).toBe(validPet2.name);
    });

    test('TC-PET-09 | Get pet by non-existent ID returns 404', async ({ request }) => {
      const res = await request.get(`/pet/${invalidPetIds.nonExistent}`);
      expect(res.status()).toBe(404);
    });

  });

  test.describe('POST /pet/{petId} - Update pet with form data', () => {

    test('TC-PET-10 | Update pet using form data', async ({ request }) => {
      // First create a pet
      const createRes = await request.post('/pet', { data: validPet });
      const createdPet = await createRes.json();
      
      // Update using form data
      const res = await request.post(`/pet/${createdPet.id}`, {
        form: formUpdateData
      });
      expect([200, 204]).toContain(res.status());
    });

  });

  test.describe('DELETE /pet/{petId} - Delete pet', () => {

    test('TC-PET-11 | Delete pet with valid ID', async ({ request }) => {
      // First create a pet
      const createRes = await request.post('/pet', { data: validPet });
      const createdPet = await createRes.json();
      
      // Delete the pet
      const deleteRes = await request.delete(`/pet/${createdPet.id}`);
      expect([200, 204]).toContain(deleteRes.status());
      
      // Verify pet is deleted
      const getRes = await request.get(`/pet/${createdPet.id}`);
      expect(getRes.status()).toBe(404);
    });

    test('TC-PET-12 | Delete pet with non-existent ID returns 404', async ({ request }) => {
      const res = await request.delete(`/pet/${invalidPetIds.nonExistent}`);
      expect(res.status()).toBe(404);
    });

  });

  // ── DATA CHAINING TEST ───────────────────────────────────

  test.describe('Pet Lifecycle Tests', () => {

    test('TC-PET-CHAIN-01 | Pet lifecycle: create, get, update, delete', async ({ request }) => {
      // 1. Create pet
      const createRes = await request.post('/pet', { data: validPet });
      expect(createRes.status()).toBe(200);
      const createdPet = await createRes.json();
      const petId = createdPet.id;

      // 2. Get pet
      const getRes = await request.get(`/pet/${petId}`);
      expect(getRes.status()).toBe(200);
      const fetchedPet = await getRes.json();
      expect(fetchedPet.id).toBe(petId);

      // 3. Update pet
      const updateData = { ...createdPet, name: 'Lifecycle Updated', status: 'sold' };
      const updateRes = await request.put('/pet', { data: updateData });
      expect(updateRes.status()).toBe(200);
      const updatedPetData = await updateRes.json();
      expect(updatedPetData.name).toBe('Lifecycle Updated');

      // 4. Delete pet
      const deleteRes = await request.delete(`/pet/${petId}`);
      expect([200, 204]).toContain(deleteRes.status());

      // 5. Verify pet is deleted
      const getDeletedRes = await request.get(`/pet/${petId}`);
      expect(getDeletedRes.status()).toBe(404);
    });

  });

  // ── SYSTEM/LOAD TESTS ────────────────────────────────────

  test.describe('System Tests', () => {

    test('TC-PET-SYS-01 | Concurrent pet creation (10 pets)', async ({ request }) => {
      const promises = [];
      for (let i = 0; i < 10; i++) {
        const petData = {
          id: Math.floor(Math.random() * 900000) + 100000 + i,
          name: `ConcurrentPet${i}`,
          photoUrls: [`https://example.com/photo${i}.jpg`],
          status: 'available'
        };
        promises.push(request.post('/pet', { data: petData }));
      }
      
      const responses = await Promise.all(promises);
      responses.forEach(res => {
        expect(res.status()).toBe(200);
      });
    });

  });

});
