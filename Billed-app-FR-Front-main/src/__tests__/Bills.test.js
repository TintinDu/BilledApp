/**
 * @jest-environment jsdom
 */
/* eslint-env jquery */
import userEvent from '@testing-library/user-event';
import $ from 'jquery'; // Import jQuery

import { screen, waitFor } from '@testing-library/dom';
import BillsUI from '../views/BillsUI.js';
import { bills } from '../fixtures/bills.js';
import { ROUTES_PATH, ROUTES } from '../constants/routes.js';
import '@testing-library/jest-dom/extend-expect';
import router from '../app/Router.js';
import Bills from '../containers/Bills.js';
import { formatDate, formatStatus } from '../app/format.js';

import localStorageMock from '../__mocks__/localStorage.js';

describe('Given I am connected as an employee', () => {
  describe('When I am on Bills Page', () => {
    test('Then bill icon in vertical layout should be highlighted', async () => {
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
        }),
      );
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId('icon-window'));
      const windowIcon = screen.getByTestId('icon-window');
      expect(windowIcon).toHaveClass('active-icon');
    });
    test('Then bills should be ordered from earliest to latest', () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i,
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
    test('Then iconsEye should appear for each Bills which have supported format file', () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const iconsEye = screen.getAllByTestId('icon-eye');
      expect(iconsEye).toBeTruthy();
    });
    describe('When I click on an iconEye', () => {
      test('Then modal should show', async () => {
        // Mock the jQuery modal function
        $.fn.modal = jest.fn();
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        document.body.innerHTML = BillsUI({ data: bills });
        const billsContainer = new Bills({
          document,
          onNavigate,
          store: null,
          bills,
          localStorage: window.localStorage,
        });
        const iconsEye = screen.getAllByTestId('icon-eye');

        iconsEye.forEach((iconEye) => {
          iconEye.addEventListener('click', billsContainer.handleClickIconEye(iconEye));
        });

        const modal = document.getElementById('modaleFile');
        expect(modal).toBeInTheDocument();

        const modalBody = document.querySelector('.modal-body');
        expect(modalBody).toBeTruthy();

        await waitFor(() => {
          expect($.fn.modal).toHaveBeenCalledWith('show');
        });
      });
    });

    describe('When I click on newBillButton', () => {
      test('Then newBillPage function should be called', async () => {
        const onNavigate = jest.fn(); // Mock the onNavigate function
        document.body.innerHTML = BillsUI({ data: bills });
        const billsContainer = new Bills({
          document,
          onNavigate,
          store: null,
          bills,
          localStorage: window.localStorage,
        });
        const newBillBtn = screen.getByTestId('btn-new-bill');

        newBillBtn.addEventListener('click', billsContainer.handleClickNewBill());

        userEvent.click(newBillBtn);

        // Check if onNavigate was called with the expected route
        expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH.NewBill);
      });
    });
    describe('getBills', () => {
      test('should fetch and format bills', async () => {
        const mockStore = {
          bills: jest.fn().mockReturnThis(), // Mock the bills method
          // Mock the list method and resolve with your test bills data
          list: jest.fn().mockResolvedValue(bills),
        };

        const billsContainer = new Bills({
          document,
          onNavigate: jest.fn(),
          store: mockStore, // Use the mock store
          bills: null, // Set bills to null to trigger fetching from the mock store
          localStorage: window.localStorage,
        });

        const formattedBills = await billsContainer.getBills();

        // Check that the list method of the mock store was called
        expect(mockStore.list).toHaveBeenCalled();

        // Check that the bills were formatted correctly
        expect(formattedBills).toEqual(bills.map((bill) => ({
          date: formatDate(bill.date),
          status: formatStatus(bill.status),
          ...bill,
        })));
      });

      test('should handle error in case of data corruption', async () => {
        const corruptedBills = [
          // Create corrupted data here as needed for testing
        ];

        const mockStore = {
          bills: jest.fn().mockReturnThis(),
          list: jest.fn().mockResolvedValue(corruptedBills),
        };

        const billsContainer = new Bills({
          document,
          onNavigate: jest.fn(),
          store: mockStore,
          bills: null,
          localStorage: window.localStorage,
        });

        const formattedBills = await billsContainer.getBills();

        // Check that the list method of the mock store was called
        expect(mockStore.list).toHaveBeenCalled();

        // Check that the function handled data corruption and returned the data without formatting
        expect(formattedBills).toEqual(corruptedBills);
      });
    });
  });
});
