const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const ddbClient = new DynamoDBClient();

// use docClient for automatic marshall/unmarshall
const docClient = DynamoDBDocumentClient.from(ddbClient);

module.exports = docClient;
