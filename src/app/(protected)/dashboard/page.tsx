"use client";

import { useAuth } from "@/lib/auth/auth-context";

export default function DashboardPage() {
  const { user, userEmail, signOut } = useAuth();

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <p className="text-xl mb-4">
          Welcome, {userEmail || user?.getUsername()}!
        </p>

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
