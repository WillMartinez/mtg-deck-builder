"use client";

import { useDeck } from "@/lib/deck/deck-context";

export default function DeckStats() {
  const { stats, loading } = useDeck();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-800 rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <StatCard label="Total Decks" value={stats.totalDecks} icon="🎴" />
      <StatCard label="Total Cards" value={stats.totalCards} icon="🃏" />
      <StatCard
        label="Avg Cards/Deck"
        value={stats.averageCardsPerDeck}
        icon="📊"
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="bg-linear-to-br from-blue-900 to-purple-900 rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <p className="text-gray-300 text-sm font-medium">{label}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}
