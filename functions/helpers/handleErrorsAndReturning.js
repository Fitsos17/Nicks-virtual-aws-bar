const createResponse = (statusCode, data) => {
  return {
    statusCode: statusCode,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
};

const SET_OF_ERRORS = {
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

const handleReturningOfRouteFunctions = (body) => {
  // Check if the body includes any of the errors. If so,
  // we need to return an error.
  if (Object.values(SET_OF_ERRORS).includes(body)) {
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
  SET_OF_ERRORS,
  handleReturningOfRouteFunctions,
  handleReturningOfUpdateFunctions,
};
