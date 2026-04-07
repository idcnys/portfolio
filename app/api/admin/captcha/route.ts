import { NextResponse } from "next/server";
import { createCaptchaToken } from "@/lib/security/session";

export async function GET() {
  try {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    const token = await createCaptchaToken(a + b);

    return NextResponse.json({
      question: `${a} + ${b} = ?`,
      token,
    });
  } catch {
    return NextResponse.json(
      { error: "Server security configuration is missing." },
      { status: 500 },
    );
  }
}
