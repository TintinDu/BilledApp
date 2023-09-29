/**
 * @jest-environment jsdom
 */
/* eslint-env jquery */
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/dom';
import mockStore from '../__mocks__/store.js';
import BillsUI from '../views/BillsUI.js';
import { bills } from '../fixtures/bills.js';
import { ROUTES_PATH, ROUTES } from '../constants/routes.js';
import '@testing-library/jest-dom/extend-expect';
import router from '../app/Router.js';
import Bills from '../containers/Bills.js';

import localStorageMock from '../__mocks__/localStorage.js';

jest.mock('../app/store', () => jest.requireActual('../__mocks__/store.js').default);

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
  });
});

// test d'intégration GET
describe('Given I am a user connected as employee', () => {
  describe('When I go to the Bills screen', () => {
    test('Then it should fetch bills from mock API GET', async () => {
      // clearing HTML before integration test
      document.body.innerHTML = '';

      localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: 'a@a' }));
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByText('Mes notes de frais'));

      const kindHeader = await screen.getByText('Type');
      expect(kindHeader).toBeTruthy();

      const date = await screen.getByText('2001-01-01');
      expect(date).toBeTruthy();

      expect(screen.getAllByTestId('icon-eye')).toBeTruthy();
    });

    describe('When an error occurs on API', () => {
      beforeEach(() => {
        jest.spyOn(mockStore, 'bills');
        Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock },
        );
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
          email: 'a@a',
        }));
        const root = document.createElement('div');
        root.setAttribute('id', 'root');
        document.body.appendChild(root);
        router();
      });
      test('Then it should fetch bills from an API and fails with 404 message error', async () => {
        mockStore.bills.mockImplementationOnce(() => ({
          list: () => Promise.reject(new Error('Erreur 404')),
        }));
        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });

      test('Then it should fetch bills from an API and fails with 500 message error', async () => {
        mockStore.bills.mockImplementationOnce(() => ({
          list: () => Promise.reject(new Error('Erreur 500')),
        }));

        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
  });
});
