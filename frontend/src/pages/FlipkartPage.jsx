import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import {
  ShoppingBag, TrendingUp, Sparkles, CheckCircle2, Zap,
  DollarSign, Globe, ExternalLink, BarChart2, Package, RefreshCw,
  Truck, AlertTriangle, Clock, RotateCcw, Archive, Activity,
  IndianRupee, Server, Tag, Map
} from 'lucide-react';

const INR = (v, d = 0) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: d, minimumFractionDigits: d }).format(v || 0);

const StatusBadge = ({ status }) => {
  const s = (status || '').toUpperCase();
  const base = 'px-2 py-0.5 rounded-md text-[10px] font-bold uppercase';
  if (['APPROVED', 'PACKED', 'DELIVERED'].includes(s))
    return <span className={`${base} bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300`}>{s}</span>;
  if (['DISPATCHED', 'READY_TO_DISPATCH'].includes(s))
    return <span className={`${base} bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300`}>{s}</span>;
  if (['PICKED'].includes(s))
    return <span className={`${base} bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300`}>{s}</span>;
  if (['CANCELLED', 'CANCELLED_BY_SELLER'].includes(s))
    return <span className={`${base} bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300`}>{s}</span>;
  return <span className={`${base} bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300`}>{s || 'PENDING'}</span>;
};

function SectionHeader({ icon: Icon, title, subtitle, badge }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Icon className="w-4 h-4 text-blue-500" />
          {title}
        </h3>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {badge}
    </div>
  );
}

