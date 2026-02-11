import CardDisplay, { getCardImages } from "@/components/deck/CardDisplay";
import { ScryfallCard } from "@/types/card";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock Next.js Image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: function MockImage({
    src,
    alt,
    fill,
    className,
  }: {
    src: string;
    alt: string;
    fill?: boolean;
    className?: string;
  }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} data-fill={fill} />;
  },
}));

// Mock lucide-react
jest.mock("lucide-react", () => ({
  RotateCw: function MockRotateCw({ className }: { className?: string }) {
    return (
      <div className={className} data-testid="rotate-icon">
        Rotate
      </div>
    );
  },
}));

const singleFacedCard: ScryfallCard = {
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

const doubleFacedCard: ScryfallCard = {
  ...singleFacedCard,
  id: "card-2",
  name: "Delver of Secrets",
  image_uris: undefined,
  card_faces: [
    {
      name: "Delver of Secrets",
      type_line: "Creature — Human Wizard",
      image_uris: {
        small: "https://example.com/front-small.jpg",
        normal: "https://example.com/front-normal.jpg",
        large: "https://example.com/front-large.jpg",
        art_crop: "https://example.com/front-art.jpg",
      },
      id: "12345",
      cmc: 0,
      color_identity: [],
      legalities: {
        commander: "legal",
      },
      set: "test",
      set_name: "test",
      rarity: "rare",
      prices: {
        usd: undefined,
        usd_foil: undefined,
      },
    },
    {
      name: "Insectile Aberration",
      type_line: "Creature — Human Insect",
      image_uris: {
        small: "https://example.com/back-small.jpg",
        normal: "https://example.com/back-normal.jpg",
        large: "https://example.com/back-large.jpg",
        art_crop: "https://example.com/back-art.jpg",
      },
      id: "12345",
      cmc: 0,
      color_identity: [],
      legalities: {
        commander: "legal",
      },
      set: "test",
      set_name: "tst",
      rarity: "common",
      prices: {
        usd: undefined,
        usd_foil: undefined,
      },
    },
  ],
};

const noImageCard: ScryfallCard = {
  ...singleFacedCard,
  id: "card-3",
  name: "No Image Card",
  image_uris: undefined,
};

describe("getCardImages", () => {
  it("returns front image for single-faced card", () => {
    const result = getCardImages(singleFacedCard);

    expect(result).toEqual({
      front: "https://example.com/normal.jpg",
      back: undefined,
    });
  });

  it("returns front and back images for double-faced card", () => {
    const result = getCardImages(doubleFacedCard);

    expect(result).toEqual({
      front: "https://example.com/front-normal.jpg",
      back: "https://example.com/back-normal.jpg",
    });
  });

  it("returns null for card with no images", () => {
    const result = getCardImages(noImageCard);

    expect(result).toBeNull();
  });

  it("handles double-faced card with missing image_uris gracefully", () => {
    const malformedCard = {
      ...doubleFacedCard,
      card_faces: [{ name: "Front" }, { name: "Back" }],
    } as ScryfallCard;

    const result = getCardImages(malformedCard);

    expect(result).toEqual({
      front: "",
      back: "",
    });
  });
});

describe("CardDisplay", () => {
  describe("Single-Faced Card", () => {
    it("renders card with image", () => {
      render(<CardDisplay card={singleFacedCard} />);

      expect(screen.getByAltText("Lightning Bolt")).toBeInTheDocument();
      expect(screen.getByText("Lightning Bolt")).toBeInTheDocument();
      expect(screen.getByText("Instant")).toBeInTheDocument();
    });

    it("displays correct image source", () => {
      render(<CardDisplay card={singleFacedCard} />);

      const image = screen.getByAltText("Lightning Bolt");
      expect(image).toHaveAttribute("src", "https://example.com/normal.jpg");
    });

    it("does not show flip icon for single-faced card", () => {
      render(<CardDisplay card={singleFacedCard} />);

      expect(screen.queryByTestId("rotate-icon")).not.toBeInTheDocument();
    });

    it("calls onClick when card is clicked", async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();

      render(<CardDisplay card={singleFacedCard} onClick={onClick} />);

      await user.click(screen.getByAltText("Lightning Bolt"));

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("Double-Faced Card", () => {
    it("renders double-faced card with front image initially", () => {
      render(<CardDisplay card={doubleFacedCard} />);

      const image = screen.getByAltText("Delver of Secrets");
      expect(image).toHaveAttribute(
        "src",
        "https://example.com/front-normal.jpg",
      );
    });

    it("shows flip icon for double-faced card", () => {
      render(<CardDisplay card={doubleFacedCard} />);

      expect(screen.getByTestId("rotate-icon")).toBeInTheDocument();
    });

    it("flips to back face when flip icon is clicked", async () => {
      const user = userEvent.setup();
      render(<CardDisplay card={doubleFacedCard} />);

      const image = screen.getByAltText("Delver of Secrets");
      expect(image).toHaveAttribute(
        "src",
        "https://example.com/front-normal.jpg",
      );

      // Click the flip icon
      const flipIcon = screen.getByTestId("rotate-icon").closest(".flip-icon");
      await user.click(flipIcon!);

      expect(image).toHaveAttribute(
        "src",
        "https://example.com/back-normal.jpg",
      );
    });

    it("flips back to front when flip icon is clicked again", async () => {
      const user = userEvent.setup();
      render(<CardDisplay card={doubleFacedCard} />);

      const image = screen.getByAltText("Delver of Secrets");
      const flipIcon = screen.getByTestId("rotate-icon").closest(".flip-icon");

      // Flip to back
      await user.click(flipIcon!);
      expect(image).toHaveAttribute(
        "src",
        "https://example.com/back-normal.jpg",
      );

      // Flip to front
      await user.click(flipIcon!);
      expect(image).toHaveAttribute(
        "src",
        "https://example.com/front-normal.jpg",
      );
    });

    it("calls onClick when card image is clicked (not flip icon)", async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();

      render(<CardDisplay card={doubleFacedCard} onClick={onClick} />);

      await user.click(screen.getByAltText("Delver of Secrets"));

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("does not call onClick when flip icon is clicked", async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();

      render(<CardDisplay card={doubleFacedCard} onClick={onClick} />);

      const flipIcon = screen.getByTestId("rotate-icon").closest(".flip-icon");
      await user.click(flipIcon!);

      expect(onClick).not.toHaveBeenCalled();
    });

    it("hides flip icon when showFlipIcon is false", () => {
      render(<CardDisplay card={doubleFacedCard} showFlipIcon={false} />);

      expect(screen.queryByTestId("rotate-icon")).not.toBeInTheDocument();
    });

    it("does not show title attribute when showFlipIcon is false", () => {
      const { container } = render(
        <CardDisplay card={doubleFacedCard} showFlipIcon={false} />,
      );

      const imageContainer = container.querySelector(".relative");
      expect(imageContainer).not.toHaveAttribute("title");
    });

    it("shows title attribute when showFlipIcon is true", () => {
      const { container } = render(
        <CardDisplay card={doubleFacedCard} showFlipIcon={true} />,
      );

      const imageContainer = container.querySelector(".relative");
      expect(imageContainer).toHaveAttribute(
        "title",
        "Click to add, click icon to flip",
      );
    });
  });

  describe("No Image Card", () => {
    it("renders placeholder for card with no image", () => {
      render(<CardDisplay card={noImageCard} />);

      expect(screen.getByText("No Image")).toBeInTheDocument();
      expect(screen.getByText("No Image Card")).toBeInTheDocument();
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });

    it("still displays card name and type", () => {
      render(<CardDisplay card={noImageCard} />);

      expect(screen.getByText("No Image Card")).toBeInTheDocument();
      expect(screen.getByText("Instant")).toBeInTheDocument();
    });
  });

  describe("Custom Styling", () => {
    it("applies custom className", () => {
      const { container } = render(
        <CardDisplay card={singleFacedCard} className="custom-class" />,
      );

      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("Image Component Props", () => {
    it("renders image with correct props", () => {
      render(<CardDisplay card={singleFacedCard} />);

      const image = screen.getByAltText("Lightning Bolt");
      expect(image).toHaveAttribute("data-fill", "true");
      expect(image).toHaveClass("object-contain", "rounded");
    });
  });
});
