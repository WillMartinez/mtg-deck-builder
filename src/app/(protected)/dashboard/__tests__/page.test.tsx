import { useAuth } from "@/lib/auth/auth-context";
import { render, screen } from "@testing-library/react";
import DashboardPage from "../page";

// Mock the auth context
jest.mock("@/lib/auth/auth-context", () => ({
  useAuth: jest.fn(),
}));

describe("DashboardPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the dashboard welcome message", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        getUsername: () => "testuser",
      },
      userEmail: "test@example.com",
      loading: false,
    });

    render(<DashboardPage />);

    expect(screen.getByText(/Welcome, test@example.com!/i)).toBeInTheDocument();
  });

  it("displays username if email is not available", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        getUsername: () => "testuser",
      },
      userEmail: null,
      loading: false,
    });

    render(<DashboardPage />);

    expect(screen.getByText(/Welcome, testuser!/i)).toBeInTheDocument();
  });

  it('renders the "Your Decks" section', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        getUsername: () => "testuser",
      },
      userEmail: "test@example.com",
      loading: false,
    });

    render(<DashboardPage />);

    expect(screen.getByText("Your Decks")).toBeInTheDocument();
    expect(
      screen.getByText(/Your Commander decks will appear here soon/i),
    ).toBeInTheDocument();
  });

  it("handles null user gracefully", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      userEmail: null,
      loading: false,
    });

    render(<DashboardPage />);

    // Should still render but with empty welcome
    expect(screen.getByText(/Welcome,/i)).toBeInTheDocument();
  });

  it("renders with correct page structure", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        getUsername: () => "testuser",
      },
      userEmail: "test@example.com",
      loading: false,
    });

    render(<DashboardPage />);

    // Check for main content sections
    expect(screen.getByText("Your Decks")).toBeInTheDocument();
    expect(screen.getByText(/Welcome,/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Your Commander decks will appear here soon/i),
    ).toBeInTheDocument();
  });
});
