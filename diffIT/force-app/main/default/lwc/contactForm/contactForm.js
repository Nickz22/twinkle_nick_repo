import { LightningElement, track, api, wire } from "lwc";
import createRecord from "@salesforce/apex/ContactFormController.createContactRecord";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { NavigationMixin } from "lightning/navigation";
import IMAGE from "@salesforce/resourceUrl/DiffIt_Logo";
import RequestQouteLabel from "@salesforce/label/c.Request_Quote_Heading";
import { getConstants } from "./util";
import getZipCodeCoordinates from "@salesforce/apex/ContactFormController.getZipCodeCoordinates";
import { getPicklistValues } from "lightning/uiObjectInfoApi";
import ROLE_FIELD from "@salesforce/schema/Contact.Role__c";
import REGION_FIELD from "@salesforce/schema/Contact.Region__c";

const CONSTANTS = getConstants();

export default class ContactForm extends NavigationMixin(LightningElement) {
  label = {
    RequestQouteLabel
  };
  _schoolRadioValue;
  constants = CONSTANTS;
  companyLogo = IMAGE;
  formValues = {};
  showEnrollment = false;
  showPurchaseOptions = false;
  purchaseType;
  selectedRegion;
  zipResponse;
  @track zipCode;
  @track accountName;
  @track accountRecordId;
  @track disableSchoolList = true;
  @track cityOptions = [];
  @track institutions = [];
  @track selectedCity;
  @track roleOptions;
  @track regionOptions;

  @track isOtherRoleSelected = false;
  @wire(getPicklistValues, { recordTypeId: "012000000000000AAA", fieldApiName: ROLE_FIELD })
  roleResult({ data }) {
    if(data){
      this.roleOptions = [];
      data.values.forEach((element)=>{
        this.roleOptions.push({label:element.label, value:element.value});
      });
    }
  }
  @wire(getPicklistValues, { recordTypeId: "012000000000000AAA", fieldApiName: REGION_FIELD })
  results({ data }) {
    if(data){
      this.regionOptions = [];
      data.values.forEach((element)=>{
        this.regionOptions.push({label:element.label, value:element.value});
      });
    }
  }


  @api
  get schoolRadioValue() {
    return this._schoolRadioValue;
  }
  set schoolRadioValue(value) {
    this._schoolRadioValue = value;
    this.validateForm();
  }
  get schoolOptions() {
    return [
      { label: CONSTANTS.SCHOOL, value: CONSTANTS.SCHOOL },
      { label: CONSTANTS.DISTRICT, value: CONSTANTS.DISTRICT }
    ];
  }

  get purchaseOptions() {
    return [
      { label: CONSTANTS.ENTIRE_DISTRICT, value: CONSTANTS.ENTIRE_DISTRICT },
      { label: CONSTANTS.CERTAIN_SCHOOL, value: CONSTANTS.CERTAIN_SCHOOL }
    ];
  }
  get lookupLabel() {
    return this.isSingleSchool
      ? CONSTANTS.SEARCH_SCHOOL
      : CONSTANTS.SEARCH_DISTRICT;
  }
  get isSingleSchoolSelected() {
    return this.isSingleSchool && !this.accountRecordId;
  }

  get isSingleSchool() {
    return this.schoolRadioValue === CONSTANTS.SCHOOL;
  }
  get checkForMultipleSchool() {
    return this.schoolRadioValue === CONSTANTS.DISTRICT;
  }
  get showLookup() {
    return this.isSingleSchool || this.checkForMultipleSchool;
  }
  get showSchoolsCount() {
    return this.purchaseType === CONSTANTS.CERTAIN_SCHOOL;
  }
  get isRegionInternational() {
    return this.selectedRegion === CONSTANTS.INTERNATIONAL;
  }
  onAccountSelection(event) {
    this.accountName = event.detail.selectedValue;
    this.accountRecordId = event.detail.selectedRecordId;
    this.formValues[CONSTANTS.ACCOUNT_ID] = this.accountRecordId;
    this.showPurchaseOptions = this.checkForMultipleSchool ? true : false;
    if(this.accountRecordId){
      this.showEnrollment = false;
    }
  }
  connectedCallback() {
    this.schoolRadioValue = CONSTANTS.SCHOOL;
  }
  validateForm() {
    this.showEnrollment = false;
    this.showPurchaseOptions = false;
    if (this.schoolRadioValue == CONSTANTS.SCHOOL) {
      this.institutions = [
        CONSTANTS.PUBLIC_SCHOOL,
        CONSTANTS.CHARTER_SCHOOL,
        CONSTANTS.PRIVATE_SCHOOL
      ];
    } else {
      this.institutions = [CONSTANTS.PUBLIC_DISTRICT];
    }
    this.template.querySelector("c-lwc-lookup")?.clearSelection();
  }
  handleSchoolEnrollment(evt) {
    this.showEnrollment = true;
  }
  async saveLead() {
    try {
      const inputValues = this.template.querySelectorAll(".form-element");
      inputValues.forEach((element) => {
        const label = element.name;
        const value = element.value;
        this.formValues[label] = value;
      });
      await createRecord({ contactRecord: this.formValues });
      const event = new ShowToastEvent({
        title: "Success",
        message: "Record created successfully!",
        variant: "success"
      });
      this.dispatchEvent(event);
      window.location.reload();
    } catch (ex) {
      console.error(ex);
    }
  }
  navigateToSite() {
    const config = {
      type: "standard__webPage",
      attributes: {
        url: "https://web.diffit.me/"
      }
    };
    this[NavigationMixin.Navigate](config);
  }
  handleChange(event) {
    switch (event.target.name) {
      case CONSTANTS.PURCHASE:
        this.purchaseType = event.target.value;
        break;
      case CONSTANTS.REGION_API:
        this.selectedRegion = event.target.value;
        break;
      case CONSTANTS.CONTRACT_TYPE:
        this.schoolRadioValue = event.target.value;
        this.isSingleSchool ? this.template.querySelector('c-lwc-lookup')?.classList.add('disabled') : this.template.querySelector('c-lwc-lookup')?.classList.remove('disabled');
        this.validateForm();
        break;
      case CONSTANTS.ROLE_API:
        this.isOtherRoleSelected = (event.target.value === CONSTANTS.OTHER);
      default:
        break;
    }
  }

  async validateZipChange(event) {
    this.zipCode = event.target.value;
    this.template.querySelector('c-lwc-lookup').clearSelection();
    if(/^(\d{5})$/.test(this.zipCode)){
      this.template.querySelector('c-lwc-lookup').classList.remove('disabled');
       this.zipResponse = await getZipCodeCoordinates({zipCode:this.zipCode});
    }else{
      this.template.querySelector('c-lwc-lookup').classList.add('disabled');
    }
  }
}