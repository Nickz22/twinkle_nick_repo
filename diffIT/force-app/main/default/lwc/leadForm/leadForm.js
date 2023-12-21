import { LightningElement, track } from 'lwc';
import createRecords from "@salesforce/apex/LeadController.createRecords";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class LeadForm extends LightningElement {
  @track accountName;
  @track accountRecordId;
  @track disableSchoolList = true;
  formValues = {}
  @track zipCode;

  schoolRadioValue = '';

  get options() {
    return [
      { label: 'One School', value: 'One School' },
      { label: 'Multiple School', value: 'Multiple School' },
    ];
  }

  get checkForSchool() {
    return this.schoolRadioValue == 'One School';
  }

  onAccountSelection(event) {
    this.accountName = event.detail.selectedValue;
    this.accountRecordId = event.detail.selectedRecordId;
    this.formValues['Account'] = this.accountRecordId;
  }

  handleSchoolChange(evt) {
    this.schoolRadioValue = evt.target.value;
    console.log(this.schoolRadioValue);
  }

  validateZipChange(evt) {
    this.zipCode = evt.target.value;
    let pattern = /[0-9]{5}/g;
    if(this.zipCode.match(pattern)){
      this.template.querySelector('c-lwc-lookup').classList.remove('disabled');
    }
  }

  handleSave() {
    const inputValues = this.template.querySelectorAll('lightning-input');
    inputValues.forEach(element => {
      const label = element.label;
      const value = element.value;
      this.formValues[label] = value;
    })
    createRecords({ leadRecord: this.formValues }).then((result) => {
      const event = new ShowToastEvent({
            title: 'Success',
            message:
                'Record created successfully!',
            variant : 'success'
        });
        this.dispatchEvent(event);
    })
  }
}