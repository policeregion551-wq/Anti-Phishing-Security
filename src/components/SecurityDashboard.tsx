import React, { useState, useEffect } from 'react';
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
  Smartphone
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
import { AnalysisResult, SecurityLog, DailyStats, ConnectionStatus } from '@/types';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { auth, db } from '@/lib/firebase';
import AuthSystem from './AuthSystem';
import { UserProfile } from '@/types';
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
  updateDoc
} from 'firebase/firestore';

const INITIAL_CONNECTIONS: ConnectionStatus[] = [
  { id: 'tg', name: 'Telegram Bot', platform: 'telegram', isConnected: true, lastSync: new Date().toISOString(), autoScan: true },
  { id: 'fb', name: 'Facebook Messenger', platform: 'facebook', isConnected: false, lastSync: null, autoScan: false },
  { id: 'wa', name: 'WhatsApp Web', platform: 'whatsapp', isConnected: true, lastSync: new Date().toISOString(), autoScan: true },
  { id: 'sys', name: 'System Monitor', platform: 'system', isConnected: true, lastSync: new Date().toISOString(), autoScan: true },
];

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

const MOCK_LOGS: SecurityLog[] = [
  {
    id: '1',
    timestamp: new Date().toISOString(),
    content: 'https://secure-login-bank.com/verify',
    source: 'whatsapp',
    result: {
      isSafe: false,
      score: 12,
      threatType: 'phishing',
      reason: 'Domain impersonates a financial institution and uses an insecure connection.',
      recommendation: 'Do not visit this site. Report it to your bank.',
      details: {
        urgency: 'high',
        socialEngineeringTechniques: ['Impersonation', 'Urgency'],
        suspiciousElements: ['Look-alike domain', 'No SSL certificate']
      }
    }
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    content: 'Check out this cool video! http://bit.ly/xyz123',
    source: 'telegram',
    result: {
      isSafe: false,
      score: 45,
      threatType: 'suspicious',
      reason: 'Shortened URL with no clear destination. Often used to hide malicious sites.',
      recommendation: 'Be careful. Use a URL expander before clicking.',
      details: {
        urgency: 'medium',
        socialEngineeringTechniques: ['Curiosity'],
        suspiciousElements: ['URL Shortener']
      }
    }
  }
];

