const { RemovalPolicy } = require("aws-cdk-lib");
const { TableV2, AttributeType } = require("aws-cdk-lib/aws-dynamodb");
const { InvocationType, Trigger } = require("aws-cdk-lib/triggers");
const { Construct } = require("constructs");

class DBTables extends Construct {
  constructor(scope, id, getAllDDBFunctions) {
    super(scope, id);
    // create tables
    this.seats = this.#createTable("Seats");
    this.catalogTable = this.#createTable("Catalog");
    this.ordersTable = this.#createTable("Orders");

    const functions = getAllDDBFunctions();

    // grant permissions to lambda functions
    for (let [functionName, properties] of Object.entries(functions)) {
      const { fn, tableName, permissions } = properties;

      const table = this.allTables[tableName];

      // Check if we didn't find any table. This means that:
      // the tablename we entered is incorrect (it doesn't exist)
      if (!table) {
        throw new Error(
          `Couldn't find table associated with the function: ${functionName}`
        );
      }

      if (permissions.read && permissions.write) {
        table.grantReadWriteData(fn);
      } else if (permissions.read) {
        table.grantReadData(fn);
      } else if (permissions.write) {
        table.grantWriteData(fn);
      }
    }

    // Update seats and catalog tables after creation
    this.#updateTableOfFunction(
      functions["update_catalog"]["fn"],
      "update_catalog"
    );

    this.#updateTableOfFunction(
      functions["update_seats"]["fn"],
      "update_seats"
    );
  }

  // object in which all of the tables will be stored
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
