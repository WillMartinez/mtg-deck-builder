import { useAuth } from "@/lib/auth/auth-context";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Header from "../Header";

// Mock the auth context
jest.mock("@/lib/auth/auth-context", () => ({
  useAuth: jest.fn(),
}));

// Mock Next.js Link component
jest.mock("next/link", () => {
  return function MockLink({
    children,
    href,
    onClick,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    onClick?: () => void;
    className?: string;
  }) {
    return (
      <a href={href} onClick={onClick} className={className}>
        {children}
      </a>
    );
  };
});

const mockSignOut = jest.fn();

describe("Header", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("when user is authenticated", () => {
    beforeEach(() => {
      (useAuth as jest.Mock).mockReturnValue({
        user: {
          getUsername: () => "d4a864c8-c001-7039-b43f-ff4fc0393ad4",
        },
        userEmail: "test@example.com",
        signOut: mockSignOut,
      });
    });

    it("renders the logo and app name", () => {
      render(<Header />);

      expect(screen.getByText("🎴")).toBeInTheDocument();
      expect(screen.getByText("Deck Brew")).toBeInTheDocument();
    });

    it("logo links to dashboard", () => {
      render(<Header />);

      const logoLink = screen.getByRole("link", {
        name: /🎴 Deck Brew/i,
      });
      expect(logoLink).toHaveAttribute("href", "/dashboard");
    });

    it("renders all navigation links", () => {
      render(<Header />);

      expect(screen.getByRole("link", { name: /dashboard/i })).toHaveAttribute(
        "href",
        "/dashboard",
      );
      expect(screen.getByRole("link", { name: /new deck/i })).toHaveAttribute(
        "href",
        "/deck/new",
      );
      expect(screen.getByRole("link", { name: /profile/i })).toHaveAttribute(
        "href",
        "/profile",
      );
    });

    it("displays user email", () => {
      render(<Header />);

      expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });

    it("falls back to username if email is not available", () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: {
          getUsername: () => "d4a864c8-c001-7039-b43f-ff4fc0393ad4",
        },
        userEmail: null,
        signOut: mockSignOut,
      });

      render(<Header />);

      expect(
        screen.getByText("d4a864c8-c001-7039-b43f-ff4fc0393ad4"),
      ).toBeInTheDocument();
    });

    it("renders format selector with Commander option", () => {
      render(<Header />);

      const select = screen.getByRole("combobox");
      expect(select).toBeInTheDocument();
      expect(select).toHaveValue("Commander");
      expect(select).toBeDisabled();
    });

    it("renders sign out button", () => {
      render(<Header />);

      const signOutButtons = screen.getAllByRole("button", {
        name: /sign out/i,
      });
      expect(signOutButtons.length).toBeGreaterThan(0);
    });

    it("calls signOut when sign out button is clicked", async () => {
      render(<Header />);

      // Get the first sign out button (desktop version)
      const signOutButton = screen.getAllByRole("button", {
        name: /sign out/i,
      })[0];
      fireEvent.click(signOutButton);

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("mobile menu", () => {
    beforeEach(() => {
      (useAuth as jest.Mock).mockReturnValue({
        user: {
          getUsername: () => "testuser",
        },
        userEmail: "test@example.com",
        signOut: mockSignOut,
      });
    });

    it("renders mobile menu button", () => {
      render(<Header />);

      // Find button with md:hidden class
      const buttons = screen.getAllByRole("button");
      const mobileButton = buttons.find((btn) =>
        btn.className.includes("md:hidden"),
      );
      expect(mobileButton).toBeInTheDocument();
    });

    it("toggles mobile menu when hamburger is clicked", () => {
      render(<Header />);

      // Get mobile menu button
      const buttons = screen.getAllByRole("button");
      const menuButton = buttons.find((btn) =>
        btn.className.includes("md:hidden"),
      );

      // Initially, mobile menu should not be visible (no duplicate links)
      const initialLinks = screen.getAllByRole("link", { name: /dashboard/i });
      expect(initialLinks.length).toBe(1); // Only desktop link

      // Click to open mobile menu
      fireEvent.click(menuButton!);

      // Now should have both desktop and mobile links
      const openLinks = screen.getAllByRole("link", { name: /dashboard/i });
      expect(openLinks.length).toBe(2); // Desktop + mobile
    });

    it("displays user email in mobile menu", () => {
      render(<Header />);

      // Open mobile menu
      const buttons = screen.getAllByRole("button");
      const menuButton = buttons.find((btn) =>
        btn.className.includes("md:hidden"),
      );
      fireEvent.click(menuButton!);

      // Email should appear multiple times (desktop + mobile)
      const emails = screen.getAllByText("test@example.com");
      expect(emails.length).toBeGreaterThan(1);
    });

    it("mobile sign out button calls signOut", async () => {
      render(<Header />);

      // Open mobile menu
      const buttons = screen.getAllByRole("button");
      const menuButton = buttons.find((btn) =>
        btn.className.includes("md:hidden"),
      );
      fireEvent.click(menuButton!);

      // Click mobile sign out button (last one)
      const signOutButtons = screen.getAllByRole("button", {
        name: /sign out/i,
      });
      fireEvent.click(signOutButtons[signOutButtons.length - 1]);

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalledTimes(1);
      });
    });

    it("closes mobile menu when a link is clicked", async () => {
      render(<Header />);

      // Get mobile menu button
      const buttons = screen.getAllByRole("button");
      const menuButton = buttons.find((btn) =>
        btn.className.includes("md:hidden"),
      );

      // Open mobile menu
      fireEvent.click(menuButton!);

      // Verify menu is open - should have 2 dashboard links (desktop + mobile)
      await waitFor(() => {
        expect(screen.getAllByRole("link", { name: /dashboard/i }).length).toBe(
          2,
        );
      });

      // Click the mobile dashboard link (the second one)
      const dashboardLinks = screen.getAllByRole("link", {
        name: /dashboard/i,
      });
      fireEvent.click(dashboardLinks[1]);

      // Menu should close - back to only 1 link (desktop only)
      await waitFor(() => {
        expect(screen.getAllByRole("link", { name: /dashboard/i }).length).toBe(
          1,
        );
      });
    });
  });

  describe("responsive design", () => {
    beforeEach(() => {
      (useAuth as jest.Mock).mockReturnValue({
        user: {
          getUsername: () => "testuser",
        },
        userEmail: "test@example.com",
        signOut: mockSignOut,
      });
    });

    it("hides desktop navigation on mobile with CSS classes", () => {
      render(<Header />);

      const nav = screen
        .getAllByRole("link", { name: /dashboard/i })[0]
        .closest("nav");
      expect(nav).toHaveClass("hidden", "md:flex");
    });

    it("hides mobile menu button on desktop with CSS classes", () => {
      render(<Header />);

      const buttons = screen.getAllByRole("button");
      const mobileButton = buttons.find((btn) =>
        btn.className.includes("md:hidden"),
      );
      expect(mobileButton).toHaveClass("md:hidden");
    });
  });
});
