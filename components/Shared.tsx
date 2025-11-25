
import React from 'react';
import { AlertLevel, TRANSLATIONS, Language, WeatherCondition } from '../types';
import { AlertTriangle, WifiOff, CheckCircle2, Sun, Cloud, CloudRain, CloudLightning, CloudSun, Wind, Circle } from 'lucide-react';

export const StatusBadge: React.FC<{ status: AlertLevel; lang: Language; size?: 'sm' | 'lg' | 'xl' }> = ({ status, lang, size = 'sm' }) => {
  const t = TRANSLATIONS[lang];
  
  // Updated to use CSS variables via Tailwind classes defined in config
  const styles = {
    [AlertLevel.SAFE]: 'bg-status-safe/10 text-status-safe border-status-safe/30 shadow-[0_0_10px_rgba(var(--status-safe),0.1)]',
    [AlertLevel.WARNING]: 'bg-status-warning/10 text-status-warning border-status-warning/30 shadow-[0_0_10px_rgba(var(--status-warning),0.1)] animate-pulse',
    [AlertLevel.CRITICAL]: 'bg-status-danger/10 text-status-danger border-status-danger/30 shadow-[0_0_15px_rgba(var(--status-danger),0.2)] animate-pulse',
    [AlertLevel.OFFLINE]: 'bg-status-offline/10 text-status-offline border-status-offline/30'
  };

  const labels = {
    [AlertLevel.SAFE]: t.safeStatus,
    [AlertLevel.WARNING]: t.warningStatus,
    [AlertLevel.CRITICAL]: t.criticalStatus,
    [AlertLevel.OFFLINE]: t.offlineStatus
  };

  // Fixed Icons as requested: AlertTriangle for Warning/Critical, CheckCircle2 for Safe
  const icons = {
    [AlertLevel.SAFE]: <CheckCircle2 className={size === 'xl' ? "w-6 h-6 mr-2" : "w-4 h-4 mr-1"} aria-hidden="true" />,
    [AlertLevel.WARNING]: <AlertTriangle className={size === 'xl' ? "w-6 h-6 mr-2" : "w-4 h-4 mr-1"} aria-hidden="true" />,
    [AlertLevel.CRITICAL]: <AlertTriangle className={size === 'xl' ? "w-6 h-6 mr-2" : "w-4 h-4 mr-1"} aria-hidden="true" />,
    [AlertLevel.OFFLINE]: <WifiOff className={size === 'xl' ? "w-6 h-6 mr-2" : "w-4 h-4 mr-1"} aria-hidden="true" />
  };

  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-xs',
    lg: 'px-4 py-1.5 text-sm',
    xl: 'px-6 py-3 text-lg'
  };

  return (
    <span 
      role="status"
      aria-label={`Status: ${labels[status]}`}
      className={`inline-flex items-center justify-center font-bold rounded-full border backdrop-blur-sm font-display tracking-wide ${styles[status]} ${sizeClasses[size]}`}
    >
      {icons[status]}
      {labels[status].toUpperCase()}
    </span>
  );
};

