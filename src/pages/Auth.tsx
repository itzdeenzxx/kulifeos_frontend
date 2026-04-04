import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Sparkles, Hand, Rocket, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { auth, googleProvider, db } from "@/lib/firebase";
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";

type Tab = "login" | "signup";
type AuthStep = "initial" | "ku_student_id";

// ── SVG Fun Animation ──
const AnimatedAuthHero = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative w-full max-w-sm mx-auto aspect-square"
    >
      <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
        
        {/* Glowing Background blobs */}
        <motion.circle 
          cx="200" cy="200" r="150" 
          fill="url(#gradient-bg)" fillOpacity="0.8"
          animate={{ scale: [1, 1.05, 1], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <defs>
          <linearGradient id="gradient-bg" x1="50" y1="50" x2="350" y2="350" gradientUnits="userSpaceOnUse">
            <stop stopColor="#006664" />
            <stop offset="1" stopColor="#023b3a" />
          </linearGradient>
        </defs>

        {/* Floating Stars */}
        <motion.path d="M 80 80 L 85 95 L 100 100 L 85 105 L 80 120 L 75 105 L 60 100 L 75 95 Z" fill="#fef08a" 
          animate={{ scale: [0.8, 1.2, 0.8], rotate: [0, 90, 180] }} transition={{ duration: 3, repeat: Infinity }} />
        <motion.path d="M 320 180 L 325 190 L 340 195 L 325 200 L 320 210 L 315 200 L 300 195 L 315 190 Z" fill="#fef08a" 
          animate={{ scale: [1, 0.6, 1], rotate: [0, -90, -180] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }} />
        <motion.path d="M 120 280 L 123 287 L 130 290 L 123 293 L 120 300 L 117 293 L 110 290 L 117 287 Z" fill="#6ee7b7" 
          animate={{ scale: [0.5, 1, 0.5], rotate: [0, 45, 90] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }} />

        {/* Character Base (Body) */}
        <motion.rect 
          x="130" y="160" width="140" height="150" rx="60" fill="#ccfbf1" 
          animate={{ y: [160, 150, 160] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Character Head */}
        <motion.circle 
          cx="200" cy="110" r="55" fill="#fcd3b2" 
          animate={{ y: [110, 100, 110], rotate: [-3, 3, -3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
        />
        
        {/* Hair */}
        <motion.path 
          d="M 145 110 C 140 60, 180 30, 200 45 C 230 30, 270 60, 260 110 C 255 140, 240 135, 240 135 C 230 150, 170 150, 160 135 C 160 135, 150 140, 145 110 Z" fill="#0f172a"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
        />
        
        {/* Winking / Happy Face */}
        <motion.path d="M 175 115 Q 185 105 195 115" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" fill="none"
          animate={{ scaleY: [1, 0.2, 1] }} transition={{ duration: 3, repeat: Infinity, times: [0, 0.1, 1] }} />
        <motion.circle cx="225" cy="112" r="5" fill="#0f172a" />
        <motion.path d="M 195 125 Q 200 140 210 125" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" fill="none" />
        <circle cx="165" cy="120" r="8" fill="#fca5a5" opacity="0.6"/>
        <circle cx="235" cy="120" r="8" fill="#fca5a5" opacity="0.6"/>

        {/* Waving Hand */}
        <motion.g
          animate={{ rotate: [0, 20, -10, 20, 0], transformOrigin: "270px 180px" }}
          transition={{ duration: 2, repeat: Infinity, delay: 1, repeatDelay: 2 }}
        >
          <rect x="250" y="160" width="25" height="60" rx="12.5" fill="#ccfbf1" transform="rotate(-30 250 160)" />
          <circle cx="295" cy="130" r="15" fill="#fcd3b2" />
        </motion.g>

        {/* Laptop Area */}
        <motion.g animate={{ y: [160, 150, 160] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
          <rect x="110" y="240" width="180" height="100" rx="12" fill="#1e293b" />
          <rect x="120" y="250" width="160" height="75" rx="6" fill="#0f172a" />
          {/* Glowing screen effect */}
          <rect x="120" y="250" width="160" height="75" rx="6" fill="#009e9a" opacity="0.2" />
          {/* Hands typing */}
          <circle cx="160" cy="320" r="15" fill="#fcd3b2" />
          <circle cx="240" cy="320" r="15" fill="#fcd3b2" />
          <circle cx="200" cy="285" r="8" fill="#006664" />
        </motion.g>
        
        {/* Floating Bubble: Unlock */}
        <motion.g 
          animate={{ y: [0, -15, 0], scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <rect x="280" y="80" width="60" height="60" rx="20" fill="#ffffff" />
          <circle cx="310" cy="110" r="20" fill="#ecfdf5" />
          {/* Lock/Keyhole */}
          <circle cx="310" cy="105" r="6" fill="#10b981" />
          <path d="M 307 108 L 313 108 L 311 118 L 309 118 Z" fill="#10b981" />
        </motion.g>

      </svg>
    </motion.div>
  );
};

// ── TabSwitcher ──
const TabSwitcher = ({ tab, onSwitch }: { tab: Tab; onSwitch: (t: Tab) => void }) => (
  <div className="flex rounded-2xl bg-slate-100 p-1.5 shadow-inner">
    {(["login", "signup"] as Tab[]).map((t) => (
      <button
        key={t}
        onClick={() => onSwitch(t)}
        className={`flex-1 rounded-xl py-2.5 text-sm font-display font-medium transition-all duration-300 ${
          tab === t 
            ? "bg-white text-slate-900 shadow-md shadow-slate-200/50 scale-100" 
            : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 scale-95"
        }`}
      >
        {t === "login" ? "เข้าสู่ระบบ (ทั่วไป)" : "สมัครสมาชิก (ทั่วไป)"}
      </button>
    ))}
  </div>
);

const Auth = () => {
  const navigate = useNavigate();
  const { userProfile, loading: authLoading } = useAuth();
  
  useEffect(() => {
    if (userProfile && !authLoading) {
      if (userProfile.onboardingStep >= 4) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/onboarding", { replace: true });
      }
    }
  }, [userProfile, authLoading, navigate]);

  const [tab, setTab] = useState<Tab>("login");
  const [authStep, setAuthStep] = useState<AuthStep>("initial");

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [studentId, setStudentId] = useState("");
  const [kuUserUID, setKuUserUID] = useState(""); 
  const [kuUserEmail, setKuUserEmail] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const switchTab = (t: Tab) => {
    if (t === tab) return;
    setTab(t);
    setError("");
    setAnimKey((k) => k + 1);
  };

  const handleGoogleKU = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (!user.email?.endsWith("@ku.th")) {
        await signOut(auth);
        setError("กรุณาใช้อีเมล @ku.th สำหรับนิสิต ม.เกษตร เท่านั้นจ้า 🥺");
        setLoading(false);
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.onboardingStep >= 4) {
          navigate("/dashboard");
        } else {
          navigate("/onboarding");
        }
      } else {
        setKuUserUID(user.uid);
        setKuUserEmail(user.email || "");
        setAuthStep("ku_student_id");
        setAnimKey((k) => k + 1);
      }
    } catch (err: any) {
      console.error(err);
      setError("แง! เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google ลองใหม่อีกครั้งนะ");
    } finally {
      setLoading(false);
    }
  };

  const handleKUSubmit = async () => {
    if (studentId.length !== 10) {
      setError("รหัสนิสิตต้องมี 10 หลักนะเตง");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const customId = `KU${studentId}`;
      const newUser = {
        id: customId,
        uid: kuUserUID,
        email: kuUserEmail,
        role: "student",
        studentId: studentId,
        onboardingStep: 0,
        onboardingData: {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await setDoc(doc(db, "users", kuUserUID), newUser);
      navigate("/onboarding");
    } catch (err: any) {
      console.error(err);
      setError("เกิดข้อผิดพลาดในการบันทึกข้อมูลจ้า");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setError("");
    if (!email || !password) { setError("กรอกข้อมูลให้ครบก่อนน้า"); return; }
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userRef = doc(db, "users", result.user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.onboardingStep >= 4) {
          navigate("/dashboard");
        } else {
          navigate("/onboarding");
        }
      } else {
        setError("หาตัวเธอไม่เจอในระบบอ่ะ สมัครสมาชิกก่อนไหม?");
      }
    } catch (err: any) {
      console.error(err);
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง ลองเช็คอีกทีนะ");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setError("");
    if (!email || !password || !confirmPassword) { setError("กรอกข้อมูลให้ครบทุกช่องก่อนน้า"); return; }
    if (password !== confirmPassword) { setError("อ๊ะ รหัสผ่านสองช่องไม่ตรงกันนะ"); return; }
    if (password.length < 6) { setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษรเพื่อความปลอดภัยจ้า"); return; }
    
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const random10 = Math.floor(1000000000 + Math.random() * 9000000000).toString();
      const customId = `GS${random10}`;

      const newUser = {
        id: customId,
        uid: result.user.uid,
        email,
        role: "student",
        onboardingStep: 0,
        onboardingData: {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await setDoc(doc(db, "users", result.user.uid), newUser);
      navigate("/onboarding");
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setError("ว้า อีเมลนี้มีคนใช้ไปแล้วล่ะ");
      } else {
        setError("เกิดข้อผิดพลาดในการสมัครสมาชิก ลองใหม่อีกครั้งนะ");
      }
    } finally {
      setLoading(false);
    }
  };

  const formFields = (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={animKey}
        initial={{ opacity: 0, x: tab === "signup" ? 20 : -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: tab === "signup" ? -20 : 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex flex-col gap-5"
      >
        {authStep === "initial" ? (
          <>
            <div className="space-y-4">
              <Button
                variant="outline"
                type="button"
                className="w-full h-14 rounded-2xl font-display text-[15px] font-semibold border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                disabled={loading}
                onClick={handleGoogleKU}
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 mr-3" />
                <span>สำหรับนิสิต ม.เกษตร <span className="text-muted-foreground font-sans text-sm ml-1 font-normal">(@ku.th)</span></span>
              </Button>
              
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-4 text-slate-400 font-medium tracking-wider">
                    หรืออีเมลทั่วไป
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-slate-600 font-display">อีเมล</Label>
              <Input
                id="email"
                type="email"
                placeholder="hello@example.com"
                className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all text-[15px]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-slate-600 font-display">รหัสผ่าน</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all text-[15px] pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (tab === "login" ? handleLogin() : handleSignup())}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {tab === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="confirm" className="text-slate-600 font-display">ยืนยันรหัสผ่านอีกครั้ง</Label>
                <div className="relative">
                  <Input
                    id="confirm"
                    type={showConfirm ? "text" : "password"}
                    placeholder="พิมพ์รหัสเดิมเพื่อความชัวร์"
                    className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all text-[15px] pr-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSignup()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-rose-50 px-4 py-3 border border-rose-100 flex items-center gap-2 text-sm font-medium text-rose-600">
                <Sparkles className="h-4 w-4" /> {error}
              </motion.div>
            )}

            <Button
              onClick={tab === "login" ? handleLogin : handleSignup}
              disabled={loading}
              className="mt-2 h-14 w-full gap-2 rounded-xl font-display text-lg font-bold shadow-lg shadow-slate-900/10 hover:-translate-y-0.5 transition-all text-white bg-slate-900 hover:bg-slate-800"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  รอแป๊บนึงน้า...
                </span>
              ) : (
                <>
                  {tab === "login" ? "เข้าสู่ระบบเลย!" : "สร้างโปรไฟล์ใหม่ 🚀"}
                  {!loading && <ArrowRight className="h-5 w-5" />}
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="space-y-5">
            
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-start gap-3">
               <div className="p-2 bg-primary/10 rounded-full shrink-0 mt-1">
                 <KeyRound className="w-5 h-5 text-primary" />
               </div>
               <div>
                  <h3 className="font-display font-bold text-slate-900 text-lg">ล็อกอิน @ku.th สำเร็จ! 🎉</h3>
                  <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                    เพื่อประสบการณ์ที่ดีที่สุด ขอรหัสนิสิต 10 หลักของคุณเพิ่มเติมหน่อยน้า จะได้ผูกบัญชีให้สมบูรณ์จ้า
                  </p>
               </div>
            </div>

            <div className="space-y-2 pt-2">
              <Label htmlFor="studentId" className="text-slate-600 font-display text-base">รหัสนิสิต (10 หลัก)</Label>
              <Input
                id="studentId"
                type="text"
                placeholder="เช่น 6401234567"
                className="h-14 text-center tracking-widest text-lg font-bold rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all placeholder:font-normal placeholder:tracking-normal"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                maxLength={10}
                onKeyDown={(e) => e.key === "Enter" && handleKUSubmit()}
              />
            </div>
            
            {error && (
               <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-rose-50 px-4 py-3 border border-rose-100 flex items-center gap-2 text-sm font-medium text-rose-600">
                 <Sparkles className="h-4 w-4" /> {error}
               </motion.div>
            )}
            
            <div className="pt-4 flex flex-col gap-3">
              <Button
                onClick={handleKUSubmit}
                disabled={loading}
                className="h-14 w-full gap-2 rounded-xl font-display text-lg font-bold shadow-lg shadow-primary/30 hover:-translate-y-0.5 transition-all text-white bg-primary hover:bg-primary/90"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    กำลังประมวลผล...
                  </span>
                ) : (
                  <>ยืนยันรหัสนิสิตลุยเลย! <ArrowRight className="h-5 w-5" /></>
                )}
              </Button>
              
              <Button
                variant="ghost"
                type="button"
                className="w-full text-slate-500 h-12 rounded-xl font-display font-medium hover:bg-slate-100 hover:text-slate-700 transition-colors"
                disabled={loading}
                onClick={() => {
                  setAuthStep("initial");
                  signOut(auth);
                  setError("");
                }}
              >
                ย้อนกลับไปหน้าแรก
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col lg:flex-row w-full overflow-hidden">
      
      {/* ── Left Side: Animated Hero (Desktop) ── */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 p-10 lg:p-16 flex-col justify-between relative shadow-2xl z-10 overflow-hidden" style={{ background: "linear-gradient(180deg, #004d4a 0%, #002a28 100%)" }}>
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#009e9a] opacity-20 rounded-full blur-[80px]" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#009e9a] opacity-10 rounded-full blur-[80px]" />

        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }} />

        <div className="relative z-10 w-full">
          <Link to="/" className="inline-flex flex-col gap-1 hover:opacity-80 transition-opacity">
            <span className="font-display text-4xl font-bold text-white tracking-tight">KU Life<span className="text-[#009e9a]">OS</span></span>
          </Link>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center items-center w-full py-10">
          <div className="w-full max-w-[320px] mx-auto">
            <AnimatedAuthHero />
          </div>
          
          <div className="mt-10 text-center text-white w-full">
             <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.5 }}
             >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-sm font-medium mb-6 text-[#a0d8d6]">
                  <Sparkles className="w-4 h-4" />
                  Your Ultimate Campus Assistant
                </div>
                <h1 className="font-display text-4xl xl:text-5xl font-black mb-4 leading-tight drop-shadow-md text-white">
                  เริ่มสร้างตำนาน<br />ของคุณที่นี่เลย!
                </h1>
                <p className="text-lg text-white/80 font-light max-w-xs mx-auto">
                  เข้าสู่ระบบเพื่อจัดการโปรเจกต์ วางแผนอนาคต และค้นหาเพื่อนร่วมทีมที่คลิกกัน
                </p>
             </motion.div>
          </div>
        </div>

        <div className="relative z-10 text-center w-full">
          <p className="text-white/40 text-sm font-light">
            &copy; 2026 KULifeOS
          </p>
        </div>
      </div>

      {/* ── Right Side: Form (Mobile & Desktop) ── */}
      <div className="flex-1 flex flex-col min-h-screen bg-slate-50 w-full lg:w-1/2">
        
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="lg:hidden sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-slate-100 p-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-display text-xl font-bold text-slate-800 tracking-tight">KU Life<span className="text-[#009e9a]">OS</span></span>
            </Link>
            <Link to="/" className="text-sm font-medium text-slate-500 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-full">
              กลับหน้าหลัก
            </Link>
          </div>
        </div>

        {/* Mobile Fun Banner (Hidden on Desktop) */}
        <div className="lg:hidden p-8 relative overflow-hidden text-center rounded-b-[2rem] shadow-md" style={{ background: "linear-gradient(135deg, #006664 0%, #014a49 100%)" }}>
           <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
           <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-[#009e9a]/20 rounded-full blur-2xl" />
           <div className="relative z-10 flex flex-col items-center justify-center">
             <div className="w-24 h-24 mb-4">
                <AnimatedAuthHero />
             </div>
             <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
               <h2 className="font-display text-3xl font-black text-white mb-2 leading-tight">
                {tab === "login" ? "กลับมาอีกแล้วหรอ! 👋" : "มาเริ่มกันเลยดีกว่า! 🚀"}
               </h2>
               <p className="text-white/80 text-sm max-w-[280px] mx-auto">
                {tab === "login" ? "ล็อกอินเข้าไปลุยต่อกับพรรคพวกได้เลย" : "สร้างบัญชีใหม่ฟรี แล้วดูว่าโลกมหาลัยมันกว้างแค่ไหน"}
               </p>
             </motion.div>
           </div>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex flex-col justify-center items-center px-4 py-8 sm:px-10 lg:px-16 w-full">
          <div className="w-full max-w-[420px] mx-auto">
            
            {/* Desktop Header */}
            <div className="hidden lg:block mb-8 text-center w-full">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mx-auto inline-flex w-16 h-16 bg-white text-[#006664] rounded-2xl items-center justify-center mb-6 shadow-md border border-slate-100">
                {tab === "login" ? <Hand className="w-8 h-8" /> : <Rocket className="w-8 h-8" />}
              </motion.div>
              <h2 className="font-display text-3xl xl:text-4xl font-black text-slate-800 drop-shadow-sm mb-3">
                {tab === "login" ? "ยินดีต้อนรับกลับมา!" : "เริ่มต้นสร้างพื้นที่ของคุณ"}
              </h2>
              <p className="text-base text-slate-500 font-light">
                {tab === "login"
                  ? "ล็อกอินเพื่อจัดการความปังของตัวคุณเอง"
                  : "สร้างบัญชีเพื่อเข้าถึงฟีเจอร์พรีเมียมได้ฟรี"}
              </p>
            </div>

            <div className="bg-white p-6 sm:p-10 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 w-full relative z-10">
              <div className="flex flex-col gap-6">
                {authStep === "initial" && <TabSwitcher tab={tab} onSwitch={switchTab} />}
                {formFields}
              </div>
              
              {authStep === "initial" && (
                <div className="mt-8 text-center border-t border-slate-100 pt-6">
                  <p className="text-[15px] text-slate-500">
                    {tab === "login" ? "ถ้ายังไม่มีบัญชีทั่วไป? " : "ถ้ามีบัญชีทั่วไปอยู่แล้ว? "}
                    <button
                      onClick={() => switchTab(tab === "login" ? "signup" : "login")}
                      className="font-display font-bold text-[#006664] hover:text-[#004d4a] hover:underline underline-offset-4 transition-colors"
                    >
                      {tab === "login" ? "สมัครสมาชิกที่นี่" : "เข้าสู่ระบบได้เลย"}
                    </button>
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};

export default Auth;
