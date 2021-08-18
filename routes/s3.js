let express = require("express");
let router = express.Router();
let {
  listBuckets,
  listItems,
  purgueBucket,
  deleteBucket,
  uploadItem,
  deleteItem,
  createBucket,
  getMeta,
} = require("../services/aws/s3");
const redis = require('redis');
const client = redis.createClient({
    host: 'localhost',
    port: 6379,
    password: '75eFx^Yh]vH/jYKw'
});

router.get("/s3", async function (req, res, next) {
  res.render("s3/index", { buckets: await listBuckets() });
});

router.get("/s3/create", async function (req, res, next) {
  res.render("s3/create");
});

router.get("/s3/:bucket/meta", async function (req, res, next) {
  res.render("s3/meta", {
    meta: await getMeta(req.params.bucket),
    bucketName: req.params.bucket,
  });
});

router.get("/s3/:bucket", async function (req, res, next) {
  res.render("s3/items", {
    items: await listItems(req.params.bucket),
    bucketName: req.params.bucket,
  });
});

router.delete("/s3/:bucket", async function (req, res, next) {
  await deleteBucket(req.params.bucket);
  res.status(200).end();
});

router.delete("/s3/:bucket/items", async function (req, res, next) {
  await purgueBucket(req.params.bucket);
  res.status(200).end();
});

router.delete("/s3/:bucket/item/:itemName", async function (req, res, next) {
  await deleteItem(req.params.bucket, req.params.itemName);
  res.status(200).end();
});

router.put("/s3/:bucket/item", async function (req, res, next) {
  await uploadItem(req.params.bucket, req.body.file, req.body.name);
  res.status(200).end();
});

router.post("/s3/bucket", async function (req, res, next) {
  await createBucket(req.body.name);
  res.status(200).end();
});

router.post("/s3/temp", async function (req, res, next) {
  var jobs = [];
  client.keys('*', function (err, keys) {
      if (err) return console.log(err);
      if(keys){
          async.map(keys, function(key, cb) {
              client.get(key, function (error, value) {
                  if (error) return cb(error);
                  var job = {};
                  job['jobId']=key;
                  job['data']=value;
                  cb(null, job);
              }); 
          }, function (error, results) {
              if (error) return console.log(error);
              console.log(results);
              res.json({data:results});
          });
      }
  });
});

module.exports = router;
