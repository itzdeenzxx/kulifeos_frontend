import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, CheckCircle, Brain, Sparkles, ChevronRight, ChevronLeft, Plus, X, User, Briefcase, Zap, GraduationCap, Star, ArrowRight, Loader2, Hand, ClipboardList, Target, Rocket, PartyPopper, RefreshCw, Lock } from "lucide-react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
} from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { doc, updateDoc } from "firebase/firestore";
import { extractTextFromPDF, getPdfFirstPageAsImage } from "@/lib/pdfExtractor";
import { analyzeResumeWithAI, cleanResumeText, ParsedResume, generateProfileAnalysis, generateShortBio } from "@/lib/aiAnalyze";
import { ensureValidRadarData } from "@/lib/utils";
import { GotjiChat } from "@/components/GotjiChat";

/* ─── Types ─────────────────────────────────────────── */
interface OnboardingData {
  resumeFile: File | null;
  firstName: string; lastName: string; studentId: string;
  faculty: string; major: string; year: string; bio: string;
  selectedSkills: string[]; interests: string[];
  experiences: { title: string; org: string; year: string; desc: string }[];
  projects: { name: string; desc: string; tech: string }[];
}

/* ─── Constants ─────────────────────────────────────── */
const SKILL_OPTIONS = [
  "Python", "React / Frontend", "Leadership", "Marketing", "Finance", 
  "Design / UX", "Research", "Backend Dev", "IoT", "Communication", 
  "Data Analysis", "AI & Machine Learning", "Project Management", 
  "Problem Solving", "Cloud Computing", "Mobile Dev", "Cybersecurity", 
  "SEO/SEM", "Content Creation", "Public Speaking"
];
const INTEREST_OPTIONS = [
  "Startup", "AI Research", "Product Management", "UX Design", 
  "Data Science", "Finance Tech", "Agri-Tech", "EdTech", 
  "Healthcare", "Sustainability", "Robotics", "Blockchain",
  "E-commerce", "Game Development", "Green Energy", "Social Impact", 
  "Space Tech"
];
const FACULTIES = [
  "วิศวกรรมศาสตร์", "เกษตร", "บริหารธุรกิจ", "วิทยาศาสตร์",
  "เทคโนโลยีสารสนเทศ", "เศรษฐศาสตร์", "สังคมศาสตร์", "มนุษยศาสตร์",
  "ศึกษาศาสตร์", "แพทยศาสตร์", "เภสัชศาสตร์", "พยาบาลศาสตร์",
  "สถาปัตยกรรมศาสตร์", "นิติศาสตร์", "นิเทศศาสตร์", "ศิลปกรรมศาสตร์", "อื่นๆ"
];
const YEARS = ["ปี 1", "ปี 2", "ปี 3", "ปี 4", "ปี 5+", "บัณฑิตศึกษา"];

const STEPS = [
  { label: "เรซูเม่", sub: "อัพไฟล์ให้ AI แกะ", icon: Upload },
  { label: "แนะนำตัว", sub: "ชื่อ คณะ แง้มๆมา", icon: User },
  { label: "โชว์ของ", sub: "สกิลปังๆ", icon: Star },
  { label: "สมรภูมิ", sub: "โปรเจกต์ & งาน", icon: Briefcase },
];

const AI_STEPS = [
  { icon: FileText, label: "กำลังส่อง Resume…", sub: "แอบดูชื่อ คณะ และรหัสนิสิตแป๊บ", delay: 0 },
  { icon: Zap, label: "ปั่นรอบสมองหาทักษะ…", sub: "คุ้ยประวัติหา Hard Skills และ Soft Skills แบบตาแตก", delay: 0.9 },
  { icon: Brain, label: "ตีแผ่ Skill Radar…", sub: "คำนวณคะแนนความเทพออกมาเป็นวงกลม", delay: 1.8 },
  { icon: Sparkles, label: "ติดป้าย Career Tags…", sub: "หาป้ายที่คู่ควรกับความเจ๋งของคุณ", delay: 2.7 },
];

const generateRadarData = () => {
  const categories = ["AI & ML", "Data", "Frontend", "Leadership", "Communication", "Research"];
  return categories.map((cat) => ({
    skill: cat,
    value: Math.floor(40 + Math.random() * 55),
    fullMark: 100,
  }));
};

const generateTags = (skills: string[], interests: string[]) =>
  [...new Set([...skills.slice(0, 4), ...interests.slice(0, 3)])].slice(0, 8);

/* ─── AI Loading Screen (defined OUTSIDE main component) ── */
const AILoadingScreen = () => (
  <div className="flex flex-col items-center justify-center py-12 space-y-8">
    <div className="relative">
      <motion.div
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10"
      >
        <Brain className="h-10 w-10 text-primary" />
      </motion.div>
      <motion.div
        animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full bg-primary/20"
      />
    </div>
    <div className="text-center">
      <h3 className="text-xl font-bold text-foreground">AI เรากำลังปั่นสปีดวิเคราะห์คุณอยู่! 🏃💨</h3>
      <p className="mt-1 text-sm text-muted-foreground">แปะกาวแป๊บนึงน้าาา ไม่เกินอึดใจ!</p>
    </div>
    <div className="w-full max-w-sm space-y-3">
      {AI_STEPS.map(({ icon: Icon, label, sub, delay }) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay, duration: 0.35 }}
          className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3.5"
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: delay + 0.15, duration: 0.3 }}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10"
          >
            <Icon className="h-4 w-4 text-primary" />
          </motion.div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground">{sub}</p>
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay + 0.5 }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
              className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent"
            />
          </motion.div>
        </motion.div>
      ))}
    </div>
  </div>
);

