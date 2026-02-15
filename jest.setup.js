import "@testing-library/jest-dom";
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
