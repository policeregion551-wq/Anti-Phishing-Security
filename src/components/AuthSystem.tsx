import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Mail, Lock, Phone, User, ArrowRight, CheckCircle2, RefreshCw, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { auth, db } from '@/lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

type AuthStep = 'register' | 'verify' | 'setPassword' | 'login';

export default function AuthSystem({ onAuthComplete }: { onAuthComplete: (user: any) => void }) {
  const [step, setStep] = useState<AuthStep>('register');
  const [loading, setLoading] = useState(false);
  
  // Form States
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    code: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.name || !formData.phone) {
      toast.error("Please fill all fields");
      return;
    }

    // Admin Check: policeregion551@gmail.com doesn't need to register
    if (formData.email === 'policeregion551@gmail.com') {
      toast.info("Admin account detected. Please login directly.");
      setStep('login');
      return;
    }
    
    setLoading(true);
    
    // Generate real 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    setFormData(prev => ({ ...prev, code: '', generatedCode: otpCode } as any));

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          code: otpCode,
          name: formData.name
        })
      });

      const data = await response.json();

      if (data.success) {
        setStep('verify');
        if (data.isMock) {
          toast.warning("SMTP not configured. Code logged to server console.");
          console.log("DEMO OTP:", otpCode);
        } else {
          toast.success("Verification code sent to " + formData.email);
        }
      } else {
        throw new Error(data.error || "Failed to send OTP");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const expectedCode = (formData as any).generatedCode;
    
    if (formData.code === expectedCode) {
      setStep('setPassword');
    } else {
      toast.error("Invalid verification code. Please check your email.");
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: formData.name });

      // Save user profile to Firestore
      const userProfile = {
        uid: user.uid,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        isPro: false,
        role: formData.email === 'policeregion551@gmail.com' ? 'admin' : 'user',
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);
      
      toast.success("Account created successfully!");
      onAuthComplete(user);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      toast.success("Welcome back!");
      onAuthComplete(userCredential.user);
    } catch (error: any) {
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.3)] mb-4">
            <Shield className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">ShieldAI Security</h1>
          <p className="text-slate-500 mt-2">በም/ኢ/ር ቢኒያም ይርሳዉ መጢና የበለፀገ</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'register' && (
            <motion.div
              key="register"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-slate-900/50 border-white/5 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-xl text-white">አዲስ አካውንት ይፍጠሩ (Register)</CardTitle>
                  <CardDescription>ለመጀመር መረጃዎን ያስገቡ</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                        <Input 
                          name="name"
                          placeholder="ሙሉ ስም (Full Name)" 
                          className="pl-10 bg-black/20 border-white/10 text-white"
                          value={formData.name}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                        <Input 
                          name="phone"
                          placeholder="ስልክ ቁጥር (Phone Number)" 
                          className="pl-10 bg-black/20 border-white/10 text-white"
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                        <Input 
                          name="email"
                          type="email"
                          placeholder="ኢሜል (Email)" 
                          className="pl-10 bg-black/20 border-white/10 text-white"
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-11" disabled={loading}>
                      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "ይመዝገቡ (Register)"}
                    </Button>
                    <div className="text-center mt-4">
                      <button 
                        type="button"
                        onClick={() => setStep('login')}
                        className="text-sm text-blue-400 hover:underline"
                      >
                        አካውንት አለዎት? ይግቡ (Login)
                      </button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 'verify' && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-slate-900/50 border-white/5 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-xl text-white">ኢሜልዎን ያረጋግጡ (Verify Email)</CardTitle>
                  <CardDescription>ወደ {formData.email} የተላከውን ኮድ ያስገቡ</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleVerify} className="space-y-4">
                    <Input 
                      name="code"
                      placeholder="የማረጋገጫ ኮድ (Verification Code)" 
                      className="text-center text-2xl tracking-[1em] bg-black/20 border-white/10 text-white h-14"
                      value={formData.code}
                      onChange={handleChange}
                      maxLength={6}
                    />
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-11">
                      ያረጋግጡ (Verify)
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 'setPassword' && (
            <motion.div
              key="setPassword"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-slate-900/50 border-white/5 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-xl text-white">የይለፍ ቃል ይፍጠሩ (Set Password)</CardTitle>
                  <CardDescription>ለአካውንትዎ ጠንካራ የይለፍ ቃል ይምረጡ</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSetPassword} className="space-y-4">
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                      <Input 
                        name="password"
                        type="password"
                        placeholder="አዲስ የይለፍ ቃል (New Password)" 
                        className="pl-10 bg-black/20 border-white/10 text-white"
                        value={formData.password}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                      <Input 
                        name="confirmPassword"
                        type="password"
                        placeholder="የይለፍ ቃል ያረጋግጡ (Confirm Password)" 
                        className="pl-10 bg-black/20 border-white/10 text-white"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                      />
                    </div>
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-11" disabled={loading}>
                      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "ጨርስ (Finish)"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-slate-900/50 border-white/5 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-xl text-white">ይግቡ (Login)</CardTitle>
                  <CardDescription>አካውንትዎን በመጠቀም ይግቡ</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                      <Input 
                        name="email"
                        type="email"
                        placeholder="ኢሜል (Email)" 
                        className="pl-10 bg-black/20 border-white/10 text-white"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                      <Input 
                        name="password"
                        type="password"
                        placeholder="የይለፍ ቃል (Password)" 
                        className="pl-10 bg-black/20 border-white/10 text-white"
                        value={formData.password}
                        onChange={handleChange}
                      />
                    </div>
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-11" disabled={loading}>
                      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "ይግቡ (Login)"}
                    </Button>
                    <div className="text-center mt-4">
                      <button 
                        type="button"
                        onClick={() => setStep('register')}
                        className="text-sm text-blue-400 hover:underline"
                      >
                        አዲስ አካውንት ይፍጠሩ (Register)
                      </button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
