const { PolicyStatement, Effect } = require("aws-cdk-lib/aws-iam");

const DYNAMODB_ACTIONS = {
  BATCH_GET_ITEM: "dynamodb:BatchGetItem",
  BATCH_WRITE_ITEM: "dynamodb:BatchWriteItem",
  GET_ITEM: "dynamodb:GetItem",
  PUT_ITEM: "dynamodb:PutItem",
  DELETE_ITEM: "dynamodb:DeleteItem",
  UPDATE_ITEM: "dynamodb:UpdateItem",
  SCAN: "dynamodb:Scan",
  QUERY: "dynamodb:Query",
};

// I create inline policies, because the roles are always changing
// (different actions and different resources)
const createPolicyStatement = (name, resources, actions) => {
  if (!Array.isArray(actions)) {
    throw new Error(
      `Actions and tableARNs must be an array, but you passed something else. actions: ${actions} AND tableARNs: ${tableARNs}`
    );
  }

  return new PolicyStatement({
    sid: `${name}Statement${Math.floor(Math.random() * 10000)}`,
    effect: Effect.ALLOW,
    actions: actions,
    resources: resources,
  });
};

module.exports = { createPolicyStatement, DYNAMODB_ACTIONS };
