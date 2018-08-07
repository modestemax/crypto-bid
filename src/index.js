const debug = require('debug')('bid:order');
const redisLib = require('redis');
const _ = require('lodash');
const redisClient = redisLib.createClient();
const redisSub = redisClient.duplicate();

const Mutex = new require('await-mutex').default;
const mutex = new Mutex();

const RateLimiter = require('limiter').RateLimiter;
const limiter = new RateLimiter(10, 'second');


const exchange = require('./exchange');


redisSub.on('pmessage', async (pattern, channel, data) => {
    const json = JSON.parse(data);
    switch (channel) {
        case 'crypto-bid': bid(json); break;
        case 'crypto-ask': ask(json); break;
        case 'cancelOrder': cancelOrder(json); break;
        case 'tradeChanged': tradeChanged(json); break;
    }
});


async function bid(signal) {
    limiter.removeTokens(1, async () => {
        let unlock = await mutex.lock();
        try {

            let { strategy, strategyOptions, exchange: exchangeId, bid, symbolId } = signal;

            await exchange.buyOder({ strategy, strategyOptions, exchangeId, symbolId, bid });

        } catch (error) {
            debug(error)
        } finally {
            unlock();
        }
    })

}

function ask(order) {
    limiter.removeTokens(1, async () => {
        let unlock = await mutex.lock();
        try {

            let { strategy, strategyOptions, exchange: exchangeId, ask, symbolId } = signal;

            await exchange.sellOder({ strategy, strategyOptions, exchangeId, symbolId, ask });

        } catch (error) {
            debug(error)
        } finally {
            unlock();
        }
    })
}

function cancelOrder(order) {
    exchange.cancelOrder(order)
}

function tradeChanged(trade) {
    exchange.controlTrade(trade);  
}

redisSub.psubscribe('crypto-bid');
redisSub.psubscribe('crypto-ask');

redisSub.psubscribe('cancelOrder');
redisSub.psubscribe('tradeChanged');

debug('bidder started');