

export type Language = 'pt-BR' | 'en-US';
export type AppMode = 'simplified' | 'technical' | 'alerts';

export enum AlertLevel {
  SAFE = 'safe',
  WARNING = 'warning',
  CRITICAL = 'critical',
  OFFLINE = 'offline'
}

export type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'storm' | 'partly-cloudy' | 'windy';

export interface HourlyForecast {
  time: string;
  temp: number;
  condition: WeatherCondition;
  precipChance: number;
  timestamp: number; // Added for easier sorting/filtering
}

export interface DailyForecast {
  day: string;
  minTemp: number;
  maxTemp: number;
  condition: WeatherCondition;
  precipChance: number;
}

export interface Reading {
  timestamp: string;
  waterLevel: number; // in cm (distance from sensor to water or depth)
  rainfall: number; // in mm/h
  battery: number; // percent 0-100
  batteryVoltage: number; // Volts (e.g., 3.7 - 4.2)
  solarVoltage: number; // Volts (e.g., 0 - 6.0)
  signalStrength: number; // dBm (e.g., -80)
}

export interface Shelter {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  capacity: number;
  type: 'school' | 'gym' | 'church' | 'center';
}

export interface Station {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  status: AlertLevel;
  lastReading: Reading;
  history: Reading[];
  thresholds: {
    warning: number;
    critical: number;
    sensorHeight: number; // Installation height of the sensor
  };
  nearestShelterId?: string; // Link to a shelter
}

export interface AlertEvent {
  id: string;
  stationId: string;
  stationName: string;
  severity: AlertLevel;
  timestamp: string;
  title: string;
  message: string;
  acknowledged: boolean;
}

export interface Translation {
  title: string;
  subtitle: string;
  simplifiedMode: string;
  technicalMode: string;
  online: string;
  offline: string;
  lastUpdated: string;
  waterLevel: string;
  rainfall: string;
  battery: string;
  solar: string;
  signal: string;
  viewDetails: string;
  contactSupport: string;
  safeStatus: string;
  warningStatus: string;
  criticalStatus: string;
  offlineStatus: string;
  mapView: string;
  listView: string;
  exportData: string;
  settings: string;
  language: string;
  darkMode: string;
  help: string;
  whatsappCta: string;
  whatsappDesc: string;
  enter: string;
  emergency: string;
  civilDefense: string;
  mapTitle: string;
  riskAnalysis: string;
  charts: string;
  history: string;
  forecast: string;
  alerts: string;
  home: string;
  simulationMode: string;
  
  // Status Messages
  statusSafeTitle: string;
  statusWarningTitle: string;
  statusCriticalTitle: string;
  statusOfflineTitle: string;
  statusSafeDesc: string;
  statusWarningDesc: string;
  statusCriticalDesc: string;
  statusOfflineDesc: string;

  // Technical View
  tabOverview: string;
  tabPower: string;
  tabLogs: string;
  sensorHeight: string;
  estRuntime: string;
  voltage: string;
  solarInput: string;
  days: string;
  hydrologyChart: string;
  powerChart: string;
  batteryLowTitle: string;
  batteryLowDesc: string;
  
  // Table Headers
  colTimestamp: string;
  colLevel: string;
  colRain: string;
  colBat: string;
  colSolar: string;
  colSignal: string;
  
  // Gauge
  gaugeLabel: string;
  
  // Community Advisory
  advisoryTitle: string;
  commuteTitle: string;
  commuteSafe: string;
  commuteWarn: string;
  commuteCrit: string;
  trashWarningTitle: string;
  trashWarningDesc: string;
  suggestionTitle: string;
  suggestionSafe: string;
  suggestionWarn: string;
  suggestionCrit: string;

  // Smart Dashboard
  dashMobilityTitle: string;
  dashPredictionTitle: string;
  dashTrendTitle: string;
  dashForecastTitle: string;
  trendRising: string;
  trendStable: string;
  trendFalling: string;
  aiProjection: string;
  mobilityGo: string;
  mobilityCaution: string;
  mobilityStop: string;
  rainProb: string;
  tempLabel: string;
  humidity: string;
  wind: string;
  feelsLike: string;

