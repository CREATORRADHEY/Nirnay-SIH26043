"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { AppShell } from "@/components/AppShell";

interface UserSession {
  id: string;
  created_at: string;
  expires_at: string;
  last_seen_at: string;
  ip_address: string | null;
  user_agent: string | null;
  is_current: boolean;
}

export default function SecuritySessionsPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}/api/v1/auth/sessions`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const handleRevokeSession = async (sessionId: string) => {
    setMsg(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}/api/v1/auth/sessions/${sessionId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (res.ok) {
        setMsg("Session revoked successfully.");
        await fetchSessions();
      }
    } catch {
      setMsg("Failed to revoke session.");
    }
  };

  const handleRevokeOthers = async () => {
    setMsg(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}/api/v1/auth/sessions/revoke-others`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (res.ok) {
        setMsg("All other active sessions revoked.");
        await fetchSessions();
      }
    } catch {
      setMsg("Failed to revoke other sessions.");
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl space-y-6">
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Active Security Sessions</h1>
            <p className="text-sm text-stone-600 mt-1">Review active devices and revoke unrecognised sessions.</p>
          </div>
          <button
            onClick={handleRevokeOthers}
            className="px-4 py-2 bg-red-600 text-white font-semibold text-xs rounded-lg hover:bg-red-700 transition-colors"
          >
            Revoke All Other Sessions
          </button>
        </div>

        {msg && <div className="p-3 bg-amber-50 text-amber-900 text-sm font-medium rounded-md">{msg}</div>}

        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden divide-y divide-stone-100">
          <div className="px-6 py-3 bg-stone-50 text-xs font-bold text-stone-500 uppercase tracking-wider">
            Active Devices & Sessions ({sessions.length})
          </div>

          {loading ? (
            <div className="p-6 text-center text-stone-500 text-sm">Loading security sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="p-6 text-center text-stone-500 text-sm">No active sessions found.</div>
          ) : (
            sessions.map((s) => (
              <div key={s.id} className="p-6 flex items-center justify-between hover:bg-stone-50">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-stone-900 text-sm">
                      {s.user_agent ? (s.user_agent.length > 50 ? s.user_agent.substring(0, 50) + "..." : s.user_agent) : "Unknown Device"}
                    </span>
                    {s.is_current && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                        Current Session
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-stone-500">
                    IP Address: {s.ip_address || "127.0.0.1"} • Created: {new Date(s.created_at).toLocaleString()} • Last Active: {new Date(s.last_seen_at).toLocaleString()}
                  </div>
                </div>

                {!s.is_current && (
                  <button
                    onClick={() => handleRevokeSession(s.id)}
                    className="px-3 py-1.5 bg-stone-100 hover:bg-red-50 text-stone-700 hover:text-red-700 border border-stone-300 rounded text-xs font-semibold transition-colors"
                  >
                    Revoke
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
