const { createResponse } = require("./helpers/createResponse");
const {
  createScanCommand,
  createGetItemCommand,
} = require("./helpers/createCommands");

const setOfProblems = {
  QUERY_STRING_PARAMS_ABSENT:
    "You have not entered the id of the table you want to seat in!",
  INCORRECT_ID:
    "The id you've entered is incorrect. Please enter an existing id!",
  INCORRECT_QUERY_PARAM: "The query parameter you entered is incorrect!",
  SEAT_IS_TAKEN: "This seat is taken by another customer. Select another seat!",
  SEAT_IS_NOT_TAKEN: "This seat is not taken. Do you maybe want to sit in it?",
  WRONG_ACTION:
    "The action you performed is incorrect. You can only sit or leave!",
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
          body = seat ? seat : setOfProblems.INCORRECT_ID;
        } else {
          // User entered wrong query string parameter
          body = setOfProblems.INCORRECT_QUERY_PARAM;
        }
      } else {
        body = await createScanCommand("seats");
      }
      break;

    case "POST":
      /* TODO: Add database integration */

      // User must specify the id of the seat he wants. Then he must specify the action sit or leave
      let params = event["queryStringParameters"];
      if (!params || !("id" in params)) {
        body = setOfProblems.QUERY_STRING_PARAMS_ABSENT;
      }
      let seatIndex = seats.findIndex((seat) => seat.id == params.id);
      // If the seat is not found then the seat variable will have a negative value.
      if (seatIndex < 0) body = setOfProblems.INCORRECT_ID;

      // check the action
      if (params["action"] == "sit") {
        if (seats[seatIndex].taken) body = setOfProblems.SEAT_IS_TAKEN;
        else {
          seats[seatIndex].taken = true;
          body = {
            sat: "Thank you for sitting at my bar. Check our catalog in /catalog and whenever you are ready order at /order! 🍾",
          };
        }
      } else if (params["action"] == "leave") {
        if (!seats[seatIndex].taken) body = setOfProblems.SEAT_IS_NOT_TAKEN;
        else {
          seats[seatIndex].taken = false;
          body = {
            left: "Thanks for sitting in my bar! I hope to see you soon 👋",
          };
        }
      } else {
        body = setOfProblems.WRONG_ACTION;
      }
      break;
  }
  if (Object.values(setOfProblems).includes(body)) {
    return createResponse("400", `An error occured: ${body}`);
  }
  return createResponse("200", body);
};
