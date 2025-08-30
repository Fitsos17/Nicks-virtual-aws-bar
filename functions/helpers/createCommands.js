const docClient = require("./docClient");
const {
  BatchWriteCommand,
  ScanCommand,
  GetCommand,
  UpdateCommand,
  BatchGetCommand,
} = require("@aws-sdk/lib-dynamodb");

exports.createBatchWriteCommand = async (tableName, items) => {
  try {
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
  } catch (error) {
    throw new Error(error);
  }
};

exports.createBatchGetCommand = async (tableName, ids, attributesToGet) => {
  try {
    const input = {
      RequestItems: {
        [tableName]: {
          Keys: ids.map((id) => ({ id })),
          // must be of form "xyz, jas, lso" with attributes that exist in each table
          ProjectionExpression: attributesToGet,
        },
      },
    };

    const result = await docClient.send(new BatchGetCommand(input));

    const items = result.Responses?.[tableName];

    return items;
  } catch (error) {
    throw new Error(error);
  }
};

exports.createGetItemCommand = async (tableName, id) => {
  try {
    const command = new GetCommand({
      TableName: tableName,
      Key: {
        id: Number(id),
      },
    });
    const response = await docClient.send(command);
    return response["Item"];
  } catch (error) {
    throw new Error(error);
  }
};

exports.createScanCommand = async (tableName) => {
  try {
    const command = new ScanCommand({ TableName: tableName });
    const response = await docClient.send(command);
    const items = response["Items"];
    return items;
  } catch (error) {
    throw new Error(error);
  }
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
    } else throw new Error(error);
  }
};
