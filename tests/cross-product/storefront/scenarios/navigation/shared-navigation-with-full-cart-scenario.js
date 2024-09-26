import { AbstractScenario } from '../../../../abstract-scenario.js';
import { group } from 'k6';

export class SharedNavigationWithFullCartScenario extends AbstractScenario {
    execute() {
        this.cartHelper.haveCartWithProducts(0);
        this.storefrontHelper.loginUser();

        let self = this;

        group('Navigation', function () {
            self.quickOrderPage();
            self.cartPage();
            self.homePage();
            self.productDetailPage();
            self.productSearchPage();
        });
    }

    quickOrderPage() {
        //quick order page
        const quickOrderPageResponse = this.http.sendGetRequest(this.http.url`${this.getStorefrontBaseUrl()}/en/quick-order`);
        this.assertionsHelper.assertResponseStatus(quickOrderPageResponse, 200);
        this.assertionsHelper.assertResponseContainsText(quickOrderPageResponse, '<h1 class="page-info__title title title--h3 ">Quick Order</h1>');

        // add articles form submit
        const verifyArticlesResponse = this.http.submitForm(quickOrderPageResponse, {
            formSelector: 'form[name="quick_order_form"]',
            submitSelector: 'button[name="textOrder"]',
            fields: {
                'text_order_form[textOrder]': this._getProductSkus(),
            },
        });
        this.assertionsHelper.assertResponseStatus(verifyArticlesResponse, 200);

        //add to cart form submit
        const idQuote = verifyArticlesResponse.html().find('select[name="id_quote"] > option:nth-child(1)').val();
        const addToCartResponse = this.http.submitForm(verifyArticlesResponse, {
            formSelector: 'form[name="quick_order_form"]',
            submitSelector: 'button[name="addToCart"]',
            fields: {
                'id_quote': idQuote,
            },
        });
        this.assertionsHelper.assertResponseStatus(addToCartResponse, 302);
    }

    cartPage() {
        const cartPageResponse = this.http.sendGetRequest(this.http.url`${this.getStorefrontBaseUrl()}/en/cart`, {
            params: {
                'headers': {
                    'Cookie': 'XDEBUG_SESSION=XDEBUG_ECLIPSE'
                },
            },
        });

        this.assertionsHelper.assertResponseStatus(cartPageResponse, 200);
        this.assertionsHelper.assertResponseContainsText(cartPageResponse, '70 Items');
    }

    homePage() {
        const homePageResponse = this.http.sendGetRequest(this.http.url`${this.getStorefrontBaseUrl()}`);

        this.assertionsHelper.assertResponseStatus(homePageResponse, 200);
    }

    productDetailPage() {
        const productDetailPageResponse = this.http.sendGetRequest(this.http.url`${this.getStorefrontBaseUrl()}/en/stapelstuhl-mit-geschlossenem-ruecken-M83`);

        this.assertionsHelper.assertResponseStatus(productDetailPageResponse, 200);
        this.assertionsHelper.assertResponseContainsText(productDetailPageResponse, '<span itemprop="sku">657712</span>');
    }

    productSearchPage() {
        const searchPageResponse = this.http.sendGetRequest(this.getStorefrontBaseUrl() + '/search?q=657712');

        this.assertionsHelper.assertResponseStatus(searchPageResponse, 200);
        this.assertionsHelper.assertResponseContainsText(searchPageResponse, 'FRIWA stackable chair');
    }

    _getProductSkus() {
        return '424463,1\n' +
            '103905,1\n' +
            '573330,1\n' +
            '508165,1\n' +
            '425078,1\n' +
            '102938,1\n' +
            '421322,1\n' +
            '575284,1\n' +
            '102972,1\n' +
            '104445,1\n' +
            '621614,1\n' +
            '107315,1\n' +
            '108298,1\n' +
            '107310,1\n' +
            '422855,1\n' +
            '420562,1\n' +
            '404108,1\n' +
            '101007,1\n' +
            '421324,1\n' +
            '107061,1\n' +
            '100666,1\n' +
            '104190,1\n' +
            '575191,1\n' +
            '107396,1\n' +
            '501000,1\n' +
            '419880,1\n' +
            '421339,1\n' +
            '573880,1\n' +
            '574603,1\n' +
            '424606,1\n' +
            '419780,1\n' +
            '414098,1\n' +
            '102939,1\n' +
            '421340,1\n' +
            '419873,1\n' +
            '420691,1\n' +
            '575191,1\n' +
            '419897,1\n' +
            '573872,1\n' +
            '422721,1\n' +
            '102924,1\n' +
            '573880,1\n' +
            '100430,1\n' +
            '107254,1\n' +
            '421346,1\n' +
            '100414,1\n' +
            '419905,1\n' +
            '411653,1\n' +
            '425074,1\n' +
            '544183,1\n' +
            '657712,1\n' +
            '424551,1\n' +
            '100682,1\n' +
            '102918,1\n' +
            '408104,1\n' +
            '419780,1\n' +
            '107311,1\n' +
            '212440,1\n' +
            '421245,1\n' +
            '101560,1\n' +
            '102918,1\n' +
            '506719,1\n' +
            '425140,1\n' +
            '464000,1\n' +
            '102775,1\n' +
            '107287,1\n' +
            '103740,1\n' +
            '502173,1\n' +
            '421534,1\n' +
            '413852,1\n';
    }
}
