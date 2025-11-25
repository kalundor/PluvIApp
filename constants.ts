

import { Station, AlertLevel, AlertEvent, HourlyForecast, DailyForecast, WeatherCondition, Shelter } from './types';

export const WHATSAPP_LINK_URL = "https://wa.me/5521974619423?text=Ol%C3%A1%2C%20vim%20pelo%20site%20*PluvIA*!%F0%9F%98%81";

// Safe Shelters (Pontos de Apoio) near Rio Botas
export const SAFE_SHELTERS: Shelter[] = [
  {
    id: 'shelter-001',
    name: 'Escola Municipal Comendador Soares',
    address: 'Rua dos Quartéis, 150 - Nova Iguaçu',
    lat: -22.7540,
    lng: -43.4650,
    capacity: 200,
    type: 'school'
  },
  {
    id: 'shelter-002',
    name: 'Ginásio Poliesportivo Heliópolis',
    address: 'Av. Heliópolis, 500 - Belford Roxo',
    lat: -22.7450,
    lng: -43.4100,
    capacity: 500,
    type: 'gym'
  },
  {
    id: 'shelter-003',
    name: 'Igreja Matriz de Belford Roxo',
    address: 'Praça Central - Centro',
    lat: -22.7300,
    lng: -43.3600,
    capacity: 150,
    type: 'church'
  }
];

// Generate 72 hours of hourly forecast for "Trip Planner"
const generateFutureForecast = (): HourlyForecast[] => {
  const forecast: HourlyForecast[] = [];
  const conditions: WeatherCondition[] = ['sunny', 'partly-cloudy', 'cloudy', 'rainy', 'storm'];
  
  const now = new Date();
  
  for (let i = 0; i < 72; i++) {
    const time = new Date(now.getTime() + (i * 3600000));
    
    // Simple mock weather pattern: Rain likely in late afternoon
    const hour = time.getHours();
    let conditionIndex = 1;
    let precip = 10;
    
    if (hour >= 16 && hour <= 20) {
      conditionIndex = 3 + Math.floor(Math.random() * 2); // Rainy or Storm
      precip = 60 + Math.floor(Math.random() * 40);
    } else if (hour >= 10 && hour <= 15) {
      conditionIndex = 0 + Math.floor(Math.random() * 2); // Sunny or Partly
      precip = 0;
    }

    forecast.push({
      time: time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }),
      timestamp: time.getTime(),
      temp: 20 + Math.floor(Math.random() * 10),
      condition: conditions[conditionIndex],
      precipChance: precip
    });
  }
  return forecast;
};

export const MOCK_HOURLY_FORECAST: HourlyForecast[] = generateFutureForecast();

export const MOCK_DAILY_FORECAST: DailyForecast[] = [
  { day: 'Hoje', minTemp: 22, maxTemp: 30, condition: 'rainy', precipChance: 80 },
  { day: 'Amanhã', minTemp: 21, maxTemp: 26, condition: 'storm', precipChance: 95 },
  { day: 'Quarta', minTemp: 20, maxTemp: 25, condition: 'rainy', precipChance: 60 },
  { day: 'Quinta', minTemp: 21, maxTemp: 28, condition: 'cloudy', precipChance: 30 },
  { day: 'Sexta', minTemp: 22, maxTemp: 29, condition: 'sunny', precipChance: 10 },
];

// Updated to generate 7 days of realistic history
// Logic: Include a past "storm event" around 3-4 days ago to make the 7-day chart interesting
const generateHistory = (baseLevel: number, variability: number, isRaining: boolean) => {
  const points = 336; // 7 days * 24h * 2 readings/hr
  const now = Date.now();
  
  return Array.from({ length: points }, (_, i) => {
    const timestamp = now - i * 1800000; // Go backwards 30 mins
    const time = new Date(timestamp);
    const hour = time.getHours();
    
    // Simulate solar curve
    let solarV = 0;
    if (hour > 6 && hour < 18) {
      solarV = Math.sin(((hour - 6) / 12) * Math.PI) * 5.5 + (Math.random() * 0.5);
    }

    // Simulate battery charge/discharge
    const batteryV = solarV > 3 ? 4.2 : 3.7 - (0.1 * (Math.abs(12 - hour) / 12));
    
    // --- EVENTO DE CHEIA PASSADA (SIMULAÇÃO) ---
    // Simula uma chuva forte entre 72h (3 dias) e 84h atrás
    // Indices aproximados: 144 a 168 (30min steps)
    let floodSurge = 0;
    let rainSurge = 0;
    
    if (i > 140 && i < 170) {
      // Pico do evento
      floodSurge = Math.sin(((i - 140) / 30) * Math.PI) * 150; // Sobe até +150cm
      rainSurge = Math.random() * 40;
    } else if (i >= 170 && i < 200) {
      // Vazante (descida)
       floodSurge = 150 * Math.exp(-(i - 170) / 20);
    }

    // Nível atual (base) + Ondulação natural + Evento Passado
    const calculatedLevel = Math.max(0, baseLevel + Math.sin(i * 0.05) * variability + (Math.random() * 5) + floodSurge);

    // Chuva atual ou histórica
    const currentRain = (isRaining && i < 50) ? Math.random() * 15 : 0;
    
    return {
      timestamp: time.toISOString(),
      waterLevel: calculatedLevel,
      rainfall: currentRain + rainSurge,
      battery: Math.min(100, Math.max(0, (batteryV - 3.2) * 100)),
      batteryVoltage: batteryV,
      solarVoltage: Math.max(0, solarV),
      signalStrength: -80 + Math.random() * 10
    };
  }).reverse(); // Reverte para ficar cronológico (Antigo -> Novo)
};

