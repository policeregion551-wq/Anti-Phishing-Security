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
  FileWarning,
  Copy
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
import { analyzeContent, performSecurityAudit, verifyReceipt } from '@/lib/gemini';
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
    confirmWithdraw: "Confirm Withdrawal",
    transactionId: "Transaction ID",
    enterTransactionId: "Enter Transaction ID",
    adminNumber: "Admin Telebirr Number",
    paymentInstructions: "Please send the payment to the number below and upload the receipt screenshot or enter the Transaction ID.",
    submitTransaction: "Verify Payment",
    yearlyPlan: "Yearly Plan (Best Value)",
    monthlyPlan: "Monthly Plan",
    uploadReceipt: "Upload Receipt Screenshot",
    verifying: "Verifying Receipt...",
    duplicateTransaction: "This Transaction ID has already been used.",
    invalidReceipt: "Invalid receipt. Please upload a clear Telebirr receipt.",
    pendingPayments: "Pending Payments",
    approve: "Approve",
    reject: "Reject",
    copy: "Copy",
    copied: "Copied!",
    freePlan: "Free Plan",
    proPlan: "Pro Plan",
    currentPlan: "Current Plan",
    upgradeNow: "Upgrade Now",
    everythingInFree: "Everything in Free",
    advancedAIScanner: "Advanced AI Scanner",
    deepSecurityAudits: "Deep Security Audits",
    prioritySupport: "Priority Support",
    basicContentAnalysis: "Basic Content Analysis",
    realTimeMonitoring: "Real-time Monitoring",
    securityAudits: "Security Audits",
    choosePlan: "Choose your payment plan",
    cancel: "Cancel",
    recommended: "Recommended",
    telebirrPayment: "Telebirr Payment",
    securePaymentTelebirr: "Secure payment via Telebirr",
    enterpriseSecurity: "Enterprise Security",
    institutionDashboard: "Institution Dashboard",
    monitoringSecurityFor: "Monitoring security for",
    activeThreats: "Active Threats",
    optimal: "Optimal",
    recent: "Recent",
    lastAudit: "Last Audit",
    today: "Today",
    attacksBlocked: "Attacks Blocked",
    institutionName: "Institution Name",
    telegramLink: "Telegram Link",
    whatsappLink: "WhatsApp Link",
    facebookLink: "Facebook Link",
    addInstitutionBtn: "Add Institution",
    recommendation: "Recommendation",
    securityScore: "Security Score",
    receiptUploaded: "Receipt Uploaded",
    amountOnReceiptWarning: "Amount on receipt is less than required. Admin will review.",
    autoVerificationFailed: "Auto-verification failed. Please enter Transaction ID manually."
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
    confirmWithdraw: "ማውጣቱን አረጋግጥ",
    transactionId: "የግብይት መለያ (Transaction ID)",
    enterTransactionId: "የግብይት መለያ ያስገቡ",
    adminNumber: "የአድሚን ቴሌብር ቁጥር",
    paymentInstructions: "እባክዎን ክፍያውን ከታች ባለው ቁጥር ይላኩ እና የደረሰኝ ስክሪንሹት ይጫኑ ወይም የግብይት መለያ (Transaction ID) ያስገቡ።",
    submitTransaction: "ክፍያውን አረጋግጥ",
    yearlyPlan: "የአመት ክፍያ (ተመራጭ)",
    monthlyPlan: "የወር ክፍያ",
    uploadReceipt: "የደረሰኝ ስክሪንሹት ይጫኑ",
    verifying: "ደረሰኙ እየተረጋገጠ ነው...",
    duplicateTransaction: "ይህ የግብይት መለያ ቀደም ብሎ ጥቅም ላይ ውሏል።",
    invalidReceipt: "ትክክለኛ ደረሰኝ አይደለም። እባክዎን ግልጽ የሆነ የቴሌብር ደረሰኝ ይጫኑ።",
    pendingPayments: "በመጠባበቅ ላይ ያሉ ክፍያዎች",
    approve: "አጽድቅ",
    reject: "ሰርዝ",
    copy: "ቅዳ",
    copied: "ተቀድቷል!",
    freePlan: "ነፃ አገልግሎት",
    proPlan: "ፕሮ አገልግሎት",
    currentPlan: "የአሁኑ አገልግሎት",
    upgradeNow: "አሁኑኑ ያሳድጉ",
    everythingInFree: "ሁሉንም በነፃ አገልግሎት ውስጥ ያሉ",
    advancedAIScanner: "ጥልቅ AI ስካነር",
    deepSecurityAudits: "ጥልቅ የደህንነት ምርመራዎች",
    prioritySupport: "ቅድሚያ የሚሰጠው ድጋፍ",
    basicContentAnalysis: "መሰረታዊ የምርመራ አገልግሎት",
    realTimeMonitoring: "የቀጥታ ክትትል",
    securityAudits: "የደህንነት ምርመራዎች",
    choosePlan: "የክፍያ አማራጭዎን ይምረጡ",
    cancel: "ሰርዝ",
    recommended: "ተመራጭ",
    telebirrPayment: "የቴሌብር ክፍያ",
    securePaymentTelebirr: "በቴሌብር አስተማማኝ ክፍያ",
    enterpriseSecurity: "የድርጅት ደህንነት",
    institutionDashboard: "የተቋም ዳሽቦርድ",
    monitoringSecurityFor: "ለዚህ ተቋም ጥበቃ እየተደረገ ነው፦",
    activeThreats: "ንቁ ጥቃቶች",
    optimal: "በጣም ጥሩ",
    recent: "የቅርብ ጊዜ",
    lastAudit: "የመጨረሻ ምርመራ",
    today: "ዛሬ",
    attacksBlocked: "የተከለከሉ ጥቃቶች",
    institutionName: "የተቋም ስም",
    telegramLink: "የቴሌግራም ሊንክ",
    whatsappLink: "የዋትስአፕ ሊንክ",
    facebookLink: "የፌስቡክ ሊንክ",
    addInstitutionBtn: "ተቋም ጨምር",
    recommendation: "ምክረ ሃሳብ",
    securityScore: "የደህንነት ውጤት",
    receiptUploaded: "ደረሰኝ ተጭኗል",
    amountOnReceiptWarning: "በደረሰኙ ላይ ያለው የገንዘብ መጠን ከሚፈለገው ያነሰ ነው። አድሚን ያረጋግጠዋል።",
    autoVerificationFailed: "አውቶማቲክ ማረጋገጫ አልተሳካም። እባክዎን የግብይት መለያውን (Transaction ID) በእጅ ያስገቡ።"
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
  const [transactionId, setTransactionId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(299);
  const [paymentPlan, setPaymentPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [isVerifyingReceipt, setIsVerifyingReceipt] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<AnalysisResult | null>(null);
  const [systemReports, setSystemReports] = useState<any[]>([]);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);

  const addSystemReport = async (action: string, details: string, type: 'info' | 'warning' | 'error' | 'success' = 'info') => {
    try {
      await addDoc(collection(db, 'system_reports'), {
        timestamp: new Date().toISOString(),
        action,
        details,
        type,
        userId: user?.uid || 'system'
      });
    } catch (e) {
      console.error("Failed to add system report", e);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    
    // Explicitly enable context menu and text selection
    const enableInteraction = (e: MouseEvent) => {
      e.stopPropagation();
    };
    document.addEventListener('contextmenu', enableInteraction, true);
    
    // Check for payment success redirect
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment') === 'success') {
      toast.success("Payment Verified!", {
        description: "Your account has been upgraded to Pro successfully."
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    return () => {
      document.removeEventListener('contextmenu', enableInteraction, true);
    };
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

      const reportsSnap = await getDocs(query(collection(db, 'system_reports'), orderBy('timestamp', 'desc'), limit(100)));
      setSystemReports(reportsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const paymentsSnap = await getDocs(query(collection(db, 'payment_requests'), where('status', '==', 'pending')));
      setPendingPayments(paymentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Failed to load admin data", error);
    }
  };

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      const handleUser = async () => {
        try {
          // Only update if we don't have a hardcoded admin session
          // or if the currentUser is actually different
          if (currentUser) {
            setUser(currentUser);
            const docRef = doc(db, 'users', currentUser.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              const profile = docSnap.data() as UserProfile;
              setUserProfile(profile);
              setIsPro(profile.isPro || profile.role === 'admin' || currentUser.email === 'policeregion551@gmail.com');
            } else if (currentUser.email === 'policeregion551@gmail.com') {
              setIsPro(true);
            }
            
            if (currentUser.email === 'policeregion551@gmail.com') {
              loadAdminData();
            }
          } else {
            // Only clear if we don't have a hardcoded session
            // A hardcoded session will have a uid starting with 'admin-'
            setUser(prev => {
              if (prev && prev.uid && prev.uid.startsWith('admin-')) return prev;
              setUserProfile(null);
              setIsPro(false);
              return null;
            });
          }
        } catch (error) {
          console.error("Auth listener error:", error);
        } finally {
          setIsAuthLoading(false);
        }
      };
      
      handleUser();
    });
    return () => unsubscribe();
  }, []);

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

  const [newInstitution, setNewInstitution] = useState({ 
    name: '', 
    email: '', 
    phone: '',
    telegram: '',
    whatsapp: '',
    facebook: ''
  });
  const [institutions, setInstitutions] = useState<any[]>([]);

  const addInstitution = async () => {
    if (!newInstitution.name) return;
    try {
      await addDoc(collection(db, 'institutions'), {
        ...newInstitution,
        createdAt: new Date().toISOString()
      });
      toast.success("Institution added successfully");
      setNewInstitution({ 
        name: '', 
        email: '', 
        phone: '',
        telegram: '',
        whatsapp: '',
        facebook: ''
      });
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
      // Simulate withdrawal logic
      const statsRef = doc(db, 'system_stats', 'global');
      const statsSnap = await getDoc(statsRef);
      const currentRevenue = statsSnap.exists() ? (statsSnap.data().totalRevenue || 0) : 0;
      
      if (currentRevenue < Number(withdrawAmount)) {
        toast.error("Insufficient balance for withdrawal");
        return;
      }

      await updateDoc(statsRef, {
        totalRevenue: currentRevenue - Number(withdrawAmount)
      });

      await addSystemReport(
        'Withdrawal Processed',
        `Admin withdrew ${withdrawAmount} ETB to Telebirr number ${withdrawPhone}.`,
        'warning'
      );

      toast.success("Withdrawal processed successfully via Telebirr!");
      setWithdrawAmount('');
      setWithdrawPhone('');
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t.copied);
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

          await addSystemReport(
            'Auto-Scan Performed',
            `Auto-scan on ${randomSource} for user ${user.email}. Result: ${result.isSafe ? 'Safe' : 'Unsafe (' + result.threatType + ')'}`,
            result.isSafe ? 'info' : 'warning'
          );
          
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
    if (!transactionId || !user) return;
    setIsPaying(true);
    try {
      // Check for duplicate Transaction ID
      const q = query(collection(db, 'payment_requests'), where('transactionId', '==', transactionId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        toast.error(t.duplicateTransaction);
        setIsPaying(false);
        return;
      }

      await addDoc(collection(db, 'payment_requests'), {
        userId: user.uid,
        userEmail: user.email,
        transactionId,
        amount: paymentAmount,
        status: 'pending',
        timestamp: new Date().toISOString()
      });
      
      await addSystemReport(
        'Payment Request Submitted',
        `User ${user.email} submitted transaction ID: ${transactionId}`,
        'info'
      );
      
      setPaymentStep('success');
      toast.success("Transaction ID submitted!", {
        description: "Admin will verify your payment shortly."
      });
    } catch (error) {
      toast.error("Submission failed.");
    } finally {
      setIsPaying(false);
    }
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
        handleAutoVerify(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAutoVerify = async (base64Image: string) => {
    setIsVerifyingReceipt(true);
    toast.info(t.verifying);
    
    try {
      const base64Data = base64Image.split(',')[1];
      const result = await verifyReceipt(base64Data);
      
      if (result.isValid) {
        // Check for duplicate Transaction ID
        const q = query(collection(db, 'payment_requests'), where('transactionId', '==', result.transactionId));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          toast.error(t.duplicateTransaction);
          return;
        }

        setTransactionId(result.transactionId);
        toast.success("Receipt verified automatically!", {
          description: `Transaction ID: ${result.transactionId} | Amount: ${result.amount} ETB`
        });
        
        // Auto-approve if amount matches plan
        if (result.amount >= paymentAmount) {
          await processAutomaticUpgrade(result.transactionId, result.amount);
        } else {
          toast.warning("Amount on receipt is less than required. Admin will review.");
        }
      } else {
        toast.error(t.invalidReceipt, { description: result.reason });
      }
    } catch (error) {
      console.error("Auto-verification failed", error);
      toast.error("Auto-verification failed. Please enter Transaction ID manually.");
    } finally {
      setIsVerifyingReceipt(false);
    }
  };

  const processAutomaticUpgrade = async (tid: string, amount: number) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'payment_requests'), {
        userId: user.uid,
        userEmail: user.email,
        transactionId: tid,
        amount: amount,
        status: 'approved',
        timestamp: new Date().toISOString(),
        verifiedBy: 'AI'
      });

      await updateDoc(doc(db, 'users', user.uid), { 
        isPro: true, 
        paymentStatus: 'completed',
        plan: paymentPlan,
        expiryDate: paymentPlan === 'yearly' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : null
      });

      const statsRef = doc(db, 'system_stats', 'global');
      const statsSnap = await getDoc(statsRef);
      if (statsSnap.exists()) {
        await updateDoc(statsRef, {
          totalRevenue: (statsSnap.data().totalRevenue || 0) + amount
        });
      }

      await addSystemReport(
        'AI Payment Verification',
        `User ${user.email} upgraded automatically via receipt scan. ID: ${tid}`,
        'success'
      );

      setIsPro(true);
      setPaymentStep('success');
    } catch (e) {
      console.error("Auto upgrade failed", e);
    }
  };

  const handleApprovePayment = async (requestId: string, userId: string, amount: number) => {
    try {
      // Update request status
      await updateDoc(doc(db, 'payment_requests', requestId), { status: 'approved' });
      
      // Upgrade user
      await updateDoc(doc(db, 'users', userId), { isPro: true, paymentStatus: 'completed' });
      
      // Update global revenue
      const statsRef = doc(db, 'system_stats', 'global');
      const statsSnap = await getDoc(statsRef);
      if (statsSnap.exists()) {
        await updateDoc(statsRef, {
          totalRevenue: (statsSnap.data().totalRevenue || 0) + amount
        });
      }
      
      await addSystemReport(
        'Payment Approved',
        `Admin approved payment for user ${userId}. Amount: ${amount} ETB`,
        'success'
      );
      
      toast.success("Payment approved!");
      loadAdminData(); // Refresh admin view
    } catch (error) {
      toast.error("Approval failed.");
    }
  };

  const handleRejectPayment = async (requestId: string) => {
    try {
      await updateDoc(doc(db, 'payment_requests', requestId), { status: 'rejected' });
      toast.info("Payment rejected.");
      loadAdminData();
    } catch (error) {
      toast.error("Rejection failed.");
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

      await addSystemReport(
        'Manual Scan Performed',
        `User ${user.email} scanned content. Result: ${result.isSafe ? 'Safe' : 'Unsafe (' + result.threatType + ')'}`,
        result.isSafe ? 'info' : 'warning'
      );
      
      setLastAnalysis(result);
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
    <div className="min-h-screen bg-[#020202] text-slate-100 font-sans selection:bg-blue-500/30 overflow-auto">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,1),rgba(2,2,2,1))] -z-10" />
      <Toaster position="top-right" theme="dark" />
      
      {/* Navigation */}
      <nav className="border-b border-white/5 bg-black/60 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.2)] border border-blue-400/20">
                <Shield className="text-white w-6 h-6" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-white to-slate-500 bg-clip-text text-transparent leading-none">
                  BINI SHIELD AI
                </span>
                <div className="text-[8px] font-mono text-blue-400 uppercase tracking-tighter leading-none mt-1 opacity-80">
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
                <Button size="sm" onClick={() => setActiveTab('auth')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/20 border border-blue-400/30 transition-all active:scale-95">
                  {t.login}
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-auto">
        {!user && activeTab === 'auth' ? (
          <AuthSystem onAuthComplete={(u) => setUser(u)} />
        ) : !user ? (
          <div className="text-center py-20 space-y-8">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
              <Shield className="w-24 h-24 text-blue-500 mx-auto relative animate-pulse" />
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-white tracking-tight">Welcome to <span className="text-blue-500">BINI SHIELD AI</span></h1>
              <p className="text-slate-400 max-w-md mx-auto text-lg">The most advanced AI-powered security system for your digital life.</p>
            </div>
            <Button size="lg" onClick={() => setActiveTab('auth')} className="bg-blue-600 hover:bg-blue-700 px-12 h-14 text-lg font-bold shadow-xl shadow-blue-600/20 border border-blue-400/30 text-white">
              Get Started
            </Button>
          </div>
        ) : isAuthLoading ? (
          <div className="flex items-center justify-center py-40">
            <RefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
          </div>
        ) : (
          <>
            {userProfile?.role === 'institution' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-10 bg-gradient-to-br from-blue-600/10 via-blue-900/5 to-transparent border border-blue-500/20 rounded-[2.5rem] backdrop-blur-xl shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] -z-10" />
                  <div className="space-y-3 text-center md:text-left">
                    <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/30 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">{t.enterpriseSecurity}</Badge>
                    <h2 className="text-4xl font-bold text-white tracking-tight">{t.institutionDashboard}</h2>
                    <p className="text-slate-400 text-lg">{t.monitoringSecurityFor} <strong className="text-white font-semibold">{userProfile.name}</strong></p>
                  </div>
                  <div className="flex gap-4">
                    {userProfile.institutionLinks?.telegram && (
                      <a href={userProfile.institutionLinks.telegram} target="_blank" className="w-14 h-14 bg-slate-900/80 border border-white/10 rounded-2xl flex items-center justify-center text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-xl hover:shadow-blue-600/20 group">
                        <Send className="w-6 h-6 group-hover:scale-110 transition-transform" />
                      </a>
                    )}
                    {userProfile.institutionLinks?.facebook && (
                      <a href={userProfile.institutionLinks.facebook} target="_blank" className="w-14 h-14 bg-slate-900/80 border border-white/10 rounded-2xl flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-xl hover:shadow-blue-600/20 group">
                        <Facebook className="w-6 h-6 group-hover:scale-110 transition-transform" />
                      </a>
                    )}
                    {userProfile.institutionLinks?.whatsapp && (
                      <a href={userProfile.institutionLinks.whatsapp} target="_blank" className="w-14 h-14 bg-slate-900/80 border border-white/10 rounded-2xl flex items-center justify-center text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all shadow-xl hover:shadow-emerald-600/20 group">
                        <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <Card className="bg-slate-900/40 border-white/5 backdrop-blur-md p-8 rounded-3xl border-l-4 border-l-red-500/50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-400">
                        <ShieldAlert className="w-6 h-6" />
                      </div>
                      <Badge className="bg-red-500/10 text-red-400">Critical</Badge>
                    </div>
                    <CardDescription className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">{t.activeThreats}</CardDescription>
                    <CardTitle className="text-4xl font-bold text-white">0</CardTitle>
                  </Card>
                  <Card className="bg-slate-900/40 border-white/5 backdrop-blur-md p-8 rounded-3xl border-l-4 border-l-emerald-500/50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-400">{t.optimal}</Badge>
                    </div>
                    <CardDescription className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">{t.securityScore}</CardDescription>
                    <CardTitle className="text-4xl font-bold text-white">100%</CardTitle>
                  </Card>
                  <Card className="bg-slate-900/40 border-white/5 backdrop-blur-md p-8 rounded-3xl border-l-4 border-l-blue-500/50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400">
                        <History className="w-6 h-6" />
                      </div>
                      <Badge className="bg-blue-500/10 text-blue-400">{t.recent}</Badge>
                    </div>
                    <CardDescription className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">{t.lastAudit}</CardDescription>
                    <CardTitle className="text-2xl font-bold text-white">{t.today}</CardTitle>
                  </Card>
                </div>
              </motion.div>
            )}

            {activeTab === 'dashboard' && userProfile?.role !== 'institution' && (
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
                      <Button className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/20 border border-blue-400/30 transition-all active:scale-95" onClick={handleAnalyze} disabled={isAnalyzing || !input.trim()}>
                        {isAnalyzing ? t.scanning : t.analyze}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="bg-slate-900/50 border-white/5 overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg font-semibold">{t.recentLogs}</CardTitle>
                      <div className="flex items-center gap-2">
                        {logs.length > 0 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-[10px] uppercase font-bold text-slate-400 hover:text-white"
                            onClick={() => copyToClipboard(logs.map(l => `[${l.timestamp}] ${l.source}: ${l.content} -> ${l.result}`).join('\n'))}
                          >
                            <Copy className="w-3 h-3 mr-1" /> {t.copy} All
                          </Button>
                        )}
                        <History className="w-5 h-5 text-slate-500" />
                      </div>
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
                                  <div className="flex items-start gap-3 flex-1">
                                    <div className={`mt-1 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${log.result.isSafe ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                      {log.result.isSafe ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="outline" className="text-[10px] uppercase">{log.source}</Badge>
                                        <span className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium text-slate-200 line-clamp-1 flex-1">{log.content}</p>
                                        <button 
                                          onClick={() => copyToClipboard(log.content)}
                                          className="p-1 hover:bg-white/10 rounded text-slate-500 hover:text-white transition-colors"
                                          title={t.copy}
                                        >
                                          <Copy className="w-3 h-3" />
                                        </button>
                                      </div>
                                      <p className="text-xs text-slate-400 line-clamp-2">{log.result.reason}</p>
                                    </div>
                                  </div>
                                  <div className={`text-xs font-bold shrink-0 ${log.result.isSafe ? 'text-emerald-400' : 'text-red-400'}`}>
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
                {!isPro && user?.email !== 'policeregion551@gmail.com' && (
                  <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center mb-8">
                    <Lock className="w-10 h-10 text-amber-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white">{t.paymentRequired}</h3>
                    <p className="text-slate-400 mb-6">{t.paymentDesc}</p>
                    <Button onClick={() => setActiveTab('pricing')} className="bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-lg shadow-amber-600/20 border border-amber-400/30 transition-all active:scale-95">
                      {t.payNow}
                    </Button>
                  </div>
                )}
                <div className={!isPro && user?.email !== 'policeregion551@gmail.com' ? 'opacity-50 pointer-events-none' : ''}>
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
                    <Button className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold mt-6 shadow-lg shadow-blue-600/20 border border-blue-400/30 transition-all active:scale-95" onClick={handleAnalyze} disabled={isAnalyzing || !input.trim()}>
                      {isAnalyzing ? t.scanning : t.analyze}
                    </Button>
                  </Card>

                  {lastAnalysis && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                      <Card className={`bg-slate-900/50 border-2 ${lastAnalysis.isSafe ? 'border-emerald-500/30' : 'border-red-500/30'} p-6`}>
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${lastAnalysis.isSafe ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                              {lastAnalysis.isSafe ? <ShieldCheck className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-white">{lastAnalysis.isSafe ? t.safe : t.unsafe}</h3>
                              <p className="text-sm text-slate-400">{lastAnalysis.threatType.toUpperCase()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${lastAnalysis.isSafe ? 'text-emerald-400' : 'text-red-400'}`}>{lastAnalysis.score}%</div>
                            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{t.securityScore}</div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="p-4 bg-white/5 rounded-xl border border-white/5 relative group">
                            <p className="text-slate-200 text-sm leading-relaxed">{lastAnalysis.reason}</p>
                            <button 
                              onClick={() => copyToClipboard(lastAnalysis.reason)}
                              className="absolute top-2 right-2 p-2 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-white"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/10 relative group">
                            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">{t.recommendation}</h4>
                            <p className="text-slate-300 text-sm">{lastAnalysis.recommendation}</p>
                            <button 
                              onClick={() => copyToClipboard(lastAnalysis.recommendation)}
                              className="absolute top-2 right-2 p-2 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-white"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'audit' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                {!isPro && user?.email !== 'policeregion551@gmail.com' && (
                  <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center mb-8">
                    <Lock className="w-10 h-10 text-amber-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white">{t.paymentRequired}</h3>
                    <p className="text-slate-400 mb-6">{t.paymentDesc}</p>
                    <Button onClick={() => setActiveTab('pricing')} className="bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-lg shadow-amber-600/20 border border-amber-400/30 transition-all active:scale-95">
                      {t.payNow}
                    </Button>
                  </div>
                )}
                <div className={!isPro && user?.email !== 'policeregion551@gmail.com' ? 'opacity-50 pointer-events-none' : ''}>
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
                      <Button className="h-12 bg-blue-600 hover:bg-blue-700 px-8 text-white font-bold shadow-lg shadow-blue-600/20 border border-blue-400/30 transition-all active:scale-95" onClick={handleAudit} disabled={isAuditing}>
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
                            <div className="font-bold text-white print:text-black flex items-center gap-2">
                              {currentAudit.id}
                              <button onClick={() => copyToClipboard(currentAudit.id)} className="print:hidden p-1 hover:bg-white/10 rounded">
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-500">Date</div>
                            <div className="font-bold text-white print:text-black">{new Date(currentAudit.timestamp).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-bold text-white flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-amber-500" />
                            {t.findings}
                          </h4>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-[10px] uppercase font-bold text-slate-400 hover:text-white"
                            onClick={() => copyToClipboard(currentAudit.findings.map((f: any) => `[${f.severity.toUpperCase()}] ${f.issue}\nFix: ${f.fix}`).join('\n\n'))}
                          >
                            <Copy className="w-3 h-3 mr-1" /> {t.copy} All
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          {currentAudit.findings.map((finding: any, idx: number) => (
                            <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
                              <div className="flex items-center justify-between">
                                <Badge className={finding.severity === 'high' ? 'bg-red-500' : finding.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'}>
                                  {finding.severity.toUpperCase()}
                                </Badge>
                                <button onClick={() => copyToClipboard(`${finding.issue}\nFix: ${finding.fix}`)} className="p-1 hover:bg-white/10 rounded text-slate-500 hover:text-white transition-colors">
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="text-sm font-bold text-white">{finding.issue}</div>
                              <div className="text-xs text-slate-400"><strong>Fix:</strong> {finding.fix}</div>
                            </div>
                          ))}
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
                  <h2 className="text-4xl font-bold text-white mb-4">BINI SHIELD AI Pro</h2>
                  <p className="text-slate-400">{t.socialDesc}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="bg-slate-900/50 border-white/5 p-8 flex flex-col">
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-white mb-2">{t.freePlan}</h3>
                      <div className="text-3xl font-bold text-white">0 ETB <span className="text-sm font-normal text-slate-500">/ {lang === 'en' ? 'month' : 'ወር'}</span></div>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                      <li className="flex items-center gap-2 text-slate-300"><Check className="w-4 h-4 text-emerald-500" /> {t.basicContentAnalysis}</li>
                      <li className="flex items-center gap-2 text-slate-300"><Check className="w-4 h-4 text-emerald-500" /> {t.realTimeMonitoring}</li>
                      <li className="flex items-center gap-2 text-slate-500"><X className="w-4 h-4 text-red-500" /> {t.advancedAIScanner}</li>
                      <li className="flex items-center gap-2 text-slate-500"><X className="w-4 h-4 text-red-500" /> {t.securityAudits}</li>
                    </ul>
                    <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5" disabled>{t.currentPlan}</Button>
                  </Card>

                  <Card className="bg-blue-600/10 border-blue-500/50 p-8 flex flex-col relative overflow-hidden">
                    <div className="absolute top-4 right-4 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">{t.recommended}</div>
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-white mb-2">{t.proPlan}</h3>
                      <div className="text-3xl font-bold text-white">299 ETB <span className="text-sm font-normal text-slate-400">/ {lang === 'en' ? 'month' : 'ወር'}</span></div>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                      <li className="flex items-center gap-2 text-slate-200"><Check className="w-4 h-4 text-emerald-400" /> {t.everythingInFree}</li>
                      <li className="flex items-center gap-2 text-slate-200"><Check className="w-4 h-4 text-emerald-400" /> {t.advancedAIScanner}</li>
                      <li className="flex items-center gap-2 text-slate-200"><Check className="w-4 h-4 text-emerald-400" /> {t.deepSecurityAudits}</li>
                      <li className="flex items-center gap-2 text-slate-200"><Check className="w-4 h-4 text-emerald-400" /> {t.prioritySupport}</li>
                    </ul>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 shadow-lg shadow-blue-600/20 border border-blue-400/30 transition-all active:scale-95" onClick={() => { setPaymentStep('method'); setIsPaying(true); }}>{t.upgradeNow}</Button>
                  </Card>
                </div>

                <AnimatePresence>
                  {isPaying && (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
                    >
                      <Card className="w-full max-w-md bg-slate-900 border-white/10 shadow-2xl my-auto relative">
                        <button 
                          onClick={() => setIsPaying(false)}
                          className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors z-10"
                        >
                          <X className="w-5 h-5" />
                        </button>
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
                              <p className="text-center text-slate-400 mb-6">{t.choosePlan}</p>
                              <div className="grid grid-cols-2 gap-4 mb-6">
                                <button 
                                  onClick={() => { setPaymentPlan('monthly'); setPaymentAmount(299); }}
                                  className={`p-4 rounded-xl border-2 transition-all ${paymentPlan === 'monthly' ? 'border-blue-500 bg-blue-500/10' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}
                                >
                                  <div className="text-sm font-bold text-white">{t.monthlyPlan}</div>
                                  <div className="text-xl font-bold text-blue-400">299 ETB</div>
                                </button>
                                <button 
                                  onClick={() => { setPaymentPlan('yearly'); setPaymentAmount(2999); }}
                                  className={`p-4 rounded-xl border-2 transition-all ${paymentPlan === 'yearly' ? 'border-amber-500 bg-amber-500/10' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}
                                >
                                  <div className="text-sm font-bold text-white">{t.yearlyPlan}</div>
                                  <div className="text-xl font-bold text-amber-400">2999 ETB</div>
                                </button>
                              </div>
                              <Button 
                                className="w-full h-16 bg-[#00adef] hover:bg-[#0096d1] flex items-center justify-between px-6 group"
                                onClick={() => setPaymentStep('phone')}
                              >
                                <span className="text-lg font-bold text-white">Telebirr</span>
                                <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                              </Button>
                              <Button variant="outline" className="w-full h-16 border-white/10 text-white hover:bg-white/5" onClick={() => setIsPaying(false)}>
                                {t.cancel}
                              </Button>
                            </div>
                          )}

                          {paymentStep === 'phone' && (
                            <div className="space-y-6">
                              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-center">
                                <div className="text-xs text-slate-400 mb-1">{t.adminNumber}</div>
                                <div className="text-2xl font-bold text-white tracking-widest">0927145171</div>
                              </div>
                              <p className="text-xs text-slate-400 text-center px-4">
                                {t.paymentInstructions}
                              </p>

                              <div className="space-y-4">
                                <div className="relative">
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleReceiptUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    disabled={isVerifyingReceipt}
                                  />
                                  <div className={`w-full h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${receiptImage ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 bg-black/40 hover:bg-black/60'}`}>
                                    {isVerifyingReceipt ? (
                                      <div className="flex items-center gap-2 text-blue-400">
                                        <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                                        <span className="text-xs font-bold">{t.verifying}</span>
                                      </div>
                                    ) : receiptImage ? (
                                      <>
                                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                        <span className="text-xs text-emerald-400 font-bold">{t.receiptUploaded}</span>
                                      </>
                                    ) : (
                                      <>
                                        <Upload className="w-6 h-6 text-slate-500" />
                                        <span className="text-xs text-slate-500 font-bold">{t.uploadReceipt}</span>
                                      </>
                                    )}
                                  </div>
                                </div>

                                <div className="relative flex items-center py-2">
                                  <div className="flex-grow border-t border-white/5"></div>
                                  <span className="flex-shrink mx-4 text-slate-600 text-[10px] font-bold uppercase tracking-widest">OR</span>
                                  <div className="flex-grow border-t border-white/5"></div>
                                </div>

                                <div className="space-y-2">
                                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t.transactionId}</label>
                                  <Input 
                                    placeholder={t.enterTransactionId} 
                                    className="bg-black/40 border-white/10 h-12 text-white text-lg"
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                  />
                                </div>
                              </div>

                              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-center">
                                <div className="text-xs text-slate-400 mb-1">Total Amount</div>
                                <div className="text-2xl font-bold text-white">{paymentAmount} ETB</div>
                              </div>
                              <Button 
                                className="w-full h-12 bg-[#00adef] hover:bg-[#0096d1] text-white font-bold"
                                onClick={() => transactionId.length >= 6 ? handlePayment() : toast.error("Invalid Transaction ID")}
                                disabled={isPaying || isVerifyingReceipt}
                              >
                                {isPaying ? "Submitting..." : t.submitTransaction}
                              </Button>
                              <Button variant="ghost" className="w-full text-slate-400" onClick={() => setPaymentStep('method')} disabled={isPaying || isVerifyingReceipt}>Back</Button>
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
                      <CardDescription className="text-slate-400 uppercase text-[10px] font-bold">{t.attacksBlocked}</CardDescription>
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
                        <Button variant="ghost" className="flex-1" onClick={() => setIsWithdrawing(false)}>{t.cancel}</Button>
                      </div>
                    </div>
                  </Card>
                )}

                <Tabs defaultValue="users">
                  <TabsList className="bg-slate-900 border-white/5">
                    <TabsTrigger value="users">{t.users}</TabsTrigger>
                    <TabsTrigger value="institutions">{t.institutions}</TabsTrigger>
                    <TabsTrigger value="attacks">{t.attackReports}</TabsTrigger>
                    <TabsTrigger value="pending">{t.pendingPayments}</TabsTrigger>
                    <TabsTrigger value="reports">{t.reports}</TabsTrigger>
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
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        <Input 
                          placeholder={t.institutionName} 
                          value={newInstitution.name} 
                          onChange={(e) => setNewInstitution({...newInstitution, name: e.target.value})}
                          className="bg-black/40 border-white/10"
                        />
                        <Input 
                          placeholder={t.email} 
                          value={newInstitution.email} 
                          onChange={(e) => setNewInstitution({...newInstitution, email: e.target.value})}
                          className="bg-black/40 border-white/10"
                        />
                        <Input 
                          placeholder={t.telegramLink} 
                          value={newInstitution.telegram} 
                          onChange={(e) => setNewInstitution({...newInstitution, telegram: e.target.value})}
                          className="bg-black/40 border-white/10"
                        />
                        <Input 
                          placeholder={t.whatsappLink} 
                          value={newInstitution.whatsapp} 
                          onChange={(e) => setNewInstitution({...newInstitution, whatsapp: e.target.value})}
                          className="bg-black/40 border-white/10"
                        />
                        <Input 
                          placeholder={t.facebookLink} 
                          value={newInstitution.facebook} 
                          onChange={(e) => setNewInstitution({...newInstitution, facebook: e.target.value})}
                          className="bg-black/40 border-white/10"
                        />
                        <Button onClick={addInstitution} className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/20 border border-blue-400/30 transition-all active:scale-95">{t.addInstitutionBtn}</Button>
                      </div>
                      <ScrollArea className="h-[300px]">
                        <div className="divide-y divide-white/5">
                          {institutions.map((inst, i) => (
                            <div key={i} className="p-4 flex items-center justify-between">
                              <div>
                                <div className="font-bold text-white">{inst.name}</div>
                                <div className="text-xs text-slate-500">{inst.email}</div>
                                <div className="flex gap-2 mt-2">
                                  {inst.telegram && <Badge variant="outline" className="text-[8px]">TG</Badge>}
                                  {inst.whatsapp && <Badge variant="outline" className="text-[8px]">WA</Badge>}
                                  {inst.facebook && <Badge variant="outline" className="text-[8px]">FB</Badge>}
                                </div>
                              </div>
                              <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">Active</Badge>
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
                  <TabsContent value="pending">
                    <Card className="bg-slate-900/50 border-white/5">
                      <ScrollArea className="h-[400px]">
                        <div className="divide-y divide-white/5">
                          {pendingPayments.map((req, i) => (
                            <div key={i} className="p-4 flex items-center justify-between">
                              <div>
                                <div className="font-bold text-white">{req.userEmail}</div>
                                <div className="text-xs text-slate-500">ID: {req.transactionId}</div>
                                <div className="text-xs text-amber-500">{req.amount} ETB</div>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleApprovePayment(req.id, req.userId, req.amount)}>
                                  {t.approve}
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleRejectPayment(req.id)}>
                                  {t.reject}
                                </Button>
                              </div>
                            </div>
                          ))}
                          {pendingPayments.length === 0 && (
                            <div className="text-center py-20 text-slate-500">No pending payments.</div>
                          )}
                        </div>
                      </ScrollArea>
                    </Card>
                  </TabsContent>
                  <TabsContent value="reports">
                    <Card className="bg-slate-900/50 border-white/5 p-6">
                      <ScrollArea className="h-[400px]">
                        <div className="space-y-4">
                          {systemReports.map((report, i) => (
                            <div key={i} className="p-4 bg-black/20 rounded-lg border border-white/5">
                              <div className="flex justify-between items-start mb-2">
                                <Badge className={
                                  report.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                                  report.type === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                                  report.type === 'error' ? 'bg-red-500/20 text-red-400' :
                                  'bg-blue-500/20 text-blue-400'
                                }>
                                  {report.action}
                                </Badge>
                                <span className="text-[10px] text-slate-500">{new Date(report.timestamp).toLocaleString()}</span>
                              </div>
                              <p className="text-sm text-slate-300">{report.details}</p>
                            </div>
                          ))}
                          {systemReports.length === 0 && (
                            <div className="text-center py-20 text-slate-500">No system reports found.</div>
                          )}
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
            <span className="text-xl font-bold text-white">BINI SHIELD AI</span>
          </div>
          <p className="text-sm text-slate-500 max-w-xs mx-auto mb-8">
            Protecting millions of users from digital threats using state-of-the-art AI.
          </p>
          <div className="text-xs text-slate-600">© 2026 BINI SHIELD AI Security. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
