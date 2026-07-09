import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    hookTimeout: 30000, // 30 seconds for setup/teardown hooks
    testTimeout: 10000, // 10 seconds per test
    environment: "node",
  },
});
