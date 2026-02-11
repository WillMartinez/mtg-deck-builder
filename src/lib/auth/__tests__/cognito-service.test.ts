import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
} from "amazon-cognito-identity-js";

// create mock functions that we can control in test so we can replace real Cognito methods
const mockGetCurrentUser = jest.fn(); // jest.fn is spy function we can control(return values, check if it was called)
const mockSignUp = jest.fn();
const mockSignOut = jest.fn();
const mockAuthenticateUser = jest.fn();
const mockGetSession = jest.fn();

jest.mock("amazon-cognito-identity-js"); // tell jest to mock the entire cognito identity we don't want to use the real deal

describe("authService", () => {
  let authService: typeof import("../cognito-service").authService;

  beforeAll(async () => {
    // Set up mocks BEFORE importing the service
    (CognitoUserPool as jest.Mock).mockImplementation(() => ({
      getCurrentUser: mockGetCurrentUser,
      signUp: mockSignUp,
    }));

    // ADD THIS - mock CognitoUser constructor
    (CognitoUser as jest.Mock).mockImplementation(() => ({
      authenticateUser: mockAuthenticateUser,
      getSession: mockGetSession,
      signOut: mockSignOut,
    }));

    (AuthenticationDetails as jest.Mock).mockImplementation((params) => params);
    (CognitoUserAttribute as jest.Mock).mockImplementation((params) => params);

    const serviceModule = await import("../cognito-service");
    authService = serviceModule.authService;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("gets current user as null when not authenticated", () => {
    mockGetCurrentUser.mockReturnValue(null);

    const result = authService.getCurrentUser();

    expect(result).toBeNull();
  });

  it("gets current user from userPool", () => {
    const testUser = {
      email: "meow@meow.com",
      password: "12345",
    };

    mockGetCurrentUser.mockReturnValue(testUser);

    const result = authService.getCurrentUser();

    expect(result).toBe(testUser);
  });

  it("signs out current cognito user", () => {
    const testUser = {
      signOut: mockSignOut,
    };

    mockGetCurrentUser.mockReturnValue(testUser);

    authService.signOut();

    expect(mockSignOut).toHaveBeenCalled();
    expect(CognitoUserPool).toHaveBeenCalledTimes(1);
  });

  it("signs up current cognito user", async () => {
    const testEmail = "test@test.com";
    const testPassword = "password123";

    const mockResult = {
      user: { username: "MrFluffy" },
    };

    mockSignUp.mockImplementation(
      (email, password, attributes, validationData, callback) => {
        // Simulate successful signup by calling the callback
        callback(null, mockResult);
      },
    );

    const result = await authService.signUp(testEmail, testPassword);

    expect(mockSignUp).toHaveBeenCalledWith(
      testEmail,
      testPassword,
      expect.any(Array),
      [],
      expect.any(Function),
    );
    expect(result).toEqual(mockResult);
  });

  it("attempts to signs up current cognito user but throws error", async () => {
    const testEmail = "test@test.com";
    const testPassword = "password123";

    const mockError = new Error("User already exist");

    mockSignUp.mockImplementation(
      (email, password, attributes, validationData, callback) => {
        // Simulate successful signup by calling the callback
        callback(mockError, null);
      },
    );

    await expect(authService.signUp(testEmail, testPassword)).rejects.toThrow(
      mockError,
    );
  });

  it("sign in and authenticate cognito user", async () => {
    const mockEmail = "test@test.com";
    const mockPassword = "password123";

    const mockSession = {
      mockGetSession,
    };

    mockAuthenticateUser.mockImplementation((authDetails, callbacks) => {
      // Call the onSuccess callback
      callbacks.onSuccess(mockSession);
    });

    const result = await authService.signIn(mockEmail, mockPassword);

    expect(result).toEqual(mockSession);
  });
  it("rejects when sign up fails with error", async () => {
    const mockEmail = "test@test.com";
    const mockPassword = "password123";

    const mockError = new Error("Cognito Throws");

    mockAuthenticateUser.mockImplementation((authDetails, callbacks) => {
      // Call the onSuccess callback
      callbacks.onFailure(mockError);
    });

    await expect(authService.signIn(mockEmail, mockPassword)).rejects.toThrow(
      mockError,
    );
  });
  it("getSession rejects when no user is found", async () => {
    mockGetCurrentUser.mockReturnValue(null);

    await expect(authService.getSession()).rejects.toThrow("No user found");
  });

  it("returns session when user exists and has valid session", async () => {
    const mockSession = {
      idToken: "mock-token",
      isValid: () => true,
    };

    const testUser = {
      getSession: mockGetSession, // User needs this method
    };

    mockGetCurrentUser.mockReturnValue(testUser);

    mockGetSession.mockImplementation((callback) => {
      // Call callback with (err, session) - no error, return session
      callback(null, mockSession);
    });

    const result = await authService.getSession();

    expect(result).toEqual(mockSession);
  });
  it("returns getSession error when calling cognitoUser ", async () => {
    const mockError = new Error("I have a bad feeling about this");

    const testUser = {
      getSession: mockGetSession, // User needs this method
    };

    mockGetCurrentUser.mockReturnValue(testUser);

    mockGetSession.mockImplementation((callback) => {
      // Call callback with (err, session) - no error, return session
      callback(mockError, null);
    });

    // const result = await authService.getSession();

    await expect(authService.getSession()).rejects.toThrow(mockError);
  });

  it("getSession returns null when calling cognitoUser ", async () => {
    const testUser = {
      getSession: mockGetSession, // User needs this method
    };

    mockGetCurrentUser.mockReturnValue(testUser);

    mockGetSession.mockImplementation((callback) => {
      // Call callback with (err, session) - no error, return session
      callback(null, null);
    });

    // const result = await authService.getSession();

    await expect(authService.getSession()).rejects.toThrow("No session found");
  });
});
