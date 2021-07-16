'use strict';
const fetch = require('node-fetch');
const LikeRecord = require('../model');

async function getLikes(ip, like, stock) {
    if (like) {
        const q = {stock, ip};
        await LikeRecord.findOneAndUpdate(q, q, {new: true, upsert: true});
    }

    return await LikeRecord.countDocuments({stock});
}

async function getData(stock) {
    const url = process.env['MARKET_STACK'] + stock;
    const response = await (await fetch(url)).json()

    if (!!response.error || response.data.length === 0) {
        return {};
    }
    return {
        stock, price: response.data[0].close
    };
}

async function handleOneStock(res, ip, like, stock) {
    const stockData = {
        ...await getData(stock),
        likes: await getLikes(ip, like, stock)
    };
    return res.json({stockData});
}

async function handleTw0Stocks(res, ip, like, stock1, stock2) {
    const [likes1, likes2] = [await getLikes(ip, like, stock1), await getLikes(ip, like, stock2)]
    const [data1, data2] = [await getData(stock1), await getData(stock2)];


    const stockData = [
        {...data1, rel_likes: likes1 - likes2},
        {...data2, rel_likes: likes2 - likes1}
    ];
    return res.json({stockData});

}


module.exports = function (app) {

    app.route('/api/stock-prices')
        .get(async function (req, res) {
            const ip = req.ip;
            const stock = req.query.stock;
            const like = req.query.like === 'true';


            if (Array.isArray(stock)) {
                const [stock1, stock2] = stock;
                if (stock1.toUpperCase() === stock2.toUpperCase()) {
                    return handleOneStock(res, ip, like, stock1.toUpperCase());
                }
                return handleTw0Stocks(res, ip, like, stock1.toUpperCase(), stock2.toUpperCase());

            } else {
                return handleOneStock(res, ip, like, stock.toUpperCase());
            }
        });

};
