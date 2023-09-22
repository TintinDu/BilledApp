import USERS_TEST from '../constants/usersTest.js';
import { formatDate } from '../app/format.js';

export const filterBills = (data, status) => ((data && data.length)
  ? data.filter((bill) => {
    let selectCondition;

    // in jest environment
    if (typeof jest !== 'undefined') {
      selectCondition = (bill.status === status);
      /* istanbul ignore next */
    } else {
      // in prod environment
      const userEmail = JSON.parse(localStorage.getItem('user')).email;
      selectCondition = (bill.status === status)
          && ![...USERS_TEST, userEmail].includes(bill.email);
    }

    return selectCondition;
  }) : []);

const card = (bill) => {
  const firstAndLastNames = bill.email.split('@')[0];
  const firstName = firstAndLastNames.includes('.')
    ? firstAndLastNames.split('.')[0] : '';
  const lastName = firstAndLastNames.includes('.')
    ? firstAndLastNames.split('.')[1] : firstAndLastNames;

  return (`
      <div class='bill-card' id='open-bill${bill.id}' data-testid='open-bill${bill.id}'>
        <div class='bill-card-name-container'>
          <div class='bill-card-name'> ${firstName} ${lastName} </div>
          <span class='bill-card-grey'> ... </span>
        </div>
        <div class='name-price-container'>
          <span> ${bill.name} </span>
          <span> ${bill.amount} € </span>
        </div>
        <div class='date-type-container'>
          <span> ${formatDate(bill.date)} </span>
          <span> ${bill.type} </span>
        </div>
      </div>
    `);
};

export const cards = (bills) => (bills && bills.length ? bills.map((bill) => card(bill)).join('') : '');

export const getStatus = (index) => {
  switch (index) {
    case 1:
      return 'pending';
    case 2:
      return 'accepted';
    case 3:
      return 'refused';
    default:
      return 'pending';
  }
};
