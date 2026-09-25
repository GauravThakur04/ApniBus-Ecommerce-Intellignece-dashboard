import React, { useState, useEffect } from 'react';
import { MapPin, ShieldCheck, DollarSign, TrendingUp, Info, ArrowUpDown, Sparkles, Target } from 'lucide-react';
import { fetchRegionalSalesIntelligence } from '../services/api';

export default function RegionalPage({ regionalData }) {
  const [data, setData] = useState(null);
  const [sortField, setSortField] = useState('verified_orders');
  const [sortAsc, setSortAsc] = useState(false);
  const [expandedState, setExpandedState] = useState(null);

  useEffect(() => {
    fetchRegionalSalesIntelligence()
      .then(setData)
      .catch(console.error);
  }, []);

  const rawTable = data?.states_table || regionalData?.states_table || [];
  const states = rawTable.map(s => ({
    state: s.state,
    is_mandatory_region: s.is_mandatory_region || ['West Bengal', 'Odisha', 'Assam', 'Tamil Nadu', 'Karnataka', 'Kerala', 'Andhra Pradesh', 'Telangana'].includes(s.state),
    is_east_region: s.is_east_region || ['West Bengal', 'Assam', 'Odisha'].includes(s.state),
    language: s.language || s.breakdown?.by_language || 'English / Hindi',
    verified_orders: s.verified_orders ?? s.orders ?? s.customer_orders ?? 0,
    gross_revenue: s.revenue ?? s.gross_revenue ?? 0,
    unique_visitors: s.unique_visitors ?? s.tracked_traffic_clicks ?? 0,
    returning_visitors_pct: s.returning_visitors_pct ?? s.repeat_rate ?? 0,
    high_intent_visitors: s.high_intent_visitors ?? s.repeat_visitors ?? 0,
    high_intent_pct: s.high_intent_pct ?? s.repeat_rate ?? 0,
    ad_spend: s.spend ?? s.ad_spend ?? 0,
    impressions: s.impressions ?? 0,
    clicks: s.clicks ?? s.events ?? s.tracked_traffic_clicks ?? 0,
    ctr: s.ctr ?? 0,
    cpc: s.cpc ?? 0,
    cpo: s.cpo ?? s.cost_per_order ?? ((s.verified_orders || s.orders) > 0 ? (s.spend / (s.verified_orders || s.orders)) : null),
    roas: s.roas ?? (s.spend > 0 ? (s.revenue || s.gross_revenue || 0) / s.spend : 0),
    conversion_rate_pct: s.conversion_rate ?? s.conversion_rate_pct ?? 0,
    breakdown: s.breakdown || {},
    order_cities: s.order_cities || []
  }));

  const eastCluster = data?.east_region_summary || {
    total_orders: 4,
    total_revenue: 19993,
    total_spend: 300.0,
    cpo: 75.0,
    states: ['West Bengal', 'Odisha', 'Assam']
  };

  const southCluster = data?.south_region_summary || {
    states: ['Karnataka', 'Tamil Nadu', 'Kerala', 'Andhra Pradesh', 'Telangana'],
    campaign_name: 'GS | Traffic | South Region',
    launched_date: '2026-09-24',
    status: 'Learning (Active)',
    total_adsets: 10,
    total_clicks: 28,
    total_spend: 12.17,
    total_impressions: 727,
    total_reach: 499,
    avg_cpc: 0.43,
    top_state_by_clicks: 'Andhra Pradesh (15 clicks)'
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const sortedStates = [...states].sort((a, b) => {
    let vA = a[sortField] ?? 0;
    let vB = b[sortField] ?? 0;
    if (typeof vA === 'string') {
      return sortAsc ? vA.localeCompare(vB) : vB.localeCompare(vA);
    }
    // Neutral fallback: if orders equal, sort by revenue, then visitors
    if (sortField === 'verified_orders' && vA === vB) {
      return (b.gross_revenue ?? 0) - (a.gross_revenue ?? 0) || (b.unique_visitors ?? 0) - (a.unique_visitors ?? 0);
    }
    return sortAsc ? vA - vB : vB - vA;
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Regional Sales Intelligence
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Geographic conversion table with East Region Cluster &amp; New South Region Multi-State Launch
          </p>
        </div>
      </div>

      {/* 2-Column Regional Focus Highlights: East Cluster & South Launch */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* East Region Cluster Highlight Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-900/60 flex flex-col justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                  East Cluster: {eastCluster.states?.join(', ')}
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
                  {eastCluster.pct_of_all_orders || 50}% of All Orders
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                5 verified lifetime orders originate in this East/NE cluster (Odisha, West Bengal, Assam, Sikkim).
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-900/40 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">Spend: ₹{eastCluster.total_spend || 300} · 4 Orders</span>
            <span className="font-bold text-emerald-700 dark:text-emerald-400">CPO: ₹{eastCluster.cpo || 75.00}</span>
          </div>
        </div>

        {/* New South Region Launch Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-900/60 flex flex-col justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-xs font-black uppercase tracking-wider text-blue-900 dark:text-blue-300">
                  South Launch: {southCluster.states?.join(', ')}
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 animate-pulse">
                  NEW LAUNCH (24-SEP)
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                10 active ad sets across 5 states for Amazon &amp; Flipkart. Early delivery at ₹0.43 CPC with strong traction in Andhra Pradesh (15 clicks).
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-blue-200/60 dark:border-blue-900/40 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">Spend: ₹{southCluster.total_spend} · {southCluster.total_clicks} Clicks</span>
            <span className="font-bold text-blue-700 dark:text-blue-400">Avg CPC: ₹{southCluster.avg_cpc}</span>
          </div>
        </div>
      </div>

      {/* State Performance Table with Neutral Sorting */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">State-Wise Conversion &amp; Unit Economics</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Default neutral sort: Verified Orders → Gross Revenue → Unique Visitors</p>
          </div>
          <span className="text-[11px] text-slate-400">Click headers to re-sort</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3 cursor-pointer hover:text-indigo-600" onClick={() => handleSort('state')}>
                  <div className="flex items-center gap-1">State / Region <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="py-2.5 px-3 text-slate-500">Language</th>
                <th className="py-2.5 px-3 cursor-pointer hover:text-indigo-600 text-right" onClick={() => handleSort('verified_orders')}>
                  <div className="flex items-center justify-end gap-1">Orders <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="py-2.5 px-3 cursor-pointer hover:text-indigo-600 text-right" onClick={() => handleSort('gross_revenue')}>
                  <div className="flex items-center justify-end gap-1">Revenue (₹) <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="py-2.5 px-3 cursor-pointer hover:text-indigo-600 text-right" onClick={() => handleSort('unique_visitors')}>
                  <div className="flex items-center justify-end gap-1">Unique Vis. <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="py-2.5 px-3 cursor-pointer hover:text-indigo-600 text-right" onClick={() => handleSort('returning_visitors_pct')}>
                  <div className="flex items-center justify-end gap-1">Return % <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="py-2.5 px-3 cursor-pointer hover:text-indigo-600 text-right" onClick={() => handleSort('high_intent_visitors')}>
                  <div className="flex items-center justify-end gap-1">High Intent <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="py-2.5 px-3 cursor-pointer hover:text-indigo-600 text-right" onClick={() => handleSort('ad_spend')}>
                  <div className="flex items-center justify-end gap-1">Ad Spend (₹) <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="py-2.5 px-3 cursor-pointer hover:text-indigo-600 text-right" onClick={() => handleSort('cpc')}>
                  <div className="flex items-center justify-end gap-1">CPC (₹) <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="py-2.5 px-3 cursor-pointer hover:text-indigo-600 text-right" onClick={() => handleSort('cpo')}>
                  <div className="flex items-center justify-end gap-1">CPO (₹) <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="py-2.5 px-3 cursor-pointer hover:text-indigo-600 text-right" onClick={() => handleSort('roas')}>
                  <div className="flex items-center justify-end gap-1">ROAS <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="py-2.5 px-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {sortedStates.map((row, idx) => {
                const isEast = row.is_east_region;
                const isMandatory = row.is_mandatory_region;
                const hasOrders = row.verified_orders > 0;
                const isExpanded = expandedState === row.state;
                return (
                  <React.Fragment key={idx}>
                    <tr 
                      className={`table-row-hover transition-colors cursor-pointer ${
                        hasOrders 
                          ? (isEast ? 'bg-emerald-50/40 dark:bg-emerald-950/20 font-semibold' : 'bg-indigo-50/30 dark:bg-indigo-950/20 font-semibold')
                          : ''
                      }`}
                      onClick={() => setExpandedState(isExpanded ? null : row.state)}
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 flex-wrap font-bold text-slate-900 dark:text-white">
                          {row.state}
                          {isMandatory && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300/40">
                              CORE 8
                            </span>
                          )}
                          {isEast && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40">
                              EAST
                            </span>
                          )}
                        </div>
                        {row.order_cities?.length > 0 && (
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                            Verified: {row.order_cities.join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400 text-[11px]">
                        {row.language}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {row.verified_orders}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        ₹{row.gross_revenue?.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                        {row.unique_visitors?.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                        {row.returning_visitors_pct}%
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                        {row.high_intent_visitors?.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                        ₹{row.ad_spend?.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                        ₹{row.cpc ? row.cpc.toFixed(2) : '0.00'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                        {row.cpo ? `₹${Math.round(row.cpo).toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {row.roas ? `${row.roas.toFixed(2)}x` : '—'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200">
                          {isExpanded ? 'Hide' : 'Breakdown'}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Multi-Dimensional Breakdown */}
                    {isExpanded && (
                      <tr className="bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800">
                        <td colSpan={12} className="p-3.5 space-y-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                              <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] block mb-1.5">
                                Top Adsets in {row.state}:
                              </span>
                              {row.breakdown?.by_adset?.length > 0 ? (
                                <div className="space-y-1">
                                  {row.breakdown.by_adset.map((ad, i) => (
                                    <div key={i} className="flex justify-between text-[11px]">
                                      <span className="text-slate-600 dark:text-slate-400 truncate max-w-[200px]">{ad.adset}</span>
                                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{ad.clicks} clicks</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-slate-400 text-[11px]">Standard regional delivery</span>
                              )}
                            </div>

                            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                              <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] block mb-1.5">
                                Top Creatives in {row.state}:
                              </span>
                              {row.breakdown?.by_creative?.length > 0 ? (
                                <div className="space-y-1">
                                  {row.breakdown.by_creative.map((cr, i) => (
                                    <div key={i} className="flex justify-between text-[11px]">
                                      <span className="text-slate-600 dark:text-slate-400 truncate max-w-[200px]">{cr.creative}</span>
                                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{cr.clicks} clicks</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-slate-400 text-[11px]">Main product visual</span>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
