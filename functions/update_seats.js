const { BatchWriteCommand } = require("@aws-sdk/lib-dynamodb");
const docClient = require("./helpers/ddbClient");
const { createResponse } = require("./helpers/createResponse");
const {
  createBatchWriteCommandInput,
} = require("./helpers/createBatchWriteCommandInput");

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

  try {
    const command = new BatchWriteCommand(
      createBatchWriteCommandInput("seats", seats)
    );

    await docClient.send(command);

    return createResponse("200", "Updated seats table successfully");
  } catch (error) {
    return createResponse(
      "500",
      "An error occured, so the update operation is stopped. Error: " + error
    );
  }
};
