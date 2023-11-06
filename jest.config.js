module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/test", "<rootDir>/src"],
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  setupFiles: ["<rootDir>/jest.env.js"],
};
