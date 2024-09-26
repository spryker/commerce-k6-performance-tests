import { AbstractScenario } from '../../../../abstract-scenario.js';
import { group } from 'k6';

export class SharedProductDetailPageScenario extends AbstractScenario {
    execute() {
        this.storefrontHelper.loginUser();

        let self = this;

        group('ProductDetailPage', function () {
            const productDetailPageResponse = self.http.sendGetRequest(self.http.url`${self.getStorefrontBaseUrl()}/en/stapelstuhl-mit-geschlossenem-ruecken-M83`);
            self.assertionsHelper.assertResponseStatus(productDetailPageResponse, 200);
            self.assertionsHelper.assertResponseContainsText(productDetailPageResponse, '<span itemprop="sku">657712</span>');
        });
    }
}
