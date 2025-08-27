const { RemovalPolicy } = require("aws-cdk-lib");
const { TableV2, AttributeType } = require("aws-cdk-lib/aws-dynamodb");
const { InvocationType, Trigger } = require("aws-cdk-lib/triggers");
const { Construct } = require("constructs");

class DBTables extends Construct {
  constructor(scope, id, getAllDDBFunctions) {
    super(scope, id);
    // create tables
    this.seats = this.#createTable("seats");
    this.catalogTable = this.#createTable("catalog");

    const functions = getAllDDBFunctions();

    // grant permissions to lambda functions
    for (let [functionName, properties] of Object.entries(functions)) {
      const { fn, permissions } = properties;

      // Functions such as update_catalog or update_seats must be mapped to the correct table.
      // We check which table is included inside the name of the function and we map that
      // table to the function.
      const tableNameMappedToFunction = Object.keys(this.allTables).filter(
        (key) => functionName.includes(key)
      );
      const tableMappedToFunction = this.allTables[tableNameMappedToFunction];

      if (permissions.read && permissions.write) {
        tableMappedToFunction.grantReadWriteData(fn);
      } else if (permissions.read) {
        tableMappedToFunction.grantReadData(fn);
      } else if (permissions.write) {
        tableMappedToFunction.grantWriteData(fn);
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
