"use client";

import CardDisplay from "@/components/deck/CardDisplay";
import { scryfallApi } from "@/lib/api/scryfall";
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

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ScryfallCard[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await scryfallApi.searchCommanderCards(searchQuery);
      setSearchResults(results.data);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const addCardToDeck = (card: ScryfallCard) => {
    // Check if card is already in deck
    if (deck.cards.some((dc) => dc.card.id === card.id)) {
      alert("Card already in deck!");
      return;
    }

    // Determine category from type_line
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

    const getCardImages = (
      card: ScryfallCard,
    ): { front: string; back?: string } | null => {
      // Single-faced card
      if (card.image_uris) {
        return { front: card.image_uris.normal };
      }

      // Double-faced card
      if (card.card_faces && card.card_faces.length >= 2) {
        return {
          front: card.card_faces[0]?.image_uris?.normal || "",
          back: card.card_faces[1]?.image_uris?.normal || "",
        };
      }

      return null;
    };

    const newCard: DeckCard = {
      card,
      quantity: 1,
      category: getCategory(card.type_line),
    };

    setDeck({
      ...deck,
      cards: [...deck.cards, newCard],
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
            className="text-4xl font-bold bg-transparent border-b-2 border-gray-300 focus:border-blue-500 outline-none"
            placeholder="Deck Name"
          />
          <p className="text-gray-600 mt-2">
            Commander • {deck.cards.length}/99 cards
            {deck.commander && " • 1 Commander"}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Left: Card Search */}
          <div className="col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">Add Cards</h2>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search for cards... (Press Enter)"
                className="w-full px-4 py-2 border rounded mb-4"
              />

              <div className="text-gray-500 text-center py-8">
                {/* Replace "Card search results will appear here" with: */}

                {isSearching ? (
                  <div className="text-center py-8 text-gray-500">
                    Searching...
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4 max-h-150 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4 max-h-600px overflow-y-auto">
                      {searchResults.map((card) => (
                        <CardDisplay
                          key={card.id}
                          card={card}
                          onClick={() => addCardToDeck(card)}
                          className="border rounded p-2 hover:bg-gray-50 cursor-pointer"
                        />
                      ))}
                    </div>
                  </div>
                ) : searchQuery ? (
                  <div className="text-center py-8 text-gray-500">
                    No results found
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Search for cards to add to your deck
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Deck List */}
          <div className="col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h2 className="text-2xl font-bold mb-4">Deck List</h2>

              {/* Commander Section */}
              {!deck.commander ? (
                <div className="border-2 border-dashed border-gray-300 rounded p-4 mb-4 text-center text-gray-500">
                  Choose your commander
                </div>
              ) : (
                <div className="mb-4">
                  <h3 className="font-bold text-sm text-gray-600 mb-2">
                    COMMANDER
                  </h3>
                  <div className="border rounded p-2">
                    {deck.commander.name}
                  </div>
                </div>
              )}

              {/* Cards List */}
              <div>
                <h3 className="font-bold text-sm text-gray-600 mb-2">
                  CARDS ({deck.cards.length})
                </h3>
                {deck.cards.length === 0 ? (
                  <p className="text-gray-400 text-sm">No cards added yet</p>
                ) : (
                  <div className="space-y-1">
                    {deck.cards.map((deckCard, index) => (
                      <div key={index} className="text-sm">
                        {deckCard.card.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
