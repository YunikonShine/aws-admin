const AWS = require("aws-sdk");

const dynamoDB = new AWS.DynamoDB({
  endpoint: "http://localhost:4566",
  sslEnabled: false,
  region: "us-east-1",
  accessKeyId: "key",
  secretAccessKey: "secret",
});

const dynamoDoc = new AWS.DynamoDB.DocumentClient({ service: dynamoDB });

const listTables = async () => {
  let tables = (await dynamoDB.listTables({}).promise()).TableNames;
  let listTableItems = [];
  for (const table of tables) {
    let itemsSize = await countItems(table);
    listTableItems.push({
      name: table,
      itemsSize,
    });
  }
  return listTableItems.sort((a, b) => a.name > b.name);
};

const countItems = async (TableName) => {
  return (await dynamoDoc.scan({ TableName }).promise()).Items.length;
};

const listItems = async (TableName, filters) => {
  let data;
  if (filters) {
    const ExpressionAttributeNames = {};
    const ExpressionAttributeValues = {};
    const FilterExpressions = [];

    for (const filter of filters) {
      if (filter.type === "N") {
        filter.value = Number(filter.value);
      }
      ExpressionAttributeNames[`#${filter.key}`] = filter.key;
      ExpressionAttributeValues[`:${filter.key}`] = filter.value;
      FilterExpressions.push(
        `#${filter.key} ${filter.condition} :${filter.key}`
      );
    }

    const params = {
      TableName,
      FilterExpression: FilterExpressions.length
        ? FilterExpressions.join(" AND ")
        : undefined,
      ExpressionAttributeNames: Object.keys(ExpressionAttributeNames).length
        ? ExpressionAttributeNames
        : undefined,
      ExpressionAttributeValues: Object.keys(ExpressionAttributeValues).length
        ? ExpressionAttributeValues
        : undefined,
    };

    data = (await dynamoDoc.scan(params).promise()).Items;
  }

  let tableColumns = [];
  let itemsList = [];
  let tableSchema = await getTableSchema(TableName);
  let items = data
    ? data
    : (await dynamoDoc.scan({ TableName }).promise()).Items;
  items.forEach((item) => {
    let keys = {};
    tableSchema.forEach((key) => {
      keys[key] = item[key];
      delete item[key];
    });
    itemsList.push({
      item,
      keys,
    });
  });
  items.forEach((item) => {
    for (const [key, value] of Object.entries(item)) {
      if (!tableColumns.includes(key)) {
        tableColumns.push(key);
      }
    }
  });
  return { itemsList, tableColumns };
};

const purgeTable = async (TableName) => {
  let queryExpression = {
    TableName,
    ExpressionAttributeNames: {},
    ProjectionExpression: {},
  };

  let tableSchema = await getTableSchema(TableName);

  let projectionExpressionStyle = "";
  tableSchema.forEach((key, i) => {
    projectionExpressionStyle += `#KEY${i}, `;
    queryExpression.ExpressionAttributeNames[`#KEY${i}`] = key;
  });
  projectionExpressionStyle = projectionExpressionStyle.slice(
    0,
    projectionExpressionStyle.length - 2
  );

  queryExpression.ProjectionExpression = projectionExpressionStyle;
  let items = (await dynamoDB.scan({ ...queryExpression }).promise()).Items;

  let deleteItems = {
    RequestItems: {
      [TableName]: [],
    },
  };

  let count = 0;
  let promisses = [];
  for (const item of items) {
    if (count === 25) {
      promisses.push(dynamoDB.batchWriteItem(deleteItems).promise());
      deleteItems.RequestItems[TableName] = [];
      count = 0;
    }
    deleteItems.RequestItems[TableName].push({
      DeleteRequest: {
        Key: item,
      },
    });
    count++;
  }
  if (deleteItems.RequestItems[TableName].length > 0) {
    promisses.push(dynamoDB.batchWriteItem(deleteItems).promise());
  }

  await Promise.all(promisses);
};

const deleteTable = async (TableName) => {
  await dynamoDB.deleteTable({ TableName }).promise();
};

const getItem = async (TableName, Key) => {
  if (Key["keys"]) {
    let keySchema = (await dynamoDB.describeTable({ TableName }).promise())
      .Table.KeySchema;
    let returnModel = {};
    keySchema.forEach((key) => {
      returnModel[key.AttributeName] = "";
    });
    return returnModel;
  } else {
    return (await dynamoDoc.get({ TableName, Key }).promise()).Item;
  }
};

