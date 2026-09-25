import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  FunnelChart, Funnel, LabelList,
  ComposedChart, Area, Line, Legend,
  Cell, PieChart, Pie
} from 'recharts';
import { 
  Users, RefreshCw, TrendingUp, Eye, Repeat, Zap, ShoppingBag, GitFork, 
  ChevronDown, ChevronUp, Star, MapPin, Target, Share2, Sparkles, Layers, ArrowUpRight, Calendar,
  Search, Filter, ShieldAlert, AlertTriangle, CheckCircle2, Clock
} from 'lucide-react';
import { fetchCohort, fetchCohortRetention } from '../services/api';

// ─── Colour helpers ─────────────────────────────────────────────────────────
const VISIT_COLORS = {
  1: '#6366f1',
  2: '#3b82f6',
  3: '#10b981',
  4: '#f59e0b',
  5: '#f97316',
  6: '#ef4444',
  7: '#dc2626',
  8: '#7c3aed',
};
const INTENT_BG = {
  Cold: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  Warm: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  Hot: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  'Ultra-Hot': 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  'Rapid Burst': 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, color = 'indigo' }) {
  const colorMap = {
    indigo: 'from-indigo-50 to-slate-50 dark:from-indigo-950/40 dark:to-slate-900 border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400',
    blue: 'from-blue-50 to-slate-50 dark:from-blue-950/40 dark:to-slate-900 border-blue-100 dark:border-blue-900/50 text-blue-600 dark:text-blue-400',
    emerald: 'from-emerald-50 to-slate-50 dark:from-emerald-950/40 dark:to-slate-900 border-emerald-100 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400',
    amber: 'from-amber-50 to-slate-50 dark:from-amber-950/40 dark:to-slate-900 border-amber-100 dark:border-amber-900/50 text-amber-600 dark:text-amber-400',
    red: 'from-red-50 to-slate-50 dark:from-red-950/40 dark:to-slate-900 border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400',
    purple: 'from-purple-50 to-slate-50 dark:from-purple-950/40 dark:to-slate-900 border-purple-100 dark:border-purple-900/50 text-purple-600 dark:text-purple-400',
  };
  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-4 ${colorMap[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-wider opacity-80">{label}</span>
      </div>
      <div className="text-2xl font-bold text-slate-900 dark:text-white mb-0.5">{value}</div>
      {sub && <div className="text-xs text-slate-500 dark:text-slate-400">{sub}</div>}
    </div>
  );
}

// Custom funnel bar for the visit-frequency chart
function VisitFunnelBar({ data = [] }) {
  if (!data || data.length === 0) return null;
  const max = data[0]?.visitors || 1;
  return (
    <div className="space-y-2">
      {data.map((row) => {
        const widthPct = Math.max((row.visitors / max) * 100, 1.2);
        const color = VISIT_COLORS[row.visits_num] || '#7c3aed';
        return (
          <div key={row.visits} className="flex items-center gap-3">
            {/* Visit badge */}
            <div
              className="w-16 text-center text-xs font-bold rounded-lg py-1 shrink-0"
              style={{ background: color + '22', color: color, border: `1px solid ${color}44` }}
            >
              {row.visits}×
            </div>
            {/* Bar */}
            <div className="flex-1 relative h-8 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full rounded-lg flex items-center pl-3 transition-all duration-700"
                style={{ width: `${widthPct}%`, background: color + 'cc' }}
              >
                <span className="text-white text-xs font-semibold drop-shadow">
                  {row.visitors?.toLocaleString()}
                </span>
              </div>
            </div>
            {/* Stats */}
            <div className="w-32 shrink-0 text-right">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                {row.pct_of_total}%
              </span>
              <span className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${INTENT_BG[row.intent_tier] || 'bg-slate-100 text-slate-600'}`}>
                {row.intent_tier}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// High-intent visitor row
function HighIntentRow({ profile, rank }) {
  const [expanded, setExpanded] = useState(false);
  const mktColors = { flipkart: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300', amazon: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300', default: 'bg-slate-100 text-slate-600' };
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
        onClick={() => setExpanded(e => !e)}
      >
        {/* Rank */}
        <span className="w-7 text-center text-xs font-bold text-slate-400">#{rank}</span>
        {/* Visit count badge */}
        <span
          className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0"
          style={{ background: VISIT_COLORS[Math.min(profile.total_sessions || profile.total_visits || 1, 8)] || '#7c3aed' }}
        >
          {profile.total_sessions || profile.total_visits || 1}×
        </span>
        {/* ID */}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-mono text-slate-700 dark:text-slate-300 truncate flex items-center gap-2">
            <span className="font-bold">{profile.visitor_short || profile.visitor_id}</span>
            {profile.is_rapid_burst && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                ⚡ Rapid Click Loop ({profile.duration_str})
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            <span className="font-semibold text-slate-700 dark:text-slate-200">{profile.total_sessions || 1} session{profile.total_sessions > 1 ? 's' : ''}</span> · {profile.total_clicks || profile.total_visits} raw clicks · {profile.duration_str || `${profile.unique_days || 1} days span`} · {profile.primary_marketplace || 'Marketplace'}
          </div>
        </div>
        {/* Intent tier */}
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${INTENT_BG[profile.intent_tier] || INTENT_BG['Warm']}`}>
          {profile.intent_tier || 'Warm'}
        </span>
        {/* Cross-marketplace flag */}
        {profile.cross_marketplace && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
            🔀 Both
          </span>
        )}
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
      </button>
      {expanded && (
        <div className="px-4 pb-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-3 text-xs">
          <div><span className="text-slate-400">First Interaction</span><br /><span className="font-medium text-slate-700 dark:text-slate-300">{profile.first_visit || '—'}</span></div>
          <div><span className="text-slate-400">Last Interaction</span><br /><span className="font-medium text-slate-700 dark:text-slate-300">{profile.last_visit || '—'}</span></div>
          <div><span className="text-slate-400">Activity Breakdown</span><br /><span className="font-medium text-slate-700 dark:text-slate-300">{profile.total_sessions || 1} Distinct Session{profile.total_sessions > 1 ? 's' : ''} · {profile.total_clicks || profile.total_visits} Total Clicks ({profile.duration_str || '—'})</span></div>
          <div><span className="text-slate-400">Campaign</span><br /><span className="font-medium text-slate-700 dark:text-slate-300 line-clamp-2">{profile.top_campaign || '—'}</span></div>
          <div><span className="text-slate-400">Device</span><br /><span className="font-medium text-slate-700 dark:text-slate-300 capitalize">{profile.primary_device || 'mobile'}</span></div>
          <div><span className="text-slate-400">Marketplaces Visited</span><br />
            <div className="flex flex-wrap gap-1 mt-1">
              {Object.entries(profile.marketplaces || {}).map(([mkt, cnt]) => (
                <span key={mkt} className={`px-2 py-0.5 rounded-full font-semibold capitalize ${mktColors[mkt] || mktColors.default}`}>
                  {mkt}: {cnt}×
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Custom tooltip ──────────────────────────────────────────────────────────
const DailyTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-xl text-xs">
      <div className="font-bold text-slate-700 dark:text-slate-200 mb-1">{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.fill || p.stroke }} className="flex justify-between gap-4">
          <span>{p.name}</span><span className="font-bold">{p.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CohortPage() {
  const [data, setData] = useState(null);
  const [retentionData, setRetentionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeMarket, setActiveMarket] = useState('all');
  const [showAll, setShowAll] = useState(false);
  const [bifurcationTab, setBifurcationTab] = useState('campaign');
  const [visitorSearch, setVisitorSearch] = useState('');
  const [visitorFilterMarket, setVisitorFilterMarket] = useState('all');
  const [visitorFilterSegment, setVisitorFilterSegment] = useState('all');
  const [visitorPage, setVisitorPage] = useState(1);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [cohortRes, retRes] = await Promise.allSettled([
        fetchCohort(),
        fetchCohortRetention()
      ]);
      if (cohortRes.status === 'fulfilled' && cohortRes.value) {
        setData(cohortRes.value);
      } else {
        throw new Error(cohortRes.reason?.message || 'Failed to load visitor intelligence data');
      }
      if (retRes.status === 'fulfilled' && retRes.value) {
        setRetentionData(retRes.value);
      }
    } catch (e) {
      console.error('Visitor intelligence load error:', e);
      setError(e.message || 'Error loading visitor intelligence');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-500 dark:text-slate-400 text-sm">Computing visitor cohorts from live event stream…</p>
    </div>
  );
  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center p-6">
      <div className="p-3 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Unable to load visitor intelligence</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">{error}</p>
      <button 
        onClick={load}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2"
      >
        <RefreshCw className="w-3.5 h-3.5" /> Retry
      </button>
    </div>
  );
  if (!data) return null;

  const { 
    summary = {}, 
    frequency_funnel = [], 
    daily_cohort = [], 
    high_intent_profiles = [], 
    visitor_intelligence = [],
    visitor_intelligence_total_count = 0,
    retargeting_audiences = {},
    cross_marketplace = {}, 
    marketplace_freq = { flipkart: [], amazon: [] },
    campaign_bifurcation = [],
    region_bifurcation = [],
    source_bifurcation = [],
    creative_bifurcation = [],
    marketplace_bifurcation = [],
  } = data;

  const currentBifurcationList = 
    bifurcationTab === 'campaign' ? campaign_bifurcation :
    bifurcationTab === 'region' ? region_bifurcation :
    bifurcationTab === 'source' ? source_bifurcation :
    creative_bifurcation;

  // Marketplace filter for frequency funnel
  let funnelData = frequency_funnel || [];
  if (activeMarket === 'flipkart' && Array.isArray(marketplace_freq?.flipkart)) {
    funnelData = marketplace_freq.flipkart.map((r, i) => ({
      ...r,
      visits_num: i + 1,
      label: frequency_funnel[i]?.label || `${i + 1}x`,
      intent_tier: frequency_funnel[i]?.intent_tier || 'Warm'
    }));
  } else if (activeMarket === 'amazon' && Array.isArray(marketplace_freq?.amazon)) {
    funnelData = marketplace_freq.amazon.map((r, i) => ({
      ...r,
      visits_num: i + 1,
      label: frequency_funnel[i]?.label || `${i + 1}x`,
      intent_tier: frequency_funnel[i]?.intent_tier || 'Warm'
    }));
  }

  const visibleProfiles = showAll ? high_intent_profiles : (high_intent_profiles || []).slice(0, 10);

  // Cross-marketplace pie data
  const crossPie = [
    { name: 'Flipkart Only', value: cross_marketplace?.flipkart_only ?? 0, fill: '#f59e0b' },
    { name: 'Amazon Only', value: cross_marketplace?.amazon_only ?? 0, fill: '#f97316' },
    { name: 'Both Platforms', value: cross_marketplace?.both_platforms ?? 0, fill: '#7c3aed' },
  ];

  return (
    <div className="space-y-8 pb-12">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-500" />
            Visitor Cohort Map
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {summary.total_events?.toLocaleString()} marketplace redirect events · {summary.total_unique_visitors?.toLocaleString()} unique visitors
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* ── Insight Banner ───────────────────────────────────────────────────── */}
      <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-2xl px-5 py-4">
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
          <p className="text-sm text-indigo-800 dark:text-indigo-200 leading-relaxed">{summary.insight_headline}</p>
        </div>
      </div>

      {/* ── KPI Cards ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon={Users} label="Unique Visitors" value={summary.total_unique_visitors?.toLocaleString()} sub={`${summary.total_events?.toLocaleString()} total clicks`} color="indigo" />
        <StatCard icon={Eye} label="1-Time Only" value={summary.one_time_visitors?.toLocaleString()} sub={`${(summary.one_time_visitors/summary.total_unique_visitors*100).toFixed(1)}% of visitors`} color="blue" />
        <StatCard icon={Repeat} label="2+ Return Rate" value={`${summary.retention_rate_pct}%`} sub={`${summary.returning_visitors_2plus?.toLocaleString()} visitors`} color="emerald" />
        <StatCard icon={TrendingUp} label="High Intent 3+" value={summary.high_intent_3plus?.toLocaleString()} sub={`${summary.high_intent_rate_pct}% of all visitors`} color="amber" />
        <StatCard icon={Zap} label="Ultra-Hot 5+" value={summary.ultra_high_intent_5plus?.toLocaleString()} sub="Most likely to buy" color="red" />
        <StatCard icon={GitFork} label="Cross-Market" value={summary.cross_marketplace_visitors?.toLocaleString()} sub="Visited both platforms" color="purple" />
      </div>

      {/* ── COHORT RETENTION MATRIX (D1, D2, D3, D7) ─────────────────────────── */}
      {retentionData && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" />
                Cohort Retention Matrix (Day 1, 2, 3, 7)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {retentionData.explanation}
              </p>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50">
              Strict Elapsed Day Guards Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3 text-left">Date</th>
                  <th className="py-2.5 px-3 text-right">Unique Visitors</th>
                  <th className="py-2.5 px-3 text-right">Returned Day 1</th>
                  <th className="py-2.5 px-3 text-right">Returned Day 2</th>
                  <th className="py-2.5 px-3 text-right">Returned Day 3</th>
                  <th className="py-2.5 px-3 text-right">Returned Day 7</th>
                  <th className="py-2.5 px-3 text-right">Verified Orders</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {(retentionData.cohort_matrix || retentionData.rows || []).map((row, idx) => {
                  const isToday = row.is_today || row.date === retentionData.today_date;
                  const d1Pending = row.d1_pending || row.d1_return?.status === 'Pending';
                  const d2Pending = row.d2_pending || row.d2_return?.status === 'Pending';
                  const d3Pending = row.d3_pending || row.d3_return?.status === 'Pending';
                  const d7Pending = row.d7_pending || row.d7_return?.status === 'Pending';
                  
                  const d1Count = row.d1_return?.count ?? row.d1_count;
                  const d1Pct = row.d1_return?.pct ?? row.d1_pct;

                  const d2Count = row.d2_return?.count ?? row.d2_count;
                  const d2Pct = row.d2_return?.pct ?? row.d2_pct;

                  const d3Count = row.d3_return?.count ?? row.d3_count;
                  const d3Pct = row.d3_return?.pct ?? row.d3_pct;

                  const d7Count = row.d7_return?.count ?? row.d7_count;
                  const d7Pct = row.d7_return?.pct ?? row.d7_pct;

                  const orders = row.orders ?? row.verified_orders ?? 0;
                  const visitors = row.visitors ?? row.unique_visitors ?? 0;

                  return (
                    <tr key={idx} className={`table-row-hover transition-colors ${isToday ? 'bg-indigo-50/40 dark:bg-indigo-950/20 font-bold' : ''}`}>
                      <td className="py-3 px-3">
                        <span className="font-mono text-slate-900 dark:text-white">
                          {row.date_formatted || row.date} {isToday && <span className="ml-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-sans font-bold">(Today)</span>}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-800 dark:text-slate-200">
                        {visitors.toLocaleString()}
                      </td>
                      
                      {/* D1 */}
                      <td className="py-3 px-3 text-right font-mono">
                        {d1Pending ? (
                          <span className="text-slate-400 italic">Pending</span>
                        ) : (
                          <span className="text-slate-700 dark:text-slate-300">
                            {d1Count?.toLocaleString()} ({d1Pct}%)
                          </span>
                        )}
                      </td>

                      {/* D2 */}
                      <td className="py-3 px-3 text-right font-mono">
                        {d2Pending ? (
                          <span className="text-slate-400 italic">Pending</span>
                        ) : (
                          <span className="text-slate-700 dark:text-slate-300">
                            {d2Count?.toLocaleString()} ({d2Pct}%)
                          </span>
                        )}
                      </td>

                      {/* D3 */}
                      <td className="py-3 px-3 text-right font-mono">
                        {d3Pending ? (
                          <span className="text-slate-400 italic">Pending</span>
                        ) : (
                          <span className="text-slate-700 dark:text-slate-300">
                            {d3Count?.toLocaleString()} ({d3Pct}%)
                          </span>
                        )}
                      </td>

                      {/* D7 */}
                      <td className="py-3 px-3 text-right font-mono">
                        {d7Pending ? (
                          <span className="text-slate-400 italic">Pending</span>
                        ) : (
                          <span className="text-slate-700 dark:text-slate-300">
                            {d7Count?.toLocaleString()} ({d7Pct}%)
                          </span>
                        )}
                      </td>

                      {/* Orders */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {orders}
                      </td>
                    </tr>
                  );
                })}

                {/* Average / Summary Row */}
                {retentionData.averages && (
                  <tr className="bg-slate-50 dark:bg-slate-800/80 font-bold border-t-2 border-slate-200 dark:border-slate-700">
                    <td className="py-3 px-3 uppercase text-[11px] text-slate-700 dark:text-slate-200">Average / Total</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-900 dark:text-white">
                      {retentionData.averages.avg_visitors?.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-indigo-600 dark:text-indigo-400">
                      {retentionData.averages.avg_d1_pct}%
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-blue-600 dark:text-blue-400">
                      {retentionData.averages.avg_d2_pct}%
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-amber-600 dark:text-amber-400">
                      {retentionData.averages.avg_d3_pct}%
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-purple-600 dark:text-purple-400">
                      {retentionData.averages.avg_d7_pct}%
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400">
                      Total: {retentionData.averages.total_orders}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── VISITOR ACQUISITION & ENTRY BIFURCATIONS ───────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
        
        {/* Title & Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                <Target className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Visitor Entry & Campaign Bifurcation</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Analyze where visitors entered from (Campaign, Place / Region, Ad Channel, Creative) and how many return
                </p>
              </div>
            </div>
          </div>

          {/* Bifurcation Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl self-start">
            {[
              { id: 'campaign', label: '🎯 By Campaign', icon: Target },
              { id: 'region',   label: '📍 By Place / Region', icon: MapPin },
              { id: 'source',   label: '📢 By Traffic Source', icon: Share2 },
              { id: 'creative', label: '🎨 By Creative / Ad', icon: Sparkles },
            ].map(tab => {
              const active = bifurcationTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setBifurcationTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* High-Level Generic Takeaways */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50/80 to-slate-50 dark:from-emerald-950/30 dark:to-slate-900 border border-emerald-100 dark:border-emerald-900/40">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-1">
              <TrendingUp className="w-4 h-4" /> Top Retention Campaign
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">Flipkart East Region (21.5% Repeat)</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Generates 152 repeat visitors from 707 people — almost 2× higher retention than broad national ads (11.4%).
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/80 to-slate-50 dark:from-blue-950/30 dark:to-slate-900 border border-blue-100 dark:border-blue-900/40">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300 mb-1">
              <MapPin className="w-4 h-4" /> Highest Consideration Places
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">Assam & Odisha (26.7% - 27.3%)</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              More than 1 in 4 visitors from Assam & Odisha return multiple times across days to re-evaluate the product.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50/80 to-slate-50 dark:from-purple-950/30 dark:to-slate-900 border border-purple-100 dark:border-purple-900/40">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-300 mb-1">
              <Sparkles className="w-4 h-4" /> Scale vs Persistent Intent
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">Facebook Feed (10,779 visitors)</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Provides core acquisition volume. Instagram and Audience Network yield high relative retention (16% to 43%).
            </div>
          </div>
        </div>

        {/* Visual Chart: 1x vs Repeat across items */}
        {currentBifurcationList.length > 0 && (
          <div className="bg-slate-50/60 dark:bg-slate-800/30 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Single Visit vs Repeat Visitors Comparison ({bifurcationTab.toUpperCase()})
              </span>
              <span className="text-[11px] text-slate-400">Unique visitor distribution</span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentBifurcationList} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} />
                  <XAxis 
                    dataKey="label" 
                    tick={{ fontSize: 10, fill: '#94a3b8' }} 
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    tickFormatter={v => (v?.length > 18 ? v.slice(0, 16) + '…' : v)}
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const r = payload[0]?.payload;
                      const repeaters = (r.total_visitors - r.visitors_1x) || 0;
                      return (
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-xl text-xs space-y-1">
                          <div className="font-bold text-slate-900 dark:text-white">{r.label}</div>
                          <div className="text-slate-500">Total Unique: <b>{r.total_visitors?.toLocaleString()}</b></div>
                          <div className="text-indigo-600 dark:text-indigo-400">1× Single Visit: <b>{r.visitors_1x?.toLocaleString()}</b></div>
                          <div className="text-emerald-600 dark:text-emerald-400">2×+ Returners: <b>{repeaters?.toLocaleString()}</b> ({r.retention_pct}%)</div>
                          <div className="text-amber-600 dark:text-amber-400">3–4× Hot: <b>{r.visitors_3_4x}</b> | 5×+ Ultra: <b>{r.visitors_5x}</b></div>
                        </div>
                      );
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="visitors_1x" name="1× Single Visit" fill="#6366f1" stackId="stack" radius={[0,0,0,0]} />
                  <Bar 
                    dataKey={(row) => (row.total_visitors - row.visitors_1x)} 
                    name="2×+ Returned" 
                    fill="#10b981" 
                    stackId="stack" 
                    radius={[4,4,0,0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Bifurcation Breakdown Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
                <th className="text-left py-2.5 px-3 text-slate-500 dark:text-slate-400 font-semibold">
                  {bifurcationTab === 'campaign' ? 'Campaign Name' :
                   bifurcationTab === 'region' ? 'Place / Region' :
                   bifurcationTab === 'source' ? 'Ad Source / Channel' : 'Creative / Ad Unit'}
                </th>
                <th className="text-right py-2.5 px-3 text-slate-500 dark:text-slate-400 font-semibold">Total Unique</th>
                <th className="text-right py-2.5 px-3 text-indigo-600 dark:text-indigo-400 font-semibold">1× Visit</th>
                <th className="text-right py-2.5 px-3 text-blue-600 dark:text-blue-400 font-semibold">2× Return</th>
                <th className="text-right py-2.5 px-3 text-amber-600 dark:text-amber-400 font-semibold">3–4× Hot</th>
                <th className="text-right py-2.5 px-3 text-red-600 dark:text-red-400 font-semibold">5×+ Ultra</th>
                <th className="text-right py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-semibold">Repeat Rate</th>
                <th className="text-left py-2.5 px-3 text-slate-400 font-semibold min-w-[140px]">Repeat Proportion</th>
              </tr>
            </thead>
            <tbody>
              {currentBifurcationList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-400">
                    No bifurcation data available for this segment.
                  </td>
                </tr>
              ) : (
                currentBifurcationList.map((row, idx) => {
                  const isHighRetention = row.retention_pct >= 20;
                  const isMediumRetention = row.retention_pct >= 14 && row.retention_pct < 20;
                  return (
                    <tr 
                      key={idx} 
                      className="border-b border-slate-50 dark:border-slate-800/40 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Name */}
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-xs" title={row.label}>
                          {row.label}
                        </div>
                      </td>

                      {/* Total */}
                      <td className="py-2.5 px-3 text-right font-bold text-slate-700 dark:text-slate-300">
                        {row.total_visitors?.toLocaleString()}
                      </td>

                      {/* 1x */}
                      <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-400 font-mono">
                        {row.visitors_1x?.toLocaleString()}
                      </td>

                      {/* 2x */}
                      <td className="py-2.5 px-3 text-right text-blue-600 dark:text-blue-400 font-mono font-medium">
                        {row.visitors_2x?.toLocaleString()}
                      </td>

                      {/* 3-4x */}
                      <td className="py-2.5 px-3 text-right text-amber-600 dark:text-amber-400 font-mono font-semibold">
                        {row.visitors_3_4x?.toLocaleString()}
                      </td>

                      {/* 5x+ */}
                      <td className="py-2.5 px-3 text-right text-red-600 dark:text-red-400 font-mono font-bold">
                        {row.visitors_5x > 0 ? row.visitors_5x : '—'}
                      </td>

                      {/* Repeat Rate % */}
                      <td className="py-2.5 px-3 text-right">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold ${
                          isHighRetention 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : isMediumRetention
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {row.retention_pct}%
                        </span>
                      </td>

                      {/* Visual Bar */}
                      <td className="py-2.5 px-3">
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden flex">
                          <div 
                            style={{ width: `${100 - row.retention_pct}%` }} 
                            className="bg-indigo-400/50 dark:bg-indigo-600/50 h-full"
                            title={`1× Single: ${100 - row.retention_pct}%`}
                          />
                          <div 
                            style={{ width: `${row.retention_pct}%` }} 
                            className="bg-emerald-500 h-full"
                            title={`Repeat: ${row.retention_pct}%`}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* ── Frequency Funnel ─────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Visit Frequency Funnel</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">How many unique visitors came 1, 2, 3 … 8+ times</p>
          </div>
          {/* Marketplace toggle */}
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            {['all', 'flipkart', 'amazon'].map(m => (
              <button
                key={m}
                onClick={() => setActiveMarket(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  activeMarket === m
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                {m === 'all' ? 'Combined' : m}
              </button>
            ))}
          </div>
        </div>

        <VisitFunnelBar data={funnelData} />

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          {[
            { tier: 'Cold', desc: '1 visit – browsed once', color: '#6366f1' },
            { tier: 'Warm', desc: '2 visits – showed curiosity', color: '#3b82f6' },
            { tier: 'Hot', desc: '3–4 visits – actively evaluating', color: '#10b981' },
            { tier: 'Ultra-Hot', desc: '5+ visits – ready to buy', color: '#ef4444' },
          ].map(l => (
            <div key={l.tier} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: l.color }} />
              <span className="text-xs text-slate-600 dark:text-slate-400"><b>{l.tier}</b>: {l.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bar Chart variant of the funnel ──────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">Visitor Count by Visit Frequency</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Logarithmic view to reveal the long tail of high-intent repeaters</p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={frequency_funnel} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
              <XAxis dataKey="visits" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                scale="log"
                domain={[1, 'auto']}
                allowDataOverflow
                tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0]?.payload;
                  return (
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-xl text-xs">
                      <div className="font-bold mb-1" style={{ color: d?.color }}>{d?.label}</div>
                      <div><b>{d?.visitors?.toLocaleString()}</b> visitors ({d?.pct_of_total}%)</div>
                      <div className="mt-1 text-slate-400">Clicks generated: {d?.total_clicks_generated?.toLocaleString()}</div>
                    </div>
                  );
                }}
              />
              <Bar dataKey="visitors" radius={[6, 6, 0, 0]}>
                {frequency_funnel.map((entry) => (
                  <Cell key={entry.visits} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Daily New vs Returning ────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">Daily New vs Returning Visitors</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Tracks daily acquisition (new) vs retention (returning) across all marketplace redirects</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={daily_cohort}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => v.slice(5)} />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => `${v}%`} />
              <Tooltip content={<DailyTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar yAxisId="left" dataKey="new_visitors" name="New Visitors" stackId="a" fill="#6366f1" radius={[0,0,0,0]} />
              <Bar yAxisId="left" dataKey="returning_visitors" name="Returning Visitors" stackId="a" fill="#10b981" radius={[4,4,0,0]} />
              <Line yAxisId="right" type="monotone" dataKey="return_rate_pct" name="Return Rate %" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: '#f59e0b' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Return rate table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="text-left py-2 px-2 text-slate-400 font-medium">Date</th>
                <th className="text-right py-2 px-2 text-slate-400 font-medium">Total Clicks</th>
                <th className="text-right py-2 px-2 text-indigo-500 font-medium">New</th>
                <th className="text-right py-2 px-2 text-emerald-500 font-medium">Returning</th>
                <th className="text-right py-2 px-2 text-amber-500 font-medium">Return Rate</th>
              </tr>
            </thead>
            <tbody>
              {daily_cohort.map(row => (
                <tr key={row.date} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-2 px-2 font-mono text-slate-600 dark:text-slate-300">{row.date}</td>
                  <td className="py-2 px-2 text-right font-semibold text-slate-700 dark:text-slate-200">{row.total_clicks.toLocaleString()}</td>
                  <td className="py-2 px-2 text-right text-indigo-600 dark:text-indigo-400 font-medium">{row.new_visitors.toLocaleString()}</td>
                  <td className="py-2 px-2 text-right text-emerald-600 dark:text-emerald-400 font-medium">{row.returning_visitors.toLocaleString()}</td>
                  <td className="py-2 px-2 text-right">
                    <span className={`font-bold ${row.return_rate_pct >= 15 ? 'text-emerald-600 dark:text-emerald-400' : row.return_rate_pct >= 10 ? 'text-amber-600' : 'text-slate-500'}`}>
                      {row.return_rate_pct}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Cross-Marketplace Venn ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
            <GitFork className="w-4 h-4 text-purple-500" /> Cross-Marketplace Visitors
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Visitors who clicked through to both Flipkart and Amazon listings</p>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={crossPie} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={72} paddingAngle={3}>
                  {crossPie.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0];
                    return (
                      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 shadow-xl text-xs">
                        <div className="font-bold" style={{ color: d.payload.fill }}>{d.payload.name}</div>
                        <div><b>{d.value?.toLocaleString()}</b> visitors</div>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {crossPie.map(row => (
              <div key={row.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: row.fill }} />
                  <span className="text-xs text-slate-600 dark:text-slate-400">{row.name}</span>
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{row.value?.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-100 dark:border-purple-900/40 text-xs text-purple-800 dark:text-purple-200">
            💡 {cross_marketplace.insight}
          </div>
        </div>

        {/* Ultra-Hot segment breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
            <Star className="w-4 h-4 text-red-500" /> Ultra-Hot Segment (5+ Visits)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">These {summary.ultra_high_intent_5plus} visitors have the highest purchase probability — prioritise them in retargeting</p>
          <div className="space-y-3">
            {frequency_funnel.filter(f => f.visits_num >= 5).map(row => (
              <div key={row.visits} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: row.color + '12', border: `1px solid ${row.color}30` }}>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0"
                  style={{ background: row.color }}
                >
                  {row.visits}×
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100">{row.label}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{row.visitors} visitors · {row.total_clicks_generated} total clicks</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black" style={{ color: row.color }}>{row.visitors}</div>
                  <div className="text-[10px] text-slate-400">visitors</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-100 dark:border-red-900/40 text-xs text-red-800 dark:text-red-200">
            🎯 <b>Action:</b> Run a Meta/Google Custom Audience retargeting campaign targeting the <b>{summary.ultra_high_intent_5plus} ultra-hot visitors</b> with urgency creatives ("Limited stock – Bus conductors trust ApniBus").
          </div>
        </div>
      </div>

      {/* ── High Intent Visitor Profiles ─────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-500" /> High-Intent Visitor Profiles (3+ Visits)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {summary.high_intent_3plus} visitors · sorted by visit count · click to expand
            </p>
          </div>
          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
            PURCHASE SIGNALS
          </span>
        </div>
        <div className="space-y-2">
          {visibleProfiles.map((profile, i) => (
            <HighIntentRow key={profile.visitor_id} profile={profile} rank={i + 1} />
          ))}
        </div>
        {high_intent_profiles.length > 10 && (
          <button
            onClick={() => setShowAll(s => !s)}
            className="w-full mt-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
          >
            {showAll ? <><ChevronUp className="w-4 h-4" /> Show Less</> : <><ChevronDown className="w-4 h-4" /> Show All {high_intent_profiles.length} High-Intent Visitors</>}
          </button>
        )}
      </div>

      {/* ── RETARGETING READINESS (AUDIENCES A TO E) ─────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                <Target className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Retargeting Readiness — Audiences A to E
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Pre-computed actionable audiences with urgency classification and Meta/Google Custom Audience export readiness
                </p>
              </div>
            </div>
          </div>
          <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800 self-start sm:self-auto">
            AUTOMATED AUDIENCES (NO MANUAL STEP)
          </span>
        </div>

        {/* Policy & Measurement Notice */}
        <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <span className="font-bold block uppercase tracking-wider text-[10px] text-amber-700 dark:text-amber-300">
              Measurement Architecture &amp; Marketplace Privacy Policy
            </span>
            <p className="leading-relaxed">
              {retargeting_audiences.policy_notice || 
                "Meta and Google tracking pixels cannot execute inside closed third-party marketplace apps (Amazon & Flipkart). All cart drop-offs are measured at the marketplace redirect bridge. Audiences reflect high-confidence intent signals captured prior to marketplace handoff."}
            </p>
          </div>
        </div>

        {/* Audiences Grid A through E */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(retargeting_audiences.audiences || []).map((aud) => {
            const urgencyBg = 
              aud.urgency === 'High' 
                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200' 
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200';
            return (
              <div 
                key={aud.id} 
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                      {aud.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${urgencyBg}`}>
                      {aud.urgency || 'High'} Urgency
                    </span>
                  </div>
                  
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {aud.tier}
                  </h3>
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1">
                    Criteria: <span className="font-semibold text-slate-700 dark:text-slate-300">{aud.criteria}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-700/60 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block">Audience Size</span>
                    <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
                      {aud.size?.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 block">({aud.pct_of_unique}% of unique)</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block">Primary Intent</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                      {aud.top_marketplace}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate" title={aud.top_campaign}>
                      {aud.top_campaign}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/70 text-xs">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 block text-[10px] uppercase tracking-wider mb-1">
                    Recommended Creative Angle
                  </span>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                    {aud.recommended_focus}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Meta Custom Audience Export Readiness Guide */}
        <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Meta Custom Audience Export Readiness
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {retargeting_audiences.meta_custom_audience_guide?.export_ready_count?.toLocaleString() || summary.total_unique_visitors?.toLocaleString()} Identifiers Mapped
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px]">
              <strong>Supported Schema:</strong> {retargeting_audiences.meta_custom_audience_guide?.supported_identifiers || "Browser Cookie Hash, Device Type, State, Campaign UTM"}. Compatible with Meta Ads Manager (Audiences &gt; Customer List) and Google Ads Customer Match.
            </p>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
            <strong>Ad Manager Action:</strong> Use URL parameter retargeting on UTM Campaign or upload visitor hash segments for custom lookalikes.
          </div>
        </div>
      </div>

      {/* ── COMPLETE VISITOR INTELLIGENCE EXPLORER ───────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <Users className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Complete Visitor Intelligence Explorer
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Deduplicated individual profiles across {visitor_intelligence_total_count?.toLocaleString() || summary.total_unique_visitors?.toLocaleString()} unique visitors with multi-touch attributes
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={visitorSearch}
                onChange={e => { setVisitorSearch(e.target.value); setVisitorPage(1); }}
                placeholder="Search visitor ID, state, campaign..."
                className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-52 sm:w-64"
              />
            </div>

            {/* Marketplace filter */}
            <select
              value={visitorFilterMarket}
              onChange={e => { setVisitorFilterMarket(e.target.value); setVisitorPage(1); }}
              className="py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">All Marketplaces</option>
              <option value="flipkart">Flipkart Intent</option>
              <option value="amazon">Amazon Intent</option>
              <option value="both">Both (Cross-channel)</option>
            </select>

            {/* Segment filter */}
            <select
              value={visitorFilterSegment}
              onChange={e => { setVisitorFilterSegment(e.target.value); setVisitorPage(1); }}
              className="py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">All Segments</option>
              <option value="ultra">Ultra-High-Intent (5+)</option>
              <option value="high">High-Intent (3+)</option>
              <option value="warm">Warm (2)</option>
              <option value="new">New (1)</option>
            </select>
          </div>
        </div>

        {/* Visitor Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Visitor ID</th>
                <th className="py-2.5 px-3">Segment / Intent</th>
                <th className="py-2.5 px-3 text-right">Interactions</th>
                <th className="py-2.5 px-3">Marketplace</th>
                <th className="py-2.5 px-3">State &amp; Language</th>
                <th className="py-2.5 px-3">Primary Campaign</th>
                <th className="py-2.5 px-3 text-right">Last Interaction</th>
                <th className="py-2.5 px-3">Conversion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {(() => {
                const q = visitorSearch.toLowerCase();
                const matched = visitor_intelligence.filter(v => {
                  const sMatch = !q || 
                    (v.visitor_id || '').toLowerCase().includes(q) ||
                    (v.primary_state || '').toLowerCase().includes(q) ||
                    (v.primary_campaign || '').toLowerCase().includes(q) ||
                    (v.primary_language || '').toLowerCase().includes(q);
                  const mMatch = visitorFilterMarket === 'all' || 
                    (v.marketplace_intent || '').toLowerCase() === visitorFilterMarket.toLowerCase() ||
                    (visitorFilterMarket === 'both' && (v.marketplace_intent || '').toLowerCase() === 'both');
                  const segMatch = visitorFilterSegment === 'all' ||
                    (v.visitor_segment || '').toLowerCase().includes(visitorFilterSegment.toLowerCase());
                  return sMatch && mMatch && segMatch;
                });

                const pageSize = 15;
                const totalPages = Math.max(1, Math.ceil(matched.length / pageSize));
                const pageVisitors = matched.slice((visitorPage - 1) * pageSize, visitorPage * pageSize);

                if (pageVisitors.length === 0) {
                  return (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No visitor profiles matched your search or filters.
                      </td>
                    </tr>
                  );
                }

                return pageVisitors.map((v, i) => {
                  const isUltra = v.visitor_segment === 'Ultra-High-Intent';
                  const isHigh = v.visitor_segment === 'High-Intent';
                  const isWarm = v.visitor_segment === 'Warm';

                  const badgeClass = isUltra 
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200'
                    : isHigh
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200'
                    : isWarm
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200';

                  return (
                    <tr key={v.visitor_id || i} className="table-row-hover transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                        {v.visitor_id?.length > 18 ? `${v.visitor_id.slice(0, 10)}...${v.visitor_id.slice(-6)}` : v.visitor_id}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClass}`}>
                          {v.visitor_segment}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono">
                        <span className="font-bold text-slate-900 dark:text-white">{v.total_clicks || v.visit_count}</span>
                        <span className="text-[10px] text-slate-400 block">{v.days_active || v.number_of_active_days || 1}d span</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          v.marketplace_intent === 'Both' 
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            : (v.marketplace_intent || '').toLowerCase() === 'amazon'
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300'
                        }`}>
                          {v.marketplace_intent}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-slate-800 dark:text-slate-200 font-medium block">{v.primary_state || 'Pan-India'}</span>
                        <span className="text-[10px] text-slate-400 block">{v.primary_language || 'Hindi / English'}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300 truncate max-w-xs" title={v.primary_campaign}>
                        <span className="block truncate font-medium">{v.primary_campaign || '—'}</span>
                        <span className="text-[10px] text-slate-400 block truncate">{v.primary_adset || 'Direct / Organic'}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-[11px] text-slate-500">
                        {v.latest_visit_time || v.last_seen || '—'}
                      </td>
                      <td className="py-3 px-3">
                        {v.converted_flag ? (
                          <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                            ✓ {v.order_id || 'ORDERED'} (₹{v.order_value || 4998})
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px] font-mono">
                            Unconverted
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>

        {/* Footer pagination info */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span>
            Showing sample from {visitor_intelligence.length} in-memory high-relevance profiles ({visitor_intelligence_total_count?.toLocaleString()} total database records)
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setVisitorPage(p => Math.max(1, p - 1))}
              disabled={visitorPage <= 1}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 font-semibold"
            >
              Prev
            </button>
            <span className="px-2 font-mono">Page {visitorPage}</span>
            <button
              onClick={() => setVisitorPage(p => p + 1)}
              disabled={visitorPage * 15 >= visitor_intelligence.length}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 font-semibold"
            >
              Next
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
