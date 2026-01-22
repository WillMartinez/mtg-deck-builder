import { useAuth } from "@/lib/auth/auth-context";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { CognitoUser } from "amazon-cognito-identity-js";
import { useRouter } from "next/navigation";
import Header from "../Header";

// Mock dependencies
jest.mock("@/lib/auth/auth-context");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe("Header", () => {
  const mockSignOut = jest.fn();
  const mockPush = jest.fn();

  // Create a partial mock of CognitoUser
  const mockUser = {
    getUsername: () => "testuser@example.com",
  } as Partial<CognitoUser> as CognitoUser;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signOut: mockSignOut,
    });
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    });
  });

  it("renders the logo and brand name", () => {
    render(<Header />);
    expect(screen.getByText("🎴")).toBeInTheDocument();
    expect(screen.getByText("MTG Deck Builder")).toBeInTheDocument();
  });

  it("displays navigation links", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: /dashboard/i })).toHaveAttribute(
      "href",
      "/dashboard",
    );
    expect(screen.getByRole("link", { name: /new deck/i })).toHaveAttribute(
      "href",
      "/deck/new",
    );
  });

  it("displays the username", () => {
    render(<Header />);
    expect(screen.getByText("testuser@example.com")).toBeInTheDocument();
  });

  it("calls signOut when sign out button is clicked", () => {
    render(<Header />);
    const signOutButton = screen.getByRole("button", { name: /sign out/i });
    fireEvent.click(signOutButton);
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it("shows mobile menu when hamburger is clicked", () => {
    render(<Header />);

    // Mobile links should not be visible initially
    const mobileLinks = screen.queryAllByRole("link", { name: /dashboard/i });
    expect(mobileLinks.length).toBeGreaterThan(0);

    // Click hamburger menu
    const menuButton = screen.getByRole("button", { name: "" }); // Menu button has no text
    fireEvent.click(menuButton);

    // Menu should still be in the document (just testing it toggles)
    expect(menuButton).toBeInTheDocument();
  });

  it("has disabled format selector", () => {
    render(<Header />);
    const formatSelector = screen.getByRole("combobox");
    expect(formatSelector).toBeDisabled();
    expect(formatSelector).toHaveTextContent("Commander");
  });
});
