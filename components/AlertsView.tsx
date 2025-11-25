import React, { useState } from 'react';
import { AlertEvent, Language, TRANSLATIONS, AlertLevel } from '../types';
import { Bell, AlertTriangle, CheckCircle2, WifiOff, Calendar, Filter, Check, X } from 'lucide-react';

interface AlertsViewProps {
  lang: Language;
  alerts: AlertEvent[];
  onMarkAllRead: () => void;
  onDismiss: (id: string) => void;
}

const AlertsView: React.FC<AlertsViewProps> = ({ lang, alerts, onMarkAllRead, onDismiss }) => {
  const t = TRANSLATIONS[lang];
  const [filter, setFilter] = useState<AlertLevel | 'all'>('all');

  // Filter alerts based on selection
  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    return alert.severity === filter;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const unreadCount = alerts.filter(a => !a.acknowledged).length;

  const getAlertIcon = (severity: AlertLevel) => {
    switch (severity) {
      case AlertLevel.CRITICAL: return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case AlertLevel.WARNING: return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case AlertLevel.SAFE: return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case AlertLevel.OFFLINE: return <WifiOff className="w-5 h-5 text-slate-400" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getAlertBorderColor = (severity: AlertLevel) => {
    switch (severity) {
      case AlertLevel.CRITICAL: return 'border-l-red-500 bg-red-50 dark:bg-red-900/10';
      case AlertLevel.WARNING: return 'border-l-amber-500 bg-amber-50 dark:bg-amber-900/10';
      case AlertLevel.SAFE: return 'border-l-emerald-500 bg-emerald-50 dark:bg-emerald-900/10';
      case AlertLevel.OFFLINE: return 'border-l-slate-400 bg-slate-50 dark:bg-slate-900/10';
      default: return 'border-l-slate-200';
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Bell className="w-6 h-6 text-brand-500" />
          {t.alertsViewTitle}
          {unreadCount > 0 && (
            <span className="text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-full ml-2 animate-pulse">
              {unreadCount} Novas
            </span>
          )}
        </h2>
        
        {unreadCount > 0 && (
          <button 
            onClick={onMarkAllRead}
            className="w-full md:w-auto text-xs font-bold uppercase tracking-wider bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 px-4 py-3 md:py-2 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Check className="w-4 h-4" />
            Marcar todas como lidas
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 hide-scrollbar">
        <button
          onClick={() => setFilter('all')}
          className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === 'all' 
              ? 'bg-slate-800 text-white shadow-md' 
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
          }`}
        >
          <Filter className="w-3 h-3" />
          {t.filterAll}
        </button>
        <button
          onClick={() => setFilter(AlertLevel.CRITICAL)}
          className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === AlertLevel.CRITICAL 
              ? 'bg-red-500 text-white shadow-md shadow-red-500/20' 
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:text-red-500'
          }`}
        >
          {t.criticalStatus}
        </button>
        <button
          onClick={() => setFilter(AlertLevel.WARNING)}
          className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === AlertLevel.WARNING
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' 
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:text-amber-500'
          }`}
        >
          {t.warningStatus}
        </button>
      </div>

      {/* Alert List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 border-dashed">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <p className="text-slate-900 dark:text-white font-bold text-lg mb-1">{t.noAlerts}</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm">O sistema está operando normalmente.</p>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div 
              key={alert.id}
              className={`relative bg-white dark:bg-slate-800 rounded-2xl p-5 border-l-4 shadow-sm border-y border-r border-slate-200 dark:border-slate-700 transition-all ${
                !alert.acknowledged ? 'ring-2 ring-brand-neon/50 shadow-lg scale-[1.01]' : 'opacity-80'
              } ${getAlertBorderColor(alert.severity)}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                     {getAlertIcon(alert.severity)}
                     <span className="text-xs font-bold uppercase tracking-wider opacity-70 text-slate-800 dark:text-slate-200">
                       {alert.stationName.split(' - ')[1] || alert.stationName}
                     </span>
                     {!alert.acknowledged && (
                       <span className="bg-brand-neon text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide">Nova</span>
                     )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 font-display tracking-tight">{alert.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{alert.message}</p>
                </div>
                
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-medium text-slate-400 flex items-center justify-end gap-1 mb-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(alert.timestamp).toLocaleDateString()}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded">
                      {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  {!alert.acknowledged && (
                    <button 
                      onClick={() => onDismiss(alert.id)}
                      className="text-xs text-slate-400 hover:text-brand-neon font-bold uppercase tracking-wide flex items-center gap-1 transition-colors"
                    >
                      Marcar lida
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default AlertsView;