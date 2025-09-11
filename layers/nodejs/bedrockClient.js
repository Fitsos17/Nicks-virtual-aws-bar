const { BedrockRuntimeClient } = require("@aws-sdk/client-bedrock-runtime");

const bedrockClient = new BedrockRuntimeClient({ region: "us-east-1" });

module.exports = bedrockClient;
