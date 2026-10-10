"use client";

import React, { useState } from "react";
import { useStudent } from "@/context/StudentContext";
import {
  User,
  KeyRound,
  Edit3,
  CheckCircle2,
  Shield,
  X,
  Phone,
  Save,
} from "lucide-react";

export default function ProfileManagePage() {
  const { profile, updateProfile } = useStudent();

  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [showPasswordDrawer, setShowPasswordDrawer] = useState(false);

  // Edit profile form state
  const [phone, setPhone] = useState(profile.phone);
  const [email, setEmail] = useState(profile.email);
  const [guardianPhone, setGuardianPhone] = useState(profile.guardianPhone);
  const [address, setAddress] = useState(profile.address);
  const [city] = useState(profile.city);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password state
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setTimeout(() => {
      updateProfile({ phone, email, guardianPhone, address, city });
      setIsSavingProfile(false);
      setShowEditDrawer(false);
    }, 600);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      alert("New password and confirm password do not match!");
      return;
    }
    setIsChangingPass(true);
    setTimeout(() => {
      setIsChangingPass(false);
      setPassSuccess(true);
      setTimeout(() => {
        setPassSuccess(false);
        setShowPasswordDrawer(false);
        setCurrentPass("");
        setNewPass("");
        setConfirmPass("");
      }, 1000);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Quick Drawer Controls */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <User className="h-5 w-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">Profile & Security Management</h2>
          </div>
          <p className="text-xs text-slate-400">
            Personal identity, academic credentials, and portal security controls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEditDrawer(true)}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
          >
            <Edit3 className="h-4 w-4" /> Edit Contact Info
          </button>
          <button
            onClick={() => setShowPasswordDrawer(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 text-cyan-400 border border-cyan-500/30 hover:bg-slate-700 font-bold text-xs flex items-center gap-2 transition-all"
          >
            <KeyRound className="h-4 w-4" /> Security / Password
          </button>
        </div>
      </div>

      {/* 2. Main Profile Summary Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-slate-800">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500 to-emerald-500 text-slate-950 font-black text-3xl shadow-xl">
            {profile.name.charAt(0)}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 text-[10px] font-bold font-mono">
                {profile.admissionNo}
              </span>
              <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                ACTIVE STUDENT
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
            <p className="text-xs text-slate-400">
              Roll No: <strong className="text-white font-mono">{profile.rollNo}</strong> | Batch: <strong className="text-cyan-400">{profile.batch}</strong>
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Box 1: Academic Details */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-cyan-400 uppercase font-mono tracking-wider flex items-center gap-2">
              <Shield className="h-4 w-4" /> Academic Info
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Course Program</span>
                <span className="font-semibold text-white">{profile.course}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Batch Code</span>
                <span className="font-semibold text-white">{profile.batch}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Joining Date</span>
                <span className="font-mono text-slate-200">{profile.joiningDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Academic Year</span>
                <span className="font-mono text-slate-200">{profile.academicYear}</span>
              </div>
            </div>
          </div>

          {/* Box 2: Personal Details */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-cyan-400 uppercase font-mono tracking-wider flex items-center gap-2">
              <User className="h-4 w-4" /> Personal Info
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Date of Birth</span>
                <span className="font-mono text-slate-200">{profile.dob}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Gender</span>
                <span className="font-semibold text-white">{profile.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Category</span>
                <span className="font-semibold text-white">{profile.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Blood Group</span>
                <span className="font-bold text-rose-400 font-mono">{profile.bloodGroup}</span>
              </div>
            </div>
          </div>

          {/* Box 3: Parent & Contact Details */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-cyan-400 uppercase font-mono tracking-wider flex items-center gap-2">
              <Phone className="h-4 w-4" /> Contact & Guardian
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Student Email</span>
                <span className="font-mono text-cyan-400 truncate max-w-[150px]">{profile.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Student Phone</span>
                <span className="font-mono text-slate-200">{profile.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Father&apos;s Name</span>
                <span className="font-semibold text-white">{profile.fatherName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Guardian Contact</span>
                <span className="font-mono text-slate-200">{profile.guardianPhone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Edit Profile Drawer */}
      {showEditDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md h-full bg-slate-900 border-l border-slate-800 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Edit3 className="h-5 w-5 text-cyan-400" /> Edit Contact Details
                </h3>
                <button
                  onClick={() => setShowEditDrawer(false)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Guardian Contact</label>
                  <input
                    type="text"
                    required
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Residential Address</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="w-full py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 mt-4"
                >
                  <Save className="h-4 w-4" /> {isSavingProfile ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 4. Change Password Drawer */}
      {showPasswordDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md h-full bg-slate-900 border-l border-slate-800 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-cyan-400" /> Change Portal Password
                </h3>
                <button
                  onClick={() => setShowPasswordDrawer(false)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {passSuccess ? (
                <div className="py-8 text-center space-y-2">
                  <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto" />
                  <h4 className="text-base font-bold text-white">Password Updated Successfully</h4>
                </div>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Current Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={currentPass}
                      onChange={(e) => setCurrentPass(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="At least 8 characters"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Re-enter new password"
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isChangingPass || !newPass}
                    className="w-full py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20 mt-4"
                  >
                    {isChangingPass ? "Updating Security..." : "Update Password"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
