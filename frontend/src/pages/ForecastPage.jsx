import React from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend, LineChart, Line
} from 'recharts';
import { TrendingUp, ShieldCheck, AlertCircle, Info, Calendar, Sparkles } from 'lucide-react';

export default function ForecastPage({ forecastData }) {
  if (!forecastData) {
    return <div className="p-8 text-center text-slate-400">Loading Order Forecasting engine...</div>;
  }

  const { forecast_1d = {}, forecast_3d = {}, forecast_7d = {}, timeline = [], model_metadata = {} } = forecastData;

  const renderIntervalCard = (title, data, badgeColor) => (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title} Horizon
        </span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          data.confidence === 'Medium' 
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' 
            : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
        }`}>
          Confidence: {data.confidence}
        </span>
      </div>

      <div>
        <div className="text-[11px] text-slate-400 font-medium">Estimated Order Range:</div>
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {data.expected_orders_min} – {data.expected_orders_max} <span className="text-base font-semibold text-slate-400">orders</span>
        </div>
      </div>

      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs">
        <span className="text-slate-400 block text-[10px] uppercase font-bold">Expected Gross Revenue Range</span>
        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
          ₹{data.expected_revenue_min?.toLocaleString('en-IN')} – ₹{data.expected_revenue_max?.toLocaleString('en-IN')}
        </span>
      </div>

      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-2">
        {data.rationale}
      </p>
    </div>
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            AI Statistical Order Forecasting
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Poisson Arrival Process calibrated with post-13-Sep order velocity &amp; tracked click volume
          </p>
        </div>
      </div>

      {/* Forecasting Rigor Guardrail Banner */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-950 dark:text-indigo-200 space-y-1">
          <span className="font-bold block uppercase tracking-wider text-[11px]">Scientific Forecasting Rigor Active:</span>
          <p className="leading-relaxed">
            With small historical order sample sizes (&lt;15 verified orders), point predictions ("You will get 3 orders") are statistically invalid.
            The engine outputs <strong>80%–90% prediction intervals</strong> (e.g. <em>3–6 orders</em>) based on calibrated Poisson distribution and post-13-Sep image update velocity (+166% uplift).
          </p>
        </div>
      </div>

      {/* 3 Horizon Interval Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {renderIntervalCard('Next 1 Day', forecast_1d, 'indigo')}
        {renderIntervalCard('Next 3 Days', forecast_3d, 'purple')}
        {renderIntervalCard('Next 7 Days', forecast_7d, 'emerald')}
      </div>

      {/* Historical vs Forecasted Timeline Chart */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Historical Orders vs Projected Prediction Bounds</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Actual daily orders (11–17 Sep) and upcoming projected trajectory (18–20 Sep)</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
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
              <Area type="monotone" dataKey="actual_orders" stroke="#6366f1" strokeWidth={2.5} fill="#6366f1" fillOpacity={0.2} name="Actual Orders" />
              <Area type="monotone" dataKey="forecast_max" stroke="#10b981" strokeDasharray="4 4" fill="url(#colorForecast)" name="Forecast Range (Upper Bound)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
