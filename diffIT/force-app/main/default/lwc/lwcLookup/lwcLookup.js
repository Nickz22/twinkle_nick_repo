import { LightningElement, track, wire, api } from "lwc";  
import findRecords from "@salesforce/apex/ContactController.findRecords";
export default class LwcLookup extends LightningElement {
  @track recordsList;   
  @track searchKey = "";  
  @api selectedValue;  
  @api selectedRecordId;  
  @api objectApiName;  
  @api iconName;
  @api disable;  
  @api lookupLabel;  
  @track message;  
  @api institutions;
    
  onLeave(event) {  
   setTimeout(() => {  
    this.searchKey = "";  
    this.recordsList = null;  
   }, 300);  
  }  

  @api
  clearSelection(){
    console.log("selected Value",this.selectedValue);
    this.selectedRecordId = "";
    this.selectedValue = "";
    this.searchKey = "";  
  }
    
  onRecordSelection(event) {  
   this.selectedRecordId = event.target.dataset.key;  
   this.selectedValue = event.target.dataset.name;  
   this.searchKey = "";  
   this.onSeletedRecordUpdate();  
  }  
   
  handleKeyChange(event) {  
   const searchKey = event.target.value;
   if(searchKey.length>=3){
       this.searchKey = searchKey;  
       this.getLookupResult();  
   } 
  }  
   
  removeRecordOnLookup(event) {  
   this.searchKey = "";  
   this.selectedValue = null;  
   this.selectedRecordId = null;  
   this.recordsList = null;  
   this.onSeletedRecordUpdate();  
 }  

  getLookupResult() {  
    console.log('institutions'+this.institutions);
    console.log('type',typeof this.institutions);

   findRecords({ searchKey: this.searchKey, objectName : this.objectApiName, institutions : this.institutions })  
    .then((result) => {  
     if (result.length===0) {  
       this.recordsList = [];  
       this.message = "No Records Found";  
      } else {  
       this.recordsList = result;  
       this.message = "";  
      }  
      this.error = undefined;  
    })  
    .catch((error) => {  
     this.error = error;  
     this.recordsList = undefined;  
    });  
  }  
   
  onSeletedRecordUpdate(){
    console.log("record selected")  
   const passEventr = new CustomEvent('recordselection', {  
     detail: { selectedRecordId: this.selectedRecordId, selectedValue: this.selectedValue }  
    });  
    this.dispatchEvent(passEventr);  
  } 
}