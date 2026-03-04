import cron from "node-cron";
import { cleanupExpiredTokens } from "../utils/tokenCleanup.js";

/**
 * Job to clean up expired tokens from blacklist
 * Runs daily at 23:59
 */
export const startTokenCleanupJob = () => {
  // Run immediately on startup
  cleanupExpiredTokens().catch((err) =>
    console.error("Initial token cleanup failed:", err),
  );

  // '59 23 * * *' = At 23:59 every day
  cron.schedule("59 23 * * *", async () => {
    console.log(
      `[${new Date().toISOString()}] Running scheduled token cleanup...`,
    );
    try {
      await cleanupExpiredTokens();
    } catch (err) {
      console.error("Scheduled token cleanup failed:", err);
    }
  });

  console.log("✅ Token cleanup job scheduled (daily at 23:59)");
};
