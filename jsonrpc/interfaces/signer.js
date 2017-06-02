import { Quantity, Data } from '../types';
import { fromDecimal, Dummy } from '../helpers';

export default {
  generateAuthorizationToken: {
    desc: 'Generates a new authorization token.',
    params: [],
    returns: {
      type: String,
      desc: 'The new authorization token.',
      example: 'bNGY-iIPB-j7zK-RSYZ'
    }
  },

  generateWebProxyAccessToken: {
    desc: 'Generates a new web proxy access token.',
    params: [],
    returns: {
      type: String,
      desc: 'The new web proxy access token.',
      example: 'MOWm0tEJjwthDiTU'
    }
  },

  requestsToConfirm: {
    desc: 'Returns a list of the transactions awaiting authorization.',
    params: [],
    returns: {
      // TODO: Types of the fields of transaction objects? Link to a transaction object in another page?
      type: Array,
      desc: 'A list of the outstanding transactions.',
      example: new Dummy('[ ... ]')
    }
  },

  confirmRequest: {
    desc: 'Confirm a request in the signer queue',
    params: [
      {
        type: Quantity,
        desc: 'The request id.',
        example: fromDecimal(1)
      },
      {
        type: Object,
        desc: 'Modify the transaction before confirmation.',
        details: {
          gasPrice: {
            type: Quantity,
            desc: 'Modify the gas price provided by the sender in Wei.',
            optional: true
          },
          gas: {
            type: Quantity,
            desc: 'Gas provided by the sender in Wei.',
            optional: true
          },
          condition: {
            type: Object,
            desc: 'Condition for scheduled transaction. Can be either an integer block number `{ block: 1 }` or UTC timestamp (in seconds) `{ timestamp: 1491290692 }`.',
            optional: true
          }
        },
        example: {}
      },
      {
        type: String,
        desc: 'The account password',
        example: 'hunter2'
      }
    ],
    returns: {
      type: Object,
      desc: 'The status of the confirmation, depending on the request type.',
      example: {}
    }
  },

  confirmRequestRaw: {
    desc: 'Confirm a request in the signer queue providing signed request.',
    params: [
      {
        type: Quantity,
        desc: 'Integer - The request id',
        example: fromDecimal(1)
      },
      {
        type: Data,
        desc: 'Signed request (RLP encoded transaction)',
        example: '0xd46e8dd67c5d32be8d46e8dd67c5d32be8058bb8eb970870f072445675058bb8eb970870f072445675'
      }
    ],
    returns: {
      type: Object,
      desc: 'The status of the confirmation, depending on the request type.',
      example: {}
    }
  },

  confirmRequestWithToken: {
    desc: 'Confirm specific request with rolling token.',
    params: [
      {
        type: Quantity,
        desc: 'The request id.',
        example: fromDecimal(1)
      },
      {
        type: Object,
        desc: 'Modify the transaction before confirmation.',
        details: {
          gasPrice: {
            type: Quantity,
            desc: 'Modify the gas price provided by the sender in Wei.',
            optional: true
          },
          gas: {
            type: Quantity,
            desc: 'Gas provided by the sender in Wei.',
            optional: true
          },
          condition: {
            type: Object,
            desc: 'Conditional submission of the transaction. Can be either an integer block number `{ block: 1 }` or UTC timestamp (in seconds) `{ time: 1491290692 }` or `null`.',
            optional: true
          }
        },
        example: {}
      },
      {
        type: String,
        desc: 'Password (initially) or a token returned by the previous call.',
        example: 'hunter2'
      }
    ],
    returns: {
      type: Object,
      desc: 'Status.',
      details: {
        result: {
          type: Object,
          desc: 'The status of the confirmation, depending on the request type.'
        },
        token: {
          type: String,
          desc: 'Token used to authenticate the next request.'
        }
      },
      example: {
        result: new Dummy('{ ... }'),
        token: 'cAF2w5LE7XUZ3v3N'
      }
    }
  },

  rejectRequest: {
    desc: 'Rejects a request in the signer queue',
    params: [
      {
        type: Quantity,
        desc: 'Integer - The request id',
        example: fromDecimal(1)
      }
    ],
    returns: {
      type: Boolean,
      desc: 'The status of the rejection',
      example: true
    }
  },

  signerEnabled: {
    nodoc: 'Not present in Rust code',
    desc: 'Returns whether signer is enabled/disabled.',
    params: [],
    returns: {
      type: Boolean,
      desc: '`true` when enabled, `false` when disabled.',
      example: true
    }
  }
};
