import { ScryfallCard, ScryfallSearchResponse } from "@/types/card";
const BASE_URL = "https://api.scryfall.com";
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const scryfallApi = {
  async searchCards(query: string): Promise<ScryfallSearchResponse> {
    await delay(100); // Simple rate limiting
    const url = `${BASE_URL}/cards/search?${new URLSearchParams({ q: query })}`;
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 404) {
        // No cards found - return empty result
        return {
          object: "list",
          total_cards: 0,
          has_more: false,
          data: [],
        };
      }
      throw new Error(`Scryfall API error: ${response.statusText}`);
    }
    return response.json();
  },
  async searchCommanderCards(query: string): Promise<ScryfallSearchResponse> {
    return scryfallApi.searchCards(`${query} legal:commander`);
  },

  async searchCommanders(query: string): Promise<ScryfallSearchResponse> {
    return scryfallApi.searchCards(`${query} is:commander legal:commander`);
  },

  async autoComplete(query: string): Promise<string[]> {
    await delay(100); // Simple rate limiting

    if (query.length < 2) return [];
    const url = `${BASE_URL}/cards/autocomplete?${new URLSearchParams({
      q: query,
    })}`;
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 404) {
        // No cards found - return empty result
        return [];
      }
      throw new Error(`Scryfall API error: ${response.statusText}`);
    }
    const data = await response.json();
    return data.data;
  },

  async getCardById(id: string): Promise<ScryfallCard> {
    await delay(100); // Simple rate limiting

    const url = `${BASE_URL}/cards/${id}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Scryfall API error: ${response.statusText}`);
    }
    return response.json();
  },
};
