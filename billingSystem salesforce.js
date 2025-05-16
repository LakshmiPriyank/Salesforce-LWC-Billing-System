
import { LightningElement, track } from 'lwc';

export default class BillingSystem extends LightningElement {
  @track customerName = '';
  @track email = '';
  @track phone = '';
  @track billingMode = 'Without GST';
  @track products = [];

  gstOptions = [
    { label: 'With GST', value: 'With GST' },
    { label: 'Without GST', value: 'Without GST' }
  ];

  handleChange(event) {
    const field = event.target.dataset.id;
    this[field] = event.target.value;
  }

  handleGstToggle(event) {
    this.billingMode = event.detail.value;
  }

  handleScanProduct() {
    // TODO: Add QR logic
    alert('QR Scanner feature not implemented yet.');
  }

  handleAddProduct() {
    // TODO: Open modal or input for manual add
    alert('Manual add not implemented yet.');
  }

  handleSave() {
    // TODO: Call Apex to save
    alert('Saving...');
  }

  handleCancel() {
    this.customerName = '';
    this.email = '';
    this.phone = '';
    this.products = [];
    this.billingMode = 'Without GST';
  }

  get columns() {
    return [
      { label: 'Product Name', fieldName: 'name' },
      { label: 'Quantity', fieldName: 'quantity', editable: true },
      { label: 'Unit Price', fieldName: 'price' },
      { label: 'GST Applicable', fieldName: 'gstApplicable' }
    ];
  }
}
import saveBillingData from '@salesforce/apex/BillingController.saveBillingData';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

handleSave() {
    if (!this.email || !this.phone || !this.customerName || this.products.length === 0) {
        this.dispatchEvent(new ShowToastEvent({
            title: 'Error',
            message: 'Please fill all customer fields and add at least one product.',
            variant: 'error'
        }));
        return;
    }

    const productList = this.products.map(prod => ({
        productId: prod.id,
        quantity: prod.quantity,
        gstApplicable: prod.gstApplicable
    }));

    saveBillingData({
        name: this.customerName,
        email: this.email,
        phone: this.phone,
        billingMode: this.billingMode,
        productList: productList,
        priceBookName: 'Retail' // or 'Wholesale' as per your toggle
    })
    .then(result => {
        this.dispatchEvent(new ShowToastEvent({
            title: 'Success',
            message: 'Invoice saved successfully!',
            variant: 'success'
        }));
        window.open('/apex/InvoicePDF?id=' + result, '_blank'); // Visualforce page to generate PDF
        this.handleCancel(); // Clear the form
    })
    .catch(error => {
        console.error(error);
        this.dispatchEvent(new ShowToastEvent({
            title: 'Error',
            message: error.body.message,
            variant: 'error'
        }));
    });
}
