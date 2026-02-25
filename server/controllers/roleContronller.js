import db from "../models/index.js";

//Lấy tất cả các role
export const getAllRoles = async (req, res) => {
  try {
    const roles = await db.Role.findAll();
    res.json(roles);
  } catch (err) {
    console.error("Lỗi khi truy vấn cơ sở dữ liệu", err);
    res.status(500).json({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

//Tạo mới 1 role
export const createRole = async (req, res) => {
  const { name, description } = req.body;
  try {
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "Tên role không hợp lệ" });
    }

    name = name.trim().toLowerCase();

    const existed = await db.Role.findOne({ where: { name } });
    if (existed) {
      return res.status(409).json({
        message: `Vai trò "${name}" đã tồn tại trong hệ thống`,
      });
    }

    const role = await db.Role.create({ name, description });
    res.status(201).json(role);
  } catch (err) {
    console.error("Lỗi khi tạo role", err);
    res.status(500).json({ message: "Lỗi khi tạo role" });
  }
};