const getTableSchema = async (TableName) => {
  const keyTypes = ["HASH", "RANGE"];
  let tableSchema = (await dynamoDB.describeTable({ TableName }).promise())
    .Table.KeySchema;
  return keyTypes
    .map((keyType) =>
      tableSchema.find((element) => element.KeyType === keyType)
    )
    .filter((keyType) => keyType)
    .map((keyType) => keyType.AttributeName);
};

const getMeta = async (TableName) => {
  return (await dynamoDB.describeTable({ TableName }).promise()).Table;
};

const saveItem = async (TableName, Item, keys) => {
  let keyString = "";
  keys.forEach((key) => {
    keyString += key + "=" + Item[key] + "&";
  });
  await dynamoDoc.put({ TableName, Item }).promise();
  return keyString;
};

const deleteItem = async (TableName, Key) => {
  await dynamoDoc.delete({ TableName, Key }).promise();
};

const createTable = async (tableRequest) => {
  let AttributeDefinitions = [
    {
      AttributeName: tableRequest.hashName,
      AttributeType: tableRequest.hashType,
    },
  ];
  let ProvisionedThroughput = {
    ReadCapacityUnits: tableRequest.read,
    WriteCapacityUnits: tableRequest.write,
  };
  let KeySchema = [
    {
      AttributeName: tableRequest.hashName,
      KeyType: "HASH",
    },
  ];
  if (tableRequest.rangeName) {
    KeySchema.push({
      AttributeName: tableRequest.rangeName,
      KeyType: "RANGE",
    });
    AttributeDefinitions.push({
      AttributeName: tableRequest.rangeName,
      AttributeType: tableRequest.rangeType,
    });
  }

  let GlobalSecondaryIndexes = [];
  let LocalSecondaryIndexes = [];

  getAttributeDefinitionsByIndex(tableRequest.indexes, AttributeDefinitions);
  getIndexToCreate(tableRequest.indexes.globalIndex, GlobalSecondaryIndexes);
  getIndexToCreate(tableRequest.indexes.localIndex, LocalSecondaryIndexes);

  GlobalSecondaryIndexes = GlobalSecondaryIndexes.length
    ? GlobalSecondaryIndexes
    : undefined;

  LocalSecondaryIndexes = LocalSecondaryIndexes.length
    ? LocalSecondaryIndexes
    : undefined;

  let table = {
    TableName: tableRequest.name,
    AttributeDefinitions,
    KeySchema,
    ProvisionedThroughput,
    GlobalSecondaryIndexes,
    LocalSecondaryIndexes,
  };
  return dynamoDB.createTable(table).promise();
};

const getAttributeDefinitionsByIndex = (indexes, list) => {
  indexes.globalIndex.map((element) => {
    list.push({
      AttributeName: element.hashName,
      AttributeType: element.hashType,
    });
    if (element.rangeName) {
      list.push({
        AttributeName: element.rangeName,
        AttributeType: element.rangeType,
      });
    }
  });

  indexes.localIndex.map((element) => {
    list.push({
      AttributeName: element.hashName,
      AttributeType: element.hashType,
    });
    if (element.rangeName) {
      list.push({
        AttributeName: element.rangeName,
        AttributeType: element.rangeType,
      });
    }
  });
};

const getIndexToCreate = (indexes, list) => {
  indexes.map((index) => {
    let KeySchema = [];

    KeySchema.push({
      AttributeName: index.hashName,
      KeyType: "HASH",
    });
    if (index.rangeName) {
      KeySchema.push({
        AttributeName: index.rangeName,
        KeyType: "RANGE",
      });
    }

    list.push({
      IndexName: index.name,
      KeySchema,
      Projection: {
        ProjectionType: "ALL",
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: index.read,
        WriteCapacityUnits: index.write,
      },
    });
  });
};

exports.listItems = listItems;
exports.purgeTable = purgeTable;
exports.listTables = listTables;
exports.deleteTable = deleteTable;
exports.getItem = getItem;
exports.getMeta = getMeta;
exports.saveItem = saveItem;
exports.deleteItem = deleteItem;
exports.createTable = createTable;
