
import React, { useMemo } from 'react';
import { Station, Language, TRANSLATIONS, AlertLevel } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { StatusBadge, Button, MetricCard } from './Shared';
import { Download, Sliders, RefreshCw, Battery, Sun, Wifi, Activity, Clock, AlertTriangle } from 'lucide-react';

interface TechnicalViewProps {
  stations: Station[];
  lang: Language;
  onRefresh: () => void;
  darkMode?: boolean;
}

const TechnicalView: React.FC<TechnicalViewProps> = ({ stations, lang, onRefresh, darkMode = true }) => {
  const t = TRANSLATIONS[lang];
  const [selectedStationId, setSelectedStationId] = React.useState<string>(stations[0]?.id);
  const [activeTab, setActiveTab] = React.useState<'overview' | 'power' | 'logs'>('overview');
  const [timeRange, setTimeRange] = React.useState<'12h' | '24h' | '7d'>('24h');

  const selectedStation = stations.find(s => s.id === selectedStationId) || stations[0];

  // FILTER LOGIC: Slice history based on timeRange
  const filteredHistory = useMemo(() => {
    const now = Date.now();
    let msToSubtract = 24 * 60 * 60 * 1000;
    
    if (timeRange === '12h') msToSubtract = 12 * 60 * 60 * 1000;
    if (timeRange === '7d') msToSubtract = 7 * 24 * 60 * 60 * 1000;

    const cutoffTime = now - msToSubtract;
    
    return selectedStation.history.filter(reading => {
      const readingTime = new Date(reading.timestamp).getTime();
      return readingTime >= cutoffTime;
    });
  }, [selectedStation, timeRange]);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredHistory, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `pluvia_export_${selectedStation.id}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight uppercase flex items-center gap-2">
            <Activity className="w-6 h-6 text-brand-neon" />
            {t.technicalMode}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
             {selectedStation.name} • {selectedStation.id}
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3 ml-auto">
          <Button variant="secondary" onClick={handleExport} className="hidden sm:flex items-center gap-2">
            <Download className="w-4 h-4" />
            {t.exportData}
          </Button>
          <Button variant="secondary" className="hidden sm:flex items-center gap-2">
            <Sliders className="w-4 h-4" />
            {t.settings}
          </Button>
          <Button variant="primary" onClick={onRefresh} className="w-10 h-10 p-0 rounded-full flex items-center justify-center shadow-lg shadow-brand-neon/20">
            <RefreshCw className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-white dark:bg-[#0F0818]/50 border border-slate-200 dark:border-[#2A1A3F] rounded-xl overflow-x-auto hide-scrollbar">
        {[
          { id: 'overview', label: t.tabOverview, icon: <Activity className="w-4 h-4" /> },
          { id: 'power', label: t.tabPower, icon: <Battery className="w-4 h-4" /> },
          { id: 'logs', label: t.tabLogs, icon: <Clock className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-slate-900 dark:bg-brand-neon text-white shadow-md'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* --- OVERVIEW TAB --- */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <MetricCard label={t.waterLevel} value={selectedStation.lastReading.waterLevel} unit="cm" icon={<Activity className="w-5 h-5" />} />
             <MetricCard label={t.rainfall} value={selectedStation.lastReading.rainfall.toFixed(1)} unit="mm/h" icon={<Activity className="w-5 h-5" />} />
             <MetricCard label={t.signal} value={selectedStation.lastReading.signalStrength} unit="dBm" icon={<Wifi className="w-5 h-5" />} />
             <MetricCard label={t.voltage} value={selectedStation.lastReading.batteryVoltage.toFixed(2)} unit="V" icon={<Battery className="w-5 h-5" />} />
          </div>

          {/* Hydrology Chart */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-[#2A1A3F]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
               <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 font-display">
                 <Activity className="w-5 h-5 text-brand-neon" />
                 {t.hydrologyChart}
               </h3>
               
               <div className="flex bg-slate-100 dark:bg-[#1A1025] p-1 rounded-lg">
                 {['12h', '24h', '7d'].map((range) => (
                   <button
                     key={range}
                     onClick={() => setTimeRange(range as any)}
                     className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                       timeRange === range
                       ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                       : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                     }`}
                   >
                     {range}
                   </button>
                 ))}
               </div>
            </div>
            
            <div className="h-[350px] w-full min-w-0">
               <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={1}>
                 <AreaChart data={filteredHistory}>
                    <defs>
                      <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorRain" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D500F9" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#D500F9" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#2A1A3F" : "#e2e8f0"} vertical={false} />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(ts) => {
                        const date = new Date(ts);
                        return timeRange === '7d' 
                          ? date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' })
                          : date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
                      }}
                      stroke={darkMode ? "#64748b" : "#94a3b8"} 
                      fontSize={10} 
                      tickLine={false}
                      axisLine={false}
                      minTickGap={30}
                    />
                    <YAxis stroke={darkMode ? "#64748b" : "#94a3b8"} fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: darkMode ? "rgba(15, 8, 24, 0.9)" : "rgba(255, 255, 255, 0.9)",
                        border: darkMode ? "1px solid #2A1A3F" : "1px solid #e2e8f0",
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: darkMode ? '#fff' : '#000'
                      }}
                      labelFormatter={(label) => new Date(label).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
                    />
                    <Legend iconType="circle" />
                    <ReferenceLine y={selectedStation.thresholds.warning} stroke="var(--status-warning)" strokeDasharray="3 3" />
                    <ReferenceLine y={selectedStation.thresholds.critical} stroke="var(--status-danger)" strokeDasharray="3 3" />
                    
                    <Area type="monotone" dataKey="waterLevel" name={t.waterLevel} stroke="#3b82f6" fillOpacity={1} fill="url(#colorLevel)" />
                    <Area type="monotone" dataKey="rainfall" name={t.rainfall} stroke="#D500F9" fillOpacity={1} fill="url(#colorRain)" />
                 </AreaChart>
               </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* --- POWER TAB --- */}
      {activeTab === 'power' && (
        <div className="space-y-6">
           {selectedStation.lastReading.battery < 20 && (
             <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-center gap-4 animate-pulse">
                <div className="bg-red-500 text-white p-2 rounded-full">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-red-500 font-bold font-display uppercase tracking-wider text-sm">{t.batteryLowTitle}</h4>
                  <p className="text-red-400 text-xs">{t.batteryLowDesc}</p>
                </div>
             </div>
           )}

           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <MetricCard label={t.battery} value={selectedStation.lastReading.battery.toFixed(0)} unit="%" icon={<Battery className="w-5 h-5" />} isCritical={selectedStation.lastReading.battery < 20} />
             <MetricCard label={t.solarInput} value={selectedStation.lastReading.solarVoltage.toFixed(2)} unit="V" icon={<Sun className="w-5 h-5" />} />
             <MetricCard label={t.estRuntime} value="~48h" unit="" icon={<Clock className="w-5 h-5" />} />
           </div>

           <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-[#2A1A3F]">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6 font-display">
                 <Battery className="w-5 h-5 text-green-500" />
                 {t.powerChart}
              </h3>
              <div className="h-[300px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={1}>
                  <AreaChart data={filteredHistory}>
                    <defs>
                      <linearGradient id="colorBat" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#2A1A3F" : "#e2e8f0"} vertical={false} />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(ts) => new Date(ts).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit', timeZone: 'America/Sao_Paulo'})}
                      stroke={darkMode ? "#64748b" : "#94a3b8"} 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      minTickGap={30}
                    />
                    <YAxis stroke={darkMode ? "#64748b" : "#94a3b8"} fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: darkMode ? "rgba(15, 8, 24, 0.9)" : "rgba(255, 255, 255, 0.9)",
                        border: darkMode ? "1px solid #2A1A3F" : "1px solid #e2e8f0",
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: darkMode ? '#fff' : '#000'
                      }}
                    />
                    <Legend iconType="circle" />
                    <Area type="step" dataKey="battery" name={t.battery} stroke="#22c55e" fill="url(#colorBat)" />
                    <Area type="monotone" dataKey="solarVoltage" name={t.solar} stroke="#f59e0b" fill="url(#colorSolar)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </div>
        </div>
      )}

      {/* --- LOGS TAB --- */}
      {activeTab === 'logs' && (
         <div className="glass-panel rounded-2xl border border-slate-200 dark:border-[#2A1A3F] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-slate-100 dark:bg-[#1A1025] text-slate-500 dark:text-slate-400 font-display">
                  <tr>
                    <th className="px-6 py-4">{t.colTimestamp}</th>
                    <th className="px-6 py-4">{t.colLevel}</th>
                    <th className="px-6 py-4">{t.colRain}</th>
                    <th className="px-6 py-4">{t.colBat}</th>
                    <th className="px-6 py-4">{t.colSolar}</th>
                    <th className="px-6 py-4">{t.colSignal}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-[#2A1A3F]">
                  {filteredHistory.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-300">
                        {new Date(row.timestamp).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{row.waterLevel.toFixed(1)}</td>
                      <td className="px-6 py-4 text-brand-neon font-medium">{row.rainfall.toFixed(1)}</td>
                      <td className={`px-6 py-4 font-medium ${row.battery < 20 ? 'text-red-500' : 'text-green-500'}`}>{row.battery.toFixed(0)}%</td>
                      <td className="px-6 py-4 text-amber-500">{row.solarVoltage.toFixed(2)}</td>
                      <td className="px-6 py-4 text-slate-500">{row.signalStrength.toFixed(0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
         </div>
      )}

    </div>
  );
};

export default TechnicalView;
