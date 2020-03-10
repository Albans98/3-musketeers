const nock = require('nock');
const currency = require('./');

beforeEach(() => {
  nock('https://api.exchangeratesapi.io')
    .get('/latest?base=USD')
    .reply(200, {
      'base': 'USD',
      'rates': {
        'EUR': 0.899
      }
    });

  nock('https://api.exchangeratesapi.io')
    .get('/latest?base=EUR')
    .reply(200, {
      'base': 'EUR',
      'rates': {
        'USD': 1.1122
      }
    });

  nock('https://blockchain.info')
    .get('/ticker')
    .reply(200, {
      'USD': {
        '15m': 8944.49,
        'last': 8944.49,
        'buy': 8944.49,
        'sell': 8944.49,
        'symbol': '$'
      },
      'EUR': {
        '15m': 8048.11,
        'last': 8048.11,
        'buy': 8048.11,
        'sell': 8048.11,
        'symbol': '€'
      }
    });
});

test('convert 1 USD to EUR', async () => {
  expect(await currency({ amount: '1', from: 'USD', to: 'EUR' })).toBe(0.899);
});

test('convert 1 USD to USD', async () => {
  expect(await currency({ amount: '1', from: 'USD', to: 'USD' })).toBe(1);
});

test('convert 1 EUR to USD', async () => {
  expect(await currency({ amount: '1', from: 'EUR', to: 'USD' })).toBe(1.1122);
});

test('convert 1 BTC to USD', async () => {
  expect(await currency({ amount: '1', from: 'BTC', to: 'USD' })).toBe(8944.49);
});

test('convert 1 BTC to EUR', async () => {
  expect(await currency({ amount: '1', from: 'BTC', to: 'EUR' })).toBe(8048.11);
});

test('convert without arguments', async () => {
  expect(await currency({})).toBe(0.00011180067281644902);
});

test('convert with amount only', async () => {
  expect(await currency({ amount: '1'})).toBe(0.00011180067281644902);
});

test('convert with amount and (from) currency only', async () => {
  expect(await currency({ amount: '1', from: 'USD'})).toBe(0.00011180067281644902);
});

test('convert without a correct `from` or `to` currency value', async () => {
  expect(await currency({ amount: '1', from: 'toto', to: 'titeuf' })).toThrowError('💵 Please specify a valid `from` and/or `to` currency value!');
});
