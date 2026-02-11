import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import LoginPage from "../page";

describe("LoginPage", () => {
  it("renders the login form", () => {
    render(<LoginPage />);

    expect(screen.getByTestId("login-form")).toBeInTheDocument();
  });

  it("applies gradient background classes", () => {
    const { container } = render(<LoginPage />);

    const div = container.firstChild;
    expect(div).toHaveClass(
      "min-h-screen",
      "flex",
      "items-center",
      "justify-center",
      "bg-gradient-to-br",
      "from-blue-900",
      "to-purple-900",
    );
  });
});
