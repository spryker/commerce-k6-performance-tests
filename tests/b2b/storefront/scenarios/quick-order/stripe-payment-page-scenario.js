import { StripeSharedCheckoutScenario } from '../../../../cross-product/storefront/scenarios/checkout/stripe-shared-checkout-scenario.js';

import http from 'k6/http';
import { Trend } from 'k6/metrics';
import { sleep } from 'k6';
import { getIteration } from '../../../../../lib/utils.js';

let ResponseTime = new Trend('Response Time');
let AvgResponseTimePerRPS = new Trend('Avg Response Time per RPS');

export class StripePaymentPageScenario extends StripeSharedCheckoutScenario {
  execute(targetUrl) {
    const url = targetUrl;
    let rps = getIteration() + 1;
    let startTime = new Date().getTime();
        
    const response = http.get(url);
    ResponseTime.add(response.timings.duration);
    
    let endTime = new Date().getTime();
    let elapsedTime = endTime - startTime;
    AvgResponseTimePerRPS.add(elapsedTime / rps);
        
    sleep(1);
  }
}