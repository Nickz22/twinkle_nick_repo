import { LightningElement, track } from 'lwc';
import createRecord from "@salesforce/apex/ContactFormController.createContactRecord";
import getInstitutionCities from "@salesforce/apex/ContactFormController.getInstitutionCities";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from "lightning/navigation";
import IMAGE from "@salesforce/resourceUrl/DiffIt_Logo";
import RequestQouteLabel from '@salesforce/label/c.Request_Quote_Heading';
import {getConstants} from './util';

const CONSTANTS = getConstants();

export default class ContactForm  extends NavigationMixin( LightningElement) {

  label = {
    RequestQouteLabel
  };

  constants = CONSTANTS;
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
      { label: CONSTANTS.ONE_SCHOOL, value: CONSTANTS.ONE_SCHOOL },
      { label: CONSTANTS.MULTIPLE_SCHOOLS, value: CONSTANTS.MULTIPLE_SCHOOLS },
    ];
  }
  get purchaseOptions() {
    return [
      { label: CONSTANTS.ENTIRE_DISTRICT, value:CONSTANTS.ENTIRE_DISTRICT  },
      { label: CONSTANTS.CERTAIN_SCHOOL, value: CONSTANTS.CERTAIN_SCHOOL },
    ];
  }
  get lookupLabel() {
    return (this.isSingleSchool) ? CONSTANTS.SEARCH_SCHOOL : CONSTANTS.SEARCH_DISTRICT;
  }
  get isSingleSchoolSelected(){
    return this.isSingleSchool && !this.accountRecordId;
  }

  get isSingleSchool() {
    return this.schoolRadioValue === CONSTANTS.ONE_SCHOOL;
  }
  get checkForMultipleSchool() {
    return this.schoolRadioValue === CONSTANTS.MULTIPLE_SCHOOLS;
  }
  get showLookup() {
    return this.isSingleSchool || this.checkForMultipleSchool;
  }
  get showSchoolsCount(){
    return this.purchaseType == CONSTANTS.CERTAIN_SCHOOL;
  }
  onAccountSelection(event) {
    this.accountName = event.detail.selectedValue;
    this.accountRecordId = event.detail.selectedRecordId;
    this.formValues[CONSTANTS.ACCOUNT_ID] = this.accountRecordId;
    this.showPurchaseOptions = (this.checkForMultipleSchool) ? true : false;

  }

  handleSchoolChange(evt) {
    this.schoolRadioValue = evt.target.value;
    this.showEnrollment = false;
    this.showPurchaseOptions = false;
    if (this.schoolRadioValue == CONSTANTS.ONE_SCHOOL) {
      if (this.cityOptions.length == 0) {
        this.getCities();
      }
      this.institutions = [CONSTANTS.PUBLIC_SCHOOL, CONSTANTS.CHARTER_SCHOOL, CONSTANTS.PRIVATE_SCHOOL];
    } else {
      this.institutions = [CONSTANTS.PUBLIC_DISTRICT];
    }
    this.formValues = {};
    this.formValues[CONSTANTS.CONTRACT_TYPE] = this.schoolRadioValue;
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
    createRecord({ contactRecord: this.formValues }).then((result) => {
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
    this.formValues[CONSTANTS.MAILING_CITY] = this.selectedCity;
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