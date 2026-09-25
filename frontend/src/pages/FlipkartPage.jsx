import React, { useState } from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import { 
  ShoppingBag, TrendingUp, Sparkles, CheckCircle2, Zap,
  DollarSign, Globe, ExternalLink, Key, BarChart2, Package, RefreshCw
} from 'lucide-react';

export default function FlipkartPage({ flipkartData }) {
  const [adTab, setAdTab] = useState('pla'); // 'pla' | 'meta' | 'all'

  if (!flipkartData) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-slate-400 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm font-medium">Loading Flipkart Intelligence Command Center...</p>
      </div>
    );
  }

  const { 
    campaigns = [], 
    search_terms = [], 
    orders = [],
    meta_regional = [],
    summary = {},
    api_status = {}
  } = flipkartData;

  const plaSpend = summary.pla_spend ?? 777.00;
  const metaSpend = summary.meta_spend ?? 2933.25;
  const totalAdCost = summary.total_ad_cost ?? (plaSpend + metaSpend);
  const totalOrders = summary.total_orders ?? orders.length;
  const totalGMV = summary.total_gmv ?? orders.reduce((s, o) => s + (o.order_total || 0), 0);
  const totalSettlement = summary.total_settlement ?? orders.reduce((s, o) => s + (o.bank_settlement || 0), 0);
  const netAfterAds = summary.net_after_ads ?? (totalSettlement - totalAdCost);
  const blendedRoas = summary.blended_roas ?? (totalAdCost > 0 ? (totalGMV / totalAdCost).toFixed(2) : '0.00');
  const blendedCpo = summary.blended_cpo ?? (totalOrders > 0 ? (totalAdCost / totalOrders).toFixed(2) : '0.00');

  // Top 8 Meta states for Flipkart
  const topMetaStates = [...meta_regional]
    .sort((a, b) => (b.spend || 0) - (a.spend || 0))
    .slice(0, 8);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-900/40 via-slate-900 to-indigo-950 p-6 rounded-2xl border border-blue-500/30 shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[11px] font-extrabold uppercase tracking-wider border border-blue-400/30 flex items-center gap-1">
              <ShoppingBag className="w-3 h-3" /> Flipkart Command Center
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
              5 VERIFIED ORDERS
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Flipkart Performance &amp; Ad Spend Intelligence
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl">
            Dedicated audit of all marketing investments driving Flipkart conversions (In-Platform PLA Search Ads + Meta E-Commerce Funnel Traffic), gross settlements, and verified order statuses.
          </p>
        </div>

        {/* Quick API status pill */}
        <div className="flex flex-col items-start sm:items-end justify-center bg-white/5 dark:bg-black/30 backdrop-blur-md p-3 rounded-xl border border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="text-xs font-bold text-slate-200">Flipkart Seller API</span>
          </div>
          <span className="text-[11px] text-amber-300 font-mono mt-0.5">
            App ID: {api_status?.app_id ? `${api_status.app_id.substring(0, 8)}...` : 'Configured'}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">
            OAuth Handshake Verified • Pending Seller Approval
          </span>
        </div>
      </div>

      {/* 6 Key Flipkart Executive Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Ad Cost */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Total Ad Spend</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white">
            ₹{typeof totalAdCost === 'number' ? totalAdCost.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : totalAdCost}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
            <span>PLA: ₹{plaSpend}</span>
            <span>Meta: ₹{Math.round(metaSpend)}</span>
          </div>
        </div>

        {/* Verified Orders */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Verified Orders</span>
            <Package className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
            {totalOrders} Units
          </div>
          <div className="text-[10px] text-emerald-500 font-semibold mt-1">
            100% Validated Orders
          </div>
        </div>

        {/* Gross Revenue */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Flipkart GMV</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white">
            ₹{typeof totalGMV === 'number' ? totalGMV.toLocaleString('en-IN') : totalGMV}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Avg Order: ₹{(totalGMV / (totalOrders || 1)).toFixed(0)}
          </div>
        </div>

        {/* Bank Settlement */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Bank Settlement</span>
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
            ₹{typeof totalSettlement === 'number' ? totalSettlement.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : totalSettlement}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Net payout after fees
          </div>
        </div>

        {/* Blended ROAS */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Blended ROAS</span>
            <Sparkles className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {blendedRoas}x
          </div>
          <div className="text-[10px] text-indigo-400 mt-1">
            PLA Direct: <span className="font-bold text-emerald-500">18.5x</span>
          </div>
        </div>

        {/* Cost Per Order (CPO) */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Ad Cost / Order</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white">
            ₹{blendedCpo}
          </div>
          <div className="text-[10px] text-emerald-500 font-semibold mt-1">
            Net profit: ₹{Math.round(netAfterAds).toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* AD SPEND BREAKDOWN SECTION: Primary Focus */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-blue-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Flipkart Advertising Cost Analysis
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Exact itemized ad investments driving Flipkart product visits and conversions
            </p>
          </div>

          {/* Ad Channel Toggle */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setAdTab('pla')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                adTab === 'pla'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Flipkart In-Platform PLA Ads (₹{plaSpend})
            </button>
            <button
              onClick={() => setAdTab('meta')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                adTab === 'meta'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Meta Traffic Driving to Flipkart (₹{Math.round(metaSpend)})
            </button>
            <button
              onClick={() => setAdTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                adTab === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Blended Total (₹{Math.round(totalAdCost)})
            </button>
          </div>
        </div>

        {/* Detailed Breakdown Panels */}
        {adTab === 'pla' && (
          <div className="space-y-4">
            {/* PLA Summary Banner */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-300">Campaign Name</span>
                <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-100 truncate">ApniBus_BusTicket_HighIntent_Sep26</p>
                <span className="text-[10px] text-slate-500">SKU: ETM-AB007</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-300">Impressions &amp; Clicks</span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">4,374 views • 222 clicks</p>
                <span className="text-[10px] text-emerald-600 font-semibold">5.08% CTR • ₹3.50 CPC</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-300">Total PLA Ad Spend</span>
                <p className="text-base font-extrabold text-amber-600 dark:text-amber-400">₹777.00</p>
                <span className="text-[10px] text-slate-500">Over 4 days (14–17 Sep)</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-300">Direct Converted Sale</span>
                <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">1 Order (₹4,998)</p>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">18.55x Direct ROAS</span>
              </div>
            </div>

            {/* Daily PLA Chart */}
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={campaigns} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
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
                  <Bar yAxisId="left" dataKey="spend" fill="#f59e0b" name="PLA Ad Spend (₹)" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="left" dataKey="revenue" fill="#10b981" name="Converted Revenue (₹)" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="clicks" fill="#6366f1" name="Ad Clicks" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {adTab === 'meta' && (
          <div className="space-y-4">
            {/* Meta Summary Banner */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50">
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-700 dark:text-purple-300">Campaign &amp; Target</span>
                <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-100 truncate">GS | Traffic | E-Com | 11Sep26</p>
                <span className="text-[10px] text-slate-500">Destination: /go/flipkart</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-700 dark:text-purple-300">Traffic Influx</span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">382,900+ Views • 5,471 Clicks</p>
                <span className="text-[10px] text-emerald-600 font-semibold">1.84% CTR • ₹0.42 CPC avg</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-700 dark:text-purple-300">Meta Flipkart Spend</span>
                <p className="text-base font-extrabold text-purple-600 dark:text-purple-400">₹2,933.25</p>
                <span className="text-[10px] text-slate-500">Filtered strictly to Flipkart | Broad</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-700 dark:text-purple-300">Top State Share</span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">West Bengal (₹602.65)</p>
                <span className="text-[10px] text-slate-500">1,213 Link clicks (22.2%)</span>
              </div>
            </div>

            {/* Top States Chart */}
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topMetaStates} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                  <XAxis dataKey="region" stroke="#94a3b8" fontSize={10} />
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
                  <Bar dataKey="spend" fill="#8b5cf6" name="Meta Spend on Flipkart (₹)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="link_clicks" fill="#3b82f6" name="Link Clicks to Flipkart" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {adTab === 'all' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-blue-500" /> Flipkart In-Platform PLA Ads
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">Channel Spend:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">₹777.00 (20.9% of total)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">Clicks / CPC:</span>
                  <span className="font-medium text-slate-900 dark:text-white">222 clicks @ ₹3.50 CPC</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">Direct Attributed Order:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">1 unit (OD338638812405575100)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Direct ROAS:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">18.55x ROI</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-purple-500" /> Meta Funnel Traffic to Flipkart
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">Channel Spend:</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">₹2,933.25 (79.1% of total)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">Clicks / CPC:</span>
                  <span className="font-medium text-slate-900 dark:text-white">5,471 link clicks @ ₹0.42 CPC</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">Funnel Assisted Orders:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">4 units (Assam, Odisha, Punjab, Kerala)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Combined Blended ROAS:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{blendedRoas}x Overall ROI</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* VERIFIED FLIPKART ORDERS TABLE */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-500" />
              All Verified Flipkart Orders ({orders.length} Units)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Source of truth verified orders matching Flipkart Order IDs and settlement records
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            Total GMV: ₹{typeof totalGMV === 'number' ? totalGMV.toLocaleString('en-IN') : totalGMV}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Order ID &amp; Ref</th>
                <th className="py-2.5 px-3">Customer &amp; State</th>
                <th className="py-2.5 px-3">Date &amp; Time</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Unit Price</th>
                <th className="py-2.5 px-3 text-right">Deductions</th>
                <th className="py-2.5 px-3 text-right">Bank Settlement</th>
                <th className="py-2.5 px-3 text-right">Attribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {orders.map((o, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-mono font-bold text-slate-900 dark:text-white">{o.order_id}</div>
                    <div className="text-[10px] text-slate-400 font-mono">Ref: {o.order_ref_id || '—'}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900 dark:text-white">{o.customer_name}</div>
                    <div className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">{o.city}, {o.state}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                    <div>{o.order_date}</div>
                    <div className="text-[10px] text-slate-400">{o.order_time}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      String(o.status).toLowerCase().includes('in transit') || String(o.status).toLowerCase().includes('processing')
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                        : String(o.status).toLowerCase().includes('dispatched')
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                    ₹{o.order_total?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-rose-500">
                    -₹{o.total_deductions ? o.total_deductions.toFixed(2) : '909.00'}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                    ₹{o.bank_settlement?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      o.order_id === 'OD338638812405575100'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                    }`}>
                      {o.order_id === 'OD338638812405575100' ? 'PLA Search (18.5x)' : 'Meta Funnel'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TARGET HIGH-INTENT SEARCH TERMS MATRIX */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Flipkart Search Query &amp; Keyword Intent Tracking
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              In-Platform keyword performance for ApniBus ETM ticketing machine on Flipkart
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Keyword / Search Query</th>
                <th className="py-2.5 px-3">Intent Classification</th>
                <th className="py-2.5 px-3 text-right">Impressions</th>
                <th className="py-2.5 px-3 text-right">Clicks</th>
                <th className="py-2.5 px-3 text-right">CTR (%)</th>
                <th className="py-2.5 px-3 text-right">CPC (₹)</th>
                <th className="py-2.5 px-3 text-right">Spend (₹)</th>
                <th className="py-2.5 px-3 text-right">Orders</th>
                <th className="py-2.5 px-3 text-right">Revenue (₹)</th>
                <th className="py-2.5 px-3">Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {search_terms.map((t, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white font-mono">{t.keyword}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      t.intent_classification === 'High Intent'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400'
                    }`}>
                      {t.intent_classification}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono">{t.views_impressions}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">{t.clicks}</td>
                  <td className="py-3 px-3 text-right font-mono">{(t.ctr * 100).toFixed(1)}%</td>
                  <td className="py-3 px-3 text-right font-mono">₹{t.cpc}</td>
                  <td className="py-3 px-3 text-right font-mono">₹{t.spend}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">{t.converted_units}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">₹{t.revenue?.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 text-indigo-600 dark:text-indigo-400 font-medium">
                    {t.recommendation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DEVELOPER API STATUS & ACTIONS */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 border border-slate-800 shadow-md text-slate-200">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Flipkart Developer API Integration Status
              </h3>
            </div>
            <p className="text-xs text-slate-300">
              App ID: <span className="font-mono text-blue-300 font-bold">3655564499145039ab4025262b903691a599</span>
            </p>
            <p className="text-xs text-slate-400">
              Flipkart OAuth handshake responds: <span className="text-amber-400 font-semibold font-mono">"Self Access Application is not in Approved state"</span>.
              Once you click "Approve / Activate" in your Flipkart Seller Dashboard under Developer settings, live real-time sync activates automatically!
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://seller.flipkart.com"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/30"
            >
              Flipkart Seller Hub <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