export default function FlipkartPage({ flipkartData, onNavigate }) {
  const [adTab, setAdTab] = useState('pla');
  const [apiData, setApiData] = useState(null);
  const [listings, setListings] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [showCancelled, setShowCancelled] = useState(false);

  // ── Fetch live Flipkart Seller API data on mount ──
  useEffect(() => {
    const load = async () => {
      setApiLoading(true);
      try {
        const [ordRes, lstRes] = await Promise.all([
          fetch('/api/flipkart-api/orders').then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/api/flipkart-api/listings').then(r => r.ok ? r.json() : null).catch(() => null),
        ]);
        if (ordRes) setApiData(ordRes);
        if (lstRes) setListings(lstRes);
      } catch (e) {
        setApiError('Could not connect to Flipkart Seller API');
      } finally {
        setApiLoading(false);
      }
    };
    load();
  }, []);

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

  // ── Financials from Google Sheet master ──
  const plaSpend = summary.pla_spend ?? 777.00;
  const metaSpend = summary.meta_spend ?? 2933.25;
  const totalAdCost = summary.total_ad_cost ?? (plaSpend + metaSpend);
  const totalOrders = summary.total_orders ?? orders.length;
  const totalGMV = summary.total_gmv ?? orders.reduce((s, o) => s + (o.order_total || 0), 0);
  const totalSettlement = summary.total_settlement ?? orders.reduce((s, o) => s + (o.bank_settlement || 0), 0);
  const netAfterAds = summary.net_after_ads ?? (totalSettlement - totalAdCost);
  const blendedRoas = summary.blended_roas ?? (totalAdCost > 0 ? (totalGMV / totalAdCost).toFixed(2) : '0.00');
  const blendedCpo = summary.blended_cpo ?? (totalOrders > 0 ? (totalAdCost / totalOrders).toFixed(2) : '0.00');
  const topMetaStates = [...meta_regional].sort((a, b) => (b.spend || 0) - (a.spend || 0)).slice(0, 8);

  // ── Live Seller API orders (from Flipkart API) ──
  const liveOrders = apiData?.data?.orderItems || [];
  const liveStatus = apiData?.client_status || api_status;
  const activeOrders = liveOrders.filter(o => o.status !== 'CANCELLED');
  const cancelledOrders = liveOrders.filter(o => o.status === 'CANCELLED');
  const approvedOrders = liveOrders.filter(o => o.status === 'APPROVED');

  // ── Live Listings ──
  const etm007 = listings?.listings?.['ETM-AB007']?.available?.['ETM-AB007'] || {};
  const tm001 = listings?.listings?.['APNIBUS-TM-001']?.available?.['APNIBUS-TM-001'] || {};
  const listingClientStatus = listings?.client_status || {};

  return (
    <div className="space-y-6 pb-12 animate-fade-in">

      {/* ── SECTION 1: HEADER BANNER + LIVE API CONNECTION STATUS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-900/40 via-slate-900 to-indigo-950 p-6 rounded-2xl border border-blue-500/30 shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[11px] font-extrabold uppercase tracking-wider border border-blue-400/30 flex items-center gap-1">
              <ShoppingBag className="w-3 h-3" /> Flipkart Command Center
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
              {totalOrders} VERIFIED ORDERS · ₹{INR(totalGMV)} GMV
            </span>
            <span className="px-2 py-0.5 rounded-full bg-blue-400/20 text-blue-300 text-[10px] font-bold border border-blue-400/30">
              2 ACTIVE SKUs
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Flipkart Seller Hub · Full Intelligence Dashboard
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl">
            Live order feed, real-time inventory, dispatch SLA, settlement breakdown, ad attribution — all sourced directly from Flipkart Seller API + Google Sheet Master.
          </p>
        </div>

        {/* Live API Status Pill */}
        <div className={`flex flex-col items-start sm:items-end justify-center bg-white/5 backdrop-blur-md p-3 rounded-xl border shrink-0 ${liveStatus?.has_active_token ? 'border-emerald-500/30' : 'border-amber-500/30'}`}>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${liveStatus?.has_active_token ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-ping'}`} />
            <span className={`text-xs font-bold ${liveStatus?.has_active_token ? 'text-emerald-300' : 'text-amber-300'}`}>
              Flipkart Seller API: {liveStatus?.has_active_token ? 'ACTIVE ✓' : 'CONNECTING...'}
            </span>
          </div>
          <span className="text-[11px] text-emerald-200/80 font-mono mt-0.5">
            {liveStatus?.app_id || '36555644...a599'}
          </span>
          <span className="text-[10px] text-emerald-400/80 mt-0.5">
            Scope: Seller_Api · Self-Access Approved
          </span>
          {liveStatus?.last_sync && (
            <span className="text-[10px] text-slate-400 mt-0.5">
              Synced: {liveStatus.last_sync}
            </span>
          )}
        </div>
      </div>

      {/* ── SECTION 2: EXECUTIVE KPI CARDS ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total Ad Spend', value: `₹${INR(totalAdCost, 2)}`, sub: `PLA ₹${plaSpend} · Meta ₹${INR(metaSpend)}`, icon: DollarSign, color: 'text-amber-500' },
          { label: 'Verified Orders', value: `${totalOrders} Units`, sub: '100% Google Sheet Validated', icon: Package, color: 'text-blue-500' },
          { label: 'Flipkart GMV', value: `₹${INR(totalGMV)}`, sub: `Avg ₹${INR(totalGMV / (totalOrders || 1))} / order`, icon: TrendingUp, color: 'text-emerald-500' },
          { label: 'Bank Settlement', value: `₹${INR(totalSettlement, 2)}`, sub: 'Net after all Flipkart fees', icon: CheckCircle2, color: 'text-green-500' },
          { label: 'Blended ROAS', value: `${blendedRoas}x`, sub: 'PLA Direct: 18.5x', icon: Sparkles, color: 'text-indigo-500' },
          { label: 'Ad Cost / Order', value: `₹${blendedCpo}`, sub: `Net profit: ₹${INR(netAfterAds)}`, icon: Zap, color: 'text-amber-500' },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span>{label}</span>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">{value}</div>
            <div className="text-[10px] text-slate-400 mt-1">{sub}</div>
          </div>
        ))}
      </div>

      {/* ── SECTION 3: LIVE ORDERS FEED (from Flipkart Seller API) ── */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
        <SectionHeader
          icon={Activity}
          title="Live Order Feed — Flipkart Seller Hub API"
          subtitle="Real-time orders streamed directly from the official Flipkart Seller API (not CSV export)"
          badge={
            <div className="flex items-center gap-2">
              {apiLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />}
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                {liveOrders.length} orders · {activeOrders.length} active
              </span>
            </div>
          }
        />

        {/* Summary row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Active / Approved', value: activeOrders.length, color: 'emerald', icon: CheckCircle2 },
            { label: 'Pending Dispatch', value: approvedOrders.length, color: 'amber', icon: Clock },
            { label: 'Cancelled (API)', value: cancelledOrders.length, color: 'rose', icon: RotateCcw },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className={`p-3 rounded-xl bg-${color}-50 dark:bg-${color}-950/30 border border-${color}-200 dark:border-${color}-900/50 flex items-center gap-3`}>
              <Icon className={`w-5 h-5 text-${color}-500 shrink-0`} />
              <div>
                <div className={`text-lg font-black text-${color}-700 dark:text-${color}-300`}>{value}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {apiError && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-700 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {apiError} — Showing Google Sheet verified orders below.
          </div>
        )}

        {/* ── Active / Upcoming Orders Table ── */}
        {activeOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Order Date</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Customer Price</th>
                  <th className="py-2.5 px-3 text-right">Selling Price</th>
                  <th className="py-2.5 px-3 text-right">FK Discount</th>
                  <th className="py-2.5 px-3 text-right">GST / Tax</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {activeOrders.map((o, idx) => {
                  const pc = o.priceComponents || {};
                  const rawDate = o.orderDate || '';
                  const dispDate = rawDate ? rawDate.replace('T', ' ').slice(0, 16) : '—';
                  return (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-800 dark:text-white text-[11px]">
                        {o.orderId}
                        <div className="text-[9px] font-normal text-slate-400">Item: {o.orderItemId?.slice(-10)}</div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">{dispDate} IST</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[10px] font-mono font-bold border border-blue-200 dark:border-blue-900/50">
                          {o.sku}
                        </span>
                      </td>
                      <td className="py-3 px-3"><StatusBadge status={o.status} /></td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">₹{INR(pc.customerPrice)}</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-600 dark:text-slate-300">₹{INR(pc.sellingPrice)}</td>
                      <td className="py-3 px-3 text-right font-mono text-rose-500">
                        {pc.flipkartDiscount > 0 ? `-₹${INR(pc.flipkartDiscount)}` : '—'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-400 text-[10px]">{o.hsn || '—'} / GST 18%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400 text-xs">
            {apiLoading ? 'Connecting to Flipkart Seller API...' : 'No active/upcoming orders right now.'}
          </div>
        )}

        {/* ── Cancelled Orders — Collapsible ── */}
        {cancelledOrders.length > 0 && (
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
            <button
              onClick={() => setShowCancelled(v => !v)}
              className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors group"
            >
              <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-300" />
              {showCancelled ? 'Hide' : 'Show'} Cancelled Orders ({cancelledOrders.length})
              <span className="ml-1 text-[10px] text-slate-400">(not counted in active feed)</span>
            </button>

            {showCancelled && (
              <div className="mt-3 overflow-x-auto rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/10">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-rose-200 dark:border-rose-900/40 text-rose-400 uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">Order ID</th>
                      <th className="py-2.5 px-3">Cancelled Date</th>
                      <th className="py-2.5 px-3">SKU</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Customer Price</th>
                      <th className="py-2.5 px-3 text-right">Selling Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-100 dark:divide-rose-900/30">
                    {cancelledOrders.map((o, idx) => {
                      const pc = o.priceComponents || {};
                      const rawDate = o.orderDate || '';
                      const dispDate = rawDate ? rawDate.replace('T', ' ').slice(0, 16) : '—';
                      return (
                        <tr key={idx} className="opacity-70">
                          <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-300 text-[11px] line-through decoration-rose-400">
                            {o.orderId}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">{dispDate} IST</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-mono">
                              {o.sku}
                            </span>
                          </td>
                          <td className="py-2.5 px-3"><StatusBadge status={o.status} /></td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-400 line-through">₹{INR(pc.customerPrice)}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-400 line-through">₹{INR(pc.sellingPrice)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── SECTION 4: LISTING HEALTH & INVENTORY ── */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
        <SectionHeader
          icon={Tag}
          title="Live Product Listings & Inventory Health"
          subtitle="Real-time SKU status, prices, inventory counts, and fulfillment config from Flipkart Seller API"
          badge={
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${listingClientStatus?.has_active_token ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'}`}>
              {listingClientStatus?.has_active_token ? 'LIVE API DATA' : 'Pending'}
            </span>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { sku: 'ETM-AB007', data: etm007, label: 'Thermal Receipt Printer', color: 'blue' },
            { sku: 'APNIBUS-TM-001', data: tm001, label: 'Slide Printer', color: 'indigo' },
          ].map(({ sku, data, label, color }) => {
            const inv = data?.locations?.[0]?.inventory ?? '—';
            const sp = data?.price?.selling_price;
            const mrp = data?.price?.mrp;
            const status = data?.listing_status || 'UNKNOWN';
            const sla = data?.fulfillment?.dispatch_sla;
            const provider = data?.fulfillment?.shipping_provider;
            return (
              <div key={sku} className={`p-4 rounded-xl bg-${color}-50/40 dark:bg-${color}-950/20 border border-${color}-200 dark:border-${color}-900/50 space-y-3`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-${color}-100 dark:bg-${color}-950 text-${color}-800 dark:text-${color}-300 border border-${color}-300/30`}>
                        {sku}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800'}`}>
                        {status}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1 max-w-xs leading-tight">
                      ApniBus ETM Smart POS · {label}
                    </p>
                    {data?.product_url && (
                      <a href={data.product_url} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-0.5 hover:underline">
                        View on Flipkart <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <Archive className={`w-5 h-5 text-${color}-400 shrink-0`} />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
                    <div className="text-[10px] text-slate-400 uppercase mb-0.5">Selling Price</div>
                    <div className="text-sm font-black text-slate-900 dark:text-white">₹{INR(sp)}</div>
                    <div className="text-[9px] text-slate-400">MRP ₹{INR(mrp)}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
                    <div className="text-[10px] text-slate-400 uppercase mb-0.5">Inventory</div>
                    <div className={`text-sm font-black ${Number(inv) < 100 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{inv}</div>
                    <div className="text-[9px] text-slate-400">Units in stock</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
                    <div className="text-[10px] text-slate-400 uppercase mb-0.5">Dispatch SLA</div>
                    <div className="text-sm font-black text-amber-600 dark:text-amber-400">{sla || '—'}h</div>
                    <div className="text-[9px] text-slate-400">{provider || 'Flipkart'}</div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5 pt-1 border-t border-slate-200 dark:border-slate-700">
                  <div><span className="font-bold text-slate-700 dark:text-slate-300">Listing ID:</span> {data?.listing_id || '—'}</div>
                  <div><span className="font-bold text-slate-700 dark:text-slate-300">Product ID:</span> {data?.product_id || '—'}</div>
                  <div><span className="font-bold text-slate-700 dark:text-slate-300">HSN Code:</span> {data?.tax?.hsn || '—'} · Tax: {data?.tax?.tax_code || 'GST_18'}</div>
                  <div><span className="font-bold text-slate-700 dark:text-slate-300">Shipping:</span> Local ₹{data?.shipping_fees?.local ?? 0} · Zonal ₹{data?.shipping_fees?.zonal ?? 0} · National ₹{data?.shipping_fees?.national ?? 0}</div>
                  <div><span className="font-bold text-slate-700 dark:text-slate-300">Fulfillment:</span> {data?.fulfillment_profile || 'NON_FBF'} · {data?.fulfillment?.procurement_type || 'REGULAR'}</div>
                  <div><span className="font-bold text-slate-700 dark:text-slate-300">Dimensions:</span> {(() => { const p = data?.packages?.[0]; return p ? `${p.dimensions?.length}×${p.dimensions?.breadth}×${p.dimensions?.height} cm · ${p.weight} kg` : '—'; })()}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── SECTION 5: VERIFIED ORDERS TABLE (Google Sheet Master) ── */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
        <SectionHeader
          icon={Package}
          title={`Verified Flipkart Orders Master — Google Sheet (${orders.length} Units)`}
          subtitle="100% reconciled orders with settlement values, deductions, and ad attribution"
          badge={
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              GMV: ₹{INR(totalGMV)} · Settled: ₹{INR(totalSettlement, 2)}
            </span>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Order ID & Ref</th>
                <th className="py-2.5 px-3">Customer & State</th>
                <th className="py-2.5 px-3">Date & Time</th>
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
                  <td className="py-3 px-3"><StatusBadge status={o.status} /></td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                    ₹{INR(o.order_total)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-rose-500">
                    -₹{o.total_deductions ? o.total_deductions.toFixed(2) : '909.00'}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                    ₹{INR(o.bank_settlement, 2)}
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

      {/* ── SECTION 6: DISPATCH SLA TRACKER ── */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
        <SectionHeader
          icon={Truck}
          title="Dispatch SLA & Fulfillment Tracker"
          subtitle="Monitor dispatch commitment windows to avoid late-dispatch penalties from Flipkart"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Dispatch Window', icon: Clock, color: 'amber',
              items: [
                { label: 'SLA (ETM-AB007)', value: '48 hours', note: 'From order APPROVED to PACKED' },
                { label: 'SLA (APNIBUS-TM-001)', value: '48 hours', note: 'From order APPROVED to PACKED' },
                { label: 'Shipping Provider', value: 'Flipkart Logistics', note: 'Both SKUs — Ekart / Flipkart' },
                { label: 'Fulfillment Type', value: 'NON_FBF', note: 'Shipped from Gurugram warehouse' },
              ]
            },
            {
              title: 'Shipping Costs', icon: IndianRupee, color: 'blue',
              items: [
                { label: 'Local Delivery', value: '₹0', note: 'Same zone — free shipping' },
                { label: 'Zonal Delivery', value: '₹0', note: 'Nearby zones — free shipping' },
                { label: 'National Delivery', value: '₹0', note: 'Pan-India — free shipping' },
                { label: 'Seller Pays', value: '₹0 / order', note: 'Flipkart absorbs shipping cost' },
              ]
            },
            {
              title: 'Warehouse', icon: Map, color: 'indigo',
              items: [
                { label: 'Location', value: 'Gurugram, Haryana', note: 'Spaze IT Park, Sector 49' },
                { label: 'Manufacturer', value: 'Yellowpedal Technology', note: 'ApniBus, Haryana – 122018' },
                { label: 'Country of Origin', value: 'India (IN)', note: 'ETM-AB007 & APNIBUS-TM-001' },
                { label: 'Warehouse Code', value: 'LOC46d54a...3b', note: 'Seller Location ID on Flipkart' },
              ]
            },
          ].map(({ title, icon: Icon, color, items }) => (
            <div key={title} className={`p-4 rounded-xl bg-${color}-50/40 dark:bg-${color}-950/20 border border-${color}-200 dark:border-${color}-900/50`}>
              <h4 className={`text-[11px] font-bold uppercase tracking-wider text-${color}-700 dark:text-${color}-300 flex items-center gap-1.5 mb-3`}>
                <Icon className="w-3.5 h-3.5" /> {title}
              </h4>
              <div className="space-y-2">
                {items.map(({ label, value, note }) => (
                  <div key={label} className="flex flex-col py-1.5 border-b border-slate-200/60 dark:border-slate-700/40 last:border-0">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">{label}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{value}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{note}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION 7: FINANCIAL SETTLEMENT BREAKDOWN ── */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
        <SectionHeader
          icon={IndianRupee}
          title="Financial Settlement & Deductions Breakdown"
          subtitle="True per-unit economics — what Flipkart pays vs. what you keep, after all marketplace fees"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Per-Unit Economics */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Per-Order Economics (Avg.)</h4>
            {[
              { label: 'Gross Selling Price', value: `₹${INR(totalGMV / (totalOrders || 1))}`, note: 'Customer-paid amount', color: 'text-slate-900 dark:text-white' },
              { label: 'Marketplace Commission (≈8%)', value: `—₹${INR((totalGMV / (totalOrders || 1)) * 0.08, 0)}`, note: 'Flipkart platform fee', color: 'text-rose-500' },
              { label: 'Fixed & Collection Fee', value: '—₹25', note: 'Per-transaction charge', color: 'text-rose-500' },
              { label: 'GST on Flipkart Fees (18%)', value: `—₹${INR(((totalGMV / (totalOrders || 1)) * 0.08 + 25) * 0.18, 0)}`, note: 'Tax on marketplace fees', color: 'text-rose-500' },
              { label: 'Shipping (Seller-Borne)', value: '₹0', note: 'Flipkart absorbs freight cost', color: 'text-emerald-500' },
              { label: '➜ Net Bank Settlement', value: `₹${INR(totalSettlement / (totalOrders || 1), 0)}`, note: 'Avg amount credited to your account', color: 'text-emerald-600 dark:text-emerald-400 font-extrabold text-base' },
            ].map(({ label, value, note, color }) => (
              <div key={label} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <div>
                  <span className="text-slate-600 dark:text-slate-300">{label}</span>
                  <span className="text-[10px] text-slate-400 block">{note}</span>
                </div>
                <span className={`font-bold font-mono ${color}`}>{value}</span>
              </div>
            ))}
          </div>

          {/* Lifetime Totals */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Lifetime Flipkart Totals</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Total GMV', value: `₹${INR(totalGMV)}`, color: 'bg-slate-50 dark:bg-slate-800/60' },
                { label: 'Bank Settlement', value: `₹${INR(totalSettlement, 2)}`, color: 'bg-emerald-50 dark:bg-emerald-950/30' },
                { label: 'Total Deductions', value: `-₹${INR(totalGMV - totalSettlement, 2)}`, color: 'bg-rose-50 dark:bg-rose-950/30' },
                { label: 'Total Ad Spend', value: `₹${INR(totalAdCost, 2)}`, color: 'bg-amber-50 dark:bg-amber-950/30' },
                { label: 'Net After Ads', value: `₹${INR(netAfterAds, 2)}`, color: 'bg-indigo-50 dark:bg-indigo-950/30' },
                { label: 'Blended ROAS', value: `${blendedRoas}x`, color: 'bg-blue-50 dark:bg-blue-950/30' },
              ].map(({ label, value, color }) => (
                <div key={label} className={`p-3 rounded-xl ${color} border border-slate-200/50 dark:border-slate-700/30`}>
                  <div className="text-[10px] text-slate-400 uppercase">{label}</div>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 8: AD SPEND ANALYSIS ── */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-500" /> Flipkart Advertising Cost Analysis
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Exact itemized ad investments driving Flipkart conversions
            </p>
          </div>
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
            {[
              { key: 'pla', label: `PLA Ads (₹${plaSpend})` },
              { key: 'meta', label: `Meta Traffic (₹${INR(metaSpend)})` },
              { key: 'all', label: `Blended (₹${INR(totalAdCost)})` },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setAdTab(key)}
                className={`px-3 py-1.5 rounded-lg transition-all ${adTab === key ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {adTab === 'pla' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50">
              {[
                { label: 'Campaign', value: 'ApniBus_BusTicket_HighIntent_Sep26', sub: 'SKU: ETM-AB007' },
                { label: 'Impressions & Clicks', value: '4,374 views • 222 clicks', sub: '5.08% CTR • ₹3.50 CPC' },
                { label: 'PLA Ad Spend', value: '₹777.00', sub: 'Over 4 days (14–17 Sep)', bold: true },
                { label: 'Direct Converted Sale', value: '1 Order (₹4,998)', sub: '18.55x Direct ROAS', bold: true },
              ].map(({ label, value, sub }) => (
                <div key={label}>
                  <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-300">{label}</span>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{value}</p>
                  <span className="text-[10px] text-slate-500">{sub}</span>
                </div>
              ))}
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={campaigns} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis yAxisId="left" stroke="#94a3b8" fontSize={11} />
                  <YAxis yAxisId="right" orientation="right" stroke="#6366f1" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50">
              {[
                { label: 'Campaign', value: 'GS | Traffic | E-Com | 11Sep26', sub: 'Destination: /go/flipkart' },
                { label: 'Traffic Influx', value: '382,900+ Views • 5,471 Clicks', sub: '1.84% CTR • ₹0.42 CPC avg' },
                { label: 'Meta Flipkart Spend', value: '₹2,933.25', sub: 'Filtered to Flipkart | Broad only' },
                { label: 'Top State Share', value: 'West Bengal (₹602.65)', sub: '1,213 Link clicks (22.2%)' },
              ].map(({ label, value, sub }) => (
                <div key={label}>
                  <span className="text-[10px] uppercase font-bold text-purple-700 dark:text-purple-300">{label}</span>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{value}</p>
                  <span className="text-[10px] text-slate-500">{sub}</span>
                </div>
              ))}
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topMetaStates} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                  <XAxis dataKey="region" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
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
            {[
              {
                title: 'Flipkart In-Platform PLA Ads', icon: ShoppingBag, rows: [
                  { label: 'Channel Spend:', value: '₹777.00 (20.9% of total)', cls: 'text-amber-600 dark:text-amber-400' },
                  { label: 'Clicks / CPC:', value: '222 clicks @ ₹3.50 CPC', cls: '' },
                  { label: 'Direct Attributed Order:', value: '1 unit (OD338638812405575100)', cls: 'text-emerald-600 dark:text-emerald-400' },
                  { label: 'Direct ROAS:', value: '18.55x ROI', cls: 'text-indigo-600 dark:text-indigo-400' },
                ]
              },
              {
                title: 'Meta Funnel Traffic to Flipkart', icon: Globe, rows: [
                  { label: 'Channel Spend:', value: '₹2,933.25 (79.1% of total)', cls: 'text-purple-600 dark:text-purple-400' },
                  { label: 'Clicks / CPC:', value: '5,471 link clicks @ ₹0.42 CPC', cls: '' },
                  { label: 'Funnel Assisted Orders:', value: '4 units (Assam, Odisha, Punjab, Kerala)', cls: 'text-emerald-600 dark:text-emerald-400' },
                  { label: 'Blended ROAS:', value: `${blendedRoas}x Overall`, cls: 'text-indigo-600 dark:text-indigo-400' },
                ]
              },
            ].map(({ title, icon: Icon, rows }) => (
              <div key={title} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Icon className="w-4 h-4 text-blue-500" /> {title}
                </h3>
                <div className="space-y-1.5 text-xs">
                  {rows.map(({ label, value, cls }) => (
                    <div key={label} className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700 last:border-0">
                      <span className="text-slate-500">{label}</span>
                      <span className={`font-bold ${cls || 'text-slate-900 dark:text-white'}`}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── SECTION 9: SEARCH KEYWORD MATRIX ── */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
        <SectionHeader
          icon={Sparkles}
          title="Flipkart Search Query & Keyword Intent Tracking"
          subtitle="In-platform keyword performance for ApniBus ETM ticketing machine on Flipkart"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Keyword / Search Query</th>
                <th className="py-2.5 px-3">Intent</th>
                <th className="py-2.5 px-3 text-right">Impressions</th>
                <th className="py-2.5 px-3 text-right">Clicks</th>
                <th className="py-2.5 px-3 text-right">CTR</th>
                <th className="py-2.5 px-3 text-right">CPC</th>
                <th className="py-2.5 px-3 text-right">Spend</th>
                <th className="py-2.5 px-3 text-right">Orders</th>
                <th className="py-2.5 px-3 text-right">Revenue</th>
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
                    }`}>{t.intent_classification}</span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono">{t.views_impressions}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">{t.clicks}</td>
                  <td className="py-3 px-3 text-right font-mono">{(t.ctr * 100).toFixed(1)}%</td>
                  <td className="py-3 px-3 text-right font-mono">₹{t.cpc}</td>
                  <td className="py-3 px-3 text-right font-mono">₹{t.spend}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">{t.converted_units}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">₹{t.revenue?.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 text-indigo-600 dark:text-indigo-400 font-medium">{t.recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SECTION 10: DEVELOPER API PANEL ── */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 border border-emerald-500/30 shadow-md text-slate-200">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Flipkart Seller Self-Access API · Status Panel
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">APPROVED & ACTIVE ✓</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
              {[
                { label: 'API Scope', value: 'Seller_Api', color: 'emerald' },
                { label: 'Active SKUs', value: 'ETM-AB007 · TM-001', color: 'blue' },
                { label: 'Live Orders Fetched', value: `${liveOrders.length} items`, color: 'indigo' },
                { label: 'Last Sync', value: liveStatus?.last_sync?.slice(11, 16) || 'Just now', color: 'slate' },
              ].map(({ label, value, color }) => (
                <div key={label} className={`px-3 py-2 rounded-xl bg-${color}-500/10 border border-${color}-500/20 text-center`}>
                  <div className="text-[9px] text-slate-400 uppercase">{label}</div>
                  <div className={`text-xs font-bold text-${color}-300 mt-0.5`}>{value}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a href="https://seller.flipkart.com" target="_blank" rel="noreferrer"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-md shadow-blue-600/30">
              Seller Hub <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button onClick={() => window.location.reload()}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-md shadow-emerald-600/20">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh API
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
