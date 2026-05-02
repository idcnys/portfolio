import { NextResponse } from "next/server";
import { createCaptchaToken } from "@/lib/security/session";

const generateRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const operators = ["+", "-", "*"];

export async function GET() {
  try {
    const num1 = generateRandomNumber(1, 10);
    const num2 = generateRandomNumber(1, 10);
    const operator = operators[generateRandomNumber(0, 2)];
    let question = `${num1} ${operator} ${num2} = ?`;
    let answer;

    switch (operator) {
      case "+":
        answer = num1 + num2;
        break;
      case "-":
        answer = num1 - num2;
        break;
      case "*":
        answer = num1 * num2;
        break;
      default:
        throw new Error("Invalid operator");
    }

    const token = await createCaptchaToken(answer);

    return NextResponse.json({ question, token });
  } catch (e) {
    const error = e as Error;
    return NextResponse.json(
      {
        error: `Failed to generate captcha: ${error.message}`,
      },
      { status: 500 },
    );
  }
}
