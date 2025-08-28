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
  QUERY_STRING_PARAMS_ABSENT: "You have not entered the id.",
  BODY_PARAMS_INCORRECT:
    "Please enter the id of the seat and the action you want to perform!",
  SEAT_BODY_ABSENT: "You have not entered the id of the seat or the action.",
  INCORRECT_ID:
    "The id you've entered is incorrect. Please enter an existing id!",
  INCORRECT_QUERY_PARAM: "The query parameter you entered is incorrect!",
  INCORRECT_ACTION:
    "The action you performed is incorrect. You can only sit or leave!",
  INCORRECT_ACTION_OR_ID:
    "The id you entered is incorrect or someone just took/left this seat. Please enter a different action/id!",
  INVALID_METHOD: "Invalid method!",
  DRINK_NOT_FOUND:
    "The drink you tried to search was not found. Enter a different id and try again!",
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
