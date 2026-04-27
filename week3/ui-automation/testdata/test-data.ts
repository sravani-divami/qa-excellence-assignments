/** Shared test data used across spec files. */

export interface BillingData {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  address2?: string;
  country: string;
  city: string;
  zip: string;
}

export interface PaymentData {
  nameOnCard: string;
  cardNumber: string;
  expiration: string;
  cvv: string;
}

export const VALID_BILLING: BillingData = {
    firstName: 'Alice',
    lastName:  'Brown',
    email:     'alice@test.com',
    address:   '12 High Street',
    address2:  '',
    country:   'United Kingdom',
    city:      'Bristol',
    zip:       'BS1 4UP',
};

export const VALID_PAYMENT: PaymentData = {
    nameOnCard:  'Alice Brown',
    cardNumber:  '4111111111111111',
    expiration:  '12/2030',
    cvv:         '123',
};

export const VALID_LOGIN = {
    email:    'oneorder@sweetshop.local',
    password: 'qwerty',
};

/** Valid promo code recognized by the Sweet Shop app. */
export const PROMO_VALID   = 'SWEETSHOP';
/** Invalid promo code that should show an error. */
export const PROMO_INVALID = 'INVALID999';

/** Product names available on the Sweets page (all 16, per Spec §4.2.3). */
export const ALL_PRODUCTS = [
    'Chocolate Cups',      // £1.00
    'Sherbert Straws',     // £0.75
    'Sherbet Discs',       // £0.95  (data-name="Sherbet Discs", card title="Sherbert Discs")
    'Bon Bons',            // £1.00
    'Jellies',             // £0.75
    'Fruit Salads',        // £0.50
    'Bubble Gums',         // £0.25
    'Wham Bars',           // £0.15
    'Whistles',            // £0.25
    'Sherbert Fountains',  // £0.35
    'Swansea Mixture',     // £1.50
    'Chocolate Beans',     // £0.80
    'Nerds',               // £0.60
    'Drumsticks',          // £0.20
    'Bubbly',              // £0.10
    'Dolly Mixture',       // £0.90
    // Total (1 of each): £10.05
];
