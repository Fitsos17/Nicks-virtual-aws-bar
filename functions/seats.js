const {
  SET_OF_PROBLEMS,
  handleReturningOfRouteFunctions,
} = require("./helpers/handleErrorsAndReturning");

const {
  createScanCommand,
  createGetItemCommand,
  createUpdateItemCommand,
} = require("./helpers/createCommands");

const ACTION_MESSAGES = {
  SAT: {
    sat: "You have taken this sit. Check our catalog in /catalog and whenever you are ready order at /order! 🍾",
  },
  LEFT: { left: "Thanks for sitting at my bar! I hope to see you soon 👋" },
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
          const seat = await createGetItemCommand("Seats", seatId);
          body = seat ? seat : SET_OF_PROBLEMS.INCORRECT_ID;
        } else {
          // User entered wrong query string parameter
          body = SET_OF_PROBLEMS.INCORRECT_QUERY_PARAM;
        }
      } else {
        body = await createScanCommand("Seats");
      }
      break;

    case "PATCH":
      // User must specify the id of the seat he wants. Then he must specify the action sit or leave
      let eventBody = event["body"] ? JSON.parse(event["body"]) : "";
      if (!eventBody) {
        body = SET_OF_PROBLEMS.BODY_ABSENT;
      } else {
        let paramsKeys = Object.keys(eventBody);
        if (
          paramsKeys.length === 0 ||
          !paramsKeys.includes("id") ||
          !paramsKeys.includes("action")
        ) {
          body = SET_OF_PROBLEMS.BODY_PARAMS_INCORRECT;
        } else if (
          eventBody["action"] !== "sit" &&
          eventBody["action"] !== "leave"
        ) {
          body = SET_OF_PROBLEMS.INCORRECT_ACTION;
        } else {
          // If action is sit, then sit is true. If action is leave, then sit is false.
          // Action is surely either sit or leave
          const sit = eventBody["action"] === "sit";

          // if the action is sit, we want the seat to be taken after the request and
          // if the action is leave, we want the seat to not be taken after the request.
          const taken = sit ? true : false;
          const change = await createUpdateItemCommand(
            "Seats",
            eventBody["id"],
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
      body = SET_OF_PROBLEMS.INVALID_METHOD;
      break;
  }

  return handleReturningOfRouteFunctions(body);
};
