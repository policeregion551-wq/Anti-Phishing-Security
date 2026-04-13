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
  Mail,
  Building2,
  FileWarning
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
import { analyzeContent, performSecurityAudit } from '@/lib/gemini';
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
  getDocs,
  setDoc
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
    warning: "WARNING",
    paymentRequired: "Payment Required",
    paymentDesc: "You must pay to activate the security system and access reports.",
    payNow: "Pay Now",
    institutions: "Institutional Accounts",
    addInstitution: "Add Institution",
    attackReports: "Attack Reports",
    blocked: "Blocked",
    detected: "Detected",
    telebirrWithdraw: "Telebirr Withdrawal",
    withdrawAmount: "Withdrawal Amount",
    withdrawPhone: "Telebirr Phone Number",
    confirmWithdraw: "Confirm Withdrawal"
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
    warning: "ማስጠንቀቂያ",
    paymentRequired: "ክፍያ ያስፈልጋል",
    paymentDesc: "የደህንነት ስርዓቱን ለመጠቀም እና ሪፖርቶችን ለማየት መክፈል አለብዎት።",
    payNow: "አሁን ይክፈሉ",
    institutions: "የተቋማት አካውንቶች",
    addInstitution: "ተቋም ጨምር",
    attackReports: "የጥቃት ሪፖርቶች",
    blocked: "የተከለከለ",
    detected: "የተገኘ",
    telebirrWithdraw: "በቴሌ ብር ገንዘብ ማውጣት",
    withdrawAmount: "የሚወጣው የገንዘብ መጠን",
    withdrawPhone: "የቴሌ ብር ስልክ ቁጥር",
    confirmWithdraw: "ማውጣቱን አረጋግጥ"
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
  const [paymentStep, setPaymentStep] = useState<'method' | 'phone' | 'pin' | 'success'>('method');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [paymentPin, setPaymentPin] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(299);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [allAttacks, setAllAttacks] = useState<SecurityLog[]>([]);

  // Admin States
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalUsers: 0,
    totalRevenue: 0,
    activeAudits: 0,
    blockedAttacks: 0
  });
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawPhone, setWithdrawPhone] = useState('');

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

  // Load Audits
  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'audits'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setAuditResults(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuditResult)));
      });
      return () => unsubscribe();
    }
  }, [user]);

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
        
        // Load Admin Data if admin
        if (currentUser.email === 'policeregion551@gmail.com') {
          loadAdminData();
        }
      } else {
        setUserProfile(null);
        setIsPro(false);
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loadAdminData = async () => {
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const usersList = usersSnap.docs.map(doc => doc.data() as UserProfile);
      setAllUsers(usersList);

      const logsSnap = await getDocs(collection(db, 'security_logs'));
      const logsList = logsSnap.docs.map(doc => doc.data() as SecurityLog);
      setAllAttacks(logsList);

      // Load revenue from system_stats
      const statsRef = doc(db, 'system_stats', 'global');
      const statsSnap = await getDoc(statsRef);
      let totalRevenue = usersList.filter(u => u.isPro && u.role !== 'admin').length * 299;
      
      if (statsSnap.exists()) {
        totalRevenue = statsSnap.data().totalRevenue || totalRevenue;
      } else {
        await setDoc(statsRef, { totalRevenue });
      }

      setAdminStats({
        totalUsers: usersList.length,
        totalRevenue: totalRevenue,
        activeAudits: 12,
        blockedAttacks: logsList.filter(l => !l.result.isSafe).length
      });
    } catch (error) {
      console.error("Failed to load admin data", error);
    }
  };

  const handleAudit = async () => {
    if (!auditTarget) return;
    setIsAuditing(true);
    try {
      const data = await performSecurityAudit(auditTarget, auditType);
      const newAudit: AuditResult = {
        id: Math.random().toString(36).substr(2, 9).toUpperCase(),
        timestamp: new Date().toISOString(),
        target: auditTarget,
        type: auditType,
        ...data
      };
      
      // Save to Firestore
      if (user) {
        await addDoc(collection(db, 'audits'), {
          ...newAudit,
          userId: user.uid
        });
      }

      setAuditResults(prev => [newAudit, ...prev]);
      setCurrentAudit(newAudit);
      toast.success("Security Audit Completed!");
    } catch (error) {
      toast.error("Audit failed");
    } finally {
      setIsAuditing(false);
    }
  };

  const [newInstitution, setNewInstitution] = useState({ name: '', email: '', phone: '' });
  const [institutions, setInstitutions] = useState<any[]>([]);

  const addInstitution = async () => {
    if (!newInstitution.name) return;
    try {
      await addDoc(collection(db, 'institutions'), {
        ...newInstitution,
        createdAt: new Date().toISOString()
      });
      toast.success("Institution added successfully");
      setNewInstitution({ name: '', email: '', phone: '' });
    } catch (error) {
      toast.error("Failed to add institution");
    }
  };

  // Load Institutions
  useEffect(() => {
    if (user?.email === 'policeregion551@gmail.com') {
      const q = query(collection(db, 'institutions'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setInstitutions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
    }
  }, [user]);
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

  const handleWithdraw = async () => {
    if (!withdrawAmount || !withdrawPhone) return;
    setIsWithdrawing(true);
    try {
      const response = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: withdrawAmount, phone: withdrawPhone, userId: user.uid })
      });
      if (response.ok) {
        toast.success("Withdrawal request sent successfully!");
        setWithdrawAmount('');
        setWithdrawPhone('');
      } else {
        toast.error("Withdrawal failed");
      }
    } catch (error) {
      toast.error("Withdrawal failed");
    } finally {
      setIsWithdrawing(false);
    }
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
    });

    return () => unsubscribe();
  }, [user]);

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
      if (Math.random() > 0.8) {
        const randomThreat = SIMULATED_THREATS[Math.floor(Math.random() * SIMULATED_THREATS.length)];
        const sources: SecurityLog['source'][] = ['telegram', 'whatsapp', 'facebook', 'system'];
        const randomSource = sources[Math.floor(Math.random() * sources.length)];
        
        try {
          const result = await analyzeContent(randomThreat);
          
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
    }, 45000);

    return () => clearInterval(interval);
  }, [isAutoScanning, user]);

  const handlePayment = async () => {
    if (!user) return;
    
    setIsPaying(true);
    
    try {
      // Update user profile
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, {
        isPro: true,
        paymentStatus: 'completed'
      });
      
      // Update global revenue
      const statsRef = doc(db, 'system_stats', 'global');
      const statsSnap = await getDoc(statsRef);
      if (statsSnap.exists()) {
        await updateDoc(statsRef, {
          totalRevenue: (statsSnap.data().totalRevenue || 0) + paymentAmount
        });
      } else {
        await setDoc(statsRef, { totalRevenue: paymentAmount });
      }
      
      setIsPro(true);
      setPaymentStep('success');
      toast.success("Payment Successful!", {
        description: `Welcome to ShieldAI Pro. ${paymentAmount} ETB has been processed via Telebirr.`
      });
      
      setTimeout(() => {
        setIsPaying(false);
        setActiveTab('dashboard');
        setPaymentStep('method');
      }, 3000);
    } catch (error) {
      toast.error("Payment update failed.");
      setIsPaying(false);
    }
  };

  const handleAnalyze = async () => {
    if (!input.trim() || !user) return;
    
    setIsAnalyzing(true);
    toast.info("Analyzing content for threats...");
    
    try {
      const result = await analyzeContent(input);
      
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

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-100 font-sans selection:bg-blue-500/30 overflow-x-hidden">
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
              {!isPro && (
                <button 
                  onClick={() => setActiveTab('pricing')}
                  className={`text-sm font-medium transition-colors ${activeTab === 'pricing' ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}
                >
                  {t.upgrade}
                </button>
              )}
              {user?.email === 'policeregion551@gmail.com' && (
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
                    <div className="text-xs font-bold text-white">{user.displayName || user.email.split('@')[0]}</div>
                    <div className="text-[10px] text-slate-500">{user.email}</div>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="h-8 w-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden hover:border-red-500/50 transition-colors"
                  >
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <Settings className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </div>
              ) : (
                <Button size="sm" onClick={() => setActiveTab('auth')} className="bg-blue-600 hover:bg-blue-700">
                  {t.login}
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!user && activeTab === 'auth' ? (
          <AuthSystem onAuthComplete={(u) => setUser(u)} />
        ) : !user ? (
          <div className="text-center py-20 space-y-6">
            <Shield className="w-20 h-20 text-blue-500 mx-auto animate-pulse" />
            <h1 className="text-4xl font-bold text-white">Welcome to ShieldAI</h1>
            <p className="text-slate-400 max-w-md mx-auto">The most advanced AI-powered security system for your digital life.</p>
            <Button size="lg" onClick={() => setActiveTab('auth')} className="bg-blue-600 hover:bg-blue-700 px-12">
              Get Started
            </Button>
          </div>
        ) : isAuthLoading ? (
          <div className="flex items-center justify-center py-40">
            <RefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className={`p-3 rounded-lg border flex items-center justify-between ${isAutoScanning ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-slate-800 border-white/10'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isAutoScanning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
                    <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                      {isAutoScanning ? 'Active Monitoring: Enabled' : 'Monitoring: Paused'}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-[10px] uppercase font-bold text-blue-400" onClick={() => setIsAutoScanning(!isAutoScanning)}>
                    {isAutoScanning ? 'Pause Service' : 'Resume Service'}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-slate-900/50 border-white/5 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-slate-400 uppercase text-[10px] font-bold tracking-widest">{t.systemHealth}</CardDescription>
                      <CardTitle className="text-3xl font-bold text-white">98% <span className="text-sm font-normal text-emerald-400">Secure</span></CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[98%]" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-900/50 border-white/5 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-slate-400 uppercase text-[10px] font-bold tracking-widest">{t.totalScanned}</CardDescription>
                      <CardTitle className="text-3xl font-bold text-white">{logs.length + 1240}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card className="bg-slate-900/50 border-white/5 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-slate-400 uppercase text-[10px] font-bold tracking-widest">{t.threatsBlocked}</CardDescription>
                      <CardTitle className="text-3xl font-bold text-red-400">{logs.filter(l => !l.result.isSafe).length + 42}</CardTitle>
                    </CardHeader>
                  </Card>
                </div>

                <Card className="bg-slate-900/50 border-white/5 border-l-4 border-l-blue-500">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Zap className="w-5 h-5 text-blue-400 fill-blue-400" />
                      {t.scanner}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Input 
                        placeholder={t.placeholder} 
                        className="bg-black/50 border-white/10 h-12 text-white"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                      />
                      <Button className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold" onClick={handleAnalyze} disabled={isAnalyzing || !input.trim()}>
                        {isAnalyzing ? t.scanning : t.analyze}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="bg-slate-900/50 border-white/5 overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg font-semibold">{t.recentLogs}</CardTitle>
                      <History className="w-5 h-5 text-slate-500" />
                    </CardHeader>
                    <CardContent className="p-0">
                      <ScrollArea className="h-[400px]">
                        <div className="divide-y divide-white/5">
                          {logs.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">{t.noLogs}</div>
                          ) : (
                            logs.map((log) => (
                              <div key={log.id} className="p-4 hover:bg-white/5 transition-colors">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex items-start gap-3">
                                    <div className={`mt-1 w-8 h-8 rounded-lg flex items-center justify-center ${log.result.isSafe ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                      {log.result.isSafe ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="outline" className="text-[10px] uppercase">{log.source}</Badge>
                                        <span className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                      </div>
                                      <p className="text-sm font-medium text-slate-200 line-clamp-1">{log.content}</p>
                                      <p className="text-xs text-slate-400 line-clamp-2">{log.result.reason}</p>
                                    </div>
                                  </div>
                                  <div className={`text-xs font-bold ${log.result.isSafe ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {log.result.score}% {log.result.isSafe ? t.safe : t.unsafe}
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
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={MOCK_STATS}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                            <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                            <YAxis stroke="#64748b" fontSize={12} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10' }} />
                            <Area type="monotone" dataKey="threats" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {activeTab === 'analysis' && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl mx-auto space-y-8">
                {!isPro && (
                  <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center mb-8">
                    <Lock className="w-10 h-10 text-amber-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white">{t.paymentRequired}</h3>
                    <p className="text-slate-400 mb-6">{t.paymentDesc}</p>
                    <Button onClick={() => setActiveTab('pricing')} className="bg-amber-600 hover:bg-amber-700">
                      {t.payNow}
                    </Button>
                  </div>
                )}
                <div className={!isPro ? 'opacity-50 pointer-events-none' : ''}>
                  <div className="text-center space-y-4">
                    <h2 className="text-4xl font-bold text-white">{t.scanner}</h2>
                    <p className="text-slate-400">{t.placeholder}</p>
                  </div>
                  <Card className="bg-slate-900/50 border-white/5 p-8 mt-8">
                    <textarea 
                      className="w-full h-40 bg-black/50 border border-white/10 rounded-xl p-4 text-white outline-none resize-none"
                      placeholder="Paste a suspicious message or URL here..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                    />
                    <Button className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold mt-6" onClick={handleAnalyze} disabled={isAnalyzing || !input.trim()}>
                      {isAnalyzing ? t.scanning : t.analyze}
                    </Button>
                  </Card>
                </div>
              </motion.div>
            )}

            {activeTab === 'audit' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                {!isPro && (
                  <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center mb-8">
                    <Lock className="w-10 h-10 text-amber-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white">{t.paymentRequired}</h3>
                    <p className="text-slate-400 mb-6">{t.paymentDesc}</p>
                    <Button onClick={() => setActiveTab('pricing')} className="bg-amber-600 hover:bg-amber-700">
                      {t.payNow}
                    </Button>
                  </div>
                )}
                <div className={!isPro ? 'opacity-50 pointer-events-none' : ''}>
                  <div className="text-center space-y-4">
                    <h2 className="text-4xl font-bold text-white">{t.auditTitle}</h2>
                    <p className="text-slate-400">{t.auditDesc}</p>
                  </div>
                  <Card className="bg-slate-900/50 border-white/5 p-6 mt-8">
                    <div className="flex flex-col md:flex-row gap-4">
                      <Input 
                        placeholder="https://example.com or project-folder/"
                        className="bg-black/40 border-white/10 text-white h-12"
                        value={auditTarget}
                        onChange={(e) => setAuditTarget(e.target.value)}
                      />
                      <select 
                        className="bg-black/40 border-white/10 text-white rounded-md px-3 h-12"
                        value={auditType}
                        onChange={(e: any) => setAuditType(e.target.value)}
                      >
                        <option value="url">Website URL</option>
                        <option value="code">Source Code</option>
                      </select>
                      <Button className="h-12 bg-blue-600 hover:bg-blue-700 px-8 text-white font-bold" onClick={handleAudit} disabled={isAuditing}>
                        {isAuditing ? <RefreshCw className="animate-spin" /> : t.startAudit}
                      </Button>
                    </div>
                  </Card>
                </div>

                {currentAudit && (
                  <Card className="bg-slate-900/50 border-blue-500/30 overflow-hidden print:bg-white print:text-black">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl flex items-center gap-3">
                          {t.auditSummary}
                          <Badge className={currentAudit.status === 'pass' ? 'bg-emerald-500' : 'bg-red-500'}>
                            {t[currentAudit.status as keyof typeof t]}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{currentAudit.target}</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={handlePrint} className="print:hidden text-white border-white/20 hover:bg-white/10">
                        <Printer className="w-4 h-4 mr-2" /> {t.print}
                      </Button>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                      <div className="p-12 border-4 border-double border-blue-500/20 rounded-3xl text-center space-y-6">
                        <h3 className="text-3xl font-serif italic text-white print:text-black">{t.certificate}</h3>
                        <p className="text-slate-400 print:text-black">This document certifies that <strong>{currentAudit.target}</strong> has undergone a rigorous AI-driven security audit.</p>
                        <div className="flex justify-center gap-8 py-4">
                          <div>
                            <div className="text-xs text-slate-500">Certificate ID</div>
                            <div className="font-bold text-white print:text-black">{currentAudit.id}</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-500">Date</div>
                            <div className="font-bold text-white print:text-black">{new Date(currentAudit.timestamp).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}

            {activeTab === 'connections' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl font-bold text-white">{t.socialTitle}</h2>
                  <p className="text-slate-400">{t.socialDesc}</p>
                </div>
                <Card className="bg-slate-900/50 border-white/5 p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <Input 
                      placeholder="Account link or username"
                      className="bg-black/40 border-white/10 text-white h-12"
                      value={newSocialLink}
                      onChange={(e) => setNewSocialLink(e.target.value)}
                    />
                    <select 
                      className="bg-black/40 border-white/10 text-white rounded-md px-3 h-12"
                      value={newSocialPlatform}
                      onChange={(e: any) => setNewSocialPlatform(e.target.value)}
                    >
                      <option value="telegram">Telegram</option>
                      <option value="facebook">Facebook</option>
                      <option value="whatsapp">WhatsApp</option>
                    </select>
                    <Button className="h-12 bg-blue-600 hover:bg-blue-700 px-8 text-white font-bold" onClick={addSocialAccount}>
                      Connect
                    </Button>
                  </div>
                </Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {socialAccounts.map((acc) => (
                    <Card key={acc.id} className="bg-slate-900/50 border-white/5">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-400">
                            {acc.platform === 'telegram' ? <Send /> : <Facebook />}
                          </div>
                          <div>
                            <CardTitle className="text-base text-white">{acc.link}</CardTitle>
                            <CardDescription className="text-xs uppercase text-slate-500">{acc.platform}</CardDescription>
                          </div>
                        </div>
                        <Badge className="bg-emerald-500/20 text-emerald-400">{t.protected}</Badge>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'pricing' && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-white mb-4">ShieldAI Pro</h2>
                  <p className="text-slate-400">Unlock advanced security features and protect your digital life.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="bg-slate-900/50 border-white/5 p-8 flex flex-col">
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-white mb-2">Free Plan</h3>
                      <div className="text-3xl font-bold text-white">0 ETB <span className="text-sm font-normal text-slate-500">/ month</span></div>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                      <li className="flex items-center gap-2 text-slate-300"><Check className="w-4 h-4 text-emerald-500" /> Basic Content Analysis</li>
                      <li className="flex items-center gap-2 text-slate-300"><Check className="w-4 h-4 text-emerald-500" /> Real-time Monitoring</li>
                      <li className="flex items-center gap-2 text-slate-500"><X className="w-4 h-4 text-red-500" /> Advanced AI Scanner</li>
                      <li className="flex items-center gap-2 text-slate-500"><X className="w-4 h-4 text-red-500" /> Security Audits</li>
                    </ul>
                    <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5" disabled>Current Plan</Button>
                  </Card>

                  <Card className="bg-blue-600/10 border-blue-500/50 p-8 flex flex-col relative overflow-hidden">
                    <div className="absolute top-4 right-4 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">Recommended</div>
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-white mb-2">Pro Plan</h3>
                      <div className="text-3xl font-bold text-white">299 ETB <span className="text-sm font-normal text-slate-400">/ month</span></div>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                      <li className="flex items-center gap-2 text-slate-200"><Check className="w-4 h-4 text-emerald-400" /> Everything in Free</li>
                      <li className="flex items-center gap-2 text-slate-200"><Check className="w-4 h-4 text-emerald-400" /> Advanced AI Scanner</li>
                      <li className="flex items-center gap-2 text-slate-200"><Check className="w-4 h-4 text-emerald-400" /> Deep Security Audits</li>
                      <li className="flex items-center gap-2 text-slate-200"><Check className="w-4 h-4 text-emerald-400" /> Priority Support</li>
                    </ul>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold" onClick={() => { setPaymentStep('method'); setIsPaying(true); }}>Upgrade Now</Button>
                  </Card>
                </div>

                <AnimatePresence>
                  {isPaying && (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                      <Card className="w-full max-w-md bg-slate-900 border-white/10 shadow-2xl">
                        <CardHeader className="text-center">
                          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <Smartphone className="text-white w-8 h-8" />
                          </div>
                          <CardTitle className="text-2xl text-white">Telebirr Payment</CardTitle>
                          <CardDescription>Secure payment via Telebirr</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                          {paymentStep === 'method' && (
                            <div className="space-y-4">
                              <p className="text-center text-slate-400 mb-6">Choose your payment method</p>
                              <Button 
                                className="w-full h-16 bg-[#00adef] hover:bg-[#0096d1] flex items-center justify-between px-6 group"
                                onClick={() => setPaymentStep('phone')}
                              >
                                <span className="text-lg font-bold text-white">Telebirr</span>
                                <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                              </Button>
                              <Button variant="outline" className="w-full h-16 border-white/10 text-white hover:bg-white/5" onClick={() => setIsPaying(false)}>
                                Cancel
                              </Button>
                            </div>
                          )}

                          {paymentStep === 'phone' && (
                            <div className="space-y-6">
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Phone Number</label>
                                <Input 
                                  placeholder="09xxxxxxxx" 
                                  className="bg-black/40 border-white/10 h-12 text-white text-lg tracking-widest"
                                  value={paymentPhone}
                                  onChange={(e) => setPaymentPhone(e.target.value)}
                                />
                              </div>
                              <Button 
                                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold"
                                onClick={() => paymentPhone.length >= 10 ? setPaymentStep('pin') : toast.error("Invalid phone number")}
                              >
                                Continue
                              </Button>
                              <Button variant="ghost" className="w-full text-slate-400" onClick={() => setPaymentStep('method')}>Back</Button>
                            </div>
                          )}

                          {paymentStep === 'pin' && (
                            <div className="space-y-6">
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Telebirr PIN</label>
                                <Input 
                                  type="password"
                                  placeholder="****" 
                                  className="bg-black/40 border-white/10 h-12 text-white text-center text-2xl tracking-[1em]"
                                  maxLength={4}
                                  value={paymentPin}
                                  onChange={(e) => setPaymentPin(e.target.value)}
                                />
                              </div>
                              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-center">
                                <div className="text-xs text-slate-400 mb-1">Total Amount</div>
                                <div className="text-2xl font-bold text-white">{paymentAmount} ETB</div>
                              </div>
                              <Button 
                                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                onClick={handlePayment}
                              >
                                Pay Now
                              </Button>
                              <Button variant="ghost" className="w-full text-slate-400" onClick={() => setPaymentStep('phone')}>Back</Button>
                            </div>
                          )}

                          {paymentStep === 'success' && (
                            <div className="text-center py-8 space-y-4">
                              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                              </div>
                              <h3 className="text-2xl font-bold text-white">Payment Successful!</h3>
                              <p className="text-slate-400">Your account has been upgraded to Pro. Redirecting...</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {user?.email === 'policeregion551@gmail.com' && activeTab === 'admin' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className="bg-slate-900/50 border-amber-500/20">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-slate-400 uppercase text-[10px] font-bold">{t.revenue}</CardDescription>
                      <CardTitle className="text-2xl font-bold text-amber-400">{adminStats.totalRevenue} ETB</CardTitle>
                    </CardHeader>
                    <CardFooter>
                      <Button size="sm" className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold" onClick={() => setIsWithdrawing(true)}>
                        <Wallet className="w-4 h-4 mr-2" /> {t.withdraw}
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
                      <CardDescription className="text-slate-400 uppercase text-[10px] font-bold">Attacks Blocked</CardDescription>
                      <CardTitle className="text-2xl font-bold text-emerald-400">{adminStats.blockedAttacks}</CardTitle>
                    </CardHeader>
                  </Card>
                </div>

                {isWithdrawing && (
                  <Card className="bg-slate-900 border-amber-500/50 p-6">
                    <CardTitle className="mb-4">{t.telebirrWithdraw}</CardTitle>
                    <div className="space-y-4">
                      <Input 
                        placeholder={t.withdrawAmount} 
                        type="number" 
                        value={withdrawAmount} 
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="bg-black/40 border-white/10"
                      />
                      <Input 
                        placeholder={t.withdrawPhone} 
                        value={withdrawPhone} 
                        onChange={(e) => setWithdrawPhone(e.target.value)}
                        className="bg-black/40 border-white/10"
                      />
                      <div className="flex gap-4">
                        <Button className="flex-1 bg-amber-600 hover:bg-amber-700" onClick={handleWithdraw} disabled={isWithdrawing}>
                          {t.confirmWithdraw}
                        </Button>
                        <Button variant="ghost" className="flex-1" onClick={() => setIsWithdrawing(false)}>Cancel</Button>
                      </div>
                    </div>
                  </Card>
                )}

                <Tabs defaultValue="users">
                  <TabsList className="bg-slate-900 border-white/5">
                    <TabsTrigger value="users">{t.users}</TabsTrigger>
                    <TabsTrigger value="institutions">{t.institutions}</TabsTrigger>
                    <TabsTrigger value="attacks">{t.attackReports}</TabsTrigger>
                  </TabsList>
                  <TabsContent value="users" className="mt-6">
                    <Card className="bg-slate-900/50 border-white/5">
                      <ScrollArea className="h-[400px]">
                        <div className="divide-y divide-white/5">
                          {allUsers.map((u, i) => (
                            <div key={i} className="p-4 flex items-center justify-between">
                              <div>
                                <div className="font-bold text-white">{u.name}</div>
                                <div className="text-xs text-slate-500">{u.email}</div>
                              </div>
                              <Badge className={u.isPro ? 'bg-blue-500' : 'bg-slate-700'}>{u.isPro ? 'Pro' : 'Free'}</Badge>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </Card>
                  </TabsContent>
                  <TabsContent value="institutions">
                    <Card className="bg-slate-900/50 border-white/5 p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Input 
                          placeholder="Institution Name" 
                          value={newInstitution.name} 
                          onChange={(e) => setNewInstitution({...newInstitution, name: e.target.value})}
                          className="bg-black/40 border-white/10"
                        />
                        <Input 
                          placeholder="Email" 
                          value={newInstitution.email} 
                          onChange={(e) => setNewInstitution({...newInstitution, email: e.target.value})}
                          className="bg-black/40 border-white/10"
                        />
                        <Button onClick={addInstitution} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">Add Institution</Button>
                      </div>
                      <ScrollArea className="h-[300px]">
                        <div className="divide-y divide-white/5">
                          {institutions.map((inst, i) => (
                            <div key={i} className="p-4 flex items-center justify-between">
                              <div>
                                <div className="font-bold text-white">{inst.name}</div>
                                <div className="text-xs text-slate-500">{inst.email}</div>
                              </div>
                              <Badge variant="outline">Active</Badge>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </Card>
                  </TabsContent>
                  <TabsContent value="attacks">
                    <Card className="bg-slate-900/50 border-white/5">
                      <ScrollArea className="h-[400px]">
                        <div className="divide-y divide-white/5">
                          {allAttacks.filter(l => !l.result.isSafe).map((l, i) => (
                            <div key={i} className="p-4">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="destructive" className="text-[10px]">{l.result.threatType}</Badge>
                                <span className="text-[10px] text-slate-500">{new Date(l.timestamp).toLocaleString()}</span>
                              </div>
                              <p className="text-sm text-white">{l.content}</p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </Card>
                  </TabsContent>
                </Tabs>
              </motion.div>
            )}
          </>
        )}
      </main>

      <footer className="border-t border-white/5 py-12 mt-12 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="text-blue-500 w-6 h-6" />
            <span className="text-xl font-bold text-white">ShieldAI</span>
          </div>
          <p className="text-sm text-slate-500 max-w-xs mx-auto mb-8">
            Protecting millions of users from digital threats using state-of-the-art AI.
          </p>
          <div className="text-xs text-slate-600">© 2026 ShieldAI Security. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
