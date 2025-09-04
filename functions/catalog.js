const {
  createGetCommand,
  createScanCommand,
} = require("./helpers/createCommands");
const {
  ERROR_CONSTANTS,
  handleReturningOfRouteFunctions,
} = require("./helpers/handleErrorsAndReturning");

exports.handler = async (event) => {
  let body;

  // User types the id of the drink. If he doesn't, he gets all the drinks.
  const queryParameters = event["queryStringParameters"];
  if (!queryParameters) {
    body = await createScanCommand("Catalog");
  } else if (!Object.keys("id")) {
    body = ERROR_CONSTANTS.INCORRECT_DATA_TYPE;
  } else {
    const idParameter = +queryParameters["id"];
    if (Number.isNaN(idParameter)) {
      body = ERROR_CONSTANTS.INCORRECT_DATA_TYPE;
    } else {
      const drink = await createGetCommand("Catalog", idParameter);

      body = drink ? drink : ERROR_CONSTANTS.INCORRECT_ID;
    }
  }

  return handleReturningOfRouteFunctions(body);
};
