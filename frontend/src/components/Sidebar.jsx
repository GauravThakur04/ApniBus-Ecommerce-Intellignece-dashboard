import React from 'react';
import { 
  LayoutDashboard, ShoppingBag, BarChart3, Share2, 
  Layers, MapPin, Clock, Sparkles, Brain, 
  TrendingUp, Activity, History, ChevronRight, Users,
  Compass, ShieldCheck
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'overview', label: '5-Sales Control Room', icon: LayoutDashboard },
  { id: 'sales', label: 'Orders & Revenue', icon: ShoppingBag, badge: '12 ORDERS', badgeColor: 'bg-emerald-600 text-white' },
  { id: 'south', label: 'South India Launch', icon: Compass, badge: '10 AD SETS', badgeColor: 'bg-emerald-600 text-white' },
  { id: 'funnels', label: 'Conversion Funnel', icon: Layers },
  { id: 'hourly', label: 'Live Traffic Control', icon: Clock, badge: 'LIVE', badgeColor: 'bg-green-500 text-white animate-pulse' },
  { id: 'cohort', label: 'Visitor Intelligence', icon: Users },
  { id: 'flipkart', label: 'Flipkart Hub', icon: Layers, badge: '7 ORDERS', badgeColor: 'bg-blue-600 text-white' },
  { id: 'marketing', label: 'Campaign Control', icon: BarChart3 },
  { id: 'regional', label: 'Regional Analytics', icon: MapPin },
  { id: 'creatives', label: 'Creative Intelligence', icon: Sparkles },
  { id: 'quality', label: 'Data Quality Audit', icon: ShieldCheck, badge: '99%', badgeColor: 'bg-emerald-500 text-white' },
  { id: 'advisor', label: 'AI Decision Advisor', icon: Brain },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <aside className="w-56 shrink-0 bg-white/70 dark:bg-[#0E1524]/90 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800/80 p-4 flex flex-col justify-between h-[calc(100vh-61px)] sticky top-[61px] overflow-y-auto">
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6 px-2">
          <img 
            src="/apnibus-logo.jpg" 
            alt="ApniBus" 
            className="w-[28px] h-[28px] rounded-lg object-contain border border-green-500/20"
          />
          <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white uppercase">
            ApniBus
          </span>
        </div>
        
        <nav className="space-y-1">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-green-600 text-white shadow-md shadow-green-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'text-white scale-110' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    item.badgeColor ? item.badgeColor : (isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400')
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Product Footer Card */}
      <div className="pt-4 mt-6 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-slate-100 dark:from-slate-900 dark:to-green-950/40 border border-green-100/80 dark:border-green-900/40 text-left">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400">Target Product</span>
            <span className="text-[11px] font-bold text-slate-900 dark:text-white">₹4,998</span>
          </div>
          <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">ApniBus Smart Bus POS / ETM</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Dedicated Bus Conductor Solution</p>
        </div>
      </div>
    </aside>
  );
}
