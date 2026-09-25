import React from 'react';
import { 
  RefreshCw, Sun, Moon, Database, ShieldCheck, Filter, ChevronDown, Calendar, Layers
} from 'lucide-react';

export default function Header({ 
  filters, 
  setFilters, 
  onRefresh, 
  isRefreshing, 
  darkMode, 
  setDarkMode, 
  lastUpdated,
  dataThrough,
  onOpenUploadModal,
  activeTab,
  setActiveTab
}) {
  return (
    <header className="sticky top-0 z-30 card-glass border-b border-slate-200/80 dark:border-slate-800/80 px-6 py-3 flex flex-wrap items-center justify-between gap-4 bg-white/80 dark:bg-[#0E1524]/90 backdrop-blur-xl shadow-sm">
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-3">
        <img 
          src="/apnibus-logo.jpg" 
          alt="ApniBus Logo" 
          className="w-9 h-9 rounded-xl object-contain shadow-sm border border-green-500/20"
        />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white uppercase flex items-center gap-1.5">
              ApniBus
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300/40 dark:border-emerald-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
              Live Sync
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
            5-Sales Control Tower
          </p>
        </div>
      </div>

      {/* Global Controls & Filters */}
      <div className="flex items-center flex-wrap gap-2.5">
        {/* Marketplace Selector */}
        <div className="relative">
          <select
            value={filters.marketplace}
            onChange={(e) => setFilters({ ...filters, marketplace: e.target.value })}
            className="appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 pr-8 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer shadow-sm"
          >
            <option value="all">All Marketplaces (Amazon + Flipkart)</option>
            <option value="flipkart">Flipkart Only</option>
            <option value="amazon">Amazon Only</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {/* Date Presets */}
        <div className="relative">
          <select
            value={filters.datePreset}
            onChange={(e) => setFilters({ ...filters, datePreset: e.target.value })}
            className="appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 pr-8 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer shadow-sm"
          >
            <option value="all">All Available History</option>
            <option value="post_change">Post-Listing Update (14-Sep Onward)</option>
            <option value="last7d">Last 7 Days (14-20 Sep)</option>
            <option value="pre_change">Pre-Listing Update (&lt;13 Sep)</option>
          </select>
          <Calendar className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {/* Import CSV Button */}
        <button
          onClick={onOpenUploadModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 dark:bg-green-950/50 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/80 rounded-lg text-xs font-medium transition shadow-sm"
          title="Direct CSV Upload & URL Ingestion"
        >
          <Database className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Sync / Upload</span>
        </button>

        {/* Refresh, Sync Freshness & Timestamps */}
        <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-2.5 ml-1">
          <div className="flex flex-col text-right">
            <div className="flex items-center justify-end gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Fresh < 5 min"></span>
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">
                LAST UPDATED: {lastUpdated}
              </span>
            </div>
            {dataThrough && (
              <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500">
                DATA THROUGH: {dataThrough}
              </span>
            )}
          </div>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition shadow-sm ${isRefreshing ? 'opacity-70' : ''}`}
            title="Refresh All Data Streams (Auto-polls every 60s)"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-green-500' : ''}`} />
          </button>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition shadow-sm ml-1"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>
      </div>
    </header>
  );
}
