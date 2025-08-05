const { Function, Runtime, Code } = require("aws-cdk-lib/aws-lambda");
const { Construct } = require("constructs");
const { RemovalPolicy } = require("aws-cdk-lib");
const { LogGroup } = require("aws-cdk-lib/aws-logs");

class LambdaFunctionsClass extends Construct {
  constructor(scope, id) {
    super(scope, id);
    // Here we have the lambda functions that handle requests from the api gateway.
    this.welcomeFunction =
      this.#createFunctionsForIntegrationWithApiGWDynamoDB("welcome");
    this.catalogFunction = this.#createFunctionsForIntegrationWithApiGWDynamoDB(
      "catalog",
      {
        read: true,
        write: false,
      }
    );
    this.seatsFunction = this.#createFunctionsForIntegrationWithApiGWDynamoDB(
      "seats",
      {
        read: true,
        write: true,
      }
    );

    // Here we have special functions that update the seats and the catalog
    // tables on initialization.
    this.updateCatalogTable =
      this.#createFunctionsForIntegrationWithApiGWDynamoDB(
        "update_catalog",
        {
          read: false,
          write: true,
        },
        false
      );
    this.updateSeatsTable =
      this.#createFunctionsForIntegrationWithApiGWDynamoDB(
        "update_seats",
        { read: false, write: true },
        false
      );
  }

  // in this object, all of the functions will be assigned
  apiGatewayFunctions = {};
  // in this object all of the functions that need to get read/write actions to the ddb table will be assigned
  grantDDBPermissions = {};

  getTheCorrectApiGatewayFunction(name) {
    return this.apiGatewayFunctions[name];
  }

  #createFunctionsForIntegrationWithApiGWDynamoDB(
    name,
    ddbActions,
    apiGwIntegration = true
  ) {
    // Here we create the functions and we give the necessary permissions to them.
    // name: the name of the function we want to create
    // ddbActions: the permissions that we want to grant to the function. It's an object with properties: {read: true/false, write: true/false}
    // apiGwIntegration: by default it's true, because most of the functions will act as a handler of the api gateway requests
    const fn = this.createFunction(name);

    if (apiGwIntegration) {
      let resource;
      if (name == "welcome") {
        resource = "/";
      } else {
        resource = name;
      }

      this.apiGatewayFunctions[resource] = fn;
    }

    if (ddbActions) {
      this.grantDDBPermissions[name] = {
        fn: fn,
        operations: ddbActions,
      };
    }
    // create and return the lambda function
    return fn;
  }

  createFunction(name) {
    /* This function creates an aws lambda function and a cloudwatch log group. It accepts the parameter
    name, which will be the name of the function*/

    // create the cloudwatch log group in which the lambda function sends all the logs
    const logGroup = new LogGroup(this, `${name}-log-group`, {
      logGroupName: `${name}-log-group`,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // In "code" key, we check if the name of the function includes the word "update".
    // If so, the code for the lambda function is included inside the functions/updateFunctions
    // folder, so we point it out.
    const fn = new Function(this, name, {
      code: Code.fromAsset("functions"),
      handler: `${name}.handler`,
      runtime: Runtime.NODEJS_22_X,
      logGroup: logGroup,
      functionName: name,
    });

    return fn;
  }
}

module.exports = LambdaFunctionsClass;
