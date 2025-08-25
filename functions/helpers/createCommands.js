const docClient = require("./docClient");
const {
  BatchWriteCommand,
  ScanCommand,
  GetCommand,
  UpdateCommand,
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

exports.createScanCommand = async (tableName) => {
  const command = new ScanCommand({ TableName: tableName });
  const response = await docClient.send(command);
  const items = response["Items"];
  return items;
};

exports.createUpdateItemCommand = async (
  tableName,
  id,
  attrName,
  attrValue
) => {
  try {
    const command = new UpdateCommand({
      TableName: tableName,
      Key: {
        id: Number(id),
      },
      UpdateExpression: "SET #status = :newStatus",
      ConditionExpression: "attribute_exists(id) AND #status <> :newStatus",
      ExpressionAttributeNames: {
        "#status": attrName,
      },
      ExpressionAttributeValues: {
        ":newStatus": attrValue,
      },
    });

    await docClient.send(command);
  } catch (error) {
    if (error.name === "ConditionalCheckFailedException") {
      // Item does not exist or status is equal to the current status.
      // Example: if user gives id = -1 and that item does not exist,
      // then the condition will fail. If the user wants to sit in a seat
      // and the seat is taken, then again the condition will fail.

      return "PROBLEM";
    }
  }
};