// Detailed Rio Botas Path Coordinates
export const RIO_BOTAS_PATH: [number, number][] = [
  [-22.7600, -43.4650], [-22.7590, -43.4625], [-22.7580, -43.4600],
  [-22.7562, -43.4608], [-22.7550, -43.4580], [-22.7540, -43.4550],
  [-22.7530, -43.4500], [-22.7520, -43.4450], [-22.7510, -43.4400],
  [-22.7500, -43.4350], [-22.7490, -43.4300], [-22.7485, -43.4250],
  [-22.7480, -43.4150], [-22.7470, -43.4100], [-22.7460, -43.4050],
  [-22.7440, -43.4000], [-22.7420, -43.3950], [-22.7400, -43.3900],
  [-22.7380, -43.3850], [-22.7360, -43.3820], [-22.7350, -43.3800],
  [-22.7335, -43.3750], [-22.7320, -43.3700], [-22.7310, -43.3650],
  [-22.7305, -43.3600], [-22.7300, -43.3550], [-22.7295, -43.3500],
  [-22.7290, -43.3450], [-22.7285, -43.3425], [-22.7280, -43.3400],
  [-22.7265, -43.3325], [-22.7250, -43.3250], [-22.7240, -43.3200],
  [-22.7230, -43.3150], [-22.7220, -43.3120], [-22.7214, -43.3087]
];

// Simulated Risk Zones (Polygons)
export const RISK_ZONES = [
  {
    type: 'HIGH_RISK',
    coords: [
      [-22.7460, -43.4200], [-22.7520, -43.4200],
      [-22.7520, -43.4050], [-22.7460, -43.4050],
    ] as [number, number][]
  },
  {
    type: 'MODERATE_RISK',
    coords: [
      [-22.7290, -43.3750], [-22.7380, -43.3750],
      [-22.7380, -43.3600], [-22.7290, -43.3600],
    ] as [number, number][]
  }
];

export const MOCK_STATIONS: Station[] = [
  {
    id: 'botas-001',
    name: 'Rio Botas - P1 (Nova Iguaçu)',
    location: { lat: -22.7562, lng: -43.4608, address: 'Rua dos Quartéis - Comendador Soares' },
    status: AlertLevel.SAFE,
    thresholds: { warning: 180, critical: 250, sensorHeight: 400 },
    lastReading: { timestamp: new Date().toISOString(), waterLevel: 85, rainfall: 0, battery: 98, batteryVoltage: 4.1, solarVoltage: 0, signalStrength: -75 },
    history: generateHistory(85, 15, false),
    nearestShelterId: 'shelter-001'
  },
  {
    id: 'botas-002',
    name: 'Rio Botas - P2 (Heliópolis)',
    location: { lat: -22.7480, lng: -43.4150, address: 'Ponte de Heliópolis' },
    status: AlertLevel.WARNING,
    thresholds: { warning: 200, critical: 300, sensorHeight: 450 },
    lastReading: { timestamp: new Date().toISOString(), waterLevel: 210, rainfall: 15.5, battery: 88, batteryVoltage: 3.9, solarVoltage: 1.2, signalStrength: -82 },
    history: generateHistory(210, 25, true),
    nearestShelterId: 'shelter-002'
  },
  {
    id: 'botas-003',
    name: 'Rio Botas - P3 (Belford Roxo)',
    location: { lat: -22.7310, lng: -43.3650, address: 'Av. Dr. Carvalhães' },
    status: AlertLevel.CRITICAL,
    thresholds: { warning: 250, critical: 350, sensorHeight: 500 },
    lastReading: { timestamp: new Date().toISOString(), waterLevel: 360, rainfall: 32.0, battery: 75, batteryVoltage: 3.8, solarVoltage: 0.8, signalStrength: -88 },
    history: generateHistory(355, 30, true),
    nearestShelterId: 'shelter-003'
  },
  {
    id: 'botas-004',
    name: 'Rio Botas - Foz (Rio Iguaçu)',
    location: { lat: -22.7214, lng: -43.3087, address: 'Confluência Rio Iguaçu' },
    status: AlertLevel.OFFLINE,
    thresholds: { warning: 300, critical: 400, sensorHeight: 600 },
    lastReading: { timestamp: new Date(Date.now() - 86400000).toISOString(), waterLevel: 150, rainfall: 0, battery: 10, batteryVoltage: 3.2, solarVoltage: 0, signalStrength: -98 },
    history: generateHistory(150, 5, false),
    nearestShelterId: 'shelter-003'
  }
];

export const MOCK_ALERTS: AlertEvent[] = [
  { id: 'evt-101', stationId: 'botas-003', stationName: 'Rio Botas - P3 (Belford Roxo)', severity: AlertLevel.CRITICAL, timestamp: new Date().toISOString(), title: 'Nível Crítico Atingido', message: 'Nível da água ultrapassou 350cm. Risco iminente de transbordo.', acknowledged: false },
  { id: 'evt-102', stationId: 'botas-002', stationName: 'Rio Botas - P2 (Heliópolis)', severity: AlertLevel.WARNING, timestamp: new Date(Date.now() - 3600000).toISOString(), title: 'Aumento Rápido do Nível', message: 'O nível subiu 40cm na última hora devido à chuva forte.', acknowledged: false },
  { id: 'evt-103', stationId: 'botas-004', stationName: 'Rio Botas - Foz (Rio Iguaçu)', severity: AlertLevel.OFFLINE, timestamp: new Date(Date.now() - 86400000).toISOString(), title: 'Perda de Sinal', message: 'O sensor parou de responder.', acknowledged: true }
];