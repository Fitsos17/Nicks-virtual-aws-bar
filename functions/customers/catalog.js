const { sendGetCommand, sendScanCommand } = require("/opt/sendCommands");
const {
  ERROR_CONSTANTS,
  handleReturningOfRouteFunctions,
} = require("/opt/handleErrorsAndReturning");

exports.handler = async (event) => {
  let body;

  // User types the id of the drink. If he doesn't, he gets all the drinks.
  const queryParameters = event["queryStringParameters"];
  if (!queryParameters) {
    body = await sendScanCommand("Catalog", ["id", "name"]);
  } else if (!Object.keys("id")) {
    body = ERROR_CONSTANTS.INCORRECT_DATA_TYPE;
  } else {
    const idParameter = queryParameters["id"];
    const drink = await sendGetCommand("Catalog", idParameter);

    body = drink ? drink : ERROR_CONSTANTS.INCORRECT_ID;
  }

  return handleReturningOfRouteFunctions(body);
};
