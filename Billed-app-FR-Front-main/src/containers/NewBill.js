import { ROUTES_PATH } from '../constants/routes.js';
import Logout from './Logout.js';

export default class NewBill {
  constructor({
    document, onNavigate, store, localStorage,
  }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    const formNewBill = this.document.querySelector('form[data-testid="form-new-bill"]');
    formNewBill.addEventListener('submit', this.handleSubmit);
    const file = this.document.querySelector('input[data-testid="file"]');
    file.addEventListener('change', this.handleChangeFile);
    this.fileUrl = null;
    this.fileName = null;
    this.billId = null;
    new Logout({ document, localStorage, onNavigate });
  }

  handleChangeFile = (e) => {
    e.preventDefault();
    const inputFile = this.document.querySelector('input[data-testid="file"]');
    const file = inputFile.files[0];
    const filePath = e.target.value.split(/\\/g);
    const fileName = filePath[filePath.length - 1];
    const formData = new FormData();
    const { email } = JSON.parse(localStorage.getItem('user'));
    formData.append('file', file);
    formData.append('email', email);

    let fileExtension = filePath[filePath.length - 1].split('.');
    fileExtension = fileExtension[fileExtension.length - 1];

    let errorMessage;
    // On vérifie que le fichier correspond au format attendu
    if (!['jpeg', 'jpg', 'png'].includes(fileExtension)) {
      inputFile.value = null;
      // On vérifie que le message d'erreur n'est pas déjà présent
      if (!this.document.querySelector('.errorMessage')) {
        errorMessage = this.document.createElement('p');
        errorMessage.innerText = 'Seulement les fichiers de type jpeg, jpg ou png sont acceptés';
        errorMessage.className = 'errorMessage';
        errorMessage.setAttribute('data-testid', 'errorMessage');
        inputFile.closest('div').appendChild(errorMessage);
      }
      // On cache le message d'erreur si le format du fichier est le bon et qu'un message d'erreur existait auparavant
    } else if (this.document.querySelector('.errorMessage')) {
      this.document.querySelector('.errorMessage').className = 'errorMessage hidden';
    }
    // vérifier le texte de l'erreur dans le test, faire le plus simple possible, utiliser data-testid
    this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true,
        },
      })
      .then(({ fileUrl, key }) => {
        this.billId = key;
        this.fileUrl = fileUrl;
        this.fileName = fileName;
      }).catch((error) => console.error(error));
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { email } = JSON.parse(localStorage.getItem('user'));
    const bill = {
      email,
      type: e.target.querySelector('select[data-testid="expense-type"]').value,
      name: e.target.querySelector('input[data-testid="expense-name"]').value,
      amount: parseInt(e.target.querySelector('input[data-testid="amount"]').value),
      date: e.target.querySelector('input[data-testid="datepicker"]').value,
      vat: e.target.querySelector('input[data-testid="vat"]').value,
      pct: parseInt(e.target.querySelector('input[data-testid="pct"]').value) || 20,
      commentary: e.target.querySelector('textarea[data-testid="commentary"]').value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending',
    };
    this.updateBill(bill);
    this.onNavigate(ROUTES_PATH.Bills);
  };

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: this.billId })
        .then(() => {
          this.onNavigate(ROUTES_PATH.Bills);
        })
        .catch((error) => console.error(error));
    }
  };
}
