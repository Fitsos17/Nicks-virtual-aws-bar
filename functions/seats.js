const setOfProblems = {
  QUERY_STRING_PARAMS_ABSENT:
    "You have not entered the id of the table you want to seat in!",
  INCORRECT_TYPE:
    "The type you've entered is incorrect. Please enter an existing type!",
  INCORRECT_ID:
    "The id you've entered is incorrect. Please enter an existing id!",
  INCORRECT_QUERY_PARAM: "The query parameter you entered is incorrect!",
  SEAT_IS_TAKEN: "This seat is taken by another customer. Select another seat!",
  SEAT_IS_NOT_TAKEN: "This seat is not taken. Do you maybe want to sit in it?",
  WRONG_ACTION:
    "The action you performed is incorrect. You can only sit or leave!",
};

exports.handler = async (event) => {
  const seats = [
    {
      id: 1,
      number_of_seats: 1,
      type: "bar stool",
      comments: "Near the entrance",
      taken: false,
    },
    {
      id: 2,
      number_of_seats: 1,
      type: "bar stool",
      comments: "Corner spot",
      taken: false,
    },
    {
      id: 3,
      number_of_seats: 1,
      type: "bar stool",
      comments: "Next to the counter",
      taken: false,
    },
    {
      id: 4,
      number_of_seats: 1,
      type: "bar stool",
      comments: "Under fan",
      taken: false,
    },
    {
      id: 5,
      number_of_seats: 1,
      type: "bar stool",
      comments: "Beside the window",
      taken: false,
    },
    {
      id: 6,
      number_of_seats: 1,
      type: "bar stool",
      comments: "Opposite the bar",
      taken: false,
    },
    {
      id: 7,
      number_of_seats: 1,
      type: "bar stool",
      comments: "By the shelf",
      taken: false,
    },
    {
      id: 8,
      number_of_seats: 1,
      type: "bar stool",
      comments: "Near the DJ booth",
      taken: false,
    },
    {
      id: 9,
      number_of_seats: 1,
      type: "bar stool",
      comments: "End of the counter",
      taken: false,
    },
    {
      id: 10,
      number_of_seats: 1,
      type: "bar stool",
      comments: "Center bar view",
      taken: false,
    },

    {
      id: 11,
      number_of_seats: 4,
      type: "table",
      tableType: "square",
      comments: "Near window",
      taken: false,
    },
    {
      id: 12,
      number_of_seats: 4,
      type: "table",
      tableType: "circle",
      comments: "Corner table",
      taken: false,
    },
    {
      id: 13,
      number_of_seats: 6,
      type: "table",
      tableType: "square",
      comments: "Large group",
      taken: false,
    },
    {
      id: 14,
      number_of_seats: 2,
      type: "table",
      tableType: "circle",
      comments: "Romantic spot",
      taken: false,
    },

    {
      id: 15,
      number_of_seats: 2,
      type: "sunbed",
      comments: "Poolside",
      taken: false,
    },
    {
      id: 16,
      number_of_seats: 2,
      type: "sunbed",
      comments: "Shaded area",
      taken: false,
    },
    {
      id: 17,
      number_of_seats: 2,
      type: "sunbed",
      comments: "Near palm tree",
      taken: false,
    },
    {
      id: 18,
      number_of_seats: 2,
      type: "sunbed",
      comments: "Ocean view",
      taken: false,
    },
    {
      id: 19,
      number_of_seats: 2,
      type: "sunbed",
      comments: "Quiet corner",
      taken: false,
    },
    {
      id: 20,
      number_of_seats: 2,
      type: "sunbed",
      comments: "Under umbrella",
      taken: false,
    },
  ];

  let body;

  switch (event.httpMethod) {
    case "GET":
      // User should add either the type of the seat he wants to sit in either the id of the seat.
      // If he doesn't, all of the seats will be returned to him.
      let queryParams = event["queryStringParameters"];
      if (queryParams) {
        if (queryParams["id"]) {
          // User entered an id of a seat. Check if the seat exists or return an error
          let findSeatId = seats.find((seat) => seat.id == queryParams.id);
          body = findSeatId ? findSeatId : setOfProblems.INCORRECT_ID;
        } else if (queryParams["type"]) {
          // User entered the type of a seat. Check if the type of the seat exists or return an error
          let findSeatType = seats.filter(
            (seat) => seat.type == queryParams["type"]
          );
          body =
            findSeatType.length !== 0
              ? findSeatType
              : setOfProblems.INCORRECT_TYPE;
        } else {
          // User entered wrong query string parameter
          body = setOfProblems.INCORRECT_QUERY_PARAM;
        }
      } else {
        body = seats;
      }
      break;

    case "POST":
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

function createResponse(statusCode, data) {
  return {
    statusCode: statusCode,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
}
