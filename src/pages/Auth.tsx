import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, GraduationCap, BookOpen, ArrowRight, Sparkles, Hand, Star } from "lucide-react";
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

type Tab = "login" | "signup";
type Role = "student" | "teacher";
type AuthStep = "initial" | "ku_student_id";

// ── Logo ──
const Logo = () => (
  <div className="flex items-center gap-2">
    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
      <span className="text-sm font-bold text-primary-foreground">KU</span>
    </div>
    <span className="text-xl font-bold text-foreground">LifeOS</span>
  </div>
);

// ── TabSwitcher ──
const TabSwitcher = ({ tab, onSwitch }: { tab: Tab; onSwitch: (t: Tab) => void }) => (
  <div className="flex rounded-xl bg-muted p-1">
    {(["login", "signup"] as Tab[]).map((t) => (
      <button
        key={t}
        onClick={() => onSwitch(t)}
        className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
          tab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {t === "login" ? "เข้าสู่ระบบ (ทั่วไป)" : "สมัครสมาชิก (ทั่วไป)"}
      </button>
    ))}
  </div>
);

// ── RolePicker ──
const RolePicker = ({ role, setRole }: { role: Role; setRole: (r: Role) => void }) => (
  <div className="flex gap-3">
    {([
      { value: "student", label: "นิสิต/นักศึกษา", icon: BookOpen },
      { value: "teacher", label: "อาจารย์", icon: GraduationCap },
    ] as { value: Role; label: string; icon: any }[]).map(({ value, label, icon: Icon }) => (
      <button
        key={value}
        onClick={() => setRole(value)}
        className={`flex flex-1 items-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all ${
          role === value
            ? "border-primary bg-accent text-primary"
            : "border-border bg-background text-muted-foreground hover:border-primary/40"
        }`}
      >
        <Icon className="h-4 w-4" />
        {label}
      </button>
    ))}
  </div>
);

