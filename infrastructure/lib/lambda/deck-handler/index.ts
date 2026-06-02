import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const method = event.httpMethod;
  const resource = event.resource;

  // lets check to make sure we have a valid userId before making any calls to DynamoDB
  const userId = event.requestContext.authorizer?.claims?.sub;

  if (!userId) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "Unauthorized" }),
    };
  }

  // route based on method + resource
  if (method === "GET" && resource === "/decks") {
    // TODO: list all decks for user
    const results = await docClient.send(
      new QueryCommand({
        TableName: process.env.DECKS_TABLE,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
      }),
    );
    return {
      statusCode: 200,
      body: JSON.stringify(results.Items),
    };
  } else if (method === "GET" && resource === "/decks/{deckId}") {
    // TODO: get a specific deck use deckID
    const results = await docClient.send(
      new GetCommand({
        TableName: process.env.DECKS_TABLE,
        Key: {
          userId,
          deckId: event.pathParameters?.deckId,
        },
      }),
    );
    return {
      statusCode: 200,
      body: JSON.stringify(results.Item),
    };
  } else if (method === "POST" && resource === "/decks") {
    // TODO: create a new deck
    const newDeck = {
      userId,
      deckId: crypto.randomUUID(),
      ...JSON.parse(event.body!),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await docClient.send(
      new PutCommand({
        TableName: process.env.DECKS_TABLE,
        Item: newDeck,
      }),
    );

    return {
      statusCode: 201,
      body: JSON.stringify(newDeck),
    };
  } else if (method === "PUT" && resource === "/decks/{deckId}") {
    // TODO: update a deck
    const body = JSON.parse(event.body!);

    const results = await docClient.send(
      new UpdateCommand({
        TableName: process.env.DECKS_TABLE,
        Key: {
          userId,
          deckId: event.pathParameters?.deckId,
        },
        UpdateExpression: "SET #name = :name, updatedAt = :updatedAt",
        ExpressionAttributeNames: {
          "#name": "name", // name is a reserved word in DynamoDB
        },
        ExpressionAttributeValues: {
          ":name": body.name, // the value from the request
          ":updatedAt": new Date().toISOString(),
        },
        ReturnValues: "ALL_NEW",
      }),
    );

    return {
      statusCode: 200,
      body: JSON.stringify(results.Attributes),
    };
  } else if (method === "DELETE" && resource === "/decks/{deckId}") {
    // TODO: delete a deck with deckId
    await docClient.send(
      new DeleteCommand({
        TableName: process.env.DECKS_TABLE,
        Key: {
          userId,
          deckId: event.pathParameters?.deckId,
        },
      }),
    );
    return {
      statusCode: 204,
      body: "",
    };
  } else if (method === "PUT" && resource === "/decks/{deckId}/cards") {
    // TODO: add and update a card
    const body = JSON.parse(event.body!);

    const results = await docClient.send(
      new UpdateCommand({
        TableName: process.env.DECKS_TABLE,
        Key: {
          userId,
          deckId: event.pathParameters?.deckId,
        },
        UpdateExpression:
          "SET cards = list_append(if_not_exists(cards, :empty), :newCard), updatedAt = :updatedAt",
        ExpressionAttributeValues: {
          ":newCard": [body],
          ":empty": [],
          ":updatedAt": new Date().toISOString(),
        },
        ReturnValues: "ALL_NEW",
      }),
    );
    return {
      statusCode: 200,
      body: JSON.stringify(results.Attributes),
    };
  } else if (
    method === "DELETE" &&
    resource === "/decks/{deckId}/cards/{scryfallId}"
  ) {
    // TODO: Remove a card from the deck

    // get th deck using the deckId
    const results = await docClient.send(
      new GetCommand({
        TableName: process.env.DECKS_TABLE,
        Key: {
          userId,
          deckId: event.pathParameters?.deckId,
        },
      }),
    );
    if (!results.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify("undefined"),
      };
    }
    const filteredCards = results.Item.cards.filter(
      (card: any) => card.scryfallId !== event.pathParameters?.scryfallId,
    );

    await docClient.send(
      new UpdateCommand({
        TableName: process.env.DECKS_TABLE,
        Key: {
          userId,
          deckId: event.pathParameters?.deckId,
        },
        UpdateExpression: "SET cards = :cards, updatedAt = :updatedAt",
        ExpressionAttributeValues: {
          ":cards": filteredCards, // the value from the request
          ":updatedAt": new Date().toISOString(),
        },
        ReturnValues: "ALL_NEW",
      }),
    );

    return {
      statusCode: 204,
      body: JSON.stringify(""),
    };
  } else {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: "Deck not found" }),
    };
  }
};
