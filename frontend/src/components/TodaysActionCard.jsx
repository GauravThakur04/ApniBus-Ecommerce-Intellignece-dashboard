import React, { useState } from 'react';
import { 
  ChevronRight, ArrowRight, ShieldCheck, AlertCircle, 
  Sparkles, CheckCircle2, ChevronDown, ChevronUp, Zap, Clock
} from 'lucide-react';

export default function TodaysActionCard({ action, onNavigate }) {
  const [expanded, setExpanded] = useState(false);

  // Confidence color
  const isHighConf = action.confidence && action.confidence.includes('HIGH');
  const isMedConf = action.confidence && action.confidence.includes('MEDIUM');

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-800/80 transition-all">
      {/* Top row: Priority badge + Category + Confidence */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-mono font-bold text-xs flex items-center justify-center shadow-sm">
            0{action.priority}
          </span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            {action.category}
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/40 dark:border-emerald-800/40">
            {action.badge}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <span className="text-slate-400 text-[10px] uppercase">Confidence:</span>
          <span className={isHighConf ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
            {action.confidence}
          </span>
        </div>
      </div>

      {/* Main Action Title */}
      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 leading-snug">
        {action.title}
      </h3>

      {/* Immediate Recommended Action */}
      <p className="text-xs text-slate-600 dark:text-slate-300 mb-3.5 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
        <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-0.5">DIRECTIVE:</span>
        {action.action}
      </p>

      {/* Expandable Evidence & Risk Details */}
      {expanded ? (
        <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs mb-3.5">
          <div>
            <span className="font-bold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider block">
              Why this matters:
            </span>
            <p className="text-slate-700 dark:text-slate-300 mt-0.5">{action.why}</p>
          </div>
          <div>
            <span className="font-bold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider block">
              Verified Metric Evidence:
            </span>
            <p className="text-slate-700 dark:text-slate-300 mt-0.5 font-mono text-[11px] bg-slate-100 dark:bg-slate-950 p-2 rounded-lg border border-slate-200/60 dark:border-slate-800">
              {action.evidence}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
              <span className="font-bold text-emerald-800 dark:text-emerald-400 text-[10px] uppercase block">Expected Impact</span>
              <p className="text-emerald-900 dark:text-emerald-300 mt-0.5 text-[11px]">{action.expected_impact}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
              <span className="font-bold text-amber-800 dark:text-amber-400 text-[10px] uppercase block">Risk Assessment</span>
              <p className="text-amber-900 dark:text-amber-300 mt-0.5 text-[11px]">{action.risk}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span><strong>Suggested Test Window:</strong> {action.test_window}</span>
          </div>
        </div>
      ) : null}

      {/* Footer controls: Toggle Expand + Drilldown CTA */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 transition"
        >
          {expanded ? (
            <>Less details <ChevronUp className="w-3.5 h-3.5" /></>
          ) : (
            <>View evidence & risk analysis <ChevronDown className="w-3.5 h-3.5" /></>
          )}
        </button>

        <button
          onClick={() => onNavigate && action.drilldown_path && onNavigate(action.drilldown_path.replace('/', ''))}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold transition shadow-sm group"
        >
          <span>Take Action / Drilldown</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
