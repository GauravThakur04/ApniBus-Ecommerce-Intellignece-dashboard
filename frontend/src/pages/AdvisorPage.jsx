import React, { useState } from 'react';
import { Brain, Sparkles, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, Clock, Target, Filter } from 'lucide-react';
import TodaysActionCard from '../components/TodaysActionCard';

export default function AdvisorPage({ advisorData, onNavigate }) {
  const [filterCategory, setFilterCategory] = useState('ALL');

  if (!advisorData) {
    return <div className="p-8 text-center text-slate-400">Loading AI Business Advisor...</div>;
  }

  const { todays_top_actions = [], all_recommendations = [] } = advisorData;

  const filteredRecs = filterCategory === 'ALL'
    ? all_recommendations
    : all_recommendations.filter(r => r.category.includes(filterCategory));

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-600" />
            AI Business Advisor &amp; Decision Intelligence
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Evidence-Based Strategic Actions, Risk Bounds &amp; Commercial Recommendations
          </p>
        </div>
      </div>

      {/* Primary Section: Top 3 Decisions Today */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            TOP PRIORITIZED DIRECTIVES TODAY
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {todays_top_actions.map((action) => (
            <TodaysActionCard
              key={action.id}
              action={action}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>

      {/* Secondary Section: Rule-Based Advisory Cards */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Comprehensive Operational Rules Audit</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pricing, Listing, Advertising Budget &amp; Channel Allocation Rules</p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            {['ALL', 'PRICE', 'LISTING', 'META'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1 rounded-lg transition ${
                  filterCategory === cat
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredRecs.map((rec) => (
            <div key={rec.id} className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 uppercase">
                    {rec.category}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {rec.title}
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  rec.status === 'HEALTHY' || rec.status === 'SCALING CANDIDATE'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400'
                }`}>
                  {rec.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                <div>
                  <span className="font-bold text-slate-500 dark:text-slate-400 text-[10px] uppercase block">Analysis &amp; Reason</span>
                  <p className="text-slate-700 dark:text-slate-300 mt-0.5">{rec.reason}</p>
                </div>
                <div>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 text-[10px] uppercase block">Prescribed Action</span>
                  <p className="text-slate-800 dark:text-slate-200 font-medium mt-0.5">{rec.action}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
