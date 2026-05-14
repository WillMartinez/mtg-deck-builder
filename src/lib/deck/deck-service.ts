import { Deck, DeckCard } from "./types";

const STORAGE_KEY = "mtg_decks";

export class DeckService {
  /**
   * Get all decks for the current user
   */
  static getDecks(): Deck[] {
    try {
      const decksJson = localStorage.getItem(STORAGE_KEY);
      if (!decksJson) return [];
      return JSON.parse(decksJson);
    } catch (error) {
      console.error("Error loading decks:", error);
      return [];
    }
  }

  /**
   * Get a single deck by ID
   */
  static getDeck(id: string): Deck | null {
    const decks = this.getDecks();
    return decks.find((deck) => deck.id === id) || null;
  }

  /**
   * Create a new deck
   */
  static createDeck(deck: Omit<Deck, "id" | "createdAt" | "updatedAt">): Deck {
    const newDeck: Deck = {
      ...deck,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const decks = this.getDecks();
    decks.push(newDeck);
    this.saveDecks(decks);

    return newDeck;
  }

  /**
   * Update an existing deck
   */
  static updateDeck(
    id: string,
    updates: Partial<Omit<Deck, "id" | "createdAt">>,
  ): Deck | null {
    const decks = this.getDecks();
    const index = decks.findIndex((deck) => deck.id === id);

    if (index === -1) return null;

    decks[index] = {
      ...decks[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.saveDecks(decks);
    return decks[index];
  }

  /**
   * Delete a deck
   */
  static deleteDeck(id: string): boolean {
    const decks = this.getDecks();
    const filteredDecks = decks.filter((deck) => deck.id !== id);

    if (filteredDecks.length === decks.length) {
      return false; // Deck not found
    }

    this.saveDecks(filteredDecks);
    return true;
  }

  /**
   * Add a card to a deck
   */
  static addCard(deckId: string, card: DeckCard): Deck | null {
    const deck = this.getDeck(deckId);
    if (!deck) return null;

    // Check if card already exists
    const existingCardIndex = deck.cards.findIndex(
      (c) => c.card.id === card.card.id,
    );

    if (existingCardIndex >= 0) {
      // Update quantity
      deck.cards[existingCardIndex].quantity += card.quantity;
    } else {
      // Add new card
      deck.cards.push(card);
    }

    return this.updateDeck(deckId, { cards: deck.cards });
  }

  /**
   * Remove a card from a deck
   */
  static removeCard(deckId: string, cardId: string): Deck | null {
    const deck = this.getDeck(deckId);
    if (!deck) return null;

    deck.cards = deck.cards.filter((c) => c.card.id !== cardId);
    return this.updateDeck(deckId, { cards: deck.cards });
  }

  /**
   * Update card quantity
   */
  static updateCardQuantity(
    deckId: string,
    cardId: string,
    quantity: number,
  ): Deck | null {
    const deck = this.getDeck(deckId);
    if (!deck) return null;

    const cardIndex = deck.cards.findIndex((c) => c.card.id === cardId);
    if (cardIndex === -1) return null;

    if (quantity <= 0) {
      // Remove card if quantity is 0 or less
      return this.removeCard(deckId, cardId);
    }

    deck.cards[cardIndex].quantity = quantity;
    return this.updateDeck(deckId, { cards: deck.cards });
  }

  /**
   * Get deck statistics
   */
  static getStats() {
    const decks = this.getDecks();
    const totalDecks = decks.length;
    const totalCards = decks.reduce((sum, deck) => {
      return (
        sum + deck.cards.reduce((cardSum, card) => cardSum + card.quantity, 0)
      );
    }, 0);

    return {
      totalDecks,
      totalCards,
      averageCardsPerDeck:
        totalDecks > 0 ? Math.round(totalCards / totalDecks) : 0,
    };
  }

  /**
   * Save decks to localStorage
   */
  private static saveDecks(decks: Deck[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
    } catch (error) {
      console.error("Error saving decks:", error);
      throw new Error("Failed to save decks");
    }
  }

  /**
   * Generate a unique ID
   */
  private static generateId(): string {
    return `deck_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
