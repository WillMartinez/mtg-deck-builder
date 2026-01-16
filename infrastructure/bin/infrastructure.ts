#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { AuthStack } from "../lib/stacks/auth-stack";

const app = new cdk.App();

new AuthStack(app, "MtgDeckBuilderAuthStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || "us-east-1",
  },
  description: "Authentication stack for MTG Deck Builder",
});
