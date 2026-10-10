"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  PieChart, 
  IndianRupee, 
  TrendingUp, 
  TrendingDown, 
  Users,
  Activity,
  ArrowRight,
  FileText
} from 'lucide-react';
import Link from 'next/link';

export default function ReportsHubPage() {
  const reportCategories = [
    {
      title: 'Revenue & Profitability',
      icon: IndianRupee,
      color: 'bg-emerald-500',
      description: 'Analyze overall income, profit margins, and revenue growth across branches.',
      reports: ['Gross Revenue Report', 'Net Profit Margin', 'Branch-wise Revenue', 'Tax Collected (GST)']
    },
    {
      title: 'Receivables & Collection',
      icon: TrendingUp,
      color: 'bg-blue-500',
      description: 'Track pending fees, overdue payments, and collection efficiency.',
      reports: ['Pending Fee Defaulters', 'Expected vs Actual Collection', 'Scholarship & Waivers', 'Refund Analysis']
    },
    {
      title: 'Expenses & Payroll',
      icon: TrendingDown,
      color: 'bg-red-500',
      description: 'Monitor operational costs, vendor payments, and staff salaries.',
      reports: ['Expense Breakdown', 'Staff Payroll Summary', 'Vendor Payments', 'Infrastructure Costs']
    },
    {
      title: 'Students & Courses',
      icon: Users,
      color: 'bg-purple-500',
      description: 'Enrollment trends, course popularity, and student performance metrics.',
      reports: ['Admission Trends', 'Batch-wise Attendance', 'Course Completion Rates', 'Student Demographics']
    },
    {
      title: 'Lead Operations',
      icon: Activity,
      color: 'bg-orange-500',
      description: 'Marketing ROI, inquiry conversions, and counselor performance.',
      reports: ['Lead Conversion Ratio', 'Source-wise Lead Quality', 'Counselor Performance', 'Lost Lead Analysis']
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <PieChart className="text-emerald-400" /> Reports Hub
          </h1>
          <p className="text-sm text-slate-400 mt-1">Comprehensive reporting and analytics across all modules.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin-dashboard/reports/legacy" className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-white/10 text-white rounded-lg transition-colors text-sm font-medium">
            <FileText size={16} /> Legacy Analytics
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportCategories.map((cat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i}
            className="glass-panel rounded-2xl p-6 flex flex-col group hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg ${cat.color} bg-opacity-20 backdrop-blur-sm border border-white/10`}>
                <cat.icon size={24} className={`text-${cat.color.split('-')[1]}-400`} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">{cat.title}</h2>
                <p className="text-sm text-slate-400 mt-1">{cat.description}</p>
              </div>
            </div>
            
            <div className="flex-1 mt-2">
              <div className="space-y-2">
                {cat.reports.map((report, j) => (
                  <Link href="#" key={j} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors text-sm text-slate-300 hover:text-white group/link">
                    <span>{report}</span>
                    <ArrowRight size={14} className="opacity-0 group-hover/link:opacity-100 group-hover/link:translate-x-1 transition-all text-emerald-400" />
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-end">
              <Link href="#" className="text-sm font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                View All {cat.title} <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        ))}
        
        {/* Custom Report Builder Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-panel rounded-2xl p-6 flex flex-col justify-center items-center text-center border border-dashed border-white/20 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all cursor-pointer group"
        >
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 group-hover:bg-emerald-500/20 transition-all mb-4">
            <PieChart size={32} />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Custom Report Builder</h2>
          <p className="text-sm text-slate-400 mb-6">Create customized reports by selecting specific fields, metrics, and date ranges.</p>
          <button className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-colors shadow-lg shadow-emerald-600/20">
            Build New Report
          </button>
        </motion.div>
      </div>
    </div>
  );
}
