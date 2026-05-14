import { ScryfallCard } from "@/types/card";
import { DeckService } from "../deck-service";
import { Deck, DeckCard } from "../types";

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Helper function to create mock cards
function createMockCard(id: string, name: string): ScryfallCard {
  return {
    id,
    name,
    mana_cost: "{2}{U}",
    type_line: "Creature — Human Wizard",
    oracle_text: "Test card text",
    colors: ["U"],
    set: "TST",
    set_name: "Test Set",
    rarity: "rare",
    image_uris: {
      small: `https://example.com/${id}_small.jpg`,
      normal: `https://example.com/${id}_normal.jpg`,
      large: `https://example.com/${id}_large.jpg`,
    },
  } as ScryfallCard;
}

describe("DeckService", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe("getDecks", () => {
    it("returns empty array when no decks exist", () => {
      const decks = DeckService.getDecks();
      expect(decks).toEqual([]);
    });

    it("returns stored decks", () => {
      const mockDecks: Deck[] = [
        {
          id: "deck1",
          name: "Test Deck",
          format: "Commander",
          cards: [],
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
        },
      ];

      localStorage.setItem("mtg_decks", JSON.stringify(mockDecks));

      const decks = DeckService.getDecks();
      expect(decks).toEqual(mockDecks);
    });

    it("handles corrupted localStorage data gracefully", () => {
      localStorage.setItem("mtg_decks", "invalid json");
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const decks = DeckService.getDecks();

      expect(decks).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("getDeck", () => {
    it("returns null when deck does not exist", () => {
      const deck = DeckService.getDeck("nonexistent");
      expect(deck).toBeNull();
    });

    it("returns the deck when it exists", () => {
      const mockDeck: Deck = {
        id: "deck1",
        name: "Test Deck",
        format: "Commander",
        cards: [],
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      };

      localStorage.setItem("mtg_decks", JSON.stringify([mockDeck]));

      const deck = DeckService.getDeck("deck1");
      expect(deck).toEqual(mockDeck);
    });
  });

  describe("createDeck", () => {
    it("creates a new deck with generated id and timestamps", () => {
      const deckData = {
        name: "My New Deck",
        format: "Commander" as const,
        cards: [],
      };

      const newDeck = DeckService.createDeck(deckData);

      expect(newDeck).toMatchObject({
        name: "My New Deck",
        format: "Commander",
        cards: [],
      });
      expect(newDeck.id).toBeTruthy();
      expect(newDeck.createdAt).toBeTruthy();
      expect(newDeck.updatedAt).toBeTruthy();
    });

    it("saves the deck to localStorage", () => {
      const deckData = {
        name: "My New Deck",
        format: "Commander" as const,
        cards: [],
      };

      const newDeck = DeckService.createDeck(deckData);
      const storedDecks = DeckService.getDecks();

      expect(storedDecks).toHaveLength(1);
      expect(storedDecks[0]).toEqual(newDeck);
    });

    it("appends to existing decks", () => {
      const firstDeck = DeckService.createDeck({
        name: "First Deck",
        format: "Commander",
        cards: [],
      });

      const secondDeck = DeckService.createDeck({
        name: "Second Deck",
        format: "Commander",
        cards: [],
      });

      const decks = DeckService.getDecks();
      expect(decks).toHaveLength(2);
      expect(decks[0]).toEqual(firstDeck);
      expect(decks[1]).toEqual(secondDeck);
    });
  });

  describe("updateDeck", () => {
    it("returns null when deck does not exist", () => {
      const result = DeckService.updateDeck("nonexistent", {
        name: "New Name",
      });
      expect(result).toBeNull();
    });

    it("updates deck properties", () => {
      const deck = DeckService.createDeck({
        name: "Original Name",
        format: "Commander",
        cards: [],
      });

      const updated = DeckService.updateDeck(deck.id, {
        name: "Updated Name",
        description: "New description",
      });

      expect(updated).toMatchObject({
        id: deck.id,
        name: "Updated Name",
        description: "New description",
        format: "Commander",
      });
    });

    it("updates the updatedAt timestamp", () => {
      const deck = DeckService.createDeck({
        name: "Test Deck",
        format: "Commander",
        cards: [],
      });

      const originalUpdatedAt = deck.updatedAt;

      // Wait a bit to ensure timestamp is different
      jest.useFakeTimers();
      jest.advanceTimersByTime(1000);

      const updated = DeckService.updateDeck(deck.id, { name: "New Name" });

      expect(updated?.updatedAt).not.toBe(originalUpdatedAt);
      jest.useRealTimers();
    });

    it("does not change createdAt timestamp", () => {
      const deck = DeckService.createDeck({
        name: "Test Deck",
        format: "Commander",
        cards: [],
      });

      const updated = DeckService.updateDeck(deck.id, { name: "New Name" });

      expect(updated?.createdAt).toBe(deck.createdAt);
    });
  });

  describe("deleteDeck", () => {
    it("returns false when deck does not exist", () => {
      const result = DeckService.deleteDeck("nonexistent");
      expect(result).toBe(false);
    });

    it("deletes the deck and returns true", () => {
      const deck = DeckService.createDeck({
        name: "Test Deck",
        format: "Commander",
        cards: [],
      });

      const result = DeckService.deleteDeck(deck.id);

      expect(result).toBe(true);
      expect(DeckService.getDeck(deck.id)).toBeNull();
    });

    it("only deletes the specified deck", () => {
      const deck1 = DeckService.createDeck({
        name: "Deck 1",
        format: "Commander",
        cards: [],
      });

      const deck2 = DeckService.createDeck({
        name: "Deck 2",
        format: "Commander",
        cards: [],
      });

      DeckService.deleteDeck(deck1.id);

      const decks = DeckService.getDecks();
      expect(decks).toHaveLength(1);
      expect(decks[0].id).toBe(deck2.id);
    });
  });

  describe("addCard", () => {
    it("returns null when deck does not exist", () => {
      const mockCard: DeckCard = {
        card: createMockCard("card1", "Test Card"),
        quantity: 1,
      };

      const result = DeckService.addCard("nonexistent", mockCard);
      expect(result).toBeNull();
    });

    it("adds a new card to the deck", () => {
      const deck = DeckService.createDeck({
        name: "Test Deck",
        format: "Commander",
        cards: [],
      });

      const mockCard: DeckCard = {
        card: createMockCard("card1", "Test Card"),
        quantity: 1,
      };

      const updated = DeckService.addCard(deck.id, mockCard);

      expect(updated?.cards).toHaveLength(1);
      expect(updated?.cards[0]).toEqual(mockCard);
    });

    it("increases quantity when card already exists", () => {
      const deck = DeckService.createDeck({
        name: "Test Deck",
        format: "Commander",
        cards: [],
      });

      const mockCard: DeckCard = {
        card: createMockCard("card1", "Test Card"),
        quantity: 2,
      };

      DeckService.addCard(deck.id, mockCard);
      const updated = DeckService.addCard(deck.id, {
        ...mockCard,
        quantity: 3,
      });

      expect(updated?.cards).toHaveLength(1);
      expect(updated?.cards[0].quantity).toBe(5);
    });
  });

  describe("removeCard", () => {
    it("returns null when deck does not exist", () => {
      const result = DeckService.removeCard("nonexistent", "card1");
      expect(result).toBeNull();
    });

    it("removes the card from the deck", () => {
      const deck = DeckService.createDeck({
        name: "Test Deck",
        format: "Commander",
        cards: [],
      });

      const mockCard: DeckCard = {
        card: createMockCard("card1", "Test Card"),
        quantity: 1,
      };

      DeckService.addCard(deck.id, mockCard);
      const updated = DeckService.removeCard(deck.id, "card1");

      expect(updated?.cards).toHaveLength(0);
    });
  });

  describe("updateCardQuantity", () => {
    it("returns null when deck does not exist", () => {
      const result = DeckService.updateCardQuantity("nonexistent", "card1", 5);
      expect(result).toBeNull();
    });

    it("returns null when card does not exist in deck", () => {
      const deck = DeckService.createDeck({
        name: "Test Deck",
        format: "Commander",
        cards: [],
      });

      const result = DeckService.updateCardQuantity(deck.id, "card1", 5);
      expect(result).toBeNull();
    });

    it("updates card quantity", () => {
      const deck = DeckService.createDeck({
        name: "Test Deck",
        format: "Commander",
        cards: [],
      });

      const mockCard: DeckCard = {
        card: createMockCard("card1", "Test Card"),
        quantity: 1,
      };

      DeckService.addCard(deck.id, mockCard);
      const updated = DeckService.updateCardQuantity(deck.id, "card1", 5);

      expect(updated?.cards[0].quantity).toBe(5);
    });

    it("removes card when quantity is 0 or less", () => {
      const deck = DeckService.createDeck({
        name: "Test Deck",
        format: "Commander",
        cards: [],
      });

      const mockCard: DeckCard = {
        card: createMockCard("card1", "Test Card"),
        quantity: 3,
      };

      DeckService.addCard(deck.id, mockCard);
      const updated = DeckService.updateCardQuantity(deck.id, "card1", 0);

      expect(updated?.cards).toHaveLength(0);
    });
  });

  describe("getStats", () => {
    it("returns zero stats when no decks exist", () => {
      const stats = DeckService.getStats();

      expect(stats).toEqual({
        totalDecks: 0,
        totalCards: 0,
        averageCardsPerDeck: 0,
      });
    });

    it("calculates stats correctly", () => {
      DeckService.createDeck({
        name: "Deck 1",
        format: "Commander",
        cards: [
          { card: createMockCard("card1", "Card 1"), quantity: 10 },
          { card: createMockCard("card2", "Card 2"), quantity: 5 },
        ],
      });

      DeckService.createDeck({
        name: "Deck 2",
        format: "Commander",
        cards: [{ card: createMockCard("card3", "Card 3"), quantity: 20 }],
      });

      const stats = DeckService.getStats();

      expect(stats).toEqual({
        totalDecks: 2,
        totalCards: 35, // 10 + 5 + 20
        averageCardsPerDeck: 18, // 35 / 2 = 17.5, rounded to 18
      });
    });
  });
});
