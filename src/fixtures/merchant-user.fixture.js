import { AbstractFixture } from './abstract.fixture';
import exec from 'k6/execution';

export class MerchantUserFixture extends AbstractFixture {
  constructor({ idMerchant, merchantUserCount = 1 }) {
    super();
    this.idMerchant = idMerchant;
    this.merchantUserCount = merchantUserCount;
  }

  getData() {
    const response = this.runDynamicFixture(this._getMerchantUsersPayload());
    const responseData = JSON.parse(response.body).data;

    return responseData
      .filter((item) => /^merchantUser\d+$/.test(item.attributes.key))
      .map((item) => {
        const { id_user, username, first_name, last_name, status } = item.attributes.data;

        return {
          id: id_user,
          username,
          password: AbstractFixture.DEFAULT_PASSWORD,
          firstName: first_name,
          lastName: last_name,
          status,
        };
      });
  }

  iterateData(data, vus = exec.vu.idInTest) {
    const merchantUserIndex = (vus - 1) % data.length;

    return data[merchantUserIndex];
  }

  _getMerchantUsersPayload() {
    const baseOperations = [
      {
        type: 'transfer',
        name: 'MerchantTransfer',
        key: 'merchant',
        arguments: {
          idMerchant: this.idMerchant,
        },
      },
    ];

    const merchantUsers = Array.from({ length: this.merchantUserCount }, (_, i) =>
      this._createMerchantPayload(i)
    ).flat();

    return JSON.stringify({
      data: {
        type: 'dynamic-fixtures',
        attributes: {
          synchronize: false,
          operations: [...baseOperations, ...merchantUsers],
        },
      },
    });
  }

  _createMerchantPayload(index) {
    const merchantUserKey = `merchantUser${index + 1}`;
    return [
      {
        type: 'helper',
        name: 'haveUser',
        key: merchantUserKey,
        arguments: [{ password: AbstractFixture.DEFAULT_PASSWORD }],
      },
      {
        type: 'helper',
        name: 'haveMerchantUserWithAclEntities',
        arguments: ['#merchant', `#${merchantUserKey}`],
      },
    ];
  }
}
