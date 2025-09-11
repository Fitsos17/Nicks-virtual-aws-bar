const {
  ERROR_CONSTANTS,
  handleReturningOfRouteFunctions,
} = require("/opt/handleErrorsAndReturning");

const {
  createScanCommand,
  createGetCommand,
  createUpdateCommand,
  createQueryCommand,
} = require("/opt/createCommands");

const ACTION_MESSAGES = {
  SAT: {
    sat: "You have taken this seat. Check our catalog in /catalog and whenever you are ready order at /order! 🍾",
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
      // User entered an id of a seat. Check if the seat exists or return an error
      else if (queryParams["id"]) {
        const seatId = queryParams["id"];
        if (Number.isNaN(seatId)) {
          body = ERROR_CONSTANTS.INCORRECT_DATA_TYPE;
          break;
        }

        const seat = await createGetCommand("Seats", seatId);
        body = seat ? seat : ERROR_CONSTANTS.INCORRECT_ID;
      } else if (queryParams["seatType"]) {
        // use json.parse because value in command
        // will be example `"sunbed"`
        const type = queryParams["seatType"];
        const result = await createQueryCommand(
          "Seats",
          "SeatTypeIndex",
          "type",
          type
        );
        body =
          result.length !== 0 ? result : ERROR_CONSTANTS.INCORRECT_SEAT_TYPE;
      } else {
        // incorrect query param
        body = ERROR_CONSTANTS.INCORRECT_QUERY_PARAM;
      }

      break;

    case "PATCH":
      // User must specify the id of the seat he wants. Then he must specify the action sit or leave
      let eventBody = event["body"] ? JSON.parse(event["body"]) : "";
      if (!eventBody) {
        body = ERROR_CONSTANTS.SEAT_BODY_ABSENT;
        break;
      }
      let paramsKeys = Object.keys(eventBody);
      if (
        paramsKeys.length === 0 ||
        !paramsKeys.includes("id") ||
        !paramsKeys.includes("action")
      ) {
        body = ERROR_CONSTANTS.SEAT_BODY_PARAMS_INCORRECT;
        break;
      }
      const action = eventBody["action"].toLowerCase();
      const id = eventBody["id"];
      if (action !== "sit" && action !== "leave") {
        body = ERROR_CONSTANTS.SEAT_INCORRECT_ACTION;
      } else if (Number.isNaN(id)) {
        body = ERROR_CONSTANTS.INCORRECT_DATA_TYPE;
      } else {
        // If action is sit, then value of sit varibable will be true. If action is leave,
        // then sit is false. Action is surely either sit or leave (it is checked aboved)
        const sit = action === "sit";

        // if the action is sit, we want the seat to be taken after the request and
        // if the action is leave, we want the seat to not be taken after the request.
        const taken = sit ? true : false;
        const change = await createUpdateCommand("Seats", id, "taken", taken);

        if (change === "PROBLEM") {
          body = ERROR_CONSTANTS.SEAT_INCORRECT_ACTION_OR_ID;
          break;
        }
        body = sit ? ACTION_MESSAGES.SAT : ACTION_MESSAGES.LEFT;
      }

      break;
  }

  return handleReturningOfRouteFunctions(body);
};
