import { useAuth } from "@/lib/auth/auth-context";
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { CognitoUser } from "amazon-cognito-identity-js";
import { useRouter } from "next/navigation";
import ProtectedLayout from "../layout";

// Mock dependencies
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/lib/auth/auth-context");

jest.mock("@/components/layout/Header", () => {
  return function MockHeader() {
    return <div data-testid="mock-header">Header</div>;
  };
});

jest.mock("@/components/layout/Footer", () => {
  return function MockFooter() {
    return <div data-testid="mock-footer">Footer</div>;
  };
});

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe("ProtectedLayout", () => {
  const mockPush = jest.fn();
  const mockUser = {
    getUsername: () => "testuser@example.com",
  } as Partial<CognitoUser> as CognitoUser;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    });
  });

  it("shows loading state when auth is loading", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      signOut: jest.fn(),
    });

    render(
      <ProtectedLayout>
        <div>Protected Content</div>
      </ProtectedLayout>,
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("redirects to login when user is not authenticated", async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signOut: jest.fn(),
    });

    render(
      <ProtectedLayout>
        <div>Protected Content</div>
      </ProtectedLayout>,
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("renders children with header and footer when user is authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signOut: jest.fn(),
    });

    render(
      <ProtectedLayout>
        <div>Protected Content</div>
      </ProtectedLayout>,
    );

    expect(screen.getByTestId("mock-header")).toBeInTheDocument();
    expect(screen.getByTestId("mock-footer")).toBeInTheDocument();
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("renders nothing when user is null and not loading", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signOut: jest.fn(),
    });

    render(
      <ProtectedLayout>
        <div>Protected Content</div>
      </ProtectedLayout>,
    );

    // Should render null before redirect happens
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });
});
