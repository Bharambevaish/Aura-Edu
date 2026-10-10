"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight, Layers, ShieldCheck, User, Users, GraduationCap, Building, Lock } from "lucide-react";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "glass-nav border-b border-white/10 shadow-2xl py-3.5"
          : "bg-gradient-to-b from-[#070B14]/90 to-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5E9A2E] to-[#74B53C] flex items-center justify-center shadow-lg shadow-[#5E9A2E]/20 group-hover:scale-105 transition-transform">
              <span className="font-extrabold text-white text-xl tracking-wider">E</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight text-white flex items-center gap-1">
                MyEdou
                <span className="inline-block w-2 h-2 rounded-full bg-[#74B53C]"></span>
              </span>
              <span className="text-[10px] text-slate-400 -mt-1 tracking-wider uppercase">Institution Management Suite</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>

            {/* Product Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProductDropdownOpen(!productDropdownOpen)}
                onMouseEnter={() => setProductDropdownOpen(true)}
                className="flex items-center gap-1.5 hover:text-white transition-colors py-2"
              >
                Products
                <ChevronDown className={`w-4 h-4 transition-transform ${productDropdownOpen ? "rotate-180 text-[#74B53C]" : ""}`} />
              </button>

              {productDropdownOpen && (
                <div
                  onMouseLeave={() => setProductDropdownOpen(false)}
                  className="absolute top-full left-0 w-72 mt-1 p-2 rounded-2xl glass-panel border border-white/10 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  <a
                    href="#modules"
                    onClick={() => setProductDropdownOpen(false)}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-[#5E9A2E]/20 text-[#74B53C]">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-white group-hover:text-[#74B53C] transition-colors">MyEdou Academy</div>
                      <div className="text-xs text-slate-400">For coaching, tuition & multi-branch classes (22 modules)</div>
                    </div>
                  </a>

                  <a
                    href="#modules"
                    onClick={() => setProductDropdownOpen(false)}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-white group-hover:text-blue-400 transition-colors">MyEdou ERP</div>
                      <div className="text-xs text-slate-400">Full ERP for schools, colleges & universities (47 modules)</div>
                    </div>
                  </a>

                  <a
                    href="#modules"
                    onClick={() => setProductDropdownOpen(false)}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-white group-hover:text-purple-400 transition-colors flex items-center justify-between">
                        MyEdou HRM
                        <span className="text-[10px] bg-purple-500/30 text-purple-300 px-1.5 py-0.5 rounded uppercase tracking-wider">Soon</span>
                      </div>
                      <div className="text-xs text-slate-400">Payroll, HR, recruitment & workforce (8 modules)</div>
                    </div>
                  </a>
                </div>
              )}
            </div>

            <a href="#modules" className="hover:text-white transition-colors">
              Modules
            </a>
            <a href="#why-myedou" className="hover:text-white transition-colors">
              Why MyEdou
            </a>
            <a href="#about" className="hover:text-white transition-colors">
              About
            </a>
            <a href="#contact" className="hover:text-white transition-colors">
              Contact
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Login Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLoginDropdownOpen(!loginDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-semibold transition-all backdrop-blur-sm"
              >
                <User className="w-4 h-4 text-[#74B53C]" />
                Login
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${loginDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {loginDropdownOpen && (
                <div
                  onMouseLeave={() => setLoginDropdownOpen(false)}
                  className="absolute top-full right-0 w-64 mt-2 p-2 rounded-2xl glass-panel border border-white/10 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  <Link
                    href="/login"
                    onClick={() => setLoginDropdownOpen(false)}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 text-sm text-slate-200 hover:text-white transition-colors"
                  >
                    <GraduationCap className="w-4 h-4 text-[#74B53C]" />
                    <span>Student Login</span>
                  </Link>

                  <Link
                    href="/login"
                    onClick={() => setLoginDropdownOpen(false)}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 text-sm text-slate-200 hover:text-white transition-colors"
                  >
                    <User className="w-4 h-4 text-blue-400" />
                    <span>New Student Register</span>
                  </Link>

                  <Link
                    href="/login"
                    onClick={() => setLoginDropdownOpen(false)}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 text-sm text-slate-200 hover:text-white transition-colors border-t border-white/5 mt-1 pt-2"
                  >
                    <Lock className="w-4 h-4 text-purple-400" />
                    <span>Admin Panel</span>
                  </Link>

                  <Link
                    href="/login"
                    onClick={() => setLoginDropdownOpen(false)}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 text-sm text-slate-200 hover:text-white transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Staff Portal</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Get Quotation CTA */}
            <a
              href="#quote"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#5E9A2E] to-[#74B53C] text-white text-sm font-bold shadow-lg shadow-[#5E9A2E]/25 hover:shadow-[#5E9A2E]/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Get Quotation
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-white/5 text-slate-200 hover:text-white"
          >
            <Layers className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 p-4 rounded-2xl glass-panel border border-white/10 flex flex-col gap-4 animate-in fade-in duration-200">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-200 hover:text-white font-medium py-1"
            >
              Home
            </Link>
            <a
              href="#modules"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-200 hover:text-white font-medium py-1"
            >
              Modules & Products
            </a>
            <a
              href="#why-myedou"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-200 hover:text-white font-medium py-1"
            >
              Why MyEdou
            </a>
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-200 hover:text-white font-medium py-1"
            >
              About MyEdou
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-200 hover:text-white font-medium py-1"
            >
              Contact Us
            </a>
            <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-white/10 text-white font-semibold text-sm"
              >
                Login Portals
              </Link>
              <a
                href="#quote"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-[#5E9A2E] to-[#74B53C] text-white font-bold text-sm shadow-md"
              >
                Get Quotation
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
