const {
  SET_OF_PROBLEMS,
  handleReturningOfRouteFunctions,
} = require("./helpers/handleErrorsAndReturning");

exports.handler = async (event) => {
  let body;

  switch (event.httpMethod) {
    case "GET":
      let params = event["queryStringParameters"];
      if (!params) body = SET_OF_PROBLEMS.QUERY_STRING_PARAMS_ABSENT;
      else {
      }
      break;
    default:
      break;
  }

  return handleReturningOfRouteFunctions(body);
};
