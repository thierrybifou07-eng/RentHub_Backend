import { User, Otp, Session } from "../../database/models/index.js";
import { sendTemplateEmail } from "../../shared/helpers/sendMail.js";
import { verifyPassword } from "./password.js";
import OTP_TYPES from "../../../config/auth/OTP_CODE.js";
import USER_STATUS from "./userStatus.js";
import {
  badRequest,
  conflict,
  fail,
  forbidden,
  handleServerError,
  notFound,
  registered,
  success,
  unauthorized,
  validationFail,
  verified,
} from "../../shared/helpers/response.helpers.js";
import { generateToken } from "./jwt.js";
import { Op } from "sequelize";
import { generateVerificationCode } from "./otp.helpers.js";
import { generateRefreshToken, hashToken } from "./session.helpers.js";
import orm from "../../../config/sequelize_app.js";

const REFRESH_COOKIE = "refreshToken";

const cookieOptions = (expires) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  ...(expires ? { expires } : {}),
});

export const register = async (req, res) => {
  try {
    const checkExistingUser = await User.findOne({
      where: { [Op.or]: [{ email: req.body.email }, { phone: req.body.phone }] },
      attributes: ["id", "email", "phone"],
    });

    if (checkExistingUser) {
      if (checkExistingUser.email === req.body.email) return res.status(409).json(conflict("That Email is already taken"));
      if (checkExistingUser.phone === req.body.phone) return res.status(409).json(conflict("That phone number is already taken"));
    }

    const body = { ...req.body, user_status_id: USER_STATUS.PENDING_VERIFICATION };

    const user = await User.create(body);

    let emailSent = false;

    try {
      const countMinutes = 5;
      const { code, expiredAt } = await generateVerificationCode(6, 1000 * countMinutes * 60);

      const otp = { code, expiredAt, user_id: user.id, type: OTP_TYPES.EMAIL_VERIFICATION };

      await Otp.upsert(otp);

      await sendTemplateEmail(body.email, "Inscription réussie", "welcome", {
        heading: "Bienvenue sur RentHub !",
        username: `${body.lastname} ${body.firstname}`,
        validatedCode: code,
        countMinutes,
      });

      emailSent = true;
    } catch (e) {
      console.error(e);
    }

    return res.status(201).json({ ...registered(), emailSent });
  } catch (err) {
    return handleServerError(res, err);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.scope("withPassword").findOne({ where: { email } });

    if (!user) return res.status(400).json(fail("Invalid credentials"));

    const passwordMatch = await verifyPassword(password, user.password);

    if (!passwordMatch) return res.status(400).json(fail("Invalid credentials"));

    const blockedStatuses = [USER_STATUS.SUSPENDED, USER_STATUS.INACTIVE];
    if (blockedStatuses.includes(user.user_status_id)) {
      return res.status(403).json(forbidden("Account is not active"));
    }

    const accessToken = generateToken({
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role_id,
      userStatus: user.user_status_id,
      emailVerifyAt: user.email_verified_at,
    });

    const { token: refreshToken, hashedToken, expiresAt } = generateRefreshToken();

    await Session.create({
      user_id: user.id,
      token: hashedToken,
      expires_at: expiresAt,
      user_agent: req.headers["user-agent"] ?? null,
      ip_address: req.ip,
    });

    res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions(expiresAt));

    user.set({ last_login_at: new Date() });
    await user.save();

    return res.status(200).json(success("Login successful", { token: accessToken }));
  } catch (err) {
    return handleServerError(res, err);
  }
};

