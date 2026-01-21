"use client";

import CardDisplay from "@/components/deck/CardDisplay";
import { scryfallApi } from "@/lib/api/scryfall";
import { ScryfallCard } from "@/types/card";
import { useState } from "react";

export default function TestCardsPage() {
  const [query, setQuery] = useState("");
  const [cards, setCards] = useState<ScryfallCard[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const result = await scryfallApi.searchCards(query);
      setCards(result.data);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
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
        {cards.map((card) => (
          <CardDisplay
            key={card.id}
            card={card}
            className="border rounded p-4"
          />
        ))}
      </div>
    </div>
  );
}
