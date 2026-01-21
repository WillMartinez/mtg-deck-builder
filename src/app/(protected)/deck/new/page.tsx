"use client";

import CardHoverPreview from "@/components/deck/CardHoverPreview";
import QuickAddSearch from "@/components/deck/QuickAddSearch";
import { ScryfallCard } from "@/types/card";
import { Deck, DeckCard } from "@/types/deck";
import { useState } from "react";

export default function NewDeckPage() {
  const [deck, setDeck] = useState<Deck>({
    name: "Untitled Deck",
    format: "commander",
    cards: [],
    colorIdentity: [],
  });

  const addCardToDeck = (card: ScryfallCard) => {
    // Check if card is already in deck
    if (deck.cards.some((dc) => dc.card.id === card.id)) {
      alert("Card already in deck!");
      return;
    }

    const getCategory = (typeLine: string): DeckCard["category"] => {
      const lower = typeLine.toLowerCase();
      if (lower.includes("creature")) return "creature";
      if (lower.includes("instant")) return "instant";
      if (lower.includes("sorcery")) return "sorcery";
      if (lower.includes("artifact")) return "artifact";
      if (lower.includes("enchantment")) return "enchantment";
      if (lower.includes("planeswalker")) return "planeswalker";
      if (lower.includes("land")) return "land";
      return "other";
    };

    const newCard: DeckCard = {
      card,
      quantity: 1,
      category: getCategory(card.type_line),
      isLegal: card.legalities.commander === "legal", // Track legality
      isGameChanger: card.game_changer === true, // ADD THIS
    };

    setDeck({
      ...deck,
      cards: [...deck.cards, newCard],
    });
  };

  const removeCard = (index: number) => {
    setDeck({
      ...deck,
      cards: deck.cards.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <input
            type="text"
            value={deck.name}
            onChange={(e) => setDeck({ ...deck, name: e.target.value })}
            className="text-4xl font-bold bg-transparent border-b-2 border-gray-300 focus:border-blue-500 outline-none mb-4"
            placeholder="Deck Name"
          />
          <p className="text-gray-600 mb-4">
            Commander • {deck.cards.length}/99 cards
            {deck.commander && " • 1 Commander"}
          </p>

          {/* Quick Add Search */}
          <QuickAddSearch onAddCard={addCardToDeck} />
        </div>

        {/* Commander Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Commander</h2>
          {!deck.commander ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
              Choose your commander from search results
            </div>
          ) : (
            <div className="w-64">
              <CardHoverPreview
                card={deck.commander}
                isLegal={deck.commander.legalities.commander === "legal"}
                isGameChanger={deck.commander.game_changer}
                onRemove={() => setDeck({ ...deck, commander: undefined })}
              />
            </div>
          )}
        </div>

        {/* Deck Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-4">
            Deck ({deck.cards.length} cards)
          </h2>
          {deck.cards.length === 0 ? (
            <p className="text-gray-400">
              No cards added yet. Use quick add above to start building!
            </p>
          ) : (
            <div className="grid grid-cols-6 gap-4">
              {deck.cards.map((deckCard, index) => (
                <CardHoverPreview
                  key={index}
                  card={deckCard.card}
                  isLegal={deckCard.isLegal}
                  isGameChanger={deckCard.isGameChanger}
                  onRemove={() => removeCard(index)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
