// ============================================================
// Pet Test Data — Petstore API
// File: testData/api/petstore/pet/pet.data.ts
// ============================================================

export interface Pet {
  id?: number;
  name: string;
  photoUrls: string[];
  status: string;
  category?: {
    id: number;
    name: string;
  };
  tags?: Array<{
    id: number;
    name: string;
  }>;
}

// Valid pet data
export const validPet: Pet = {
  id: Math.floor(Math.random() * 900000) + 100000,
  name: 'Fluffy',
  photoUrls: ['https://example.com/photo1.jpg'],
  status: 'available',
  category: {
    id: 1,
    name: 'Dogs'
  },
  tags: [
    {
      id: 1,
      name: 'friendly'
    }
  ]
};

export const validPet2: Pet = {
  id: Math.floor(Math.random() * 900000) + 100000,
  name: 'Max',
  photoUrls: ['https://example.com/photo2.jpg'],
  status: 'pending',
  category: {
    id: 2,
    name: 'Cats'
  }
};

export const updatedPet: Pet = {
  id: validPet.id,
  name: 'Fluffy Updated',
  photoUrls: ['https://example.com/photo1-updated.jpg'],
  status: 'sold',
  category: {
    id: 1,
    name: 'Dogs'
  },
  tags: [
    {
      id: 1,
      name: 'friendly'
    },
    {
      id: 2,
      name: 'trained'
    }
  ]
};

// Invalid pet data (missing required fields)
export const invalidPet = {
  id: Math.floor(Math.random() * 900000) + 100000,
  // missing name and photoUrls
  status: 'available'
};

// Pet statuses
export const validStatuses = ['available', 'pending', 'sold'];
export const invalidStatus = 'invalid-status';

// Invalid pet IDs
export const invalidPetIds = {
  nonExistent: 999999999,
  zero: 0,
  negative: -1,
  invalid: 'abc'
};

// Tags for search
export const validTags = ['friendly', 'trained', 'vaccinated'];

// Form data for update
export const formUpdateData = {
  name: 'Updated via Form',
  status: 'sold'
};
