"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}/api/v1/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-stone-900 font-sans relative">
      {/* Top Left Navigation Back Button */}
      <div className="absolute top-6 left-6">
        <button
          onClick={() => router.push("/login")}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-300 rounded-lg shadow-sm hover:bg-stone-50 hover:border-stone-400 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-stone-600" />
          <span>Back to Sign In</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex flex-col items-center justify-center space-y-2 group">
          <div className="p-3 bg-stone-900 rounded-2xl shadow-md border border-stone-800 group-hover:scale-105 transition-transform flex items-center justify-center">
            <img 
              src="/logo-icon.png" 
              onError={(e) => { e.currentTarget.src = "/logo.png"; }} 
              alt="NIRNAY Logo" 
              className="w-14 h-14 object-contain rounded-lg" 
            />
          </div>
          <div className="text-3xl font-black tracking-tight text-stone-900 font-serif mt-1">NIRNAY</div>
          <div className="text-[11px] font-bold text-amber-800 font-mono tracking-widest uppercase bg-amber-100/80 border border-amber-200/80 px-3 py-0.5 rounded-full">
            PEOPLE • IDEAS • IMPACT
          </div>
        </Link>
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-stone-900">
          Reset your password
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-stone-200 sm:rounded-xl sm:px-10">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                ✓
              </div>
              <p className="text-sm text-stone-700 font-medium">
                If an account exists with {email}, a password reset link has been dispatched.
              </p>
              <div className="pt-2">
                <Link href="/login" className="text-sm font-semibold text-amber-700 hover:underline">
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
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
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {submitting ? "Sending Reset Link..." : "Send Reset Link"}
                </button>
              </div>

              <div className="text-center">
                <Link href="/login" className="text-xs font-semibold text-stone-500 hover:text-stone-700">
                  Cancel and return to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
