import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db.js";

class Role extends Model {}

Role.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Role",
    tableName: "roles",
    underscored: true,
    timestamps: true,
  }
);

export default Role;
