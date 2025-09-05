import { addErrorToCounter } from './metric.util';

class KSixError extends Error {
  constructor(message) {
    super(message);
    this.name = 'KSixError';
    addErrorToCounter(false);
  }
}

export default KSixError;
