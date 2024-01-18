public class AccountService {
	public static List<String> getInstitutionCities(){
        List<String> cities = new List<String>();
        for(AggregateResult ar : [SELECT BillingCity FROM Account GROUP BY BillingCity]){
            cities.add((String)ar.get('BillingCity'));
        }
        return cities;
    }
}