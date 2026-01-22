"use client";

import { useAuth } from "@/lib/auth/auth-context";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-linear-to-r from-blue-900 to-purple-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-2xl">🎴</span>
            <span className="text-xl font-bold">MTG Deck Builder</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/dashboard"
              className="hover:text-blue-300 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/deck/new"
              className="hover:text-blue-300 transition-colors"
            >
              New Deck
            </Link>

            {/* Format Selector (placeholder for future) */}
            <div className="relative">
              <select
                className="bg-blue-800 text-white px-3 py-1 rounded border border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled
              >
                <option>Commander</option>
              </select>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-blue-200">
                {user?.getUsername()}
              </span>
              <button
                onClick={signOut}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors"
              >
                Sign Out
              </button>
            </div>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link
              href="/dashboard"
              className="block hover:text-blue-300 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/deck/new"
              className="block hover:text-blue-300 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              New Deck
            </Link>
            <div className="pt-4 border-t border-blue-800">
              <p className="text-sm text-blue-200 mb-2">
                {user?.getUsername()}
              </p>
              <button
                onClick={signOut}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors w-full"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
