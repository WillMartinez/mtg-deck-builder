import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as nodejs from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import * as path from "path";
interface ApiStackProps extends cdk.StackProps {
  userPool: cognito.UserPool;
}

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);
    const table = new dynamodb.Table(this, "DecksTable", {
      partitionKey: { name: "userId", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "deckId", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // single handler that should be split later
    const deckHandler = new nodejs.NodejsFunction(this, "DeckHandler", {
      entry: path.join(__dirname, "../lambda/deck-handler/index.ts"),
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_20_X,
      environment: {
        DECKS_TABLE: table.tableName,
      },
    });

    table.grantReadWriteData(deckHandler);

    // create the rest API
    const restApi = new apigateway.RestApi(this, "MTGDeckBuilderApi", {
      restApiName: "MTGDeckBuilderApi-api",
    });

    // lambda hookup
    const integration = new apigateway.LambdaIntegration(deckHandler);

    // resource tree
    const decks = restApi.root.addResource("decks");
    const deck = decks.addResource("{deckId}");
    const cards = deck.addResource("cards");
    const card = cards.addResource("{scryfallId}");

    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(
      this,
      "CognitoAuthorizer",
      {
        cognitoUserPools: [props.userPool],
      },
    );

    const methodOptions = {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    };

    decks.addMethod("GET", integration, methodOptions);
    decks.addMethod("POST", integration, methodOptions);

    deck.addMethod("GET", integration, methodOptions);
    deck.addMethod("PUT", integration, methodOptions);
    deck.addMethod("DELETE", integration, methodOptions);

    cards.addMethod("PUT", integration, methodOptions);

    card.addMethod("DELETE", integration, methodOptions);

    new cdk.CfnOutput(this, "ApiUrl", {
      value: restApi.url,
      description: "API Gateway URL",
      exportName: "MtgDeckBuilderApiUrl",
    });
  }
}
