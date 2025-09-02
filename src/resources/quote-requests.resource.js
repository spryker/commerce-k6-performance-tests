import AbstractResource from './abstract.resource';

export default class QuoteRequestsResource extends AbstractResource {
  constructor(bearerToken) {
    super(bearerToken);
  }

  create(name, metadata = []) {
    return this.postRequest('quote-requests', this._getCreateQuoteRequestPayload(name, metadata));
  }

  _getCreateQuoteRequestPayload(name, metadata = []) {
    return {
      data: {
        type: 'quote-requests',
        attributes: {
          cartUuid: name,
          metadata: metadata,
        },
      },
    };
  }
}
