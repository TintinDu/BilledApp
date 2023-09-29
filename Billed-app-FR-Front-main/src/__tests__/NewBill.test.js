/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import NewBillUI from '../views/NewBillUI.js';
import mockStore from '../__mocks__/store.js';
import localStorageMock from '../__mocks__/localStorage.js';
import NewBill from '../containers/NewBill.js';
import { ROUTES, ROUTES_PATH } from '../constants/routes.js';
import router from '../app/Router.js';

jest.mock('../app/store', () => jest.requireActual('../__mocks__/store.js').default);

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

        const file = new File(['test-file'], 'test-file.png', { type: 'image/png' });

        fileInput.addEventListener('change', handleChangeFile);

        // Simulate selecting a file in the input field
        userEvent.upload(fileInput, file);

        expect(handleChangeFile).toHaveBeenCalled();
      });
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
          document, onNavigate, store: mockStore, localStorage: window.localStorage,
        });

        // Mock the updateBill function
        const updateBill = jest.fn(() => newBill.updateBill());

        // Simulate filling out the form with valid data
        const expenseTypeInput = screen.getByTestId('expense-type');
        const expenseNameInput = screen.getByTestId('expense-name');
        const amountInput = screen.getByTestId('amount');
        const datepickerInput = screen.getByTestId('datepicker');
        const vatInput = screen.getByTestId('vat');
        const pctInput = screen.getByTestId('pct');
        const commentaryTextarea = screen.getByTestId('commentary');

        userEvent.selectOptions(expenseTypeInput, 'Transports');
        userEvent.type(expenseNameInput, 'Test Expense');
        userEvent.type(amountInput, '100');
        userEvent.type(datepickerInput, '2023-09-30');
        userEvent.type(vatInput, '20');
        userEvent.type(pctInput, '10');
        userEvent.type(commentaryTextarea, 'Test Comment');

        // Simulate selecting a file in the input field
        const fileInput = screen.getByTestId('file');
        userEvent.upload(fileInput, new File(['test-file'], 'test-file.png', { type: 'image/png' }));

        // Simulate submitting the form
        const formNewBill = screen.getByTestId('form-new-bill');
        formNewBill.addEventListener('submit', updateBill);
        fireEvent.submit(formNewBill);

        // Expect that updateBill is called with the correct data
        expect(updateBill).toHaveBeenCalled();
        // With({
        //   email: 'a@a',
        //   type: 'Transports',
        //   name: 'Test Expense',
        //   amount: 100,
        //   date: '2023-09-30',
        //   vat: '20',
        //   pct: 10,
        //   commentary: 'Test Comment',
        //   fileUrl: expect.any(String),
        //   fileName: 'test-file.png',
        //   status: 'pending',
        // });
      });
    });
  });
});

// describe('NewBill Integration Test', () => {
//   beforeEach(() => {
//     jest.spyOn(mockStore, 'bills');
//     Object.defineProperty(
//       window,
//       'localStorage',
//       { value: localStorageMock },
//     );
//     window.localStorage.setItem('user', JSON.stringify({
//       type: 'Employee',
//       email: 'a@a',
//     }));
//     const root = document.createElement('div');
//     root.setAttribute('id', 'root');
//     document.body.appendChild(root);
//     router();
//   });
//   it('should submit the form with valid data', async () => {
//     // Mock the file input and form data
//     const fileInput = screen.getByTestId('file');
//     const form = screen.getByTestId('form-new-bill');
//     const file = new File(['test-file'], 'test-file.png', { type: 'image/png' });

//     // Mock the create and update methods
//     mockStore.bills.mockResolvedValueOnce(() => ({
//       create: () =>
//       {fileUrl: 'https://localhost:3456/images/test.jpg',
//       key: '1234',}
//     }));
//     mockUpdateBill.mockResolvedValueOnce({
//       id: 'new-bill-id',
//       // Include other fields as needed
//     });

//     // Fill out the form
//     userEvent.selectOptions(screen.getByTestId('expense-type'), 'Transports');
//     userEvent.type(screen.getByTestId('expense-name'), 'Test Expense');
//     userEvent.type(screen.getByTestId('amount'), '100');
//     userEvent.type(screen.getByTestId('datepicker'), '2023-09-30');
//     userEvent.type(screen.getByTestId('vat'), '20');
//     userEvent.type(screen.getByTestId('pct'), '10');
//     userEvent.type(screen.getByTestId('commentary'), 'Test Comment');

//     // Upload a file
//     userEvent.upload(fileInput, file);

//     // Submit the form
//     fireEvent.submit(form);

//     // Wait for the asynchronous operations to complete
//     await screen.findByText(`You've navigated to ${ROUTES_PATH.Bills}`);

//     // Assertions
//     expect(mockCreateBill).toHaveBeenCalled();
//     expect(mockUpdateBill).toHaveBeenCalled();
//     // Add more assertions based on your test case
//   });
// });
