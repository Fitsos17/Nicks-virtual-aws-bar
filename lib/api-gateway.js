const {
  RestApi,
  LambdaIntegration,
  ResponseType,
} = require("aws-cdk-lib/aws-apigateway");
const { Construct } = require("constructs");
const jsonRoutesAndMethods = require("./RoutesAndMethods.json");

class Api extends Construct {
  constructor(scope, id, Functions) {
    super(scope, id);

    const api = new RestApi(this, "self-service-api", {
      restApiName: "self-service-api",
    });

    let data = jsonRoutesAndMethods.data;

    // Wrong URL
    api.addGatewayResponse("Default4XX", {
      type: ResponseType.DEFAULT_4XX,
      statusCode: "400",
      responseHeaders: {
        "application/JSON": JSON.stringify(
          "Incorrect URL! If you are sure this is the correct page, please check your permissions, otherwise go to another route."
        ),
      },
    });

    // add all routes and all methods to the api
    for (let i = 0; i < data.length; i++) {
      const integration = new LambdaIntegration(
        Functions.getFunction(data[i].route)
      );

      let resource;
      if (data[i].route == "/") {
        resource = api.root;
      } else {
        resource = api.root.addResource(data[i].route, {
          defaultIntegration: integration,
        });
      }

      // data[i].methods.map((method) => resource.addMethod(method));
      for (let j = 0; j < data[i].methods.length; j++) {
        resource.addMethod(data[i].methods[j]);
      }
    }
  }
}

module.exports = Api;
