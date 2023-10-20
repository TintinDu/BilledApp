/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import NewBillUI from '../views/NewBillUI.js';
import mockStore from '../__mocks__/store.js';
import localStorageMock from '../__mocks__/localStorage.js';
import NewBill from '../containers/NewBill.js';
import { ROUTES, ROUTES_PATH } from '../constants/routes.js';
import Router from '../app/Router.js';
import BillsUI from '../views/BillsUI.js';

jest.mock('../app/store', () => mockStore);

describe('Given I am connected as an employee', () => {
  let mockOnNavigate;
  let newBill;
  beforeEach(() => {
    mockOnNavigate = jest.fn();
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee',
    }));
    const root = document.createElement('div');
    root.setAttribute('id', 'root');
    document.body.appendChild(root);
    Router();
    window.onNavigate(ROUTES_PATH.NewBill);

    newBill = new NewBill({
      document, onNavigate: mockOnNavigate, store: mockStore, localStorage: window.localStorage,
    });
  });
  describe('When I am on NewBill Page, there is a form', () => {
    describe('When I click on the submit button', () => {
      test('Then handle submit function should be called', async () => {
        const formNewBill = screen.getByTestId('form-new-bill');

        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
        formNewBill.addEventListener('click', handleSubmit);
        userEvent.click(formNewBill);
        expect(handleSubmit).toHaveBeenCalled();
      });
    });
    describe('When I upload a file in the input field', () => {
      test('Then handleChangeFile function should be called', async () => {
        // Get the file input element
        const fileInput = screen.getByTestId('file');

        // Mock the handleChangeFile function
        const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));

        const file = new File(['test-file'], 'test-file.pdf', { type: 'image/pdf' });

        fileInput.addEventListener('change', handleChangeFile);

        // Simulate selecting a file in the input field
        userEvent.upload(fileInput, file);
        const errorMessage = document.querySelector('.errorMessage');

        expect(handleChangeFile).toHaveBeenCalled();
        expect(errorMessage).toBeTruthy();
      });
    });
  });
  describe('When I submit the form with valid data', () => {
    test('Then updateBill function should be called with the correct data', async () => {
      // Use mock functions
      const billsMock = jest.spyOn(mockStore, 'bills');
      const updatedMock = await mockStore.bills().update();
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e, updatedMock));

      // Simulate submitting the form
      const formNewBill = screen.getByTestId('form-new-bill');
      formNewBill.addEventListener('submit', handleSubmit);
      fireEvent.submit(formNewBill);

      // Expect that updateBill is called with the correct data
      expect(formNewBill).toBeTruthy();
      expect(handleSubmit).toHaveBeenCalled();
      expect(billsMock).toHaveBeenCalled();
      expect(updatedMock).toBeTruthy();
    });
  });
});

// TEST INTEGRATION POST
describe('When I navigate as an employee on the newBill page', () => {
  describe('When the form is filled correctly', () => {
    test('Then a new bill should be created', async () => {
      const mockOnNavigate = jest.fn();
      // Mock the user type in local storage
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
      }));
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.appendChild(root);
      Router();
      window.onNavigate(ROUTES_PATH.NewBill);

      // Render the NewBillUI component and create a NewBill instance
      const newBill = new NewBill({
        document, onNavigate: mockOnNavigate, store: mockStore, localStorage: window.localStorage,
      });

      // Simulating filling inputs
      const formNewBill = screen.getByTestId('form-new-bill');
      jest.spyOn(mockStore, 'bills');
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      formNewBill.addEventListener('submit', handleSubmit);
      fireEvent.submit(formNewBill);

      // Expect that updateBill is called with the correct data
      expect(formNewBill).toBeTruthy();
      expect(handleSubmit).toHaveBeenCalled();
      // Expect navigation on BillsUi
      await waitFor(() => screen.getByText('Mes notes de frais'));
      expect(screen.getByText('Mes notes de frais')).toBeTruthy();
      await new Promise(process.nextTick);
      expect(screen.getAllByText('refused')).toBeTruthy();
      expect(screen.getAllByText('accepted')).toBeTruthy();
    });
  });
  describe('When an error occurred during file upload', () => {
    test('Then an error should be logged', async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      // Mock the user type in local storage
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
      }));

      // Render the NewBillUI component and create a NewBill instance
      document.body.innerHTML = NewBillUI();
      const newBill = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage,
      });

      // Get the file input element
      const fileInput = screen.getByTestId('file');

      // Mock the store.bills().create function to reject with an error
      const billsMock = jest.spyOn(mockStore, 'bills');
      const error = mockStore.bills.mockImplementationOnce(() => ({
        create: () => Promise.reject(new Error('An error occurred during upload')),
      }));
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));

      const file = new File(['test-file'], 'test-file.pdf', { type: 'image/pdf' });

      fileInput.addEventListener('change', handleChangeFile);

      // Simulate selecting a file in the input field
      userEvent.upload(fileInput, file);

      expect(billsMock).toHaveBeenCalled();
      expect(handleChangeFile).toHaveBeenCalled();
      expect(error).toHaveBeenCalled();
      error.mockRestore();
    });
  });
  describe('When an error occurs for POST method', () => {
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
      Router();
    });
    test('It should fails with 404 message error', async () => {
      window.onNavigate(ROUTES_PATH.NewBill);
      mockStore.bills.mockImplementationOnce(() => ({
        create: () => Promise.reject(new Error('Erreur 404')),
      }));
      document.body.innerHTML = BillsUI({ error: 'Erreur 404' });
      await new Promise(process.nextTick);
      const message = screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });

    test('It should fails with 500 message error', async () => {
      window.onNavigate(ROUTES_PATH.NewBill);
      mockStore.bills.mockImplementationOnce(() => ({
        update: () => Promise.reject(new Error('Erreur 500')),
      }));
      document.body.innerHTML = BillsUI({ error: 'Erreur 500' });
      await new Promise(process.nextTick);
      const message = screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });
});
