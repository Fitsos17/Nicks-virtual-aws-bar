const { Stack } = require("aws-cdk-lib");
const LambdaFunctionsClass = require("./lambda-functions");
const Api = require("./api-gateway");
const DBTables = require("./dynamodb");
const EventBuses = require("./eventbridge");

class SelfServiceOrderingStack extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    const tables = new DBTables(this, "tables");

    const buses = new EventBuses(this, "eventbridgeOrders");

    const lambdaFunctions = new LambdaFunctionsClass(
      this,
      "lambda_functions",
      tables.tableARNs,
      buses.ordersEventBus.eventBusArn
    );

    new Api(this, "api", lambdaFunctions.getTheCorrectApiGatewayFunction);
  }
}

module.exports = { SelfServiceOrderingStack };
