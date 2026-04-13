import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  History, 
  BarChart3, 
  Settings, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  ExternalLink,
  MessageSquare,
  Zap,
  Lock,
  ArrowRight,
  Search,
  AlertCircle,
  Download,
  CreditCard,
  Link2,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Facebook,
  Send,
  Smartphone,
  Languages,
  Printer,
  Trash2,
  Plus,
  Eye,
  Wallet,
  Users,
  TrendingUp,
  Code,
  FileCode,
  Upload,
  Activity,
  Check,
  X,
  FileText,
  Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { analyzeContent } from '@/lib/gemini';
import { AnalysisResult, SecurityLog, DailyStats, ConnectionStatus, UserProfile, AuditResult, SocialAccount, AdminStats } from '@/types';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { auth, db } from '@/lib/firebase';
import AuthSystem from './AuthSystem';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  limit,
  Timestamp,
  doc,
  getDoc,
  updateDoc,
  getDocs
} from 'firebase/firestore';

const SIMULATED_THREATS = [
  "Your account will be suspended. Click here to verify: http://bit.ly/secure-auth-99",
  "You won a $500 Amazon Gift Card! Claim now: https://amazon-rewards-free.net/win",
  "New login detected from Russia. If this wasn't you, secure your account: http://security-check.com",
  "Check out these leaked photos of you! http://social-media-leaks.xyz/photo",
  "URGENT: Your bank account has been locked. Unlock here: https://bank-verify-identity.org"
];

const MOCK_STATS: DailyStats[] = [
  { date: 'Apr 06', scanned: 45, threats: 2 },
  { date: 'Apr 07', scanned: 52, threats: 5 },
  { date: 'Apr 08', scanned: 38, threats: 1 },
  { date: 'Apr 09', scanned: 65, threats: 8 },
  { date: 'Apr 10', scanned: 48, threats: 3 },
  { date: 'Apr 11', scanned: 72, threats: 12 },
  { date: 'Apr 12', scanned: 24, threats: 4 },
];

// Translations
const translations = {
  en: {
    dashboard: "Dashboard",
    scanner: "AI Scanner",
    reports: "Reports",
    connections: "Connections",
    audit: "Security Audit",
    admin: "Admin Panel",
    upgrade: "Upgrade to Pro",
    logout: "Logout",
    login: "Login",
    systemHealth: "System Health",
    totalScanned: "Total Scanned",
    threatsBlocked: "Threats Blocked",
    activeMonitoring: "Active Monitoring",
    scanning: "Scanning...",
    analyze: "Analyze Content",
    placeholder: "Paste URL or message to analyze...",
    recentLogs: "Recent Security Logs",
    noLogs: "No security logs found.",
    safe: "Safe",
    unsafe: "Unsafe",
    revenue: "Total Revenue",
    withdraw: "Withdraw Funds",
    users: "Total Users",
    print: "Print Report",
    download: "Download PDF",
    auditTitle: "System Security Audit",
    auditDesc: "Upload code or enter URL for a deep security verification.",
    socialTitle: "Social Account Protection",
    socialDesc: "Connect your accounts to enable automatic hack protection.",
    addAccount: "Add Account Link",
    monitoring: "Monitoring",
    protected: "Protected",
    alert: "Threat Detected",
    howItWorks: "How it works?",
    privacyGuaranteed: "Privacy Guaranteed",
    encrypted: "End-to-End Encrypted",
    auditTarget: "Audit Target (URL or Code Folder)",
    startAudit: "Start Security Audit",
    auditSummary: "Audit Summary",
    findings: "Security Findings",
    certificate: "Security Certificate",
    pass: "PASS",
    fail: "FAIL",
    warning: "WARNING"
  },
  am: {
    dashboard: "ዳሽቦርድ",
    scanner: "AI ስካነር",
    reports: "ሪፖርቶች",
    connections: "ትስስሮች",
    audit: "የደህንነት ምርመራ",
    admin: "የአድሚን ገጽ",
    upgrade: "ወደ ፕሮ ያሳድጉ",
    logout: "ውጣ",
    login: "ይግቡ",
    systemHealth: "የሲስተም ጤንነት",
    totalScanned: "ጠቅላላ የተመረመረ",
    threatsBlocked: "የተከለከሉ ጥቃቶች",
    activeMonitoring: "ንቁ ክትትል",
    scanning: "በመመርመር ላይ...",
    analyze: "ይመርምሩ",
    placeholder: "ሊንክ ወይም መልዕክት እዚህ ይለጥፉ...",
    recentLogs: "የቅርብ ጊዜ የደህንነት መዝገቦች",
    noLogs: "ምንም የደህንነት መዝገብ አልተገኘም።",
    safe: "ደህንነቱ የተጠበቀ",
    unsafe: "አደገኛ",
    revenue: "ጠቅላላ ገቢ",
    withdraw: "ገንዘብ አውጣ",
    users: "ጠቅላላ ተጠቃሚዎች",
    print: "ሪፖርት አትም",
    download: "አውርድ",
    auditTitle: "የሲስተም ደህንነት ማረጋገጫ",
    auditDesc: "የኮድ ፋይል ወይም ሊንክ በማስገባት ጥልቅ የደህንነት ምርመራ ያድርጉ።",
    socialTitle: "የማህበራዊ ሚዲያ ጥበቃ",
    socialDesc: "አካውንቶችዎን በማገናኘት አውቶማቲክ የሀክ ጥበቃ ያግኙ።",
    addAccount: "የአካውንት ሊንክ ጨምር",
    monitoring: "በክትትል ላይ",
    protected: "የተጠበቀ",
    alert: "ጥቃት ተገኝቷል",
    howItWorks: "እንዴት ነው የሚሰራው?",
    privacyGuaranteed: "ግላዊነት የተጠበቀ",
    encrypted: "ሙሉ በሙሉ የተመሰጠረ",
    auditTarget: "የምርመራ ኢላማ (URL ወይም የኮድ ፎልደር)",
    startAudit: "የደህንነት ምርመራ ጀምር",
    auditSummary: "የምርመራ ማጠቃለያ",
    findings: "የደህንነት ግኝቶች",
    certificate: "የደህንነት ማረጋገጫ",
    pass: "አልፏል",
    fail: "አልወደቀም",
    warning: "ማስጠንቀቂያ"
  }
};

