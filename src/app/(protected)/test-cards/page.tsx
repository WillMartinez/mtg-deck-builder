"use client";

import { scryfallApi } from "@/lib/api/scryfall";
import { ScryfallCard } from "@/types/card";
import { RefreshCcw } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function TestCardsPage() {
  const [query, setQuery] = useState("");
  const [cards, setCards] = useState<ScryfallCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

  const handleSearch = async () => {
    setLoading(true);
    try {
      const result = await scryfallApi.searchCards(query);
      setCards(result.data);
      setFlippedCards(new Set()); // Reset flipped state on new search
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFlip = (cardId: string) => {
    setFlippedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
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

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8">Test Card Search</h1>

      <div className="mb-8 flex gap-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search for cards..."
          className="flex-1 px-4 py-2 border rounded"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {cards.map((card) => {
          const images = getCardImages(card);
          const isFlipped = flippedCards.has(card.id);
          const isDoubleFaced = images?.back !== undefined;

          return (
            <div key={card.id} className="border rounded p-4">
              {images ? (
                <div
                  className={`relative w-full aspect-5/7 mb-2 group ${isDoubleFaced ? "cursor-pointer" : ""}`}
                  onClick={() => isDoubleFaced && toggleFlip(card.id)}
                  title={isDoubleFaced ? "Click to flip" : undefined}
                >
                  <Image
                    src={isFlipped && images.back ? images.back : images.front}
                    alt={card.name}
                    fill
                    className="object-contain rounded"
                    unoptimized
                  />
                  {isDoubleFaced && (
                    <div className="absolute top-10 right-4 bg-black/30 text-white p-1.5 rounded-full group-hover:bg-black/50 transition-colors backdrop-blur-sm">
                      <RefreshCcw className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-200 w-full aspect-5/7 flex items-center justify-center mb-2 rounded">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}
              <h3 className="font-bold text-sm">{card.name}</h3>
              <p className="text-xs text-gray-600">{card.type_line}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
