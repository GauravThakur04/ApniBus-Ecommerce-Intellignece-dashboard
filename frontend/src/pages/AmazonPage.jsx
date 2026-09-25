import React from 'react';
import { ShoppingBag, Search, AlertTriangle, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export default function AmazonPage({ amazonData }) {
  if (!amazonData) {
    return <div className="p-8 text-center text-slate-400">Loading Amazon Ads analytics...</div>;
  }

  const { campaigns = [], search_terms = [], recommendations = [] } = amazonData;
  const camp = campaigns[0] || {};

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-500" />
            Amazon Advertising &amp; Search Terms
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sponsored Products performance on ASIN B0HD7MSZXL (Dynamic Bidding Down Only)
          </p>
        </div>
      </div>

      {/* Campaign Summary Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Active SP Campaign</span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{camp.campaign || 'ApniBus_BusTicket_HighIntent_Sep26'}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
              Status: {camp.status || 'Delivering'}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Top of Search Share: {camp.top_of_search_share || '26.7%'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Impressions</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">{camp.impressions || 126}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Clicks</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">{camp.clicks || 23}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">CTR</span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{camp.ctr ? (camp.ctr * 100).toFixed(2) : '18.25'}%</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Avg CPC</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">₹{camp.cpc || '4.50'}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Spend</span>
            <span className="text-lg font-bold text-amber-600 dark:text-amber-400">₹{camp.spend || '103.45'}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Detail Views</span>
            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{camp.detail_page_views || 18}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Add to Cart</span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{camp.add_to_cart || 3}</span>
          </div>
        </div>
      </div>

      {/* High Intent Search Terms Matrix */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Amazon Search Terms Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Search Term / Keyword</th>
                <th className="py-2.5 px-3">Intent Classification</th>
                <th className="py-2.5 px-3 text-right">Impressions</th>
                <th className="py-2.5 px-3 text-right">Clicks</th>
                <th className="py-2.5 px-3 text-right">CTR (%)</th>
                <th className="py-2.5 px-3 text-right">CPC (₹)</th>
                <th className="py-2.5 px-3 text-right">Spend (₹)</th>
                <th className="py-2.5 px-3">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {search_terms.map((t, idx) => (
                <tr key={idx} className="table-row-hover transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white font-mono">{t.keyword}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      t.intent_classification === 'High Intent'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {t.intent_classification}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono">{t.views_impressions}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold">{t.clicks}</td>
                  <td className="py-3 px-3 text-right font-mono">{(t.ctr * 100).toFixed(1)}%</td>
                  <td className="py-3 px-3 text-right font-mono">₹{t.cpc}</td>
                  <td className="py-3 px-3 text-right font-mono">₹{t.spend}</td>
                  <td className="py-3 px-3 font-semibold text-indigo-600 dark:text-indigo-400">
                    {t.recommendation}
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
