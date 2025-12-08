
export enum PlanTier {
  FREE = 'FREE',
  BASIC = 'BASIC',
  ADVANCED = 'ADVANCED',
  PRO = 'PRO'
}

export enum AccountType {
  STANDARD = 'Standard',
  RAW = 'Raw',
  PRO = 'Pro'
}

export interface UserSettings {
  accountSize: number;
  riskPercentage: number;
  accountType: AccountType;
}

export interface TradeLog {
  id: string;
  date: string;
  pair: string;
  type: 'BUY' | 'SELL';
  entry: number;
  exit: number;
  pnl: number;
  status: 'WIN' | 'LOSS' | 'BE' | 'PENDING';
  timeframe?: string;
  reasoning?: string;
  sl?: number;
  tp1?: number;
  tp2?: number;
  strategy?: string; // e.g. "Order Block", "FVG"
}

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  plan: PlanTier;
  signalsUsedLifetime: number; // For free plan
  signalsUsedToday: number;
  joinDate: string;
  settings: UserSettings;
  idTheme: string; // 'cyan', 'emerald', 'violet', etc.
  avatarImage?: string; // Base64 string for custom avatar
  tradeHistory: TradeLog[];
}

export interface TradeSignal {
  id: string;
  timestamp: number;
  pair: string;
  timeframe: string;
  direction: 'BUY' | 'SELL';
  strategy: string; // e.g. "Order Block", "FVG Rejection"
  entry: number;
  sl: number;
  tp1: number;
  tp2: number;
  slPips: number;
  tpPips: number;
  lotSize: number;
  riskAmount: number;
  rewardTp1: number;
  rewardTp2: number;
  reasoning: string;
}

export interface AIAnalysisResponse {
  pair: string;
  timeframe: string;
  direction: string;
  strategy: string;
  entry: number;
  sl: number;
  tp1: number;
  tp2: number;
  reasoning: string;
  isSetupValid: boolean;
  marketStructure: string[]; // e.g. ["BOS", "FVG"]
}

export interface SystemConfig {
  allowSignups: boolean;
  maintenanceMode: boolean;
  globalAnnouncement: string;
  freeSignalLimit: number;
}

export interface AdminLog {
  id: string;
  adminUser: string;
  action: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  userId: string | 'ALL';
  message: string;
  type: 'INFO' | 'WARNING' | 'PROMO';
  read: boolean;
  date: string;
}