  // AI Panel & Planner
  aiPanelTitle: string;
  aiPlannerIntro: string;
  plannerTimeLabel: string;
  plannerStatusLabel: string;
  plannerSafe: string;
  plannerWarn: string;
  plannerCrit: string;
  plannerSafeDesc: string;
  plannerWarnDesc: string;
  plannerCritDesc: string;
  actionShare: string;
  actionSave: string;
  dayToday: string;
  dayTomorrow: string;
  dayAfter: string;
  chartProjected: string;
  chartThreshold: string;

  // Map Legend
  legendTitle: string;
  legendRiver: string;
  legendRiskHigh: string;
  legendRiskMod: string;
  legendStations: string;
  legendShelters: string;

  // Alerts View
  alertsViewTitle: string;
  filterAll: string;
  noAlerts: string;

  // Emergency Mode
  evacTitle: string;
  evacDesc: string;
  evacShelter: string;
  evacNavigate: string;
  evacClose: string;
}

export const TRANSLATIONS: Record<Language, Translation> = {
  'pt-BR': {
    title: 'PluvIA',
    subtitle: 'Monitoramento Inteligente',
    simplifiedMode: 'Comunidade',
    technicalMode: 'Técnico',
    online: 'Conectado',
    offline: 'Desconectado',
    lastUpdated: 'Atualizado há',
    waterLevel: 'Nível do Rio',
    rainfall: 'Chuva Agora',
    battery: 'Bateria',
    solar: 'Solar',
    signal: 'Sinal',
    viewDetails: 'Detalhes',
    contactSupport: 'Emergência? Ligue 199',
    safeStatus: 'Nível Normal',
    warningStatus: 'Atenção',
    criticalStatus: 'Alerta Máximo',
    offlineStatus: 'Sem Sinal',
    mapView: 'Mapa',
    listView: 'Lista',
    exportData: 'Exportar CSV',
    settings: 'Ajustes',
    language: 'Idioma',
    darkMode: 'Modo Escuro',
    help: 'Ajuda',
    whatsappCta: 'Receber Alertas no WhatsApp',
    whatsappDesc: 'Receba avisos da Defesa Civil agora.',
    enter: 'Entrar',
    emergency: 'Emergência?',
    civilDefense: 'Defesa Civil / Bombeiros',
    mapTitle: 'Mapa do Rio Botas',
    riskAnalysis: 'Análise de Risco',
    charts: 'Gráficos',
    history: 'Histórico',
    forecast: 'Previsão',
    alerts: 'Alertas',
    home: 'Início',
    simulationMode: 'Modo Simulação',

    statusSafeTitle: 'Rio Botas: Nível Normal',
    statusWarningTitle: 'Rio Botas: Subindo Rápido!',
    statusCriticalTitle: 'Rio Botas: Perigo de Transbordo!',
    statusOfflineTitle: 'Sistema Offline',
    statusSafeDesc: 'O fluxo segue livre. Sem riscos imediatos nas pontes.',
    statusWarningDesc: 'Chuva forte na cabeceira. Evite áreas baixas e margens.',
    statusCriticalDesc: 'Saia imediatamente de áreas de risco. Risco de alagamento severo.',
    statusOfflineDesc: 'Verifique fontes oficiais da Defesa Civil.',

    tabOverview: 'Visão Geral',
    tabPower: 'Energia & IoT',
    tabLogs: 'Logs Brutos',
    sensorHeight: 'Altura Sensor',
    estRuntime: 'Autonomia',
    voltage: 'Tensão',
    solarInput: 'Entrada Solar',
    days: 'dias',
    hydrologyChart: 'Nível do Rio',
    powerChart: 'Ciclo de Energia',
    batteryLowTitle: 'Bateria Crítica',
    batteryLowDesc: 'Nível de energia abaixo de 20%. Recomenda-se manutenção imediata.',

    colTimestamp: 'Hora',
    colLevel: 'Nível (cm)',
    colRain: 'Chuva (mm)',
    colBat: 'Bat (V)',
    colSolar: 'Solar (V)',
    colSignal: 'Sinal',
    
    gaugeLabel: 'Nível',

    advisoryTitle: 'Painel de Decisão & Previsão',
    commuteTitle: 'Mobilidade',
    commuteSafe: 'Sim, horário seguro para deslocamento.',
    commuteWarn: 'Evite sair. Se necessário, não atravesse pontes.',
    commuteCrit: 'NÃO SAIA. Permaneça em local alto e seguro.',
    trashWarningTitle: 'Alerta de Resíduos',
    trashWarningDesc: 'Risco de represamento por lixo e entulhos no leito do rio. Não descarte lixo nas margens.',
    suggestionTitle: 'Recomendação Agora',
    suggestionSafe: 'Aproveite o dia. Monitore o app se começar a chover.',
    suggestionWarn: 'Prepare documentos e remédios. Fique atento às sirenes.',
    suggestionCrit: 'Siga a rota de fuga para o ponto de apoio mais próximo.',

    dashMobilityTitle: 'Status de Deslocamento',
    dashPredictionTitle: 'IA: Projeção de Nível',
    dashTrendTitle: 'Tendência (1h)',
    dashForecastTitle: 'Previsão do Tempo',
    trendRising: 'Subindo',
    trendStable: 'Estável',
    trendFalling: 'Baixando',
    aiProjection: 'Projeção',
    mobilityGo: 'Pode Sair',
    mobilityCaution: 'Atenção',
    mobilityStop: 'Não Saia',
    rainProb: 'Chuva',
    tempLabel: 'Temp',
    humidity: 'Umidade',
    wind: 'Vento',
    feelsLike: 'Sensação',

    aiPanelTitle: 'Planejar Deslocamento',
    aiPlannerIntro: 'Escolha um horário para ver a previsão de segurança do rio e evitar áreas de risco.',
    plannerTimeLabel: 'Horário de Saída',
    plannerStatusLabel: 'Previsão para este horário',
    plannerSafe: 'Seguro para Ir',
    plannerWarn: 'Cuidado ao Sair',
    plannerCrit: 'NÃO RECOMENDADO',
    plannerSafeDesc: 'Nível do rio baixo. Sem chuva forte prevista.',
    plannerWarnDesc: 'Nível em elevação. Evite áreas ribeirinhas.',
    plannerCritDesc: 'Risco de alagamento alto. Fique em local seguro.',
    actionShare: 'Compartilhar',
    actionSave: 'Salvar',
    dayToday: 'Hoje',
    dayTomorrow: 'Amanhã',
    dayAfter: 'Em 3 Dias',
    chartProjected: 'Nível Previsto',
    chartThreshold: 'Cota de Alerta',

    legendTitle: 'Legenda do Mapa',
    legendRiver: 'Curso do Rio Botas',
    legendRiskHigh: 'Área de Risco Alto (Alagamento)',
    legendRiskMod: 'Área de Atenção',
    legendStations: 'Sensores PluvIA',
    legendShelters: 'Pontos de Apoio (Abrigos)',

    alertsViewTitle: 'Central de Notificações',
    filterAll: 'Todas',
    noAlerts: 'Nenhum alerta registrado no período.',

    evacTitle: 'ALERTA DE EVACUAÇÃO',
    evacDesc: 'Nível crítico atingido. Dirija-se imediatamente ao ponto de apoio.',
    evacShelter: 'Abrigo Mais Próximo',
    evacNavigate: 'Traçar Rota',
    evacClose: 'Fechar Aviso',
  },
  'en-US': {
    title: 'PluvIA',
    subtitle: 'Smart Monitoring',
    simplifiedMode: 'Community',
    technicalMode: 'Technical',
    online: 'Online',
    offline: 'Offline',
    lastUpdated: 'Updated',
    waterLevel: 'River Level',
    rainfall: 'Current Rain',
    battery: 'Battery',
    solar: 'Solar',
    signal: 'Signal',
    viewDetails: 'Details',
    contactSupport: 'Emergency? Call 911',
    safeStatus: 'Normal Level',
    warningStatus: 'Warning',
    criticalStatus: 'Danger',
    offlineStatus: 'No Signal',
    mapView: 'Map',
    listView: 'List',
    exportData: 'Export CSV',
    settings: 'Settings',
    language: 'Language',
    darkMode: 'Dark Mode',
    help: 'Help',
    whatsappCta: 'Get WhatsApp Alerts',
    whatsappDesc: 'Get Civil Defense alerts now.',
    enter: 'Enter',
    emergency: 'Emergency?',
    civilDefense: 'Civil Defense / Firefighters',
    mapTitle: 'Rio Botas Map',
    riskAnalysis: 'Risk Analysis',
    charts: 'Charts',
    history: 'History',
    forecast: 'Forecast',
    alerts: 'Alerts',
    home: 'Home',
    simulationMode: 'Simulation Mode',

    statusSafeTitle: 'Rio Botas: Normal Level',
    statusWarningTitle: 'Rio Botas: Rising Fast!',
    statusCriticalTitle: 'Rio Botas: Flood Danger!',
    statusOfflineTitle: 'System Offline',
    statusSafeDesc: 'Flow is clear. No immediate bridge risks.',
    statusWarningDesc: 'Heavy rain upstream. Avoid low-lying areas.',
    statusCriticalDesc: 'Evacuate risk areas immediately. Severe flood risk.',
    statusOfflineDesc: 'Check official sources.',

    tabOverview: 'Overview',
    tabPower: 'Power & IoT',
    tabLogs: 'Raw Logs',
    sensorHeight: 'Sensor Height',
    estRuntime: 'Est. Runtime',
    voltage: 'Voltage',
    solarInput: 'Solar Input',
    days: 'days',
    hydrologyChart: 'River Level',
    powerChart: 'Power Cycle',
    batteryLowTitle: 'Battery Critical',
    batteryLowDesc: 'Energy level below 20%. Immediate maintenance recommended.',

    colTimestamp: 'Timestamp',
    colLevel: 'Level (cm)',
    colRain: 'Rain (mm)',
    colBat: 'Bat (V)',
    colSolar: 'Solar (V)',
    colSignal: 'Signal',
    
    gaugeLabel: 'Level',

    advisoryTitle: 'Decision & Forecast Dashboard',
    commuteTitle: 'Mobility',
    commuteSafe: 'Yes, safe time for commuting.',
    commuteWarn: 'Avoid going out. Do not cross bridges.',
    commuteCrit: 'DO NOT GO OUT. Stay in high, safe ground.',
    trashWarningTitle: 'Debris Warning',
    trashWarningDesc: 'Risk of blockage due to trash and debris in the riverbed.',
    suggestionTitle: 'Recommendation Now',
    suggestionSafe: 'Enjoy your day. Check app if rain starts.',
    suggestionWarn: 'Pack documents and meds. Listen for sirens.',
    suggestionCrit: 'Follow escape route to nearest support point.',

    dashMobilityTitle: 'Commute Status',
    dashPredictionTitle: 'AI: Level Projection',
    dashTrendTitle: 'Trend (1h)',
    dashForecastTitle: 'Weather Forecast',
    trendRising: 'Rising',
    trendStable: 'Stable',
    trendFalling: 'Falling',
    aiProjection: 'Projection',
    mobilityGo: 'Safe to Go',
    mobilityCaution: 'Caution',
    mobilityStop: 'Do Not Go',
    rainProb: 'Rain',
    tempLabel: 'Temp',
    humidity: 'Humidity',
    wind: 'Wind',
    feelsLike: 'Feels Like',

    aiPanelTitle: 'Plan Commute',
    aiPlannerIntro: 'Choose a time to see river safety forecast and avoid risk areas.',
    plannerTimeLabel: 'Departure Time',
    plannerStatusLabel: 'Forecast for this time',
    plannerSafe: 'Safe to Go',
    plannerWarn: 'Caution advised',
    plannerCrit: 'NOT RECOMMENDED',
    plannerSafeDesc: 'River level low. No heavy rain expected.',
    plannerWarnDesc: 'Levels rising. Avoid riverside areas.',
    plannerCritDesc: 'High flood risk. Stay in safe location.',
    actionShare: 'Share',
    actionSave: 'Save',
    dayToday: 'Today',
    dayTomorrow: 'Tomorrow',
    dayAfter: 'In 3 Days',
    chartProjected: 'Projected Level',
    chartThreshold: 'Alert Threshold',

    legendTitle: 'Map Legend',
    legendRiver: 'Rio Botas Course',
    legendRiskHigh: 'High Risk Zone (Flooding)',
    legendRiskMod: 'Warning Zone',
    legendStations: 'PluvIA Sensors',
    legendShelters: 'Safe Shelters',

    alertsViewTitle: 'Notification Center',
    filterAll: 'All',
    noAlerts: 'No alerts recorded in this period.',

    evacTitle: 'EVACUATION ALERT',
    evacDesc: 'Critical level reached. Go immediately to the safe point.',
    evacShelter: 'Nearest Shelter',
    evacNavigate: 'Navigate',
    evacClose: 'Close Warning',
  }
};