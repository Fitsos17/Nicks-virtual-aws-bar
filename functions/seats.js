const { createResponse } = require("./helpers/createResponse");
const {
  createScanCommand,
  createGetItemCommand,
  createUpdateItemCommand,
} = require("./helpers/createCommands");

const SET_OF_PROBLEMS = {
  QUERY_STRING_PARAMS_ABSENT: "You have not entered the id of the table.",
  BODY_ABSENT: "You have not entered the id of the seat or the action.",
  INCORRECT_ID:
    "The id you've entered is incorrect. Please enter an existing id!",
  INCORRECT_QUERY_PARAM: "The query parameter you entered is incorrect!",
  INCORRECT_ACTION:
    "The action you performed is incorrect. You can only sit or leave!",
  INCORRECT_ACTION_OR_ID:
    "The action you performed or the id you entered is incorrect. Please change the action or the id and try again!",
};

const ACTION_MESSAGES = {
  SAT: "You have taken this sit. Check our catalog in /catalog and whenever you are ready order at /order! 🍾",
  LEFT: "Thanks for sitting at my bar! I hope to see you soon 👋",
};

exports.handler = async (event) => {
  let body;

  switch (event.httpMethod) {
    case "GET":
      // User types the id of the seat. If he doesn't, he gets all the seats.
      let queryParams = event["queryStringParameters"];
      if (queryParams) {
        const seatId = queryParams["id"];
        if (seatId) {
          // User entered an id of a seat. Check if the seat exists or return an error
          const seat = await createGetItemCommand("seats", seatId);
          body = seat ? seat : SET_OF_PROBLEMS.INCORRECT_ID;
        } else {
          // User entered wrong query string parameter
          body = SET_OF_PROBLEMS.INCORRECT_QUERY_PARAM;
        }
      } else {
        body = await createScanCommand("seats");
      }
      break;

    case "PATCH":
      // User must specify the id of the seat he wants. Then he must specify the action sit or leave
      let params = event["body"];
      if (!params) {
        body = SET_OF_PROBLEMS.BODY_ABSENT;
      } else {
        let paramsKeys = Object.keys(params);
        if (
          paramsKeys.length === 0 ||
          !paramsKeys.includes("id") ||
          !paramsKeys.includes("action")
        ) {
          body = SET_OF_PROBLEMS.QUERY_STRING_PARAMS_ABSENT;
        } else if (params["action"] !== "sit" && params["action"] !== "leave") {
          body = SET_OF_PROBLEMS.INCORRECT_ACTION;
        } else {
          // If action is sit, then sit is true. If action is leave, then sit is false.
          // Action is surely either sit or leave
          const sit = params["action"] === "sit";

          // if the action is sit, we want the seat to be taken after the request and
          // if the action is leave, we want the seat to not be taken after the request.
          const taken = sit ? true : false;
          const change = await createUpdateItemCommand(
            "seats",
            params["id"],
            "taken",
            taken
          );

          if (change === "PROBLEM") {
            body = SET_OF_PROBLEMS.INCORRECT_ACTION_OR_ID;
          } else {
            body = sit ? ACTION_MESSAGES.SAT : ACTION_MESSAGES.LEFT;
          }
        }
      }

      break;
    default:
      body = "Invalid method!";
      break;
  }
  if (Object.values(SET_OF_PROBLEMS).includes(body)) {
    return createResponse("400", `An error occured: ${body}`);
  }
  return createResponse("200", body);
};
