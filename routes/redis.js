let express = require("express");
let router = express.Router();

const redis = require('redis');
const client = redis.createClient({
    host: 'localhost',
    port: 6379,
    password: '75eFx^Yh]vH/jYKw'
});

router.get("/redis", function (req, res, next) {
  var jobs = [];
  client.keys('*', function (err, keys) {
    console.log(keys);
  });
  client.keys('ExampleEntityCache', (err, keys) => {
    console.log(keys);
  });
  client.get('ExampleEntityCache:889d9cb3-ec45-4995-98b3-03672ba8a92f', (err, keys) => {
    console.log(keys);
  });
});

module.exports = router;
