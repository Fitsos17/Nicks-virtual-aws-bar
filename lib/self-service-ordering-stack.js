const { Stack } = require("aws-cdk-lib");
const LambdaFunctionsClass = require("./lambda-functions");
const Api = require("./api-gateway");
const DBTables = require("./dynamodb");

class SelfServiceOrderingStack extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    const lambdaFunctions = new LambdaFunctionsClass(this, "lambda_functions");

    new Api(this, "api", lambdaFunctions.getTheCorrectApiGatewayFunction);

    new DBTables(this, "tables", lambdaFunctions.getAllDDBFunctions);
  }
}

module.exports = { SelfServiceOrderingStack };
