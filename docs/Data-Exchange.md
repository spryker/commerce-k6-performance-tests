# Data Exchange API


## Tests structure
Data Exchange API tests located inside the folder with the name dex. 

    cd tests/dex/tests

Static data required for the tests execution located inside the folder data

    cd tests/dex/tests/data

File `tests/dex/tests/data/dex.json` contains data exchange configuration that used for setup during 
the SCCOS install process 

Folder `get` contains 2 tests that covers all endpoints defined inside the dex.json file. 
Get requests to endpoints without includes implemented inside the file `get/entity.js`
Get requests to endpoints with all available includes implemented inside the file `get/entityWithIncludes.js`

Folder post contains tests for post interaction with the Data Exchange API. 

## Tests generation

Test generation and eslint usage require node modules installation. So first of all next command must be executed: 

    npm install

Ensure that `dex.json` updated with the latest version from SCCOS 

To generate skeleton for dynamic entity post interaction can be used cli command.

To check how command can be used please check help 

    node tests/dex/util/dexGenerate.js --help

Generate skeletons all entities:
        
    node tests/dex/util/dexGenerate.js

Generate skeleton for specific entity 

    node tests/dex/util/dexGenerate.js -e product-abstracts

In case test already exists generation will be skipped. 

After test generation important to apply formatting 

     npx eslint ./ --fix

Generated skeleton will contain payload in format` key: type` and will require manual correction. 

Taking into account that `dex.json` contains only information about table fields and relations between tables, 
which are not necessarily required for the complex payload that can be used for entity creation is very important 
to validate generated payload inside the test and ensure:

- keep only includes which are necessary
- implement randomisation for data or implement data retrieving from remote instance.


## Tests execution

To validate test following command must be executed 

    docker-compose -f docker-compose.local.yml  run --rm k6 run relative_path_to_the_test

Example (assuming test already exists or was generated using command from above): 

    docker-compose -f docker-compose.local.yml  run --rm k6 run tests/dex/tests/post/spyProductAbstract.js