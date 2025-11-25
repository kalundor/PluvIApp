



import React, { useMemo, useState, useEffect } from 'react';
import { Station, Language, TRANSLATIONS, AlertLevel, Shelter } from '../types';
import { WHATSAPP_LINK_URL, MOCK_HOURLY_FORECAST, MOCK_DAILY_FORECAST, SAFE_SHELTERS } from '../constants';
import { StatusBadge, WaveGauge, WeatherIcon, CustomSlider } from './Shared';
import { MessageCircle, ExternalLink, CloudRain, Clock, Phone, MapPin, Droplets, Wind, Thermometer, RefreshCw, Navigation, AlertOctagon, Brain, Calendar, Share2, ShieldAlert, ChevronRight, X } from 'lucide-react';
import MapView from './MapView';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend, ComposedChart, Bar, Line } from 'recharts';

interface SimplifiedViewProps {
  stations: Station[];
  lang: Language;
  darkMode?: boolean;
}

// Helper to get Date object in Brasilia Time
const getBrasiliaDate = () => {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const brasiliaOffset = -3; // UTC-3
  return new Date(utc + (3600000 * brasiliaOffset));
};

const getDayName = (date: Date, offset: number, t: any) => {
  if (offset === 0) return t.dayToday;
  if (offset === 1) return t.dayTomorrow;
  
  const targetDate = new Date(date);
  targetDate.setDate(date.getDate() + offset);
  
  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  return days[targetDate.getDay()];
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  thresholds: { warning: number; critical: number };
  t: any;
  darkMode: boolean;
}

const CustomChartTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, thresholds, t, darkMode }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const level = data.level;
    
    let statusLabel = t.plannerSafe;
    let statusColor = "text-emerald-500";
    let statusBg = "bg-emerald-500";
    let containerClass = darkMode ? "bg-[#0F0818]/90 border-[#2A1A3F]" : "bg-white/90 border-slate-200";

    if (level >= thresholds.critical) {
      statusLabel = t.plannerCrit;
      statusColor = "text-red-500";
      statusBg = "bg-red-500";
    } else if (level >= thresholds.warning) {
      statusLabel = t.plannerWarn;
      statusColor = "text-amber-500";
      statusBg = "bg-amber-500";
    }

    return (
      <div className={`p-4 rounded-2xl border backdrop-blur-md shadow-2xl min-w-[180px] ${containerClass}`}>
        <p className="text-xs font-bold uppercase tracking-wider opacity-60 mb-2 border-b border-dashed border-gray-500/30 pb-1">{label}</p>
        
        <div className="flex items-center justify-between gap-4 mb-3">
           <div>
             <span className="text-[10px] font-bold uppercase opacity-50 block">{t.chartProjected}</span>
             <span className={`text-2xl font-black font-display ${statusColor}`}>{level.toFixed(0)}<span className="text-xs text-slate-500 ml-0.5">cm</span></span>
           </div>
           <div className={`h-3 w-3 rounded-full ${statusBg} animate-pulse shadow-[0_0_10px_currentColor]`}></div>
        </div>

        <div className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md inline-block ${statusBg} text-white mb-1 shadow-sm`}>
          {statusLabel}
        </div>
        
        {data.rainChance > 0 && (
          <div className="mt-2 pt-2 border-t border-dashed border-slate-500/20 flex items-center gap-1 text-xs font-mono opacity-80">
            <Droplets className="w-3 h-3 text-blue-400" />
            <span className="text-blue-400 font-bold">{data.rainChance}%</span> chuva prevista
          </div>
        )}
      </div>
    );
  }
  return null;
};

// --- EMERGENCY OVERLAY COMPONENT ---
const EmergencyScreen: React.FC<{ station: Station; shelter: Shelter; t: any; onClose: () => void }> = ({ station, shelter, t, onClose }) => (
  <div className="fixed inset-0 z-[100] bg-red-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
     <div className="max-w-md w-full bg-slate-950 border-2 border-red-500 rounded-3xl p-6 shadow-[0_0_50px_rgba(255,23,68,0.5)] relative overflow-hidden">
        {/* Animated Background Pulse */}
        <div className="absolute inset-0 bg-red-500/10 animate-pulse"></div>
        
        <div className="relative z-10 text-center">
           <div className="mx-auto w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-red-500/40 animate-bounce">
              <ShieldAlert className="w-10 h-10 text-white" />
           </div>

           <h2 className="text-3xl font-black text-white font-display uppercase tracking-tight mb-2 leading-none">
             {t.evacTitle}
           </h2>
           <p className="text-red-200 font-medium mb-8 text-sm">
             {t.evacDesc}
           </p>

           <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 text-left">
              <span className="text-[10px] font-bold uppercase text-red-400 tracking-wider mb-1 block">{t.evacShelter}</span>
              <h3 className="text-xl font-bold text-white mb-1">{shelter.name}</h3>
              <p className="text-sm text-slate-300 flex items-center gap-1">
                 <MapPin className="w-3 h-3" /> {shelter.address}
              </p>
           </div>

           <div className="space-y-3">
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${shelter.lat},${shelter.lng}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-4 bg-white text-red-600 font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors shadow-xl"
              >
                <Navigation className="w-5 h-5" />
                {t.evacNavigate}
              </a>
              
              <button 
                onClick={onClose}
                className="w-full py-3 bg-transparent text-white/50 hover:text-white font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-2"
              >
                {t.evacClose} <X className="w-4 h-4" />
              </button>
           </div>
        </div>
     </div>
  </div>
);

const SimplifiedView: React.FC<SimplifiedViewProps> = ({ stations, lang, darkMode = true }) => {
  const t = TRANSLATIONS[lang];
  const criticalStations = stations.filter(s => s.status === AlertLevel.CRITICAL || s.status === AlertLevel.WARNING);
  const primaryStation = criticalStations.length > 0 ? criticalStations[0] : stations[0];
  const percentage = primaryStation ? (primaryStation.lastReading.waterLevel / primaryStation.thresholds.sensorHeight) * 100 : 0;
  
  // Find nearest shelter
  const nearestShelter = SAFE_SHELTERS.find(s => s.id === primaryStation.nearestShelterId) || SAFE_SHELTERS[0];
  
  // Time State for Hydration match
  const [brasiliaTime, setBrasiliaTime] = useState<Date>(getBrasiliaDate());
  const currentHour = parseInt(brasiliaTime.toLocaleTimeString('pt-BR', { hour: '2-digit', hour12: false, timeZone: 'America/Sao_Paulo' }));

  // Weather State (Simulated dynamic updates)
  const currentWeather = MOCK_HOURLY_FORECAST[0];

  // TRIP PLANNER STATE
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0); // 0 = Today, 1 = Tomorrow, 2 = After
  const [selectedHour, setSelectedHour] = useState<number>(currentHour);
  const [showEmergency, setShowEmergency] = useState(false);

  useEffect(() => {
    // Show emergency screen if status becomes critical
    if (primaryStation.status === AlertLevel.CRITICAL) {
      setShowEmergency(true);
    }
  }, [primaryStation.status]);
  
  useEffect(() => {
    // Update time every minute to keep UI fresh
    const timer = setInterval(() => {
      setBrasiliaTime(getBrasiliaDate());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Update selected hour when day changes to ensure validity
  useEffect(() => {
    if (selectedDayOffset === 0 && selectedHour < currentHour) {
      setSelectedHour(currentHour);
    }
  }, [selectedDayOffset, currentHour]);


  // --- Logic for Trip Planner Projection (72 hours) ---
  const { fullProjection, safetySnapshot } = useMemo(() => {
    const currentLevel = primaryStation.lastReading.waterLevel;
    const warningThreshold = primaryStation.thresholds.warning;
    const criticalThreshold = primaryStation.thresholds.critical;
    
    // Generate a 72-hour projection based on the 72h weather forecast
    let projectedLevel = currentLevel;
    
    const projection = MOCK_HOURLY_FORECAST.map((forecast, index) => {
      // Logic: Rain increases level, Time decreases level (drainage)
      const rainImpact = forecast.precipChance > 50 ? (forecast.precipChance / 10) : 0; // If rain chance > 50, add cm
      const drainage = projectedLevel > 50 ? 2 : 0.5; // Drain 2cm/h if high, 0.5cm if low
      
      projectedLevel = Math.max(0, projectedLevel + rainImpact - drainage);

      return {
        timestamp: forecast.timestamp,
        timeLabel: forecast.time,
        level: parseFloat(projectedLevel.toFixed(1)),
        rainChance: forecast.precipChance,
        isDayOffset: Math.floor(index / 24)
      };
    });

    // Find the specific point the user selected
    // Since mock forecast starts at "Now" (Index 0 = currentHour)
    
    let indexLookup = 0;
    
    if (selectedDayOffset === 0) {
       // Today: Offset is simply (selectedHour - currentHour)
       // Example: Now is 21h, User selects 23h. Index = 2.
       indexLookup = Math.max(0, selectedHour - currentHour);
    } else {
       // Tomorrow or Day After
       // Hours remaining today + (Days-1 * 24) + selectedHour
       const hoursRemainingToday = 24 - currentHour;
       const fullDaysBetween = (selectedDayOffset - 1);
       indexLookup = hoursRemainingToday + (fullDaysBetween * 24) + selectedHour;
    }
    
    const snapshot = projection[Math.min(projection.length - 1, Math.max(0, indexLookup))];
    
    let status: 'safe' | 'warning' | 'critical' = 'safe';
    if (snapshot.level >= criticalThreshold) status = 'critical';
    else if (snapshot.level >= warningThreshold) status = 'warning';

    return { fullProjection: projection, safetySnapshot: { ...snapshot, status } };
  }, [primaryStation, selectedDayOffset, selectedHour, currentHour]);

  // Generate Dynamic Forecast based on Brasilia Time
  const dynamicForecast = useMemo(() => {
    return MOCK_HOURLY_FORECAST.slice(0, 24).map((item, index) => {
      const hour = (currentHour + index) % 24;
      return {
        ...item,
        time: index === 0 ? 'Agora' : `${hour}h`
      };
    });
  }, [brasiliaTime, currentHour]);

  // Determine min/max for hour slider based on selected day
  const minHourSlider = selectedDayOffset === 0 ? currentHour : 0;

  const handleShare = () => {
    const url = 'https://adsumusenginc.com.br/pluvia';
    if (navigator.share) {
      navigator.share({
        title: 'PluvIA - Monitoramento Inteligente',
        text: 'Acompanhe a situação do Rio Botas e previsões de risco em tempo real.',
        url: url
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url);
      alert(`Link copiado: ${url}`);
    }
  };

  return (
    <div className="space-y-8 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans relative">
      
      {/* EMERGENCY OVERLAY */}
      {showEmergency && primaryStation.status === AlertLevel.CRITICAL && (
        <EmergencyScreen 
          station={primaryStation} 
          shelter={nearestShelter} 
          t={t} 
          onClose={() => setShowEmergency(false)} 
        />
      )}

      {/* 1. HERO SECTION: Station Status & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Card */}
        <div className="lg:col-span-1 rounded-3xl shadow-xl dark:shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-[#2A1A3F] overflow-hidden relative glass-panel flex flex-col justify-between">
           <div className={`absolute top-0 left-0 w-full h-1 ${
              primaryStation.status === AlertLevel.CRITICAL ? 'bg-status-danger shadow-[0_0_10px_#ff1744]' :
              primaryStation.status === AlertLevel.WARNING ? 'bg-status-warning shadow-[0_0_10px_#ffea00]' :
              primaryStation.status === AlertLevel.SAFE ? 'bg-status-safe shadow-[0_0_10px_#00e676]' :
              'bg-status-offline'
           }`}></div>
           
           <div className="p-6 pb-0 flex justify-between items-start z-10 relative">
              <div>
                <div className="flex items-center gap-2 mb-2">
                   <StatusBadge status={primaryStation.status} lang={lang} size="lg" />
                   {primaryStation.status === AlertLevel.CRITICAL && (
                     <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75 right-6 top-6"></span>
                   )}
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight font-display tracking-tight">
                  {primaryStation.name.split(' - ')[0]}
                  <span className="block text-lg font-medium text-slate-500 dark:text-slate-400 mt-1">{primaryStation.name.split(' - ')[1]}</span>
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-2 font-mono">
                  <Clock className="w-3 h-3" />
                  {t.lastUpdated} {new Date(primaryStation.lastReading.timestamp).toLocaleTimeString('pt-BR', {timeZone: 'America/Sao_Paulo'})}
                </div>
              </div>
           </div>

           <div className="py-8 z-10 relative flex-1 flex items-center justify-center">
              <WaveGauge 
                percentage={percentage} 
                status={primaryStation.status} 
                label={t.gaugeLabel} 
                height="h-56"
              />
           </div>

           <div className="bg-white/50 dark:bg-[#1A1025]/50 backdrop-blur-sm border-t border-slate-200 dark:border-[#2A1A3F] p-4 flex justify-around text-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">{t.waterLevel}</span>
                <span className="text-xl font-black text-slate-900 dark:text-white font-display">{primaryStation.lastReading.waterLevel.toFixed(0)} <span className="text-xs text-slate-400 font-sans">cm</span></span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">{t.rainfall}</span>
                <span className="text-xl font-black text-brand-neon font-display">{primaryStation.lastReading.rainfall.toFixed(1)} <span className="text-xs text-slate-400 font-sans">mm</span></span>
              </div>
           </div>
        </div>

        {/* Right Column: Weather & Map Preview */}
        <div className="lg:col-span-2 flex flex-col gap-6">
           {/* WEATHER HUB */}
           <div className="glass-panel rounded-3xl p-6 border border-slate-200 dark:border-[#2A1A3F] relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div>
                   <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-display flex items-center gap-2">
                     <CloudRain className="w-4 h-4" /> {t.dashForecastTitle}
                   </h3>
                   <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-5xl font-black text-slate-900 dark:text-white font-display tracking-tighter">
                        {currentWeather.temp}°
                      </span>
                      <div className="flex flex-col text-xs font-bold text-slate-500">
                         <span className="flex items-center gap-1"><Droplets className="w-3 h-3" /> {currentWeather.precipChance}%</span>
                         <span className="flex items-center gap-1"><Wind className="w-3 h-3" /> 12km/h</span>
                      </div>
                   </div>
                   <p className="text-sm text-slate-600 dark:text-slate-300 font-medium mt-1">
                     Sensação de {currentWeather.temp + 2}°. {currentWeather.precipChance > 50 ? 'Possibilidade de chuva.' : 'Céu com nuvens dispersas.'}
                   </p>
                </div>
                <div className="bg-amber-400/20 p-3 rounded-full">
                   <WeatherIcon condition={currentWeather.condition} className="w-10 h-10" />
                </div>
              </div>
              
              {/* Hourly Scroller */}
              <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x border-b border-slate-200 dark:border-white/5">
                 {dynamicForecast.map((hour, i) => (
                   <div key={i} className="flex flex-col items-center gap-2 min-w-[3.5rem] snap-start">
                      <span className="text-[10px] font-bold text-slate-400">{hour.time}</span>
                      <WeatherIcon condition={hour.condition} className="w-6 h-6" />
                      <span className="text-sm font-bold text-slate-700 dark:text-white">{hour.temp}°</span>
                      <div className="h-8 w-1.5 bg-slate-200 dark:bg-slate-700 rounded-full relative overflow-hidden">
                         <div className="absolute bottom-0 w-full bg-blue-500" style={{ height: `${hour.precipChance}%` }} />
                      </div>
                   </div>
                 ))}
              </div>

              {/* Daily Forecast List */}
              <div className="mt-4 pt-2 space-y-3">
                 <h4 className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">Próximos Dias</h4>
                 {MOCK_DAILY_FORECAST.map((day, i) => {
                   const dayLabel = getDayName(brasiliaTime, i, t);
                   return (
                     <div key={i} className="flex items-center justify-between text-sm group hover:bg-white/5 p-1 rounded transition-colors">
                       <span className="w-20 font-bold text-slate-700 dark:text-slate-300 capitalize">{dayLabel}</span>
                       <div className="flex items-center gap-3 flex-1 justify-center">
                          <WeatherIcon condition={day.condition} className="w-4 h-4" />
                          <div className="flex items-center gap-1 w-12 justify-end">
                            <Droplets className="w-3 h-3 text-blue-400" />
                            <span className="text-xs text-blue-400 font-bold">{day.precipChance}%</span>
                          </div>
                       </div>
                       <div className="flex gap-3 font-mono text-slate-600 dark:text-slate-400 text-xs w-20 justify-end">
                          <span className="opacity-70">{day.minTemp}°</span>
                          <div className="w-16 h-1 bg-slate-700 rounded-full relative overflow-hidden self-center">
                            <div className="absolute inset-y-0 bg-gradient-to-r from-blue-400 to-amber-400 opacity-60"></div>
                          </div>
                          <span className="font-bold">{day.maxTemp}°</span>
                       </div>
                     </div>
                   );
                 })}
              </div>
           </div>

           {/* ACTIONS GRID */}
           <div className="grid grid-cols-2 gap-4">
              <a 
                href={WHATSAPP_LINK_URL} 
                target="_blank" 
                rel="noreferrer"
                className="bg-[#25D366] hover:bg-[#128C7E] transition-colors p-4 rounded-xl flex items-center justify-between cursor-pointer text-white shadow-lg shadow-green-900/20 group"
              >
                 <div className="flex flex-col gap-1">
                   <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                   <span className="text-xs font-bold uppercase opacity-90">WhatsApp</span>
                 </div>
                 <ExternalLink className="w-4 h-4 opacity-70" />
              </a>

              {/* EMERGENCY 199 BUTTON (DIRECT CALL) */}
              <a 
                href="tel:199"
                className="bg-status-danger hover:bg-red-700 transition-colors p-4 rounded-xl flex items-center justify-between cursor-pointer text-white shadow-lg shadow-red-900/20 group col-span-1"
              >
                 <div className="flex flex-col gap-1">
                   <div className="flex items-center gap-2">
                     <Phone className="w-6 h-6 group-hover:scale-110 transition-transform" />
                     <span className="text-sm font-bold uppercase opacity-90">Defesa Civil (199)</span>
                   </div>
                   <span className="text-[10px] opacity-80 leading-tight">Ligue em caso de alagamentos, deslizamentos ou risco à vida.</span>
                 </div>
                 <ExternalLink className="w-4 h-4 opacity-70" />
              </a>
           </div>

           {/* MAP MINI PREVIEW */}
           <div className="h-72 rounded-2xl overflow-hidden border border-slate-200 dark:border-[#2A1A3F] shadow-inner relative group cursor-pointer">
              <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors z-10 pointer-events-none" />
              <MapView stations={stations} lang={lang} interactive={false} darkMode={darkMode} />
              <div className="absolute bottom-2 right-2 bg-white/90 dark:bg-black/80 backdrop-blur px-2 py-1 rounded text-[10px] font-bold z-20 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-brand-neon" />
                {t.mapView}
              </div>
           </div>
        </div>
      </div>

      {/* 2. TRIP PLANNER & AI PROJECTION SECTION */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-200 dark:border-[#2A1A3F] shadow-2xl relative">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
           <Brain className="w-64 h-64 text-brand-neon" />
        </div>
        
        <div className="p-6 md:p-8 border-b border-slate-200 dark:border-[#2A1A3F] flex flex-col md:flex-row md:items-start justify-between gap-4">
           <div>
             <h3 className="text-xl font-black text-slate-900 dark:text-white font-display tracking-tight flex items-center gap-3">
               <div className="bg-brand-neon p-1.5 rounded-lg text-white">
                 <Navigation className="w-5 h-5" />
               </div>
               {t.aiPanelTitle}
             </h3>
             <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-2xl">
               {t.aiPlannerIntro}
             </p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* CONTROLS (Left) */}
          <div className="lg:col-span-4 p-6 md:p-8 border-r border-slate-200 dark:border-[#2A1A3F] bg-slate-50/50 dark:bg-[#0F0818]/50">
             
             {/* Day Selector */}
             <div className="flex bg-slate-200 dark:bg-[#1A1025] p-1 rounded-xl mb-8">
               {[0, 1, 2].map((idx) => {
                 const dayLabel = idx === 0 ? t.dayToday : idx === 1 ? t.dayTomorrow : t.dayAfter;
                 return (
                   <button
                     key={idx}
                     onClick={() => setSelectedDayOffset(idx)}
                     className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wide rounded-lg transition-all ${
                       selectedDayOffset === idx 
                       ? 'bg-white dark:bg-brand-neon text-brand-neon dark:text-white shadow-md' 
                       : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                     }`}
                   >
                     {dayLabel}
                   </button>
                 );
               })}
             </div>

             {/* Hour Slider */}
             <div className="mb-8">
                <CustomSlider 
                  label={t.plannerTimeLabel}
                  value={selectedHour}
                  min={minHourSlider}
                  max={23}
                  step={1}
                  onChange={setSelectedHour}
                  valueLabel={`${selectedHour}h`}
                  color="var(--brand-neon)"
                />
             </div>

             {/* Result Card */}
             <div className={`rounded-2xl p-6 border transition-all duration-500 ${
               safetySnapshot.status === 'safe' ? 'bg-emerald-500/10 border-emerald-500/30' : 
               safetySnapshot.status === 'warning' ? 'bg-amber-500/10 border-amber-500/30' : 
               'bg-red-600/10 border-red-600/30 animate-pulse-slow'
             }`}>
                <div className="flex items-center justify-between mb-4">
                   <span className="text-xs font-bold uppercase tracking-widest opacity-60">Status Previsto</span>
                   {safetySnapshot.status === 'safe' ? <div className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase">Seguro</div> :
                    safetySnapshot.status === 'warning' ? <div className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase">Atenção</div> :
                    <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase flex items-center gap-1"><AlertOctagon className="w-3 h-3" /> Perigo</div>
                   }
                </div>
                
                <h4 className={`text-2xl font-black font-display mb-2 ${
                   safetySnapshot.status === 'safe' ? 'text-emerald-500' : 
                   safetySnapshot.status === 'warning' ? 'text-amber-500' : 
                   'text-red-500'
                }`}>
                   {safetySnapshot.status === 'safe' ? t.plannerSafe :
                    safetySnapshot.status === 'warning' ? t.plannerWarn :
                    t.plannerCrit}
                </h4>
                <p className="text-xs font-medium opacity-80 leading-relaxed">
                   {safetySnapshot.status === 'safe' ? t.plannerSafeDesc :
                    safetySnapshot.status === 'warning' ? t.plannerWarnDesc :
                    t.plannerCritDesc}
                </p>

                <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/5 grid grid-cols-2 gap-4">
                   <div>
                      <span className="text-[10px] uppercase opacity-50 block">Nível Esperado</span>
                      <span className="text-lg font-bold font-mono">{safetySnapshot.level.toFixed(0)}cm</span>
                   </div>
                   <div>
                      <span className="text-[10px] uppercase opacity-50 block">Prob. Chuva</span>
                      <span className="text-lg font-bold font-mono">{safetySnapshot.rainChance}%</span>
                   </div>
                </div>
             </div>
          </div>

          {/* CHART (Right) */}
          <div className="lg:col-span-8 p-6 md:p-8 min-h-[400px] flex flex-col">
             <div className="flex justify-between items-center mb-6">
               <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-display flex items-center gap-2">
                 <Calendar className="w-4 h-4" /> Projeção 72h
               </h4>
               <div className="flex items-center gap-4 text-[10px] font-mono opacity-60">
                 <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-brand-neon"></div> {t.chartProjected}</div>
                 <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> {t.chartThreshold}</div>
               </div>
             </div>

             <div className="flex-1 w-full min-w-0">
               <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={1}>
                  <ComposedChart data={fullProjection} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="projGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--brand-neon)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--brand-neon)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#2A1A3F" : "#e2e8f0"} vertical={false} />
                    <XAxis 
                      dataKey="timeLabel" 
                      stroke={darkMode ? "#64748b" : "#94a3b8"} 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      interval={11} // Show every ~12 hours
                    />
                    <YAxis 
                      stroke={darkMode ? "#64748b" : "#94a3b8"} 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <Tooltip 
                      content={<CustomChartTooltip thresholds={primaryStation.thresholds} t={t} darkMode={darkMode} />}
                      cursor={{ stroke: 'var(--brand-neon)', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <ReferenceLine y={primaryStation.thresholds.warning} stroke="var(--status-warning)" strokeDasharray="3 3" />
                    <ReferenceLine y={primaryStation.thresholds.critical} stroke="var(--status-danger)" strokeDasharray="3 3" />
                    
                    <ReferenceLine x={safetySnapshot.timeLabel} stroke="white" strokeDasharray="3 3" label={{ value: 'Hora Selecionada', position: 'top', fill: 'white', fontSize: 10 }} />

                    <Area 
                      type="monotone" 
                      dataKey="level" 
                      stroke="var(--brand-neon)" 
                      strokeWidth={3} 
                      fill="url(#projGradient)" 
                      animationDuration={1000}
                    />
                  </ComposedChart>
               </ResponsiveContainer>
             </div>
          </div>
        </div>
      </div>

      {/* FOOTER: SHARE PLUVIA */}
      <div className="pt-8 pb-4 flex flex-col items-center justify-center border-t border-slate-200 dark:border-white/5 mt-8">
         <button 
           onClick={handleShare}
           className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-brand-neon hover:opacity-90 text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
         >
           <Share2 className="w-4 h-4" />
           {t.actionShare} PluvIA
         </button>
         <p className="text-[10px] text-slate-400 mt-4 font-mono select-all">
            adsumusenginc.com.br/pluvia
         </p>
      </div>

    </div>
  );
};

export default SimplifiedView;