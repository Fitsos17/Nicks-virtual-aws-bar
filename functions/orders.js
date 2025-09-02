const {
  handleReturningOfRouteFunctions,
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
   */

  return handleReturningOfRouteFunctions(body);
};
