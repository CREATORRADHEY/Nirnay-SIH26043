"use client";

import { NirnayLogo } from "@/components/NirnayLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/language-context";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ArrowLeft, Phone, Mail, ShieldCheck, RefreshCw, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const { login, sendMobileOtp, verifyMobileOtp } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [authMethod, setAuthMethod] = useState<"email" | "mobile">("email");
  
  // Email form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Mobile OTP state
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.push("/app");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage || "Failed to log in");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!phone || phone.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await sendMobileOtp(phone);
      setOtpSent(true);
      setOtpMessage(res.message || "OTP code sent successfully.");
      setOtpCode(res.otp_code || "123456");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send OTP";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!otpCode || otpCode.length < 4) {
      setError("Please enter the OTP code received on your mobile.");
      return;
    }
    setSubmitting(true);
    try {
      await verifyMobileOtp(phone, otpCode);
      router.push("/app");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to verify OTP";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 text-stone-900 font-sans relative">
      {/* Top Header Bar for Back button and Language Switcher */}
      <div className="w-full max-w-md mx-auto mb-6 flex items-center justify-between gap-3">
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-300 rounded-lg shadow-sm hover:bg-stone-50 hover:border-stone-400 transition-all cursor-pointer min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4 text-stone-600" />
          <span>{t("back_to_site", "Back to Site")}</span>
        </button>

        <LanguageSwitcher variant="light" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex flex-col items-center justify-center space-y-2 group">
          <NirnayLogo size="lg" variant="light" showSubtitle={true} />
        </Link>
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-stone-900">
          Sign in to your NIRNAY account
        </h2>
        <p className="mt-2 text-center text-sm text-stone-600">
          Or{" "}
          <Link href="/register" className="font-semibold text-amber-700 hover:text-amber-800 underline">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-stone-200 sm:rounded-xl sm:px-10">
          
          {/* Auth Method Switcher Tabs */}
          <div className="flex border-b border-stone-200 mb-6 font-medium text-xs">
            <button
              onClick={() => { setAuthMethod("email"); setError(null); }}
              className={`flex-1 pb-3 text-center border-b-2 flex items-center justify-center gap-1.5 font-semibold transition-colors cursor-pointer ${
                authMethod === "email"
                  ? "border-amber-600 text-amber-800"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email & Password</span>
            </button>
            <button
              onClick={() => { setAuthMethod("mobile"); setError(null); }}
              className={`flex-1 pb-3 text-center border-b-2 flex items-center justify-center gap-1.5 font-semibold transition-colors cursor-pointer ${
                authMethod === "mobile"
                  ? "border-amber-600 text-amber-800"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Mobile OTP</span>
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 text-red-700 text-sm font-medium rounded">
              {error}
            </div>
          )}

          {authMethod === "email" ? (
            <form className="space-y-6" onSubmit={handleEmailSubmit}>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                  Email Address
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-amber-600 text-sm"
                    placeholder="user@example.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-xs text-amber-700 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="mt-1 relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-stone-300 rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-amber-600 text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {submitting ? "Signing in..." : "Sign In with Email"}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {!otpSent ? (
                <form className="space-y-5" onSubmit={handleSendOtp}>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                      Mobile Number
                    </label>
                    <div className="mt-1.5 flex rounded-md shadow-sm">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-stone-300 bg-stone-100 text-stone-600 text-xs font-semibold">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="flex-1 min-w-0 w-full px-3 py-2 border border-stone-300 rounded-r-md placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-amber-600 text-sm"
                        placeholder="9876543210"
                      />
                    </div>
                    <p className="mt-1.5 text-[11px] text-stone-500">
                      We will send a 6-digit OTP code to this mobile number for instant authentication.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{submitting ? "Sending OTP..." : "Get OTP Code"}</span>
                  </button>
                </form>
              ) : (
                <form className="space-y-5" onSubmit={handleVerifyOtp}>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">{otpMessage}</p>
                      <p className="text-[11px] text-emerald-700 mt-0.5">Enter code <strong className="font-bold">123456</strong> for instant testing access.</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                        Enter 6-Digit OTP
                      </label>
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="text-[11px] font-semibold text-amber-700 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Change Phone
                      </button>
                    </div>
                    <div className="mt-1.5">
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="w-full tracking-widest text-center text-lg font-mono px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-amber-600"
                        placeholder="123456"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{submitting ? "Verifying..." : "Verify & Sign In"}</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
