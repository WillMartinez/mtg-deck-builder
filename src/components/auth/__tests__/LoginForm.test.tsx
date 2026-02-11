import LoginForm from "@/components/auth/LoginForm";
import { authService } from "@/lib/auth/cognito-service";
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CognitoUserSession } from "amazon-cognito-identity-js";

// Mock the auth service
jest.mock("@/lib/auth/cognito-service", () => ({
  authService: {
    signIn: jest.fn(),
  },
}));

// Mock Next.js Link
jest.mock("next/link", () => {
  return function MockLink({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return <a href={href}>{children}</a>;
  };
});

const mockAuthService = authService as jest.Mocked<typeof authService>;

// Mock CognitoUserSession
const mockSession = {} as CognitoUserSession;

// Mock console.error
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

describe("LoginForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Delete and recreate window.location
    delete (window as { location?: Location }).location;
  });

  describe("Initial Render", () => {
    it("renders the login form", () => {
      render(<LoginForm />);

      expect(
        screen.getByRole("heading", { name: /sign in/i }),
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /sign in/i }),
      ).toBeInTheDocument();
    });

    it("displays link to sign up page", () => {
      render(<LoginForm />);

      const signUpLink = screen.getByText("Need an account?");
      expect(signUpLink).toBeInTheDocument();
      expect(signUpLink).toHaveAttribute("href", "/signup");
    });

    it("has email and password inputs with correct types", () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");

      expect(emailInput).toHaveAttribute("type", "email");
      expect(passwordInput).toHaveAttribute("type", "password");
    });
  });

  describe("Form Submission", () => {
    it("calls authService.signIn with correct credentials", async () => {
      const user = userEvent.setup();
      mockAuthService.signIn.mockResolvedValueOnce(mockSession);

      render(<LoginForm />);

      await user.type(screen.getByLabelText("Email"), "test@example.com");
      await user.type(screen.getByLabelText("Password"), "password123");
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(mockAuthService.signIn).toHaveBeenCalledWith(
          "test@example.com",
          "password123",
        );
      });
    });

    it("redirects to dashboard on successful login", async () => {
      const user = userEvent.setup();
      mockAuthService.signIn.mockResolvedValueOnce(mockSession);

      render(<LoginForm />);

      await user.type(screen.getByLabelText("Email"), "test@example.com");
      await user.type(screen.getByLabelText("Password"), "password123");
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(window.location.href).toBe("http://localhost/");
      });
    });
  });

  describe("Error Handling", () => {
    it("displays error message when sign in fails", async () => {
      const user = userEvent.setup();
      mockAuthService.signIn.mockRejectedValueOnce(
        new Error("Invalid credentials"),
      );

      render(<LoginForm />);

      await user.type(screen.getByLabelText("Email"), "test@example.com");
      await user.type(screen.getByLabelText("Password"), "wrongpassword");
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
      });
    });

    it("displays generic error when error has no message", async () => {
      const user = userEvent.setup();
      mockAuthService.signIn.mockRejectedValueOnce(new Error());

      render(<LoginForm />);

      await user.type(screen.getByLabelText("Email"), "test@example.com");
      await user.type(screen.getByLabelText("Password"), "password123");
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText("Failed to sign in")).toBeInTheDocument();
      });
    });

    it("clears error on new submission", async () => {
      const user = userEvent.setup();
      mockAuthService.signIn.mockRejectedValueOnce(
        new Error("Invalid credentials"),
      );

      render(<LoginForm />);

      await user.type(screen.getByLabelText("Email"), "test@example.com");
      await user.type(screen.getByLabelText("Password"), "wrongpassword");
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
      });

      // Try again with correct password
      await user.clear(screen.getByLabelText("Password"));
      await user.type(screen.getByLabelText("Password"), "correctpassword");

      mockAuthService.signIn.mockResolvedValueOnce(mockSession);
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(
          screen.queryByText("Invalid credentials"),
        ).not.toBeInTheDocument();
      });
    });

    it("logs error to console", async () => {
      const user = userEvent.setup();
      const testError = new Error("Test error");
      mockAuthService.signIn.mockRejectedValueOnce(testError);

      render(<LoginForm />);

      await user.type(screen.getByLabelText("Email"), "test@example.com");
      await user.type(screen.getByLabelText("Password"), "password123");
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith("Sign in error:", testError);
      });
    });
  });

  describe("Loading State", () => {
    it("disables button and shows loading text during submission", async () => {
      const user = userEvent.setup();
      mockAuthService.signIn.mockImplementation(
        () =>
          new Promise<CognitoUserSession>((resolve) =>
            setTimeout(() => resolve(mockSession), 1000),
          ),
      );

      render(<LoginForm />);

      await user.type(screen.getByLabelText("Email"), "test@example.com");
      await user.type(screen.getByLabelText("Password"), "password123");
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      const button = screen.getByRole("button", { name: /signing in/i });
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent("Signing in...");
    });
  });

  describe("Form Styling", () => {
    it("applies correct styling to form elements", () => {
      render(<LoginForm />);

      const form = screen.getByTestId("login-form");
      expect(form).toHaveClass("bg-white", "shadow-md", "rounded");
    });

    it("applies correct styling to submit button", () => {
      render(<LoginForm />);

      const button = screen.getByRole("button", { name: /sign in/i });
      expect(button).toHaveClass(
        "bg-blue-500",
        "hover:bg-blue-700",
        "text-white",
      );
    });
  });
});
