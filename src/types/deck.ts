import { ScryfallCard } from "./card";

export interface DeckCard {
  card: ScryfallCard;
  quantity: number; // Always 1 for Commander (singleton)
  category:
    | "commander"
    | "creature"
    | "instant"
    | "sorcery"
    | "artifact"
    | "enchantment"
    | "planeswalker"
    | "land"
    | "other";
}

export interface Deck {
  id?: string;
  name: string;
  format: "commander";
  commander?: ScryfallCard;
  partner?: ScryfallCard;
  cards: DeckCard[];
  colorIdentity: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface DeckStats {
  totalCards: number;
  manaCurve: Record<number, number>;
  typeDistribution: Record<string, number>;
  colorDistribution: Record<string, number>;
  avgCMC: number;
}
