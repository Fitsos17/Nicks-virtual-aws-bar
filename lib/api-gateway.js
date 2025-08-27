const {
  RestApi,
  LambdaIntegration,
  ResponseType,
} = require("aws-cdk-lib/aws-apigateway");
const { Construct } = require("constructs");
const jsonRoutesAndMethods = require("../json/routesAndMethods.json");

class Api extends Construct {
  constructor(scope, id, getTheCorrectFunction) {
    super(scope, id);

    const api = new RestApi(this, "self_service_api", {
      restApiName: "self_service_api",
    });

    let data = jsonRoutesAndMethods.data;

    // Wrong path parameters (status code 404)
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
    data.forEach((dataObject) => {
      const { route, methods } = dataObject;
      const integration = new LambdaIntegration(getTheCorrectFunction(route));

      let resource =
        route === "/"
          ? api.root
          : api.root.addResource(route, { defaultIntegration: integration });
      methods.forEach((method) => resource.addMethod(method, integration));
    });
  }
}

module.exports = Api;
