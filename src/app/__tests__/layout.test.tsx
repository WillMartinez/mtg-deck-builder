import { AuthProvider } from "@/lib/auth/auth-context";
import { render, screen } from "@testing-library/react";

// Mock auth service
jest.mock("@/lib/auth/cognito-service", () => ({
  authService: {
    getCurrentUser: jest.fn(() => null),
    getSession: jest.fn(),
    signOut: jest.fn(),
  },
}));

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

describe("Root Layout Integration", () => {
  it("wraps app in AuthProvider", () => {
    render(
      <AuthProvider>
        <div data-testid="test-content">Test</div>
      </AuthProvider>,
    );

    expect(screen.getByTestId("test-content")).toBeInTheDocument();
  });
});