export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE];

    if (!refreshToken) return res.status(401).json(unauthorized("Missing refresh token"));

    const hashedTokenValue = hashToken(refreshToken);

    let session = await Session.findOne({ where: { token: hashedTokenValue } });

    // Vol détecté : le token soumis correspond à un previous_token_hash connu
    if (!session) {
      const stolenSession = await Session.findOne({ where: { previous_token_hash: hashedTokenValue } });
      if (stolenSession) {
        await Session.destroy({ where: { user_id: stolenSession.user_id } });
        return res.status(401).json(unauthorized("Session compromised, please log in again"));
      }
      return res.status(401).json(unauthorized("Invalid session"));
    }

    if (session.expires_at < new Date()) {
      await session.destroy();
      return res.status(401).json(unauthorized("Session expired, please log in again"));
    }

    const user = await User.findByPk(session.user_id);

    if (!user) {
      await session.destroy();
      return res.status(401).json(unauthorized("Invalid session"));
    }

    const blockedStatuses = [USER_STATUS.SUSPENDED, USER_STATUS.INACTIVE, USER_STATUS.PENDING_VERIFICATION];
    if (blockedStatuses.includes(user.user_status_id)) {
      await session.destroy();
      return res.status(403).json(forbidden("Account is not active"));
    }

    const accessToken = generateToken({
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role_id,
      userStatus: user.user_status_id,
      emailVerifyAt: user.email_verified_at,
    });

    // Rotation : invalide l'ancien token et en émet un nouveau
    const currentHash = session.token;
    const { token: newRefreshToken, hashedToken: newHashedToken, expiresAt } = generateRefreshToken();

    session.set({ token: newHashedToken, previous_token_hash: currentHash, expires_at: expiresAt });
    await session.save();

    // Surveillance : IP ou user-agent inhabituel
    const currentUA = req.headers["user-agent"] ?? null;
    const currentIP = req.ip;
    if (session.user_agent && currentUA && session.user_agent !== currentUA) {
      console.warn(`[SECURITY] User-Agent changed for session ${session.id}: "${session.user_agent}" -> "${currentUA}"`);
    }
    if (session.ip_address && currentIP && session.ip_address !== currentIP) {
      console.warn(`[SECURITY] IP changed for session ${session.id}: ${session.ip_address} -> ${currentIP}`);
    }

    res.cookie(REFRESH_COOKIE, newRefreshToken, cookieOptions(expiresAt));

    return res.status(200).json(success("Token refreshed", { token: accessToken }));
  } catch (err) {
    return handleServerError(res, err);
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE];

    if (refreshToken) {
      await Session.destroy({ where: { token: hashToken(refreshToken) } });
    }

    res.clearCookie(REFRESH_COOKIE, cookieOptions());

    return res.status(200).json(success("Logged out successfully"));
  } catch (err) {
    return handleServerError(res, err);
  }
};

// Bonus : déconnecte l'utilisateur de tous ses appareils (nécessite d'être authentifié)
export const logoutAll = async (req, res) => {
  try {
    await Session.destroy({ where: { user_id: req.user.id } });

    res.clearCookie(REFRESH_COOKIE, cookieOptions());

    return res.status(200).json(success("Logged out from all devices"));
  } catch (err) {
    return handleServerError(res, err);
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email }, attributes: ["id", "user_status_id"] });

    if (!user || [USER_STATUS.SUSPENDED].includes(user.user_status_id)) {
      return res.status(200).json(success("If this email is registered, you will receive a reset link"));
    }

    const userOtp = await Otp.findOne({ where: { user_id: user.id, type: OTP_TYPES.PASSWORD_RESET } });

    if (userOtp && userOtp.expiredAt > new Date()) return res.status(400).json(conflict("The last code is still valid"));

    const countMinutes = 5;

    const { code, expiredAt } = await generateVerificationCode(6, 1000 * countMinutes * 60);

    await Otp.upsert({ code, expiredAt, type: OTP_TYPES.PASSWORD_RESET, user_id: user.id });

    let emailSent = true;
    try {
      await sendTemplateEmail(email, "Réinitialisation du Mot de Passe", "resetPassword", {
        countMinutes,
        resetCode: code,
      });
    } catch (e) {
      console.error(e.message);
      emailSent = false;
    }

    return res.status(200).json(success("If this email is registered, you will receive a reset link", { emailSent }));
  } catch (err) {
    return handleServerError(res, err);
  }
};

