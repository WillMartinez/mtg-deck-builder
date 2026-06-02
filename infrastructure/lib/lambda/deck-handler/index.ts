import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const method = event.httpMethod;
  const resource = event.resource;

  // route based on method + resource

  if (method === "GET" && resource === "/decks") {
    // TODO: list all decks for user
  } else if (method === "GET" && resource === "/decks/{deckId}") {
    // TODO: get a specific deck use deckID
  } else if (method === "POST" && resource === "/decks") {
    // TODO: create a new deck
  } else if (method === "PUT" && resource === "/decks/{deckId}") {
    // TODO: update a deck
  } else if (method === "DELETE" && resource === "/decks/{deckId}") {
    // TODO: delete a deck with deckId
  } else if (method === "PUT" && resource === "/decks/{deckId}/cards") {
    // TODO: add and update a card
  } else if (
    method === "DELETE" &&
    resource === "/decks/{deckId}/cards/{scryfallId}"
  ) {
    // TODO: Remove a card from the deck
  } else {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: "Route not found" }),
    };
  }
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "ok" }),
  };
};
