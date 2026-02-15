import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { dirname } from "path";
import sequelize from "../config/db.js";
import { Sequelize } from "sequelize";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = {};

const files = fs
  .readdirSync(__dirname)
  .filter((file) => file !== "index.js" && file.endsWith(".js"));

for (const file of files) {
  const fileUrl = pathToFileURL(path.join(__dirname, file)).href;
  const { default: model } = await import(fileUrl);
  db[model.name] = model;
}

const { User, Role, CustomerProfile } = db;

if (User && Role) {
  User.belongsTo(Role, { foreignKey: "role_id" });
  Role.hasMany(User, { foreignKey: "role_id" });
}

if (User && CustomerProfile) {
  User.hasOne(CustomerProfile, { foreignKey: "user_id" });
  CustomerProfile.belongsTo(User, { foreignKey: "user_id" });
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
