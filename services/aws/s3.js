const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  endpoint: "http://localhost:4566",
  region: "us-east-1",
  accessKeyId: "key",
  secretAccessKey: "secret",
  apiVersion: "2006-03-01",
  s3ForcePathStyle: true,
});

const listBuckets = async () => {
  let itemsToReturn = [];
  let bucketList = (await s3.listBuckets().promise()).Buckets.map((bucket) => ({
    name: bucket.Name,
  }));
  for (let bucket of bucketList) {
    let items = await s3.listObjects({ Bucket: bucket.name }).promise();
    itemsToReturn.push({
      name: bucket.name,
      itemsSize: items.Contents.length,
    });
  }
  return itemsToReturn;
};

let listItems = async (Bucket) => {
  return (await s3.listObjects({ Bucket }).promise()).Contents.map((item) => ({
    name: item.Key,
  }));
};

let deleteBucket = async (Bucket) => {
  await s3.deleteBucket({ Bucket }).promise();
};

let purgueBucket = async (Bucket) => {
  let items = await listItems(Bucket);
  var Objects = [];
  for (let item of items) {
    Objects.push({ Key: item.name });
  }
  await s3.deleteObjects({ Bucket, Delete: { Objects } }).promise();
};

let uploadItem = async (Bucket, base64, Key) => {
  let base64Split = base64.split(";base64,");
  let ContentType = base64Split[0].split("data:").pop();
  let Body = Buffer.from(base64Split[1], "base64");
  let uploadParams = {
    Bucket,
    Key,
    Body,
    ContentType,
    ContentEncoding: "base64",
  };
  await s3.upload(uploadParams).promise();
};

const deleteItem = async (Bucket, Key) => {
  await s3.deleteObject({ Bucket, Key }).promise();
};

const createBucket = async (Bucket) => {
  await s3.createBucket({ Bucket }).promise();
};

const getMeta = async (Bucket) => {
  let Lifecycle = await s3
    .getBucketLifecycleConfiguration({ Bucket })
    .promise()
    .catch((i) => {});
  let Notification = await s3
    .getBucketNotificationConfiguration({ Bucket })
    .promise();

  return { Lifecycle, Notification };
};

exports.listBuckets = listBuckets;
exports.listItems = listItems;
exports.deleteBucket = deleteBucket;
exports.purgueBucket = purgueBucket;
exports.uploadItem = uploadItem;
exports.deleteItem = deleteItem;
exports.createBucket = createBucket;
exports.getMeta = getMeta;
