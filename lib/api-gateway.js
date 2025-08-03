const {
  RestApi,
  LambdaIntegration,
  ResponseType,
} = require("aws-cdk-lib/aws-apigateway");
const { Construct } = require("constructs");
const jsonRoutesAndMethods = require("../json/routesAndMethods.json");

class Api extends Construct {
  constructor(scope, id, functions) {
    super(scope, id);

    const api = new RestApi(this, "self-service-api", {
      restApiName: "self-service-api",
    });

    let data = jsonRoutesAndMethods.data;

    // Wrong URL
    api.addGatewayResponse("Default4XX", {
      type: ResponseType.DEFAULT_4XX,
      statusCode: "404",
      templates: {
        "application/JSON": JSON.stringify({
          error:
            "Incorrect URL or method! If you are sure this is the correct page and the correct method, please check your permissions, otherwise go to another route and contact the owner.",
        }),
      },
    });

    // add all routes and all methods to the api
    for (let i = 0; i < data.length; i++) {
      const integration = new LambdaIntegration(
        functions.getTheCorrectFunction(data[i].route)
      );

      if (data[i].route == "/") {
        api.root.addMethod("GET", integration);
      } else {
        let resource = api.root.addResource(data[i].route, {
          defaultIntegration: integration,
        });

        for (let j = 0; j < data[i].methods.length; j++) {
          resource.addMethod(data[i].methods[j]);
        }
      }
    }
  }
}

module.exports = Api;
