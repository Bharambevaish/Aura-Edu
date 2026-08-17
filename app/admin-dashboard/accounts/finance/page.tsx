"use client";

import React from 'react';
import { 
  RefreshCw,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Wallet,
  PiggyBank,
  BarChart3
} from 'lucide-react';

export default function FinancePage() {
  return (
    <div className="p-6 bg-[#0a0a0a] min-h-screen text-slate-200 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-900/30 rounded-lg">
            <BarChart3 size={20} className="text-green-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Finance Overview</h1>
            <p className="text-sm text-slate-400 mt-0.5">Track revenue, expenses, and financial health of your institute.</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#171717] border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-[#262626] transition-colors shadow-sm">
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#171717] border border-green-900/50 rounded-xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-5"><DollarSign size={80} /></div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-green-900/30 rounded"><TrendingUp size={14} className="text-green-400" /></div>
            <h3 className="text-[10px] font-bold text-green-400 uppercase tracking-wider">TOTAL REVENUE</h3>
          </div>
          <p className="text-2xl font-bold text-white mb-1">₹28,001</p>
          <p className="text-xs text-green-400 flex items-center gap-1"><ArrowUpRight size={12} /> +12.5% from last month</p>
        </div>
        
        <div className="bg-[#171717] border border-red-900/50 rounded-xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-5"><CreditCard size={80} /></div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-red-900/30 rounded"><TrendingDown size={14} className="text-red-400" /></div>
            <h3 className="text-[10px] font-bold text-red-400 uppercase tracking-wider">TOTAL EXPENSES</h3>
          </div>
          <p className="text-2xl font-bold text-white mb-1">₹3,500</p>
          <p className="text-xs text-red-400 flex items-center gap-1"><ArrowDownRight size={12} /> -100% from last month</p>
        </div>
        
        <div className="bg-[#171717] border border-blue-900/50 rounded-xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-5"><Wallet size={80} /></div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-blue-900/30 rounded"><Wallet size={14} className="text-blue-400" /></div>
            <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">NET PROFIT</h3>
          </div>
          <p className="text-2xl font-bold text-white mb-1">₹24,501</p>
          <p className="text-xs text-blue-400 flex items-center gap-1"><ArrowUpRight size={12} /> Healthy margin</p>
        </div>
        
        <div className="bg-[#171717] border border-purple-900/50 rounded-xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-5"><PiggyBank size={80} /></div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-purple-900/30 rounded"><PiggyBank size={14} className="text-purple-400" /></div>
            <h3 className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">PENDING DUES</h3>
          </div>
          <p className="text-2xl font-bold text-white mb-1">₹0</p>
          <p className="text-xs text-purple-400 flex items-center gap-1">No outstanding payments</p>
        </div>
      </div>

      {/* Revenue vs Expenses Chart */}
      <div className="bg-[#171717] border border-slate-800 rounded-xl p-6 mb-6 shadow-sm">
        <h3 className="text-sm font-bold text-white mb-6">Revenue vs Expenses (Last 6 Months)</h3>
        <div className="flex items-end gap-6 h-48 px-4">
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => {
            const revenueHeights = [40, 55, 65, 70, 80, 100];
            const expenseHeights = [20, 15, 25, 30, 10, 5];
            return (
              <div key={month} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end gap-1 h-40">
                  <div 
                    className="flex-1 bg-gradient-to-t from-green-600/50 to-green-500/30 rounded-t border border-green-500/30"
                    style={{ height: `${revenueHeights[i]}%` }}
                  ></div>
                  <div 
                    className="flex-1 bg-gradient-to-t from-red-600/50 to-red-500/30 rounded-t border border-red-500/30"
                    style={{ height: `${expenseHeights[i]}%` }}
                  ></div>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">{month}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-6 mt-4 justify-center">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="w-3 h-3 rounded bg-green-500/50 border border-green-500/30"></div>
            Revenue
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="w-3 h-3 rounded bg-red-500/50 border border-red-500/30"></div>
            Expenses
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-[#171717] border border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white">Recent Transactions</h3>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-[#111111]">
              <th className="py-3 px-5">DESCRIPTION</th>
              <th className="py-3 px-5">TYPE</th>
              <th className="py-3 px-5">AMOUNT</th>
              <th className="py-3 px-5">DATE</th>
              <th className="py-3 px-5">STATUS</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            <tr className="border-b border-slate-800/50 hover:bg-[#262626]/40 transition-colors">
              <td className="py-3 px-5 text-white font-medium">Course Purchase - MERN Demo</td>
              <td className="py-3 px-5"><span className="px-2 py-0.5 bg-green-900/30 text-green-400 text-[10px] font-bold rounded">Revenue</span></td>
              <td className="py-3 px-5 text-green-400 font-bold">+ ₹1</td>
              <td className="py-3 px-5 text-slate-400 text-xs">Jul 15, 2026</td>
              <td className="py-3 px-5"><span className="text-green-400 text-xs font-bold">Completed</span></td>
            </tr>
            <tr className="border-b border-slate-800/50 hover:bg-[#262626]/40 transition-colors">
              <td className="py-3 px-5 text-white font-medium">Stationery Purchase</td>
              <td className="py-3 px-5"><span className="px-2 py-0.5 bg-red-900/30 text-red-400 text-[10px] font-bold rounded">Expense</span></td>
              <td className="py-3 px-5 text-red-400 font-bold">- ₹500</td>
              <td className="py-3 px-5 text-slate-400 text-xs">Jul 8, 2026</td>
              <td className="py-3 px-5"><span className="text-green-400 text-xs font-bold">Approved</span></td>
            </tr>
            <tr className="border-b border-slate-800/50 hover:bg-[#262626]/40 transition-colors">
              <td className="py-3 px-5 text-white font-medium">Light Bill Payment</td>
              <td className="py-3 px-5"><span className="px-2 py-0.5 bg-red-900/30 text-red-400 text-[10px] font-bold rounded">Expense</span></td>
              <td className="py-3 px-5 text-red-400 font-bold">- ₹2,500</td>
              <td className="py-3 px-5 text-slate-400 text-xs">Jul 8, 2026</td>
              <td className="py-3 px-5"><span className="text-green-400 text-xs font-bold">Approved</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
