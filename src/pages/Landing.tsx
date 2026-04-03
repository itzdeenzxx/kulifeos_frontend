import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Brain, Users, FolderKanban, Rocket, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

// --- SVG Components ---
const AnimatedStudentHero = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
      className="relative w-full max-w-md mx-auto aspect-square lg:scale-125"
    >
      <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
        {/* Background Blob Orbit */}
        <motion.circle 
          cx="200" cy="200" r="140" 
          fill="#006664" fillOpacity="0.08"
          animate={{ scale: [1, 1.05, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle 
          cx="200" cy="200" r="160" 
          stroke="#006664" strokeOpacity="0.15" strokeWidth="2" strokeDasharray="8 8"
          animate={{ rotate: [360, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />

        {/* Character Base (Body) */}
        <motion.rect 
          x="150" y="180" width="100" height="120" rx="40" fill="#006664" 
          animate={{ y: [180, 170, 180] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Character Head */}
        <motion.circle 
          cx="200" cy="140" r="45" fill="#fcd3b2" 
          animate={{ y: [140, 132, 140], rotate: [-2, 2, -2] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
        />
        
        {/* Character Hair */}
        <motion.path 
          d="M 155 140 C 150 100, 180 80, 200 90 C 220 80, 250 100, 245 140 C 240 165, 230 160, 230 160 C 220 170, 180 170, 170 160 C 170 160, 160 165, 155 140 Z" fill="#1e293b"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
        />
        
        {/* Face details */}
        <motion.circle cx="185" cy="135" r="5" fill="#1e293b" 
          animate={{ y: [135, 127, 135], scaleY: [1, 0.1, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.1, times: [0, 0.95, 1] }}
        />
        <motion.circle cx="215" cy="135" r="5" fill="#1e293b" 
          animate={{ y: [135, 127, 135], scaleY: [1, 0.1, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.1, times: [0, 0.95, 1] }}
        />
        {/* Smile */}
        <motion.path d="M 192 148 Q 200 156 208 148" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" fill="none"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
        />
        {/* Blush */}
        <motion.circle cx="178" cy="144" r="6" fill="#fca5a5" opacity="0.6" animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.1 }} />
        <motion.circle cx="222" cy="144" r="6" fill="#fca5a5" opacity="0.6" animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.1 }} />

        {/* Floating Elements (Books, Ideas, Projects) */}
        
        {/* Idea Bulb */}
        <motion.g 
          animate={{ y: [-10, -35, -10], rotate: [-10, 15, -10] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <circle cx="90" cy="110" r="25" fill="#fef08a" />
          <path d="M 90 95 L 90 125 M 75 110 L 105 110" stroke="#ca8a04" strokeWidth="4" strokeLinecap="round" />
        </motion.g>

        {/* Target / Goal */}
        <motion.g 
          animate={{ y: [-20, 0, -20], rotate: [10, -10, 10] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <circle cx="310" cy="140" r="30" fill="#bbf7d0" />
          <circle cx="310" cy="140" r="15" fill="#22c55e" />
          <circle cx="310" cy="140" r="5" fill="#fff" />
        </motion.g>

        {/* Checkmark / Success Box */}
        <motion.g 
          animate={{ y: [0, -25, 0], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <rect x="70" y="210" width="45" height="45" rx="12" fill="#dbeafe" />
          <path d="M 82 232 L 90 240 L 105 220" stroke="#3b82f6" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </motion.g>

        {/* Resume / Profile Doc */}
        <motion.g 
          animate={{ y: [15, -15, 15], rotate: [0, -5, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        >
          <rect x="290" y="230" width="50" height="65" rx="8" fill="#e0e7ff" />
          <rect x="300" y="245" width="16" height="16" rx="8" fill="#8cf8ca" />
          <rect x="300" y="270" width="30" height="5" rx="2.5" fill="#8cf8ca" opacity="0.6" />
          <rect x="300" y="280" width="20" height="5" rx="2.5" fill="#8cf8ca" opacity="0.6" />
        </motion.g>

        {/* Laptop / Gadget hold by user */}
        <motion.g
          animate={{ y: [180, 170, 180] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <rect x="135" y="220" width="130" height="80" rx="8" fill="#334155" />
          <rect x="145" y="230" width="110" height="60" rx="4" fill="#0f172a" />
          <circle cx="200" cy="260" r="4" fill="#009e9a" />
          {/* Hands over laptop */}
          <circle cx="160" cy="285" r="15" fill="#fcd3b2" />
          <circle cx="240" cy="285" r="15" fill="#fcd3b2" />
        </motion.g>
      </svg>
    </motion.div>
  );
};

const journeySteps = [
  { step: 1, title: "สร้างโปรไฟล์สุดปักษ์", desc: "นำเข้าข้อมูลวิชาเรียนและความเจ๋งของคุณ ระบบ AI จะสร้าง Skill Profile ที่เหนือกว่าเรซูเม่ทั่วไป", icon: Brain, color: "text-blue-600 bg-blue-100" },
  { step: 2, title: "ตามล่าหาทีมที่ใช่", desc: "หมดปัญหาแบกเพื่อน! AI ช่วยจับคู่ทักษะที่ขาดหาย สร้าง Dream Team ที่สมดุลและพร้อมลุย", icon: Users, color: "text-emerald-600 bg-emerald-100" },
  { step: 3, title: "ลุยโปรเจกต์ให้สุด", desc: "Workspace อัจฉริยะที่ช่วยแบ่งงาน ติดตามความคืบหน้า และเตือนเมื่อใกล้ถึงเดดไลน์", icon: FolderKanban, color: "text-purple-600 bg-purple-100" },
  { step: 4, title: "มุ่งสู่อาชีพในฝัน", desc: "เรียนจบไปทำไรดี? AI วิเคราะห์แนวโน้มอาชีพและแนะนำ Roadmap ทักษะที่คุณต้องเติม", icon: Rocket, color: "text-orange-600 bg-orange-100" },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-primary/20 overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 z-50 w-full border-b border-border/40 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#006664] to-[#009e9a] shadow-lg shadow-primary/20">
              <span className="text-sm font-black text-white font-display">KU</span>
            </div>
            <span className="font-display text-2xl font-bold tracking-tight text-slate-800">Life<span className="text-primary">OS</span></span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth" className="hidden sm:block">
              <Button variant="ghost" className="font-display font-medium text-slate-600 hover:text-slate-900 text-base">
                เข้าสู่ระบบ
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="rounded-full bg-slate-900 px-6 font-display font-medium text-white shadow-xl shadow-slate-900/10 hover:bg-slate-800 hover:-translate-y-1 transition-all text-base h-11">
                เริ่มใช้งานฟรี
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-32 pb-20 md:pt-40 md:pb-32 lg:min-h-screen lg:flex lg:items-center">
        {/* Decorative Background */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-[#006664]/15 to-transparent blur-[120px] rounded-full -z-10 pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-tl from-[#14c7c3]/15 to-transparent blur-[120px] rounded-full -z-10 pointer-events-none" />
        
        <div className="mx-auto max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          <div className="text-center lg:text-left z-10 lg:pr-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-5 py-2 text-sm font-semibold text-primary shadow-sm"
            >
              <Sparkles className="h-4 w-4" />
              <span className="font-sans">อัปเดตใหม่! แพลตฟอร์มสำหรับนิสิตเกษตร</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-6 font-display text-5xl sm:text-6xl md:text-7xl font-black leading-[1.15] text-slate-900 drop-shadow-sm"
            >
              ออกแบบ<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#006664] to-[#14c7c3]">ชีวิตมหาลัย</span><br />
              ให้สนุกกว่าที่เคย
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-10 max-w-xl mx-auto lg:mx-0 text-[17px] sm:text-xl text-slate-600 leading-relaxed font-light"
            >
              KULifeOS คือเพื่อนคู่คิดที่จะช่วยคุณ <span className="font-medium text-slate-800">จับคู่ทีมทำโปรเจกต์ วางแผนเรียน และค้นหาเป้าหมายอาชีพ</span> มีตัวช่วย AI คอยซัพพอร์ตตลอดทางการเป็นนิสิต
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-5 justify-center lg:justify-start"
            >
              <Link to="/auth" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto h-14 rounded-full bg-primary px-8 text-[17px] font-display font-semibold text-white shadow-2xl shadow-primary/30 hover:bg-primary/90 hover:-translate-y-1 transition-all">
                  สร้างโปรไฟล์เลย
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <div className="flex items-center gap-2 text-[15px] font-medium text-slate-500 mt-2 sm:mt-0 bg-white/50 px-4 py-2 rounded-full border border-slate-200">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ใช้งานฟรี 100%
              </div>
            </motion.div>
          </div>

          {/* Hero Illustration */}
          <div className="relative z-10 w-full perspective-1000 mt-6 lg:mt-0">
            <AnimatedStudentHero />
          </div>
        </div>
      </section>

      {/* User Journey Section */}
      <section className="px-6 py-24 md:py-32 bg-white relative overflow-hidden">
        {/* Background decorators */}
        <div className="absolute left-0 top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-20 md:mb-28">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-4xl md:text-5xl font-black text-slate-900 mb-6"
            >
              4 สเต็ปง่ายๆ สู่การเป็น <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-primary">ยอดมนุษย์ดาวเกษตร</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-[17px] md:text-xl text-slate-600 max-w-2xl mx-auto font-light"
            >
              แพลตฟอร์มของเราช่วยนำทางชีวิตคุณตั้งแต่ก้าวแรกในรั้วมหาลัย จนถึงวันรับปริญญาและเข้าสู่โลกการทำงาน
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {journeySteps.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative group cursor-default"
              >
                {/* Number floating badge */}
                <div className="absolute -top-5 -left-5 w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-display font-black text-xl z-20 group-hover:scale-110 group-hover:bg-primary shadow-xl transition-all duration-300 rotate-[-5deg] group-hover:rotate-[5deg]">
                  {item.step}
                </div>
                
                {/* Card */}
                <div className="bg-slate-50/50 backdrop-blur-sm rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40 h-full hover:-translate-y-3 hover:shadow-2xl hover:bg-white hover:shadow-primary/10 transition-all duration-300 relative overflow-hidden">
                  
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 \${item.color} group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="h-8 w-8" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-slate-900 mb-4">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-[15px] font-light">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="px-6 py-24 md:py-32 relative bg-slate-50">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-[3rem] bg-gradient-to-br from-[#006664] to-[#014a49] px-8 py-16 md:px-20 md:py-24 text-center relative overflow-hidden shadow-2xl shadow-primary/20"
          >
            {/* Shapes inside CTA */}
            <div className="absolute top-[10%] left-[5%] w-24 h-24 rounded-full border-4 border-white/10" />
            <div className="absolute top-[40%] right-[15%] w-4 h-4 rounded-full bg-white/40" />
            <div className="absolute bottom-[20%] right-[10%] w-32 h-32 rounded-full bg-white/5 blur-xl" />
            <div className="absolute bottom-[10%] left-[15%] w-6 h-6 rounded-md border-2 border-white/20 rotate-45" />
            
            <div className="relative z-10">
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-white mb-8 leading-[1.15]">
                พร้อมอัปเกรดชีวิตมหาลัย<br className="hidden md:block"/>ของคุณให้สนุกยิ่งขึ้นแล้วหรือยัง?
              </h2>
              <p className="text-lg md:text-xl text-primary-foreground/90 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
                มาร่วมเป็นส่วนหนึ่งของคอมมูนิตี้นิสิต KU ที่ใช้เทคโนโลยี AI พัฒนาตัวเอง หารูมเมท และค้นพบเส้นทางอนาคตของคุณได้ฟรี
              </p>
              <Link to="/auth">
                <Button size="lg" className="h-16 rounded-full bg-white px-10 font-display text-xl font-bold text-slate-900 hover:text-white hover:bg-slate-900 hover:-translate-y-1 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-xl">
                  เริ่มใช้งานเลย! 🚀
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center text-slate-500 font-medium border-t border-slate-200/60 bg-white">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
            <span className="text-[10px] font-black font-display">KU</span>
          </div>
          <div className="font-display">&copy; 2026 KULifeOS. Made with 💚 by KU Student.</div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;