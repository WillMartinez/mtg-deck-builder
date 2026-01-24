import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import Home from "../page";

describe("Home", () => {
  it("renders the main heading", () => {
    render(<Home />);

    const heading = screen.getByRole("heading", {
      name: /MTG Deck Builder/i,
      level: 1,
    });
    expect(heading).toBeInTheDocument();
  });

  it("renders the welcome message", () => {
    render(<Home />);

    expect(
      screen.getByText(/Welcome to Your Commander Deck Building App/i),
    ).toBeInTheDocument();
  });

  it("applies gradient background classes", () => {
    const { container } = render(<Home />);

    const main = container.querySelector("main");
    expect(main).toHaveClass(
      "bg-gradient-to-br",
      "from-blue-900",
      "to-green-900",
    );
  });
});
