import { render, screen } from "@testing-library/react";
import Footer from "../Footer";

describe("Footer", () => {
  it("renders copyright notice with current year", () => {
    render(<Footer />);

    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(`© ${currentYear} MTG Deck Builder`),
    ).toBeInTheDocument();
  });

  it("renders Scryfall attribution text", () => {
    render(<Footer />);

    expect(screen.getByText(/Card data from Scryfall/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Not affiliated with Wizards of the Coast/i),
    ).toBeInTheDocument();
  });

  it("renders Scryfall API link", () => {
    render(<Footer />);

    const scryfallLink = screen.getByRole("link", { name: /scryfall api/i });
    expect(scryfallLink).toHaveAttribute("href", "https://scryfall.com");
    expect(scryfallLink).toHaveAttribute("target", "_blank");
    expect(scryfallLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders EDHREC link", () => {
    render(<Footer />);

    const edhrecLink = screen.getByRole("link", { name: /edhrec/i });
    expect(edhrecLink).toHaveAttribute("href", "https://edhrec.com");
    expect(edhrecLink).toHaveAttribute("target", "_blank");
    expect(edhrecLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders Commander Rules link", () => {
    render(<Footer />);

    const rulesLink = screen.getByRole("link", { name: /commander rules/i });
    expect(rulesLink).toHaveAttribute("href", "https://mtgcommander.net");
    expect(rulesLink).toHaveAttribute("target", "_blank");
    expect(rulesLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("all external links open in new tab with security attributes", () => {
    render(<Footer />);

    const links = screen.getAllByRole("link");

    links.forEach((link) => {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  it("has correct styling classes for responsive layout", () => {
    const { container } = render(<Footer />);

    const footer = container.querySelector("footer");
    expect(footer).toHaveClass("bg-gray-800", "text-gray-300", "mt-auto");
  });

  it("renders all three footer links", () => {
    render(<Footer />);

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3);
  });
});
