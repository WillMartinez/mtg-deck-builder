"use client";

import { useAuth } from "@/lib/auth/auth-context";

export default function DashboardPage() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <button
            onClick={signOut}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Sign Out
          </button>
        </div>

        <p className="text-xl mb-4">Welcome, {user?.getUsername()}!</p>

        <div className="bg-white shadow-md rounded p-6">
          <h2 className="text-2xl font-bold mb-4">Your Decks</h2>
          <p className="text-gray-600">
            Your Commander decks will appear here soon...
          </p>
        </div>
      </div>
    </div>
  );
}
