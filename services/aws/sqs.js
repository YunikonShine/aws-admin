const AWS = require("aws-sdk");

const sqs = new AWS.SQS({
  endpoint: "http://localhost:4566",
  region: "us-east-1",
  accessKeyId: "key",
  secretAccessKey: "secret",
  apiVersion: "2012-11-05",
});

const listQueue = async () => {
  let queuesReturn = [];
  let queuesUrls = (await sqs.listQueues().promise()).QueueUrls;
  if (queuesUrls && queuesUrls.length > 0) {
    for (const queueUrl of queuesUrls) {
      let queueSplit = queueUrl.split("/");
      let numberOfMessages = await getNumberOfMessages(queueUrl);
      queuesReturn.push({
        name: queueSplit[queueSplit.length - 1],
        itemsSize: numberOfMessages,
      });
    }
  }
  return queuesReturn;
};

const getQueueMessages = async (QueueName) => {
  let queueUrl = (await sqs.getQueueUrl({ QueueName }).promise()).QueueUrl;
  let numberOfMessages = await getNumberOfMessages(queueUrl);
  if (numberOfMessages && numberOfMessages > 0) {
    let params = {
      AttributeNames: ["SentTimestamp"],
      MaxNumberOfMessages: numberOfMessages,
      MessageAttributeNames: ["All"],
      QueueUrl: queueUrl,
      VisibilityTimeout: 0,
      WaitTimeSeconds: 0,
    };
    return (await sqs.receiveMessage(params).promise()).Messages.map((i) => {
      let date = new Date(Number(i.Attributes.SentTimestamp)).toLocaleString();
      i.Attributes.SentTimestamp = date.substr(0, date.length - 3);
      return i;
    });
  } else {
    return {};
  }
};

const getQueueBodyMessages = async (QueueName) => {
  let queueUrl = (await sqs.getQueueUrl({ QueueName }).promise()).QueueUrl;
  let numberOfMessages = await getNumberOfMessages(queueUrl);
  if (numberOfMessages && numberOfMessages > 0) {
    let params = {
      AttributeNames: ["SentTimestamp"],
      MaxNumberOfMessages: numberOfMessages,
      MessageAttributeNames: ["All"],
      QueueUrl: queueUrl,
      VisibilityTimeout: 0,
      WaitTimeSeconds: 0,
    };
    return (await sqs.receiveMessage(params).promise()).Messages.map((i) =>
      JSON.parse(i.Body)
    );
  } else {
    return {};
  }
};

const getNumberOfMessages = async (QueueUrl) => {
  let params = {
    QueueUrl,
    AttributeNames: ["ApproximateNumberOfMessages"],
  };
  return (await sqs.getQueueAttributes(params).promise()).Attributes
    .ApproximateNumberOfMessages;
};

const deleteSQS = async (QueueName) => {
  let QueueUrl = (await sqs.getQueueUrl({ QueueName }).promise()).QueueUrl;
  return sqs.deleteQueue({ QueueUrl }).promise();
};

const deleteMessages = async (QueueName) => {
  let QueueUrl = (await sqs.getQueueUrl({ QueueName }).promise()).QueueUrl;
  return sqs.purgeQueue({ QueueUrl }).promise();
};

const createQueue = async (queueParams) => {
  let params = {
    QueueName: queueParams.name,
    Attributes: {
      DelaySeconds: queueParams.delay,
      MessageRetentionPeriod: queueParams.retention,
    },
  };

  await sqs.createQueue(params).promise();
};

const getMeta = async (QueueName) => {
  let QueueUrl = (await sqs.getQueueUrl({ QueueName }).promise()).QueueUrl;
  return (await sqs.getQueueAttributes({ QueueUrl }).promise());
};

exports.listQueue = listQueue;
exports.getQueueMessages = getQueueMessages;
exports.getQueueBodyMessages = getQueueBodyMessages;
exports.deleteSQS = deleteSQS;
exports.deleteMessages = deleteMessages;
exports.createQueue = createQueue;
exports.getMeta = getMeta;
