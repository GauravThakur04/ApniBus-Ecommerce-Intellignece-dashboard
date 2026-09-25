import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import { 
  BarChart3, ArrowUpDown, Filter, Sparkles, TrendingUp, Compass, Target, 
  ShoppingBag, ArrowRight, GitFork, CheckCircle2, ArrowLeftRight, Activity, DollarSign
} from 'lucide-react';
import { fetchMarketplaceComparison, fetchCampaignOrderFunnel } from '../services/api';

export default function MarketingPage({ marketingData }) {
  const [sortField, setSortField] = useState('spend');
  const [sortAsc, setSortAsc] = useState(false);
  const [mpComp, setMpComp] = useState(null);
  const [campFunnel, setCampFunnel] = useState(null);

  useEffect(() => {
    fetchMarketplaceComparison().then(setMpComp).catch(console.error);
    fetchCampaignOrderFunnel().then(setCampFunnel).catch(console.error);
  }, []);

  if (!marketingData) {
    return <div className="p-8 text-center text-slate-400">Loading Marketing Performance matrix...</div>;
  }

  const { channels_table = [], chart_data = {} } = marketingData;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const sortedTable = [...channels_table].sort((a, b) => {
    let vA = a[sortField] ?? 0;
    let vB = b[sortField] ?? 0;
    if (typeof vA === 'string') {
      return sortAsc ? vA.localeCompare(vB) : vB.localeCompare(vA);
    }
    return sortAsc ? vA - vB : vB - vA;
  });

  const amz = mpComp?.amazon || {};
  const fk = mpComp?.flipkart || {};
  const both = mpComp?.both_marketplaces || {};

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
            Marketplace Comparison &amp; Campaign Funnels
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Side-by-side marketplace economics and dedicated East Region campaign attribution
          </p>
        </div>
      </div>

      {/* ── 1. MARKETPLACE HEAD-TO-HEAD COMPARISON ───────────────────────────── */}
      {mpComp && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Amazon Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-900/40 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-amber-100 dark:border-amber-950 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 font-extrabold flex items-center justify-center text-sm">
                    AMZ
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Amazon Marketplace</h3>
                    <span className="text-[11px] text-slate-400">Sponsored Products &amp; Direct Traffic</span>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                  {amz.roas || 2.54}x ROAS
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20">
                  <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 block">Ad Spend</span>
                  <span className="text-sm font-black font-mono text-slate-900 dark:text-white">₹{amz.ad_spend?.toLocaleString() || '1,969'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20">
                  <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 block">Visitors</span>
                  <span className="text-sm font-black font-mono text-slate-900 dark:text-white">{amz.unique_visitors?.toLocaleString() || '9,120'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">Orders</span>
                  <span className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">{amz.verified_orders ?? 1}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20">
                  <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 block">Revenue</span>
                  <span className="text-sm font-black font-mono text-slate-900 dark:text-white">₹{amz.gross_revenue?.toLocaleString() || '4,999'}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">Conversion Rate:</span>
                  <span className="font-bold font-mono text-slate-800 dark:text-slate-200">{amz.conversion_rate_pct}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Cost / Order (CPO):</span>
                  <span className="font-bold font-mono text-slate-800 dark:text-slate-200">₹{amz.cpo?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Repeat Visitors:</span>
                  <span className="font-bold font-mono text-slate-800 dark:text-slate-200">{amz.repeat_visitors} ({amz.repeat_rate_pct}%)</span>
                </div>
              </div>
            </div>

            {/* Flipkart Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-blue-200/80 dark:border-blue-900/40 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-blue-100 dark:border-blue-950 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-700 dark:text-blue-400 font-extrabold flex items-center justify-center text-sm">
                    FK
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Flipkart Marketplace</h3>
                    <span className="text-[11px] text-slate-400">PLA &amp; Traffic Campaigns</span>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                  {fk.roas || 0.88}x ROAS · 7 Orders
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20">
                  <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-400 block">Ad Spend</span>
                  <span className="text-sm font-black font-mono text-slate-900 dark:text-white">₹{fk.ad_spend?.toLocaleString() || '39,592'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20">
                  <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-400 block">Visitors</span>
                  <span className="text-sm font-black font-mono text-slate-900 dark:text-white">{fk.unique_visitors?.toLocaleString() || '8,704'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">Orders</span>
                  <span className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">{fk.verified_orders ?? 7}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20">
                  <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-400 block">Revenue</span>
                  <span className="text-sm font-black font-mono text-slate-900 dark:text-white">₹{fk.gross_revenue?.toLocaleString() || '34,986'}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">Conversion Rate:</span>
                  <span className="font-bold font-mono text-slate-800 dark:text-slate-200">{fk.conversion_rate_pct}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Cost / Order (CPO):</span>
                  <span className="font-bold font-mono text-slate-800 dark:text-slate-200">₹{fk.cpo?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Repeat Visitors:</span>
                  <span className="font-bold font-mono text-slate-800 dark:text-slate-200">{fk.repeat_visitors} ({fk.repeat_rate_pct}%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cross-Platform Overlap & Switching Flow */}
          <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                <ArrowLeftRight className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-purple-900 dark:text-purple-200 uppercase tracking-wider">
                  Cross-Marketplace Shoppers ({both.count} Visitors · {both.pct_of_unique}% of Unique)
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Visitors who compared both listings before ordering. Flow: <strong>{both.flow?.first_amazon_then_flipkart} Amazon → Flipkart</strong> vs <strong>{both.flow?.first_flipkart_then_amazon} Flipkart → Amazon</strong>.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-lg bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300 font-mono">
              High Consideration Segment
            </span>
          </div>
        </div>
      )}

      {/* ── 2. CAMPAIGN FUNNEL (SEPARATING EAST REGION FROM MAIN CAMPAIGN) ─────── */}
      {campFunnel && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-500" />
                Campaign Funnel: Dedicated East Region vs Main Campaign
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Isolating GS | Traffic | Flipkart | East Region (West Bengal, Assam, Odisha) from broad national campaigns
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
              50% OF LIFETIME SALES
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* East Region Cluster */}
            <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase">
                  {campFunnel.east_region_cluster?.campaign_name}
                </span>
                <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                  {campFunnel.east_region_cluster?.roas}x ROAS
                </span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300">
                Target States: <strong>{campFunnel.east_region_cluster?.target_states?.join(', ')}</strong>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-white dark:bg-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Spend</span>
                  <span className="font-bold font-mono">₹{campFunnel.east_region_cluster?.spend?.toLocaleString()}</span>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Orders</span>
                  <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">{campFunnel.east_region_cluster?.verified_orders}</span>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">CPO</span>
                  <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">₹{campFunnel.east_region_cluster?.cpo}</span>
                </div>
              </div>
            </div>

            {/* Main Campaign */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">
                  {campFunnel.main_campaign?.campaign_name}
                </span>
                <span className="text-xs font-black text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                  {campFunnel.main_campaign?.roas}x ROAS
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Target States: <strong>Pan-India Broad Targeting</strong>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900">
                  <span className="text-[10px] text-slate-400 uppercase block">Spend</span>
                  <span className="font-bold font-mono">₹{campFunnel.main_campaign?.spend?.toLocaleString()}</span>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900">
                  <span className="text-[10px] text-slate-400 uppercase block">Orders</span>
                  <span className="font-bold font-mono text-slate-800 dark:text-slate-200">{campFunnel.main_campaign?.verified_orders}</span>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900">
                  <span className="text-[10px] text-slate-400 uppercase block">CPO</span>
                  <span className="font-bold font-mono text-amber-600 dark:text-amber-400">₹{campFunnel.main_campaign?.cpo?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. Spend vs Revenue Comparison Chart */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Marketing Spend vs Verified Revenue by Campaign</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Comparing East Region Dedicated cluster vs Rest of India and Marketplace Ads</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart_data.spend_vs_revenue || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
              <XAxis dataKey="channel" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#1e293b',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="spend" fill="#f59e0b" name="Ad Spend (₹)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="revenue" fill="#22c55e" name="Gross Revenue (₹)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Unified Marketing Matrix Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Comprehensive Campaign Matrix</h3>
          <span className="text-[11px] text-slate-400">Click headers to sort ascending / descending</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3 cursor-pointer hover:text-green-500" onClick={() => handleSort('campaign')}>
                  <div className="flex items-center gap-1">Campaign &amp; Target <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="py-2.5 px-3 cursor-pointer hover:text-green-500" onClick={() => handleSort('marketplace')}>
                  <div className="flex items-center gap-1">Marketplace <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="py-2.5 px-3 cursor-pointer hover:text-green-500 text-right" onClick={() => handleSort('spend')}>
                  <div className="flex items-center justify-end gap-1">Spend (₹) <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="py-2.5 px-3 cursor-pointer hover:text-green-500 text-right" onClick={() => handleSort('clicks')}>
                  <div className="flex items-center justify-end gap-1">Clicks <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="py-2.5 px-3 cursor-pointer hover:text-green-500 text-right" onClick={() => handleSort('ctr')}>
                  <div className="flex items-center justify-end gap-1">CTR (%) <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="py-2.5 px-3 cursor-pointer hover:text-green-500 text-right" onClick={() => handleSort('cpc')}>
                  <div className="flex items-center justify-end gap-1">CPC (₹) <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="py-2.5 px-3 cursor-pointer hover:text-green-500 text-right" onClick={() => handleSort('orders')}>
                  <div className="flex items-center justify-end gap-1">Orders <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="py-2.5 px-3 cursor-pointer hover:text-green-500 text-right" onClick={() => handleSort('revenue')}>
                  <div className="flex items-center justify-end gap-1">Revenue (₹) <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="py-2.5 px-3 cursor-pointer hover:text-green-500 text-right" onClick={() => handleSort('roas')}>
                  <div className="flex items-center justify-end gap-1">ROAS <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {sortedTable.map((row, idx) => (
                <tr key={idx} className={`table-row-hover transition-colors ${row.campaign.includes('East Region') ? 'bg-green-50/30 dark:bg-green-950/15' : ''}`}>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      {row.campaign.includes('East Region') && <Sparkles className="w-3.5 h-3.5 text-green-500 shrink-0" />}
                      <span>{row.campaign}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {row.target_regions || row.adset}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      row.marketplace === 'Flipkart' 
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        : (row.marketplace === 'Amazon' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300' : 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300')
                    }`}>
                      {row.marketplace}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900 dark:text-white">
                    ₹{row.spend?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-600 dark:text-slate-300">
                    {row.clicks?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-600 dark:text-slate-300">
                    {row.ctr}%
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-600 dark:text-slate-300">
                    ₹{row.cpc}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {row.orders}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{row.revenue?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-green-600 dark:text-green-400">
                    {row.roas}x
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      row.status.includes('STAR') || row.status.includes('SCALING')
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/40' 
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {row.status}
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
