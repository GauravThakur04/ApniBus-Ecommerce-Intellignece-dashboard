import React, { useState } from 'react';
import { History, Sparkles, Plus, Calendar, ShieldCheck, ArrowRight, TrendingUp } from 'lucide-react';
import { addChangeLog } from '../services/api';

export default function ChangeLogPage({ changesData, onRefresh }) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    marketplace: 'All (Amazon + Flipkart)',
    change_type: 'Listing Image Update',
    description: '',
    before_state: '',
    after_state: '',
    impact_observation: ''
  });
  const [submitting, setSubmitting] = useState(false);

  if (!changesData) {
    return <div className="p-8 text-center text-slate-400">Loading Listing Change Log...</div>;
  }

  const { changes_log = [], statistical_comparison = {} } = changesData;
  const { pre_change = {}, transition = {}, post_change = {}, statistical_note } = statistical_comparison;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addChangeLog(formData);
      setShowModal(false);
      onRefresh();
    } catch (err) {
      alert(err.message || 'Failed to add change log');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            Listing &amp; Business Change Log
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Systematic tracking of listing updates, price shifts, and creative launches to evaluate real commercial impact
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" /> Log New Business Change
        </button>
      </div>

      {/* 13-Sep-2026 Listing Image Update Statistical Analysis */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Featured Analysis: 13-Sep-2026 Marketplace Listing Image Update
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Shifted from generic thermal printer photos to dedicated smart bus ticketing POS / conductor imagery
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
            +166.7% Velocity Uplift
          </span>
        </div>

        {/* 3 Period Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Pre-change */}
          <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-400">PRE-CHANGE PERIOD</span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{pre_change.period}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{pre_change.verified_orders}</span>
              <span className="text-xs text-slate-400">orders (₹{pre_change.gross_revenue?.toLocaleString('en-IN')})</span>
            </div>
            <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Velocity: <strong>{pre_change.daily_order_velocity} orders/day</strong>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
              {pre_change.context}
            </p>
          </div>

          {/* Transition */}
          <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2 opacity-80">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-amber-500">TRANSITION WINDOW</span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{transition.period}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-500">{transition.verified_orders}</span>
              <span className="text-xs text-slate-400">orders</span>
            </div>
            <div className="text-xs font-medium text-slate-500">
              Index update propagation
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
              {transition.context}
            </p>
          </div>

          {/* Post-change */}
          <div className="p-4 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">POST-CHANGE PERIOD</span>
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">{post_change.period}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{post_change.verified_orders}</span>
              <span className="text-xs text-emerald-700 dark:text-emerald-300">orders (₹{post_change.gross_revenue?.toLocaleString('en-IN')})</span>
            </div>
            <div className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
              Velocity: <strong>{post_change.daily_order_velocity} orders/day ({post_change.velocity_uplift})</strong>
            </div>
            <p className="text-[11px] text-emerald-900/80 dark:text-emerald-300/80 pt-1 border-t border-emerald-200/50 dark:border-emerald-800/50">
              {post_change.context}
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 italic">
          {statistical_note}
        </p>
      </div>

      {/* Historical Change Log Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Historical Business Change Registry</h3>
        <div className="space-y-3">
          {changes_log.map((ch, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">{ch.date}</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{ch.change_type}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {ch.marketplace}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300">{ch.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] pt-2 border-t border-slate-200/50 dark:border-slate-700/50 text-slate-600 dark:text-slate-400">
                <div><strong>Before:</strong> {ch.before_state}</div>
                <div><strong>After:</strong> {ch.after_state}</div>
              </div>
              {ch.impact_observation && (
                <div className="p-2.5 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 text-xs text-indigo-900 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/30">
                  <strong>Observed Commercial Impact:</strong> {ch.impact_observation}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Manual Change Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Log Listing or Business Change</h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Marketplace</label>
                <input
                  type="text"
                  value={formData.marketplace}
                  onChange={(e) => setFormData({ ...formData, marketplace: e.target.value })}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Change Type</label>
                <input
                  type="text"
                  value={formData.change_type}
                  onChange={(e) => setFormData({ ...formData, change_type: e.target.value })}
                  placeholder="e.g., Image Update, Title Update, Price Change"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What was changed?"
                  required
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Before State</label>
                  <input
                    type="text"
                    value={formData.before_state}
                    onChange={(e) => setFormData({ ...formData, before_state: e.target.value })}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">After State</label>
                  <input
                    type="text"
                    value={formData.after_state}
                    onChange={(e) => setFormData({ ...formData, after_state: e.target.value })}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Change Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
