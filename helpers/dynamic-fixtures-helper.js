export class DynamicFixturesHelper {
    constructor(backendApiUrl, http) {
        this.backendApiUrl = backendApiUrl;
        this.http = http;
    }

    haveCustomerWithQuoteAndItems(quoteCount, itemCount, defaultItemPrice = 100) {
        const defaultParams = {
            headers: {
                'Content-Type': 'application/vnd.api+json',
            },
        };

        const dynamicFixturesResponse = this.http.sendPostRequest(
            this.http.url`${this.backendApiUrl}/dynamic-fixtures`,
            JSON.stringify(this._getCustomerWithItemsInQuoteAttributes(quoteCount, itemCount, defaultItemPrice)),
            defaultParams,
            false
        );

        const dynamicFixturesResponseJson = JSON.parse(dynamicFixturesResponse.body);

        const customerData = dynamicFixturesResponseJson.data.find(item => item.attributes.key === 'customer');
        const quoteData = dynamicFixturesResponseJson.data.filter(item => item.attributes.key.startsWith('quote'));

        return {
            customerEmail: customerData.attributes.data.email,
            quoteIds: quoteData.map(item => item.attributes.data.uuid),
        };
    }

    _getCustomerWithItemsInQuoteAttributes(quoteCount = 1, itemCount = 10, defaultItemPrice = 100) {
        const baseOperations = [
            {
                type: 'transfer',
                name: 'StoreTransfer',
                key: 'store',
                arguments: { id_store: 1 }
            },
            {
                type: 'transfer',
                name: 'LocaleTransfer',
                key: 'locale',
                arguments: { id_locale: 66, locale_name: 'en_US' }
            },
            {
                type: 'helper',
                name: 'haveCountry',
                key: 'country'
            },
            {
                type: 'helper',
                name: 'haveCustomer',
                key: 'customer',
                arguments: [{ locale: '#locale', password: 'change123' }]
            },
            {
                type: 'helper',
                name: 'confirmCustomer',
                key: 'confirmedCustomer',
                arguments: ['#customer']
            },
            {
                type: 'transfer',
                name: 'ProductImageTransfer',
                key: 'productImage',
                arguments: {
                    externalUrlSmall: 'https://images.icecat.biz/img/gallery_mediums/30691822_1486.jpg',
                    externalUrlLarge: 'https://images.icecat.biz/img/gallery/30691822_1486.jpg'
                }
            }
        ];

        // Generate products dynamically
        const products = Array.from({ length: itemCount }, (_, i) => {
            const productKey = `product${i + 1}`;
            return [
                {
                    type: 'helper',
                    name: 'haveFullProduct',
                    key: productKey,
                    arguments: [{}, { idTaxSet: 1 }]
                },
                {
                    type: 'helper',
                    name: 'haveProductImageSet',
                    arguments: [
                        {
                            name: 'default',
                            idProduct: `#${productKey}.id_product_concrete`,
                            idProductAbstract: `#${productKey}.fk_product_abstract`,
                            productImages: ['#productImage']
                        }
                    ]
                },
                {
                    type: 'helper',
                    name: 'havePriceProduct',
                    arguments: [
                        {
                            skuProductAbstract: `#${productKey}.abstract_sku`,
                            skuProduct: `#${productKey}.sku`,
                            moneyValue: { netAmount: defaultItemPrice, grossAmount: defaultItemPrice }
                        }
                    ]
                },
                {
                    type: 'helper',
                    name: 'haveProductInStockForStore',
                    arguments: ['#store', { sku: `#${productKey}.sku`, isNeverOutOfStock: '1' }]
                }
            ];
        }).flat();

        // Generate items dynamically for quotes
        const generateItems = () => {
            return Array.from({ length: itemCount }, (_, i) => ({
                sku: `#product${i + 1}.sku`,
                abstractSku: `#product${i + 1}.abstract_sku`,
                quantity: 1,
                unitPrice: defaultItemPrice
            }));
        };

        // Generate quotes dynamically
        const quotes = Array.from({ length: quoteCount }, (_, i) => ({
            type: 'helper',
            name: 'havePersistentQuote',
            key: `quote${i + 1}`,
            arguments: [
                {
                    customer: '#customer',
                    items: generateItems()
                }
            ]
        }));

        return {
            data: {
                type: 'dynamic-fixtures',
                attributes: {
                    synchronize: true,
                    operations: [...baseOperations, ...products, ...quotes]
                }
            }
        };
    }
}
