const { RemovalPolicy } = require("aws-cdk-lib");
const { TableV2, AttributeType } = require("aws-cdk-lib/aws-dynamodb");
const { InvocationType, Trigger } = require("aws-cdk-lib/triggers");
const { Construct } = require("constructs");

class DBTables extends Construct {
  constructor(scope, id, getAllDDBFunctions) {
    super(scope, id);
    // create tables
<<<<<<< HEAD
    this.seats = this.#createTable("seats");
    this.catalogTable = this.#createTable("catalog");
    this.ordersTable = this.#createTable("orders");
=======
    this.seats = this.#createTable("Seats");
    this.catalogTable = this.#createTable("Catalog");
    this.ordersTable = this.#createTable("Orders");
>>>>>>> 82dd3bc (Changed table to function mapping functionallity, changed README and added err object)

    const functions = getAllDDBFunctions();

    // grant permissions to lambda functions
    for (let [functionName, properties] of Object.entries(functions)) {
<<<<<<< HEAD
      const { fn, permissions } = properties;

      // Functions such as update_catalog or update_seats must be mapped to the correct table.
      // We check which table is included inside the name of the function and we map that
      // table to the function.
      const tableNameMappedToFunction = Object.keys(this.allTables).filter(
        (key) => functionName.includes(key)
      );
      const tableMappedToFunction = this.allTables[tableNameMappedToFunction];

      // Check if we didn't find any table. This means that:
      // 1. The lambda function has incorrect name or
      // 2. The table does not exist
      if (!tableMappedToFunction) {
=======
      const { fn, tableName, permissions } = properties;

      const table = this.allTables[tableName];

      // Check if we didn't find any table. This means that:
      // the tablename we entered is incorrect (it doesn't exist)
      if (!table) {
>>>>>>> 82dd3bc (Changed table to function mapping functionallity, changed README and added err object)
        throw new Error(
          `Couldn't find table associated with the function: ${functionName}`
        );
      }

      if (permissions.read && permissions.write) {
<<<<<<< HEAD
        tableMappedToFunction.grantReadWriteData(fn);
      } else if (permissions.read) {
        tableMappedToFunction.grantReadData(fn);
      } else if (permissions.write) {
        tableMappedToFunction.grantWriteData(fn);
=======
        table.grantReadWriteData(fn);
      } else if (permissions.read) {
        table.grantReadData(fn);
      } else if (permissions.write) {
        table.grantWriteData(fn);
>>>>>>> 82dd3bc (Changed table to function mapping functionallity, changed README and added err object)
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
