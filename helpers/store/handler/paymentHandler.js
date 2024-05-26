import Handler from "../handler.js";

export default class PaymentHandler extends Handler {

    getTableAlias() {
        return 'payment-methods'
    }

    setup(storeConfig) {
        let data = this.getDataFromTable(this.getTableAlias())
        let activePayment = data.filter((payment) => payment.is_active)
        let paymentStores =  this.getDataFromTable('payment-method-stores')

        let payload = []
        storeConfig.map((store) => {
            activePayment.map((payment) => {
                if (paymentStores.filter((el) => el.fk_payment_method === payment.id_payment_method && el.fk_store === store.id_store).length) {
                    return
                }

                payload.push({
                    fk_payment_method: payment.id_payment_method,
                    fk_store: store.id_store
                })
            })
        })

        if (payload.length) {
            let res = this.createEntities('payment-method-stores', JSON.stringify({
                data: payload
            }))
        }
    }
}