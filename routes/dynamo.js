let express = require("express");
let router = express.Router();
let {
  listTables,
  listItems,
  purgeTable,
  deleteTable,
  getItem,
  getMeta,
  saveItem,
  deleteItem,
  createTable,
} = require("../services/aws/dynamo");

router.get("/dynamo", async function (req, res, next) {
  res.render("dynamo/index", { tables: await listTables() });
});

router.get("/dynamo/create", async function (req, res, next) {
  res.render("dynamo/create");
});

router.get("/dynamo/:TableName", async function (req, res, next) {
  let queryJson = req.query.filter && JSON.parse(req.query.filter);
  res.render("dynamo/items", {
    items: await listItems(req.params.TableName, queryJson),
    tableName: req.params.TableName,
    query: req.query.filter && req.query,
  });
});

router.get("/dynamo/:TableName/item", async function (req, res, next) {
  res.render("dynamo/item", {
    item: await getItem(req.params.TableName, req.query),
    tableName: req.params.TableName,
    canDelete: req.query["keys"],
  });
});

router.get("/dynamo/:TableName/meta", async function (req, res, next) {
  res.render("dynamo/meta", {
    meta: await getMeta(req.params.TableName),
    tableName: req.params.TableName,
  });
});

router.delete("/dynamo/:TableName/items", async function (req, res, next) {
  await purgeTable(req.params.TableName);
  res.status(200).end();
});

router.delete("/dynamo/:TableName", async function (req, res, next) {
  await deleteTable(req.params.TableName);
  res.status(200).end();
});

router.delete("/dynamo/:TableName/item", async function (req, res, next) {
  await deleteItem(req.params.TableName, req.body);
  res.status(200).end();
});

router.put("/dynamo/:TableName", async function (req, res, next) {
  let keyString = await saveItem(
    req.params.TableName,
    req.body.data,
    req.body.keys
  );
  res.status(200).json(keyString).end();
});

router.post("/dynamo/table", async function (req, res, next) {
  await createTable(req.body);
  res.status(200).end();
});

module.exports = router;
