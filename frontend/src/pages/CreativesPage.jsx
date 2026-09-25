import React, { useState } from 'react';
import { 
  Sparkles, Video, Image, PlaySquare, Eye, ArrowUpRight, 
  TrendingUp, CheckCircle, ShieldAlert, BarChart3, Layers, Compass
} from 'lucide-react';

export default function CreativesPage({ creativesData }) {
  const [filterType, setFilterType] = useState('all');

  if (!creativesData) {
    return <div className="p-8 text-center text-slate-400">Loading Creative Intelligence data...</div>;
  }

  const { creatives_table = [], summary_metrics = {} } = creativesData;

  const filteredCreatives = creatives_table.filter(c => {
    if (filterType === 'video') return c.creative_type.toLowerCase().includes('video');
    if (filterType === 'static') return c.creative_type.toLowerCase().includes('static');
    if (filterType === 'regional') return c.creative_type.toLowerCase().includes('regional');
    return true;
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            Creative &amp; Video Intelligence Deep-Dive
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Granular attribution across Video Demos, Price Anchors, Hindi Social Proof &amp; Regional Geo creatives
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold">
          {[
            { id: 'all', label: 'All Creatives' },
            { id: 'video', label: 'Videos (2)' },
            { id: 'static', label: 'Statics (2)' },
            { id: 'regional', label: 'East Geo (1)' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterType === tab.id
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top Level Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Video Clicks */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Video Clicks</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {summary_metrics.total_video_clicks?.toLocaleString('en-IN') || '4,873'}
            </span>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
              {summary_metrics.video_clicks_share || 41.8}% Share
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            Video 1 SQ (4,425) + Video 2 HZ (448)
          </div>
        </div>

        {/* Card 2: Static Clicks */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Static Clicks</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Image className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {summary_metrics.total_static_clicks?.toLocaleString('en-IN') || '6,774'}
            </span>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
              {summary_metrics.static_clicks_share || 58.1}% Share
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            ₹4,998 Anchor (4,375) + Launch (2,366)
          </div>
        </div>

        {/* Card 3: Top Performing Hook Today */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Peak Hook ({creativesData?.today_formatted || 'Live'})</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {summary_metrics.top_creative_today_clicks || 714}
            </span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              ({summary_metrics.top_creative_today_share || 75.9}% today)
            </span>
          </div>
          <div className="mt-2 text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate">
            Video 1 | Conductor Ticketing Demo SQ
          </div>
        </div>

        {/* Card 4: East Regional Geo Ads */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">East Region Launch</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {summary_metrics.east_campaign_clicks_today || 33}
            </span>
            <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
              Live Today
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            WB: 18 · Assam: 10 · Odisha: 5
          </div>
        </div>
      </div>

      {/* Creative Angles Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Angle 1: Video 1 Demo */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent border border-indigo-200 dark:border-indigo-900/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                Top Traffic Engine
              </span>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">4,425 Clicks</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Video 1: Conductor Ticketing Demo (SQ 24s)</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Shows real bus conductor punching tickets, thermal print speed, and UPI QR scanning. Captures <strong>75.9% of all traffic today</strong>.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Platform Split:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">50% Flipkart / 50% Amazon</span>
          </div>
        </div>

        {/* Angle 2: Price Anchor 4998 */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/5 via-transparent to-transparent border border-blue-200 dark:border-blue-900/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                Amazon Intent Driver
              </span>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">4,375 Clicks</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Static: Price Anchor ₹4,998 Form Factor</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Transparent ₹4,998 price point upfront. Drives <strong>87% of all Amazon clicks (3,806 clicks)</strong> and 3 verified orders.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Platform Split:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">87% Amazon / 13% Flipkart</span>
          </div>
        </div>

        {/* Angle 3: Video 2 Testimonial & Regional */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent border border-emerald-200 dark:border-emerald-900/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Social Proof &amp; Regional
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">481 Clicks</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Video 2 Hindi Review &amp; East Regional</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Hindi operator testimonial (448 clicks) + today's newly launched East regional geo ads (33 clicks across WB, Assam, Odisha).
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Focus:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">High Trust + Regional Urgency</span>
          </div>
        </div>
      </div>

      {/* Creative Matrix Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Complete Creative Angle Matrix</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Verified click attribution, platform split, and commercial outcome grading</p>
          </div>
          <span className="text-[11px] text-slate-400">{filteredCreatives.length} active creative cohorts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Creative Name &amp; Format</th>
                <th className="py-2.5 px-3">Category Angle</th>
                <th className="py-2.5 px-3">Associated Campaign</th>
                <th className="py-2.5 px-3">Platform Split</th>
                <th className="py-2.5 px-3 text-right">Total Clicks</th>
                <th className="py-2.5 px-3 text-right">Share %</th>
                <th className="py-2.5 px-3 text-right">Today ({creativesData?.today_formatted || 'Live'})</th>
                <th className="py-2.5 px-3 text-right">Orders</th>
                <th className="py-2.5 px-3">Commercial Outcome Assessment</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredCreatives.map((c, idx) => (
                <tr key={idx} className="table-row-hover transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      {c.creative_type.includes('Video') ? (
                        <PlaySquare className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      ) : (
                        <Image className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      )}
                      <span>{c.creative_name}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {c.creative_type}
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="text-[11px] text-slate-700 dark:text-slate-300">
                      {c.creative_angle}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <span className="text-[11px] text-slate-600 dark:text-slate-400">
                      {c.campaign}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold">
                      <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        FK: {c.flipkart_clicks?.toLocaleString('en-IN')}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                        AMZ: {c.amazon_clicks?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white text-sm">
                    {c.clicks?.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3 px-3 text-right font-mono font-medium text-slate-600 dark:text-slate-300">
                    {c.share_pct}%
                  </td>

                  <td className="py-3 px-3 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {c.today_clicks?.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    {c.orders_associated}
                  </td>

                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300 text-[11px] max-w-xs">
                    {c.commercial_outcome_rating}
                  </td>

                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                      c.status.includes('PRIMARY') || c.status.includes('CORE')
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/40' 
                        : (c.status.includes('NEW LAUNCH') ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300')
                    }`}>
                      {c.status}
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
