import QuickAddSearch from "@/components/deck/QuickAddSearch";
import { scryfallApi } from "@/lib/api/scryfall";
import { ScryfallCard } from "@/types/card";
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock the Scryfall API
jest.mock("@/lib/api/scryfall", () => ({
  scryfallApi: {
    autocomplete: jest.fn(),
    searchCards: jest.fn(),
  },
}));

// Mock lucide-react
jest.mock("lucide-react", () => ({
  AlertTriangle: function MockAlertTriangle({
    className,
  }: {
    className?: string;
  }) {
    return (
      <div className={className} data-testid="alert-triangle">
        !
      </div>
    );
  },
}));

const mockScryfallApi = scryfallApi as jest.Mocked<typeof scryfallApi>;

const mockLegalCard: ScryfallCard = {
  id: "card-1",
  name: "Lightning Bolt",
  type_line: "Instant",
  mana_cost: "{R}",
  cmc: 1,
  color_identity: ["R"],
  oracle_text: "Deal 3 damage",
  image_uris: {
    small: "https://example.com/small.jpg",
    normal: "https://example.com/normal.jpg",
    large: "https://example.com/large.jpg",
    art_crop: "https://example.com/art.jpg",
  },
  set: "lea",
  set_name: "Alpha",
  rarity: "common",
  legalities: {
    commander: "legal",
    standard: "not_legal",
  },
  game_changer: false,
  prices: { usd: "1.00" },
};

const mockIllegalCard: ScryfallCard = {
  ...mockLegalCard,
  id: "card-2",
  name: "Black Lotus",
  legalities: {
    commander: "banned",
    standard: "not_legal",
  },
};

const mockGameChangerCard: ScryfallCard = {
  ...mockLegalCard,
  id: "card-3",
  name: "Sol Ring",
  game_changer: true,
};

// Suppress act warnings - these are expected in our async test environment
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("not wrapped in act") ||
        args[0].includes("Autocomplete error:"))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

