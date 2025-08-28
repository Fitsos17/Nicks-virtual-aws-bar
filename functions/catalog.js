const {
  createGetItemCommand,
  createScanCommand,
} = require("./helpers/createCommands");
const { createResponse } = require("./helpers/createResponse");

exports.handler = async (event) => {
  // User types the drink id. If he doesn't, he gets all the drinks.
  const queryParameters = event["queryStringParameters"];
  if (queryParameters) {
    const idParameter = queryParameters["id"];
    if (!idParameter) {
<<<<<<< HEAD
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
=======
      return createResponse("400", {
        err: "You have to pass the id query string parameter.",
      });
    }
    const drink = await createGetItemCommand("Catalog", idParameter);

    return drink
      ? createResponse("200", drink)
      : createResponse("400", {
          err: `Drink with id: ${idParameter} not found. Enter a different id and try again!`,
        });
  }

  const items = await createScanCommand("Catalog");
>>>>>>> 82dd3bc (Changed table to function mapping functionallity, changed README and added err object)
  return createResponse("200", items);
};
