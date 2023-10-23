# Testing different Environments (Sites)

By environment this document refers to a local or remotely running and configured product. This can be a production or staging site of any of the products.

## Defining environments

The `environments` folder of this repository contains one config file per product. The file name **must** match the product. In each of the files is a JSON object.

Example:

```json
{
    "local": {
        "storefrontUrl": "http://yves.%store%.spryker.local",
        "storefrontApiUrl": "http://glue.%store%.spryker.local",
        "backofficeUrl": "http://backoffice.%store%.spryker.local",
        "backofficeApiUrl": "http://backend-api.%store%.spryker.local",
        "stores": ["de", "us", "at"]
    },
    "testing": {
        "storefrontUrl": "https://www.%store%.b2b-marketplace.demo-spryker.com",
        "storefrontApiUrl": "https://glue.%store%.b2b-marketplace.demo-spryker.com",
        "backofficeUrl": "https://backoffice.%store%.b2b-marketplace.demo-spryker.com",
        "backofficeApiUrl": "https://backend-api.%store%.b2b-marketplace.demo-spryker.com",
        "stores": ["de", "us", "at"]
    }
}
```

The named property of the first level object is the actual environment configuration name. If no evironment is specified the "local" environment is used by default. The object that is the value of it must contain:

* **storefrontUrl** - String, Storefront host.
* **storefrontApiUrl** - String, Storefront API host.
* **backofficeUrl** -  String, Backoffice host.
* **backofficeApiUrl** - String, Backoffice API host.
* **stores** - Array of stores e.g. `["de", "us", "at"]`. The first one in the array will be used by default.

## Executing tests for an environment

To execute the tests against the endpoints defined in the environment configuration it is **required** to set the `K6_HOSTENV` environment variable, that matches one of the names in the provided configuration.

```env
K6_HOSTENV=local
```
