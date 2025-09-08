const { Function, Runtime, Code } = require("aws-cdk-lib/aws-lambda");
const { Construct } = require("constructs");
const { RemovalPolicy } = require("aws-cdk-lib");
const { LogGroup } = require("aws-cdk-lib/aws-logs");
const { Trigger, InvocationType } = require("aws-cdk-lib/triggers");
const { createPolicyStatement, DYNAMODB_ACTIONS } = require("./IAMStatements");

class LambdaFunctionsClass extends Construct {
  constructor(scope, id, tableARNs) {
    super(scope, id);
    // Lambda functions that handle requests from the api gateway.
    this.#createRouteFunction("welcome");
    this.#createRouteFunction("catalog", {
      [tableARNs.Catalog]: {
        actions: [DYNAMODB_ACTIONS.GET_ITEM, DYNAMODB_ACTIONS.SCAN],
      },
    });
    this.#createRouteFunction("seats", {
      [tableARNs.Seats]: {
        actions: [
          DYNAMODB_ACTIONS.QUERY,
          DYNAMODB_ACTIONS.GET_ITEM,
          DYNAMODB_ACTIONS.SCAN,
          DYNAMODB_ACTIONS.UPDATE_ITEM,
        ],
        indexes: ["SeatTypeIndex"],
      },
    });
    this.#createRouteFunction("orders", {
      [tableARNs.Orders]: {
        actions: [
          DYNAMODB_ACTIONS.QUERY,
          DYNAMODB_ACTIONS.GET_ITEM,
          DYNAMODB_ACTIONS.PUT_ITEM,
        ],
        indexes: ["SeatIdIndex"],
      },
      [tableARNs.Catalog]: { actions: [DYNAMODB_ACTIONS.GET_ITEM] },
      [tableARNs.Seats]: { actions: [DYNAMODB_ACTIONS.GET_ITEM] },
    });

    // Lambda functions that update the seats and the catalog tables on initialization.
    this.#createUpdateFunction("updateCatalogTrigger", tableARNs["Catalog"]);
    this.#createUpdateFunction("updateSeatsTrigger", tableARNs["Seats"]);
  }

  ///// OBJECTS
  // in this object, all of the route functions will be assigned
  #apiGatewayFunctions = {};

  ////// PUBLIC GETTERS (use arrow functions to automatically bind "this")
  getTheCorrectApiGatewayFunction = (name) => {
    return this.#apiGatewayFunctions[name];
  };

  //////// PRIVATE METHODS
  #createRouteFunction(name, permissions) {
    const fn = this.#createFunction(name);

    let resource = name === "welcome" ? "/" : name;

    this.#apiGatewayFunctions[resource] = fn;

    if (permissions) {
      for (let [tableARN, config] of Object.entries(permissions)) {
        const resources = [tableARN];
        if (
          "indexes" in config &&
          (!Array.isArray(config.indexes) || config.indexes.length === 0)
        ) {
          throw new Error(
            `Table indexes you pass to functions must be a non empty array (else don't pass indexes at all). fn: ${name}, config: ${config}`
          );
        }

        config.indexes
          ? config.indexes.forEach((index) =>
              resources.push(`${tableARN}/index/${index}`)
            )
          : "";

        const statement = createPolicyStatement(
          name,
          resources,
          config.actions
        );

        fn.addToRolePolicy(statement);
      }
    }

    return fn;
  }

  #createUpdateFunction(name, tableARN) {
    const fn = this.#createFunction(name);
    const statement = createPolicyStatement(
      name,
      [tableARN],
      [DYNAMODB_ACTIONS.BATCH_WRITE_ITEM]
    );

    fn.addToRolePolicy(statement);

    // this trigger will execute the lambda functions on init
    // to update the catalog and seats tables
    new Trigger(this, `update_table_${name}`, {
      handler: fn,
      invocationType: InvocationType.EVENT,
    });

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

    fn.applyRemovalPolicy(RemovalPolicy.DESTROY);

    return fn;
  }
}

module.exports = LambdaFunctionsClass;
