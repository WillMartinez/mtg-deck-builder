"use client";

import DeckCard from "@/components/dashboard/DeckCard";
import DeckStats from "@/components/dashboard/DeckStats";
import { useAuth } from "@/lib/auth/auth-context";
import { useDeck } from "@/lib/deck/deck-context";
import Link from "next/link";

export default function DashboardPage() {
  const { userEmail, user } = useAuth();
  const { decks, loading } = useDeck();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome, {userEmail || user?.getUsername()}!
        </h1>
        <p className="text-gray-400">Build and manage your Commander decks</p>
      </div>

      {/* Stats */}
      <DeckStats />

      {/* Decks Section */}
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Your Decks</h2>
        <Link
          href="/deck/new"
          className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
        >
          + Create New Deck
        </Link>
      </div>

      {/* Decks Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-800 rounded-lg p-6 animate-pulse">
              <div className="h-48 bg-gray-700 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : decks.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">🎴</div>
          <h3 className="text-xl font-bold text-white mb-2">No decks yet</h3>
          <p className="text-gray-400 mb-6">
            Get started by creating your first Commander deck!
          </p>
          <Link
            href="/deck/new"
            className="inline-block bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            Create Your First Deck
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck) => (
            <DeckCard key={deck.id} deck={deck} />
          ))}
        </div>
      )}
    </div>
  );
}
