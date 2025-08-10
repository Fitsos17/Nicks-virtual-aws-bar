const docClient = require("./docClient");
const { GetItemCommand, ScanCommand } = require("@aws-sdk/client-dynamodb");
const { BatchWriteCommand } = require("@aws-sdk/lib-dynamodb");

exports.createBatchWriteCommand = async (tableName, items) => {
  const input = {
    RequestItems: {
      [tableName]: items.map((item) => ({
        PutRequest: {
          Item: item,
        },
      })),
    },
  };
  const command = new BatchWriteCommand(input);

  await docClient.send(command);
};

exports.createGetItemCommand = async (tableName, id) => {
  return { id, nid: Number(id) };

  const command = new GetItemCommand({
    TableName: tableName,
    Key: {
      id: Number(id),
    },
  });
  const response = await docClient.send(command);
  return response["Item"];
};

// Bale edw ta create response. Try catch gia problhmata + implement ta alla (seats kai tetoia)
// Psaxe pws ginetai to unmarshalling apo to response + seats
exports.createScanCommand = async (table) => {
  const command = new ScanCommand({ TableName: table });
  const response = await docClient.send(command);
  const items = response["Item"];
  return items;
};
