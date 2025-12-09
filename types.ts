
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
  notifications?: {
    signals: boolean;
    marketAlerts: boolean;
    updates: boolean;
  };
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
  strategy?: string; 
  // Notion-style Journaling Fields
  confluence?: string[]; // e.g. ["BOS", "FVG", "Fib 0.618"]
  emotions?: string; // e.g. "Confident", "FOMO", "Anxious"
  notes?: string; // Long form text
  rr?: number; // Realized Risk Reward
}

// NEW: Manual Pro Journal Entry
export interface JournalEntry {
  id: string;
  date: string;
  pair: string;
  direction: 'BUY' | 'SELL';
  setupType: string; // "Breakout", "Reversal", etc.
  lotSize: number;
  result: 'WIN' | 'LOSS' | 'BE';
  pnlAmount: number;
  accountBalanceAfter: number; // To track growth curve
  growthPercentage: number; // Trade growth impact
  notes: string;
  screenshot?: string; // Optional base64
}

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  plan: PlanTier;
  planExpiryDate?: string; // Added field for subscription expiration tracking
  signalsUsedLifetime: number; // For free plan
  signalsUsedToday: number;
  joinDate: string;
  settings: UserSettings;
  idTheme: string; // 'cyan', 'emerald', 'violet', etc.
  avatarImage?: string; // Base64 string for custom avatar
  tradeHistory: TradeLog[];
  journalEntries?: JournalEntry[]; // New field for Pro Journey
  lastDevice?: string; // For Admin tracking
  ipAddress?: string; // For Admin tracking
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
