"use client";

import { useState } from "react";
import { Send, Phone, MessageSquare, Mail, MapPin, Clock, Sparkles, CheckCircle2 } from "lucide-react";

export default function ContactSection() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [academy, setAcademy] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <section id="contact" className="py-24 bg-[#05080E] relative border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5E9A2E]/10 border border-[#5E9A2E]/30 text-xs font-bold text-[#74B53C] tracking-wider uppercase">
            <MessageSquare className="w-3.5 h-3.5" />
            TALK TO US
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Let&apos;s get your institution live
          </h2>
          <p className="text-base sm:text-lg text-slate-300">
            Tell us about your institution and we&apos;ll map the right MyEdou product to your workflow. WhatsApp is fastest for instant answers.
          </p>
        </div>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Form Column */}
          <div className="lg:col-span-7 p-8 rounded-3xl glass-panel border border-white/15 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-white/10 text-white text-sm placeholder-slate-500 focus:border-[#74B53C] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-white/10 text-white text-sm placeholder-slate-500 focus:border-[#74B53C] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-white/10 text-white text-sm placeholder-slate-500 focus:border-[#74B53C] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Academy / Institute Name
                  </label>
                  <input
                    type="text"
                    value={academy}
                    onChange={(e) => setAcademy(e.target.value)}
                    placeholder="Your academy / institute"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-white/10 text-white text-sm placeholder-slate-500 focus:border-[#74B53C] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Message *
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help?"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-white/10 text-white text-sm placeholder-slate-500 focus:border-[#74B53C] outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#5E9A2E] to-[#74B53C] text-white font-bold text-sm shadow-xl shadow-[#5E9A2E]/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send message</span>
                </button>

                <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#74B53C]" />
                  Usually replies within 15 minutes
                </span>
              </div>

              {submitted && (
                <div className="p-4 rounded-xl bg-[#5E9A2E]/20 border border-[#5E9A2E] text-white text-xs font-semibold animate-in fade-in duration-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#74B53C] shrink-0" />
                  <span>Message sent successfully! Our team will reach out to you right away.</span>
                </div>
              )}
            </form>
          </div>

          {/* Right Contact Info Column */}
          <div className="lg:col-span-5 p-8 rounded-3xl glass-panel border border-white/15 flex flex-col justify-between space-y-6">
            <div>
              <div className="text-xs font-mono font-bold text-[#74B53C] uppercase tracking-widest mb-4">
                GET IN TOUCH
              </div>

              <div className="space-y-6">
                {/* Call Us */}
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-[#5E9A2E]/20 text-[#74B53C] shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">CALL US</h4>
                    <div className="text-sm font-bold text-white mt-0.5">+91 87937 89160</div>
                    <div className="text-sm font-bold text-slate-300">+91 86687 89160</div>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">WHATSAPP INSTANT</h4>
                    <a
                      href="https://wa.me/918793789160"
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-bold text-[#74B53C] hover:underline"
                    >
                      +91 87937 89160 (Click to chat)
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">EMAIL</h4>
                    <div className="text-sm font-bold text-white mt-0.5">contact@codeservetech.com</div>
                    <div className="text-xs text-slate-400">hr@codeservetech.com</div>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">OFFICE ADDRESS</h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Office No. 1014 & 1015, Gera&apos;s Imperium Rise, Hinjawadi Phase II, Pune, Maharashtra 411057, India
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Working Hours Badge */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-1 text-xs">
              <div className="font-bold text-white flex items-center justify-between">
                <span>Working Hours</span>
                <span className="text-[#74B53C] font-mono text-[10px]">MON - SAT</span>
              </div>
              <div className="text-slate-400">10:00 AM – 7:00 PM IST</div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
