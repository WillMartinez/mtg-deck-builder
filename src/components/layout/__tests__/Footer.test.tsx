import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import Footer from "../Footer";

describe("Footer", () => {
  it("renders copyright information", () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(`© ${currentYear} MTG Deck Builder`),
    ).toBeInTheDocument();
  });

  it("renders attribution to Scryfall", () => {
    render(<Footer />);
    expect(screen.getByText(/card data from scryfall/i)).toBeInTheDocument();
    expect(
      screen.getByText(/not affiliated with wizards of the coast/i),
    ).toBeInTheDocument();
  });

  it("renders external links", () => {
    render(<Footer />);

    const scryfallLink = screen.getByRole("link", { name: /scryfall api/i });
    expect(scryfallLink).toHaveAttribute("href", "https://scryfall.com");
    expect(scryfallLink).toHaveAttribute("target", "_blank");
    expect(scryfallLink).toHaveAttribute("rel", "noopener noreferrer");

    const edhrecLink = screen.getByRole("link", { name: /edhrec/i });
    expect(edhrecLink).toHaveAttribute("href", "https://edhrec.com");

    const rulesLink = screen.getByRole("link", { name: /commander rules/i });
    expect(rulesLink).toHaveAttribute("href", "https://mtgcommander.net");
  });
});
