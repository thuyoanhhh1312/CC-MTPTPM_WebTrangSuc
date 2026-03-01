import db from "../models/index.js";

export const cleanupExpiredTokens = async () => {
  try {
    const { Op } = await import("sequelize");
    const deletedCount = await db.BlacklistedToken.destroy({
      where: {
        expires_at: {
          [Op.lt]: new Date(),
        },
      },
    });

    if (deletedCount > 0) {
      console.log(`Làm sạch ${deletedCount} token đã hết hạn khỏi blacklist.`);
    }

    return deletedCount;
  } catch (err) {
    console.error("Lỗi làm sạch token hết hạn:", err);
    throw err;
  }
};

export const scheduleTokenCleanup = () => {
  cleanupExpiredTokens().catch((err) =>
    console.error("Initial token cleanup failed:", err),
  );

  setInterval(
    () => {
      cleanupExpiredTokens().catch((err) =>
        console.error("Scheduled token cleanup failed:", err),
      );
    },
    24 * 60 * 60 * 1000,
  );

  console.log("Token đã hết hạn sẽ được làm sạch khỏi blacklist hàng ngày.");
};
