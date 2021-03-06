import secp256k1 from 'secp256k1';
import { keccak_256 as keccak256 } from 'js-sha3';

import { bytesToHex } from '../../util/format'; // eslint-disable-line

const isWorker = typeof self !== 'undefined'; // eslint-disable-line

// Stay compatible between environments
if (!isWorker) {
  const scope = typeof global === 'undefined' ? window : global;

  scope.self = scope;
}

// keythereum should never be used outside of the browser
let keythereum = require('keythereum');

if (isWorker) {
  keythereum = self.keythereum; // eslint-disable-line
}

function route ({ action, payload }) {
  if (action in actions) {
    return actions[action](payload);
  }

  return null;
}

const actions = {
  phraseToWallet (phrase) {
    let secret = keccak256.array(phrase);

    for (let i = 0; i < 16384; i++) {
      secret = keccak256.array(secret);
    }

    while (true) {
      secret = keccak256.array(secret);

      const secretBuf = Buffer.from(secret);

      if (secp256k1.privateKeyVerify(secretBuf)) {
        // No compression, slice out last 64 bytes
        const publicBuf = secp256k1.publicKeyCreate(secretBuf, false).slice(-64);
        const address = keccak256.array(publicBuf).slice(12);

        if (address[0] !== 0) {
          continue;
        }

        const wallet = {
          secret: bytesToHex(secretBuf),
          public: bytesToHex(publicBuf),
          address: bytesToHex(address)
        };

        return wallet;
      }
    }
  },

  verifySecret (secret) {
    const key = Buffer.from(secret.slice(2), 'hex');

    return secp256k1.privateKeyVerify(key);
  },

  createKeyObject ({ key, password }) {
    key = Buffer.from(key);
    password = Buffer.from(password);

    const iv = keythereum.crypto.randomBytes(16);
    const salt = keythereum.crypto.randomBytes(32);
    const keyObject = keythereum.dump(password, key, salt, iv);

    return JSON.stringify(keyObject);
  },

  decryptPrivateKey ({ keyObject, password }) {
    password = Buffer.from(password);

    try {
      const key = keythereum.recover(password, keyObject);

      // Convert to array to safely send from the worker
      return Array.from(key);
    } catch (e) {
      return null;
    }
  }
};

self.onmessage = function ({ data }) { // eslint-disable-line
  try {
    const result = route(data);

    postMessage([null, result]);
  } catch (err) {
    postMessage([err, null]);
  }
};

// Emulate a web worker in Node.js
class KeyWorker {
  postMessage (data) {
    // Force async
    setTimeout(() => {
      try {
        const result = route(data);

        this.onmessage({ data: [null, result] });
      } catch (err) {
        this.onmessage({ data: [err, null] });
      }
    }, 0);
  }

  onmessage (event) {
    // no-op to be overriden
  }
}

if (exports != null) {
  exports.KeyWorker = KeyWorker;
}
