const { RemovalPolicy } = require("aws-cdk-lib");
const { TableV2, AttributeType } = require("aws-cdk-lib/aws-dynamodb");
const { InvocationType, Trigger } = require("aws-cdk-lib/triggers");
const { Construct } = require("constructs");

class DBTables extends Construct {
  constructor(scope, id, getAllDDBFunctions) {
    super(scope, id);
    // create tables
    this.catalogTable = this.#createTable("Catalog");
    this.seats = this.#createTable("Seats", {
      indexName: "SeatTypeIndex",
      pk: "type",
      type: AttributeType.STRING,
    });
    this.ordersTable = this.#createTable("Orders", {
      indexName: "SeatIdIndex",
      pk: "seatId",
      type: AttributeType.NUMBER,
    });

    const functions = getAllDDBFunctions();

    // grant permissions to lambda functions
    for (let [functionName, properties] of Object.entries(functions)) {
      const { fn, tableNames, permissions } = properties;

      if (typeof tableNames !== "object") {
        throw new Error(
          `Error with function ${functionName}: tableNames must be an array, regardless of how many tables it contains.`
        );
      }

      for (let tableName of tableNames) {
        const table = this.allTables[tableName];

        // Check if we didn't find any table. This means that:
        // the tablename we entered is incorrect (it doesn't exist)
        if (!table) {
          throw new Error(
            `Couldn't find table: ${tableName} associated with the function: ${functionName}`
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

  #createTable(name, secondaryIndex) {
    // could scale catalog and seats reads with read replicas

    // in orders, we need the id to be a string so we can make it unique
    const type =
      name !== "Orders" ? AttributeType.NUMBER : AttributeType.STRING;
    const table = new TableV2(this, name, {
      removalPolicy: RemovalPolicy.DESTROY,
      tableName: name,
      partitionKey: {
        name: "id",
        type: type,
      },
    });

    if (secondaryIndex) {
      // use global indexes because we want to get results based on the
      // new pk and not of the tables' original pk
      table.addGlobalSecondaryIndex({
        indexName: secondaryIndex.indexName,
        partitionKey: { name: secondaryIndex.pk, type: secondaryIndex.type },
      });
    }

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
