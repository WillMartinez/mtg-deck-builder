import { ScryfallCard } from "@/types/card";

export interface DeckCard {
  card: ScryfallCard;
  quantity: number;
  category?:
    | "commander"
    | "land"
    | "creature"
    | "instant"
    | "sorcery"
    | "artifact"
    | "enchantment"
    | "planeswalker";
}

export interface Deck {
  id: string;
  name: string;
  format: "Commander";
  commander?: ScryfallCard;
  cards: DeckCard[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  description?: string;
}

export interface DeckStats {
  totalDecks: number;
  totalCards: number;
  averageCardsPerDeck: number;
}
