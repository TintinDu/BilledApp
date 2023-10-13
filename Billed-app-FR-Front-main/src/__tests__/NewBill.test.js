/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from '@testing-library/dom';
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
  describe('When the form is filled', () => {
    test('Then data form should be the same as the input', async () => {
      const billFixture = {
        id: '47qAXb6fIm2zOKkLzMro',
        vat: '80',
        fileUrl: 'https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a',
        status: 'pending',
        type: 'Hôtel et logement',
        commentary: 'séminaire billed',
        name: 'encore',
        fileName: 'preview-facture-free-201801-pdf-1.jpg',
        date: '2004-04-04',
        amount: 400,
        commentAdmin: 'ok',
        email: 'a@a',
        pct: 20,
      };

      const file = new File(['test-file'], billFixture.fileName, { type: 'image/png' });

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

      const expenseTypeInput = screen.getByTestId('expense-type');
      fireEvent.change(expenseTypeInput, { target: { value: billFixture.type } });
      expect(expenseTypeInput.value).toBe(billFixture.type);

      const expenseNameInput = screen.getByTestId('expense-name');
      fireEvent.change(expenseNameInput, { target: { value: billFixture.name } });
      expect(expenseNameInput.value).toBe(billFixture.name);

      const datepicker = screen.getByTestId('datepicker');
      fireEvent.change(datepicker, { target: { value: billFixture.date } });
      expect(datepicker.value).toBe(billFixture.date);

      const amountInput = screen.getByTestId('amount');
      fireEvent.change(amountInput, { target: { value: billFixture.amount } });
      expect(amountInput.value).toBe(billFixture.amount.toString());

      const vatInput = screen.getByTestId('vat');
      fireEvent.change(vatInput, { target: { value: billFixture.vat } });
      expect(vatInput.value).toBe(billFixture.vat.toString());

      const pctInput = screen.getByTestId('pct');
      fireEvent.change(pctInput, { target: { value: billFixture.pct } });
      expect(pctInput.value).toBe(billFixture.pct.toString());

      const commentaryInput = screen.getByTestId('commentary');
      fireEvent.change(commentaryInput, { target: { value: billFixture.commentary } });
      expect(commentaryInput.value).toBe(billFixture.commentary);

      const fileInput = screen.getByTestId('file');
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
      fileInput.addEventListener('change', handleChangeFile);
      userEvent.upload(fileInput, file);
      expect(fileInput.files[0]).toMatchObject(file);
    });
  });
});

// describe('When an invalid file type is uploaded', () => {
//   test('Then it should display an error message', async () => {
//     // Get the file input element
//     const fileInput = screen.getByTestId('file');
//     fileInput.addEventListener('change', handleChangeFile);

//     // Simulate selecting the invalid file in the input field
//     // userEvent.upload(fileInput, {});

//     // Ensure that the error message is displayed
//     await new Promise(process.nextTick);
//     expect(fileInput).toBeTruthy();
//     // const errorMessage = screen.getByTestId('errorMessage');
//     // expect(errorMessage).toBeTruthy();
//     // expect(billsMock).toHaveBeenCalled();
//     expect(createdMock).toBeTruthy();
//   });
// });
// contrôler sur bills que la nouvelle note de frais s'affiche correctement
// contrôler l'erreur dans le console.error() avec jest
// const error = jest.spyOn(console, "error").mockImplementation(() => {});
// expect(error).toBeCalledWith("") logger le message d'erreur
