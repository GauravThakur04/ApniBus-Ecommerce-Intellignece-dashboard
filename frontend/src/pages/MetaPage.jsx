import React from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import { Share2, AlertCircle, ShieldCheck, TrendingUp, DollarSign } from 'lucide-react';

export default function MetaPage({ metaData }) {
  if (!metaData) {
    return <div className="p-8 text-center text-slate-400">Loading Meta Intelligence data...</div>;
  }

  const { campaigns = [], regional_spend = [], api_status, summary } = metaData;

  // Aggregate top 10 states by spend
  const topStates = [...regional_spend]
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 10);

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Share2 className="w-5 h-5 text-indigo-600" />
            Meta Advertising Intelligence
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Analysis of Meta Traffic (Amazon/Flipkart Broad) &amp; Regional Lead Gen Delivery
          </p>
        </div>
      </div>

      {/* Meta API Status Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Meta Connection Notice:</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              DIRECT API BLOCKED
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Meta API access is disabled as requested. The dashboard is operating on <strong>reconciled verified CSV exports</strong>.
            All link clicks, CPM, CPC, and regional spend figures represent verified delivery reports without synthetic estimation.
          </p>
        </div>
      </div>

      {/* 1. Regional Meta Spend vs Link Clicks Chart */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Top 10 States by Meta Ad Spend &amp; Link Clicks</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Traffic distribution across Amazon &amp; Flipkart ad sets</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topStates} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
              <XAxis dataKey="region" stroke="#94a3b8" fontSize={10} />
              <YAxis yAxisId="left" stroke="#94a3b8" fontSize={11} />
              <YAxis yAxisId="right" orientation="right" stroke="#6366f1" fontSize={11} />
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
              <Bar yAxisId="left" dataKey="spend" fill="#f59e0b" name="Spend (₹)" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="link_clicks" fill="#6366f1" name="Link Clicks" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Meta Campaigns Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Active Meta Campaigns</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Campaign Name</th>
                <th className="py-2.5 px-3">Delivery</th>
                <th className="py-2.5 px-3 text-right">Spend (₹)</th>
                <th className="py-2.5 px-3 text-right">Impressions</th>
                <th className="py-2.5 px-3 text-right">Reach</th>
                <th className="py-2.5 px-3 text-right">Results / Actions</th>
                <th className="py-2.5 px-3 text-right">Cost / Result (₹)</th>
                <th className="py-2.5 px-3">Status Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {campaigns.map((c, idx) => (
                <tr key={idx} className="table-row-hover transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">{c.campaign}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                      {c.delivery}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900 dark:text-white">
                    ₹{c.spend?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-600 dark:text-slate-300">
                    {c.impressions?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-600 dark:text-slate-300">
                    {c.reach?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {c.results} {c.result_type?.split(':')[1] || ''}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-600 dark:text-slate-300">
                    ₹{c.cost_per_result}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      c.status === 'SCALING CANDIDATE' 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' 
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400'
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
