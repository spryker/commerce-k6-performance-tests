# Testing Local Environments

For local execution in most cases is enough to have only one k6 service and simple output to shell.

## Precondition

By default the internal networks of the products Docker containers are not available in the K6 container. Therefore, when trying to test products running on the same machine, the endpoints are not reachable for the K6 container.

To solve this problem it is necessary to add Spryker app network to the list of supported network inside the `docker-compose.local.yml`

## Setting up configuration file

With docker-compose.local.yml you do not need to create any env file. In case parameters for data exchange execution require adjustments following options are available:

### Create .env file with the following content:

    #Data exchange configuration
    DATA_EXCHANGE_PAYLOAD_CHUNK_SIZE=500
    DATA_EXCHANGE_PAYLOAD_UPDATE_CHUNK_SIZE=100
    DATA_EXCHANGE_TARGET_CATALOG_SIZE=10000
    DATA_EXCHANGE_THREADS=2
    DATA_EXCHANGE_DEBUG=0
    # K6 threshhold activation/deactivation variable
    K6_NO_THRESHOLDS=true

### Create .env based on `.env-default`

## Setting up docker-compose.local.yml

You must edit `docker-compose.local.yml` to be able to run tests against your local demo stores and configure the correct network. Due to limitations you **can not** use networks that don't exists, therefore add/edit or comment the right network for the product you want to test.

In your networks section of the file add the network with the **same** name that your demo store is using!

```yaml
networks:
  loadtesting:
  spryker_b2b_dev_private:
    external: true
#  spryker_b2c_dev_private:
#    external: true
```

In your K6 service section, add the network as well:

```yaml
services:
  k6:
    container_name: 'loadtesting_environment'
    build:
      context: .
      dockerfile: Dockerfile
    networks:
      - loadtesting
      - spryker_b2b_dev_private
#      - spryker_b2c_dev_private
```

### Getting the list of networks

To get a list of networks run this command:

```shell
docker network ls
```

The output will be something like this:

```shell
NETWORK ID     NAME                                        DRIVER    SCOPE
8fa19e64f6d5   bridge                                      bridge    local
c174ae9ac2ed   commerce-k6-performance-tests_hostnetwork   bridge    local
e4c3e6e27a71   commerce-k6-performance-tests_loadtesting   bridge    local
26898b1143a5   commerce-k6-performance-tests_private       bridge    local
8aa3d40766b7   host                                        host      local
cd3caf00ba22   none                                        null      local
38935fd96309   spryker_b2b_dev_private                     bridge    local
d4cbd4cf6fca   spryker_b2b_dev_public                      bridge    local
```

## Errors

If you get this error message

> network spryker_b2b_marketplace_private declared as external, but could not be found

when running K6 tests, your network names in K6s config and your product are not aligned.

### Single test execution

##### POST:

    docker-compose -f docker-compose.local.yml run --rm k6 run tests/b2b/bapi/tests/data-exchange-api/tests/post.js

##### PATCH:

    docker-compose -f docker-compose.local.yml run --rm k6 run tests/b2b/bapi/tests/data-exchange-api/tests/patch.js

##### PUT:

    docker-compose -f docker-compose.local.yml run --rm k6 run tests/b2b/bapi/tests/data-exchange-api/tests/put.js
