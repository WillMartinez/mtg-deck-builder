"use client";

import { useDeck } from "@/lib/deck/deck-context";
import { Deck } from "@/lib/deck/types";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface DeckCardProps {
  deck: Deck;
}

export default function DeckCard({ deck }: DeckCardProps) {
  const { deleteDeck } = useDeck();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const totalCards = deck.cards.reduce((sum, card) => sum + card.quantity, 0);
  const lastUpdated = new Date(deck.updatedAt).toLocaleDateString();

  const handleDelete = () => {
    deleteDeck(deck.id);
    setShowDeleteConfirm(false);
  };

  // Get commander image with fallback
  const commanderImage =
    deck.commander?.image_uris?.normal ||
    deck.commander?.image_uris?.small ||
    "/placeholder-card.png";

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
      {/* Commander Image */}
      {deck.commander && (
        <div className="mb-4 relative h-48 w-full overflow-hidden rounded-lg">
          <Image
            src={commanderImage}
            alt={deck.commander.name}
            fill
            className="object-cover"
            unoptimized // Scryfall images are external
          />
        </div>
      )}

      {/* Deck Info */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-2">{deck.name}</h3>
        {deck.commander && (
          <p className="text-sm text-gray-400 mb-1">
            Commander: {deck.commander.name}
          </p>
        )}
        <p className="text-sm text-gray-400">
          {totalCards} cards • Updated {lastUpdated}
        </p>
        {deck.description && (
          <p className="text-sm text-gray-300 mt-2 line-clamp-2">
            {deck.description}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Link
          href={`/deck/${deck.id}`}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors text-center"
        >
          View Deck
        </Link>
        <Link
          href={`/deck/${deck.id}/edit`}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors text-center"
        >
          Edit
        </Link>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
        >
          Delete
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Delete Deck?</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete &quot;{deck.name}&quot;? This
              action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
