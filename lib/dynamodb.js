const { RemovalPolicy } = require("aws-cdk-lib");
const { TableV2, AttributeType } = require("aws-cdk-lib/aws-dynamodb");
const { Construct } = require("constructs");

class DBTables extends Construct {
  constructor(scope, id, lambdaFunctions) {
    super(scope, id);
    // add tables
    this.seats = this.#createTable("seats");
    this.catalogTable = this.#createTable("catalog");

    // grant permissions to lambda functions
    for (let [name, properties] of Object.entries(
      lambdaFunctions.grantDDBPermissions
    )) {
      const { fn, operations } = properties;
      const tableMappedToFunction = this.allTables[name];

      if (operations.read && operations.write) {
        tableMappedToFunction.grantReadWriteData(fn);
      } else if (operations.read) {
        tableMappedToFunction.grantReadData(fn);
      } else if (operations.write) {
        tableMappedToFunction.grantWriteData(fn);
      }
    }
  }

  // in this object all of the tables will be stored
  allTables = {};

  #createTable(name) {
    const table = new TableV2(this, name, {
      removalPolicy: RemovalPolicy.DESTROY,
      tableName: name,
      partitionKey: { name: "id", type: AttributeType.STRING },
    });

    this.allTables[name] = table;

    return table;
  }
}

module.exports = DBTables;
