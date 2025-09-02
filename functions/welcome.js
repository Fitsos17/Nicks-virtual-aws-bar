const {
  handleReturningOfRouteFunctions,
  SET_OF_ERRORS,
} = require("./helpers/handleErrorsAndReturning");

exports.handler = async (event) => {
  let body;
  body = {
    welcome: "Helo everybody and welcome to nicks' bar! 🍻",
    tablesAndSunbeds:
      "Find all of the free tables and sunbeds in the /seats route. Grab a seat and enjoy a refreshing drink! 🪑",
    calatalog:
      "You can find the catalog with all of the drinks in the /catalog route. Find which drink you want the most and order it! 🍹",
    order:
      "When you are ready to order, go to the /order route and enter the id of the drink you want to order. Our experienced barmen will make them as quickly and as soon as possible, so you'll have a great experience! 🍾",
  };

  return handleReturningOfRouteFunctions(body);
};
