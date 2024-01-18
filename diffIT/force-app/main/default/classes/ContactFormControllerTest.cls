@isTest
public class ContactFormControllerTest {
    public static string institution = Account.Institution__c.getDescribe().getPicklistValues()[0].getValue();
	@testSetup
    public static void createAccount(){
        Account acc = new Account(name='Test Account',Institution__c=institution,BillingCity='NY');
        insert acc;
    }
    @isTest
    public static void findRecordsTest(){
        List<sobject> accList = ContactFormController.findRecords('Test','Account',new List<String>{institution});
        Assert.areEqual(1,accList.size());
    }
    @isTest
    public static void createRecordsTest(){
        Contact con = new Contact(LastName='Test');
        ContactFormController.createContactRecord(con);
        Integer count = [Select count() from contact];
        Assert.areEqual(1,count);
    }
    @isTest
    public static void getInstitutionCitiesTest(){
        List<String> cities = ContactFormController.getInstitutionCities();
        Assert.areEqual(1,cities.size());
    }
}