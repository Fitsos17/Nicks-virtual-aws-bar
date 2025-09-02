const {
  SET_OF_ERRORS,
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
      if (!queryParams) {
        body = await createScanCommand("Seats");
        break;
      }

      const seatId = queryParams["id"];
      if (seatId) {
        // User entered an id of a seat. Check if the seat exists or return an error
        const seat = await createGetItemCommand("Seats", seatId);
        body = seat ? seat : SET_OF_ERRORS.INCORRECT_ID;
      } else {
        // User entered wrong query string parameter
        body = SET_OF_ERRORS.INCORRECT_QUERY_PARAM;
      }

      break;

    case "PATCH":
      // User must specify the id of the seat he wants. Then he must specify the action sit or leave
      let eventBody = event["body"] ? JSON.parse(event["body"]) : "";
      if (!eventBody) {
        body = SET_OF_ERRORS.BODY_ABSENT;
        break;
      }
      let paramsKeys = Object.keys(eventBody);
      if (
        paramsKeys.length === 0 ||
        !paramsKeys.includes("id") ||
        !paramsKeys.includes("action")
      ) {
        body = SET_OF_ERRORS.SEAT_BODY_PARAMS_INCORRECT;
      } else if (
        eventBody["action"].toLowerCase() !== "sit" &&
        eventBody["action"].toLowerCase() !== "leave"
      ) {
        body = SET_OF_ERRORS.INCORRECT_ACTION;
      } else {
        // If action is sit, then value of sit varibable will be true. If action is leave,
        // then sit is false. Action is surely either sit or leave (it is checked aboved)
        const sit = eventBody["action"].toLowerCase() === "sit";

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
          body = SET_OF_ERRORS.INCORRECT_ACTION_OR_ID;
          break;
        }
        body = sit ? ACTION_MESSAGES.SAT : ACTION_MESSAGES.LEFT;
      }

      break;
    default:
      body = SET_OF_ERRORS.INVALID_METHOD;
      break;
  }

  return handleReturningOfRouteFunctions(body);
};
