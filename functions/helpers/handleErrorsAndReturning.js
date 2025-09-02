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
  QUERY_STRING_PARAMS_ABSENT: "You have not entered the id.",
  BODY_ABSENT: "You have not entered a body.",
  INVALID_METHOD: "Invalid method!",
  INCORRECT_ID:
    "The id you've entered is incorrect. Please enter an existing id!",
  INCORRECT_QUERY_PARAM: "The query parameters you entered is incorrect!",

  // seats
  SEAT_BODY_PARAMS_INCORRECT:
    "Please enter the id of the seat and the action you want to perform!",
  SEAT_BODY_ABSENT:
    "You have not entered the id of the seat or the action you want to perform.",
  INCORRECT_ACTION_OR_ID:
    "The id you entered is incorrect or someone just took/left this seat. Please enter a different action/id!",
  INCORRECT_ACTION:
    "The action you performed is incorrect. You can only sit or leave!",

  // orders
  ORDERS_INCORRECT_BODY:
    "The body you have entered is incorrect. You must enter the seatId and the drinks array, including the id of each drink and the quantity.",
};

const handleReturningOfRouteFunctions = (body) => {
  // Check if the body includes any of the errors. If so,
  // we need to return an error.
  if (Object.values(SET_OF_ERRORS).includes(body)) {
    return createResponse(400, { err: body });
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