const Auth = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("login");
  const [role, setRole] = useState<Role>("student");
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
        setError("กรุณาใช้อีเมล @ku.th สำหรับนิสิต ม.เกษตร");
        setLoading(false);
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        // Redirect based on onboarding completion
        if (userData.onboardingStep >= 4) {
          navigate(userData.role === "teacher" ? "/teacher" : "/dashboard");
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
      setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google");
    } finally {
      setLoading(false);
    }
  };

  const handleKUSubmit = async () => {
    if (studentId.length !== 10) {
      setError("รหัสนิสิตต้องมี 10 หลัก");
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
      setError("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setError("");
    if (!email || !password) { setError("กรุณากรอกข้อมูลให้ครบ"); return; }
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userRef = doc(db, "users", result.user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        // Redirect based on onboarding completion
        if (userData.onboardingStep >= 4) {
          navigate(userData.role === "teacher" ? "/teacher" : "/dashboard");
        } else {
          navigate("/onboarding");
        }
      } else {
        setError("ไม่พบข้อมูลผู้ใช้ในระบบ");
      }
    } catch (err: any) {
      console.error(err);
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setError("");
    if (!email || !password || !confirmPassword) { setError("กรุณากรอกข้อมูลให้ครบ"); return; }
    if (password !== confirmPassword) { setError("รหัสผ่านไม่ตรงกัน"); return; }
    if (password.length < 6) { setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"); return; }
    
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      // Generate GS ID for non-KU
      const random10 = Math.floor(1000000000 + Math.random() * 9000000000).toString();
      const customId = `GS${random10}`;

      const newUser = {
        id: customId,
        uid: result.user.uid,
        email,
        role,
        onboardingStep: 0,
        onboardingData: {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await setDoc(doc(db, "users", result.user.uid), newUser);
      navigate(role === "teacher" ? "/teacher" : "/onboarding");
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setError("อีเมลนี้ถูกใช้งานแล้ว");
      } else {
        setError("เกิดข้อผิดพลาดในการสมัครสมาชิก");
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
        transition={{ duration: 0.2 }}
        className="flex flex-col gap-4"
      >
        {authStep === "initial" ? (
          <>
            <div className="space-y-4">
              <Button
                variant="outline"
                type="button"
                className="w-full h-11 rounded-xl font-semibold border-2 hover:bg-muted transition-all"
                disabled={loading}
                onClick={handleGoogleKU}
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 mr-2" />
                เข้าสู่ระบบนิสิต ม.เกษตร (@ku.th)
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    หรืออีเมลอื่นๆ
                  </span>
                </div>
              </div>
            </div>

            {tab === "signup" && (
              <div className="space-y-1.5">
                <Label>บทบาท</Label>
                <RolePicker role={role} setRole={setRole} />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">อีเมล (มหาลัยอื่น หรือทั่วไป)</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">รหัสผ่าน</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (tab === "login" ? handleLogin() : handleSignup())}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {tab === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="confirm">ยืนยันรหัสผ่าน</Label>
                <div className="relative">
                  <Input
                    id="confirm"
                    type={showConfirm ? "text" : "password"}
                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSignup()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <p className="rounded-lg bg-destructive/10 px-4 py-2.5 text-sm font-medium text-destructive">
                {error}
              </p>
            )}

            <Button
              onClick={tab === "login" ? handleLogin : handleSignup}
              disabled={loading}
              className="mt-1 h-11 w-full gap-2 rounded-xl text-base font-semibold"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  กำลังดำเนินการ...
                </span>
              ) : (
                <>
                  {tab === "login" ? "เข้าสู่ระบบด้วยอีเมล" : "สมัครสมาชิกด้วยอีเมล"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="studentId">รหัสนิสิต (10 หลัก)</Label>
              <Input
                id="studentId"
                type="text"
                placeholder="เช่น 6401234567"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                maxLength={10}
                onKeyDown={(e) => e.key === "Enter" && handleKUSubmit()}
              />
            </div>
            
            {error && (
              <p className="rounded-lg bg-destructive/10 px-4 py-2.5 text-sm font-medium text-destructive">
                {error}
              </p>
            )}
            
            <Button
              onClick={handleKUSubmit}
              disabled={loading}
              className="mt-1 h-11 w-full gap-2 rounded-xl text-base font-semibold"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  กำลังดำเนินการ...
                </span>
              ) : (
                <>ยืนยันรหัสนิสิต <ArrowRight className="h-4 w-4" /></>
              )}
            </Button>
            
            <Button
              variant="ghost"
              type="button"
              className="w-full text-muted-foreground h-11 rounded-xl font-semibold hover:bg-muted"
              disabled={loading}
              onClick={() => {
                setAuthStep("initial");
                signOut(auth);
                setError("");
              }}
            >
              ยกเลิก
            </Button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );

  return (
    <>
      <div className="hidden md:flex min-h-screen bg-background">
        <div className="relative flex w-[42%] flex-col justify-between overflow-hidden bg-primary px-12 py-10">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/5" />
          <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-white/5" />
          <div className="absolute right-10 bottom-40 h-32 w-32 rounded-full bg-white/5" />
          <Logo />
          <div className="relative z-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-primary-foreground/80">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Platform
            </div>
            <h1 className="mb-4 text-4xl font-bold leading-tight text-primary-foreground">
              Your Student Life{" "}
              <span className="opacity-70">Operating System</span>
            </h1>
            <p className="text-base leading-relaxed text-primary-foreground/70">
              สร้างโปรไฟล์ดิจิทัล หาทีมที่ใช่ พัฒนาทักษะ และวางแผนเส้นทางอาชีพ — ทั้งหมดในที่เดียว
            </p>
            <div className="mt-10 grid grid-cols-2 gap-4">
              {[
                { n: "500+", label: "นิสิต KU" },
                { n: "120+", label: "โปรเจกต์" },
                { n: <>4.9<Star className="h-3 w-3 ml-1 inline text-yellow-500 fill-current" /></>, label: "คะแนน" },
                { n: "AI", label: "Powered" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-white/10 px-4 py-3">
                  <div className="text-2xl font-bold text-primary-foreground">{s.n}</div>
                  <div className="text-xs text-primary-foreground/60">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <p className="relative z-10 text-xs text-primary-foreground/40">
            &copy; 2026 KU LifeOS — Kasetsart University
          </p>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-12 py-10">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground">
                {tab === "login" ? <>ยินดีต้อนรับกลับมา <Hand className="h-5 w-5 inline ml-1" /></> : <>เริ่มต้นใช้งาน <GraduationCap className="h-5 w-5 inline ml-1" /></>}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {tab === "login"
                  ? "เข้าสู่ระบบเพื่อจัดการโปรไฟล์และโปรเจกต์ของคุณ"
                  : "สร้างบัญชีและเริ่มสร้างตัวตนดิจิทัลของคุณ"}
              </p>
            </div>
            <div className="flex flex-col gap-6">
              {authStep === "initial" && <TabSwitcher tab={tab} onSwitch={switchTab} />}
              {formFields}
            </div>
            {authStep === "initial" && (
              <p className="mt-6 text-center text-xs text-muted-foreground">
                {tab === "login" ? "ยังไม่มีบัญชีทั่วไป? " : "มีบัญชีทั่วไปแล้ว? "}
                <button
                  onClick={() => switchTab(tab === "login" ? "signup" : "login")}
                  className="font-semibold text-primary hover:underline"
                >
                  {tab === "login" ? "สมัครสมาชิกที่นี่" : "เข้าสู่ระบบ"}
                </button>
              </p>
            )}
            <p className="mt-4 text-center text-xs text-muted-foreground">
              <Link to="/" className="hover:text-foreground hover:underline">
                ← กลับหน้าหลัก
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="flex md:hidden min-h-screen flex-col bg-background">
        <div className="sticky top-0 z-10 border-b border-border bg-background/80 px-5 py-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <Logo />
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
              ← กลับ
            </Link>
          </div>
        </div>
        <div className="bg-primary px-5 py-6">
          <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-primary-foreground/80">
            <Sparkles className="h-3 w-3" />
            AI-Powered Student Platform
          </div>
          <p className="mt-2 text-lg font-bold text-primary-foreground">
            {tab === "login" ? <>ยินดีต้อนรับกลับมา <Hand className="h-5 w-5 inline ml-1" /></> : <>เริ่มต้นการเดินทาง <GraduationCap className="h-5 w-5 inline ml-1" /></>}
          </p>
          <p className="text-sm text-primary-foreground/70">
            {tab === "login" ? "เข้าสู่ระบบเพื่อดำเนินการต่อ" : "สร้างบัญชีและเริ่มต้นใช้งาน"}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-6">
          <div className="flex flex-col gap-5">
            {authStep === "initial" && <TabSwitcher tab={tab} onSwitch={switchTab} />}
            {formFields}
          </div>
          {authStep === "initial" && (
            <p className="mt-5 text-center text-sm text-muted-foreground">
              {tab === "login" ? "ยังไม่มีบัญชีทั่วไป? " : "มีบัญชีทั่วไปแล้ว? "}
              <button
                onClick={() => switchTab(tab === "login" ? "signup" : "login")}
                className="font-semibold text-primary hover:underline"
              >
                {tab === "login" ? "สมัครสมาชิกที่นี่" : "เข้าสู่ระบบ"}
              </button>
            </p>
          )}
        </div>
        <div className="h-6" />
      </div>
    </>
  );
};

export default Auth;
