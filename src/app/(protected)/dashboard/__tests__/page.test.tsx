import DashboardPage from "@/app/(protected)/dashboard/page";
import { useAuth } from "@/lib/auth/auth-context";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock the useAuth hook
jest.mock("@/lib/auth/auth-context", () => ({
  useAuth: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe("DashboardPage", () => {
  const mockSignOut = jest.fn();
  const mockUser = {
    getUsername: jest.fn(() => "testuser"),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      signOut: mockSignOut,
      isLoading: false,
      error: null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  });

  it("renders the dashboard page", () => {
    render(<DashboardPage />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("displays welcome message with username", () => {
    render(<DashboardPage />);

    expect(screen.getByText(/Welcome, testuser!/)).toBeInTheDocument();
    expect(mockUser.getUsername).toHaveBeenCalled();
  });

  it("renders sign out button", () => {
    render(<DashboardPage />);

    const signOutButton = screen.getByRole("button", { name: /sign out/i });
    expect(signOutButton).toBeInTheDocument();
  });

  it("calls signOut when sign out button is clicked", async () => {
    const user = userEvent.setup();
    render(<DashboardPage />);

    const signOutButton = screen.getByRole("button", { name: /sign out/i });
    await user.click(signOutButton);

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it('displays "Your Decks" section', () => {
    render(<DashboardPage />);

    expect(screen.getByText("Your Decks")).toBeInTheDocument();
  });

  it("displays placeholder text for decks", () => {
    render(<DashboardPage />);

    expect(
      screen.getByText("Your Commander decks will appear here soon..."),
    ).toBeInTheDocument();
  });

  it("handles null user gracefully", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      signOut: mockSignOut,
      isLoading: false,
      error: null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    render(<DashboardPage />);

    // Should still render the page structure
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText(/Welcome,/)).toBeInTheDocument();
  });

  it("applies correct styling to sign out button", () => {
    render(<DashboardPage />);

    const signOutButton = screen.getByRole("button", { name: /sign out/i });
    expect(signOutButton).toHaveClass("bg-red-500");
    expect(signOutButton).toHaveClass("hover:bg-red-700");
    expect(signOutButton).toHaveClass("text-white");
    expect(signOutButton).toHaveClass("font-bold");
  });

  it("renders header with correct layout", () => {
    const { container } = render(<DashboardPage />);

    const header = container.querySelector(
      ".flex.justify-between.items-center",
    );
    expect(header).toBeInTheDocument();

    const heading = screen.getByText("Dashboard");
    const signOutButton = screen.getByRole("button", { name: /sign out/i });

    expect(header).toContainElement(heading);
    expect(header).toContainElement(signOutButton);
  });

  it("applies correct container styling", () => {
    const { container } = render(<DashboardPage />);

    const mainContainer = container.querySelector(".min-h-screen.p-8");
    expect(mainContainer).toBeInTheDocument();

    const contentContainer = container.querySelector(".max-w-4xl.mx-auto");
    expect(contentContainer).toBeInTheDocument();
  });

  it("applies correct styling to deck section", () => {
    const { container } = render(<DashboardPage />);

    const deckSection = container.querySelector(
      ".bg-white.shadow-md.rounded.p-6",
    );
    expect(deckSection).toBeInTheDocument();
    expect(deckSection).toHaveTextContent("Your Decks");
    expect(deckSection).toHaveTextContent(
      "Your Commander decks will appear here soon...",
    );
  });
});
