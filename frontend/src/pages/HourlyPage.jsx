import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell,
  ComposedChart, Line
} from 'recharts';
import { fetchHourly, fetchHourlyControlRoom } from '../services/api';
import { 
  ClockIcon, TrendingUpIcon, TrendingDownIcon, AlertTriangleIcon, 
  CalendarIcon, CheckCircleIcon, MousePointerIcon, ZapIcon, LayersIcon
} from 'lucide-react';

export default function HourlyPage({ hourlyData: initialData }) {
  const [selectedDate, setSelectedDate] = useState('all');
  const [data, setData] = useState(initialData || null);
  const [controlRoomHourly, setControlRoomHourly] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Selected hour state for the inspector
  const [selectedHour, setSelectedHour] = useState(null);

  useEffect(() => {
    fetchHourlyControlRoom()
      .then(setControlRoomHourly)
      .catch(console.error);
  }, []);

  useEffect(() => {
    // If we have initialData on first render and date is 'all', use it.
    // If date changes, fetch new data.
    const loadData = async () => {
      try {
        setLoading(true);
        const res = await fetchHourly(selectedDate);
        setData(res);
        setSelectedHour(null); // reset hour selection on date change
      } catch (err) {
        console.error(err);
        setError('Failed to fetch hourly data');
      } finally {
        setLoading(false);
      }
    };

    // To prevent immediate refetch if initialData matches the default 'all'
    if (initialData && selectedDate === 'all' && data === initialData) {
        return;
    }

    loadData();
  }, [selectedDate, initialData]);

  // Derived metrics for Live Pulse
  const livePulse = useMemo(() => {
    if (!data) return null;
    
    // Calculate total clicks for the current view
    const totalClicks = data.hourly_timeline?.reduce((acc, curr) => acc + (curr.total_clicks || 0), 0) || 0;
    const fkClicks = data.hourly_timeline?.reduce((acc, curr) => acc + (curr.flipkart_clicks || 0), 0) || 0;
    const amzClicks = data.hourly_timeline?.reduce((acc, curr) => acc + (curr.amazon_clicks || 0), 0) || 0;
    
    const fkPct = totalClicks > 0 ? Math.round((fkClicks / totalClicks) * 100) : 0;
    const amzPct = totalClicks > 0 ? Math.round((amzClicks / totalClicks) * 100) : 0;
    
    // Find vs baseline from daily_variance if a specific date is selected, else average it
    let vsBaseline = null;
    if (selectedDate !== 'all') {
        const dayVar = data.daily_variance?.find(d => d.date === selectedDate);
        if (dayVar) vsBaseline = dayVar.diff_vs_avg_pct;
    } else {
        // Average of all daily variances
        if (data.daily_variance && data.daily_variance.length > 0) {
            const sum = data.daily_variance.reduce((acc, d) => acc + (d.diff_vs_avg_pct || 0), 0);
            vsBaseline = (sum / data.daily_variance.length).toFixed(1);
        }
    }

    return { totalClicks, fkPct, amzPct, vsBaseline };
  }, [data, selectedDate]);

  // Hourly Average for reference line
  const hourlyAvg = useMemo(() => {
    if (!data?.hourly_timeline || data.hourly_timeline.length === 0) return 0;
    const total = data.hourly_timeline.reduce((acc, curr) => acc + (curr.total_clicks || 0), 0);
    return Math.round(total / data.hourly_timeline.length);
  }, [data]);

  const handleBarClick = (data, index) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      setSelectedHour(data.activePayload[0].payload);
    }
  };

  const onDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  if (!data && loading) return <div className="p-8 text-center text-gray-500 font-medium">Loading Hourly Data...</div>;
  if (!data) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      {/* SECTION 1: Top Bar & Live Pulse */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ClockIcon className="w-6 h-6 text-green-600" />
            Live Pulse
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Tracking hourly click velocity and platform breakdown
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex gap-4">
            <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
              <div className="text-xs text-gray-500 uppercase font-semibold">Total Clicks</div>
              <div className="text-lg font-bold text-gray-800">
                {livePulse?.totalClicks?.toLocaleString()}
                {livePulse?.vsBaseline !== null && (
                  <span className={`ml-2 text-sm font-medium ${livePulse.vsBaseline > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {livePulse.vsBaseline > 0 ? '↑' : '↓'} {Math.abs(livePulse.vsBaseline)}% vs avg
                  </span>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
              <div className="text-xs text-gray-500 uppercase font-semibold">Platform Split</div>
              <div className="text-sm font-bold text-gray-800 flex items-center gap-2 mt-1">
                <span className="text-green-600">FK {livePulse?.fkPct}%</span>
                <span className="text-gray-300">|</span>
                <span className="text-amber-500">AMZ {livePulse?.amzPct}%</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CalendarIcon className="h-4 w-4 text-gray-400" />
            </div>
            <select
              value={selectedDate}
              onChange={onDateChange}
              className="pl-9 pr-8 py-2.5 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full font-medium"
            >
              <option value="all">All Dates Overview</option>
              {data.available_dates?.map(date => {
                const isToday = date === data.today_date || (!data.today_date && date === data.available_dates[data.available_dates.length - 1]);
                const dObj = new Date(date + 'T00:00:00');
                const dateFmt = isNaN(dObj.getTime()) ? date : dObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                return (
                  <option key={date} value={date}>
                    {date} {isToday ? `🔥 (Today - ${dateFmt} Live)` : ''}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* ── HOURLY CONTROL ROOM: TODAY VS YESTERDAY VS 7-DAY AVERAGE OVERLAY ── */}
      {controlRoomHourly && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-emerald-500" />
                  Hourly Control Room (00:00 – 23:00 Timeline)
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  LIVE BENCHMARK
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Multi-layer overlay: Today vs Yesterday with 7-Day Average baseline and zero-activity inspection
              </p>
            </div>

            {/* Quick Summary Chips */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                Peak: <strong className="font-mono">{controlRoomHourly.summary?.peak_hour}</strong>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                Current: <strong className="font-mono">{controlRoomHourly.summary?.current_hour}</strong>
              </div>
              {controlRoomHourly.summary?.zero_hours_count > 0 && (
                <div className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs font-semibold">
                  Zero Activity: <strong className="font-mono">{controlRoomHourly.summary?.zero_hours_count}h</strong>
                </div>
              )}
            </div>
          </div>

          {/* Timeline Chart */}
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={controlRoomHourly.timeline || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0]?.payload;
                    return (
                      <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-xl text-xs space-y-1 text-white">
                        <div className="font-bold flex items-center justify-between gap-4">
                          <span>Hour: {label}</span>
                          {d?.is_current_hour && <span className="text-[10px] bg-green-500 px-1.5 py-0.5 rounded text-black font-extrabold">NOW</span>}
                          {d?.is_peak_hour && <span className="text-[10px] bg-emerald-400 px-1.5 py-0.5 rounded text-black font-extrabold">PEAK</span>}
                        </div>
                        <div className="text-emerald-400">Today: <b>{d?.today_events}</b> events</div>
                        <div className="text-blue-300">Yesterday: <b>{d?.yesterday_events}</b> events</div>
                        <div className="text-amber-400">7-Day Average: <b>{d?.avg_7d_events}</b> events</div>
                        {d?.is_zero_activity && (
                          <div className="text-rose-400 text-[10px] font-semibold pt-1 border-t border-slate-800">
                            ⚠️ Zero tracked activity during this hour
                          </div>
                        )}
                      </div>
                    );
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Bar dataKey="today_events" name="Today's Events" fill="#10b981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="yesterday_events" name="Yesterday's Events" fill="#93c5fd" radius={[3, 3, 0, 0]} />
                <Line type="monotone" dataKey="avg_7d_events" name="7-Day Avg Baseline" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* SECTION 2: Hourly Click Velocity Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-800">Hourly Click Velocity</h2>
          <div className="text-sm text-gray-500 flex items-center gap-1">
            <MousePointerIcon className="w-4 h-4" /> Click on a bar to inspect hour details
          </div>
        </div>
        
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.hourly_timeline || []}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              onClick={handleBarClick}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="hour" 
                tickFormatter={(val) => `${String(val).padStart(2, '0')}:00`} 
                axisLine={false}
                tickLine={false}
                tick={{fill: '#6b7280', fontSize: 12}}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{fill: '#6b7280', fontSize: 12}}
              />
              <Tooltip 
                cursor={{fill: '#f3f4f6', opacity: 0.6}}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelFormatter={(label) => `${String(label).padStart(2, '0')}:00 - ${String(label).padStart(2, '0')}:59`}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <ReferenceLine y={hourlyAvg} stroke="#9ca3af" strokeDasharray="3 3" label={{ position: 'top', value: 'Avg', fill: '#9ca3af', fontSize: 12 }} />
              
              <Bar dataKey="flipkart_clicks" name="Flipkart" stackId="a" fill="#22c55e" radius={[0, 0, 4, 4]}>
                {(data.hourly_timeline || []).map((entry, index) => {
                   const isSelected = selectedHour && selectedHour.hour === entry.hour;
                   return <Cell key={`fk-${index}`} fillOpacity={isSelected ? 1 : 0.8} />
                })}
              </Bar>
              <Bar dataKey="amazon_clicks" name="Amazon" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]}>
                 {(data.hourly_timeline || []).map((entry, index) => {
                   const isSelected = selectedHour && selectedHour.hour === entry.hour;
                   return <Cell key={`amz-${index}`} fillOpacity={isSelected ? 1 : 0.8} />
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SECTION 3: Hour Detail Inspector */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col h-full">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-3">Hour Detail Inspector</h2>
          
          {selectedHour ? (
            <div className="space-y-5 flex-1">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 text-center">
                <div className="text-xl font-bold text-gray-800">{selectedHour.time_label}</div>
                <div className="text-sm font-medium text-gray-500 flex justify-center items-center gap-2 mt-1">
                  Status: 
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    selectedHour.hourly_status === 'NORMAL' ? 'bg-gray-200 text-gray-700' : 
                    selectedHour.hourly_status === 'PEAK' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {selectedHour.hourly_status}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                  <div className="text-xs text-gray-500 uppercase">Total</div>
                  <div className="text-lg font-bold text-gray-900">{selectedHour.total_clicks}</div>
                </div>
                <div className="text-center p-3 bg-white border border-green-100 rounded-lg shadow-sm">
                  <div className="text-xs text-gray-500 uppercase">FK</div>
                  <div className="text-lg font-bold text-green-600">{selectedHour.flipkart_clicks}</div>
                </div>
                <div className="text-center p-3 bg-white border border-amber-100 rounded-lg shadow-sm">
                  <div className="text-xs text-gray-500 uppercase">AMZ</div>
                  <div className="text-lg font-bold text-amber-500">{selectedHour.amazon_clicks}</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                <span className="text-sm text-gray-600 font-medium">Vs Hourly Avg</span>
                <span className={`text-sm font-bold ${selectedHour.diff_from_avg_pct > 0 ? 'text-green-600' : selectedHour.diff_from_avg_pct < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                  {selectedHour.diff_from_avg_pct > 0 ? '+' : ''}{selectedHour.diff_from_avg_pct}%
                </span>
              </div>

              {selectedHour.campaigns_breakdown && selectedHour.campaigns_breakdown.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Top Campaigns</h3>
                  <div className="space-y-2">
                    {selectedHour.campaigns_breakdown.slice(0, 3).map((camp, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                        <span className="truncate pr-2 font-medium text-gray-700" title={camp.campaign}>{camp.campaign}</span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="font-bold">{camp.clicks}</span>
                          <span className="text-xs text-gray-400 w-8 text-right">{camp.pct}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedHour.creatives_breakdown && selectedHour.creatives_breakdown.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Top Creatives</h3>
                  <div className="space-y-2">
                    {selectedHour.creatives_breakdown.slice(0, 3).map((cr, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                        <span className="truncate pr-2 font-medium text-gray-700" title={cr.creative}>{cr.creative}</span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="font-bold">{cr.clicks}</span>
                          <span className="text-xs text-gray-400 w-8 text-right">{cr.pct}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-gray-400 min-h-[300px]">
              <MousePointerIcon className="w-12 h-12 mb-3 text-gray-200" />
              <p>Click on an hour bar in the chart</p>
              <p className="text-sm">to view detailed performance</p>
            </div>
          )}
        </div>

        {/* SECTIONS 4 & 5: Right Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* SECTION 5: Lag Diagnostics Alerts */}
          {data.lag_diagnostics && data.lag_diagnostics.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <AlertTriangleIcon className="w-5 h-5 text-amber-500" />
                Where We Are Lagging
              </h2>
              <div className="space-y-3">
                {data.lag_diagnostics.map((diag, idx) => {
                  const severityColors = {
                    CRITICAL: 'border-l-red-500 bg-red-50',
                    HIGH: 'border-l-orange-500 bg-orange-50',
                    MEDIUM: 'border-l-yellow-400 bg-yellow-50',
                  };
                  const colorClass = severityColors[diag.severity] || 'border-l-gray-400 bg-gray-50';
                  
                  return (
                    <div key={idx} className={`p-4 rounded-r-lg border border-l-4 border-t-gray-100 border-r-gray-100 border-b-gray-100 ${colorClass}`}>
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-gray-800">{diag.area}</h3>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                          diag.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' : 
                          diag.severity === 'HIGH' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {diag.severity}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700 mt-2">
                        <span className="font-medium text-gray-900">Issue:</span> {diag.metric}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="font-medium text-gray-900">Action:</span> {diag.remedy}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 4: Daily Traffic vs Baseline */}
          {data.daily_variance && data.daily_variance.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 overflow-hidden">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Daily Traffic vs Baseline</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Total Clicks</th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Baseline Avg</th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">% Diff</th>
                      <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.daily_variance.map((day, idx) => {
                      const isUp = day.diff_vs_avg_pct > 0;
                      return (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {day.date} {day.date === "2026-09-18" ? '🔥' : ''}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-gray-900">{day.total_clicks}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500">{day.daily_avg_baseline}</td>
                          <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-bold ${isUp ? 'text-green-600' : 'text-red-500'}`}>
                            {isUp ? '+' : ''}{day.diff_vs_avg_pct}%
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              day.status.includes('UP') || day.trend === 'UP' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {day.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
