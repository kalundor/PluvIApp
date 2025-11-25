


import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Station, AlertLevel, Language, TRANSLATIONS } from '../types';
import { RIO_BOTAS_PATH, RISK_ZONES, SAFE_SHELTERS } from '../constants';
import { Map as MapIcon } from 'lucide-react';

interface MapViewProps {
  stations: Station[];
  lang?: Language;
  interactive?: boolean;
  darkMode?: boolean;
}

// --- CUSTOM DIV ICONS (CSS-BASED) ---
const createStationIcon = (status: AlertLevel) => {
  let cssClass = '';
  switch (status) {
    case AlertLevel.CRITICAL: cssClass = 'pluvia-marker-critical'; break;
    case AlertLevel.WARNING: cssClass = 'pluvia-marker-warning'; break;
    case AlertLevel.SAFE: cssClass = 'pluvia-marker-safe'; break;
    default: cssClass = 'pluvia-marker-offline';
  }

  return L.divIcon({
    className: 'bg-transparent', // Handled by inner html
    html: `<div class="${cssClass} w-4 h-4 rounded-full border-2 border-white"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10]
  });
};

const shelterIcon = L.divIcon({
  className: 'bg-transparent',
  html: `<div class="flex items-center justify-center w-6 h-6 bg-emerald-600 border-2 border-white rounded-lg shadow-lg text-white font-bold text-[10px]">🏠</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -14]
});

const userIcon = L.divIcon({
  className: 'bg-transparent',
  html: `<div class="user-location-pulse w-4 h-4"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -10]
});

// Component to handle map view updates & Resize fixes
const MapController: React.FC<{ bounds?: L.LatLngBoundsExpression; userPos?: [number, number] }> = ({ bounds, userPos }) => {
  const map = useMap();
  
  useMapEvents({
    resize: () => {
      map.invalidateSize();
    }
  });

  useEffect(() => {
    // Force a resize calculation on mount to ensure tiles load
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    if (userPos) {
      map.flyTo(userPos, 15, { duration: 2 });
    } else if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50], animate: true });
    }
  }, [bounds, map, userPos]);
  
  return null;
};

const MapView: React.FC<MapViewProps> = ({ stations, lang = 'pt-BR', interactive = false, darkMode = true }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | undefined>(undefined);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    setIsMounted(true);
    
    if (interactive && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.debug("Geolocation access denied or error:", error);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  }, [interactive]);

  const regionBounds = useMemo(() => {
     return L.latLngBounds([-22.8000, -43.5000], [-22.7000, -43.3000]);
  }, []);

  const riverBounds = useMemo(() => {
    if (RIO_BOTAS_PATH.length === 0) return undefined;
    return L.latLngBounds(RIO_BOTAS_PATH);
  }, []);

  if (!isMounted) return <div className="w-full h-full bg-slate-900 animate-pulse rounded-xl flex items-center justify-center text-slate-400 font-display tracking-widest uppercase text-xs">Carregando Mapa...</div>;

  return (
    <div className="w-full h-full rounded-xl overflow-hidden relative bg-[#05020A] border border-slate-200 dark:border-[#2A1A3F]">
      
      {/* Dashboard Floating Header */}
      <div className="absolute top-4 left-4 z-[400] pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full shadow-2xl flex items-center gap-2">
          <MapIcon className="w-3 h-3 text-brand-neon" />
          <span className="text-[10px] font-bold text-white font-display tracking-wider uppercase">{t.mapTitle}</span>
        </div>
      </div>

      <MapContainer 
        zoomControl={interactive} 
        scrollWheelZoom={true} 
        doubleClickZoom={true} 
        touchZoom={true} 
        dragging={true} 
        style={{ height: '100%', width: '100%', background: '#202124' }} 
        attributionControl={false}
        center={[-22.74, -43.38]}
        zoom={13}
        minZoom={12}
        maxBounds={regionBounds}
        maxBoundsViscosity={0.6}
      >
        <MapController bounds={riverBounds} userPos={userLocation} />
        
        {/* GOOGLE HYBRID TILES */}
        <TileLayer
          url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
          maxZoom={20}
          subdomains={['mt0','mt1','mt2','mt3']}
          attribution='&copy; Google Maps'
        />
        
        {/* River Glow (Outer) */}
        <Polyline 
          positions={RIO_BOTAS_PATH} 
          pathOptions={{ color: '#000', weight: 10, opacity: 0.6, lineCap: 'round', lineJoin: 'round' }} 
        />
        
        {/* River Core (Inner Neon) */}
        <Polyline 
          positions={RIO_BOTAS_PATH} 
          pathOptions={{ color: '#00E5FF', weight: 3, opacity: 1, lineCap: 'round', lineJoin: 'round', className: 'drop-shadow-[0_0_15px_rgba(0,229,255,1)]' }} 
        />

        {/* Risk Zones */}
        {RISK_ZONES.map((zone, idx) => (
          <Polygon 
            key={idx}
            positions={zone.coords}
            pathOptions={{ 
              color: 'transparent',
              fillColor: zone.type === 'HIGH_RISK' ? '#ff1744' : '#ffea00',
              fillOpacity: 0.2,
            }}
          />
        ))}

        {/* User Location */}
        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
             <Popup closeButton={false}>
               <div className="text-xs font-bold text-blue-400 uppercase tracking-wider text-center">Sua Localização</div>
             </Popup>
          </Marker>
        )}

        {/* SAFE SHELTERS (PONTOS DE APOIO) */}
        {SAFE_SHELTERS.map(shelter => (
          <Marker 
            key={shelter.id} 
            position={[shelter.lat, shelter.lng]}
            icon={shelterIcon}
          >
            {interactive && (
              <Popup closeButton={true}>
                <div className="min-w-[140px]">
                  <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Ponto de Apoio</div>
                  <div className="text-sm font-black text-white leading-tight mb-2">{shelter.name}</div>
                  <div className="text-xs text-slate-300">{shelter.address}</div>
                </div>
              </Popup>
            )}
          </Marker>
        ))}

        {/* Stations Markers (Custom CSS Icons) */}
        {stations.map(station => (
          <Marker 
            key={station.id} 
            position={[station.location.lat, station.location.lng]}
            icon={createStationIcon(station.status)}
          >
            {interactive && (
              <Popup closeButton={true}>
                <div className="min-w-[120px]">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{station.id}</div>
                  <div className="text-sm font-black text-white leading-tight mb-2">{station.name.split(' - ')[1]}</div>
                  <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                    <div className="flex flex-col">
                       <span className="text-[10px] text-slate-400">Nível</span>
                       <span className="text-xs font-bold text-white">{station.lastReading.waterLevel}cm</span>
                    </div>
                    <div className="h-6 w-px bg-white/10 mx-auto"></div>
                    <div className="flex flex-col text-right">
                       <span className="text-[10px] text-slate-400">Chuva</span>
                       <span className="text-xs font-bold text-brand-neon">{station.lastReading.rainfall}mm</span>
                    </div>
                  </div>
                </div>
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>

      {/* Floating Legend */}
      <div className="absolute bottom-4 right-4 z-[400] pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-2xl flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_5px_#00E5FF]"></div>
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">{t.legendRiver}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-sm bg-red-500/80 border border-red-500"></div>
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">{t.legendRiskHigh}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full border-2 border-white bg-green-500"></div>
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">{t.legendStations}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-3 h-3 bg-emerald-600 border border-white rounded text-[6px] text-white">🏠</div>
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">{t.legendShelters}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;