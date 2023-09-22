/* eslint-env jquery */
import DashboardFormUI from '../views/DashboardFormUI.js';
import BigBilledIcon from '../assets/svg/big_billed.js';
import { ROUTES_PATH } from '../constants/routes.js';
import Logout from './Logout.js';
import { filterBills, cards, getStatus } from './BillUtils.js';

export default class {
  constructor({
    document, onNavigate, store, bills, localStorage,
  }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    $('#arrow-icon1').click((e) => this.handleShowTickets(e, bills, 1));
    $('#arrow-icon2').click((e) => this.handleShowTickets(e, bills, 2));
    $('#arrow-icon3').click((e) => this.handleShowTickets(e, bills, 3));
    new Logout({ localStorage, onNavigate });
  }

  handleClickIconEye = () => {
    const billUrl = $('#icon-eye-d').attr('data-bill-url');
    const imgWidth = Math.floor($('#modaleFileAdmin1').width() * 0.8);
    $('#modaleFileAdmin1').find('.modal-body').html(`<div style='text-align: center;'><img width=${imgWidth} src=${billUrl} alt="Bill"/></div>`);
    if (typeof $('#modaleFileAdmin1').modal === 'function') $('#modaleFileAdmin1').modal('show');
  };

  handleEditTicket(e, bill, bills) {
    if (this.counter === undefined || this.id !== bill.id) this.counter = 0;
    if (this.id === undefined || this.id !== bill.id) this.id = bill.id;
    if (this.counter % 2 === 0) {
      bills.forEach((b) => {
        $(`#open-bill${b.id}`).css({ background: '#0D5AE5' });
      });
      $(`#open-bill${bill.id}`).css({ background: '#2A2B35' });
      $('.dashboard-right-container div').html(DashboardFormUI(bill));
      $('.vertical-navbar').css({ height: '150vh' });
      this.counter++;
    } else {
      $(`#open-bill${bill.id}`).css({ background: '#0D5AE5' });

      $('.dashboard-right-container div').html(`
        <div id="big-billed-icon" data-testid="big-billed-icon"> ${BigBilledIcon} </div>
      `);
      $('.vertical-navbar').css({ height: '120vh' });
      this.counter++;
    }
    $('#icon-eye-d').click(this.handleClickIconEye);
    $('#btn-accept-bill').click((e) => this.handleAcceptSubmit(e, bill));
    $('#btn-refuse-bill').click((e) => this.handleRefuseSubmit(e, bill));
  }

  handleAcceptSubmit = (e, bill) => {
    const newBill = {
      ...bill,
      status: 'accepted',
      commentAdmin: $('#commentary2').val(),
    };
    this.updateBill(newBill);
    this.onNavigate(ROUTES_PATH.Dashboard);
  };

  handleRefuseSubmit = (e, bill) => {
    const newBill = {
      ...bill,
      status: 'refused',
      commentAdmin: $('#commentary2').val(),
    };
    this.updateBill(newBill);
    this.onNavigate(ROUTES_PATH.Dashboard);
  };

  handleShowTickets(e, bills, index) {
    if (this.counter === undefined || this.index !== index) this.counter = 0;
    if (this.index === undefined || this.index !== index) this.index = index;
    if (this.counter % 2 === 0) {
      $(`#arrow-icon${this.index}`).css({ transform: 'rotate(0deg)' });
      $(`#status-bills-container${this.index}`)
        .html(cards(filterBills(bills, getStatus(this.index))));
      this.counter++;
    } else {
      $(`#arrow-icon${this.index}`).css({ transform: 'rotate(90deg)' });
      $(`#status-bills-container${this.index}`)
        .html('');
      this.counter++;
    }

    bills.forEach((bill) => {
      $(`#open-bill${bill.id}`).click((e) => this.handleEditTicket(e, bill, bills));
      // remove any existing click event handlers ensures one click event handler for each element
      $(`#open-bill${bill.id}`).off('click').on('click', (e) => this.handleEditTicket(e, bill, bills));
    });

    return bills;
  }

  getBillsAllUsers = () => {
    if (this.store) {
      return this.store
        .bills()
        .list()
        .then((snapshot) => {
          const bills = snapshot
            .map((doc) => ({
              id: doc.id,
              ...doc,
              date: doc.date,
              status: doc.status,
            }));
          return bills;
        })
        .catch((error) => {
          throw error;
        });
    }
  };

  // not need to cover this function by tests
  /* istanbul ignore next */
  updateBill = (bill) => {
    if (this.store) {
      return this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: bill.id })
        .then((stringifiedBill) => stringifiedBill)
        .catch(console.log);
    }
  };
}
