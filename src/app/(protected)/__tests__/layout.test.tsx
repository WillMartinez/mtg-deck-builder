import { useAuth } from "@/lib/auth/auth-context";
import { render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import ProtectedLayout from "../layout"; // ← Changed from RootLayout

// Mock the auth context
jest.mock("@/lib/auth/auth-context", () => ({
  useAuth: jest.fn(),
}));

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const mockPush = jest.fn();

describe("ProtectedLayout", () => {
  // ← Changed from RootLayout
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  it("shows loading state when auth is loading", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: true,
    });

    render(
      <ProtectedLayout>
        {" "}
        {/* ← Changed from RootLayout */}
        <div>Protected Content</div>
      </ProtectedLayout>,
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("redirects to login when user is not authenticated", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
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

  it("renders null when user is not authenticated (before redirect)", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
    });

    const { container } = render(
      <ProtectedLayout>
        <div>Protected Content</div>
      </ProtectedLayout>,
    );

    // Should render null (empty)
    expect(container.firstChild).toBeNull();
  });

  it("renders children when user is authenticated", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        getUsername: () => "testuser",
      },
      loading: false,
    });

    render(
      <ProtectedLayout>
        <div>Protected Content</div>
      </ProtectedLayout>,
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("does not redirect when user is authenticated", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        getUsername: () => "testuser",
      },
      loading: false,
    });

    render(
      <ProtectedLayout>
        <div>Protected Content</div>
      </ProtectedLayout>,
    );

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("applies correct wrapper classes", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        getUsername: () => "testuser",
      },
      loading: false,
    });

    const { container } = render(
      <ProtectedLayout>
        <div>Content</div>
      </ProtectedLayout>,
    );

    const wrapper = container.querySelector(".min-h-screen");
    expect(wrapper).toHaveClass("min-h-screen", "flex", "flex-col");
  });
});
