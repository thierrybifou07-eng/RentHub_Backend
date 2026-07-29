import crypto from "crypto";

const REFRESH_TOKEN_BYTES = 64;
const DEFAULT_REFRESH_TOKEN_TTL = 30 * 24 * 60 * 60 * 1000; // 30 jours

export const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

// Retourne le token brut (à envoyer au client via cookie) et sa version
// hashée (à stocker en base) — on ne stocke jamais le token brut en DB.
export const generateRefreshToken = (expiredMilliSeconds = DEFAULT_REFRESH_TOKEN_TTL) => {
  const token = crypto.randomBytes(REFRESH_TOKEN_BYTES).toString("hex");
  const hashedToken = hashToken(token);
  const expiresAt = new Date(Date.now() + expiredMilliSeconds);

  return { token, hashedToken, expiresAt };
};
