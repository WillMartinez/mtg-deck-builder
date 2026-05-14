import "@testing-library/jest-dom";

process.env.NEXT_PUBLIC_COGNITO_REGION = "us-east-1";
process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID = "us-east-1_testpool";
process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID = "testclientid";
// jest.setup.js
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (args[0]?.toString?.().includes("Not implemented: navigation")) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
