import { render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { act } from "react";
import { AuthProvider, useAuth } from "../auth-context";
import { authService } from "../cognito-service";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock cognito service
jest.mock("../cognito-service", () => ({
  authService: {
    getCurrentUser: jest.fn(),
    getSession: jest.fn(),
    signOut: jest.fn(),
  },
}));

// Test component that uses auth
function TestComponent() {
  const { user, loading, signOut } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div data-testid="auth-status">{user ? "Logged in" : "Logged out"}</div>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}

describe("AuthProvider", () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it("provides user as null when not authenticated", async () => {
    (authService.getCurrentUser as jest.Mock).mockReturnValue(null);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent("Logged out");
    });
  });

  it("provides user when authenticated", async () => {
    const mockUser = { username: "testuser" };
    (authService.getCurrentUser as jest.Mock).mockReturnValue(mockUser);
    (authService.getSession as jest.Mock).mockResolvedValue({
      isValid: () => true,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent("Logged in");
    });

    // Verify getSession was called
    expect(authService.getSession).toHaveBeenCalled();
  });

  it("signOut clears user and redirects to login", async () => {
    const mockUser = { username: "testuser" };
    (authService.getCurrentUser as jest.Mock).mockReturnValue(mockUser);
    (authService.getSession as jest.Mock).mockResolvedValue({});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent("Logged in");
    });

    act(() => {
      screen.getByText("Sign Out").click();
    });

    // Wait for the state update after sign out
    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent("Logged out");
    });

    expect(authService.signOut).toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith("/login");
  });

  it("throws error when useAuth used outside provider", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useAuth must be used within an AuthProvider");

    consoleSpy.mockRestore();
  });

  it("handles error during getSession fails", async () => {
    const mockUser = { username: "testuser" };
    (authService.getCurrentUser as jest.Mock).mockReturnValue(mockUser);
    (authService.getSession as jest.Mock).mockRejectedValue(
      new Error("Session error"),
    );

    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent("Logged out");
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error checking user:",
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });
});