/* ─── StepContent (defined OUTSIDE main component) ─────── */
const StepContent = ({
  step, data, update,
  isDragging, setIsDragging,
  fileInputRef, handleFileChange,
  newSkillInput, setNewSkillInput,
  newInterestInput, setNewInterestInput,
  toggleSkill, toggleInterest,
  addExperience, addProject,
  radarData, generatedTags, isAnalyzing,
  isParsingResume, analysisText,
  techRadarData,
}: any) => {

  /* Step 4 — AI Result Loading */
  if (isAnalyzing) return <AILoadingScreen />;

  /* Step 0 — Resume Upload */
  if (step === 0) return (
    <div className="space-y-5">
      <div>
        <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">ว่าไงคนเก่ง! โยนไฟล์มาให้พี่ย่อยได้เลย <Hand className="h-6 w-6 inline ml-2 text-primary" /></h2>
        <p className="mt-1 text-sm text-muted-foreground">
          โยนไฟล์ Resume หรือ Transcript มาโลด! เดี๋ยวดึงข้อมูลให้อัตโนมัติเลย (ถ้าไม่มีก็นะ... กดข้ามไปพิมพ์แมนนวลเอาเนอะ หยอกๆ)
        </p>
      </div>
      <div
        onClick={() => { if (!isParsingResume) fileInputRef.current?.click(); }}
        onDragOver={(e) => { e.preventDefault(); if (!isParsingResume) setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (!isParsingResume) handleFileChange(e.dataTransfer.files[0] ?? null); }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 transition-all duration-200 ${
          isDragging ? "border-primary bg-primary/5 scale-[1.02]"
          : data.resumeFile ? "border-primary/60 bg-primary/5"
          : "border-border/50 bg-muted/30 hover:border-primary/30 hover:bg-muted/50"
        } ${isParsingResume ? "pointer-events-none opacity-80" : ""}`}
      >
        <input ref={fileInputRef} type="file" accept=".pdf,.txt,image/*" className="hidden"
          onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)} />
        {data.resumeFile ? (
          <>
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              {isParsingResume ? (
                <Loader2 className="h-7 w-7 text-primary animate-spin" />
              ) : (
                <CheckCircle className="h-7 w-7 text-primary" />
              )}
            </div>
            <p className="text-sm font-semibold text-primary text-center">{data.resumeFile.name}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {isParsingResume ? "AI กำลังดึงข้อมูล…" : "ดึงข้อมูลสำเร็จ"}
            </p>
          </>
        ) : (
          <>
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent">
              <Upload className="h-7 w-7 text-primary" />
            </div>
            <p className="text-sm font-semibold text-foreground">ลากหรือคลิกเพื่ออัพโหลด</p>
            <p className="text-xs text-muted-foreground mt-1">PDF, TXT, Image — สูงสุด 10MB</p>
          </>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[{ icon: FileText, label: "Resume" }, { icon: GraduationCap, label: "Transcript" }].map(({ icon: Icon, label }) => (
          <button key={label} onClick={() => !isParsingResume && fileInputRef.current?.click()}
            disabled={isParsingResume}
            className="flex items-center justify-center gap-2 rounded-2xl border border-border/50 bg-card p-4 text-sm font-medium text-foreground transition-all hover:border-primary/40 hover:bg-accent/40 active:scale-95 disabled:opacity-50 disabled:pointer-events-none">
            <Icon className="h-5 w-5 text-primary" />{label}
          </button>
        ))}
      </div>
      <div className="rounded-2xl bg-accent/40 border border-border/30 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <p className="text-xs font-semibold text-foreground">AI จะดึงข้อมูลอะไรบ้าง?</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {["ชื่อ-นามสกุล", "คณะ / สาขา", "ทักษะที่มี", "ประสบการณ์", "โปรเจกต์", "Skill Tags"].map((item) => (
            <div key={item} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3 text-primary shrink-0" />{item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* Step 1 — Personal Info */
  if (step === 1) return (
    <div className="space-y-5">
      <div>
        <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">แนะนำตัวหน่อยสิฮะ ใครเอ่ย? <ClipboardList className="h-6 w-6 inline ml-2 text-primary" /></h2>
        <p className="mt-1 text-sm text-muted-foreground">แก้ข้อมูลได้ตามสบาย แต่ชื่อกับคณะอย่ากรอกผิดก็พอ!</p>
      </div>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">ชื่อ *</label>
            <Input placeholder="ชื่อจริง" value={data.firstName}
              onChange={(e) => update({ firstName: e.target.value })}
              className="rounded-xl border border-slate-200 bg-white h-12 px-4 shadow-sm focus:border-[#009e9a] focus:ring-2 focus:ring-[#009e9a]/20 transition-all font-medium" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">นามสกุล *</label>
            <Input placeholder="นามสกุล" value={data.lastName}
              onChange={(e) => update({ lastName: e.target.value })}
              className="rounded-xl border border-slate-200 bg-white h-12 px-4 shadow-sm focus:border-[#009e9a] focus:ring-2 focus:ring-[#009e9a]/20 transition-all font-medium" />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">รหัสนิสิต</label>
          <Input placeholder="64XXXXXXXX" value={data.studentId}
            onChange={(e) => update({ studentId: e.target.value })}
            className="rounded-xl border border-slate-200 bg-white h-12 px-4 shadow-sm focus:border-[#009e9a] focus:ring-2 focus:ring-[#009e9a]/20 transition-all font-medium" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">คณะ *</label>
          <div className="flex flex-wrap gap-2">
            {FACULTIES.map((f) => (
              <button key={f} onClick={() => update({ faculty: f })}
                className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-all ${
                  data.faculty === f ? "bg-slate-900 text-white border-0 font-medium shadow-md shadow-slate-900/10"
                  : "bg-white text-slate-600 border border-slate-200 font-medium hover:border-primary/40 shadow-sm hover:border-primary/40 active:scale-95"
                }`}>{f}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">สาขา</label>
          <Input placeholder="เช่น วิศวกรรมคอมพิวเตอร์" value={data.major}
            onChange={(e) => update({ major: e.target.value })}
            className="rounded-xl border border-slate-200 bg-white h-12 px-4 shadow-sm focus:border-[#009e9a] focus:ring-2 focus:ring-[#009e9a]/20 transition-all font-medium" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">ชั้นปี *</label>
          <div className="flex gap-2 flex-wrap">
            {YEARS.map((y) => (
              <button key={y} onClick={() => update({ year: y })}
                className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-all ${
                  data.year === y ? "bg-slate-900 text-white border-0 font-medium shadow-md shadow-slate-900/10"
                  : "bg-white text-slate-600 border border-slate-200 font-medium hover:border-primary/40 shadow-sm hover:border-primary/40 active:scale-95"
                }`}>{y}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">แนะนำตัวสั้นๆ</label>
          <Textarea placeholder="เช่น สนใจด้าน AI และ Data Science ชอบทำโปรเจกต์ที่มีผลกระทบต่อสังคม"
            value={data.bio} onChange={(e) => update({ bio: e.target.value })}
            className="rounded-xl border-border/50 bg-card min-h-[90px] resize-none" />
        </div>
      </div>
    </div>
  );

  /* Step 2 — Skills */
  if (step === 2) return (
    <div className="space-y-5">
      <div>
        <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">ทำอะไรเป็นบ้าง โชว์ของให้ดูหน่อย! 🌟 <Target className="h-6 w-6 inline ml-2 text-primary" /></h2>
        <p className="mt-1 text-sm text-muted-foreground">ขอซัก 1 สกิลเด็ดๆ เป็นอย่างต่ำ จะได้หาทีมถูกใจนะ!</p>
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground mb-2">ทักษะที่มี</p>
        <div className="flex flex-wrap gap-2">
          {SKILL_OPTIONS.map((label) => (
            <button key={label} onClick={() => toggleSkill(label)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-all active:scale-95 ${
                data.selectedSkills.includes(label)
                  ? "bg-slate-900 text-white border-0 font-medium shadow-md shadow-slate-900/10"
                  : "bg-white text-slate-600 border border-slate-200 font-medium hover:border-primary/40 shadow-sm hover:border-primary/40"
              }`}>{label}</button>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <Input placeholder="เพิ่มทักษะอื่นๆ…" value={newSkillInput}
            onChange={(e) => setNewSkillInput(e.target.value)}
            className="rounded-xl border-border/50 bg-card h-10 text-sm"
            onKeyDown={(e) => { if (e.key === "Enter" && newSkillInput.trim()) { update({ selectedSkills: [...data.selectedSkills, newSkillInput.trim()] }); setNewSkillInput(""); } }} />
          <Button size="sm" className="rounded-xl bg-primary text-primary-foreground h-10 px-3"
            onClick={() => { if (newSkillInput.trim()) { update({ selectedSkills: [...data.selectedSkills, newSkillInput.trim()] }); setNewSkillInput(""); } }}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {data.selectedSkills.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {data.selectedSkills.map((s: string) => (
              <Badge key={s} className="gap-1 rounded-full bg-primary/10 text-primary border-0 text-xs pl-2.5 pr-1.5 py-1">
                {s}<button onClick={() => toggleSkill(s)}><X className="h-3 w-3" /></button>
              </Badge>
            ))}
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground mb-2">ความสนใจ / Domain</p>
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((i) => (
            <button key={i} onClick={() => toggleInterest(i)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-all active:scale-95 ${
                data.interests.includes(i)
                  ? "bg-slate-900 text-white border-0 font-medium shadow-md shadow-slate-900/10"
                  : "bg-white text-slate-600 border border-slate-200 font-medium hover:border-primary/40 shadow-sm hover:border-primary/40"
              }`}>{i}</button>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <Input placeholder="เพิ่มความสนใจอื่นๆ…" value={newInterestInput}
            onChange={(e) => setNewInterestInput(e.target.value)}
            className="rounded-xl border-border/50 bg-card h-10 text-sm"
            onKeyDown={(e) => { if (e.key === "Enter" && newInterestInput.trim()) { update({ interests: [...data.interests, newInterestInput.trim()] }); setNewInterestInput(""); } }} />
          <Button size="sm" className="rounded-xl bg-primary text-primary-foreground h-10 px-3"
            onClick={() => { if (newInterestInput.trim()) { update({ interests: [...data.interests, newInterestInput.trim()] }); setNewInterestInput(""); } }}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  /* Step 3 — Experience */
  if (step === 3) return (
    <div className="space-y-5">
      <div>
        <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">ไหนบอกสิ เคยลุยสนามไหนมาบ้าง? 🚀</h2>
        <p className="mt-1 text-sm text-muted-foreground">ไม่ว่าจะเป็นงานกลุ่ม ยันประกวดระดับชาติ สาดมันเข้ามาฮะ (ข้ามได้ถ้าขี้เกียจพิมพ์ แต่อย่าพิมพ์มั่วนะเดี๋ยวเพื่อนด่า 555)</p>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-foreground">ประสบการณ์</p>
          <button onClick={addExperience} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            <Plus className="h-3.5 w-3.5" /> เพิ่ม
          </button>
        </div>
        <div className="space-y-3">
          {data.experiences.map((exp: any, i: number) => (
            <div key={i} className="rounded-2xl border border-border/50 bg-card p-4 space-y-2.5 relative">
              <button onClick={() => update({ experiences: data.experiences.filter((_: any, idx: number) => idx !== i) })}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="ตำแหน่ง / หัวข้อ" value={exp.title}
                  onChange={(e) => { const u = [...data.experiences]; u[i].title = e.target.value; update({ experiences: u }); }}
                  className="rounded-xl border-border/50 bg-background h-9 text-sm" />
                <Input placeholder="องค์กร / สถาบัน" value={exp.org}
                  onChange={(e) => { const u = [...data.experiences]; u[i].org = e.target.value; update({ experiences: u }); }}
                  className="rounded-xl border-border/50 bg-background h-9 text-sm" />
              </div>
              <Input placeholder="ปี (เช่น 2024)" value={exp.year}
                onChange={(e) => { const u = [...data.experiences]; u[i].year = e.target.value; update({ experiences: u }); }}
                className="rounded-xl border-border/50 bg-background h-9 text-sm" />
              <Textarea placeholder="อธิบายสั้นๆ ว่าทำอะไร" value={exp.desc}
                onChange={(e) => { const u = [...data.experiences]; u[i].desc = e.target.value; update({ experiences: u }); }}
                className="rounded-xl border-border/50 bg-background min-h-[70px] text-sm resize-none" />
            </div>
          ))}
          {data.experiences.length === 0 && (
            <button onClick={addExperience}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border/50 p-5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
              <Plus className="h-4 w-4" /> เพิ่มประสบการณ์
            </button>
          )}
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-foreground">โปรเจกต์</p>
          <button onClick={addProject} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            <Plus className="h-3.5 w-3.5" /> เพิ่ม
          </button>
        </div>
        <div className="space-y-3">
          {data.projects.map((proj: any, i: number) => (
            <div key={i} className="rounded-2xl border border-border/50 bg-card p-4 space-y-2.5 relative">
              <button onClick={() => update({ projects: data.projects.filter((_: any, idx: number) => idx !== i) })}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              <Input placeholder="ชื่อโปรเจกต์" value={proj.name}
                onChange={(e) => { const u = [...data.projects]; u[i].name = e.target.value; update({ projects: u }); }}
                className="rounded-xl border-border/50 bg-background h-9 text-sm" />
              <Textarea placeholder="อธิบายโปรเจกต์" value={proj.desc}
                onChange={(e) => { const u = [...data.projects]; u[i].desc = e.target.value; update({ projects: u }); }}
                className="rounded-xl border-border/50 bg-background min-h-[70px] text-sm resize-none" />
              <Input placeholder="เทคโนโลยีที่ใช้ เช่น Python, React" value={proj.tech}
                onChange={(e) => { const u = [...data.projects]; u[i].tech = e.target.value; update({ projects: u }); }}
                className="rounded-xl border-border/50 bg-background h-9 text-sm" />
            </div>
          ))}
          {data.projects.length === 0 && (
            <button onClick={addProject}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border/50 p-5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
              <Plus className="h-4 w-4" /> เพิ่มโปรเจกต์
            </button>
          )}
        </div>
      </div>
    </div>
  );

  /* Step 4 — AI Result */
  if (isAnalyzing) return <AILoadingScreen />;

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">โปรไฟล์พร้อมแล้ว! <PartyPopper className="h-6 w-6 inline ml-2 text-primary" /></h2>
        <p className="mt-1 text-sm text-muted-foreground">สวัสดี {data.firstName} {data.lastName}</p>
      </div>
      <div className="rounded-2xl border border-border/50 bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold text-foreground">General Skills Radar (Soft Skills)</p>
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={ensureValidRadarData(radarData, [{ skill: "N/A", value: 10 }])}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="skill" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="General" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))"
                fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-2xl border border-border/50 bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold text-foreground">Technical Skills Radar (Hard Skills)</p>
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={ensureValidRadarData(techRadarData, [{ skill: "N/A", value: 10 }])}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="skill" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Tech" dataKey="value" stroke="hsl(var(--chart-2, 210 100% 50%))" fill="hsl(var(--chart-2, 210 100% 50%))"
                fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-2xl border border-border/50 bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold text-foreground">AI-Generated Skill Tags</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {generatedTags.map((tag: string) => (
            <Badge key={tag} className="rounded-full bg-primary/10 text-primary border-0 px-3 py-1.5 text-xs font-medium">{tag}</Badge>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground"><RefreshCw className="h-3 w-3 inline mr-1" /> แก้ไข Tags ได้ในหน้า Profile</p>
      </div>
      <div className="rounded-2xl border border-border/50 bg-card p-4">
        <p className="text-sm font-semibold text-foreground mb-2">บทวิเคราะห์จาก AI 🤖</p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {analysisText || "ข้อมูลโปรไฟล์ของคุณพร้อมแล้ว!"}
        </p>
      </div>
      <div className="rounded-2xl border border-border/50 bg-card p-4">
        <p className="text-sm font-semibold text-foreground mb-2">สรุปโปรไฟล์</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { label: "คณะ", value: data.faculty || "—" },
            { label: "ชั้นปี", value: data.year || "—" },
            { label: "ทักษะ", value: `${data.selectedSkills.length} ทักษะ` },
            { label: "โปรเจกต์", value: `${data.projects.length} โปรเจกต์` },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-0.5">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium text-foreground">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   Main Component
═══════════════════════════════════════════════════════ */
const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userProfile, authUser } = useAuth();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    resumeFile: null, firstName: "", lastName: "", studentId: "",
    faculty: "", major: "", year: "", bio: "",
    selectedSkills: [], interests: [], experiences: [], projects: [],
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [radarData, setRadarData] = useState<any[]>([]);
  const [techRadarData, setTechRadarData] = useState<any[]>([]);
  const [generatedTags, setGeneratedTags] = useState<string[]>([]);
  const [analysisText, setAnalysisText] = useState<string>("");
  const [newSkillInput, setNewSkillInput] = useState("");
  const [newInterestInput, setNewInterestInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved onboarding data when component mounts
  useEffect(() => {
    if (userProfile && userProfile.onboardingData) {
      const saved = userProfile.onboardingData;
      setStep(userProfile.onboardingStep || 0);
      setData((prevData) => ({
        ...prevData,
        firstName: saved.firstName || "",
        lastName: saved.lastName || "",
        studentId: saved.studentId || "",
        faculty: saved.faculty || "",
        major: saved.major || "",
        year: saved.year || "",
        bio: saved.bio || "",
        selectedSkills: saved.selectedSkills || [],
        interests: saved.interests || [],
        experiences: saved.experiences || [],
        projects: saved.projects || [],
      }));
    }
  }, [userProfile]);

  // Save progress to Firestore
  const saveProgress = async (stepNum: number) => {
    if (!authUser || !userProfile) return;
    try {
      await updateDoc(doc(db, "users", authUser.uid), {
        onboardingStep: stepNum,
        onboardingData: {
          firstName: data.firstName,
          lastName: data.lastName,
          studentId: data.studentId,
          faculty: data.faculty,
          major: data.major,
          year: data.year,
          bio: data.bio,
          selectedSkills: data.selectedSkills,
          interests: data.interests,
          experiences: data.experiences,
          projects: data.projects,
        },
        updatedAt: Date.now(),
      });
    } catch (err) {
      console.error("Failed to save progress:", err);
    }
  };

  const update = (patch: Partial<OnboardingData>) => setData((d) => ({ ...d, ...patch }));
  const totalInputSteps = 4;

  const toggleSkill = (s: string) =>
    update({ selectedSkills: data.selectedSkills.includes(s) ? data.selectedSkills.filter((x) => x !== s) : [...data.selectedSkills, s] });
  const toggleInterest = (i: string) =>
    update({ interests: data.interests.includes(i) ? data.interests.filter((x) => x !== i) : [...data.interests, i] });
  const addExperience = () => update({ experiences: [...data.experiences, { title: "", org: "", year: "", desc: "" }] });
  const addProject = () => update({ projects: [...data.projects, { name: "", desc: "", tech: "" }] });

  const splitName = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return { firstName: "", lastName: "" };
    if (parts.length === 1) return { firstName: parts[0], lastName: "" };
    return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
  };

  const mapParsedToOnboarding = (parsed: ParsedResume, previous: OnboardingData): OnboardingData => {
    const nameParts = splitName(parsed.name || "");
    return {
      ...previous,
      firstName: parsed.name ? nameParts.firstName : previous.firstName,
      lastName: parsed.name ? nameParts.lastName : previous.lastName,
      faculty: parsed.faculty || previous.faculty,
      major: parsed.major || previous.major,
      selectedSkills: parsed.skills.length > 0 ? parsed.skills : previous.selectedSkills,
      experiences:
        parsed.experience.length > 0
          ? parsed.experience.map((exp) => ({
              title: exp.title || "",
              org: exp.company || "",
              year: "",
              desc: exp.description || "",
            }))
          : previous.experiences,
      projects: parsed.projects?.length > 0 
        ? parsed.projects.map((p) => ({
            name: p.name || "",
            desc: p.description || "",
            tech: p.tech || ""
          }))
        : previous.projects,
    };
  };

  const handleFileChange = async (file: File | null) => {
    if (!file) return;

    update({ resumeFile: file });
    setIsParsingResume(true);

    try {
      const isPdf = file.type === "application/pdf";
      const isTxt = file.type === "text/plain";
      const isImage = file.type.startsWith("image/");

      let parsed: ParsedResume;
      let sourceType: "pdf-text" | "pdf-image" | "txt" | "image";
      let cleanedText = "";

      if (isPdf) {
        const extracted = await extractTextFromPDF(file);
        cleanedText = cleanResumeText(extracted);

        if (cleanedText.length >= 120) {
          parsed = await analyzeResumeWithAI({ content: cleanedText, mode: "pdfText" });
          sourceType = "pdf-text";
        } else {
          const imageData = await getPdfFirstPageAsImage(file);
          parsed = await analyzeResumeWithAI({ content: imageData, mode: "image" });
          sourceType = "pdf-image";
        }
      } else if (isTxt) {
        const rawText = await file.text();
        cleanedText = cleanResumeText(rawText);
        parsed = await analyzeResumeWithAI({ content: cleanedText, mode: "plainText" });
        sourceType = "txt";
      } else if (isImage) {
        const imageData = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve((e.target?.result as string) || "");
          reader.readAsDataURL(file);
        });
        parsed = await analyzeResumeWithAI({ content: imageData, mode: "image" });
        sourceType = "image";
      } else {
        return;
      }

      if (parsed && typeof parsed.isResumeOrTranscript === "boolean" && !parsed.isResumeOrTranscript) {
        toast({
          title: "ไฟล์ไม่ถูกต้อง",
          description: parsed.suggestionTh || "กรุณาอัปโหลด Resume หรือ Transcript เพื่อให้ AI ช่วยวิเคราะห์ข้อมูลได้อย่างแม่นยำนะครับ",
          variant: "destructive",
        });
        update({ resumeFile: null });
        return;
      }

      const merged = mapParsedToOnboarding(parsed, data);
      
      // Async secondary request for Bio Generation without blocking UI flow too much
      generateShortBio(parsed).then(async (newBio) => {
        if (newBio) {
           setData((prev) => ({ ...prev, bio: newBio }));
           if (authUser) {
             await updateDoc(doc(db, "users", authUser.uid), {
               "onboardingData.bio": newBio
             });
           }
        }
      });

      setData((prev) => mapParsedToOnboarding(parsed, prev));

      if (authUser) {
        await updateDoc(doc(db, "users", authUser.uid), {
          onboardingData: {
            firstName: merged.firstName,
            lastName: merged.lastName,
            studentId: merged.studentId,
            faculty: merged.faculty,
            major: merged.major,
            year: merged.year,
            bio: merged.bio,
            selectedSkills: merged.selectedSkills,
            interests: merged.interests,
            experiences: merged.experiences,
            projects: merged.projects,
          },
          resumeExtraction: {
            fileName: file.name,
            fileType: file.type,
            sourceType,
            parsedJson: parsed,
            cleanedTextPreview: cleanedText.slice(0, 1000),
            updatedAt: Date.now(),
          },
          updatedAt: Date.now(),
        });
      }
      
      // Auto-advance after successful parsing
      setTimeout(() => {
        saveProgress(1);
        setAnimKey((k) => k + 1);
        setStep(1);
      }, 500);

    } catch (error) {
      console.error("Resume parsing failed:", error);
    } finally {
      setIsParsingResume(false);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);

    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        faculty: data.faculty,
        major: data.major,
        year: data.year,
        bio: data.bio,
        skills: data.selectedSkills,
        interests: data.interests,
        experiences: data.experiences,
        projects: data.projects,
      };
      
      const analysisResult = await generateProfileAnalysis(payload);
      
      setRadarData(analysisResult.radarData);
      setTechRadarData(analysisResult.techRadarData);
      setGeneratedTags(analysisResult.tags);
      setAnalysisText(analysisResult.analysis);

      if (authUser) {
        await updateDoc(doc(db, "users", authUser.uid), {
          profileAnalysis: analysisResult,
          updatedAt: Date.now(),
        });
      }
      
      // Additionally save to localStorage since Profile/Settings read from it
      localStorage.setItem("ku_profile", JSON.stringify({
        name: `${data.firstName} ${data.lastName}`.trim(),
        faculty: data.faculty,
        major: data.major,
        year: data.year,
        bio: data.bio,
        skills: data.selectedSkills,
        interests: data.interests,
        experiences: data.experiences,
        projects: data.projects,
        radarData: analysisResult.radarData,
        techRadarData: analysisResult.techRadarData,
        tags: analysisResult.tags
      }));
    } catch (e) {
      console.error(e);
      // Fallback
      setRadarData(generateRadarData());
      setTechRadarData([
        { skill: "Hard Skill 1", value: 40, fullMark: 100 },
        { skill: "Hard Skill 2", value: 40, fullMark: 100 },
      ]);
      setGeneratedTags(generateTags(data.selectedSkills, data.interests));
      setAnalysisText("เกิดข้อผิดพลาดในการวิเคราะห์ แต่อย่าหยุดพัฒนานะครับ 🚀");
    }

    // Save complete onboarding data before showing results
    await saveProgress(4);
    
    setTimeout(() => {
      setStep(4);
      setIsAnalyzing(false);
    }, 500);
  };

  const canProceed = () => {
    if (step === 0) return true;
    if (step === 1) return !!(data.firstName && data.lastName && data.faculty && data.year);
    if (step === 2) return data.selectedSkills.length >= 1;
    return true;
  };

  const sharedProps = {
    step, data, update, isDragging, setIsDragging, fileInputRef, handleFileChange,
    newSkillInput, setNewSkillInput, newInterestInput, setNewInterestInput,
    toggleSkill, toggleInterest, addExperience, addProject, radarData, techRadarData, generatedTags, isAnalyzing,
    isParsingResume, analysisText,
  };

  const [animKey, setAnimKey] = useState(0);

  const goNext = () => {
    saveProgress(step + 1);
    setAnimKey((k) => k + 1);
    setStep((s) => s + 1);
  };
  const goPrev = () => {
    saveProgress(step - 1);
    setAnimKey((k) => k + 1);
    setStep((s) => s - 1);
  };
  const goAnalyze = () => {
    setAnimKey((k) => k + 1);
    handleAnalyze();
  };

  const slideVariants = {
    enter: { x: 40, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -40, opacity: 0 },
  };

  return (
    <>
      {/* ════════════════ DESKTOP (md+) ════════════════ */}
      <div className="hidden md:flex min-h-screen bg-slate-50 font-sans selection:bg-primary/20">
        {/* Left panel */}
        <div className="relative w-80 shrink-0 bg-gradient-to-b from-[#006664] to-[#023b3a] flex flex-col overflow-hidden z-10">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/5" />
          <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/5" />
          <div className="relative z-10 flex items-center gap-3 px-8 pt-10 pb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <span className="text-sm font-bold text-white">KU</span>
            </div>
            <div>
              <p className="text-lg font-bold text-white">LifeOS</p>
              <p className="text-xs text-white/60">Kasetsart University</p>
            </div>
          </div>
          <div className="relative z-10 px-8 mb-10">
            <h1 className="text-2xl font-bold text-white leading-snug">สร้างโปรไฟล์<br />ด้วย AI <Sparkles className="h-6 w-6 inline ml-2 text-primary" /></h1>
            <p className="mt-2 text-sm text-white/70 leading-relaxed">
              ใส่ข้อมูลของคุณแล้วให้ AI สร้าง Skill Radar และ Career Tags ให้อัตโนมัติ
            </p>
          </div>
          <div className="relative z-10 flex-1 px-8 space-y-1">
            {step < 4 ? STEPS.map(({ label, sub, icon: Icon }, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <div key={label} className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-all ${active ? "bg-white/15" : ""}`}>
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all ${
                    done ? "bg-white/90" : active ? "bg-white/25" : "bg-white/10"
                  }`}>
                    {done ? <CheckCircle className="h-4 w-4 text-primary" />
                      : <Icon className={`h-4 w-4 ${active ? "text-white" : "text-white/50"}`} />}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${active ? "text-white" : done ? "text-white/80" : "text-white/40"}`}>{label}</p>
                    <p className={`text-xs ${active ? "text-white/70" : "text-white/30"}`}>{sub}</p>
                  </div>
                  {active && <div className="ml-auto h-2 w-2 rounded-full bg-white" />}
                </div>
              );
            }) : (
              <div className="flex items-center gap-3 rounded-xl px-3 py-3 bg-white/15">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/25">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">AI Result</p>
                  <p className="text-xs text-white/70">โปรไฟล์ของคุณ</p>
                </div>
                <div className="ml-auto h-2 w-2 rounded-full bg-white" />
              </div>
            )}
          </div>
          <div className="relative z-10 px-8 pb-8">
            <div className="rounded-xl bg-white/10 p-3">
              <p className="text-xs text-white/70 leading-relaxed"><Lock className="h-3 w-3 inline mr-1" /> ข้อมูลของคุณปลอดภัย ใช้เพื่อสร้าง Skill Profile เท่านั้น</p>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex flex-1 flex-col bg-slate-50 relative">
          <div className="flex items-center justify-between border-b border-border/40 px-10 py-5">
            {step < 4 ? (
              <div>
                <p className="text-xs font-medium text-muted-foreground">ขั้นตอน {step + 1} จาก {totalInputSteps}</p>
                <Progress value={((step + 1) / totalInputSteps) * 100}
                  className="mt-1.5 h-1.5 w-48 bg-muted [&>div]:bg-primary [&>div]:transition-all [&>div]:duration-500" />
              </div>
            ) : (
              <p className="text-sm font-semibold text-primary">เสร็จสมบูรณ์ ✓</p>
            )}
            <button onClick={() => navigate("/")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              ออกจากระบบ
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-10 py-8">
            <div className="mx-auto max-w-2xl">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={animKey} variants={slideVariants} initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.22, ease: "easeInOut" }}>
                  <StepContent {...sharedProps} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <div className="border-t border-border/40 px-10 py-5">
            <div className="mx-auto max-w-2xl flex items-center justify-between">
              <div>
                {step > 0 && step < 4 && (
                  <Button variant="outline" className="rounded-full bg-white text-slate-700 border border-slate-200 font-medium gap-2 px-6 h-12 shadow-sm hover:bg-slate-50 transition-all font-display"
                    onClick={goPrev}>
                    <ChevronLeft className="h-4 w-4" /> ย้อนกลับ
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-3">
                {step < 4 && (
                  <p className="text-xs text-muted-foreground">
                    {step === 0 && !data.resumeFile ? "หรือข้ามและกรอกเองในขั้นตอนต่อไป" : ""}
                  </p>
                )}
                {step === 4 && !isAnalyzing ? (
                  <Button className="rounded-full bg-slate-900 text-white font-medium gap-2 px-8 h-12 shadow-xl shadow-slate-900/10 hover:bg-slate-800 hover:-translate-y-0.5 transition-all"
                    onClick={() => window.location.href = "/dashboard"}>
                    เข้าสู่ Dashboard <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : step === 3 ? (
                  <Button className="rounded-full bg-slate-900 text-white font-medium gap-2 px-8 h-12 shadow-xl shadow-slate-900/10 hover:bg-slate-800 hover:-translate-y-0.5 transition-all"
                    onClick={goAnalyze}>
                    <Sparkles className="h-4 w-4" /> วิเคราะห์ด้วย AI
                  </Button>
                ) : step < 4 ? (
                  <Button className="rounded-full bg-slate-900 text-white font-medium gap-2 px-8 h-12 shadow-xl shadow-slate-900/10 hover:bg-slate-800 hover:-translate-y-0.5 transition-all"
                    onClick={goNext} disabled={!canProceed() || isParsingResume}>
                    {isParsingResume ? (
                      <>กำลังวิเคราะห์... <Loader2 className="h-4 w-4 animate-spin" /></>
                    ) : (
                      <>
                        {step === 0 && !data.resumeFile ? "ข้าม / กรอกเอง" : "ต่อไป"}
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════ MOBILE (< md) ════════════════ */}
      <div className="flex md:hidden min-h-screen flex-col bg-background">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/40 px-5 py-3">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-[11px] font-bold text-primary-foreground">KU</span>
              </div>
              <span className="font-bold text-foreground text-sm">LifeOS</span>
            </div>
            {step < 4 && (
              <span className="text-xs text-muted-foreground font-medium">{step + 1} / {totalInputSteps}</span>
            )}
          </div>
          {step < 4 && (
            <>
              <Progress value={((step + 1) / totalInputSteps) * 100}
                className="h-1.5 bg-muted [&>div]:bg-primary [&>div]:transition-all [&>div]:duration-500" />
              <div className="mt-2 flex justify-between px-0.5">
                {["Resume", "ข้อมูล", "ทักษะ", "ประสบการณ์"].map((label, i) => (
                  <span key={label} className={`text-[10px] font-medium transition-colors ${
                    i === step ? "text-primary" : i < step ? "text-primary/60" : "text-muted-foreground"
                  }`}>{label}</span>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={animKey} variants={slideVariants} initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="px-5 py-6 pb-36">
              <StepContent {...sharedProps} />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="fixed bottom-0 inset-x-0 z-20 bg-background/95 backdrop-blur-sm border-t border-border/40 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {step === 4 && !isAnalyzing ? (
            <Button className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-semibold text-base gap-2"
              onClick={() => window.location.href = "/dashboard"}>
              เข้าสู่ Dashboard <ChevronRight className="h-5 w-5" />
            </Button>
          ) : step === 3 ? (
            <div className="flex gap-3">
              <Button variant="outline" className="rounded-2xl border-border/50 h-12 px-5"
                onClick={goPrev}><ChevronLeft className="h-5 w-5" /></Button>
              <Button className="flex-1 h-12 rounded-2xl bg-primary text-primary-foreground font-semibold gap-2"
                onClick={goAnalyze}>
                <Sparkles className="h-4 w-4" /> วิเคราะห์ด้วย AI
              </Button>
            </div>
          ) : (
            <div className="flex gap-3">
              {step > 0 && (
                <Button variant="outline" className="rounded-2xl border-border/50 h-12 px-5"
                  onClick={goPrev}><ChevronLeft className="h-5 w-5" /></Button>
              )}
              <Button className={`h-12 rounded-2xl bg-primary text-primary-foreground font-semibold gap-1.5 ${step === 0 ? "w-full" : "flex-1"}`}
                onClick={goNext} disabled={!canProceed() || isParsingResume}>
                {isParsingResume ? (
                  <>กำลังวิเคราะห์... <Loader2 className="h-5 w-5 animate-spin" /></>
                ) : (
                  <>
                    {step === 0 && !data.resumeFile ? "ข้าม / กรอกเอง" : "ต่อไป"}
                    <ChevronRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <GotjiChat onboardingData={data} currentStep={step} />
    </>
  );
};

export default Onboarding;
