"use client";

import React, { useState } from "react";
import { useStudent, NotificationItem } from "@/context/StudentContext";
import {
  Bell,
  Search,
  CheckCircle2,
  Filter,
  RefreshCw,
  Settings,
  X,
  AlertCircle,
  Clock,
  Shield,
  Monitor,
  Laptop,
  Check,
  ChevronRight,
} from "lucide-react";

export default function NotificationsPage() {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useStudent();

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const categories = [
    "All",
    "Unread",
    "Assignments",
    "Tests",
    "Courses",
    "Attendance",
    "Certificates",
    "Payments",
    "Announcements",
  ];

  const filteredNotifications = notifications.filter((item) => {
    // Search query filter
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sender.toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter
    let matchesCategory = true;
    if (activeCategory === "Unread") matchesCategory = !item.read;
    else if (activeCategory !== "All") matchesCategory = item.category === activeCategory;

    // Filter pill
    let matchesPill = true;
    if (activeFilter === "Unread") matchesPill = !item.read;
    if (activeFilter === "Today") matchesPill = item.date === "Today";
    if (activeFilter === "Important") matchesPill = !!item.important;
    if (activeFilter === "Read") matchesPill = item.read;

    return matchesSearch && matchesCategory && matchesPill;
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleSelectNotif = (notif: NotificationItem) => {
    setSelectedNotif(notif);
    if (!notif.read) {
      markNotificationAsRead(notif.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/90 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bell className="h-5 w-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">Notifications Hub</h2>
          </div>
          <p className="text-xs text-slate-400">
            Real-time automated alerts, class schedules, exam updates, and fee receipts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={markAllNotificationsAsRead}
            className="px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> Mark All Read
          </button>
          <button
            onClick={handleRefresh}
            className={`p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all ${
              isRefreshing ? "animate-spin" : ""
            }`}
            title="Refresh List"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 2. Category Filters & Search Bar */}
      <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
        {/* Search Input & Quick Status Pills */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search notifications by keyword, sender, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {["All", "Unread", "Today", "Important", "Read"].map((pill) => (
              <button
                key={pill}
                onClick={() => setActiveFilter(pill)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  activeFilter === pill
                    ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                    : "bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {pill}
              </button>
            ))}
          </div>
        </div>

        {/* Category Scroll Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-t border-slate-800/80 pt-3">
          <span className="text-xs font-bold text-slate-400 uppercase font-mono mr-2 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap border ${
                activeCategory === cat
                  ? "bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 border-cyan-500/40 text-cyan-300 font-semibold"
                  : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Notification List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
            <Bell className="h-10 w-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No notifications found</h3>
            <p className="text-xs text-slate-400">
              Try adjusting your search criteria or category filter.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleSelectNotif(notif)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                notif.read
                  ? "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
                  : "bg-gradient-to-r from-cyan-950/30 to-slate-900 border-cyan-500/40 text-white shadow-lg hover:border-cyan-400"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-sm ${
                    notif.important
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : notif.read
                      ? "bg-slate-800 text-slate-400"
                      : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  }`}
                >
                  <Bell className="h-5 w-5" />
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-slate-800 text-cyan-300">
                      {notif.category}
                    </span>
                    {notif.important && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        IMPORTANT
                      </span>
                    )}
                    {!notif.read && (
                      <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white">{notif.title}</h4>
                  <p className="text-xs text-slate-300 line-clamp-2">{notif.message}</p>
                </div>
              </div>

              <div className="flex md:flex-col items-center md:items-end justify-between text-xs text-slate-400 border-t md:border-t-0 pt-2 md:pt-0 border-slate-800">
                <span className="font-mono">{notif.date} • {notif.time}</span>
                <span className="text-[11px] text-cyan-400 font-medium flex items-center gap-1">
                  Details <ChevronRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 4. Slide-out Detail Drawer */}
      {selectedNotif && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md h-full bg-slate-900 border-l border-slate-800 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Bell className="h-5 w-5 text-cyan-400" /> Notification Details
                </h3>
                <button
                  onClick={() => setSelectedNotif(null)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 text-xs font-bold font-mono">
                      {selectedNotif.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {selectedNotif.date} at {selectedNotif.time}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white">{selectedNotif.title}</h2>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-slate-200 leading-relaxed">
                  {selectedNotif.message}
                </div>

                {/* Audit & Device Metadata Box */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3 text-xs">
                  <h4 className="font-bold text-slate-300 uppercase font-mono tracking-wider text-[11px] flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-emerald-400" /> Security & Audit Log
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-slate-400">
                    <div>
                      <span className="block text-[10px] text-slate-500">Sender Component</span>
                      <span className="font-semibold text-slate-200">{selectedNotif.sender}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500">Recorded IP</span>
                      <span className="font-mono text-cyan-400">{selectedNotif.ip}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500">Platform OS</span>
                      <span className="font-semibold text-slate-200">{selectedNotif.os}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500">Device Browser</span>
                      <span className="font-semibold text-slate-200">{selectedNotif.device}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 mt-6">
              <button
                onClick={() => setSelectedNotif(null)}
                className="w-full py-3 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 transition-colors"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
