@isTest
public class ContactControllerTest {
	@testSetup
    public static void createAccount(){
        Account acc = new Account(name='Test Account',Institution__c='Public School',BillingCity='NY');
        insert acc;
    }
    @isTest
    public static void findRecordsTest(){
        List<sobject> accList = ContactController.findRecords('Test','Account',new List<String>{'Public School'});
        System.assertEquals(accList.size(),1);
    }
    @isTest
    public static void createRecordsTest(){
        Contact con = new Contact(LastName='Test');
        ContactController.createRecords(con);
        Integer count = [Select count() from contact];
        System.assertEquals(count,1);
    }
    @isTest
    public static void getInstitutionCitiesTest(){
        List<String> cities = ContactController.getInstitutionCities();
        System.assertEquals(cities.size(),1);
    }
}