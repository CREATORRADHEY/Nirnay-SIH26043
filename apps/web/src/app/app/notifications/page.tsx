"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth-context";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  resource_type: string | null;
  resource_id: string | null;
  created_at: string;
  read_at: string | null;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");

  const fetchNotifications = () => {
    setLoading(true);
    fetch("/api/v1/notifications?limit=50", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setItems(data.items || []);
          setUnreadCount(data.unread_count || 0);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    await fetch(`/api/v1/notifications/${id}/read`, { method: "POST", credentials: "include" });
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    await fetch("/api/v1/notifications/read-all", { method: "POST", credentials: "include" });
    fetchNotifications();
  };

  const filtered = items.filter((n) => filter === "ALL" || !n.read_at);
  const isGov = user?.platform_role.startsWith("GOVERNMENT_") || user?.platform_role === "PLATFORM_ADMIN";

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Notifications Inbox</h1>
            <p className="text-sm text-stone-600 mt-1">
              Activity alerts, clarification queries, and lifecycle updates.
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-lg border border-stone-300 transition-colors whitespace-nowrap"
            >
              Mark All as Read ({unreadCount})
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2 border-b border-stone-200 pb-2 text-xs font-semibold">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === "ALL" ? "bg-stone-900 text-amber-400 font-bold" : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            All Notifications ({items.length})
          </button>
          <button
            onClick={() => setFilter("UNREAD")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === "UNREAD" ? "bg-stone-900 text-amber-400 font-bold" : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            Unread Only ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="py-12 text-center text-stone-500 text-sm font-medium">Loading notifications...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-stone-200 p-12 text-center text-stone-500 text-sm">
            No notifications in inbox matching filter.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden divide-y divide-stone-100">
            {filtered.map((item) => {
              const linkUrl = item.resource_id
                ? isGov
                  ? `/app/review/${item.resource_id}`
                  : `/app/challenges/${item.resource_id}`
                : "/app";

              return (
                <div
                  key={item.id}
                  className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    !item.read_at ? "bg-amber-50/40 font-semibold" : "hover:bg-stone-50/50"
                  }`}
                >
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center space-x-2">
                      {!item.read_at && <span className="w-2 h-2 rounded-full bg-amber-600 flex-shrink-0"></span>}
                      <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">{item.title}</span>
                    </div>
                    <p className="text-xs text-stone-700 font-normal leading-relaxed">{item.message}</p>
                    <span className="text-[10px] text-stone-500 block font-normal pt-1">
                      {new Date(item.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 whitespace-nowrap self-end sm:self-center">
                    <Link
                      href={linkUrl}
                      className="px-3.5 py-1.5 bg-stone-900 text-white rounded text-xs font-bold hover:bg-stone-800"
                    >
                      Open Resource →
                    </Link>
                    {!item.read_at && (
                      <button
                        onClick={() => handleMarkRead(item.id)}
                        className="text-xs font-bold text-stone-500 hover:text-stone-900 border border-stone-300 px-2.5 py-1.5 rounded bg-white"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
