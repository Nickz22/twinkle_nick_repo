public class ContactFormController { 
    @AuraEnabled(cacheable=false)  
    public static List<sobject> findRecords(String searchKey, String objectName, List<String> institutions) {  
        string searchText = '\'%' + String.escapeSingleQuotes(searchKey) + '%\'';  
        string query = 'SELECT Id, Name FROM ' +objectName+ ' WHERE Name LIKE '+searchText + ' AND Institution__c IN :institutions LIMIT 6';  
        return Database.query(query);  
    }
    
    @AuraEnabled(cacheable=false)  
    public static void createContactRecord(Contact contactRecord) {  
        ContactService.createRecord(contactRecord);
    }
    @AuraEnabled
    public static List<String> getInstitutionCities(){
        return AccountService.getInstitutionCities();
    }
}