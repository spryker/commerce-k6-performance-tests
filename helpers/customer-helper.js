export default class CustomerHelper {
    customers = [
        {email :'sonia@spryker.com', pass: 'change123'},
        {email :'arnold@spryker.com', pass: 'change123'},
        {email :'sally@ottom.de', pass: 'change123'},
        {email :'kevin@spryker.com', pass: 'change123'},
        {email :'emma@spryker.com', pass: 'change123'},
        {email :'Sarah@spryker.com', pass: 'change123'},
        {email :'donald@spryker.com', pass: 'change123'},
        {email :'Lilu@ottom.de', pass: 'change123'},
        {email :'karl@spryker.com', pass: 'change123'},
        {email :'Lisa@ottom.de', pass: 'change123'},
        {email :'Frida@ottom.de', pass: 'change123'},
        {email :'Alexa@ottom.de', pass: 'change123'},
        {email :'Ahill@ottom.de', pass: 'change123'},
        {email :'andrew@ottom.de', pass: 'change123'},
        {email :'anne.boleyn@spryker.com', pass: 'change123'},
        {email :'henry.tudor@spryker.com', pass: 'change123'},
        {email :'george.freeman@spryker.com', pass: 'change123'},
        {email :'bill.martin@spryker.com', pass: 'change123'},
        {email :'maria.williams@spryker.com', pass: 'change123'},
        {email :'spencor.hopkin@spryker.com', pass: 'change123'},
        {email :'Kim@ottom.de', pass: 'change123'},
        {email :'Solomon@spryker.com', pass: 'change123'},
    ]
    getDefaultCustomerEmail() {
        return __ENV.DEFAULT_CUSTOMER_EMAIL ? __ENV.DEFAULT_CUSTOMER_EMAIL : 'sonia@spryker.com';
    }

    getDefaultCustomerPassword() {
        return __ENV.DEFAULT_CUSTOMER_PASSWORD ? __ENV.DEFAULT_CUSTOMER_PASSWORD : 'change123';
    }

    getCustomerByVuId(id) {
        if (id >= this.customers.length) {
            id = this.customers.length - 1
        }
        return this.customers[id]
    }
}
