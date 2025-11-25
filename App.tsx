import React, { useState, useEffect } from 'react';
import { MOCK_STATIONS, MOCK_ALERTS } from './constants';
import { Station, AppMode, Language, TRANSLATIONS, AlertLevel, AlertEvent } from './types';
import SimplifiedView from './components/SimplifiedView';
import TechnicalView from './components/TechnicalView';
import AlertsView from './components/AlertsView';
import { Moon, Sun, Home, BarChart3, Bell, Droplets, X, AlertTriangle } from 'lucide-react';

// --- COMPONENTS ---

// Toast Notification Component
const Toast: React.FC<{ message: string; type: AlertLevel; onClose: () => void }> = ({ message, type, onClose }) => {
  const colors = {
    [AlertLevel.SAFE]: 'bg-emerald-500 border-emerald-400',
    [AlertLevel.WARNING]: 'bg-amber-500 border-amber-400',
    [AlertLevel.CRITICAL]: 'bg-red-600 border-red-500',
    [AlertLevel.OFFLINE]: 'bg-slate-600 border-slate-500'
  };

  return (
    <div className={`fixed top-24 right-4 z-[100] max-w-sm w-full animate-slide-in`}>
      <div className={`${colors[type] || colors[AlertLevel.OFFLINE]} text-white p-4 rounded-xl shadow-2xl border border-white/20 backdrop-blur-md flex items-start gap-3`}>
        <div className="bg-white/20 p-2 rounded-full shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold font-display uppercase text-xs tracking-wider mb-1 opacity-90">Nova Atualização</h4>
          <p className="text-sm font-medium leading-snug">{message}</p>
        </div>
        <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// --- CONFIGURAÇÃO DE LOGO ---
const CUSTOM_LOGO_URL = "https://i.ibb.co/hRvwN3Yp/Pluv-IAweblogoapp.png"; 

const PluviaLogo: React.FC = () => (
  <div className="relative h-14 w-auto min-w-[120px] flex items-center justify-start group-hover:scale-105 transition-transform duration-300">
    <div className="absolute inset-0 bg-brand-neon/10 rounded-xl blur-md animate-pulse-slow"></div>
    
    {CUSTOM_LOGO_URL ? (
      <img 
        src={CUSTOM_LOGO_URL} 
        alt="PluvIA Logo" 
        className="h-full w-auto object-contain relative z-10 drop-shadow-[0_0_8px_rgba(213,0,249,0.3)]"
      />
    ) : (
      <div className="flex items-center gap-3">
        <Droplets className="w-8 h-8 text-brand-neon relative z-10 drop-shadow-[0_0_8px_rgba(213,0,249,0.5)]" />
        <span className="text-2xl text-slate-900 dark:text-white font-necosmic tracking-wide">PluvIA</span>
      </div>
    )}
  </div>
);

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('simplified');
  const [lang, setLang] = useState<Language>('pt-BR');
  const [darkMode, setDarkMode] = useState(true); 
  const [toast, setToast] = useState<{msg: string, type: AlertLevel} | null>(null);
  
  // ALERTS STATE MANAGEMENT
  const [alerts, setAlerts] = useState<AlertEvent[]>(MOCK_ALERTS);
  const unreadCount = alerts.filter(a => !a.acknowledged).length;
  
  // Offline-first: Initialize from local storage if available
  const [stations, setStations] = useState<Station[]>(() => {
    try {
      const saved = localStorage.getItem('pluvia_stations');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load cached data:", e);
    }
    return MOCK_STATIONS;
  });

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  // Default to simulation mode for demo purposes, toggle to false for prod behavior
  const [isSimulation, setIsSimulation] = useState(true);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Network Status Monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Data Persistence
  useEffect(() => {
    localStorage.setItem('pluvia_stations', JSON.stringify(stations));
  }, [stations]);

  // Real-time Simulation (Demo Mode - 3s interval) (Movement Logic)
  useEffect(() => {
    if (!isSimulation) return;
    const interval = setInterval(() => {
      setStations(prev => prev.map(station => {
        // --- DINÂMICA DE "MARÉ" / "RESPIRAÇÃO" ---
        // Usa Math.sin baseado no tempo atual para criar um movimento suave de subida e descida
        const now = Date.now();
        // Ciclo de ~20 segundos para subir e descer
        const waveComponent = Math.sin(now / 3000) * 2; 
        // Pequeno ruído aleatório para naturalidade
        const noiseComponent = (Math.random() - 0.5) * 0.5;
        
        const delta = waveComponent + noiseComponent;
        
        // Garante que não fique negativo
        const newLevel = Math.max(0, station.lastReading.waterLevel + (delta * 0.2)); // 0.2 fator de suavização

        const solarSim = Math.max(0, Math.sin(now / 10000) * 6);
        
        // Trigger Toast AND Add to Alert List for critical events in simulation
        if (station.id === 'botas-003' && newLevel > 352 && station.lastReading.waterLevel <= 352) {
             const msg = `Nível Crítico atingido em ${station.name}! (${newLevel.toFixed(0)}cm)`;
             
             // 1. Show Toast
             setToast({ 
               msg: msg, 
               type: AlertLevel.CRITICAL 
             });
             setTimeout(() => setToast(null), 5000);

             // 2. Add to Notifications List
             const newAlert: AlertEvent = {
               id: `auto-${Date.now()}`,
               stationId: station.id,
               stationName: station.name,
               severity: AlertLevel.CRITICAL,
               timestamp: new Date().toISOString(),
               title: 'Alerta de Transbordo (Simulação)',
               message: `O nível do rio ultrapassou o limite de segurança. Leitura atual: ${newLevel.toFixed(0)}cm.`,
               acknowledged: false
             };
             setAlerts(prev => [newAlert, ...prev]);
        }

        const newHistory = [
          { ...station.lastReading, waterLevel: newLevel, timestamp: new Date().toISOString(), solarVoltage: solarSim },
          ...station.history.slice(0, 47)
        ];

        return {
          ...station,
          lastReading: { 
            ...station.lastReading, 
            timestamp: new Date().toISOString(), 
            waterLevel: parseFloat(newLevel.toFixed(1)), 
            solarVoltage: parseFloat(solarSim.toFixed(2)) 
          },
          history: newHistory
        };
      }));
    }, 100); // 100ms para movimento fluido (60fps feel)
    return () => clearInterval(interval);
  }, [isSimulation]);

  // Production "Heartbeat" Refresh (60s interval)
  useEffect(() => {
    if (isSimulation || !isOnline) return;

    const refreshInterval = setInterval(() => {
      setStations(prev => prev.map(station => {
        const delta = (Math.random() - 0.5) * 0.5;
        const newLevel = Math.max(0, station.lastReading.waterLevel + delta);
        
        const newHistory = [
          { ...station.lastReading, waterLevel: newLevel, timestamp: new Date().toISOString() },
          ...station.history.slice(0, 47)
        ];

        return {
          ...station,
          lastReading: { 
            ...station.lastReading, 
            timestamp: new Date().toISOString(), 
            waterLevel: parseFloat(newLevel.toFixed(1))
          },
          history: newHistory
        };
      }));
    }, 60000); 

    return () => clearInterval(refreshInterval);
  }, [isSimulation, isOnline]);

  const toggleLanguage = () => setLang(prev => prev === 'pt-BR' ? 'en-US' : 'pt-BR');

  // Handlers for Alert Management
  const handleMarkAllRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, acknowledged: true })));
  };

  const handleDismissAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  const renderContent = () => {
    switch (mode) {
      case 'technical':
        return <TechnicalView stations={stations} lang={lang} onRefresh={() => setStations([...MOCK_STATIONS])} darkMode={darkMode} />;
      case 'alerts':
        return <AlertsView lang={lang} alerts={alerts} onMarkAllRead={handleMarkAllRead} onDismiss={handleDismissAlert} />;
      case 'simplified':
      default:
        return <SimplifiedView stations={stations} lang={lang} darkMode={darkMode} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#05020A] text-slate-900 dark:text-slate-100 transition-colors duration-300 relative">
      
      {/* Ambient Background Dots */}
      <div className="fixed inset-0 bg-dots pointer-events-none z-0 opacity-40"></div>
      
      {/* Toast Notification Layer */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-200 dark:border-[#2A1A3F] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 py-3">
            
            {/* Brand Logo & Title */}
            <div className="flex items-center cursor-pointer group select-none" onClick={() => setMode('simplified')}>
              <PluviaLogo />
            </div>

            {/* Desktop Actions */}
            <div className="flex items-center gap-3">
              {/* DESKTOP TABS (VISIBLE ONLY ON DESKTOP) */}
              <div className="hidden md:flex bg-slate-100 dark:bg-[#0F0818]/50 p-1 rounded-lg border border-slate-200 dark:border-[#2A1A3F] mr-4">
                <button 
                  onClick={() => setMode('simplified')}
                  className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all font-display ${mode === 'simplified' ? 'bg-gradient-to-r from-brand-neon to-brand-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white/10'}`}
                >
                  {t.simplifiedMode}
                </button>
                <button 
                  onClick={() => setMode('technical')}
                  className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all font-display ${mode === 'technical' ? 'bg-gradient-to-r from-brand-neon to-brand-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white/10'}`}
                >
                  {t.technicalMode}
                </button>
              </div>

              <div className="hidden md:block h-6 w-px bg-slate-300 dark:bg-[#2A1A3F] mx-1" />

              {/* ALERTS ICON BUTTON (ISOLATED) */}
              <button 
                onClick={() => setMode('alerts')}
                className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors relative border border-slate-200 dark:border-[#2A1A3F] ${mode === 'alerts' ? 'bg-brand-neon text-white border-brand-neon' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#1A1025]'}`}
                aria-label="Alerts"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-white dark:border-[#05020A]"></span>
                )}
              </button>

              <button onClick={toggleLanguage} className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#1A1025] rounded-full transition-colors font-bold text-xs border border-slate-200 dark:border-[#2A1A3F] font-display" aria-label="Toggle Language">
                {lang === 'pt-BR' ? 'BR' : 'EN'}
              </button>
              
              <button onClick={() => setDarkMode(!darkMode)} className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#1A1025] rounded-full transition-colors border border-slate-200 dark:border-[#2A1A3F]" aria-label="Toggle Dark Mode">
                {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full relative z-10">
        {isSimulation && (
           <div className="fixed top-24 left-4 z-40 bg-brand-neon/5 text-brand-neon text-[10px] font-bold uppercase px-3 py-1.5 rounded-full border border-brand-neon/20 pointer-events-none backdrop-blur-md flex items-center gap-2">
             <span className="w-2 h-2 bg-brand-neon rounded-full animate-pulse"></span>
             Simulação Ativa
           </div>
        )}
        {!isOnline && (
          <div className="mb-6 bg-slate-800/90 border border-slate-600/30 text-white px-4 py-3 rounded-lg flex items-center justify-center shadow-lg animate-pulse backdrop-blur-md z-40">
            <span className="w-2 h-2 bg-slate-400 rounded-full mr-2"></span>
            <span className="font-medium text-sm font-display uppercase tracking-wider">{t.offlineStatus} - {t.offline} (Modo Cache)</span>
          </div>
        )}
        {renderContent()}
      </main>

      {/* Mobile Nav (HIDDEN ON DESKTOP via md:hidden and mobile-only class) */}
      <nav className="md:hidden mobile-only fixed bottom-0 left-0 right-0 glass-panel border-t border-slate-200 dark:border-[#2A1A3F] pb-safe z-50">
        <div className="grid grid-cols-4 h-20 pt-2 pb-4">
          <button onClick={() => setMode('simplified')} className={`flex flex-col items-center justify-center gap-1 group`}>
            <div className={`p-1.5 rounded-full transition-all ${mode === 'simplified' ? 'bg-brand-neon/10 text-brand-neon' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-300'}`}>
              <Home className="w-6 h-6" />
            </div>
            <span className={`text-[10px] font-bold font-display ${mode === 'simplified' ? 'text-brand-neon' : 'text-slate-500'}`}>{t.home}</span>
          </button>
          
          <button onClick={() => setMode('technical')} className={`flex flex-col items-center justify-center gap-1 group`}>
            <div className={`p-1.5 rounded-full transition-all ${mode === 'technical' ? 'bg-brand-neon/10 text-brand-neon' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-300'}`}>
              <BarChart3 className="w-6 h-6" />
            </div>
            <span className={`text-[10px] font-bold font-display ${mode === 'technical' ? 'text-brand-neon' : 'text-slate-500'}`}>{t.technicalMode}</span>
          </button>

          <button onClick={() => setMode('alerts')} className={`flex flex-col items-center justify-center gap-1 group`}>
            <div className={`p-1.5 rounded-full transition-all relative ${mode === 'alerts' ? 'bg-brand-neon/10 text-brand-neon' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-300'}`}>
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border-2 border-white dark:border-[#1A1025]"></span>
              )}
            </div>
            <span className={`text-[10px] font-bold font-display ${mode === 'alerts' ? 'text-brand-neon' : 'text-slate-500'}`}>{t.alerts}</span>
          </button>

          <button onClick={() => setDarkMode(!darkMode)} className="flex flex-col items-center justify-center gap-1 group text-slate-400 dark:text-slate-500">
            <div className="p-1.5 rounded-full group-hover:bg-slate-100 dark:group-hover:bg-white/5 transition-all">
               {darkMode ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
            </div>
            <span className="text-[10px] font-bold font-display">{t.settings}</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;