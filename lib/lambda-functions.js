const { Function, Runtime, Code } = require("aws-cdk-lib/aws-lambda");
const { Construct } = require("constructs");
const { RemovalPolicy, Resource } = require("aws-cdk-lib");
const { LogGroup } = require("aws-cdk-lib/aws-logs");

class LambdaFunctionsClass extends Construct {
  constructor(scope, id) {
    super(scope, id);
    this.getTheCorrectFunction = this.getTheCorrectFunction;

    // Lambda functions
    // IMPLEMENT
    this.welcomeFunction = this.#createLambdaFunction("welcome");
    this.catalogFunction = this.#createLambdaFunction("catalog");
  }

  allFunctions = {};

  getTheCorrectFunction(name) {
    return this.allFunctions[name];
  }

  #createLambdaFunction(name) {
    /* This function creates an aws lambda function and a cloudwatch log group. It accepts the parameter
    name, which will be the name of the function*/

    // create the cloudwatch log group in which the lambda function sends all the logs
    const logGroup = new LogGroup(this, `${name}-log-group`, {
      logGroupName: `${name}-log-group`,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const fn = new Function(this, name, {
      code: Code.fromAsset("functions"),
      handler: `${name}.handler`,
      runtime: Runtime.NODEJS_22_X,
      logGroup: logGroup,
      functionName: name,
    });
    let resource;
    if (name == "welcome") {
      resource = "/";
    } else {
      resource = name;
    }
    this.allFunctions[resource] = fn;
    // create and return the lambda function
    return fn;
  }
}

module.exports = LambdaFunctionsClass;