export default function SecurityDashboard() {
  const [lang, setLang] = useState<'en' | 'am'>('en');
  const t = translations[lang];

  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isPro, setIsPro] = useState(false);
  const [connections, setConnections] = useState<ConnectionStatus[]>([]);
  const [isAutoScanning, setIsAutoScanning] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'telebirr' | 'cbe' | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Admin States
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalUsers: 0,
    totalRevenue: 0,
    activeAudits: 0,
    blockedAttacks: 0
  });

  // Audit States
  const [auditTarget, setAuditTarget] = useState('');
  const [auditType, setAuditType] = useState<'url' | 'code'>('url');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResults, setAuditResults] = useState<AuditResult[]>([]);
  const [currentAudit, setCurrentAudit] = useState<any>(null);

  // Social Monitoring States
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [newSocialLink, setNewSocialLink] = useState('');
  const [newSocialPlatform, setNewSocialPlatform] = useState<SocialAccount['platform']>('telegram');

  // Mounted check
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const profile = docSnap.data() as UserProfile;
          setUserProfile(profile);
          setIsPro(profile.isPro || profile.role === 'admin');
        }
        
        // Load Admin Stats if admin
        if ((currentUser as any).role === 'admin' || currentUser.email === 'policeregion551@gmail.com') {
          loadAdminStats();
        }
      } else {
        setUserProfile(null);
        setIsPro(false);
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loadAdminStats = async () => {
    // In real app, fetch from Firestore
    setAdminStats({
      totalUsers: 1240,
      totalRevenue: 45200,
      activeAudits: 15,
      blockedAttacks: 842
    });
  };

  const handleAudit = async () => {
    if (!auditTarget) return;
    setIsAuditing(true);
    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: auditTarget, type: auditType })
      });
      const data = await response.json();
      const newAudit: AuditResult = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        target: auditTarget,
        type: auditType,
        ...data
      };
      setAuditResults(prev => [newAudit, ...prev]);
      setCurrentAudit(newAudit);
      toast.success("Security Audit Completed!");
    } catch (error) {
      toast.error("Audit failed");
    } finally {
      setIsAuditing(false);
    }
  };

  const addSocialAccount = () => {
    if (!newSocialLink) return;
    const newAcc: SocialAccount = {
      id: Math.random().toString(36).substr(2, 9),
      platform: newSocialPlatform,
      link: newSocialLink,
      status: 'monitoring',
      attackCount: 0
    };
    setSocialAccounts(prev => [...prev, newAcc]);
    setNewSocialLink('');
    toast.success(`${newSocialPlatform} account added for monitoring`);
  };

  const handlePrint = () => {
    window.print();
  };

  // Firestore Real-time Logs
  useEffect(() => {
    if (!user) {
      setLogs([]);
      return;
    }

    const q = query(
      collection(db, 'security_logs'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newLogs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SecurityLog[];
      setLogs(newLogs);
    }, (error) => {
      console.error("Firestore error:", error);
      if (error.message.includes('permission-denied')) {
        toast.error("Security Rules error. Please check Firestore rules.");
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success("Successfully logged in!");
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Login failed. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.info("Logged out.");
    } catch (error) {
      toast.error("Logout failed.");
    }
  };

  // Simulated Auto-Scan Logic
  useEffect(() => {
    if (!isAutoScanning || !user) return;

    const interval = setInterval(async () => {
      if (Math.random() > 0.9) { // Reduced frequency for demo
        const randomThreat = SIMULATED_THREATS[Math.floor(Math.random() * SIMULATED_THREATS.length)];
        const sources: SecurityLog['source'][] = ['telegram', 'whatsapp', 'facebook', 'system'];
        const randomSource = sources[Math.floor(Math.random() * sources.length)];
        
        const conn = connections.find(c => c.platform === randomSource);
        if (conn?.isConnected && conn?.autoScan) {
          try {
            const result = await analyzeContent(randomThreat);
            
            // Save to Firestore
            await addDoc(collection(db, 'security_logs'), {
              userId: user.uid,
              timestamp: new Date().toISOString(),
              content: randomThreat,
              source: randomSource,
              result
            });
            
            if (!result.isSafe) {
              toast.error(`Auto-Scan: Threat detected on ${randomSource.toUpperCase()}`, {
                description: result.reason
              });
            }
          } catch (e) {
            console.error("Auto-scan failed", e);
          }
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isAutoScanning, connections, user]);

  const handlePayment = async () => {
    if (!user || !paymentMethod) return;
    
    setIsPaying(true);
    toast.info(`Redirecting to ${paymentMethod === 'telebirr' ? 'Telebirr' : 'CBE'}...`);
    
    // Simulate payment flow
    setTimeout(async () => {
      try {
        const docRef = doc(db, 'users', user.uid);
        await updateDoc(docRef, {
          isPro: true,
          paymentStatus: 'completed'
        });
        
        setIsPro(true);
        setIsPaying(false);
        setPaymentMethod(null);
        toast.success("Payment Successful!", {
          description: "Welcome to ShieldAI Pro. Your account has been upgraded."
        });
        setActiveTab('dashboard');
      } catch (error) {
        toast.error("Payment update failed.");
        setIsPaying(false);
      }
    }, 3000);
  };
  const handleAnalyze = async () => {
    if (!input.trim() || !user) return;
    
    setIsAnalyzing(true);
    toast.info("Analyzing content for threats...");
    
    try {
      const result = await analyzeContent(input);
      
      // Save to Firestore
      await addDoc(collection(db, 'security_logs'), {
        userId: user.uid,
        timestamp: new Date().toISOString(),
        content: input,
        source: 'manual',
        result
      });
      
      setInput('');
      
      if (result.isSafe) {
        toast.success("Content appears to be safe.");
      } else {
        toast.error(`Threat detected: ${result.threatType.toUpperCase()}`, {
          description: result.reason
        });
      }
    } catch (error) {
      toast.error("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const totalScanned = logs.length + 340; // Simulated historical data
  const threatsBlocked = logs.filter(l => !l.result.isSafe).length + 42;
  const safetyScore = 94;

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-100 font-sans selection:bg-blue-500/30">
      <Toaster position="top-right" theme="dark" />
      
      {/* Navigation */}
      <nav className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                <Shield className="text-white w-6 h-6" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent leading-none">
                  ShieldAI
                </span>
                <div className="text-[8px] font-mono text-blue-400 uppercase tracking-tighter leading-none mt-1">
                  By Asst. Eng. Biniyam Yirsaw Metina
                </div>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}
              >
                {t.dashboard}
              </button>
              <button 
                onClick={() => setActiveTab('analysis')}
                className={`text-sm font-medium transition-colors ${activeTab === 'analysis' ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}
              >
                {t.scanner}
              </button>
              <button 
                onClick={() => setActiveTab('audit')}
                className={`text-sm font-medium transition-colors ${activeTab === 'audit' ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}
              >
                {t.audit}
              </button>
              <button 
                onClick={() => setActiveTab('connections')}
                className={`text-sm font-medium transition-colors ${activeTab === 'connections' ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}
              >
                {t.connections}
              </button>
              {user?.role === 'admin' && (
                <button 
                  onClick={() => setActiveTab('admin')}
                  className={`text-sm font-medium transition-colors ${activeTab === 'admin' ? 'text-amber-400' : 'text-slate-400 hover:text-white'}`}
                >
                  {t.admin}
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => setLang(lang === 'en' ? 'am' : 'en')}
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-xs font-bold"
              >
                <Languages className="w-4 h-4" />
                {lang === 'en' ? 'አማርኛ' : 'English'}
              </button>
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-bold text-white">{user.displayName}</div>
                    <div className="text-[10px] text-slate-500">{user.email}</div>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="h-8 w-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden hover:border-red-500/50 transition-colors"
                  >
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <Settings className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </div>
              ) : (
                <Button size="sm" onClick={handleLogin} className="bg-blue-600 hover:bg-blue-700">
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!user && !isAuthLoading ? (
          <AuthSystem onAuthComplete={(u) => setUser(u)} />
        ) : isAuthLoading ? (
          <div className="flex items-center justify-center py-40">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCw className="w-10 h-10 text-blue-500" />
            </motion.div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Monitoring Status Banner */}
            <div className={`p-3 rounded-lg border flex items-center justify-between ${isAutoScanning ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-slate-800 border-white/10'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${isAutoScanning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
                <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  {isAutoScanning ? 'Active Monitoring: Enabled' : 'Monitoring: Paused'}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-[10px] uppercase font-bold text-blue-400 hover:text-blue-300"
                onClick={() => setIsAutoScanning(!isAutoScanning)}
              >
                {isAutoScanning ? 'Pause Service' : 'Resume Service'}
              </Button>
            </div>
            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-slate-900/50 border-white/5 backdrop-blur-sm overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="pb-2">
                  <CardDescription className="text-slate-400 uppercase text-[10px] font-bold tracking-widest">{t.systemHealth}</CardDescription>
                  <CardTitle className="text-3xl font-bold text-white flex items-baseline gap-2">
                    98% <span className="text-sm font-normal text-emerald-400">Secure</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `98%` }}
                      className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-white/5 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardDescription className="text-slate-400 uppercase text-[10px] font-bold tracking-widest">{t.totalScanned}</CardDescription>
                  <CardTitle className="text-3xl font-bold text-white">1,284</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <ArrowRight className="w-3 h-3 text-emerald-400 rotate-[-45deg]" />
                    <span className="text-emerald-400 font-medium">+12%</span> from yesterday
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-white/5 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardDescription className="text-slate-400 uppercase text-[10px] font-bold tracking-widest">{t.threatsBlocked}</CardDescription>
                  <CardTitle className="text-3xl font-bold text-red-400">42</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-red-400" />
                    <span className="text-red-400 font-medium">Critical</span> action required for 2 items
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Scan */}
            <Card className="bg-slate-900/50 border-white/5 backdrop-blur-sm border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-400 fill-blue-400" />
                  {t.scanner}
                </CardTitle>
                <CardDescription>{t.placeholder}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input 
                      placeholder={t.placeholder} 
                      className="bg-black/50 border-white/10 pl-10 h-12 text-white focus-visible:ring-blue-500"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                    />
                  </div>
                  <Button 
                    className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-600/20"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !input.trim()}
                  >
                    {isAnalyzing ? t.scanning : t.analyze}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-slate-900/50 border-white/5 overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold">{t.recentLogs}</CardTitle>
                    <CardDescription>Real-time monitoring results</CardDescription>
                  </div>
                  <History className="w-5 h-5 text-slate-500" />
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[400px]">
                    <div className="divide-y divide-white/5">
                      {logs.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-slate-500">{t.noLogs}</p>
                        </div>
                      ) : (
                        logs.map((log) => (
                          <div key={log.id} className="p-4 hover:bg-white/5 transition-colors group">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3">
                                <div className={`mt-1 w-8 h-8 rounded-lg flex items-center justify-center ${
                                  log.result.isSafe ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                                }`}>
                                  {log.result.isSafe ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="text-[10px] uppercase tracking-tighter border-white/10 bg-black/20">
                                      {log.source}
                                    </Badge>
                                    <span className="text-[10px] text-slate-500 font-mono">
                                      {new Date(log.timestamp).toLocaleTimeString()}
                                    </span>
                                  </div>
                                  <p className="text-sm font-medium text-slate-200 line-clamp-1 mb-1">{log.content}</p>
                                  <p className="text-xs text-slate-400 line-clamp-2">{log.result.reason}</p>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <div className={`text-xs font-bold ${
                                  log.result.score > 80 ? 'text-emerald-400' : log.result.score > 40 ? 'text-amber-400' : 'text-red-400'
                                }`}>
                                  {log.result.score}% {log.result.isSafe ? t.safe : t.unsafe}
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-white/5">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Threat Trends</CardTitle>
                  <CardDescription>Phishing attempts over the last 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={MOCK_STATS}>
                        <defs>
                          <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          stroke="#64748b" 
                          fontSize={12} 
                          tickLine={false} 
                          axisLine={false} 
                        />
                        <YAxis 
                          stroke="#64748b" 
                          fontSize={12} 
                          tickLine={false} 
                          axisLine={false} 
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '8px' }}
                          itemStyle={{ color: '#ef4444' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="threats" 
                          stroke="#ef4444" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorThreats)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-6 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">AI Insight</h4>
                      <p className="text-xs text-slate-400">We noticed an 18% increase in WhatsApp phishing attempts this week. Stay vigilant.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === 'analysis' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-3xl mx-auto space-y-8"
          >
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold text-white tracking-tight">{t.scanner}</h2>
              <p className="text-slate-400">{t.placeholder}</p>
            </div>

            <Card className="bg-slate-900/50 border-white/5 p-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Content to Analyze</label>
                  <textarea 
                    className="w-full h-40 bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all"
                    placeholder="Paste a suspicious message, email snippet, or URL here..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-semibold text-slate-300">Social Media</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Optimized for Telegram, FB, and WhatsApp patterns.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-semibold text-slate-300">Privacy First</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Your data is processed securely and never stored.</p>
                  </div>
                </div>

                <Button 
                  className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-lg font-bold shadow-xl shadow-blue-600/20"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !input.trim()}
                >
                  {isAnalyzing ? (
                    <div className="flex items-center gap-2">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Shield className="w-5 h-5" />
                      </motion.div>
                      {t.scanning}
                    </div>
                  ) : t.analyze}
                </Button>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-6 h-6 text-blue-400" />
                </div>
                <h4 className="text-sm font-bold text-white">URL Reputation</h4>
                <p className="text-xs text-slate-500">Checks against global blacklists and WHOIS data.</p>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-3">
                  <Zap className="w-6 h-6 text-purple-400" />
                </div>
                <h4 className="text-sm font-bold text-white">Semantic Analysis</h4>
                <p className="text-xs text-slate-500">Detects social engineering and urgency tactics.</p>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                </div>
                <h4 className="text-sm font-bold text-white">Zero-Day Detection</h4>
                <p className="text-xs text-slate-500">AI identifies new threats before they are reported.</p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'reports' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Security Intelligence</h2>
                <p className="text-slate-400">Detailed breakdown of your digital safety.</p>
              </div>
              <Button variant="outline" className="border-white/10 text-slate-300 gap-2">
                <Download className="w-4 h-4" />
                Export PDF
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 bg-slate-900/50 border-white/5">
                <CardHeader>
                  <CardTitle>Daily Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={MOCK_STATS}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                        <XAxis dataKey="date" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10' }}
                        />
                        <Line type="monotone" dataKey="scanned" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6' }} />
                        <Line type="monotone" dataKey="threats" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="bg-slate-900/50 border-white/5">
                  <CardHeader>
                    <CardTitle className="text-sm">Threat Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Phishing</span>
                        <span className="text-white">64%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 w-[64%]" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Malware Links</span>
                        <span className="text-white">22%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 w-[22%]" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Scams</span>
                        <span className="text-white">14%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[14%]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 border-none text-white">
                  <CardHeader>
                    <CardTitle className="text-lg">Pro Insights</CardTitle>
                    <CardDescription className="text-blue-100">Unlock advanced behavioral analytics and dark web monitoring.</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button variant="secondary" className="w-full font-bold" onClick={() => setActiveTab('pricing')}>
                      View Pro Features
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </motion.div>
        )}

        {user?.role === 'admin' && activeTab === 'admin' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-slate-900/50 border-amber-500/20">
                <CardHeader className="pb-2">
                  <CardDescription className="text-slate-400 uppercase text-[10px] font-bold">{t.revenue}</CardDescription>
                  <CardTitle className="text-2xl font-bold text-amber-400">{adminStats.totalRevenue} ETB</CardTitle>
                </CardHeader>
                <CardFooter>
                  <Button size="sm" className="w-full bg-amber-600 hover:bg-amber-700 gap-2">
                    <Wallet className="w-4 h-4" />
                    {t.withdraw}
                  </Button>
                </CardFooter>
              </Card>
              <Card className="bg-slate-900/50 border-white/5">
                <CardHeader className="pb-2">
                  <CardDescription className="text-slate-400 uppercase text-[10px] font-bold">{t.users}</CardDescription>
                  <CardTitle className="text-2xl font-bold text-white">{adminStats.totalUsers}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-slate-900/50 border-white/5">
                <CardHeader className="pb-2">
                  <CardDescription className="text-slate-400 uppercase text-[10px] font-bold">Active Audits</CardDescription>
                  <CardTitle className="text-2xl font-bold text-white">{adminStats.activeAudits}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-slate-900/50 border-white/5">
                <CardHeader className="pb-2">
                  <CardDescription className="text-slate-400 uppercase text-[10px] font-bold">Blocked Attacks</CardDescription>
                  <CardTitle className="text-2xl font-bold text-emerald-400">{adminStats.blockedAttacks}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            <Card className="bg-slate-900/50 border-white/5">
              <CardHeader>
                <CardTitle>System Activity Monitoring</CardTitle>
                <CardDescription>Real-time overview of all scans and threats across the platform.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MOCK_STATS}>
                      <defs>
                        <linearGradient id="colorScanned" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="scanned" stroke="#3b82f6" fillOpacity={1} fill="url(#colorScanned)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'audit' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-4xl font-bold text-white tracking-tight">{t.auditTitle}</h2>
              <p className="text-slate-400">{t.auditDesc}</p>
            </div>

            <Card className="bg-slate-900/50 border-white/5 p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">{t.auditTarget}</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <Input 
                      placeholder="https://example.com or project-folder/"
                      className="pl-10 bg-black/40 border-white/10 text-white h-12"
                      value={auditTarget}
                      onChange={(e) => setAuditTarget(e.target.value)}
                    />
                  </div>
                </div>
                <div className="w-full md:w-48 space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                  <select 
                    className="w-full h-12 bg-black/40 border-white/10 text-white rounded-md px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={auditType}
                    onChange={(e: any) => setAuditType(e.target.value)}
                  >
                    <option value="url">Website URL</option>
                    <option value="code">Source Code</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button 
                    className="h-12 bg-blue-600 hover:bg-blue-700 px-8 gap-2"
                    onClick={handleAudit}
                    disabled={isAuditing}
                  >
                    {isAuditing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    {t.startAudit}
                  </Button>
                </div>
              </div>
            </Card>

            {currentAudit && (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                <Card className="bg-slate-900/50 border-blue-500/30 overflow-hidden print:bg-white print:text-black print:border-none">
                  <CardHeader className="bg-blue-600/10 border-b border-white/5 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl flex items-center gap-3">
                        {t.auditSummary}
                        <Badge className={currentAudit.status === 'pass' ? 'bg-emerald-500' : currentAudit.status === 'fail' ? 'bg-red-500' : 'bg-amber-500'}>
                          {t[currentAudit.status as keyof typeof t]}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{currentAudit.target} - {new Date(currentAudit.timestamp).toLocaleString()}</CardDescription>
                    </div>
                    <div className="flex gap-2 print:hidden">
                      <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
                        <Printer className="w-4 h-4" />
                        {t.print}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="text-center p-6 rounded-2xl bg-black/20 border border-white/5">
                        <div className="text-4xl font-black text-blue-400 mb-2">{currentAudit.score}%</div>
                        <div className="text-xs uppercase font-bold text-slate-500">Security Score</div>
                      </div>
                      <div className="col-span-2 space-y-4">
                        <h4 className="font-bold text-white flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                          {t.findings}
                        </h4>
                        <div className="space-y-3">
                          {currentAudit.findings.map((f: any, i: number) => (
                            <div key={i} className="p-4 rounded-lg bg-white/5 border-l-4 border-amber-500">
                              <div className="flex justify-between items-start mb-1">
                                <span className="text-sm font-bold text-white">{f.issue}</span>
                                <Badge variant="outline" className="text-[10px] uppercase">{f.severity}</Badge>
                              </div>
                              <p className="text-xs text-slate-400">Fix: {f.fix}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-12 border-4 border-double border-blue-500/20 rounded-3xl text-center space-y-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Shield className="w-40 h-40" />
                      </div>
                      <h3 className="text-3xl font-serif italic text-white">{t.certificate}</h3>
                      <div className="max-w-md mx-auto space-y-4">
                        <p className="text-slate-400">This document certifies that the system at <strong>{currentAudit.target}</strong> has undergone a rigorous AI-driven security audit.</p>
                        <div className="flex justify-center gap-8 py-4">
                          <div className="text-center">
                            <div className="font-mono text-xs text-slate-500">Certificate ID</div>
                            <div className="font-bold text-white">{currentAudit.id}</div>
                          </div>
                          <div className="text-center">
                            <div className="font-mono text-xs text-slate-500">Verification Date</div>
                            <div className="font-bold text-white">{new Date(currentAudit.timestamp).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div className="pt-8 flex flex-col items-center">
                          <div className="w-32 h-1 bg-blue-500 mb-2" />
                          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">ShieldAI Security Authority</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === 'connections' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-4xl font-bold text-white tracking-tight">{t.socialTitle}</h2>
              <p className="text-slate-400">{t.socialDesc}</p>
            </div>

            <Card className="bg-slate-900/50 border-white/5 p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">{t.addAccount}</label>
                  <div className="relative">
                    <Link2 className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <Input 
                      placeholder="https://t.me/username or profile link"
                      className="pl-10 bg-black/40 border-white/10 text-white h-12"
                      value={newSocialLink}
                      onChange={(e) => setNewSocialLink(e.target.value)}
                    />
                  </div>
                </div>
                <div className="w-full md:w-48 space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Platform</label>
                  <select 
                    className="w-full h-12 bg-black/40 border-white/10 text-white rounded-md px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={newSocialPlatform}
                    onChange={(e: any) => setNewSocialPlatform(e.target.value)}
                  >
                    <option value="telegram">Telegram</option>
                    <option value="facebook">Facebook</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email Account</option>
                    <option value="instagram">Instagram</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button 
                    className="h-12 bg-blue-600 hover:bg-blue-700 px-8 gap-2"
                    onClick={addSocialAccount}
                  >
                    <Plus className="w-4 h-4" />
                    Connect
                  </Button>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {socialAccounts.map((acc) => (
                <Card key={acc.id} className="bg-slate-900/50 border-white/5 overflow-hidden group">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-400">
                        {acc.platform === 'telegram' && <Send className="w-5 h-5" />}
                        {acc.platform === 'facebook' && <Facebook className="w-5 h-5" />}
                        {acc.platform === 'whatsapp' && <MessageSquare className="w-5 h-5" />}
                        {acc.platform === 'email' && <Mail className="w-5 h-5" />}
                        {acc.platform === 'instagram' && <Smartphone className="w-5 h-5" />}
                      </div>
                      <div>
                        <CardTitle className="text-base">{acc.link}</CardTitle>
                        <CardDescription className="text-[10px] uppercase font-bold tracking-widest">{acc.platform}</CardDescription>
                      </div>
                    </div>
                    <Badge className={acc.status === 'protected' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}>
                      {t[acc.status as keyof typeof t]}
                    </Badge>
                  </CardHeader>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <Activity className="w-3 h-3 text-emerald-500" />
                        Live Protection Active
                      </div>
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-3 h-3 text-red-400" />
                        {acc.attackCount} Attacks Blocked
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-white/5 p-2 flex gap-2">
                    <Button variant="ghost" size="sm" className="flex-1 text-[10px] uppercase font-bold text-slate-400 hover:text-white">
                      View Logs
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1 text-[10px] uppercase font-bold text-red-400 hover:bg-red-500/10">
                      Disconnect
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'pricing' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto space-y-12 py-12"
          >
            <div className="text-center space-y-4">
              <h2 className="text-5xl font-extrabold text-white tracking-tight">ዲጂታል ህይወትዎን ይጠብቁ (Protect Your Digital Life)</h2>
              <p className="text-xl text-slate-400">ለእርስዎ የሚስማማውን የደህንነት አማራጭ ይምረጡ።</p>
              <div className="text-xs text-blue-400 font-mono">በም/ኢ/ር ቢኒያም ይርሳዉ መጢና የበለፀገ</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-slate-900/50 border-white/5 p-8 flex flex-col">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Free Plan</h3>
                  <div className="text-4xl font-bold text-white mb-4">0 ETB <span className="text-sm font-normal text-slate-500">/ month</span></div>
                  <p className="text-slate-400 text-sm">Basic protection for casual browsing.</p>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    Manual AI Scanning (10/day)
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    Basic Phishing Detection
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    7-Day History
                  </li>
                </ul>
                <Button variant="outline" className="w-full border-white/10 text-white" disabled>Current Plan</Button>
              </Card>

              <Card className="bg-slate-900/50 border-blue-500/50 p-8 flex flex-col relative overflow-hidden shadow-[0_0_40px_rgba(37,99,235,0.15)]">
                <div className="absolute top-4 right-4 bg-blue-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Most Popular</div>
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">ShieldAI Pro</h3>
                  <div className="text-4xl font-bold text-white mb-4">299 ETB <span className="text-sm font-normal text-slate-500">/ month</span></div>
                  <p className="text-slate-400 text-sm">The ultimate defense for power users.</p>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <Zap className="w-5 h-5 text-blue-400 fill-blue-400" />
                    Unlimited AI Deep Scans
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <Zap className="w-5 h-5 text-blue-400 fill-blue-400" />
                    Real-time App Monitoring (Telegram/WA)
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <Zap className="w-5 h-5 text-blue-400 fill-blue-400" />
                    Dark Web Identity Monitoring
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <Zap className="w-5 h-5 text-blue-400 fill-blue-400" />
                    Priority AI Analysis (Gemini 3.1 Pro)
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <Zap className="w-5 h-5 text-blue-400 fill-blue-400" />
                    Family Protection (up to 5 devices)
                  </li>
                </ul>
                
                {isPro ? (
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12" disabled>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Pro Active
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant={paymentMethod === 'telebirr' ? 'default' : 'outline'}
                        className={`h-12 border-white/10 ${paymentMethod === 'telebirr' ? 'bg-blue-600' : 'text-white'}`}
                        onClick={() => setPaymentMethod('telebirr')}
                      >
                        <Smartphone className="w-4 h-4 mr-2" />
                        Telebirr
                      </Button>
                      <Button 
                        variant={paymentMethod === 'cbe' ? 'default' : 'outline'}
                        className={`h-12 border-white/10 ${paymentMethod === 'cbe' ? 'bg-blue-600' : 'text-white'}`}
                        onClick={() => setPaymentMethod('cbe')}
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        CBE Birr
                      </Button>
                    </div>
                    
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12"
                      disabled={!paymentMethod || isPaying}
                      onClick={handlePayment}
                    >
                      {isPaying ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : "ክፍያ ፈጽም (Pay Now)"}
                    </Button>
                  </div>
                )}
              </Card>
            </div>

            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-white">Enterprise Security</h4>
                <p className="text-slate-400 text-sm">Need to protect your entire organization? We offer custom solutions.</p>
              </div>
              <Button variant="outline" className="border-white/10 text-white gap-2">
                Contact Sales
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 mt-12 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="text-blue-500 w-6 h-6" />
                <span className="text-xl font-bold text-white">ShieldAI</span>
              </div>
              <p className="text-sm text-slate-500 max-w-xs">
                Protecting millions of users from phishing, malware, and digital threats using state-of-the-art artificial intelligence.
              </p>
            </div>
            <div>
              <h5 className="text-sm font-bold text-white mb-4">Product</h5>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-bold text-white mb-4">Company</h5>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#" className="hover:text-blue-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <Separator className="my-8 bg-white/5" />
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600">
            <p>© 2026 ShieldAI Security. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-slate-400 transition-colors">Twitter</a>
              <a href="#" className="hover:text-slate-400 transition-colors">GitHub</a>
              <a href="#" className="hover:text-slate-400 transition-colors">Discord</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
