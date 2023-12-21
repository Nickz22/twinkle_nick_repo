public class LeadController { 
   @AuraEnabled(cacheable=true)  
   public static List<sobject> findRecords(String searchKey, String objectName, String zipCode) {  
     string searchText = '\'%' + String.escapeSingleQuotes(searchKey) + '%\'';  
     string query = 'SELECT Id, Name FROM ' +objectName+ ' WHERE Name LIKE '+searchText + ' AND BillingPostalCode = \''+ zipCode +'\' LIMIT 6';  
     return Database.query(query);  
   }
    
   @AuraEnabled(cacheable=false)  
   public static void createRecords(LeadWrapper leadRecord) {  
     insert new Lead(LastName = leadRecord.Name, School__c = leadRecord.Account, Company = 'Test Company', Email = leadRecord.Email);
   }
   
    public class LeadWrapper{
        @AuraEnabled
        public String Name{get;set;}
        @AuraEnabled
        public String Account{get;set;}
        @AuraEnabled
        public String Email{get;set;}
    }
}