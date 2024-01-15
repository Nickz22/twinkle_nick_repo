public class ContactController { 
    @AuraEnabled(cacheable=false)  
    public static List<sobject> findRecords(String searchKey, String objectName, List<String> institutions) {  
        string searchText = '\'%' + String.escapeSingleQuotes(searchKey) + '%\'';  
        System.debug('institutions'+institutions);
        string query = 'SELECT Id, Name FROM ' +objectName+ ' WHERE Name LIKE '+searchText + ' AND Institution__c IN :institutions LIMIT 6';  
        return Database.query(query);  
    }
    
    @AuraEnabled(cacheable=false)  
    public static void createRecords(Contact contactRecord) {  
        insert contactRecord;
    }
    @AuraEnabled
    public static List<String> getInstitutionCities(){
        List<String> cities = new List<String>();
        for(AggregateResult ar : [SELECT BillingCity FROM Account GROUP BY BillingCity]){
            cities.add((String)ar.get('BillingCity'));
        }
        return cities;
    }
}