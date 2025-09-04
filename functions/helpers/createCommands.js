const docClient = require("./docClient");
const {
  BatchWriteCommand,
  ScanCommand,
  GetCommand,
  UpdateCommand,
  QueryCommand,
  PutCommand,
} = require("@aws-sdk/lib-dynamodb");

// for update functions
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

// get items
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

exports.createGetCommand = async (tableName, id, projectionExpression = []) => {
  try {
    let input = {
      TableName: tableName,
      Key: {
        id: id,
      },
    };

    // here we check if we want specific values from the objects
    // example: if we want only the id and the name ddb returns only that
    if (
      typeof projectionExpression === "object" &&
      projectionExpression.length !== 0
    ) {
      // convert to the form -> "id, name, "
      input["ProjectionExpression"] = projectionExpression
        .map((val) => `#${val}`)
        .join(", ");
      input["ExpressionAttributeNames"] = projectionExpression.reduce(
        (acc, val) => {
          acc[`#${val}`] = val;
          return acc;
        },
        {}
      );
    }
    const command = new GetCommand(input);
    const response = await docClient.send(command);
    return response["Item"];
  } catch (error) {
    throw new Error(error);
  }
};

exports.createQueryCommand = async (tableName, indexName, pk, value) => {
  try {
    const input = {
      TableName: tableName,
      IndexName: indexName,
      KeyConditionExpression: "#pk = :val",
      ExpressionAttributeNames: {
        "#pk": pk,
      },
      ExpressionAttributeValues: {
        ":val": value,
      },
    };

    console.log(input);
    const command = new QueryCommand(input);
    const result = await docClient.send(command);
    return result["Items"];
  } catch (error) {
    throw new Error(error);
  }
};

// update items
exports.createUpdateCommand = async (tableName, id, attrName, attrValue) => {
  try {
    const command = new UpdateCommand({
      TableName: tableName,
      Key: {
        id: +id,
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

// create items
exports.createPutCommand = async (tableName, item) => {
  try {
    const input = {
      TableName: tableName,
      Item: item,
    };
    const command = new PutCommand(input);
    await docClient.send(command);
  } catch (error) {
    throw new Error(error);
  }
};
