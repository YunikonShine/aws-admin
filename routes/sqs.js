let express = require("express");
let router = express.Router();
let {
  listQueue,
  getQueueMessages,
  getQueueBodyMessages,
  deleteSQS,
  deleteMessages,
} = require("../services/aws/sqs");

router.get("/sqs", async function (req, res, next) {
  res.render("sqs/index", { queues: await listQueue() });
});

router.get("/sqs/:QueueName/full", async function (req, res, next) {
  res.render("sqs/items", {
    items: await getQueueMessages(req.params.QueueName),
    queueName: req.params.QueueName,
  });
});

router.get("/sqs/:QueueName/body", async function (req, res, next) {
  res.render("sqs/items", {
    items: await getQueueBodyMessages(req.params.QueueName),
    queueName: req.params.QueueName,
  });
});

router.delete("/sqs/:QueueName", async function (req, res, next) {
  await deleteSQS(req.params.QueueName);
  res.status(200).end();
});

router.delete("/sqs/:QueueName/message", async function (req, res, next) {
  await deleteMessages(req.params.QueueName);
  res.status(200).end();
});

module.exports = router;
