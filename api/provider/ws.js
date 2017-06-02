import { Ws as Transport } from '../transport';

export default class Ws extends Transport {
  send = (method, params, callback) => {
    this
      ._execute(method, params)
      .then((result) => callback(null, result))
      .catch((error) => callback(error));
  }
}
