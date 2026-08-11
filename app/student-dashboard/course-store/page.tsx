"use client";

import React, { useState } from "react";
import { useStudent, CourseStoreItem } from "@/context/StudentContext";
import {
  ShoppingBag,
  Search,
  Star,
  CheckCircle2,
  Tag,
  Clock,
  Sparkles,
  X,
  CreditCard,
  Check,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

export default function CourseStorePage() {
  const { courseStore, enrollInStoreCourse } = useStudent();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<CourseStoreItem | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  const filteredStore = courseStore.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConfirmPurchase = () => {
    if (!selectedCourse) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPurchaseSuccess(true);
      enrollInStoreCourse(selectedCourse.id);
      setTimeout(() => {
        setPurchaseSuccess(false);
        setShowCheckoutModal(false);
        setSelectedCourse(null);
      }, 1500);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Store Header & Search */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag className="h-5 w-5 text-cyan-400" />
              <h2 className="text-xl font-bold text-white">Course Store & Academic Programs</h2>
            </div>
            <p className="text-xs text-slate-400">
              Upgrade your target entrance rank with specialized batch series, crash courses, and skill boot camps.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search store catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* 2. Course Store Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStore.map((item) => (
          <div
            key={item.id}
            className="rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 p-6 flex flex-col justify-between space-y-6 transition-all group shadow-xl"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold font-mono">
                  {item.category}
                </span>
                {item.badge && (
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                    {item.badge}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Duration: {item.duration} • Level: {item.level}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center text-amber-400 font-bold gap-1">
                  <Star className="h-4 w-4 fill-amber-400" />
                  <span>{item.rating}</span>
                </div>
                <span className="text-slate-500">({item.reviewsCount} reviews)</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                {item.description}
              </p>

              <div className="space-y-1.5 pt-2">
                {item.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white font-mono">
                  ₹{item.price.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 line-through font-mono">
                  ₹{item.originalPrice.toLocaleString()}
                </span>
              </div>

              {item.isEnrolled ? (
                <div className="py-3 text-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs">
                  Active Enrolled Course
                </div>
              ) : (
                <button
                  onClick={() => setSelectedCourse(item)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs hover:from-cyan-400 hover:to-emerald-400 shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Tag className="h-4 w-4" /> View Details & Buy
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Detail Drawer & Checkout Popup */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md h-full bg-slate-900 border-l border-slate-800 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-cyan-400" /> Program Details
                </h3>
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <span className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-400 text-xs font-mono font-bold">
                    {selectedCourse.category}
                  </span>
                  <h2 className="text-xl font-bold text-white mt-2">{selectedCourse.title}</h2>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Target Level</span>
                    <span className="text-white font-semibold">{selectedCourse.level}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Duration</span>
                    <span className="text-white font-semibold">{selectedCourse.duration}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Special Pricing</span>
                    <span className="text-emerald-400 font-bold font-mono">₹{selectedCourse.price}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase font-mono">Overview</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {selectedCourse.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 space-y-3">
              <button
                onClick={() => setShowCheckoutModal(true)}
                className="w-full py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
              >
                Proceed to Pay ₹{selectedCourse.price}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Payment Checkout Modal */}
      {showCheckoutModal && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <button
              onClick={() => setShowCheckoutModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-cyan-400" /> Checkout Gateway Simulation
            </h3>

            {purchaseSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mx-auto">
                  <Check className="h-8 w-8" />
                </div>
                <h4 className="text-lg font-bold text-white">Enrollment Successful!</h4>
                <p className="text-xs text-slate-400">
                  Course added to your active dashboard.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono">SELECTED COURSE</span>
                  <p className="text-sm font-bold text-white">{selectedCourse.title}</p>
                  <p className="text-lg font-black text-cyan-400 font-mono">₹{selectedCourse.price}</p>
                </div>

                <button
                  onClick={handleConfirmPurchase}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  {isProcessing ? "Processing Razorpay Demo..." : `Confirm Payment ₹${selectedCourse.price}`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
