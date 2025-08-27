const { createResponse } = require("./helpers/createResponse");

exports.handler = async (event) => {
  return createResponse(200, "Order page");
};
