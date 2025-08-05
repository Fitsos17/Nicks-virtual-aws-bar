const { RemovalPolicy } = require("aws-cdk-lib");
const { TableV2, AttributeType } = require("aws-cdk-lib/aws-dynamodb");
const { InvocationType, Trigger } = require("aws-cdk-lib/triggers");
const { Construct } = require("constructs");

class DBTables extends Construct {
  constructor(scope, id, lambdaFunctions) {
    super(scope, id);
    // create tables
    this.seats = this.#createTable("seats");
    this.catalogTable = this.#createTable("catalog");

    // grant permissions to lambda functions
    for (let [name, properties] of Object.entries(
      lambdaFunctions.grantDDBPermissions
    )) {
      const { fn, operations } = properties;

      // Functions such as update_catalog or update_seats must be mapped to the correct table.
      // We check which table is included inside the name of the function and we map that
      // table to the function.
      const tableNameMappedToFunction = Object.keys(this.allTables).filter(
        (key) => name.includes(key)
      );
      const tableMappedToFunction = this.allTables[tableNameMappedToFunction];

      if (operations.read && operations.write) {
        tableMappedToFunction.grantReadWriteData(fn);
      } else if (operations.read) {
        tableMappedToFunction.grantReadData(fn);
      } else if (operations.write) {
        tableMappedToFunction.grantWriteData(fn);
      }
    }

    // Update seats and catalog tables after creation
    this.#updateTableOfFunction(
      lambdaFunctions.updateCatalogTable,
      "update_catalog"
    );

    this.#updateTableOfFunction(
      lambdaFunctions.updateSeatsTable,
      "update_seats"
    );
    /* IDEASSSSSS */
    // - create update_seats function, add functionallity for accessing ddb within the catalog.js and seats.js files,
    // - add functionallity for generating catalogs with aws bedrock and eventbridge, add ordering with sqs and eventbridge
    // - add a new property (minutes) that say in how many minutes the drinks will be ready and price of drink
    // - add a your-drink route where it shows the status of the drink (ready/not ready) (need to store somehow
    // identity of user so we keep track of drink and send the status)
    // - add pay route (cash or credit) with the money that you need to pay. After POST, unlock leave
    // - sqs and eventbridge for ordering (if ready) and paying
    // - functionallity for not being able to leave if the customer doesn't pay
  }

  // in this object all of the tables will be stored
  allTables = {};

  #createTable(name) {
    const table = new TableV2(this, name, {
      removalPolicy: RemovalPolicy.DESTROY,
      tableName: name,
      partitionKey: { name: "id", type: AttributeType.NUMBER },
    });

    this.allTables[name] = table;

    return table;
  }

  #updateTableOfFunction(fn, name) {
    return new Trigger(this, `update_table_${name}`, {
      handler: fn,
      invocationType: InvocationType.EVENT,
    });
  }
}

module.exports = DBTables;
