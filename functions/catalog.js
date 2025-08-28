const {
  createGetItemCommand,
  createScanCommand,
} = require("./helpers/createCommands");
const {
  SET_OF_PROBLEMS,
  handleReturningOfRouteFunctions,
} = require("./helpers/handleErrorsAndReturning");

exports.handler = async (event) => {
  let body;
  // User types the drink id. If he doesn't, he gets all the drinks.
  const queryParameters = event["queryStringParameters"];
  if (queryParameters) {
    const idParameter = queryParameters["id"];
    if (!idParameter) {
      body = SET_OF_PROBLEMS.QUERY_STRING_PARAMS_ABSENT;
    } else {
      const drink = await createGetItemCommand("Catalog", idParameter);

      body = drink ? drink : SET_OF_PROBLEMS.DRINK_NOT_FOUND;
    }
  } else {
    body = await createScanCommand("Catalog");
  }

  return handleReturningOfRouteFunctions(body);
};
