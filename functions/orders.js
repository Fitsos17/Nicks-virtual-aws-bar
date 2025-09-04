const {
  createGetCommand,
  createPutCommand,
} = require("./helpers/createCommands");
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
   * An order is deleted when it is served and paid. Order is deleted when the user leaves the seat.
   */

  const checkInvalidDrinksStructure = (drinksArray) => {
    for (let drink of drinksArray) {
      const keys = Object.keys(drink);
      if (!keys.includes("drinkId")) {
        return createErrorFunctions.invalidDrinkStructure(drink, "drinkId");
      } else if (!keys.includes("quantity")) {
        return createErrorFunctions.invalidDrinkStructure(drink, "quantity");
      }
      const drinkId = +drink["drinkId"];
      const quantity = +drink["quantity"];
      if (Number.isNaN(drinkId) || Number.isNaN(quantity)) {
        return ERROR_CONSTANTS.INCORRECT_DATA_TYPE;
      } else if (quantity <= 0 || quantity % 1 !== 0) {
        return createErrorFunctions.invalidQuantity(drink);
      }
    }
    return "";
  };

  const createOrderObject = async (drinksArray) => {
    // if the drinkId is in the catalog, then this function
    // will return an object that contains all of the drinks names,
    // ids and the total price
    const drinksArrayForOrder = [];
    let total = 0;
    for (let drinkObject of drinksArray) {
      // I do not use batch get, because if we query 10 items and the
      // 5th item does not exist, then we will get 9 items with the
      // batch command and then we need to check which is missing,
      // but with the single get we will get 4 and then we will have
      // the id of the non existant drink.
      const drinkId = +drinkObject.drinkId;
      const quantity = +drinkObject.quantity;
      const drink = await createGetCommand("Catalog", drinkId, [
        "name",
        "price",
      ]);
      if (!drink) {
        // if the drink does not exist return an error
        return createErrorFunctions.invalidOrderId(drinkId);
      }
      total += drink.price * quantity;
      drinksArrayForOrder.push({ drinkId, name: drink["name"], quantity });
    }
    return { drinksOrdered: drinksArrayForOrder, totalPrice: total };
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

      // 1. Check for seatId if it exists and if it is taken (else we return error)
      const seatId = +eventBody["seatId"];
      if (Number.isNaN(seatId)) {
        body = ERROR_CONSTANTS.INCORRECT_DATA_TYPE;
        break;
      }
      const foundSeat = await createGetCommand("Seats", seatId, [
        "id",
        "taken",
      ]);
      if (!foundSeat) {
        body = ERROR_CONSTANTS.ORDER_SEAT_ID_INORRECT;
        break;
      } else if (!foundSeat.taken) {
        body = ERROR_CONSTANTS.ORDER_SEAT_NOT_TAKEN;
        break;
      }

      // 2. Check drinks structure if is of type [ { drinkId, quantity } ]
      const drinks = eventBody["drinks"];
      const invalidDrinkStucture = checkInvalidDrinksStructure(drinks);
      if (invalidDrinkStucture) {
        body = invalidDrinkStucture;
        break;
      }

      // 3. Loop to find if the drinks exists (get ["id", "price"]) and setup order
      const orderObject = await createOrderObject(drinks);

      if (Object.keys(orderObject).includes("errorMessage")) {
        // if the orderObject includes an errorMessage, then
        // one of the drink ids entered was not found. So the
        // drinkObject will be the error object so we assign
        // that to the body and return it.
        body = orderObject;
        break;
      }

      // Create unique order id with time point and seat id.
      const time = Math.round(new Date().getTime());
      const orderId = `${time}_${seatId}`;

      orderObject["id"] = orderId;
      orderObject["seatId"] = seatId;
      orderObject["createdAt"] = time;
      orderObject["paid"] = false;
      orderObject["status"] = "pending";

      /* For now I will put items directly to ddb */
      await createPutCommand("Orders", orderObject);

      // 5. Put to eventbridge -> sqs  -> orders table

      // 6. Return {"message": "Your order is in the making. In the meantime, you can enjoy the view
      // and pay for your drinks. I hope you will enjoy your drink.",  order: {orderObject}}
      body = {
        message: `Your order is being processed. You can check the status of your drinks by going to this link: /orders?orderId=${orderId}. As the drinks are being made, you can pay and enjoy the beautiful view! 🌴`,
        yourOrder: {
          orderObject,
        },
      };
      break;
  }

  return handleReturningOfRouteFunctions(body);
};
