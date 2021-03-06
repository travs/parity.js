import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';

chai.use(sinonChai);

const ShapeShift = require('./');
const initShapeshift = (ShapeShift.default || ShapeShift);

const helpers = require('./helpers.spec.js');

const mockget = helpers.mockget;
const mockpost = helpers.mockpost;

describe('shapeshift/calls', () => {
  let clock;
  let shapeshift;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
    shapeshift = initShapeshift(helpers.APIKEY);
  });

  afterEach(() => {
    clock.restore();
  });

  describe('getCoins', () => {
    const REPLY = {
      BTC: {
        name: 'Bitcoin',
        symbol: 'BTC',
        image: 'https://shapeshift.io/images/coins/bitcoin.png',
        status: 'available'
      },
      ETH: {
        name: 'Ether',
        symbol: 'ETH',
        image: 'https://shapeshift.io/images/coins/ether.png',
        status: 'available'
      }
    };

    let scope;

    beforeEach(() => {
      scope = mockget(shapeshift, [{ path: 'getcoins', reply: REPLY }]);

      return shapeshift.getCoins();
    });

    it('makes the call', () => {
      expect(scope.isDone()).to.be.ok;
    });
  });

  describe('getMarketInfo', () => {
    const REPLY = {
      pair: 'btc_ltc',
      rate: 128.17959917,
      minerFee: 0.003,
      limit: 0,
      minimum: 0.00004632
    };

    let scope;

    beforeEach(() => {
      scope = mockget(shapeshift, [{ path: 'marketinfo/btc_ltc', reply: REPLY }]);

      return shapeshift.getMarketInfo('btc_ltc');
    });

    it('makes the call', () => {
      expect(scope.isDone()).to.be.ok;
    });
  });

  describe('getStatus', () => {
    const REPLY = {
      status: '0x123',
      address: '0x123'
    };

    let scope;

    beforeEach(() => {
      scope = mockget(shapeshift, [{ path: 'txStat/0x123', reply: REPLY }]);

      return shapeshift.getStatus('0x123');
    });

    it('makes the call', () => {
      expect(scope.isDone()).to.be.ok;
    });
  });

  describe('shift', () => {
    const REPLY = {
      deposit: '1BTC',
      depositType: 'btc',
      withdrawal: '0x456',
      withdrawalType: 'eth'
    };

    let scope;

    beforeEach(() => {
      scope = mockpost(shapeshift, [{ path: 'shift', reply: REPLY }]);

      return shapeshift.shift('0x456', '1BTC', 'btc_eth');
    });

    it('makes the call', () => {
      expect(scope.isDone()).to.be.ok;
    });

    describe('body', () => {
      it('has withdrawal set', () => {
        expect(scope.body.shift.withdrawal).to.equal('0x456');
      });

      it('has returnAddress set', () => {
        expect(scope.body.shift.returnAddress).to.equal('1BTC');
      });

      it('has pair set', () => {
        expect(scope.body.shift.pair).to.equal('btc_eth');
      });
    });
  });

  describe('subscriptions', () => {
    const ADDRESS = '0123456789abcdef';
    const REPLY = {
      status: 'complete',
      address: ADDRESS
    };

    let callback;

    beforeEach(() => {
      mockget(shapeshift, [{ path: `txStat/${ADDRESS}`, reply: REPLY }]);
      callback = sinon.stub();
      shapeshift.subscribe(ADDRESS, callback);
    });

    describe('subscribe', () => {
      it('adds the depositAddress to the list', () => {
        const subscriptions = shapeshift._getSubscriptions();

        expect(subscriptions.length).to.equal(1);
        expect(subscriptions[0].depositAddress).to.equal(ADDRESS);
      });

      it('starts the polling timer', () => {
        expect(shapeshift._isPolling()).to.be.true;
      });

      it('calls the callback once the timer has elapsed', () => {
        clock.tick(2222);

        return shapeshift._getSubscriptionPromises().then(() => {
          expect(callback).to.have.been.calledWith(null, REPLY);
        });
      });

      it('auto-unsubscribes on completed', () => {
        clock.tick(2222);

        return shapeshift._getSubscriptionPromises().then(() => {
          expect(shapeshift._getSubscriptions().length).to.equal(0);
        });
      });
    });

    describe('unsubscribe', () => {
      it('unbsubscribes when requested', () => {
        expect(shapeshift._getSubscriptions().length).to.equal(1);
        shapeshift.unsubscribe(ADDRESS);
        expect(shapeshift._getSubscriptions().length).to.equal(0);
      });

      it('clears the polling on no subscriptions', () => {
        shapeshift.unsubscribe(ADDRESS);
        expect(shapeshift._isPolling()).to.be.false;
      });

      it('handles unsubscribe of auto-unsubscribe', () => {
        clock.tick(2222);

        return shapeshift._getSubscriptionPromises().then(() => {
          expect(shapeshift.unsubscribe(ADDRESS)).to.be.true;
        });
      });

      it('handles unsubscribe when multiples listed', () => {
        const ADDRESS2 = 'abcdef0123456789';

        shapeshift.subscribe(ADDRESS2, sinon.stub());
        expect(shapeshift._getSubscriptions().length).to.equal(2);
        expect(shapeshift._getSubscriptions()[0].depositAddress).to.equal(ADDRESS);
        shapeshift.unsubscribe(ADDRESS);
        expect(shapeshift._getSubscriptions()[0].depositAddress).to.equal(ADDRESS2);
      });
    });
  });
});
