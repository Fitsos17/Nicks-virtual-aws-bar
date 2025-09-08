const { RemovalPolicy } = require("aws-cdk-lib");
const { TableV2, AttributeType } = require("aws-cdk-lib/aws-dynamodb");
const { Construct } = require("constructs");

class DBTables extends Construct {
  constructor(scope, id) {
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
  }

  // object in which all of the table arns will be stored
  tableARNs = {};

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

    this.tableARNs[name] = table.tableArn;

    return table;
  }
}

module.exports = DBTables;
