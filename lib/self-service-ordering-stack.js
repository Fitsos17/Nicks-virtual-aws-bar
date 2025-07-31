const { Stack } = require("aws-cdk-lib");
const LambdaFunctionsClass = require("./lambda-functions");
const Api = require("./api-gateway");

class SelfServiceOrderingStack extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    const Functions = new LambdaFunctionsClass(this, "lambda-functions");

    const api = new Api(this, "api", Functions);
  }
}

module.exports = { SelfServiceOrderingStack };
