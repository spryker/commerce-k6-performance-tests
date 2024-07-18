## ERP test cases

For run tests please use specific suite-nonsplit branch: `feature/frw-8409/dev-extend-dex-configuration`. 
_This branch contains all necessary changes for run tests and configuration for DEX._


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