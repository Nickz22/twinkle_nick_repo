import { LightningElement, track } from 'lwc';
import createRecords from "@salesforce/apex/ContactController.createRecords";
import getInstitutionCities from "@salesforce/apex/ContactController.getInstitutionCities";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from "lightning/navigation";
import IMAGE from "@salesforce/resourceUrl/DiffIt_Logo";

export default class ContactForm  extends NavigationMixin( LightningElement) {
  companyLogo = IMAGE;
  @track accountName;
  @track accountRecordId;
  @track disableSchoolList = true;
  formValues = {}
  @track zipCode;
  showEnrollment = false;
  showPurchaseOptions = false;
  schoolRadioValue = '';
  @track cityOptions = [];
  @track institutions = [];
  @track selectedCity;
  purchaseType;

  get schoolOptions() {
    return [
      { label: 'One School', value: 'One School' },
      { label: 'Multiple Schools', value: 'Multiple Schools' },
    ];
  }
  get purchaseOptions() {
    return [
      { label: 'Entire District', value: 'Entire District' },
      { label: 'Certain Schools', value: 'Certain Schools' },
    ];
  }
  get lookupLabel() {
    return (this.checkForOneSchool) ? 'Search School' : 'Search District';
  }
  get checkForSchoolEnrollment(){
    return this.checkForOneSchool && !this.accountRecordId;
  }

  get checkForOneSchool() {
    return this.schoolRadioValue === 'One School';
  }
  get checkForMultipleSchool() {
    return this.schoolRadioValue === 'Multiple Schools';
  }
  get showLookup() {
    return this.checkForOneSchool || this.checkForMultipleSchool;
  }
  get showSchoolsCount(){
    return this.purchaseType == 'Certain Schools';
  }
  onAccountSelection(event) {
    this.accountName = event.detail.selectedValue;
    this.accountRecordId = event.detail.selectedRecordId;
    this.formValues['AccountId'] = this.accountRecordId;
    this.showPurchaseOptions = (this.checkForMultipleSchool) ? true : false;

  }

  handleSchoolChange(evt) {
    this.schoolRadioValue = evt.target.value;
    this.showEnrollment = false;
    this.showPurchaseOptions = false;
    if (this.schoolRadioValue == 'One School') {
      if (this.cityOptions.length == 0) {
        this.getCities();
      }
      this.institutions = ['Public School', 'Charter School', 'Private School'];
    } else {
      this.institutions = ['Public District'];
    }
    this.formValues = {};
    this.formValues['Contract_Type__c'] = this.schoolRadioValue;
    this.template.querySelector('c-lwc-lookup').clearSelection();
  }

  handleSchoolEnrollment(evt) {
    this.showEnrollment = true;
  }


  saveLead() {
    const inputValues = this.template.querySelectorAll('lightning-input');
    inputValues.forEach(element => {
      const label = element.name;
      const value = element.value;
      this.formValues[label] = value;
    })
    createRecords({ contactRecord: this.formValues }).then((result) => {
      const event = new ShowToastEvent({
            title: 'Success',
            message:
                'Record created successfully!',
            variant : 'success'
        });
        this.dispatchEvent(event);
        window.location.reload();
    })
  }

  getCities() {
    getInstitutionCities().then((result) => {
      let cities = [];
      result.forEach((element) => {
        cities.push({ label: element, value: element });
      });
      this.cityOptions = JSON.parse(JSON.stringify(cities));
    });
  }

  handleCityChange(event) {
    this.selectedCity = event.target.value;
    this.formValues['MailingCity'] = this.selectedCity;
  }

  handlePurchaseChange(event){
    this.purchaseType = event.target.value;

  }
  navigateToSite(){
    const config = {
      type: 'standard__webPage',
      attributes: {
          url: 'https://web.diffit.me/'
      }
    };
    this[NavigationMixin.Navigate](config);
  }
}