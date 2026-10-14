import { Otp } from "../../database/models/index.js";

export const OTP_MAX_ATTEMPTS = 5;

/**
 * Consomme une tentative de vérification pour un code OTP.
 *
 * L'incrément est fait AVANT la comparaison du code (et via une requête
 * atomique `Otp.increment') : plusieurs requêtes concurrentes ne peuvent donc
 * pas valider plus de OTP_MAX_ATTEMPTS essais, même si elles se chevauchent en
 * parallèle. Au-delà, le code est supprimé et l'utilisateur doit en demander
 * un nouveau.
 *
 * @param {number|string} userId
 * @param {string} type - Type OTP (OTP_TYPES)
 * @returns {Promise<{ otp: object|null, locked: boolean }>}
 */
export const consumeOtpAttempt = async (userId, type) => {
  // Incrément atomique avant toute comparaison du code.
  await Otp.increment("attempts", { by: 1, where: { user_id: userId, type } });

  const otp = await Otp.findOne({ where: { user_id: userId, type } });

  if (!otp) return { otp: null, locked: false };

  if (otp.attempts > OTP_MAX_ATTEMPTS) {
    await Otp.destroy({ where: { user_id: userId, type } });
    return { otp: null, locked: true };
  }

  return { otp, locked: false };
};