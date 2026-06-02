#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import "source-map-support/register";
import { ApiStack } from "../lib/stacks/api-stack";
import { AuthStack } from "../lib/stacks/auth-stack";

const app = new cdk.App();

const authStack = new AuthStack(app, "MtgDeckBuilderAuthStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || "us-east-1",
  },
  description: "Authentication stack for Deck Brew",
});

new ApiStack(app, "MtgDeckBuilderApiStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || "us-east-1",
  },
  description: "Api stack for Deck Brew",
  userPool: authStack.userPool,
});
