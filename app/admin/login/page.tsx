"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeProvider } from "../../../lib/context/ThemeContext";
import { logActivity } from "../../../lib/firebase";
import { AlertTriangle, RefreshCw, Loader2, LogIn, ArrowLeft } from "lucide-react";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captchaQuestion, setCaptchaQuestion] = useState("Loading...");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const regenerateCaptcha = async () => {
    try {
      const response = await fetch("/api/admin/captcha", {
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to load captcha.");
      }
      setCaptchaQuestion(data.question);
      setCaptchaToken(data.token);
      setCaptchaInput("");
    } catch {
      setCaptchaQuestion("Unavailable");
      setCaptchaToken("");
      setError("Unable to initialize captcha. Check server env settings.");
    }
  };

  useEffect(() => {
    void regenerateCaptcha();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          captchaAnswer: Number(captchaInput),
          captchaToken,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        try {
          await logActivity("login", "auth", "dashboard", "Admin Login");
        } catch {}
        router.push("/admin/dashboard");
      } else {
        setError(data?.error || "Login failed");
        await regenerateCaptcha();

        try {
          await logActivity(
            "view",
            "auth",
            "login-failed",
            "Failed Login Attempt",
          );
        } catch {}
      }
    } catch (err) {
      // console.error("Login error:", err);
      setError("An error occurred during login");
      await regenerateCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-16 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800/70 shadow-sm p-8 rounded-[28px]">
        <div className="text-center mb-8">
       
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
            Admin Login
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Sign in to manage your dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 p-3 rounded-2xl text-sm flex items-center gap-2 ring-1 ring-rose-200/70 dark:ring-rose-800/70">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-4 py-3 focus:border-slate-400 dark:focus:border-slate-600 focus:ring-2 focus:ring-slate-300/50 outline-none transition"
              placeholder="Enter username"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-4 py-3 focus:border-slate-400 dark:focus:border-slate-600 focus:ring-2 focus:ring-slate-300/50 outline-none transition"
              placeholder="Enter password"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">
                  Captcha Verification
                </label>
                <button
                  type="button"
                  onClick={() => void regenerateCaptcha()}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
                  aria-label="Refresh captcha"
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-semibold px-4 py-3 text-center">
                {captchaQuestion}
              </div>
            </div>
            <input
              type="number"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-4 py-3 focus:border-slate-400 dark:focus:border-slate-600 focus:ring-2 focus:ring-slate-300/50 outline-none transition"
              placeholder="Enter captcha answer"
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-2xl bg-slate-950 text-white font-semibold py-3 hover:bg-slate-800 transition disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Sign in
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-100 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Portfolio
          </Link>
        </div>
      </div>
    </div>
  );
};

const LoginPage: React.FC = () => {
  return (
    <ThemeProvider>
      <Login />
    </ThemeProvider>
  );
};

export default LoginPage;
