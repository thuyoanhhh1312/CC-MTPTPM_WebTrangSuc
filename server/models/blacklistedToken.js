import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db.js";

class BlacklistedToken extends Model {}

BlacklistedToken.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    token: {
      type: DataTypes.STRING(500),
      allowNull: false,
      unique: true,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "BlacklistedToken",
    tableName: "blacklisted_tokens",
    underscored: true,
    timestamps: true,
  },
);

export default BlacklistedToken;
