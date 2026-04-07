import { JWTPayload, SignJWT, jwtVerify } from "jose";

const SESSION_TTL = "8h";
const CAPTCHA_TTL = "5m";

interface AdminSessionPayload extends JWTPayload {
  sub: "admin";
  username: string;
}

interface CaptchaPayload extends JWTPayload {
  sub: "captcha";
  answer: number;
}

const getSecret = (): Uint8Array | null => {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    return null;
  }
  return new TextEncoder().encode(secret);
};

export const createAdminSessionToken = async (username: string) => {
  const secret = getSecret();
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not configured");
  }

  return new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("admin")
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(secret);
};

export const verifyAdminSessionToken = async (
  token: string,
): Promise<AdminSessionPayload | null> => {
  const secret = getSecret();
  if (!secret) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
      subject: "admin",
    });
    return payload as AdminSessionPayload;
  } catch {
    return null;
  }
};

export const createCaptchaToken = async (answer: number) => {
  const secret = getSecret();
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not configured");
  }

  return new SignJWT({ answer })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("captcha")
    .setIssuedAt()
    .setExpirationTime(CAPTCHA_TTL)
    .sign(secret);
};

export const verifyCaptchaToken = async (
  token: string,
  userAnswer: number,
): Promise<boolean> => {
  const secret = getSecret();
  if (!secret) {
    return false;
  }

  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
      subject: "captcha",
    });
    const captchaPayload = payload as CaptchaPayload;
    return Number(captchaPayload.answer) === userAnswer;
  } catch {
    return false;
  }
};
