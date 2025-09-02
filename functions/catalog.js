const {
  createGetItemCommand,
  createScanCommand,
} = require("./helpers/createCommands");
const {
  SET_OF_ERRORS,
  handleReturningOfRouteFunctions,
} = require("./helpers/handleErrorsAndReturning");

exports.handler = async (event) => {
  let body;

  // User types the id of the drink. If he doesn't, he gets all the drinks.
  const queryParameters = event["queryStringParameters"];
  if (!queryParameters) {
    body = await createScanCommand("Catalog");
  } else {
    const idParameter = queryParameters["id"];
    if (!idParameter) {
      body = SET_OF_ERRORS.INCORRECT_QUERY_PARAM;
    } else {
      const drink = await createGetItemCommand("Catalog", idParameter);

      body = drink ? drink : SET_OF_ERRORS.INCORRECT_ID;
    }
  }

  return handleReturningOfRouteFunctions(body);
};
