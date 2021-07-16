const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const LikeRecord = require('../model');

chai.use(chaiHttp);

const BASE_URL = '/api/stock-prices/?stock='
const STOCK = 'MNRO';
const STOCK2 = 'TMFC';
const LOCAL_IP = '::ffff:127.0.0.1';

suite('Functional Tests', function () {
    test('Viewing one stock: GET request to /api/stock-prices/', async function () {
        const response = await chai.request(server)
            .get(BASE_URL + STOCK);
        assert.equal(response.status, 200);
        assert.hasAllKeys(response.body, ['stockData']);
        assert.hasAllKeys(response.body.stockData, ['stock', 'price', 'likes']);

        assert.isNumber(response.body.stockData.price);
        assert.isNumber(response.body.stockData.likes);
        assert.equal(response.body.stockData.stock, STOCK);
    });
    test('Viewing one stock and liking it: GET request to /api/stock-prices/', async function () {
        await LikeRecord.deleteMany({stock: STOCK})
        const response = await chai.request(server)
            .get(BASE_URL + STOCK + '&like=true');
        assert.equal(response.status, 200);
        assert.hasAllKeys(response.body, ['stockData']);
        assert.hasAllKeys(response.body.stockData, ['stock', 'price', 'likes']);

        assert.isNumber(response.body.stockData.price);
        assert.equal(response.body.stockData.likes, 1);
        assert.equal(response.body.stockData.stock, STOCK);
    });
    test('Viewing the same stock and liking it again: GET request to /api/stock-prices/', async function () {
        await LikeRecord.deleteMany({stock: STOCK});
        await LikeRecord.findOneAndUpdate(
            {stock: STOCK, ip: LOCAL_IP},
            {stock: STOCK, ip: LOCAL_IP},
            {new: true, upsert: true});


        const response = await chai.request(server)
            .get(BASE_URL + STOCK + '&like=true');
        assert.equal(response.status, 200);
        assert.hasAllKeys(response.body, ['stockData']);
        assert.hasAllKeys(response.body.stockData, ['stock', 'price', 'likes']);

        assert.isNumber(response.body.stockData.price);
        assert.equal(response.body.stockData.likes, 1); // Ensure a new one is not created for this IP
        assert.equal(response.body.stockData.stock, STOCK);
    });
    test('Viewing two stocks: GET request to /api/stock-prices/', async function () {
        const response = await chai.request(server)
            .get(BASE_URL + STOCK + '&stock=' + STOCK2);
        assert.equal(response.status, 200);
        assert.hasAllKeys(response.body, ['stockData']);
        const stockData = response.body.stockData;

        assert.isArray(stockData);
        assert.equal(stockData.length, 2);
    });
    test('Viewing two stocks and liking them: GET request to /api/stock-prices/', async function () {
        await LikeRecord.deleteMany({});
        const response = await chai.request(server)
            .get(BASE_URL + STOCK + '&stock=' + STOCK2 + '&like=true');
        assert.equal(response.status, 200);
        assert.hasAllKeys(response.body, ['stockData']);
        const stockData = response.body.stockData;

        assert.isArray(stockData);
        assert.equal(stockData.length, 2);
        stockData.forEach(d => assert.hasAllKeys(d, ['stock', 'price', 'rel_likes']));
        stockData.forEach(d => assert.hasAllKeys(d, ['stock', 'price', 'rel_likes']));
    });
});
