import RootLayout, { metadata } from "@/app/layout";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { Geist, Geist_Mono } from "next/font/google";

// Mock the Next.js fonts
jest.mock("next/font/google", () => ({
  Geist: jest.fn(() => ({
    variable: "--font-geist-sans",
  })),
  Geist_Mono: jest.fn(() => ({
    variable: "--font-geist-mono",
  })),
}));

// Mock the AuthProvider
jest.mock("@/lib/auth/auth-context", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
}));

describe("RootLayout", () => {
  // Suppress expected hydration warnings for layout tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = (...args: unknown[]) => {
      if (
        typeof args[0] === "string" &&
        (args[0].includes("cannot be a child of") ||
          args[0].includes("hydration error"))
      ) {
        return;
      }
      originalError.call(console, ...args);
    };
  });

  afterAll(() => {
    console.error = originalError;
  });

  it("renders children within the layout structure", () => {
    render(
      <RootLayout>
        <div data-testid="test-child">Test Content</div>
      </RootLayout>,
    );

    expect(screen.getByTestId("test-child")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("wraps children in AuthProvider", () => {
    render(
      <RootLayout>
        <div data-testid="test-child">Test Content</div>
      </RootLayout>,
    );

    const authProvider = screen.getByTestId("auth-provider");
    expect(authProvider).toBeInTheDocument();

    const child = screen.getByTestId("test-child");
    expect(authProvider).toContainElement(child);
  });

  it("renders multiple children correctly", () => {
    render(
      <RootLayout>
        <div data-testid="child-1">First</div>
        <div data-testid="child-2">Second</div>
      </RootLayout>,
    );

    expect(screen.getByTestId("child-1")).toBeInTheDocument();
    expect(screen.getByTestId("child-2")).toBeInTheDocument();
  });

  it("initializes Geist font with correct configuration", async () => {
    jest.clearAllMocks();

    await jest.isolateModulesAsync(async () => {
      await import("@/app/layout");
    });

    expect(Geist).toHaveBeenCalledWith({
      variable: "--font-geist-sans",
      subsets: ["latin"],
    });
  });

  it("initializes Geist_Mono font with correct configuration", async () => {
    jest.clearAllMocks();

    await jest.isolateModulesAsync(async () => {
      await import("@/app/layout");
    });

    expect(Geist_Mono).toHaveBeenCalledWith({
      variable: "--font-geist-mono",
      subsets: ["latin"],
    });
  });
});

describe("metadata", () => {
  it("exports correct metadata object", () => {
    expect(metadata).toEqual({
      title: "MTG Deck Builder",
      description: "Build and manage your Magic: The Gathering decks",
    });
  });

  it("has required metadata fields", () => {
    expect(metadata).toHaveProperty("title");
    expect(metadata).toHaveProperty("description");
  });

  it("has non-empty metadata values", () => {
    expect(metadata.title).toBeTruthy();
    expect(metadata.description).toBeTruthy();
  });
});
