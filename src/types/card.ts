export interface ScryfallCard {
  id: string;
  name: string;
  mana_cost?: string;
  cmc: number; // Converted mana cost
  type_line: string;
  oracle_text?: string;
  colors?: string[];
  color_identity: string[];
  image_uris?: {
    small: string;
    normal: string;
    large: string;
    art_crop: string;
  };
  legalities: {
    commander: "legal" | "not_legal" | "restricted" | "banned";
    [format: string]: string;
  };
  set: string;
  set_name: string;
  rarity: string;
  prices: {
    usd?: string;
    usd_foil?: string;
  };
  card_faces?: ScryfallCard[];
}

export interface ScryfallSearchResponse {
  object: "list";
  total_cards: number;
  has_more: boolean;
  data: ScryfallCard[];
}
