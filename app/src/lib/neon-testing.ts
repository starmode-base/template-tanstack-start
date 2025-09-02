import { makeNeonTesting } from "neon-testing";
import { ensureEnv } from "./env";

// Export a configured lifecycle function to use in test files
export const withNeonTestBranch = makeNeonTesting({
  apiKey: ensureEnv("NEON_API_KEY"),
  projectId: ensureEnv("NEON_PROJECT_ID"),
  // Recommended for Neon WebSocket drivers to automatically close connections
  autoCloseWebSockets: true,
});
