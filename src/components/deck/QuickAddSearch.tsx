"use client";

import { scryfallApi } from "@/lib/api/scryfall";
import { ScryfallCard } from "@/types/card";
import { useQuery } from "@tanstack/react-query";
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

async function fetchCardSuggestions(query: string): Promise<CardSuggestion[]> {
  const names = await scryfallApi.autocomplete(query);
  const results = await Promise.all(
    names.slice(0, 10).map(async (name) => {
      try {
        const result = await scryfallApi.searchCards(`!"${name}"`);
        if (result.data.length > 0) {
          const card = result.data[0];
          return {
            name,
            card,
            isLegal: card.legalities.commander === "legal",
            isGameChanger: card.game_changer === true,
          };
        }
      } catch {
        // assume legal if card lookup fails
      }
      return { name, isLegal: true, isGameChanger: false };
    }),
  );
  return results.filter(Boolean) as CardSuggestion[];
}

export default function QuickAddSearch({ onAddCard }: QuickAddSearchProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isAdding, setIsAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.length < 2) {
      setDebouncedQuery("");
      return;
    }
    setShowSuggestions(true);
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: suggestions = [], isFetching } = useQuery({
    queryKey: ["card-suggestions", debouncedQuery],
    queryFn: () => fetchCardSuggestions(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });

  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions]);

  const addCard = async (suggestion: CardSuggestion) => {
    if (suggestion.card) {
      onAddCard(suggestion.card);
      setQuery("");
      setDebouncedQuery("");
      setShowSuggestions(false);
      inputRef.current?.focus();
    } else {
      setIsAdding(true);
      try {
        const result = await scryfallApi.searchCards(`!"${suggestion.name}"`);
        if (result.data.length > 0) {
          onAddCard(result.data[0]);
          setQuery("");
          setDebouncedQuery("");
          setShowSuggestions(false);
          inputRef.current?.focus();
        }
      } catch (error) {
        console.error("Error adding card:", error);
      } finally {
        setIsAdding(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

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
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const dropdownVisible = showSuggestions && suggestions.length > 0 && debouncedQuery.length >= 2;

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
        disabled={isAdding}
      />

      {dropdownVisible && (
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

      {(isFetching || isAdding) && (
        <div className="absolute right-3 top-2.5 text-gray-400 text-sm">
          {isAdding ? "Adding..." : "Loading..."}
        </div>
      )}
    </div>
  );
}
