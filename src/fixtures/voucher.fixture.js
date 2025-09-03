import { AbstractFixture } from './abstract.fixture';
import exec from 'k6/execution';

export class VoucherFixture extends AbstractFixture {
  constructor({ discountCount = 1 }) {
    super();
    this.discountCount = discountCount;
  }

  getData() {
    const response = this.runDynamicFixture(this._getVouchersPayload());
    const responseData = JSON.parse(response.body).data;

    const dataArray = Array.isArray(responseData) ? responseData : [responseData];

    return dataArray
      .filter((item) => /^voucher\d+$/.test(item.attributes.key))
      .map((item) => {
        const { id_discount, code } = item.attributes.data;
        return { id_discount, code };
      });
  }

  iterateData(data, vus = exec.vu.idInTest) {
    const discountIndex = (vus - 1) % data.length;

    return data[discountIndex];
  }

  _getVouchersPayload() {
    const discounts = Array.from({ length: this.discountCount }, (_, i) => this._createVoucherPayload(i)).flat();

    return JSON.stringify({
      data: {
        type: 'dynamic-fixtures',
        attributes: {
          synchronize: true,
          operations: [...discounts],
        },
      },
    });
  }

  _createVoucherPayload(index) {
    const voucherKey = `voucher${index + 1}`;
    return [
      {
        type: 'helper',
        name: 'havePercentageDiscountVoucher',
        key: voucherKey,
        arguments: [[AbstractFixture.DEFAULT_STORE_ID]],
      },
    ];
  }
}
