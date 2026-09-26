"use client";

import { NirnayLogo } from "@/components/NirnayLogo";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ArrowLeft, Phone, Mail, ShieldCheck, RefreshCw, UserCheck, Eye, EyeOff, Check, X, AlertCircle } from "lucide-react";

const DISPOSABLE_DOMAINS = [
  "yopmail.com", "yopmail.fr", "yopmail.net", "tempmail.com", "temp-mail.org",
  "tempmail.net", "tempmailo.com", "mailinator.com", "mailinator.net",
  "10minutemail.com", "10minutemail.net", "guerrillamail.com", "sharklasers.com",
  "throwawaymail.com", "trashmail.com", "dispostable.com", "getnada.com",
  "mohmal.com", "maildrop.cc", "crazymailing.com", "fakeinbox.com"
];

export default function RegisterPage() {
  const { register, sendMobileOtp, verifyMobileOtp } = useAuth();
  const router = useRouter();

  const [authMethod, setAuthMethod] = useState<"email" | "mobile">("email");

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("COMMUNITY_REPORTER");

  // Mobile state
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Live password validation criteria
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  // Live disposable email check
  const emailDomain = email.includes("@") ? email.split("@")[1].toLowerCase() : "";
  const isDisposableEmail = DISPOSABLE_DOMAINS.includes(emailDomain) || emailDomain.endsWith(".temp") || emailDomain.endsWith(".disposable");

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isDisposableEmail) {
      setError("Disposable or temporary email addresses are prohibited. Please use a permanent email address.");
      return;
    }

    if (!isPasswordValid) {
      setError("Please ensure your password meets all required security criteria.");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match. Please re-enter your password.");
      return;
    }

    setSubmitting(true);
    try {
      await register(displayName, email, password, role);
      router.push("/app");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage || "Registration failed");
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
      await verifyMobileOtp(phone, otpCode, displayName || `User ${phone.slice(-4)}`, role);
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
      {/* Top Header Bar */}
      <div className="w-full max-w-md mx-auto mb-6 flex items-center justify-between gap-3">
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-300 rounded-lg shadow-sm hover:bg-stone-50 hover:border-stone-400 transition-all cursor-pointer min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4 text-stone-600" />
          <span>Back to Home</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex flex-col items-center justify-center space-y-2 group">
          <NirnayLogo size="lg" variant="light" showSubtitle={true} />
        </Link>
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-stone-900">
          Create your NIRNAY account
        </h2>
        <p className="mt-2 text-center text-sm text-stone-600">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-amber-700 hover:text-amber-800 underline">
            Sign in
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
              <span>Email Registration</span>
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
              <span>Mobile OTP Registration</span>
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 text-red-700 text-sm font-medium rounded flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {authMethod === "email" ? (
            <form className="space-y-5" onSubmit={handleEmailSubmit}>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                  Full Name / Organization Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-amber-600 text-sm"
                    placeholder="Dr. Rajesh Sharma"
                  />
                </div>
              </div>

              {/* Role Selection Dropdown */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                  Platform Role / Capacity
                </label>
                <div className="mt-1">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-amber-600 text-sm font-medium text-stone-800"
                  >
                    <option value="COMMUNITY_REPORTER">Citizen / Community Reporter</option>
                    <option value="HEI_INNOVATOR">HEI Innovator / Researcher / Faculty</option>
                    <option value="INDUSTRY_PARTNER">Industry Scaling Partner</option>
                    <option value="GOVERNMENT_OFFICIAL">Government Nodal Officer</option>
                  </select>
                </div>
              </div>

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
                    className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-stone-400 focus:outline-none text-sm ${
                      isDisposableEmail
                        ? "border-red-500 ring-1 ring-red-500 bg-red-50/30"
                        : "border-stone-300 focus:ring-2 focus:ring-amber-600 focus:border-amber-600"
                    }`}
                    placeholder="rajesh@jharkhand.gov.in"
                  />
                </div>
                {isDisposableEmail && (
                  <p className="mt-1 text-xs text-red-600 font-semibold flex items-center gap-1">
                    <X className="w-3.5 h-3.5" /> Temporary/disposable emails are blocked. Use a permanent domain.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-stone-300 rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-amber-600 text-sm"
                    placeholder="At least 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Checklist */}
                {password.length > 0 && (
                  <div className="mt-2.5 p-3 bg-stone-50 border border-stone-200 rounded-lg space-y-1.5 text-xs text-stone-600">
                    <div className="font-semibold text-stone-700 text-[11px] uppercase tracking-wider mb-1">
                      Security Requirements:
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[11px]">
                      <div className={`flex items-center gap-1.5 ${hasMinLength ? "text-emerald-700 font-semibold" : "text-stone-500"}`}>
                        {hasMinLength ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-stone-400" />}
                        <span>Min. 8 characters</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${hasUppercase ? "text-emerald-700 font-semibold" : "text-stone-500"}`}>
                        {hasUppercase ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-stone-400" />}
                        <span>1 Uppercase (A-Z)</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${hasLowercase ? "text-emerald-700 font-semibold" : "text-stone-500"}`}>
                        {hasLowercase ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-stone-400" />}
                        <span>1 Lowercase (a-z)</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${hasNumber ? "text-emerald-700 font-semibold" : "text-stone-500"}`}>
                        {hasNumber ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-stone-400" />}
                        <span>1 Number (0-9)</span>
                      </div>
                      <div className={`flex items-center gap-1.5 col-span-2 ${hasSpecial ? "text-emerald-700 font-semibold" : "text-stone-500"}`}>
                        {hasSpecial ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-stone-400" />}
                        <span>1 Special Symbol (!@#$%^&*)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                  Confirm Password
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-stone-400 focus:outline-none text-sm ${
                      confirmPassword && !passwordsMatch
                        ? "border-red-500 ring-1 ring-red-500 bg-red-50/30"
                        : "border-stone-300 focus:ring-2 focus:ring-amber-600 focus:border-amber-600"
                    }`}
                    placeholder="Re-enter password"
                  />
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="mt-1 text-xs text-red-600 font-semibold">Passwords do not match.</p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={submitting || isDisposableEmail || !isPasswordValid || !passwordsMatch}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {submitting ? "Creating Account..." : "Register Account"}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-5">
              {!otpSent ? (
                <form className="space-y-5" onSubmit={handleSendOtp}>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                      Full Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-amber-600 text-sm"
                        placeholder="Ramesh Kumar"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                      Primary Platform Role
                    </label>
                    <div className="mt-1">
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-amber-600 text-sm font-medium text-stone-800"
                      >
                        <option value="COMMUNITY_REPORTER">Citizen / Community Reporter</option>
                        <option value="HEI_INNOVATOR">HEI Innovator / Researcher / Faculty</option>
                        <option value="INDUSTRY_PARTNER">Industry Scaling Partner</option>
                        <option value="GOVERNMENT_OFFICIAL">Government Nodal Officer</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                      Mobile Phone Number
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
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{submitting ? "Sending OTP..." : "Send Verification OTP"}</span>
                  </button>
                </form>
              ) : (
                <form className="space-y-5" onSubmit={handleVerifyOtp}>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">{otpMessage}</p>
                      <p className="text-[11px] text-emerald-700 mt-0.5">Enter code <strong className="font-bold">123456</strong> to complete registration.</p>
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
                        Change Details
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
                    <UserCheck className="w-4 h-4" />
                    <span>{submitting ? "Verifying..." : "Verify & Complete Registration"}</span>
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
