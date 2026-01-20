import { scryfallApi } from "../scryfall";

// Mock fetch globally
global.fetch = jest.fn();

describe("scryfallApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("searchCards", () => {
    it("should search for cards successfully", async () => {
      const mockResponse = {
        object: "list",
        total_cards: 1,
        has_more: false,
        data: [
          {
            id: "test-id",
            name: "Lightning Bolt",
            type_line: "Instant",
            mana_cost: "{R}",
            cmc: 1,
            color_identity: ["R"],
            legalities: { commander: "legal" },
            set: "lea",
            set_name: "Limited Edition Alpha",
            rarity: "common",
            prices: { usd: "1.00" },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await scryfallApi.searchCards("lightning bolt");

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe("Lightning Bolt");
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("cards/search"),
      );
    });

    it("should return empty results when no cards found (404)", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await scryfallApi.searchCards("nonexistentcard12345");

      expect(result.data).toHaveLength(0);
      expect(result.total_cards).toBe(0);
    });

    it("should throw error on other API failures", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      await expect(scryfallApi.searchCards("test")).rejects.toThrow(
        "Scryfall API error",
      );
    });
  });

  it("should search for Commander-legal cards", async () => {
    const mockResponse = {
      object: "list",
      total_cards: 1,
      has_more: false,
      data: [
        {
          id: "test-id",
          name: "Sol Ring",
          type_line: "Artifact",
          mana_cost: "{1}",
          cmc: 1,
          color_identity: [],
          legalities: { commander: "legal" },
          set: "lea",
          set_name: "Limited Edition Alpha",
          rarity: "uncommon",
          prices: { usd: "1.50" },
        },
      ],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await scryfallApi.searchCommanderCards("sol ring");

    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe("Sol Ring");
    // Check that it contains both parts (spaces can be + or %20)
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringMatching(/sol.*ring.*legal.*commander/),
    );
  });

  describe("searchCommanders", () => {
    it("should search for cards that can be commanders", async () => {
      const mockResponse = {
        object: "list",
        total_cards: 1,
        has_more: false,
        data: [
          {
            id: "commander-id",
            name: "Atraxa, Praetors' Voice",
            type_line: "Legendary Creature — Phyrexian Angel Horror",
            mana_cost: "{G}{W}{U}{B}",
            cmc: 4,
            color_identity: ["G", "W", "U", "B"],
            legalities: { commander: "legal" },
            set: "c16",
            set_name: "Commander 2016",
            rarity: "mythic",
            prices: { usd: "25.00" },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await scryfallApi.searchCommanders("atraxa");

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe("Atraxa, Praetors' Voice");
      expect(result.data[0].type_line).toContain("Legendary");
      // Verify it added 'is:commander legal:commander' to the query
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("is%3Acommander"),
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("legal%3Acommander"),
      );
    });
  });

  describe("autocomplete", () => {
    it("should return empty array for queries less than 2 characters", async () => {
      const result = await scryfallApi.autocomplete("a");
      expect(result).toEqual([]);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("should return autocomplete suggestions", async () => {
      const mockResponse = {
        data: ["Lightning Bolt", "Lightning Strike", "Lightning Helix"],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await scryfallApi.autocomplete("lightning");

      expect(result).toHaveLength(3);
      expect(result[0]).toBe("Lightning Bolt");
    });

    // ADD THESE TWO NEW TESTS:
    it("should return empty array on 404 (no autocomplete results)", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await scryfallApi.autocomplete("xyz123");

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it("should throw error on non-404 API failures", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      await expect(scryfallApi.autocomplete("test")).rejects.toThrow(
        "Scryfall API error",
      );
    });
  });

  describe("getCardById", () => {
    it("should fetch a specific card by ID", async () => {
      const mockCard = {
        id: "f2eb0500-ba62-4b99-9a89-0ac1c70d146d",
        name: "Lightning Bolt",
        type_line: "Instant",
        mana_cost: "{R}",
        cmc: 1,
        color_identity: ["R"],
        legalities: { commander: "legal" },
        set: "lea",
        set_name: "Limited Edition Alpha",
        rarity: "common",
        prices: { usd: "1.00" },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCard,
      });

      const result = await scryfallApi.getCardById(
        "f2eb0500-ba62-4b99-9a89-0ac1c70d146d",
      );

      expect(result.name).toBe("Lightning Bolt");
      expect(result.id).toBe("f2eb0500-ba62-4b99-9a89-0ac1c70d146d");
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.scryfall.com/cards/f2eb0500-ba62-4b99-9a89-0ac1c70d146d",
      );
    });

    it("should throw error when card not found", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
      });

      await expect(scryfallApi.getCardById("invalid-id")).rejects.toThrow(
        "Scryfall API error",
      );
    });
  });
});
