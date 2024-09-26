export class ProductHelper {
    constructor(urlHelper, http, bapiHelper, assertionsHelper) {
        this.urlHelper = urlHelper;
        this.http = http;
        this.bapiHelper = bapiHelper;
        this.assertionsHelper = assertionsHelper;
    }

    getNeverOutStockProductSkus(limit = 10) {
        const params = this.bapiHelper.getParamsWithAuthorization();
        const availabilitiesResponse = this.http.sendGetRequest(
            this.http.url`${this.urlHelper.getBackendApiBaseUrl()}/dynamic-entity/availabilities?filter[availability.is_never_out_of_stock]=1&page[offset]=0&page[limit]=${limit}`,
            params,
            false
        );

        this.assertionsHelper.assertResponseStatus(availabilitiesResponse, 200, 'Get Availabilities');

        return JSON.parse(availabilitiesResponse.body).map(availability => availability.sku);
    }
}