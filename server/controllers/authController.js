import * as authService from "../services/authService.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import db from "../models/index.js";
import { ERROR_CODES } from "../utils/errorCodes.js";

const signTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role_id: user.role_id },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "24h" },
  );
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET_KEY,
    { expiresIn: "7d" },
  );
  return { accessToken, refreshToken };
};

export const register = async (req, res, next) => {
  const { name, email, password, phone, gender, birthday } = req.body;
  if (!name || !email || !password || !phone || !gender || !birthday) {
    return next({
      statusCode: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "Vui lòng điền đầy đủ thông tin",
    });
  }
  let t;
  try {
    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      return next({
        statusCode: 409,
        code: ERROR_CODES.EMAIL_ALREADY_EXISTS,
        message: "Email đã tồn tại",
      });
    }
    t = await db.sequelize.transaction();
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await db.User.create(
      {
        name,
        email,
        password_hash: hashedPassword,
        role_id: 2,
      },
      { transaction: t },
    );
    const newCustomer = await db.Customer.create(
      {
        user_id: newUser.id,
        name,
        email: email,
        phone: phone,
        gender: gender,
        birthday: birthday,
        address: null,
      },
      { transaction: t },
    );
    const { accessToken, refreshToken } = signTokens(newUser);
    newUser.refresh_token = refreshToken;
    await newUser.save({ transaction: t });
    await t.commit();
    res.status(201).json({
      message: "Đăng ký thành công",
      accessToken,
      refreshToken,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        roleId: newUser.role_id,
      },
      customer: {
        id: newCustomer.id,
        name: newCustomer.name,
        email: newUser.email,
        gender: newCustomer.gender,
        birthday: newCustomer.birthday,
        address: newCustomer.address,
      },
    });
  } catch (err) {
    if (t) await t.rollback();
    return next({
      statusCode: 500,
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: "Đăng ký thất bại",
    });
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next({
      statusCode: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "Vui lòng điền đầy đủ thông tin",
    });
  }
  try {
    const user = await db.User.findOne({ where: { email } });
    const isValid =
      user && (await bcrypt.compare(password, user.password_hash));
    if (!isValid) {
      return next({
        statusCode: 401,
        code: ERROR_CODES.INVALID_CREDENTIALS,
        message: "Email hoặc mật khẩu không đúng",
      });
    }
    const { accessToken, refreshToken } = signTokens(user);
    user.refresh_token = refreshToken;
    await user.save();
    return res.status(200).json({
      message: "Đăng nhập thành công",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.role_id,
      },
    });
  } catch (err) {
    return next({
      statusCode: 500,
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: "Đăng nhập thất bại",
      error: err.message,
    });
  }
};
export const refreshToken = async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return next({
      statusCode: 401,
      code: ERROR_CODES.UNAUTHORIZED,
      message: "Vui lòng cung cấp refresh token",
    });
  }
  try {
    const payload = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET_KEY,
    );
    const user = await db.User.findOne({ where: { id: payload.id } });

    if (!user || user.refresh_token !== refreshToken) {
      return next({
        statusCode: 403,
        code: ERROR_CODES.UNAUTHORIZED,
        message: "Refresh token không hợp lệ",
      });
    }
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      signTokens(user);
    user.refresh_token = newRefreshToken;
    await user.save();
    return res.status(200).json({
      message: "Refresh token thành công",
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    return next({
      statusCode: 403,
      code: ERROR_CODES.TOKEN_INVALID,
      message: "Refresh token không hợp lệ hoặc đã hết hạn.",
    });
  }
};

export const logout = async (req, res, next) => {
  const userPayload = req.user;
  if (!userPayload?.id) {
    return next({
      statusCode: 401,
      code: ERROR_CODES.UNAUTHORIZED,
      message: "Bạn chưa đăng nhập",
    });
  }
  try {
    const user = await db.User.findByPk(userPayload.id);
    if (user) {
      user.refresh_token = null;
      await user.save();
    }
    return res.status(200).json({ message: "Đăng xuất thành công" });
  } catch (err) {
    return next({
      statusCode: 500,
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: "Đăng xuất thất bại",
      error: err.message,
    });
  }
};

export const currentUser = async (req, res, next) => {
  const { user } = req;

  try {
    if (!user) {
      return next({
        statusCode: 401,
        code: ERROR_CODES.UNAUTHORIZED,
        message: "Người dùng không tồn tại.",
      });
    }

    res.status(200).json({
      ok: true,
      user: { id: user.id, email: user.email, roleId: user.role_id },
    });
  } catch (err) {
    return next({
      statusCode: 500,
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: "Không thể lấy thông tin người dùng.",
      error: err.message,
    });
  }
};
export const currentAdmin = async (req, res, next) => {
  try {
    const { user } = req;
    if (!user) {
      return res.status(401).json({
        code: ERROR_CODES.UNAUTHORIZED,
        message: "Bạn chưa đăng nhập",
      });
    }
    if (user.role_id !== 1) {
      return next({
        statusCode: 403,
        code: ERROR_CODES.UNAUTHORIZED,
        message: "Bạn không có quyền truy cập vào tài nguyên này",
      });
    }
    return res.status(200).json({
      message: "Lấy thông tin admin thành công",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.role_id,
      },
    });
  } catch (err) {
    return next({
      statusCode: 500,
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: "Lấy thông tin admin thất bại",
      error: err.message,
    });
  }
};
export const currentStaffOrAdmin = async (req, res, next) => {
  try {
    const { user } = req;
    if (!user) {
      return res.status(401).json({
        code: ERROR_CODES.UNAUTHORIZED,
        message: "Bạn chưa đăng nhập",
      });
    }
    if (user.role_id !== 1 && user.role_id !== 3) {
      return next({
        statusCode: 403,
        code: ERROR_CODES.UNAUTHORIZED,
        message: "Bạn không có quyền truy cập vào tài nguyên này",
      });
    }
    res.status(200).json({ ok: true });
  } catch (err) {
    next({
      statusCode: 500,
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: "Không xác định được quyền truy cập.",
    });
  }
};
