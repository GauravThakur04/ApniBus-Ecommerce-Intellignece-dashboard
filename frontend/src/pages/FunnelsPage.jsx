import React from 'react';
import { Layers, ArrowDown, AlertCircle, ShieldCheck, TrendingDown, Sparkles } from 'lucide-react';

export default function FunnelsPage({ funnelsData }) {
  if (!funnelsData) {
    return <div className="p-8 text-center text-slate-400">Loading Marketplace Funnel data...</div>;
  }

  const { 
    flipkart_funnel = [], 
    amazon_funnel = [], 
    complete_funnel = [], 
    sales_recovery_funnel = [],
    bottleneck_alert = {},
    biggest_dropoff = {} 
  } = funnelsData;

  const renderFunnel = (title, subtitle, stages, brandColor) => (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
          brandColor === 'blue' 
            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400' 
            : brandColor === 'emerald'
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
            : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
        }`}>
          {stages.length}-Stage Funnel
        </span>
      </div>

      <div className="space-y-2.5">
        {stages.map((stage, idx) => (
          <div key={idx} className="relative">
            <div className={`p-3.5 rounded-xl border transition-all ${
              stage.available === false 
                ? 'bg-slate-50 dark:bg-slate-950/40 border-dashed border-slate-300 dark:border-slate-800 opacity-80' 
                : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center">
                    0{idx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {stage.stage}
                  </span>
                </div>

                {stage.available !== false && stage.count !== null && stage.count !== undefined ? (
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {typeof stage.count === 'number' ? stage.count.toLocaleString('en-IN') : stage.count}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {stage.count ? `${stage.count} (Proxy)` : 'DATA NOT AVAILABLE'}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/40 dark:border-slate-800/40">
                <span className="truncate max-w-[65%]">{stage.notes}</span>
                {(stage.conversion || stage.conversion_from_prev !== undefined) && (
                  <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0">
                    Conv: {stage.conversion || `${stage.conversion_from_prev}%`}
                  </span>
                )}
              </div>
            </div>

            {idx < stages.length - 1 && (
              <div className="flex justify-center my-0.5">
                <ArrowDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              Sales Recovery Funnel
            </h2>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-300/40">
              PAGE 5 · 8-STAGE CONTROL
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Exact 8-stage conversion flow from Ad Clicks to Verified Orders with Drop-off Diagnostics
          </p>
        </div>
      </div>

      {/* ── BOTTLENECK ALERT BANNER ─────────────────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/80 shadow-sm flex items-start gap-3.5 text-rose-950 dark:text-rose-200">
        <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-rose-900 dark:text-rose-300">
              {bottleneck_alert.title || 'CONVERSION BOTTLENECK DETECTED'}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-200 text-rose-900 dark:bg-rose-900 dark:text-rose-200">
              CRITICAL
            </span>
          </div>
          <p className="text-xs text-rose-800 dark:text-rose-300 mt-1 font-semibold leading-relaxed">
            {bottleneck_alert.message || 'Traffic is reaching the marketplace layer but verified purchase conversion is currently not demonstrated.'}
          </p>
          <p className="text-[11px] text-rose-700 dark:text-rose-400 mt-0.5">
            {bottleneck_alert.recommendation || 'Preserve traffic; deploy localized video creatives & price-matching guarantees rather than pausing top-of-funnel.'}
          </p>
        </div>
      </div>

      {/* ── 8-STAGE SALES RECOVERY FUNNEL ────────────────────────────────────── */}
      {sales_recovery_funnel.length > 0 && (
        <div className="space-y-4">
          {renderFunnel(
            '8-Stage Sales Recovery Funnel (Ad Clicks → Verified Orders)',
            'AD CLICKS → TRACKER VISITORS → UNIQUE VISITORS → 2+ VISITORS → 3+ VISITORS → MULTI-DAY VISITORS → AMAZON / FLIPKART → VERIFIED ORDERS',
            sales_recovery_funnel,
            'emerald'
          )}
        </div>
      )}

      {/* ── UNIFIED COMPLETE FUNNEL ─────────────────────────────────────────── */}
      {complete_funnel.length > 0 && (
        <div className="space-y-4">
          {renderFunnel(
            'Complete Unified Multi-Channel Funnel (9 Stages)',
            'Blended Meta Impressions through Marketplace Search & Verified Order Ledger',
            complete_funnel,
            'blue'
          )}
        </div>
      )}

      {/* ── PLATFORM-SPECIFIC FUNNELS GRID ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderFunnel(
          'Flipkart Purchase Funnel',
          'Traffic to Verified Order Flow on Flipkart',
          flipkart_funnel,
          'blue'
        )}
        {renderFunnel(
          'Amazon Purchase Funnel',
          'Traffic to Verified Order Flow on Amazon',
          amazon_funnel,
          'amber'
        )}
      </div>
    </div>
  );
}

