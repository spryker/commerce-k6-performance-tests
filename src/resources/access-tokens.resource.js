import AbstractResource from './abstract.resource';

export default class AccessTokensResource extends AbstractResource {
  get(email, password = 'change123') {
    return this.postRequest('access-tokens', this._getAccessTokensPayload(email, password));
  }

  _getAccessTokensPayload(email, password = 'change123') {
    return {
      data: {
        type: 'access-tokens',
        attributes: {
          username: email,
          password: password,
        },
      },
    };
  }
}
