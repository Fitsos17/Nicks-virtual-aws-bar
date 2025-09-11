const docClient = require("/opt/docClient");
const {
  BatchWriteCommand,
  ScanCommand,
  GetCommand,
  UpdateCommand,
  QueryCommand,
  PutCommand,
} = require("@aws-sdk/lib-dynamodb");

const createScanGetInput = (initialInput, attributesToGetArray) => {
  // for seats we need to check only seats that are not taken
  let finalInput =
    initialInput["TableName"] === "Seats"
      ? { ...initialInput, FilterExpression: "taken <> false" }
      : { ...initialInput };

  if (attributesToGetArray) {
    finalInput["ProjectionExpression"] = attributesToGetArray
      .map((val) => `#${val}`)
      .join(", ");
    finalInput["ExpressionAttributeNames"] = attributesToGetArray.reduce(
      (acc, val) => {
        acc[`#${val}`] = val;
        return acc;
      },
      {}
    );
  }

  return finalInput;
};

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
exports.createScanCommand = async (tableName, attributesToGetArray) => {
  try {
    const initialInput = { TableName: tableName };
    const input = createScanGetInput(initialInput, attributesToGetArray);

    const command = new ScanCommand(input);

    const response = await docClient.send(command);
    const items = response["Items"];
    return items;
  } catch (error) {
    throw new Error(error);
  }
};

exports.createGetCommand = async (tableName, id, attributesToGetArray) => {
  try {
    const initialInput = {
      TableName: tableName,
      Key: {
        id: id,
      },
    };

    const input = createScanGetInput(initialInput, attributesToGetArray);

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
        id: id,
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
