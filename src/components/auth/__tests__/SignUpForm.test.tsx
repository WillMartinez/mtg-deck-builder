import SignUpForm from "@/components/auth/SignUpForm";
import { authService } from "@/lib/auth/cognito-service";
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CognitoUser } from "amazon-cognito-identity-js";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter } from "next/navigation";

// Mock the auth service
jest.mock("@/lib/auth/cognito-service", () => ({
  authService: {
    signUp: jest.fn(),
  },
}));

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
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

const mockPush = jest.fn();
const mockAuthService = authService as jest.Mocked<typeof authService>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

// Mock signup result - use Awaited to unwrap the Promise type
const mockSignUpResult: Awaited<ReturnType<typeof authService.signUp>> = {
  user: {
    getUsername: () => "test@example.com",
  } as CognitoUser,
  userConfirmed: false,
  userSub: "test-user-id",
  codeDeliveryDetails: {
    AttributeName: "email",
    DeliveryMedium: "EMAIL",
    Destination: "t***@example.com",
  },
};

// Add this after the other mocks, before describe('SignUpForm')

// Suppress act warnings - these are expected in our async test environment
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].includes("not wrapped in act")) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

describe("SignUpForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
    } as AppRouterInstance);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe("Initial Render", () => {
    it("renders the sign up form", () => {
      render(<SignUpForm />);

      expect(screen.getByText("Create Account")).toBeInTheDocument();
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByLabelText(/^Password$/)).toBeInTheDocument();
      expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /sign up/i }),
      ).toBeInTheDocument();
    });

    it("shows password requirement hint", () => {
      render(<SignUpForm />);

      expect(
        screen.getByText("Must be at least 8 characters"),
      ).toBeInTheDocument();
    });

    it("displays link to login page", () => {
      render(<SignUpForm />);

      const loginLink = screen.getByText("Have an account?");
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute("href", "/login");
    });
  });

  describe("Form Validation", () => {
    it("shows error when passwords do not match", async () => {
      const user = userEvent.setup({ delay: null });
      render(<SignUpForm />);

      await user.type(screen.getByLabelText("Email"), "test@example.com");
      await user.type(screen.getByLabelText(/^Password$/), "password123");
      await user.type(screen.getByLabelText("Confirm Password"), "password456");
      await user.click(screen.getByRole("button", { name: /sign up/i }));

      expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
      expect(mockAuthService.signUp).not.toHaveBeenCalled();
    });

    it("shows error when password is too short", async () => {
      const user = userEvent.setup({ delay: null });
      render(<SignUpForm />);

      await user.type(screen.getByLabelText("Email"), "test@example.com");
      await user.type(screen.getByLabelText(/^Password$/), "short");
      await user.type(screen.getByLabelText("Confirm Password"), "short");
      await user.click(screen.getByRole("button", { name: /sign up/i }));

      expect(
        screen.getByText("Password must be at least 8 characters"),
      ).toBeInTheDocument();
      expect(mockAuthService.signUp).not.toHaveBeenCalled();
    });
  });

  describe("Successful Sign Up", () => {
    it("calls authService.signUp with correct credentials", async () => {
      const user = userEvent.setup({ delay: null });
      mockAuthService.signUp.mockResolvedValueOnce(mockSignUpResult);

      render(<SignUpForm />);

      await user.type(screen.getByLabelText("Email"), "test@example.com");
      await user.type(screen.getByLabelText(/^Password$/), "password123");
      await user.type(screen.getByLabelText("Confirm Password"), "password123");
      await user.click(screen.getByRole("button", { name: /sign up/i }));

      await waitFor(() => {
        expect(mockAuthService.signUp).toHaveBeenCalledWith(
          "test@example.com",
          "password123",
        );
      });
    });

    it("shows success message after sign up", async () => {
      const user = userEvent.setup({ delay: null });
      mockAuthService.signUp.mockResolvedValueOnce(mockSignUpResult);

      render(<SignUpForm />);

      await user.type(screen.getByLabelText("Email"), "test@example.com");
      await user.type(screen.getByLabelText(/^Password$/), "password123");
      await user.type(screen.getByLabelText("Confirm Password"), "password123");
      await user.click(screen.getByRole("button", { name: /sign up/i }));

      await waitFor(() => {
        expect(screen.getByText("Success!")).toBeInTheDocument();
        expect(
          screen.getByText(/Please check your email to verify your account/),
        ).toBeInTheDocument();
      });
    });

    it("redirects to login page after success", async () => {
      const user = userEvent.setup({ delay: null });
      mockAuthService.signUp.mockResolvedValueOnce(mockSignUpResult);

      render(<SignUpForm />);

      await user.type(screen.getByLabelText("Email"), "test@example.com");
      await user.type(screen.getByLabelText(/^Password$/), "password123");
      await user.type(screen.getByLabelText("Confirm Password"), "password123");
      await user.click(screen.getByRole("button", { name: /sign up/i }));

      await waitFor(() => {
        expect(screen.getByText("Success!")).toBeInTheDocument();
      });

      jest.advanceTimersByTime(2000);

      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  describe("Error Handling", () => {
    it("displays error message when sign up fails", async () => {
      const user = userEvent.setup({ delay: null });
      mockAuthService.signUp.mockRejectedValueOnce(
        new Error("Email already exists"),
      );

      render(<SignUpForm />);

      await user.type(screen.getByLabelText("Email"), "test@example.com");
      await user.type(screen.getByLabelText(/^Password$/), "password123");
      await user.type(screen.getByLabelText("Confirm Password"), "password123");
      await user.click(screen.getByRole("button", { name: /sign up/i }));

      await waitFor(() => {
        expect(screen.getByText("Email already exists")).toBeInTheDocument();
      });
    });

    it("clears previous error on new submission", async () => {
      const user = userEvent.setup({ delay: null });
      render(<SignUpForm />);

      // First submission - password mismatch
      await user.type(screen.getByLabelText("Email"), "test@example.com");
      await user.type(screen.getByLabelText(/^Password$/), "password123");
      await user.type(screen.getByLabelText("Confirm Password"), "password456");
      await user.click(screen.getByRole("button", { name: /sign up/i }));

      expect(screen.getByText("Passwords do not match")).toBeInTheDocument();

      // Fix password and try again
      await user.clear(screen.getByLabelText("Confirm Password"));
      await user.type(screen.getByLabelText("Confirm Password"), "password123");

      mockAuthService.signUp.mockResolvedValueOnce(mockSignUpResult);
      await user.click(screen.getByRole("button", { name: /sign up/i }));

      await waitFor(() => {
        expect(
          screen.queryByText("Passwords do not match"),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Loading State", () => {
    it("disables button and shows loading text during submission", async () => {
      const user = userEvent.setup({ delay: null });
      mockAuthService.signUp.mockImplementation(
        () =>
          new Promise<Awaited<ReturnType<typeof authService.signUp>>>(
            (resolve) => setTimeout(() => resolve(mockSignUpResult), 1000),
          ),
      );

      render(<SignUpForm />);

      await user.type(screen.getByLabelText("Email"), "test@example.com");
      await user.type(screen.getByLabelText(/^Password$/), "password123");
      await user.type(screen.getByLabelText("Confirm Password"), "password123");
      await user.click(screen.getByRole("button", { name: /sign up/i }));

      const button = screen.getByRole("button", { name: /creating account/i });
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent("Creating account...");
    });
  });

  describe("Form Styling", () => {
    it("applies correct styling to form elements", () => {
      const { container } = render(<SignUpForm />);

      const form = container.querySelector("form");
      expect(form).toHaveClass("bg-white", "shadow-md", "rounded");
    });

    it("applies correct styling to submit button", () => {
      render(<SignUpForm />);

      const button = screen.getByRole("button", { name: /sign up/i });
      expect(button).toHaveClass(
        "bg-blue-500",
        "hover:bg-blue-700",
        "text-white",
      );
    });
  });
});
