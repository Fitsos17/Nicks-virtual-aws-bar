const createResponse = (statusCode, data) => {
  return {
    statusCode: statusCode,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
};

const ERROR_CONSTANTS = {
  // general errors
  INCORRECT_ID: {
    code: "INCORRECT_ID",
    errorMessage:
      "The id you've entered is incorrect. Please enter an existing id!",
  },
  INCORRECT_QUERY_PARAM: {
    code: "INCORRECT_QUERY_PARAM",
    errorMessage: "The query parameters you entered is incorrect!",
  },

  // seats
  SEAT_BODY_PARAMS_INCORRECT: {
    code: "SEAT_BODY_PARAMS_INCORRECT",
    errorMessage:
      "Please enter the id of the seat and the action you want to perform!",
  },

  SEAT_BODY_ABSENT: {
    code: "SEAT_BODY_ABSENT",
    errorMessage:
      "You have not entered the id of the seat or the action you want to perform.",
  },

  SEAT_INCORRECT_ACTION: {
    code: "SEAT_INCORRECT_ACTION",
    errorMessage:
      "The action you performed is incorrect. You can only sit or leave!",
  },
  // for seats ddb response
  SEAT_INCORRECT_ACTION_OR_ID: {
    code: "SEAT_INCORRECT_ACTION_OR_ID",
    errorMessage:
      "The id you entered is incorrect or someone just took/left this seat. Please enter a different action/id!",
  },

  // orders
  ORDERS_INCORRECT_BODY: {
    code: "ORDERS_INCORRECT_BODY",
    errorMessage:
      "The body you have entered is incorrect. You must enter the seatId and the drinks you want to order, including the id and the quantity of each drink.",
  },
  ORDER_SEAT_ID_INORRECT: {
    code: "ORDER_SEAT_ID_INORRECT",
    errorMessage:
      "The seatId you entered does not exist. Enter a different one and try again!",
  },
  ORDER_SEAT_NOT_TAKEN: {
    code: "ORDER_SEAT_NOT_TAKEN",
    errorMessage: "To order from a specific table, you firstly must sit in it!",
  },
};

// used for handling bad orders
const createErrorFunctions = {
  // for invalid drink structure and quantity 0
  invalidDrinkStructure: (drinkObject, missingKey) => ({
    code: "INVALID_DRINK_STRUCTURE",
    errorMessage:
      "One of the objects you entered has incorrect structure. All of the objects must have a valid drinkId and a quantity > 0.",
    drinkObject: drinkObject,
    missingKey: missingKey,
  }),
  invalidQuantity: (drinkObject) => ({
    code: "INVALID_QUANTITY",
    errorMessage: `The drink object that has drinkId: ${drinkObject["drinkId"]} has invalid quantity. Quantity must be > 0 and an integer.`,
    quantityEntered: drinkObject["quantity"],
  }),
  invalidOrderId: (drinkId) => ({
    code: "INVALID_DRINK_ID",
    errorMessage:
      "The following drinkId does not correspond to any drink from the catalog. Please enter a different id and try again!",
    drinkId: drinkId,
  }),
};

const handleReturningOfRouteFunctions = (body) => {
  // Check if the body includes an error message key.
  // If so, return an error
  if (Object.keys(body).includes("errorMessage")) {
    return createResponse(400, { error: body });
  }
  return createResponse(200, body);
};

const handleReturningOfUpdateFunctions = (tableName, statusCode, error) => {
  if (statusCode === 200) {
    return createResponse(200, `Updated table: ${tableName} successfully`);
  } else if (statusCode === 500) {
    return createResponse(
      500,
      `An error occured, so the update operation on the table: ${tableName} is stopped. Error: ${error}`
    );
  } else {
    return createResponse(tableName, statusCode, error);
  }
};

module.exports = {
  ERROR_CONSTANTS,
  handleReturningOfRouteFunctions,
  handleReturningOfUpdateFunctions,
  createErrorFunctions,
};