export const MetricCard: React.FC<{ 
  label: string; 
  value: string | number; 
  unit?: string; 
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  isCritical?: boolean;
}> = ({ label, value, unit, icon, isCritical }) => (
  <div 
    className={`group p-5 rounded-2xl border transition-all duration-300 glass-card relative overflow-hidden ${isCritical ? 'bg-status-danger/10 border-status-danger/30 shadow-[0_0_15px_rgba(255,23,68,0.1)]' : 'border-slate-200 dark:border-[#2A1A3F] hover:border-brand-neon/30 hover:shadow-lg dark:hover:bg-[#150a24]'}`}
    role="group"
    aria-label={`${label}: ${value} ${unit || ''}`}
  >
    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500 pointer-events-none ${isCritical ? 'text-status-danger' : 'text-brand-neon'}`}>
       <div className="scale-150">{icon}</div>
    </div>
    <div className="flex items-center justify-between mb-2 relative z-10">
      <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 font-display">{label}</span>
      <span className={`${isCritical ? 'text-status-danger drop-shadow-[0_0_5px_rgba(255,23,68,0.8)]' : 'text-brand-neon drop-shadow-[0_0_5px_rgba(213,0,249,0.8)]'}`} aria-hidden="true">{icon}</span>
    </div>
    <div className="flex items-baseline relative z-10">
      <span className="text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight">{value}</span>
      {unit && <span className="ml-1 text-sm font-medium text-slate-500 dark:text-slate-400 font-mono">{unit}</span>}
    </div>
  </div>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' }> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) => {
  const baseStyle = "inline-flex items-center justify-center rounded-lg font-bold uppercase tracking-wider transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#05020A] focus:ring-brand-neon disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2.5 text-sm active:scale-95 font-display";
  const variants = {
    primary: "bg-gradient-to-r from-brand-neon to-brand-500 hover:to-brand-400 text-white shadow-[0_0_15px_rgba(213,0,249,0.3)] hover:shadow-[0_0_25px_rgba(213,0,249,0.5)] border border-transparent",
    secondary: "bg-slate-100 dark:bg-[#1A1025] hover:bg-slate-200 dark:hover:bg-[#2A1A3F] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2A1A3F]",
    outline: "border border-brand-neon/50 text-brand-neon hover:bg-brand-neon/10",
    ghost: "bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white",
    danger: "bg-status-danger/20 hover:bg-status-danger/30 text-status-danger border border-status-danger/50 shadow-[0_0_15px_rgba(255,23,68,0.2)]"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const WaveGauge: React.FC<{ percentage: number; status: AlertLevel; label: string; height?: string }> = ({ percentage, status, label, height = "h-48" }) => {
  // Allow overflow visually but cap internal logic
  const isOverflow = percentage > 100;
  const safePercentage = Math.min(100, Math.max(0, percentage));
  
  // Use Tailwind classes that utilize the CSS variables
  const colors = {
    [AlertLevel.SAFE]: 'from-status-safe to-emerald-500', 
    [AlertLevel.WARNING]: 'from-status-warning to-yellow-500',
    [AlertLevel.CRITICAL]: 'from-status-danger to-red-600',
    [AlertLevel.OFFLINE]: 'from-slate-500 to-slate-700'
  };

  return (
    <div 
      className={`relative w-48 ${height} rounded-full bg-slate-100 dark:bg-[#0F0818] overflow-hidden border-4 border-slate-200 dark:border-[#2A1A3F] shadow-inner mx-auto group`}
      style={{ boxShadow: isOverflow ? `0 0 40px var(--status-danger)` : `0 0 20px var(--status-${status})30` }}
      role="progressbar"
      aria-valuenow={safePercentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${label}: ${percentage.toFixed(0)}%`}
    >
      {/* Background Grid Texture */}
      <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#888 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
      
      {/* Liquid Wave */}
      <div 
        className="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-in-out z-10"
        style={{ height: `${safePercentage}%` }}
      >
        <div className="relative w-full h-full">
           {/* Wave 1 */}
          <div 
            className={`absolute -top-12 left-[-50%] w-[200%] h-24 rounded-[40%] bg-gradient-to-r ${colors[status]} opacity-70 ${isOverflow ? 'animate-wave-fast' : 'animate-wave-slow'}`} 
            style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))' }}
          />
           {/* Wave 2 */}
          <div 
            className={`absolute -top-12 left-[-50%] w-[200%] h-24 rounded-[45%] bg-gradient-to-r ${colors[status]} opacity-50 ${isOverflow ? 'animate-wave-fast' : 'animate-wave-fast'}`} 
            style={{ animationDirection: 'reverse' }}
          />
          {/* Main Fill */}
          <div className={`absolute inset-0 bg-gradient-to-b ${colors[status]} opacity-90`} />
          
          {/* Bubbles animation (Simulated) */}
          <div className="absolute bottom-0 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-float" style={{ animationDelay: '0s' }} />
          <div className="absolute bottom-4 left-3/4 w-3 h-3 bg-white/20 rounded-full animate-float" style={{ animationDelay: '1.5s' }} />
        </div>
      </div>

      {/* Value Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none" aria-hidden="true">
        <span className={`text-4xl font-black ${isOverflow ? 'text-white drop-shadow-[0_0_5px_rgba(0,0,0,0.8)]' : 'text-slate-800 dark:text-white'} font-display drop-shadow-md transition-colors group-hover:scale-110 duration-300`}>
          {percentage.toFixed(0)}<span className="text-xl">%</span>
        </span>
        <span className={`text-xs font-bold ${isOverflow ? 'text-white/90' : 'text-slate-600 dark:text-white/80'} uppercase tracking-[0.2em] font-display drop-shadow-md mt-1`}>
          {label}
        </span>
      </div>
    </div>
  );
};

export const WeatherIcon: React.FC<{ condition: WeatherCondition; className?: string }> = ({ condition, className = "w-6 h-6" }) => {
  switch (condition) {
    case 'sunny': return <Sun className={`${className} text-amber-500`} />;
    case 'cloudy': return <Cloud className={`${className} text-slate-400`} />;
    case 'rainy': return <CloudRain className={`${className} text-blue-400`} />;
    case 'storm': return <CloudLightning className={`${className} text-purple-500`} />;
    case 'partly-cloudy': return <CloudSun className={`${className} text-amber-300`} />;
    case 'windy': return <Wind className={`${className} text-slate-400`} />;
    default: return <Sun className={`${className} text-amber-500`} />;
  }
};

// --- NEW COMPONENT: Custom Styled Slider ---
export const CustomSlider: React.FC<{
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (val: number) => void;
  label: React.ReactNode;
  valueLabel: string;
  color?: string; // Hex or tailwind color class prefix usually handled via style
}> = ({ value, min, max, step, onChange, label, valueLabel, color = '#3b82f6' }) => {
  const percentage = ((value - min) / (max - min)) * 100;
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-3">
        <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 flex items-center gap-2">
          {label}
        </label>
        <span className="text-xl font-mono font-bold" style={{ color }}>
          {valueLabel}
        </span>
      </div>
      
      <div className="relative h-6 flex items-center select-none group">
        {/* Track Background */}
        <div className="absolute w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
           {/* Fill */}
           <div 
             className="h-full transition-all duration-75 ease-out rounded-full"
             style={{ width: `${percentage}%`, backgroundColor: color }}
           />
        </div>
        
        {/* Input (Invisible but interactive) */}
        <input 
          type="range" 
          min={min} 
          max={max} 
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
        />

        {/* Custom Thumb (Visual) */}
        <div 
          className="absolute h-5 w-5 bg-white border-2 rounded-full shadow-md pointer-events-none transition-all duration-75 ease-out group-hover:scale-125 group-active:scale-110"
          style={{ 
            left: `calc(${percentage}% - 10px)`, 
            borderColor: color 
          }}
        />
      </div>
      
      <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};
