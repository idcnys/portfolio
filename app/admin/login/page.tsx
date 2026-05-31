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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#FFDB14] rounded-2xl flex items-center justify-center font-black text-2xl text-gray-900 shadow-lg ring-4 ring-yellow-400/20 mx-auto mb-4">
            B
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Login
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Enter credentials to access dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm font-medium flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFDB14] focus:border-transparent outline-none transition-all"
              placeholder="Enter username"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFDB14] focus:border-transparent outline-none transition-all"
              placeholder="Enter password"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Captcha Verification
            </label>
            <div className="flex items-center gap-3 mb-2">
              <div className="px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-black text-lg abcdefghijwide min-w-[120px] text-center">
                {captchaQuestion}
              </div>
              <button
                type="button"
                onClick={() => void regenerateCaptcha()}
                className="px-3 py-3 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                aria-label="Refresh captcha"
                disabled={isLoading}
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <input
              type="number"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFDB14] focus:border-transparent outline-none transition-all"
              placeholder="Enter captcha answer"
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#FFDB14] text-gray-900 font-bold py-4 rounded-xl hover:bg-[#e6c512] transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
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