export default function SecurityDashboard() {
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isPro, setIsPro] = useState(false);
  const [connections, setConnections] = useState<ConnectionStatus[]>(INITIAL_CONNECTIONS);
  const [isAutoScanning, setIsAutoScanning] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'telebirr' | 'cbe' | null>(null);

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
          setIsPro(profile.isPro);
        }
      } else {
        setUserProfile(null);
        setIsPro(false);
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

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
                Dashboard
              </button>
              <button 
                onClick={() => setActiveTab('analysis')}
                className={`text-sm font-medium transition-colors ${activeTab === 'analysis' ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}
              >
                AI Scanner
              </button>
              <button 
                onClick={() => setActiveTab('reports')}
                className={`text-sm font-medium transition-colors ${activeTab === 'reports' ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}
              >
                Reports
              </button>
              <button 
                onClick={() => setActiveTab('connections')}
                className={`text-sm font-medium transition-colors ${activeTab === 'connections' ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}
              >
                Connections
              </button>
              {!isPro && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 gap-2"
                  onClick={() => setActiveTab('pricing')}
                >
                  <Zap className="w-3.5 h-3.5 fill-blue-400" />
                  Upgrade to Pro
                </Button>
              )}
            </div>

            <div className="flex items-center gap-4">
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
                  <CardDescription className="text-slate-400 uppercase text-[10px] font-bold tracking-widest">System Health</CardDescription>
                  <CardTitle className="text-3xl font-bold text-white flex items-baseline gap-2">
                    {safetyScore}% <span className="text-sm font-normal text-emerald-400">Secure</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${safetyScore}%` }}
                      className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-white/5 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardDescription className="text-slate-400 uppercase text-[10px] font-bold tracking-widest">Total Scanned</CardDescription>
                  <CardTitle className="text-3xl font-bold text-white">{totalScanned}</CardTitle>
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
                  <CardDescription className="text-slate-400 uppercase text-[10px] font-bold tracking-widest">Threats Blocked</CardDescription>
                  <CardTitle className="text-3xl font-bold text-red-400">{threatsBlocked}</CardTitle>
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
                  Instant AI Scanner
                </CardTitle>
                <CardDescription>Paste any link or message from Telegram, Facebook, or WhatsApp to verify its safety.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input 
                      placeholder="Paste URL or message here..." 
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
                    {isAnalyzing ? "Analyzing..." : "Scan Now"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-slate-900/50 border-white/5 overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold">Security Logs</CardTitle>
                    <CardDescription>Real-time monitoring results</CardDescription>
                  </div>
                  <History className="w-5 h-5 text-slate-500" />
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[400px]">
                    <div className="divide-y divide-white/5">
                      {logs.map((log) => (
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
                                {log.result.score}% Safe
                              </div>
                              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
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
              <h2 className="text-4xl font-bold text-white tracking-tight">የላቀ የኤአይ መርማሪ (Advanced AI Scanner)</h2>
              <p className="text-slate-400">የእኛ የኤአይ ሲስተም ሊንኮችን እና መልዕክቶችን በመመርመር ከሀኪንግ እና ከቫይረስ ይጠብቅዎታል።</p>
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
                      Analyzing Threats...
                    </div>
                  ) : "Run Deep Scan"}
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

        {activeTab === 'connections' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-4xl font-bold text-white tracking-tight">የመተግበሪያ ትስስር (App Connections)</h2>
              <p className="text-slate-400">ShieldAIን ከማህበራዊ ሚዲያ መተግበሪያዎችዎ ጋር በማገናኘት አውቶማቲክ ጥበቃ ያግኙ።</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {connections.map((conn) => (
                <Card key={conn.id} className="bg-slate-900/50 border-white/5 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        conn.platform === 'telegram' ? 'bg-sky-500/10 text-sky-500' :
                        conn.platform === 'facebook' ? 'bg-blue-600/10 text-blue-600' :
                        conn.platform === 'whatsapp' ? 'bg-emerald-500/10 text-emerald-500' :
                        'bg-slate-500/10 text-slate-500'
                      }`}>
                        {conn.platform === 'telegram' && <Send className="w-6 h-6" />}
                        {conn.platform === 'facebook' && <Facebook className="w-6 h-6" />}
                        {conn.platform === 'whatsapp' && <MessageSquare className="w-6 h-6" />}
                        {conn.platform === 'system' && <Smartphone className="w-6 h-6" />}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{conn.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {conn.isConnected ? `Last synced: ${new Date(conn.lastSync!).toLocaleTimeString()}` : 'Not connected'}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={conn.isConnected ? "default" : "outline"} className={conn.isConnected ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/20" : "text-slate-500"}>
                      {conn.isConnected ? 'Connected' : 'Disconnected'}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5">
                      <div className="space-y-0.5">
                        <div className="text-sm font-medium text-white">Auto-Scan Messages</div>
                        <div className="text-[10px] text-slate-500">Automatically analyze incoming links and texts.</div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => {
                          setConnections(prev => prev.map(c => c.id === conn.id ? { ...c, autoScan: !c.autoScan } : c));
                          toast.success(`${conn.name} Auto-Scan ${!conn.autoScan ? 'Enabled' : 'Disabled'}`);
                        }}
                      >
                        {conn.autoScan ? <ToggleRight className="w-8 h-8 text-blue-500" /> : <ToggleLeft className="w-8 h-8 text-slate-600" />}
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-white/5 p-3">
                    <Button 
                      variant="ghost" 
                      className="w-full text-xs gap-2 text-slate-400 hover:text-white"
                      onClick={() => {
                        if (!conn.isConnected) {
                          toast.info(`Connecting to ${conn.name}...`);
                          setTimeout(() => {
                            setConnections(prev => prev.map(c => c.id === conn.id ? { ...c, isConnected: true, lastSync: new Date().toISOString() } : c));
                            toast.success(`Successfully connected to ${conn.name}`);
                          }, 1500);
                        } else {
                          setConnections(prev => prev.map(c => c.id === conn.id ? { ...c, isConnected: false } : c));
                          toast.info(`Disconnected from ${conn.name}`);
                        }
                      }}
                    >
                      {conn.isConnected ? <RefreshCw className="w-3 h-3" /> : <Link2 className="w-3 h-3" />}
                      {conn.isConnected ? 'Sync Now' : 'Connect Account'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <Card className="bg-blue-600/10 border-blue-500/20 p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-blue-400" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-white">How it works? (እንዴት ነው የሚሰራው?)</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    ShieldAI uses official APIs and accessibility services to monitor your incoming notifications. 
                    When a message contains a link or suspicious text, our AI analyzes it in the background and alerts you instantly if a threat is found.
                  </p>
                  <div className="flex gap-4 pt-2">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <Lock className="w-3 h-3" /> End-to-End Encrypted
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <ShieldCheck className="w-3 h-3" /> Privacy Guaranteed
                    </div>
                  </div>
                </div>
              </div>
            </Card>
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
