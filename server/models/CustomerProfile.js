import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db.js";

class CustomerProfile extends Model {}

CustomerProfile.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    gender: {
      type: DataTypes.ENUM("male", "female", "other"),
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    birthday: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    segment_type: {
      type: DataTypes.ENUM("vip", "gold", "silver", "bronze"),
      allowNull: false,
      defaultValue: "bronze",
    },
  },
  {
    sequelize,
    modelName: "CustomerProfile",
    tableName: "customer_profiles",
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ["user_id"], unique: true, name: "uniq_customer_profile_user" },
      { fields: ["birthday"], name: "idx_customer_profile_birthday" },
      { fields: ["segment_type"], name: "idx_customer_profile_segment" },
    ],
  }
);

export default CustomerProfile;
