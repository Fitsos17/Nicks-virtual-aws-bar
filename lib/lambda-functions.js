const {
  Function,
  Runtime,
  Code,
  LayerVersion,
  Architecture,
} = require("aws-cdk-lib/aws-lambda");
const { Construct } = require("constructs");
const { RemovalPolicy } = require("aws-cdk-lib");
const { LogGroup } = require("aws-cdk-lib/aws-logs");
const { Trigger, InvocationType } = require("aws-cdk-lib/triggers");
const {
  createPolicyStatement,
  DYNAMODB_ACTIONS,
  BEDROCK_ACTIONS,
} = require("./IAMStatements");

// folder names that specify in which folder of "functions/" will the lambda functions be
const TYPES = { CUSTOMER: "customers", SELLER: "sellers", TRIGGER: "triggers" };

class LambdaFunctionsClass extends Construct {
  constructor(scope, id, tableARNs) {
    super(scope, id);
    this.helperLayer = new LayerVersion(this, "helpers_layer", {
      layerVersionName: "helpers-layer",
      removalPolicy: RemovalPolicy.DESTROY,
      code: Code.fromAsset("layers/nodejs"),
      compatibleRuntimes: [Runtime.NODEJS_22_X],
      compatibleArchitectures: [Architecture.X86_64],
      description: "A lambda layer with helper functions.",
    });
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
    const fn = this.#createFunction(name, TYPES.CUSTOMER);

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

        const statement = createPolicyStatement(resources, config.actions);

        fn.addToRolePolicy(statement);
      }
    }

    return fn;
  }

  #createUpdateFunction(name, tableARN) {
    const fn = this.#createFunction(name, TYPES.TRIGGER);
    const ddbPermissionsStatement = createPolicyStatement(
      [tableARN],
      [DYNAMODB_ACTIONS.BATCH_WRITE_ITEM]
    );

    const bedrockPermissionStatement = createPolicyStatement(
      ["*"],
      [BEDROCK_ACTIONS.INVOKE_MODEL]
    );

    fn.addToRolePolicy(ddbPermissionsStatement);
    fn.addToRolePolicy(bedrockPermissionStatement);

    // this trigger will execute the lambda functions on init
    // to update the catalog and seats tables
    new Trigger(this, `update_table_${name}`, {
      handler: fn,
      invocationType: InvocationType.EVENT,
    });

    return fn;
  }

  #createFunction(name, type) {
    /* This function creates an aws lambda function and a cloudwatch log group */

    if (!type)
      throw new Error(
        `You must enter a type from the TYPES object (in fn: ${name})`
      );

    // create the cloudwatch log group in which the lambda function sends all the logs
    const logGroup = new LogGroup(this, `${name}_log_group`, {
      logGroupName: `${name}_log_group`,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // create the lambda function
    const fn = new Function(this, name, {
      code: Code.fromAsset(`functions/${type}`),
      handler: `${name}.handler`,
      runtime: Runtime.NODEJS_22_X,
      architecture: Architecture.X86_64,
      logGroup: logGroup,
      functionName: name,
      layers: [this.helperLayer],
    });

    fn.applyRemovalPolicy(RemovalPolicy.DESTROY);

    return fn;
  }
}

module.exports = LambdaFunctionsClass;
