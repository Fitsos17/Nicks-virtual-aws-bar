const { Function, Runtime, Code } = require("aws-cdk-lib/aws-lambda");
const { Construct } = require("constructs");
const { RemovalPolicy } = require("aws-cdk-lib");
const { LogGroup } = require("aws-cdk-lib/aws-logs");

class LambdaFunctionsClass extends Construct {
  constructor(scope, id) {
    super(scope, id);
    // Lambda functions that handle requests from the api gateway.
    this.welcomeFunction = this.#createRouteFunction("welcome");
    this.catalogFunction = this.#createRouteFunction("catalog", {
<<<<<<< HEAD
      read: true,
      write: false,
    });
    this.seatsFunction = this.#createRouteFunction("seats", {
      read: true,
      write: true,
    });
    this.ordersFunction = this.#createRouteFunction("orders", {
      read: true,
      write: true,
    });

    // Lambda functions that update the seats and the catalog tables on initialization.
    this.updateCatalogTable = this.#createUpdateFunction("update_catalog");
    this.updateSeatsTable = this.#createUpdateFunction("update_seats");
=======
      tableName: "Catalog",
      permissions: {
        read: true,
        write: false,
      },
    });
    this.seatsFunction = this.#createRouteFunction("seats", {
      tableName: "Seats",
      permissions: {
        read: true,
        write: true,
      },
    });
    this.ordersFunction = this.#createRouteFunction("orders", {
      tableName: "Orders",
      permissions: {
        read: true,
        write: true,
      },
    });

    // Lambda functions that update the seats and the catalog tables on initialization.
    this.updateCatalogTable = this.#createUpdateFunction(
      "update_catalog",
      "Catalog"
    );
    this.updateSeatsTable = this.#createUpdateFunction("update_seats", "Seats");
>>>>>>> 82dd3bc (Changed table to function mapping functionallity, changed README and added err object)
  }

  ///// OBJECTS
  // in this object, all of the route functions will be assigned
  #apiGatewayFunctions = {};

  // in this object all of the functions that need to get read/write permissions
  // to the ddb table will be assigned
  #grantDDBPermissionsToFunctions = {};

  ////// PUBLIC GETTERS (use arrow functions to automatically bind "this")
  getTheCorrectApiGatewayFunction = (name) => {
    return this.#apiGatewayFunctions[name];
  };

  getAllDDBFunctions = () => {
    return this.#grantDDBPermissionsToFunctions;
  };

  //////// PRIVATE METHODS
<<<<<<< HEAD
  #createRouteFunction(name, ddbPermissions) {
=======
  #createRouteFunction(name, ddbConfig) {
>>>>>>> 82dd3bc (Changed table to function mapping functionallity, changed README and added err object)
    const fn = this.#createFunction(name);

    let resource = name === "welcome" ? "/" : name;

    this.#apiGatewayFunctions[resource] = fn;

<<<<<<< HEAD
    if (ddbPermissions) {
      this.#grantDDBPermissionsToFunctions[name] = {
        fn: fn,
        permissions: ddbPermissions,
=======
    if (ddbConfig) {
      this.#grantDDBPermissionsToFunctions[name] = {
        fn: fn,
        tableName: ddbConfig.tableName,
        permissions: ddbConfig.permissions,
>>>>>>> 82dd3bc (Changed table to function mapping functionallity, changed README and added err object)
      };
    }

    return fn;
  }

<<<<<<< HEAD
  #createUpdateFunction(name) {
=======
  #createUpdateFunction(name, tableName) {
>>>>>>> 82dd3bc (Changed table to function mapping functionallity, changed README and added err object)
    const fn = this.#createFunction(name);

    // update functions should always have write permissions
    this.#grantDDBPermissionsToFunctions[name] = {
      fn: fn,
<<<<<<< HEAD
=======
      tableName: tableName,
>>>>>>> 82dd3bc (Changed table to function mapping functionallity, changed README and added err object)
      permissions: {
        read: false,
        write: true,
      },
    };

    return fn;
  }

  #createFunction(name) {
    /* This function creates an aws lambda function and a cloudwatch log group. It accepts the parameter
    name, which will be the name of the function*/

    // create the cloudwatch log group in which the lambda function sends all the logs
    const logGroup = new LogGroup(this, `${name}_log_group`, {
      logGroupName: `${name}_log_group`,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // create the lambda function
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
