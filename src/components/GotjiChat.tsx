import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles } from "lucide-react";
import { GotjiMascot, Mood } from "./GotjiMascot";
import { generateGotjiResponse } from "@/lib/aiAnalyze";

interface GotjiChatProps {
  onboardingData: any;
  currentStep: number;
}

export const GotjiChat = ({ onboardingData, currentStep }: GotjiChatProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mood, setMood] = useState<Mood>("Happy");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initial greeting when component mounts based on user
  useEffect(() => {
    const greet = async () => {
      setIsLoading(true);
      const res = await generateGotjiResponse(
        [{ role: "user", content: "ทักทายฉันครั้งแรกที่หน้าออนบอร์ดดิ้งนี้หน่อย ขอกวนๆ น่ารักๆ ห้ามถามอะไรนอกจากทักทายและบอกให้ฉันกรอกข้อมูล" }],
        { ...onboardingData, currentStep }
      );
      setMood(res.mood);
      setMessages([{ role: "assistant", content: res.response }]);
      setIsLoading(false);
    };
    greet();
  }, []);

  // Sync scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputMsg.trim()) return;

    const userMessage = inputMsg.trim();
    setInputMsg("");
    
    // Add User message
    const newHistory = [...messages, { role: "user" as const, content: userMessage }];
    setMessages(newHistory);
    
    // Optimistic reading mood
    setMood("Neutral");
    setIsLoading(true);

    try {
      const gemmaHistory = newHistory.map(m => ({ role: m.role, content: m.content }));
      const gemmaContext = { ...onboardingData, currentStep };
      
      const responseObj = await generateGotjiResponse(gemmaHistory, gemmaContext);
      
      setMood(responseObj.mood);
      setMessages(prev => [...prev, { role: "assistant", content: responseObj.response }]);
    } catch (e) {
      console.error(e);
      setMood("Sad");
      setMessages(prev => [...prev, { role: "assistant", content: "โอ๊ย... สัญญาณขาดหาย พี่ก้อตจิตอบกลับไม่ด้ายยยยเนี่ยย" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="w-[320px] bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden pointer-events-auto flex flex-col"
            style={{ maxHeight: "calc(100vh - 200px)" }}
          >
            {/* Header */}
            <div className="bg-emerald-50 px-4 py-3 flex items-center justify-between border-b border-emerald-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                <span className="font-display font-bold text-emerald-900">แชทกับน้องก้อตจิ! 🦕</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-emerald-400 hover:text-emerald-700 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[300px] min-h-[200px] bg-slate-50/50">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-white rounded-tr-sm shadow-md shadow-primary/20"
                        : "bg-white text-slate-800 rounded-tl-sm border border-slate-200 shadow-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl rounded-tl-sm border border-slate-200 px-4 py-2.5 flex items-center gap-1 shadow-sm">
                    <motion.div animate={{ y: [0,-3,0] }} transition={{ repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                    <motion.div animate={{ y: [0,-3,0] }} transition={{ repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                    <motion.div animate={{ y: [0,-3,0] }} transition={{ repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Footer */}
            <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
              <input
                type="text"
                placeholder="คุยกับก้อตจิเร็วว..."
                className="flex-1 bg-slate-100 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 transition"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !inputMsg.trim()}
                className="w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative pointer-events-auto">
        {!isOpen && messages.length > 0 && !isLoading && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="absolute -top-12 -left-10 bg-white px-3 py-2 rounded-2xl rounded-br-sm shadow-xl text-sm font-medium text-slate-700 whitespace-nowrap cursor-pointer border border-emerald-100"
            onClick={() => setIsOpen(true)}
          >
            ทักทายฉันสิ! 🎈
          </motion.div>
        )}
        <div className={isOpen ? "-mt-4" : ""}>
          <GotjiMascot mood={mood} onClick={() => setIsOpen(!isOpen)} />
        </div>
      </div>
    </div>
  );
};
