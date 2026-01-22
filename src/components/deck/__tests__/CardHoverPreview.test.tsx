import { ScryfallCard } from "@/types/card";
import "@testing-library/jest-dom";
import { fireEvent, render, screen, within } from "@testing-library/react";
import CardHoverPreview from "../CardHoverPreview";

const testCard = {
  id: "test-card-id",
  name: "Lightning Bolt",
  image_uris: {
    normal: "https://example.com/test-card.jpg",
  },
  cmc: 3,
  type_line: "Creature — Test",
  color_identity: ["U"],
  legalities: { standard: "legal", modern: "legal" },
  oracle_text: "Test ability",
  rarity: "common",
  set: "TST",
  collector_number: "1",
  mana_cost: "{U}{U}{U}",
  game_changer: true,
} as unknown as ScryfallCard;

describe("CardHoverPreview", () => {
  it("renders card img", () => {
    render(<CardHoverPreview card={testCard} onRemove={() => {}} />);
    const img = screen.getByRole("img", { name: /Lightning Bolt/i });
    expect(img).toBeInTheDocument();
  });

  it("shows illegal warning when card is not legal", () => {
    render(
      <CardHoverPreview card={testCard} isLegal={false} onRemove={() => {}} />,
    );
    const section = screen.getByTestId("card-isLegal-status");
    const label = within(section).getByText("Illegal");

    expect(label).toBeInTheDocument();
  });

  it("calls onRemove when remove button is clicked", () => {
    const mockOnRemove = jest.fn();
    render(<CardHoverPreview card={testCard} onRemove={mockOnRemove} />);
    const removeButton = screen.getByTitle(/Remove card/i);
    removeButton.click();

    expect(mockOnRemove).toHaveBeenCalled();
  });
  it("does not render when card has no images", () => {
    const cardWithoutImages = { ...testCard, image_uris: undefined };
    const { container } = render(
      <CardHoverPreview card={cardWithoutImages} onRemove={() => {}} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders without crashing when isLegal and isGameChanger are not provided", () => {
    render(<CardHoverPreview card={testCard} onRemove={() => {}} />);
    const img = screen.getByRole("img", { name: /Lightning Bolt/i });
    expect(img).toBeInTheDocument();
  });

  it("shows preview on hover and hides on mouse leave", () => {
    render(<CardHoverPreview card={testCard} onRemove={() => {}} />);

    // Get the container that has the mouse events
    const container = screen.getByAltText("Lightning Bolt").closest("div");

    // Preview should not be visible initially
    const images = screen.getAllByAltText("Lightning Bolt");
    expect(images).toHaveLength(1); // Only thumbnail, no preview

    // Trigger mouse enter
    fireEvent.mouseEnter(container!);

    // Now preview should appear (2 images total)
    const imagesAfterHover = screen.getAllByAltText("Lightning Bolt");
    expect(imagesAfterHover).toHaveLength(2); // Thumbnail + preview

    // Trigger mouse leave
    fireEvent.mouseLeave(container!);

    // Preview should disappear
    const imagesAfterLeave = screen.getAllByAltText("Lightning Bolt");
    expect(imagesAfterLeave).toHaveLength(1); // Only thumbnail again
  });

  it("shows 'Game Changer' badge when isGameChanger is true and isLegal is true", () => {
    render(
      <CardHoverPreview
        card={testCard}
        isLegal={true}
        isGameChanger={true}
        onRemove={() => {}}
      />,
    );

    const badge = screen.getByText(/Game Changer/i);
    expect(badge).toBeInTheDocument();
  });
});
