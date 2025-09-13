const { RemovalPolicy } = require("aws-cdk-lib");
const { EventBus, Rule } = require("aws-cdk-lib/aws-events");
const { Construct } = require("constructs");

class EventBuses extends Construct {
  constructor(scope, id) {
    super(scope, id);
    this.ordersEventBus = new EventBus(this, "ordersEventBus", {
      eventBusName: "OrdersEventBus",
    });
    this.ordersEventBus.applyRemovalPolicy(RemovalPolicy.DESTROY);

    // also, create another rule for the payments
    // Different detailtype -> OrderPayment
  }

  createRule = (name, detailTypeArray, targetsArray) => {
    return new Rule(this, name, {
      eventPattern: {
        source: ["virtual.bar.order.aws"],
        detailType: detailTypeArray,
      },
      eventBus: this.ordersEventBus,
      ruleName: name,
      targets: targetsArray,
    });
  };
}

module.exports = EventBuses;
