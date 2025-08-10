const docClient = require("./docClient");
const {
  BatchWriteCommand,
  ScanCommand,
  GetCommand,
} = require("@aws-sdk/lib-dynamodb");

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
  const command = new GetCommand({
    TableName: tableName,
    Key: {
      id: Number(id),
    },
  });
  const response = await docClient.send(command);
  return response["Item"];
};

exports.createScanCommand = async (table) => {
  const command = new ScanCommand({ TableName: table });
  const response = await docClient.send(command);
  const items = response["Items"];
  return items;
};
