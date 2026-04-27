// utils.ts
// Utility functions for test data and helpers

export const users = [
  { username: 'standard_user', password: 'secret_sauce' },
  { username: 'locked_out_user', password: 'secret_sauce' },
  { username: 'problem_user', password: 'secret_sauce' },
  { username: 'performance_glitch_user', password: 'secret_sauce' }
];

export function randomString(length = 8) {
  return Math.random().toString(36).substring(2, 2 + length);
}

// Utility helpers for DRY test setup flows
import { LoginPage } from './pages/LoginPage';
import { InventoryPage } from './pages/InventoryPage';
import { CartPage } from './pages/CartPage';
import { CheckoutStepOnePage } from './pages/CheckoutStepOnePage';
import { CheckoutStepTwoPage } from './pages/CheckoutStepTwoPage';
import { MenuPage } from './pages/MenuPage';

export async function loginAs(page, username, password) {
  const login = new LoginPage(page);
  await login.goto();
  await login.login(username, password);
}

export async function goToCheckoutStepOne(page) {
  await loginAs(page, 'standard_user', 'secret_sauce');
  const inventory = new InventoryPage(page);
  await inventory.addToCartByName('Sauce Labs Backpack');
  await inventory.openCart();
  const cart = new CartPage(page);
  await cart.checkout();
}

export async function goToCheckoutStepTwo(page, validData = { first: 'John', last: 'Doe', zip: '12345' }) {
  await goToCheckoutStepOne(page);
  const checkout1 = new CheckoutStepOnePage(page);
  await checkout1.fillForm(validData.first, validData.last, validData.zip);
  await checkout1.continue();
}

export async function goToCheckoutComplete(page, validData = { first: 'John', last: 'Doe', zip: '12345' }) {
  await goToCheckoutStepTwo(page, validData);
  const checkout2 = new CheckoutStepTwoPage(page);
  await checkout2.finish();
}

export async function openMenu(page) {
  await loginAs(page, 'standard_user', 'secret_sauce');
  const menu = new MenuPage(page);
  await menu.open();
  return menu;
}
