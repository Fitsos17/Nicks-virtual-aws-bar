const { createGetItemCommand } = require("./helpers/createCommands");
const {
  handleReturningOfRouteFunctions,
  ERROR_CONSTANTS,
  createErrorFunctions,
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

  const checkInvalidDrinksStructure = (drinksArray) => {
    for (let drink of drinksArray) {
      const keys = Object.keys(drink);
      if (!keys.includes("drinkId")) {
        return createErrorFunctions.invalidDrinkStructure(drink, "drinkId");
      } else if (!keys.includes("quantity")) {
        return createErrorFunctions.invalidDrinkStructure(drink, "quantity");
      } else if (
        Number(drink["quantity"]) <= 0 ||
        Number(drink["quantity"]) % 1 !== 0
      ) {
        return createErrorFunctions.invalidQuantity(drink);
      }
    }
    return "";
  };

  switch (event.httpMethod) {
    case "POST":
      let eventBody = event["body"] ? JSON.parse(event["body"]) : "";
      // check for bad input
      if (!eventBody) {
        body = ERROR_CONSTANTS.ORDERS_INCORRECT_BODY;
        break;
      } else if (
        !Object.keys(eventBody).includes("seatId") ||
        !Object.keys(eventBody).includes("drinks") ||
        eventBody["drinks"].length === 0
      ) {
        body = ERROR_CONSTANTS.ORDERS_INCORRECT_BODY;
        break;
      }

      // check for seatId if it exists and if it is taken (else we return error)
      const seatId = Number(eventBody["seatId"]);
      const foundSeat = await createGetItemCommand("Seats", seatId);
      if (!foundSeat) {
        body = ERROR_CONSTANTS.ORDER_SEAT_ID_INORRECT;
        break;
      } else if (!foundSeat.taken) {
        body = ERROR_CONSTANTS.ORDER_SEAT_NOT_TAKEN;
        break;
      }

      // check drinks structure if is of type [ { drinkId, quantity } ]
      const drinks = eventBody["drinks"];
      const invalidDrinkStucture = checkInvalidDrinksStructure(drinks);
      if (invalidDrinkStucture) {
        body = invalidDrinkStucture;
        break;
      }

      body = { seatId, drinks };

      /*****  Τσεκ αν βγαζει αοθτπουτ + τσεκ αν δεν υπαρχει σε καποιο απο τα ινπουτ καποιο
      κει. + φτιαξε τα ντρινκς ******/
      /* ΦΤΙΑΞΙΜΟ ΤΟ ΕΡΟΡ ΧΑΝΤΛΙΝΓΚ */
      break;
  }

  return handleReturningOfRouteFunctions(body);
};
