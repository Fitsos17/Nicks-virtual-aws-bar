const { createResponse } = require("./helpers/createResponse");
const docClient = require("./helpers/ddbClient");
const { ScanCommand, GetItemCommand } = require("@aws-sdk/client-dynamodb");

exports.handler = async (event) => {
  // DEVELOP FOR SINGLE ITEM IF QUERY PARAMETERS ARE GIVEN!! + input command to --helpers--
  const queryParameters = event["queryStringParameters"];
  if (queryParameters) {
    const idParameter = queryParameters["id"];
    if (!idParameter) {
      return createResponse(
        "400",
        "You have to pass the id query string parameter."
      );
    }
    const command = new GetItemCommand({
      TableName: "catalog",
      Key: {
        id: {
          N: idParameter,
        },
      },
    });
    const response = await docClient.send(command);
    const drink = response["Item"];

    return drink
      ? createResponse("200", drink)
      : createResponse(
          "400",
          `Drink with id: ${idParameter} not found. Enter a different id and try again!`
        );
  }

  // Keys: {id, name, ingredients, description, type}
  const command = new ScanCommand({ TableName: "catalog" });
  const response = await docClient.send(command);
  const items = response["Items"];
  return createResponse("200", items);
};
