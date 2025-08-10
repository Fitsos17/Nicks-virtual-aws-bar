const {
  createGetItemCommand,
  createScanCommand,
} = require("./helpers/createCommands");
const { createResponse } = require("./helpers/createResponse");

exports.handler = async (event) => {
  const queryParameters = event["queryStringParameters"];
  if (queryParameters) {
    const idParameter = queryParameters["id"];
    if (!idParameter) {
      return createResponse(
        "400",
        "You have to pass the id query string parameter."
      );
    }
    const drink = await createGetItemCommand("catalog", idParameter);

    return drink
      ? createResponse("200", drink)
      : createResponse(
          "400",
          `Drink with id: ${idParameter} not found. Enter a different id and try again!`
        );
  }

  const items = await createScanCommand("catalog");
  return createResponse("200", items);
};
