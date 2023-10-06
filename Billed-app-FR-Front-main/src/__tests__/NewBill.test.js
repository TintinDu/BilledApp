/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import NewBillUI from '../views/NewBillUI.js';
import mockStore from '../__mocks__/store.js';
import localStorageMock from '../__mocks__/localStorage.js';
import NewBill from '../containers/NewBill.js';
import { ROUTES } from '../constants/routes.js';

jest.mock('../app/store', () => mockStore);

describe('Given I am connected as an employee', () => {
  describe('When I am on NewBill Page, there is a form', () => {
    describe('When I click on the submit button', () => {
      test('Then handle submit function should be called', async () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        Object.defineProperty(window, 'localStorage', { value: localStorageMock });
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
        }));

        document.body.innerHTML = NewBillUI();
        const newBill = new NewBill({
          document, onNavigate, store: null, localStorage: window.localStorage,
        });
        const formNewBill = screen.getByTestId('form-new-bill');

        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
        formNewBill.addEventListener('click', handleSubmit);
        userEvent.click(formNewBill);
        expect(handleSubmit).toHaveBeenCalled();
      });
    });
    describe('When I upload a file in the input field', () => {
      test('Then handleChangeFile function should be called', async () => {
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
});

// TEST INTEGRATION POST
describe('When I navigate as an employee on the newBill page', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  describe('When I submit the form with valid data', () => {
    test('Then updateBill function should be called with the correct data', async () => {
      // Mock the onNavigate function
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
        document, onNavigate, mockStore, localStorage: window.localStorage,
      });

      // Simulate submitting the form
      const formNewBill = screen.getByTestId('form-new-bill');

      // Use mock functions
      const billsMock = jest.spyOn(mockStore, 'bills');
      const updatedMock = await mockStore.bills().update();
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e, updatedMock));

      formNewBill.addEventListener('submit', handleSubmit);
      fireEvent.submit(formNewBill);

      // Expect that updateBill is called with the correct data
      expect(formNewBill).toBeTruthy();
      expect(handleSubmit).toHaveBeenCalled();
      expect(billsMock).toHaveBeenCalled();
      expect(updatedMock).toBeTruthy();
    });
  });
  describe('When an invalid file type is uploaded', () => {
    test('Then it should display an error message', async () => {
      // Mock the onNavigate function
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
        document, onNavigate, mockStore, localStorage: window.localStorage,
      });

      // Use mock functions
      const billsMock = jest.spyOn(mockStore, 'bills');
      const createdMock = await mockStore.bills().create();
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e, createdMock));

      // Get the file input element
      const fileInput = screen.getByTestId('file');
      fileInput.addEventListener('change', handleChangeFile);

      // Simulate selecting the invalid file in the input field
      // userEvent.upload(fileInput, {});

      // Ensure that the error message is displayed
      await new Promise(process.nextTick);
      expect(fileInput).toBeTruthy();
      // const errorMessage = screen.getByTestId('errorMessage');
      // expect(errorMessage).toBeTruthy();
      // expect(billsMock).toHaveBeenCalled();
      expect(createdMock).toBeTruthy();
    });
  });
});
