import React, { useState, useEffect } from 'react';
import { X, Upload, Link2, CheckCircle2, AlertCircle, RefreshCw, FileText, Sparkles, KeyRound, ShieldCheck } from 'lucide-react';
import { syncUrl, uploadCsvFile, uploadCsvRawText, configureFlipkartApi, fetchFlipkartApiStatus } from '../services/api';

export default function CsvUploadModal({ isOpen, onClose, onRefreshData }) {
  const [tab, setTab] = useState('url'); // 'url', 'file', 'paste', or 'flipkart_api'
  const [sourceType, setSourceType] = useState('orders');
  const [urlInput, setUrlInput] = useState('https://docs.google.com/spreadsheets/d/13mPfzdsTS9sFCVWqslItE9Fb_fNMk5nY_50WsKT4_0U/edit?usp=sharing');
  const [selectedFile, setSelectedFile] = useState(null);
  const [rawCsvText, setRawCsvText] = useState('');
  const [flipkartAppId, setFlipkartAppId] = useState('3655564499145039ab4025262b903691a599');
  const [flipkartAppSecret, setFlipkartAppSecret] = useState('');
  const [flipkartStatus, setFlipkartStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchFlipkartApiStatus()
        .then(res => setFlipkartStatus(res))
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSyncUrl = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      let finalUrl = urlInput.trim();
      if (finalUrl.includes('docs.google.com/spreadsheets/d/')) {
        const match = finalUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
        if (match) {
          const sheetId = match[1];
          const gidMatch = finalUrl.match(/[#&?]gid=([0-9]+)/);
          const gid = gidMatch ? `&gid=${gidMatch[1]}` : '';
          finalUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${gid}`;
        }
      }
      const res = await syncUrl(sourceType, finalUrl);
      setFeedback({ type: 'success', message: `${res.message} (${res.records_ingested} records updated)` });
      onRefreshData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to sync URL' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    setLoading(true);
    setFeedback(null);
    try {
      const res = await uploadCsvFile(sourceType, selectedFile);
      setFeedback({ type: 'success', message: res.message });
      onRefreshData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Upload failed' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasteUpload = async (e) => {
    e.preventDefault();
    if (!rawCsvText.trim()) return;
    setLoading(true);
    setFeedback(null);
    try {
      const res = await uploadCsvRawText(sourceType, rawCsvText);
      setFeedback({ type: 'success', message: `${res.message} (Data reconciled across Main & East Region campaigns)` });
      onRefreshData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Upload failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleConfigureFlipkart = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const res = await configureFlipkartApi(flipkartAppId, flipkartAppSecret);
      if (res.authenticated) {
        setFeedback({ type: 'success', message: 'Successfully connected & authenticated with Flipkart Seller API!' });
      } else {
        setFeedback({ type: 'error', message: res.message || 'Flipkart authentication failed' });
      }
      setFlipkartStatus(res.client_info);
      onRefreshData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to connect Flipkart API' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-green-500" />
              Campaign Data Ingestion Hub
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upload or paste Flipkart Ads, Google Sheet Orders, or Meta reports
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-1">
          <button
            onClick={() => { setTab('paste'); setFeedback(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition ${
              tab === 'paste'
                ? 'bg-white dark:bg-slate-900 text-green-600 dark:text-green-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" /> Paste Raw CSV Text
          </button>
          <button
            onClick={() => { setTab('file'); setFeedback(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition ${
              tab === 'file'
                ? 'bg-white dark:bg-slate-900 text-green-600 dark:text-green-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" /> Direct File Upload
          </button>
          <button
            onClick={() => { setTab('url'); setFeedback(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition ${
              tab === 'url'
                ? 'bg-white dark:bg-slate-900 text-green-600 dark:text-green-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Link2 className="w-4 h-4" /> Live URL Sync
          </button>
          <button
            onClick={() => { setTab('flipkart_api'); setFeedback(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition ${
              tab === 'flipkart_api'
                ? 'bg-white dark:bg-slate-900 text-green-600 dark:text-green-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-4 h-4 text-amber-500" /> Flipkart API
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {/* Target Source Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Select Data Stream Target
            </label>
            <select
              value={sourceType}
              onChange={(e) => {
                setSourceType(e.target.value);
                if (e.target.value === 'tracker') {
                  setUrlInput('https://data.apnibus.com/public/question/8659b871-d41c-41fc-b9b3-8df5a49194cf.csv');
                } else if (e.target.value === 'orders') {
                  setUrlInput('https://docs.google.com/spreadsheets/d/13mPfzdsTS9sFCVWqslItE9Fb_fNMk5nY_50WsKT4_0U/export?format=csv');
                }
              }}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="flipkart_ads">Flipkart Ads Report (Views, Clicks, Spend &amp; High Intent Converted Units)</option>
              <option value="orders">Google Sheet Order Master (Verified Sales)</option>
              <option value="tracker">ApniBus Live Tracker CSV (11,600+ Clicks)</option>
              <option value="amazon_ads">Amazon Ads SP Report (Search Terms / CPC)</option>
              <option value="meta_regional">Meta Ads Regional Report (States &amp; Spend)</option>
            </select>
          </div>

          {sourceType === 'flipkart_ads' && (
            <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900/40 text-[11px] text-green-800 dark:text-green-300">
              💡 <strong>Automated Dual-Campaign Ingestion:</strong> Ingesting this sheet tracks ad spend and converts directly for <strong>GS | Traffic | Flipkart | East Region</strong> (Odisha, WB, Assam) and the <strong>Main E-Com Campaign</strong>.
            </div>
          )}

          {tab === 'paste' && (
            <form onSubmit={handlePasteUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Paste CSV Text from Flipkart / Ad Platform
                </label>
                <textarea
                  rows={6}
                  value={rawCsvText}
                  onChange={(e) => setRawCsvText(e.target.value)}
                  placeholder="Paste Date, Campaign ID, Views, Clicks, Ad Spend, Converted units..."
                  required
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !rawCsvText.trim()}
                className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md shadow-green-600/20 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                <span>Parse &amp; Reconcile Sheet Data</span>
              </button>
            </form>
          )}

          {tab === 'file' && (
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Select Local CSV File
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  required
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 dark:file:bg-green-950 dark:file:text-green-300 hover:file:bg-green-100"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !selectedFile}
                className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md shadow-green-600/20 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span>Upload &amp; Reconcile CSV File</span>
              </button>
            </form>
          )}

          {tab === 'url' && (
            <form onSubmit={handleSyncUrl} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Live HTTP / Google Sheet Export URL
                </label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://... /export?format=csv"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md shadow-green-600/20 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                <span>Fetch &amp; Synchronize URL Stream</span>
              </button>
            </form>
          )}

          {tab === 'flipkart_api' && (
            <form onSubmit={handleConfigureFlipkart} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200">
                  <KeyRound className="w-4 h-4 text-amber-600" />
                  Flipkart Seller Self-Access API Integration
                </div>
                <p className="text-amber-800 dark:text-amber-300 leading-relaxed text-[11px]">
                  Directly connects your dashboard into Flipkart Seller Hub for real-time order notifications, dispatch status, customer pincodes, and exact bank settlement deductions.
                </p>
                {flipkartStatus && (
                  <div className="pt-1.5 border-t border-amber-200/60 dark:border-amber-800/40 flex items-center gap-2 font-mono text-[10px] text-amber-700 dark:text-amber-400">
                    <span className={`w-2 h-2 rounded-full ${flipkartStatus.is_ready ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                    <span>Status: {flipkartStatus.status_message}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Flipkart Application ID (API Key)
                </label>
                <input
                  type="text"
                  value={flipkartAppId}
                  onChange={(e) => setFlipkartAppId(e.target.value)}
                  placeholder="e.g. 3655564499145039ab4025262b903691a599"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Flipkart Application Secret (Secret Key)</span>
                  <span className="text-[10px] text-slate-400 lowercase font-normal">From Flipkart Seller Hub table</span>
                </label>
                <input
                  type="password"
                  value={flipkartAppSecret}
                  onChange={(e) => setFlipkartAppSecret(e.target.value)}
                  placeholder="Paste your Flipkart App Secret here..."
                  required
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !flipkartAppId.trim() || !flipkartAppSecret.trim()}
                className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md shadow-green-600/20 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>Test &amp; Connect Live Flipkart API</span>
              </button>
            </form>
          )}

          {feedback && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}>
              {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{feedback.message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
