import { NextResponse } from "next/server";
import {
  createAdminSessionToken,
  verifyCaptchaToken,
} from "@/lib/security/session";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      username?: string;
      password?: string;
      captchaAnswer?: number;
      captchaToken?: string;
    };

    const username = body.username?.trim() || "";
    const password = body.password || "";
    const captchaToken = body.captchaToken || "";
    const captchaAnswer = Number(body.captchaAnswer);

    if (!captchaToken || Number.isNaN(captchaAnswer)) {
      return NextResponse.json(
        { error: "Captcha verification is required." },
        { status: 400 },
      );
    }

    const captchaValid = await verifyCaptchaToken(captchaToken, captchaAnswer);
    if (!captchaValid) {
      return NextResponse.json(
        { error: "Captcha verification failed." },
        { status: 401 },
      );
    }

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUsername || !adminPassword || !process.env.ADMIN_SESSION_SECRET) {
      return NextResponse.json(
        { error: "Server security environment is not configured." },
        { status: 500 },
      );
    }

    if (username !== adminUsername || password !== adminPassword) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 },
      );
    }

    const token = await createAdminSessionToken(username);
    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: "admin_session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
