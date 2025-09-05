const { RemovalPolicy } = require("aws-cdk-lib");
const { EventBus, Rule } = require("aws-cdk-lib/aws-events");
const { Construct } = require("constructs");

class EventBuses extends Construct {
  constructor(scope, id, publishers, targets) {
    super(scope, id);
    // publishers -> objects with functions
    // targets -> objects with functions+queues

    // define orders event bus and grant permissions to orders fn
    const ordersEventBus = new EventBus(this, "orders_event_bus", {
      eventBusName: "ordersEventBus",
    });
    for (let key in publishers) {
      ordersEventBus.grantPutEventsTo(publishers[key]);
    }
    ordersEventBus.applyRemovalPolicy(RemovalPolicy.DESTROY);

    const orderRule = new Rule(this, "orders_rule", {
      ruleName: "ordersRule",
      eventBus: ordersEventBus,
      eventPattern: {
        source: ["custom.nicks.virtual.bar"],
        detailType: "order",
      },
    });

    for (let key in targets) {
      orderRule.addTarget(targets[key]);
    }

    this.ordersEventBus = ordersEventBus;
  }
}

module.exports = EventBuses;
