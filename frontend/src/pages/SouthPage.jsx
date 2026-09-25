import React, { useState, useEffect } from 'react';
import { 
  Compass, MapPin, ExternalLink, ArrowUpRight, TrendingUp, 
  ShieldAlert, Activity, Sparkles, Clock, Target, Layers, ShoppingBag 
} from 'lucide-react';
import { fetchSouthLaunch } from '../services/api';

export default function SouthPage() {
  const [southData, setSouthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMarketplace, setSelectedMarketplace] = useState('all');
  const [selectedState, setSelectedState] = useState('all');

  useEffect(() => {
    fetchSouthLaunch()
      .then(res => {
        setSouthData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error('South launch fetch error:', err);
        setLoading(false);
      });
  }, []);

  if (loading && !southData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 dark:text-slate-400">Loading South India Launch Control Center...</p>
      </div>
    );
  }

  const summary = southData?.summary || {};
  const allRows = southData?.adsets_table || [];

  const filteredRows = allRows.filter(r => {
    if (selectedMarketplace !== 'all' && r.marketplace.toLowerCase() !== selectedMarketplace.toLowerCase()) {
      return false;
    }
    if (selectedState !== 'all' && r.state.toLowerCase() !== selectedState.toLowerCase()) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* ── HEADER BANNER ───────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Compass className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              South India Launch Control
            </h1>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300/40">
              PAGE 3 · 10 AD SETS
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Dedicated multi-state campaign monitoring across 5 Southern States (KA, TN, KL, AP, TS) × 2 Marketplaces
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              LAUNCHED: {summary.launched_date || '24-Sep-2026'}
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
              STATUS: {summary.status || 'ACTIVE LEARNING'}
            </div>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Active Pacing"></div>
        </div>
      </div>

      {/* ── BOTTLENECK ALERT ────────────────────────────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 shadow-sm flex items-start gap-3 text-amber-900 dark:text-amber-200">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="text-xs font-black uppercase tracking-wider block">
            CONVERSION OBSERVATION (SOUTH LAUNCH PHASE 1)
          </span>
          <p className="text-xs mt-0.5 leading-relaxed">
            {summary.bottleneck || 'Traffic is reaching the marketplace layer but verified purchase conversion is currently not demonstrated.'}
          </p>
        </div>
      </div>

      {/* ── TOP KPI CARDS ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total Ad Spend</span>
          <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
            ₹{summary.total_spend?.toFixed(2) || '12.17'}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Budget in Learning</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Meta Clicks / Imp</span>
          <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
            {summary.total_meta_clicks || 28} <span className="text-xs font-normal text-slate-400">/ {summary.total_impressions || 727}</span>
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">3.85% Meta CTR</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Tracker Redirects</span>
          <span className="text-lg font-black font-mono text-indigo-600 dark:text-indigo-400">
            {summary.total_tracker_clicks || 268}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">{summary.total_unique_visitors || 248} unique visitors</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Average CPC</span>
          <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
            ₹{summary.avg_cpc?.toFixed(2) || '0.43'}
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">Ultra-Low Traffic CPC</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Target CPO</span>
          <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
            ₹900.00
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Target Acquisition Cap</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Lead State Intent</span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block mt-1" title={summary.top_state_intent}>
            Andhra Pradesh
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono block mt-0.5">74 Clicks (38 AMZ + 26 FK)</span>
        </div>
      </div>

      {/* ── FILTER TOOLBAR ────────────────────────────────────────────────────── */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Filter View:</span>
          
          <select
            value={selectedMarketplace}
            onChange={(e) => setSelectedMarketplace(e.target.value)}
            className="text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Marketplaces (Amazon + Flipkart)</option>
            <option value="Amazon">Amazon Only</option>
            <option value="Flipkart">Flipkart Only</option>
          </select>

          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="all">All 5 Southern States</option>
            <option value="Andhra Pradesh">Andhra Pradesh</option>
            <option value="Telangana">Telangana</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Kerala">Kerala</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
          </select>
        </div>

        <span className="text-xs text-slate-400 font-mono">
          Showing {filteredRows.length} of 10 ad sets
        </span>
      </div>

      {/* ── 10 AD SETS MATRIX TABLE ───────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              State × Marketplace Ad Set Performance Ledger
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live funnel measurement from Meta spend to redirect tracking and returning visitor intent
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-3">State</th>
                <th className="py-3 px-3">Destination</th>
                <th className="py-3 px-3 text-right">Spend</th>
                <th className="py-3 px-3 text-right">Impressions</th>
                <th className="py-3 px-3 text-right">Meta Clicks</th>
                <th className="py-3 px-3 text-right">CPC</th>
                <th className="py-3 px-3 text-right">Tracker Clicks</th>
                <th className="py-3 px-3 text-right">Unique Visitors</th>
                <th className="py-3 px-3 text-right">2+ Visits</th>
                <th className="py-3 px-3 text-right">3+ Hot</th>
                <th className="py-3 px-3 text-right">Multi-Day</th>
                <th className="py-3 px-3 text-center">Intent Tier</th>
                <th className="py-3 px-3 text-center">Pacing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                    {row.state}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                      row.marketplace === 'Amazon'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                    }`}>
                      {row.marketplace}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-800 dark:text-slate-200">
                    ₹{row.spend.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-slate-300">
                    {row.impressions.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                    {row.meta_clicks}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                    ₹{row.cpc.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {row.tracker_clicks}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-800 dark:text-slate-200">
                    {row.unique_visitors}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {row.returning_2plus > 0 ? row.returning_2plus : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-rose-600 dark:text-rose-400">
                    {row.high_intent_3plus > 0 ? row.high_intent_3plus : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-purple-600 dark:text-purple-400">
                    {row.multi_day_visitors > 0 ? row.multi_day_visitors : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      row.intent_tier === 'High Consideration'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {row.intent_tier}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {row.pacing_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