export const resetPassword = async (req, res) => {
  const { email, code, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(404).json(notFound("User not found"));

    const userOtp = await Otp.findOne({ where: { user_id: user.id, type: OTP_TYPES.PASSWORD_RESET } });

    if (!userOtp) return res.status(400).json(badRequest());

    if (userOtp.code !== code) return res.status(400).json(validationFail());

    if (userOtp.expiredAt < new Date()) return res.status(400).json(fail("Your code expired please restart the process"));

    await orm.transaction(async (t) => {
      await User.update({ password }, { where: { id: user.id }, transaction: t });
      await Otp.destroy({ where: { user_id: user.id, type: OTP_TYPES.PASSWORD_RESET }, transaction: t });
    });

    try {
      await sendTemplateEmail(email, "Mot de Passe Réinitialisé", "resetPasswordSuccess", {
        username: `${user.lastname} ${user.firstname}`,
      });
    } catch (e) {
      console.error(e.message);
    }

    return res.status(201).json(success());
  } catch (err) {
    return handleServerError(res, err);
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { exp, iat, ...payload } = req.user;
    const { id, email, emailVerifyAt = null } = payload;
    const { code } = req.body;

    if (emailVerifyAt != null) return res.status(400).json(fail("You have already verified your Email"));

    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(404).json(notFound("User not found"));

    if (id != user.id) return res.status(403).json(forbidden("Invalid token"));

    if (user.email_verified_at !== null) return res.status(400).json(fail("You have already verified your Email"));

    const userCode = await Otp.findOne({ where: { user_id: user.id, type: OTP_TYPES.EMAIL_VERIFICATION } });

    if (!userCode) return res.status(404).json({ ...notFound(), error: "Please regenerate a new code" });

    if (userCode.code !== code) return res.status(400).json(fail("Invalid code"));

    if (userCode.expiredAt < new Date()) return res.status(400).json(fail("Expired code"));

    const verifiedTime = new Date();

    await orm.transaction(async (t) => {
      await User.update(
        { email_verified_at: verifiedTime, user_status_id: USER_STATUS.ACTIVE },
        { where: { id: user.id }, transaction: t }
      );
      await Otp.destroy({ where: { user_id: user.id, type: OTP_TYPES.EMAIL_VERIFICATION }, transaction: t });
    });

    const token = generateToken({ ...payload, emailVerifyAt: verifiedTime });
    let emailSent = false
    try {
      await sendTemplateEmail(user.email, "Verification de l'émail réussie", "congratulation", {
        username: `${user.lastname} ${user.firstname}`,
        heading: "Congratulations"
      });
      emailSent = true
    } catch (e) {
      console.error(e.message);
    }

    return res.status(200).json({ ...verified(token), emailSent });
  } catch (err) {
    return handleServerError(res, err);
  }
};

export const regenerateCode = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) return res.status(404).json(notFound("User not found"));

    if (user.email_verified_at !== null) return res.status(400).json(fail("You have already verified your Email"));

    const userOtp = await Otp.findOne({ where: { user_id: user.id, type: OTP_TYPES.EMAIL_VERIFICATION } });

    let emailSent = false;

    if (!userOtp) {
      try {
        const countMinutes = 5;
        const { code, expiredAt } = await generateVerificationCode(6, 1000 * countMinutes * 60);

        const otp = { code, expiredAt, user_id: user.id, type: OTP_TYPES.EMAIL_VERIFICATION };

        await Otp.create(otp);

        await sendTemplateEmail(user.email, "Demande de nouveau code", "regenerateCode", {
          heading: "Veuillez utiliser ce nouveau code",
          validatedCode: code,
          countMinutes,
        });

        emailSent = true;
      } catch (e) {
        console.error(e);
      }
      return res.status(200).json({ ...success(), emailSent });
    }

    if (userOtp && userOtp.expiredAt > new Date()) return res.status(400).json(conflict("The last code is still valid"));

    const countMinutes = 5;

    const { code, expiredAt } = await generateVerificationCode(6, 1000 * countMinutes * 60);

    await Otp.upsert({ code, expiredAt, type: OTP_TYPES.EMAIL_VERIFICATION, user_id: user.id });

    try {
      await sendTemplateEmail(user.email, "Demande de nouveau code", "regenerateCode", {
        heading: "Veuillez utiliser ce nouveau code",
        validatedCode: code,
        countMinutes,
      });
    } catch (e) {
      console.error(e.message);
    }

    return res.status(200).json(success("Your code has been regenerated"));
  } catch (err) {
    return handleServerError(res, err);
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) return res.status(404).json(notFound("User not found"));

    return res.status(200).json(success("User retrieved successfully", user));
  } catch (err) {
    return handleServerError(res, err);
  }
};
