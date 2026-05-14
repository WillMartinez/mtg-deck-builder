"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { DeckService } from "./deck-service";
import { Deck, DeckCard, DeckStats } from "./types";

interface DeckContextType {
  decks: Deck[];
  stats: DeckStats;
  loading: boolean;
  createDeck: (deck: Omit<Deck, "id" | "createdAt" | "updatedAt">) => Deck;
  updateDeck: (
    id: string,
    updates: Partial<Omit<Deck, "id" | "createdAt">>,
  ) => Deck | null;
  deleteDeck: (id: string) => boolean;
  getDeck: (id: string) => Deck | null;
  addCard: (deckId: string, card: DeckCard) => Deck | null;
  removeCard: (deckId: string, cardId: string) => Deck | null;
  updateCardQuantity: (
    deckId: string,
    cardId: string,
    quantity: number,
  ) => Deck | null;
  refreshDecks: () => void;
}

const DeckContext = createContext<DeckContextType | undefined>(undefined);

export function DeckProvider({ children }: { children: ReactNode }) {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [stats, setStats] = useState<DeckStats>({
    totalDecks: 0,
    totalCards: 0,
    averageCardsPerDeck: 0,
  });
  const [loading, setLoading] = useState(true);

  // Load decks from localStorage on mount
  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = () => {
    setLoading(true);
    try {
      const loadedDecks = DeckService.getDecks();
      const loadedStats = DeckService.getStats();
      setDecks(loadedDecks);
      setStats(loadedStats);
    } catch (error) {
      console.error("Error loading decks:", error);
    } finally {
      setLoading(false);
    }
  };

  const createDeck = (deck: Omit<Deck, "id" | "createdAt" | "updatedAt">) => {
    const newDeck = DeckService.createDeck(deck);
    loadDecks(); // Refresh state
    return newDeck;
  };

  const updateDeck = (
    id: string,
    updates: Partial<Omit<Deck, "id" | "createdAt">>,
  ) => {
    const updatedDeck = DeckService.updateDeck(id, updates);
    if (updatedDeck) {
      loadDecks(); // Refresh state
    }
    return updatedDeck;
  };

  const deleteDeck = (id: string) => {
    const success = DeckService.deleteDeck(id);
    if (success) {
      loadDecks(); // Refresh state
    }
    return success;
  };

  const getDeck = (id: string) => {
    return DeckService.getDeck(id);
  };

  const addCard = (deckId: string, card: DeckCard) => {
    const updatedDeck = DeckService.addCard(deckId, card);
    if (updatedDeck) {
      loadDecks(); // Refresh state
    }
    return updatedDeck;
  };

  const removeCard = (deckId: string, cardId: string) => {
    const updatedDeck = DeckService.removeCard(deckId, cardId);
    if (updatedDeck) {
      loadDecks(); // Refresh state
    }
    return updatedDeck;
  };

  const updateCardQuantity = (
    deckId: string,
    cardId: string,
    quantity: number,
  ) => {
    const updatedDeck = DeckService.updateCardQuantity(
      deckId,
      cardId,
      quantity,
    );
    if (updatedDeck) {
      loadDecks(); // Refresh state
    }
    return updatedDeck;
  };

  return (
    <DeckContext.Provider
      value={{
        decks,
        stats,
        loading,
        createDeck,
        updateDeck,
        deleteDeck,
        getDeck,
        addCard,
        removeCard,
        updateCardQuantity,
        refreshDecks: loadDecks,
      }}
    >
      {children}
    </DeckContext.Provider>
  );
}

export function useDeck() {
  const context = useContext(DeckContext);
  if (context === undefined) {
    throw new Error("useDeck must be used within a DeckProvider");
  }
  return context;
}
