const axios = require('axios');
const money = require('money');

const RATES_URL = 'https://api.exchangeratesapi.io/latest';
const BLOCKCHAIN_URL = 'https://blockchain.info/ticker';
const CURRENCY_BITCOIN = 'BTC';

/**
* Set default currency for the conversion (Bitcoin)
* @param {String} from - Starting currency
* @param {String} to - Final currency
* @return {Boolean} - Converting to Bitcoin (True) or not (False)
*/
const isAnyBTC = (from, to) => [from, to].includes(CURRENCY_BITCOIN);

/**
* Get exchange rate informations about currencies
* @param {Object} opts - Informations written by user
* @param {Float} amount - Value to convert from a currency to another
* @param {String} from - Starting currency
* @param {String} to - Final currency
* @return {Float} - Money conversion
*/
module.exports = async opts => {
  const {amount = 1, from = 'USD', to = CURRENCY_BITCOIN} = opts;
  const promises = [];
  let base = from;

  const anyBTC = isAnyBTC(from, to);

  /**
  * Get bitcoin exchange rate value
  * @requires {axios}
  */
  if (anyBTC) {
    base = from === CURRENCY_BITCOIN ? to : from;
    promises.push(axios(BLOCKCHAIN_URL));
  }

  promises.unshift(axios(`${RATES_URL}?base=${base}`));

  try {
    const responses = await Promise.all(promises);
    const [rates] = responses;

    /**
    * Get exchange rate values for required currencies
    * @requires {money}
    */
    money.base = rates.data.base;
    money.rates = rates.data.rates;

    const conversionOpts = {
      from,
      to
    };

    if (anyBTC) {
      const blockchain = responses.find(response =>
        response.data.hasOwnProperty(base)
      );

      Object.assign(money.rates, {
        'BTC': blockchain.data[base].last
      });
    }

    if (anyBTC) {
      Object.assign(conversionOpts, {
        'from': to,
        'to': from
      });
    }

    return money.convert(amount, conversionOpts);
  } catch (error) {
    throw new Error (
      '💵 Please specify a valid `from` and/or `to` currency value!'
    );
  }
};
