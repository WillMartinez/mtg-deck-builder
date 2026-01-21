"use client";

import { scryfallApi } from "@/lib/api/scryfall";
import { ScryfallCard } from "@/types/card";
import { AlertTriangle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface QuickAddSearchProps {
  onAddCard: (card: ScryfallCard) => void;
}

interface CardSuggestion {
  name: string;
  card?: ScryfallCard;
  isLegal: boolean;
  isGameChanger?: boolean;
}

export default function QuickAddSearch({ onAddCard }: QuickAddSearchProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<CardSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch autocomplete suggestions with legality
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        // Get card names
        const names = await scryfallApi.autocomplete(query);

        // Fetch actual cards to check legality (limit to first 10 for performance)
        const cardPromises = names.slice(0, 10).map(async (name) => {
          try {
            const result = await scryfallApi.searchCards(`!"${name}"`);
            if (result.data.length > 0) {
              const card = result.data[0];
              return {
                name,
                card,
                isLegal: card.legalities.commander === "legal",
              };
            }
          } catch (error) {
            console.error(`Error fetching ${name}:`, error);
          }
          return { name, isLegal: true }; // Assume legal if we can't check
        });

        const results = await Promise.all(cardPromises);
        const processedResults = results.filter(Boolean).map((r) => ({
          ...r!,
          isGameChanger: r!.card?.game_changer === true,
        }));
        setSuggestions(processedResults as CardSuggestion[]);
        setSelectedIndex(-1);
      } catch (error) {
        console.error("Autocomplete error:", error);
        setSuggestions([]);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  // Add card
  const addCard = async (suggestion: CardSuggestion) => {
    if (suggestion.card) {
      onAddCard(suggestion.card);
      setQuery("");
      setSuggestions([]);
      inputRef.current?.focus();
    } else {
      // Fallback: fetch the card
      setIsLoading(true);
      try {
        const result = await scryfallApi.searchCards(`!"${suggestion.name}"`);
        if (result.data.length > 0) {
          onAddCard(result.data[0]);
          setQuery("");
          setSuggestions([]);
          inputRef.current?.focus();
        }
      } catch (error) {
        console.error("Error adding card:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          addCard(suggestions[selectedIndex]);
        } else if (suggestions.length > 0) {
          addCard(suggestions[0]);
        }
        break;
      case "Escape":
        setSuggestions([]);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Quick add card... (start typing)"
        className="w-1/4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={isLoading}
      />

      {/* Autocomplete dropdown */}
      {suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.name}
              onClick={() => addCard(suggestion)}
              className={`px-4 py-2 cursor-pointer flex items-center justify-between ${
                index === selectedIndex
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-100"
              } ${
                !suggestion.isLegal
                  ? "text-red-600"
                  : suggestion.isGameChanger
                    ? "text-blue-600 font-semibold"
                    : ""
              }`}
            >
              <span>{suggestion.name}</span>
              <div className="flex items-center gap-2 text-xs">
                {!suggestion.isLegal && (
                  <div className="flex items-center gap-1 text-red-600">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Illegal</span>
                  </div>
                )}
                {suggestion.isGameChanger && suggestion.isLegal && (
                  <div className="flex items-center gap-1 text-blue-600">
                    <span>⭐ Game Changer</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="absolute right-3 top-2.5 text-gray-400 text-sm">
          Adding...
        </div>
      )}
    </div>
  );
}
