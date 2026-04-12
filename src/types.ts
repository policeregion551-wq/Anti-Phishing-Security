export interface AnalysisResult {
  isSafe: boolean;
  score: number; // 0 to 100, where 100 is perfectly safe
  threatType: 'none' | 'phishing' | 'malware' | 'scam' | 'suspicious';
  reason: string;
  recommendation: string;
  details: {
    urgency: 'low' | 'medium' | 'high';
    socialEngineeringTechniques: string[];
    suspiciousElements: string[];
  };
}

export interface UserProfile {
  uid: string;
  name: string;
  phone: string;
  email: string;
  isPro: boolean;
  role: 'admin' | 'user';
  createdAt: string;
  paymentStatus?: 'pending' | 'completed';
}

export interface ConnectionStatus {
  id: string;
  name: string;
  platform: 'telegram' | 'facebook' | 'whatsapp' | 'system';
  isConnected: boolean;
  lastSync: string | null;
  autoScan: boolean;
}

export interface SecurityLog {
  id: string;
  timestamp: string;
  content: string;
  source: 'telegram' | 'facebook' | 'whatsapp' | 'system' | 'manual';
  result: AnalysisResult;
}

export interface DailyStats {
  date: string;
  scanned: number;
  threats: number;
}
