import { test, expect } from '@playwright/test';
import { validPet } from '../../../testData/api/petstore/pet/pet.data';
import { validUser } from '../../../testData/api/petstore/user/user.data';
import { validOrder } from '../../../testData/api/petstore/store/store.data';

// ============================================================
// INTEGRATION TESTS — Petstore API
// Cross-module workflows and end-to-end scenarios
// ============================================================

test.describe('Integration Tests - Cross-Module', () => {

  test('TC-PET-INT-01 | Create pet and place order for it', async ({ request }) => {
    // 1. Create a pet
    const createPetRes = await request.post('/pet', { data: validPet });
    expect(createPetRes.status()).toBe(200);
    const createdPet = await createPetRes.json();

    // 2. Place an order for the created pet
    const orderData = { ...validOrder, petId: createdPet.id };
    const createOrderRes = await request.post('/store/order', { data: orderData });
    expect(createOrderRes.status()).toBe(200);
    const createdOrder = await createOrderRes.json();

    // 3. Verify order contains the correct petId
    expect(createdOrder.petId).toBe(createdPet.id);

    // 4. Verify we can retrieve the order
    const getOrderRes = await request.get(`/store/order/${createdOrder.id}`);
    expect(getOrderRes.status()).toBe(200);
  });

  test('TC-FULL-E2E-01 | Complete e-commerce flow: User creates account, searches pets, places order', async ({ request }) => {
    const uniqueUser = { ...validUser, username: `e2e_full_${Date.now()}` };

    // 1. Create user account
    const createUserRes = await request.post('/user', { data: uniqueUser });
    expect([200, 201]).toContain(createUserRes.status());

    // 2. Login user
    const loginRes = await request.get(`/user/login?username=${uniqueUser.username}&password=${uniqueUser.password}`);
    expect(loginRes.status()).toBe(200);

    // 3. Search for available pets
    const searchRes = await request.get('/pet/findByStatus?status=available');
    expect(searchRes.status()).toBe(200);
    const availablePets = await searchRes.json();
    expect(Array.isArray(availablePets)).toBe(true);

    // 4. Create a new pet if needed
    const createPetRes = await request.post('/pet', { data: validPet });
    const createdPet = await createPetRes.json();

    // 5. Place order for the pet
    const orderData = { ...validOrder, petId: createdPet.id };
    const createOrderRes = await request.post('/store/order', { data: orderData });
    expect(createOrderRes.status()).toBe(200);
    const createdOrder = await createOrderRes.json();

    // 6. Verify order details
    const getOrderRes = await request.get(`/store/order/${createdOrder.id}`);
    expect(getOrderRes.status()).toBe(200);
    const orderDetails = await getOrderRes.json();
    expect(orderDetails.petId).toBe(createdPet.id);

    // 7. Check inventory
    const inventoryRes = await request.get('/store/inventory');
    expect(inventoryRes.status()).toBe(200);

    // 8. Logout user
    const logoutRes = await request.get('/user/logout');
    expect(logoutRes.status()).toBe(200);
  });

  test('TC-MULTI-ORDER-01 | User places multiple orders for different pets', async ({ request }) => {
    const uniqueUser = { ...validUser, username: `multi_order_${Date.now()}` };

    // 1. Create user
    await request.post('/user', { data: uniqueUser });

    // 2. Create multiple pets
    const pet1Res = await request.post('/pet', { 
      data: { 
        id: Math.floor(Math.random() * 900000) + 100000,
        name: 'Pet1', 
        photoUrls: ['url1'], 
        status: 'available' 
      } 
    });
    const pet1 = await pet1Res.json();

    const pet2Res = await request.post('/pet', { 
      data: { 
        id: Math.floor(Math.random() * 900000) + 100000,
        name: 'Pet2', 
        photoUrls: ['url2'], 
        status: 'available' 
      } 
    });
    const pet2 = await pet2Res.json();

    // 3. Place orders for both pets
    const order1Data = { 
      id: Math.floor(Math.random() * 900000) + 100000,
      petId: pet1.id, 
      quantity: 1, 
      status: 'placed' 
    };
    const order1Res = await request.post('/store/order', { data: order1Data });
    expect(order1Res.status()).toBe(200);

    const order2Data = { 
      id: Math.floor(Math.random() * 900000) + 100000,
      petId: pet2.id, 
      quantity: 2, 
      status: 'placed' 
    };
    const order2Res = await request.post('/store/order', { data: order2Data });
    expect(order2Res.status()).toBe(200);

    // 4. Verify both orders
    const order1 = await order1Res.json();
    const order2 = await order2Res.json();

    const getOrder1 = await request.get(`/store/order/${order1.id}`);
    expect(getOrder1.status()).toBe(200);

    const getOrder2 = await request.get(`/store/order/${order2.id}`);
    expect(getOrder2.status()).toBe(200);
  });

  test('TC-PET-UPDATE-ORDER-01 | Update pet status after order is placed', async ({ request }) => {
    // 1. Create a pet
    const createPetRes = await request.post('/pet', { data: validPet });
    const createdPet = await createPetRes.json();

    // 2. Place order for the pet
    const orderData = { ...validOrder, petId: createdPet.id };
    const createOrderRes = await request.post('/store/order', { data: orderData });
    const createdOrder = await createOrderRes.json();

    // 3. Update pet status to 'sold'
    const updateData = { ...createdPet, status: 'sold' };
    const updateRes = await request.put('/pet', { data: updateData });
    expect(updateRes.status()).toBe(200);

    // 4. Verify pet status is updated
    const getPetRes = await request.get(`/pet/${createdPet.id}`);
    const updatedPet = await getPetRes.json();
    expect(updatedPet.status).toBe('sold');

    // 5. Verify order still exists
    const getOrderRes = await request.get(`/store/order/${createdOrder.id}`);
    expect(getOrderRes.status()).toBe(200);
  });

});
