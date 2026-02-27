import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().min(10).max(15).required(),
  gender: Joi.string().valid("Nam", "Nữ", "Khác").required(),
  birthday: Joi.date().iso().required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});
