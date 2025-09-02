const { createGetItemCommand } = require("./helpers/createCommands");
const {
  handleReturningOfRouteFunctions,
  SET_OF_ERRORS,
} = require("./helpers/handleErrorsAndReturning");

exports.handler = async (event) => {
  let body;
  /********* STRUCTURE ****************/
  /**
   * Methods: GET, POST
   * seatId only => get all drinks, quantities, status and total price
   * setId and drinkId => get the drink, quantity, status and price
   * status -> peding | served
   * seat must have another attribute: payment: {total, paid, paymentMethod}
   * Orders handled by sqs, eventbridge and ddb
    {
      orderId: randomizer 5 χαρακτηρες + το seatid στο τελος ετσι θα ειναι unique,
      drinks: [
        {
          drinkId,
          quantity
        },
        ...
      ],
      total: 728 euros
      status: pending | served,
      paid: true | false
    }
  */

  switch (event.httpMethod) {
    case "POST":
      let eventBody = event["body"] ? JSON.parse(event["body"]) : "";
      // check for bad input
      if (!eventBody) {
        body = SET_OF_ERRORS.ORDERS_INCORRECT_BODY;
        break;
      } else if (
        !Object.keys(eventBody).includes("seatId") ||
        !Object.keys(eventBody).includes("drinks") ||
        eventBody["drinks"].length === 0
      ) {
        body = SET_OF_ERRORS.ORDERS_INCORRECT_BODY;
        break;
      }

      // check for seatId if it exists and if it is taken (else we return error)
      const seatId = Number(eventBody["seatId"]);
      const foundSeat = await createGetItemCommand("Seats", seatId);
      if (!foundSeat) {
        body = SET_OF_ERRORS.ORDER_SEAT_ID_INORRECT;
        break;
      } else if (!foundSeat.taken) {
        body = SET_OF_ERRORS.ORDER_SEAT_NOT_TAKEN;
        break;
      }
      body = foundSeat;
      break;
  }

  return handleReturningOfRouteFunctions(body);
};
