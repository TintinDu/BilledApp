/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/dom';
import NewBillUI from '../views/NewBillUI.js';

describe('Given I am connected as an employee', () => {
  describe('When I am on NewBill Page', () => {
    test('Then new bill form should appear', () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
    });
  });

  // test('fetches bills from an API and fails with 404 message error', async () => {
  //   mockStore.bills.mockImplementationOnce(() => ({
  //     list: () => Promise.reject(new Error('Erreur 404')),
  //   }));
  //   window.onNavigate(ROUTES_PATH.Dashboard);
  //   await new Promise(process.nextTick);
  //   const message = await screen.getByText(/Erreur 404/);
  //   expect(message).toBeTruthy();
  // });

  // test('fetches messages from an API and fails with 500 message error', async () => {
  //   mockStore.bills.mockImplementationOnce(() => ({
  //     list: () => Promise.reject(new Error('Erreur 500')),
  //   }));

  //   window.onNavigate(ROUTES_PATH.Dashboard);
  //   await new Promise(process.nextTick);
  //   const message = await screen.getByText(/Erreur 500/);
  //   expect(message).toBeTruthy();
  // });
});
