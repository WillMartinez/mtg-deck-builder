import { useAuth } from "@/lib/auth/auth-context";
import { useDeck } from "@/lib/deck/deck-context";
import { render, screen } from "@testing-library/react";
import DashboardPage from "../page";

// Mock the auth context
jest.mock("@/lib/auth/auth-context", () => ({
  useAuth: jest.fn(),
}));

// Mock the deck context
jest.mock("@/lib/deck/deck-context", () => ({
  useDeck: jest.fn(),
}));

// Mock Link component
jest.mock("next/link", () => {
  return function MockLink({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return <a href={href}>{children}</a>;
  };
});

// Mock the dashboard components
jest.mock("@/components/dashboard/DeckStats", () => {
  return function MockDeckStats() {
    return <div data-testid="deck-stats">Stats</div>;
  };
});

jest.mock("@/components/dashboard/DeckCard", () => {
  return function MockDeckCard({
    deck,
  }: {
    deck: { id: string; name: string };
  }) {
    return <div data-testid={`deck-card-${deck.id}`}>{deck.name}</div>;
  };
});

describe("DashboardPage", () => {
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        getUsername: () => "testuser",
      },
      userEmail: "test@example.com",
      loading: false,
    });

    (useDeck as jest.Mock).mockReturnValue({
      decks: [],
      stats: {
        totalDecks: 0,
        totalCards: 0,
        averageCardsPerDeck: 0,
      },
      loading: false,
      createDeck: jest.fn(),
      updateDeck: jest.fn(),
      deleteDeck: jest.fn(),
      getDeck: jest.fn(),
      addCard: jest.fn(),
      removeCard: jest.fn(),
      updateCardQuantity: jest.fn(),
      refreshDecks: jest.fn(),
    });
  });

  it("renders the dashboard welcome message", () => {
    render(<DashboardPage />);

    expect(screen.getByText(/Welcome, test@example.com!/i)).toBeInTheDocument();
  });

  it("displays username if email is not available", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        getUsername: () => "testuser",
      },
      userEmail: null,
      loading: false,
    });

    render(<DashboardPage />);

    expect(screen.getByText(/Welcome, testuser!/i)).toBeInTheDocument();
  });

  it('renders the "Your Decks" section', () => {
    render(<DashboardPage />);

    expect(screen.getByText("Your Decks")).toBeInTheDocument();
  });

  it("renders DeckStats component", () => {
    render(<DashboardPage />);

    expect(screen.getByTestId("deck-stats")).toBeInTheDocument();
  });

  it("renders Create New Deck button", () => {
    render(<DashboardPage />);

    expect(
      screen.getByRole("link", { name: /create new deck/i }),
    ).toBeInTheDocument();
  });

  it("shows empty state when no decks exist", () => {
    render(<DashboardPage />);

    expect(screen.getByText(/No decks yet/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Get started by creating your first Commander deck!/i),
    ).toBeInTheDocument();
  });

  it("renders deck cards when decks exist", () => {
    (useDeck as jest.Mock).mockReturnValue({
      decks: [
        {
          id: "deck1",
          name: "My First Deck",
          format: "Commander",
          cards: [],
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
        },
        {
          id: "deck2",
          name: "My Second Deck",
          format: "Commander",
          cards: [],
          createdAt: "2024-01-02T00:00:00.000Z",
          updatedAt: "2024-01-02T00:00:00.000Z",
        },
      ],
      stats: {
        totalDecks: 2,
        totalCards: 0,
        averageCardsPerDeck: 0,
      },
      loading: false,
      createDeck: jest.fn(),
      updateDeck: jest.fn(),
      deleteDeck: jest.fn(),
      getDeck: jest.fn(),
      addCard: jest.fn(),
      removeCard: jest.fn(),
      updateCardQuantity: jest.fn(),
      refreshDecks: jest.fn(),
    });

    render(<DashboardPage />);

    expect(screen.getByTestId("deck-card-deck1")).toBeInTheDocument();
    expect(screen.getByTestId("deck-card-deck2")).toBeInTheDocument();
    expect(screen.getByText("My First Deck")).toBeInTheDocument();
    expect(screen.getByText("My Second Deck")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    (useDeck as jest.Mock).mockReturnValue({
      decks: [],
      stats: {
        totalDecks: 0,
        totalCards: 0,
        averageCardsPerDeck: 0,
      },
      loading: true,
      createDeck: jest.fn(),
      updateDeck: jest.fn(),
      deleteDeck: jest.fn(),
      getDeck: jest.fn(),
      addCard: jest.fn(),
      removeCard: jest.fn(),
      updateCardQuantity: jest.fn(),
      refreshDecks: jest.fn(),
    });

    const { container } = render(<DashboardPage />);

    // Should show loading skeleton
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });
});
