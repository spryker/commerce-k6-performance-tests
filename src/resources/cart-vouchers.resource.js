import AbstractResource from './abstract.resource';

export default class CartVouchersResource extends AbstractResource {
  constructor(bearerToken) {
    super(bearerToken);
  }

  addVoucher(idCart, code) {
    return this.postRequest(`carts/${idCart}/vouchers`, this._getCreateVoucherPayload(code));
  }

  _getCreateVoucherPayload(code) {
    return {
      data: {
        type: 'vouchers',
        attributes: {
          code: code,
        },
      },
    };
  }
}