describe("QuickAddSearch", () => {
  const mockOnAddCard = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe("Initial Render", () => {
    it("renders search input", () => {
      render(<QuickAddSearch onAddCard={mockOnAddCard} />);

      expect(
        screen.getByPlaceholderText(/quick add card/i),
      ).toBeInTheDocument();
    });

    it("input is not disabled initially", () => {
      render(<QuickAddSearch onAddCard={mockOnAddCard} />);

      expect(screen.getByPlaceholderText(/quick add card/i)).not.toBeDisabled();
    });

    it("does not show suggestions initially", () => {
      render(<QuickAddSearch onAddCard={mockOnAddCard} />);

      expect(screen.queryByRole("list")).not.toBeInTheDocument();
    });
  });

  describe("Autocomplete", () => {
    it("does not fetch suggestions for queries shorter than 2 characters", async () => {
      const user = userEvent.setup({ delay: null });
      render(<QuickAddSearch onAddCard={mockOnAddCard} />);

      const input = screen.getByPlaceholderText(/quick add card/i);
      await user.type(input, "a");

      jest.advanceTimersByTime(300);

      expect(mockScryfallApi.autocomplete).not.toHaveBeenCalled();
    });

    it("fetches and displays suggestions after debounce", async () => {
      const user = userEvent.setup({ delay: null });
      mockScryfallApi.autocomplete.mockResolvedValueOnce(["Lightning Bolt"]);
      mockScryfallApi.searchCards.mockResolvedValueOnce({
        object: "list",
        data: [mockLegalCard],
        has_more: false,
        total_cards: 1,
      });

      render(<QuickAddSearch onAddCard={mockOnAddCard} />);

      const input = screen.getByPlaceholderText(/quick add card/i);
      await user.type(input, "light");

      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(mockScryfallApi.autocomplete).toHaveBeenCalledWith("light");
      });

      await waitFor(() => {
        expect(screen.getByText("Lightning Bolt")).toBeInTheDocument();
      });
    });

    it("debounces autocomplete requests", async () => {
      const user = userEvent.setup({ delay: null });
      render(<QuickAddSearch onAddCard={mockOnAddCard} />);

      const input = screen.getByPlaceholderText(/quick add card/i);
      await user.type(input, "lig");

      jest.advanceTimersByTime(100);
      await user.type(input, "ht");

      jest.advanceTimersByTime(100);
      await user.type(input, "n");

      // Should not have called yet
      expect(mockScryfallApi.autocomplete).not.toHaveBeenCalled();

      jest.advanceTimersByTime(300);

      // Should only be called once with final query
      await waitFor(() => {
        expect(mockScryfallApi.autocomplete).toHaveBeenCalledTimes(1);
        expect(mockScryfallApi.autocomplete).toHaveBeenCalledWith("lightn");
      });
    });

    it("displays illegal cards with warning icon", async () => {
      const user = userEvent.setup({ delay: null });
      mockScryfallApi.autocomplete.mockResolvedValueOnce(["Black Lotus"]);
      mockScryfallApi.searchCards.mockResolvedValueOnce({
        object: "list",
        data: [mockIllegalCard],
        has_more: false,
        total_cards: 1,
      });

      render(<QuickAddSearch onAddCard={mockOnAddCard} />);

      const input = screen.getByPlaceholderText(/quick add card/i);
      await user.type(input, "black");

      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText("Black Lotus")).toBeInTheDocument();
        expect(screen.getByTestId("alert-triangle")).toBeInTheDocument();
        expect(screen.getByText("Illegal")).toBeInTheDocument();
      });
    });

    it("displays game changer cards with star", async () => {
      const user = userEvent.setup({ delay: null });
      mockScryfallApi.autocomplete.mockResolvedValueOnce(["Sol Ring"]);
      mockScryfallApi.searchCards.mockResolvedValueOnce({
        object: "list",
        data: [mockGameChangerCard],
        has_more: false,
        total_cards: 1,
      });

      render(<QuickAddSearch onAddCard={mockOnAddCard} />);

      const input = screen.getByPlaceholderText(/quick add card/i);
      await user.type(input, "sol");

      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText("Sol Ring")).toBeInTheDocument();
        expect(screen.getByText("⭐ Game Changer")).toBeInTheDocument();
      });
    });

    it("limits suggestions to 10 cards", async () => {
      const user = userEvent.setup({ delay: null });
      const manyNames = Array.from({ length: 15 }, (_, i) => `Card ${i}`);
      mockScryfallApi.autocomplete.mockResolvedValueOnce(manyNames);

      // Mock searchCards to return a card for each name
      const searchCardsMock = jest.fn((query) => {
        const cardName = query.replace('!"', "").replace('"', "");
        return Promise.resolve({
          object: "list",
          data: [
            {
              ...mockLegalCard,
              name: cardName,
            },
          ],
          has_more: false,
          total_cards: 1,
        });
      });

      mockScryfallApi.searchCards.mockImplementation(searchCardsMock);

      render(<QuickAddSearch onAddCard={mockOnAddCard} />);

      const input = screen.getByPlaceholderText(/quick add card/i);
      await user.type(input, "card");

      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(searchCardsMock).toHaveBeenCalledTimes(10);
      });
    });
  });

  describe("Adding Cards", () => {
    it("adds card when suggestion is clicked", async () => {
      const user = userEvent.setup({ delay: null });
      mockScryfallApi.autocomplete.mockResolvedValueOnce(["Lightning Bolt"]);
      mockScryfallApi.searchCards.mockResolvedValueOnce({
        object: "list",
        data: [mockLegalCard],
        has_more: false,
        total_cards: 1,
      });

      render(<QuickAddSearch onAddCard={mockOnAddCard} />);

      const input = screen.getByPlaceholderText(/quick add card/i);
      await user.type(input, "light");

      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText("Lightning Bolt")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Lightning Bolt"));

      expect(mockOnAddCard).toHaveBeenCalledWith(mockLegalCard);
      expect(input).toHaveValue("");
    });

    it("clears input and suggestions after adding card", async () => {
      const user = userEvent.setup({ delay: null });
      mockScryfallApi.autocomplete.mockResolvedValueOnce(["Lightning Bolt"]);
      mockScryfallApi.searchCards.mockResolvedValueOnce({
        object: "list",
        data: [mockLegalCard],
        has_more: false,
        total_cards: 1,
      });

      render(<QuickAddSearch onAddCard={mockOnAddCard} />);

      const input = screen.getByPlaceholderText(/quick add card/i);
      await user.type(input, "light");

      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText("Lightning Bolt")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Lightning Bolt"));

      await waitFor(() => {
        expect(input).toHaveValue("");
        expect(screen.queryByText("Lightning Bolt")).not.toBeInTheDocument();
      });
    });

    it("fetches card if not in suggestion cache", async () => {
      const user = userEvent.setup({ delay: null });
      mockScryfallApi.autocomplete.mockResolvedValueOnce(["Lightning Bolt"]);
      // First call returns no card data
      mockScryfallApi.searchCards.mockResolvedValueOnce({
        object: "list",
        data: [],
        has_more: false,
        total_cards: 0,
      });

      render(<QuickAddSearch onAddCard={mockOnAddCard} />);

      const input = screen.getByPlaceholderText(/quick add card/i);
      await user.type(input, "light");

      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText("Lightning Bolt")).toBeInTheDocument();
      });

      // Second call when clicking (fallback)
      mockScryfallApi.searchCards.mockResolvedValueOnce({
        data: [mockLegalCard],
        object: "list",
        has_more: false,
        total_cards: 1,
      });

      await user.click(screen.getByText("Lightning Bolt"));

      await waitFor(() => {
        expect(mockOnAddCard).toHaveBeenCalledWith(mockLegalCard);
      });
    });

    it("shows loading state while adding card", async () => {
      const user = userEvent.setup({ delay: null });
      mockScryfallApi.autocomplete.mockResolvedValueOnce(["Lightning Bolt"]);
      mockScryfallApi.searchCards.mockResolvedValueOnce({
        object: "list",
        data: [],
        has_more: false,
        total_cards: 0,
      });

      render(<QuickAddSearch onAddCard={mockOnAddCard} />);

      const input = screen.getByPlaceholderText(/quick add card/i);
      await user.type(input, "light");

      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText("Lightning Bolt")).toBeInTheDocument();
      });

      // Mock slow response
      mockScryfallApi.searchCards.mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  object: "list",
                  data: [mockLegalCard],
                  has_more: false,
                  total_cards: 1,
                }),
              1000,
            ),
          ),
      );

      await user.click(screen.getByText("Lightning Bolt"));

      expect(screen.getByText("Adding...")).toBeInTheDocument();
      expect(input).toBeDisabled();
    });
  });

  describe("Keyboard Navigation", () => {
    beforeEach(async () => {
      mockScryfallApi.autocomplete.mockResolvedValue([
        // Changed from mockResolvedValueOnce
        "Lightning Bolt",
        "Sol Ring",
        "Black Lotus",
      ]);
      mockScryfallApi.searchCards.mockImplementation((query) => {
        const name = query.replace('!"', "").replace('"', "");
        const cardMap: Record<string, ScryfallCard> = {
          "Lightning Bolt": mockLegalCard,
          "Sol Ring": mockGameChangerCard,
          "Black Lotus": mockIllegalCard,
        };
        return Promise.resolve({
          object: "list",
          data: [cardMap[name]],
          has_more: false,
          total_cards: 1,
        });
      });
    });

    it("navigates down with ArrowDown", async () => {
      const user = userEvent.setup({ delay: null });
      render(<QuickAddSearch onAddCard={mockOnAddCard} />);

      const input = screen.getByPlaceholderText(/quick add card/i);
      await user.type(input, "lig");

      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText("Lightning Bolt")).toBeInTheDocument();
      });

      await user.keyboard("{ArrowDown}");

      const lightningBolt = screen.getByText("Lightning Bolt").closest("div");
      expect(lightningBolt).toHaveClass("bg-blue-500");
    });

    it("navigates up with ArrowUp", async () => {
      const user = userEvent.setup({ delay: null });
      render(<QuickAddSearch onAddCard={mockOnAddCard} />);

      const input = screen.getByPlaceholderText(/quick add card/i);
      await user.type(input, "lig");

      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText("Lightning Bolt")).toBeInTheDocument();
      });

      await user.keyboard("{ArrowDown}");
      await user.keyboard("{ArrowDown}");
      await user.keyboard("{ArrowUp}");

      const lightningBolt = screen.getByText("Lightning Bolt").closest("div");
      expect(lightningBolt).toHaveClass("bg-blue-500");
    });

    it("adds selected card with Enter", async () => {
      const user = userEvent.setup({ delay: null });
      render(<QuickAddSearch onAddCard={mockOnAddCard} />);

      const input = screen.getByPlaceholderText(/quick add card/i);
      await user.type(input, "lig");

      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText("Lightning Bolt")).toBeInTheDocument();
      });

      await user.keyboard("{ArrowDown}");
      await user.keyboard("{Enter}");

      expect(mockOnAddCard).toHaveBeenCalledWith(mockLegalCard);
    });

    it("adds first suggestion with Enter when none selected", async () => {
      const user = userEvent.setup({ delay: null });
      render(<QuickAddSearch onAddCard={mockOnAddCard} />);

      const input = screen.getByPlaceholderText(/quick add card/i);
      await user.type(input, "lig");

      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText("Lightning Bolt")).toBeInTheDocument();
      });

      await user.keyboard("{Enter}");

      expect(mockOnAddCard).toHaveBeenCalledWith(mockLegalCard);
    });

    it("closes suggestions with Escape", async () => {
      const user = userEvent.setup({ delay: null });
      render(<QuickAddSearch onAddCard={mockOnAddCard} />);

      const input = screen.getByPlaceholderText(/quick add card/i);
      await user.type(input, "lig");

      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText("Lightning Bolt")).toBeInTheDocument();
      });

      await user.keyboard("{Escape}");

      expect(screen.queryByText("Lightning Bolt")).not.toBeInTheDocument();
    });

    it("does not navigate beyond last suggestion", async () => {
      const user = userEvent.setup({ delay: null });
      render(<QuickAddSearch onAddCard={mockOnAddCard} />);

      const input = screen.getByPlaceholderText(/quick add card/i);
      await user.type(input, "lig");

      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText("Black Lotus")).toBeInTheDocument();
      });

      // Navigate to last item
      await user.keyboard("{ArrowDown}");
      await user.keyboard("{ArrowDown}");
      await user.keyboard("{ArrowDown}");

      // Try to go beyond
      await user.keyboard("{ArrowDown}");

      const blackLotus = screen.getByText("Black Lotus").closest("div");
      expect(blackLotus).toHaveClass("bg-blue-500");
    });
  });

  describe("Error Handling", () => {
    it("handles autocomplete errors gracefully", async () => {
      const user = userEvent.setup({ delay: null });
      const consoleError = jest.spyOn(console, "error").mockImplementation();
      mockScryfallApi.autocomplete.mockRejectedValueOnce(
        new Error("API Error"),
      );

      render(<QuickAddSearch onAddCard={mockOnAddCard} />);

      const input = screen.getByPlaceholderText(/quick add card/i);
      await user.type(input, "light");

      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith(
          "Autocomplete error:",
          expect.any(Error),
        );
      });

      expect(screen.queryByText("Lightning Bolt")).not.toBeInTheDocument();

      consoleError.mockRestore();
    });

    it("handles individual card fetch errors", async () => {
      const user = userEvent.setup({ delay: null });
      const consoleError = jest.spyOn(console, "error").mockImplementation();
      mockScryfallApi.autocomplete.mockResolvedValueOnce(["Lightning Bolt"]);
      mockScryfallApi.searchCards.mockRejectedValueOnce(
        new Error("Card not found"),
      );

      render(<QuickAddSearch onAddCard={mockOnAddCard} />);

      const input = screen.getByPlaceholderText(/quick add card/i);
      await user.type(input, "light");

      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled();
      });

      consoleError.mockRestore();
    });
  });
});
