import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import SignUpPage from "../page";

// Mock the SignUpForm component
jest.mock("@/components/auth/SignUpForm", () => {
  return function MockSignUpForm() {
    return <div data-testid="signup-form">Sign Up Form</div>;
  };
});

describe("SignUpPage", () => {
  it("renders the page", () => {
    render(<SignUpPage />);

    expect(screen.getByTestId("signup-form")).toBeInTheDocument();
  });

  it("renders SignUpForm component", () => {
    render(<SignUpPage />);

    const signUpForm = screen.getByTestId("signup-form");
    expect(signUpForm).toBeInTheDocument();
  });

  it("applies correct layout classes to container", () => {
    const { container } = render(<SignUpPage />);

    const pageContainer = container.querySelector(".min-h-screen");
    expect(pageContainer).toBeInTheDocument();
    expect(pageContainer).toHaveClass("min-h-screen");
    expect(pageContainer).toHaveClass("flex");
    expect(pageContainer).toHaveClass("items-center");
    expect(pageContainer).toHaveClass("justify-center");
  });

  it("applies gradient background classes", () => {
    const { container } = render(<SignUpPage />);

    const pageContainer = container.firstChild as HTMLElement;
    expect(pageContainer).toBeInTheDocument();
    expect(pageContainer).toHaveClass("bg-linear-to-br");
    expect(pageContainer).toHaveClass("from-blue-900");
    expect(pageContainer).toHaveClass("to-purple-900");
  });

  it("centers the SignUpForm in the viewport", () => {
    const { container } = render(<SignUpPage />);

    const pageContainer = container.firstChild as HTMLElement;
    expect(pageContainer).toHaveClass("flex", "items-center", "justify-center");

    const signUpForm = screen.getByTestId("signup-form");
    expect(pageContainer).toContainElement(signUpForm);
  });
});
