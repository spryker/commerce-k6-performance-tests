## ERP test cases

For run tests please use specific suite-nonsplit branch: `feature/frw-8409/dev-extend-dex-configuration`. 

_This branch contains all necessary changes for run tests and configuration for DEX._

### Run all tests from local machine

```bash

COMPOSER_FILE=docker-compose.local.yml SPRYKER_TEST_ENVIRONMENT=DEX ./shell/run-all-dex-erp-performance-tests.sh

```

### Company users 

`tests/dex/tests/post/companyUser.js` - tests provide to create company users with assigned roles.

```bash

docker-compose -f docker-compose.local.yml  run --rm k6 run tests/dex/tests/post/companyUser.js

```


### Customer addresses

`tests/dex/tests/post/customerAddress.js` - tests provide import  customer addresses to existing customers.

```bash

docker-compose -f docker-compose.local.yml  run --rm k6 run tests/dex/tests/post/customerAddress.js

```

### Discounts: Cart rule 

`tests/dex/tests/post/discountCartRule.js` - tests provide to create cart rules for discounts.


```bash
docker-compose -f docker-compose.local.yml  run --rm k6 run tests/dex/tests/post/discountCartRule.js

```

### Discounts: Vouchers 

`tests/dex/tests/post/discountVoucher.js` - tests provide to create vouchers with random codes (10 - 30 codes) for discounts.

```bash

docker-compose -f docker-compose.local.yml  run --rm k6 run tests/dex/tests/post/discountVoucher.js

```


### Sales orders and order returns

#### Please folow order for run tests related sales orders:

1. Run tests for create sales orders  `tests/dex/tests/post/salesOrder.js`  

```bash

docker-compose -f docker-compose.local.yml  run --rm k6 run tests/dex/tests/post/salesOrder.js

```

2. Run tests for create sales orders returns (Order returns) `tests/dex/tests/post/salesReturns.js`

```bash

docker-compose -f docker-compose.local.yml  run --rm k6 run tests/dex/tests/post/salesReturns.js

```

3. Run tests for update sales order items states (Order histories) `tests/dex/tests/post/salesOrderItemState.js`

```bash

docker-compose -f docker-compose.local.yml  run --rm k6 run tests/dex/tests/post/salesOrderItemState.js

```

4. Run tests for get sales orders `tests/dex/tests/get/salesOrderWithIncludes.js`

```bash

docker-compose -f docker-compose.local.yml  run --rm k6 run tests/dex/tests/get/salesOrderWithIncludes.js

```