import { AppLayout } from "@/components/AppLayout";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/MotionWrappers";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, Target, Zap, Loader2, BrainCircuit, Sparkles, History, MapPin, Eye, Clock, Flame } from "lucide-react";
import { useCurrentUserProfile } from "@/lib/db";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { generateCareerInsightsCoT, CareerCoTResult } from "@/lib/careerCoT";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";

const JsonInsightRenderer = ({ content, colorClass }: { content: string, colorClass?: string }) => {
  if (!content || content.trim() === "") return <div>*ไม่มีข้อมูล*</div>;

  let parsedData: any = null;
  try {
    let cleaned = content.replace(/^```json\n?/i, '').replace(/```$/i, '').trim();
    cleaned = cleaned.replace(/^json\s*/i, '').trim();
    parsedData = JSON.parse(cleaned);
  } catch (err) {
    // Attempt fallback if not JSON or format is messed up
    return (
      <div className={`prose prose-sm md:prose-base dark:prose-invert max-w-none ${colorClass || ""}`}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content.replace(/```markdown\n?|```/g, "")}</ReactMarkdown>
      </div>
    );
  }

  // Render nicely
  return (
    <div className={`space-y-6 ${colorClass || ""}`}>
      {(parsedData.reportTitle || parsedData.summary) && (
        <div className="mb-6">
          {parsedData.reportTitle && <h3 className="text-xl md:text-2xl font-bold mb-3">{parsedData.reportTitle}</h3>}
          {parsedData.summary && <p className="text-foreground/80 leading-relaxed text-sm md:text-base">{parsedData.summary}</p>}
        </div>
      )}

      {parsedData.topStrengths && Array.isArray(parsedData.topStrengths) && (
        <Card className="bg-card shadow-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              จุดเด่น (Top Strengths)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {parsedData.topStrengths.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm md:text-base text-foreground/80 leading-relaxed">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {parsedData.recommendedTechRoles && Array.isArray(parsedData.recommendedTechRoles) && (
        <div className="space-y-4">
          <h4 className="text-lg font-bold flex items-center gap-2">
             <Target className="w-5 h-5 text-blue-500" />
             บทบาทที่แนะนำ (Recommended Roles)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parsedData.recommendedTechRoles.map((role: any, i: number) => (
              <Card key={i} className="bg-card border-border/50 shadow-sm flex flex-col">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base text-primary/90">{role.role}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 flex-1 flex flex-col">
                  <p className="text-sm text-foreground/70 mb-4 flex-1">{role.description}</p>
                  {role.requiredSkills && Array.isArray(role.requiredSkills) && (
                    <div className="flex flex-wrap gap-1.5 mt-auto">
                      {role.requiredSkills.map((skill: string, j: number) => (
                        <Badge variant="secondary" className="text-xs bg-secondary/50 font-medium px-2 py-0.5" key={j}>
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {parsedData.areasForGrowth && Array.isArray(parsedData.areasForGrowth) && (
        <Card className="bg-card shadow-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              ส่วนที่ควรพัฒนา (Areas for Growth)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {parsedData.areasForGrowth.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm md:text-base text-foreground/80 leading-relaxed">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {parsedData.overallAssessment && !parsedData.overall_assessment && (
        <div className="bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 rounded-xl p-5 md:p-6 shadow-sm">
          <h4 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5" /> 
            สรุปภาพรวม (Overall Assessment)
          </h4>
          <p className="text-sm md:text-base text-foreground/80 leading-relaxed whitespace-pre-wrap">
            {parsedData.overallAssessment}
          </p>
        </div>
      )}

      {/* For Psy & HR Agent JSON format */}
      {parsedData.overall_assessment && (
        <div className="bg-gradient-to-br from-blue-500/5 to-transparent border border-blue-500/20 rounded-xl p-5 md:p-6 shadow-sm mb-6">
          <h4 className="text-lg font-bold text-blue-500 mb-3 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5" /> 
            การประเมินภาพรวม (Overall Assessment)
          </h4>
          <p className="text-sm md:text-base text-foreground/80 leading-relaxed whitespace-pre-wrap">
            {parsedData.overall_assessment}
          </p>
        </div>
      )}

      {parsedData.soft_skills_summary && (
        <div className="space-y-4">
          <h4 className="text-lg font-bold flex items-center gap-2">
             <Target className="w-5 h-5 text-indigo-500" />
             สรุปทักษะด้าน Soft Skills (Soft Skills Summary)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(parsedData.soft_skills_summary).map(([key, value]) => (
              <Card key={key} className="bg-card border-border/50 shadow-sm flex flex-col">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base text-indigo-500 capitalize">
                    {key.replace(/_/g, ' ')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 flex-1 flex flex-col">
                  <p className="text-sm text-foreground/80 leading-relaxed">{String(value)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {parsedData.recommended_team_culture && (
        <Card className="bg-card shadow-sm border-border/50 mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              วัฒนธรรมทีมที่แนะนำ (Recommended Team Culture)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm md:text-base text-foreground/80 leading-relaxed">
              {parsedData.recommended_team_culture}
            </p>
          </CardContent>
        </Card>
      )}

      {parsedData.recommended_leadership_role && (
        <Card className="bg-card shadow-sm border-border/50 mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-rose-500" />
              บทบาทความเป็นผู้นำที่แนะนำ (Recommended Leadership Role)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm md:text-base text-foreground/80 leading-relaxed">
              {parsedData.recommended_leadership_role}
            </p>
          </CardContent>
        </Card>
      )}

      {/* For Market Agent JSON format */}
      {parsedData.market_summary && (
        <div className="bg-gradient-to-br from-orange-500/5 to-transparent border border-orange-500/20 rounded-xl p-5 md:p-6 shadow-sm mb-6">
          <h4 className="text-lg font-bold text-orange-500 mb-3 flex items-center gap-2">
            <Eye className="w-5 h-5" /> 
            สรุปแนวโน้มตลาด (Market Summary)
          </h4>
          <p className="text-sm md:text-base text-foreground/80 leading-relaxed whitespace-pre-wrap">
            {parsedData.market_summary}
          </p>
        </div>
      )}

      {parsedData.market_trends && Array.isArray(parsedData.market_trends) && (
        <Card className="bg-card shadow-sm border-border/50 mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-500" />
              เทรนด์ตลาดที่เกี่ยวข้อง (Market Trends)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {parsedData.market_trends.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm md:text-base text-foreground/80 leading-relaxed">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {parsedData.target_industries && Array.isArray(parsedData.target_industries) && (
        <div className="space-y-4 mt-6">
          <h4 className="text-lg font-bold flex items-center gap-2">
             <Target className="w-5 h-5 text-red-500" />
             อุตสาหกรรมเป้าหมาย (Target Industries)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parsedData.target_industries.map((ind: any, i: number) => (
              <Card key={i} className="bg-card border-border/50 shadow-sm flex flex-col">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base text-primary/90">{ind.industry}</CardTitle>
                    <Badge variant={ind.potential?.toLowerCase() === 'high' || ind.potential === 'สูง' ? 'default' : 'secondary'} className="ml-2">
                      {ind.potential}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-1">
                  <p className="text-sm text-foreground/70">{ind.reason}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {parsedData.salary_growth_potential && (
        <Card className="bg-card shadow-sm border-border/50 mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Flame className="w-5 h-5 text-emerald-500" />
              โอกาสเติบโตเงินเดือน (Salary & Growth Potential)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm md:text-base text-foreground/80 leading-relaxed">
              {parsedData.salary_growth_potential}
            </p>
          </CardContent>
        </Card>
      )}

      {parsedData.recommended_certifications && Array.isArray(parsedData.recommended_certifications) && (
        <div className="mt-6 mb-2">
          <h4 className="text-lg font-bold flex items-center gap-2 mb-3">
             <Sparkles className="w-5 h-5 text-teal-500" />
             ใบรับรองที่แนะนำ (Recommended Certifications)
          </h4>
          <div className="flex flex-wrap gap-2">
            {parsedData.recommended_certifications.map((cert: string, j: number) => (
              <Badge key={j} variant="outline" className="text-sm bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20 py-1.5 px-3">
                {cert}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Fallback rendering if it parsed but lacks standard fields */}
      {!parsedData.reportTitle && !parsedData.topStrengths && !parsedData.areasForGrowth && !parsedData.overall_assessment && !parsedData.market_summary && (
        <div className={`prose prose-sm md:prose-base dark:prose-invert max-w-none ${colorClass || ""}`}>
           <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
             {JSON.stringify(parsedData, null, 2)}
           </pre>
        </div>
      )}
    </div>
  );
};

const CareerInsights = () => {
  const { profile } = useCurrentUserProfile();
  const { authUser } = useAuth();
  const { toast } = useToast();
  
  const [history, setHistory] = useState<CareerCoTResult[]>([]);
  const [insightData, setInsightData] = useState<CareerCoTResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");

  useEffect(() => {
    if (profile?.careerInsightsHistory && Array.isArray(profile.careerInsightsHistory) && profile.careerInsightsHistory.length > 0) {
      setHistory(profile.careerInsightsHistory);
      setInsightData(profile.careerInsightsHistory[0]);
    } else if (profile?.id) {
      const cachedHistoryStr = localStorage.getItem(`ku_career_insight_history_${profile.id}`);
      if (cachedHistoryStr) {
        try {
          const parsedHistory = JSON.parse(cachedHistoryStr);
          if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
            setHistory(parsedHistory);
            setInsightData(parsedHistory[0]); // Most recent
          }
        } catch (e) {}
      }
    }
  }, [profile?.careerInsightsHistory, profile?.id]);

  const handleGenerate = async () => {
    if (!profile) return;
    setIsLoading(true);
    setLoadingStep("กำลังเริ่มกระบวนการ Chain of Thought ด้วย Gemma 3...");
    try {
      setTimeout(() => setLoadingStep("🤖 LLM 1 (Arch-Tech): เจาะลึกศักยภาพทางเทคนิคขั้นสูงสุดของคุณ..."), 1500);
      setTimeout(() => setLoadingStep("🧠 LLM 2 (Psycho-HR): ค้นหาจุดแข็งซ่อนเร้น และรูปแบบการทำงานที่เป็นตัวคุณ..."), 4000);
      setTimeout(() => setLoadingStep("📈 LLM 3 (Market Vision): วิเคราะห์เทรนด์ตลาดอนาคต ที่สอดคล้องกับคุณมากที่สุด..."), 6500);
      setTimeout(() => setLoadingStep("👑 LLM 4 (Lead Strategist): สังเคราะห์ข้อมูลเพื่อสร้าง Career Map แบบเจาะลึก..."), 9500);

      const result = await generateCareerInsightsCoT(profile);
      
      result.id = Date.now().toString();
      result.timestamp = new Date().toISOString();
      const newHistory = [result, ...history];
      setHistory(newHistory);
      setInsightData(result);
      
      if (authUser) {
        const userRef = doc(db, "users", authUser.uid);
        await updateDoc(userRef, {
          careerInsightsHistory: newHistory,
          latestCareerInsight: result,
          updatedAt: Date.now()
        });
      }
      
      if (profile?.id) {
        localStorage.setItem(`ku_career_insight_history_${profile.id}`, JSON.stringify(newHistory));
        localStorage.setItem(`ku_career_insight_${profile.id}`, JSON.stringify(result));
      }
      
      toast({
        title: "AI Analysis Complete 🎉",
        description: "ระบบได้สร้างคำแนะนำสายอาชีพแบบเจาะลึก และบันทึกประวัติให้คุณเรียบร้อยแล้ว",
        className: "bg-primary text-primary-foreground border-none",
      });
    } catch (e: any) {
      toast({
        title: "เกิดข้อผิดพลาดในการวิเคราะห์",
        description: e.message || "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  const handleViewHistory = (id: string) => {
    const found = history.find((h, idx) => (h.id || idx.toString()) === id.toString());
    if (found) {
      setInsightData(found);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const hasData = !!insightData;

  // Fallback support for older schema in history
  const isOldSchema = hasData && !insightData.summary.primaryMatch;
  const renderSummary = isOldSchema ? {
    coreIdentity: insightData.summary.description,
    strengths: insightData.summary.requiredSkills || [],
    hiddenTalents: "ไม่พบข้อมูลในสคีมาเก่า",
    primaryMatch: {
      title: insightData.summary.title,
      description: insightData.summary.description,
      matchScore: insightData.summary.matchScore,
      requiredSkills: insightData.summary.requiredSkills || [],
      skillGapData: insightData.summary.skillGapData || [],
      growthTimeline: insightData.summary.growthTimeline || []
    },
    alternativeMatches: []
  } : insightData?.summary;

  return (
    <AppLayout title="Career Insights">
      <PageTransition>
        <div className="flex flex-col xl:flex-row gap-6">
          {/* MAIN CONTENT AREA */}
          <div className="flex-1 space-y-6 min-w-0">
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <BrainCircuit className="h-6 w-6 text-primary" />
                  Deep Career Insights (CoT)
                </h2>
                <p className="text-muted-foreground mt-1">ใช้ Gemma 3 เพื่อสกัด "ตัวตนที่แท้จริง" พร้อมแนะนำอีกหลายหนทางอาชีพ</p>
              </div>
              
              <Button onClick={handleGenerate} disabled={isLoading} className="gap-2 shrink-0">
                {isLoading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> กำลังวิเคราะห์เชิงลึก...</>
                ) : (
                  <><Sparkles className="h-4 w-4" /> เจาะลึกวิเคราะห์ใหม่</>
                )}
              </Button>
            </div>

            <AnimatePresence>
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <Card className="border-primary/30 bg-primary/5 shadow-inner">
                    <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-5">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full blur-xl bg-primary/20 animate-pulse"></div>
                        <BrainCircuit className="h-12 w-12 text-primary relative z-10 animate-bounce" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-foreground">AI กำลังทำงานด้วย Chain of Thought...</p>
                        <p className="text-sm font-medium text-primary mt-1">{loadingStep}</p>
                      </div>
                      
                      <div className="w-full max-w-md mt-2 relative h-2 bg-primary/20 rounded-full overflow-hidden">
                        <motion.div 
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary/80 to-primary"
                          initial={{ width: "2%" }}
                          animate={{ width: "95%" }}
                          transition={{ duration: 15, ease: "linear" }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {!hasData && !isLoading && (
              <Card className="border-dashed border-2 py-12 bg-muted/20">
                <CardContent className="flex flex-col items-center justify-center text-center">
                  <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Target className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">ยังไม่เคยทำการวิเคราะห์เชิงลึก</h3>
                  <p className="text-muted-foreground max-w-md mt-2 mb-6 leading-relaxed">
                    ค้นหาว่าคุณเหมาะกับงานอะไรมากที่สุด, จุดแข็งที่ซ่อนเร้นคืออะไร, และตลาดงานกำลังมองหาอะไรจากทักษะของคุณ
                  </p>
                  <Button onClick={handleGenerate} size="lg" className="gap-2">
                    <Sparkles className="h-4 w-4" /> ค้นหาตัวตนด้วย AI
                  </Button>
                </CardContent>
              </Card>
            )}

            {hasData && !isLoading && renderSummary && (
              <StaggerContainer className="space-y-6">
                
                {/* Core Identity Banner */}
                <StaggerItem>
                  <Card className="border-primary bg-primary/5 rounded-2xl overflow-hidden relative shadow-sm">
                    <div className="absolute -right-12 -top-12 opacity-10">
                      <BrainCircuit className="w-48 h-48 text-primary" />
                    </div>
                    <CardHeader className="pb-2 relative z-10">
                      <CardTitle className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                        <Eye className="h-4 w-4" /> Your Core Identity
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <p className="text-lg font-bold text-foreground leading-relaxed">
                        "{renderSummary.coreIdentity}"
                      </p>
                      <div className="mt-4 p-4 bg-white/60 dark:bg-black/20 rounded-xl border border-border/50">
                        <p className="text-sm text-foreground font-medium">
                          <span className="font-bold text-primary mr-2 text-base">✨ Hidden Talent:</span>
                          {renderSummary.hiddenTalents}
                        </p>
                      </div>
                      
                      <div className="mt-5 flex gap-2 flex-wrap">
                        <span className="text-xs font-bold text-muted-foreground flex items-center mr-2 uppercase tracking-wider">Top Strengths:</span>
                        {renderSummary.strengths.map(s => (
                          <Badge key={s} variant="outline" className="bg-background border-primary/20 font-semibold px-3 py-1 shadow-sm">💪 {s}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>

                {/* Primary Match Hero */}
                <StaggerItem>
                  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-secondary p-6 text-primary-foreground md:p-8 shadow-lg">
                    <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/8" />
                    <div className="absolute bottom-0 right-10 h-24 w-24 rounded-full bg-white/5" />
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Target className="h-6 w-6 opacity-90" />
                          <span className="text-sm font-bold opacity-90 uppercase tracking-widest">ทางเลือกอันดับ 1 (Primary Path)</span>
                        </div>
                        <div className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-md flex items-center gap-1.5 border border-white/20 shadow-sm">
                          <Flame className="h-4 w-4 text-yellow-300" />
                          <span className="font-extrabold text-sm">{renderSummary.primaryMatch.matchScore}% Match</span>
                        </div>
                      </div>
                      
                      <h2 className="mt-2 text-3xl font-extrabold">{renderSummary.primaryMatch.title}</h2>
                      <p className="mt-3 text-[15px] opacity-90 leading-relaxed max-w-3xl text-balance bg-black/10 p-3 rounded-xl backdrop-blur-sm border border-white/10">
                        {renderSummary.primaryMatch.description}
                      </p>
                      
                      <div className="mt-6 flex flex-wrap gap-2 items-center">
                        <span className="text-xs font-bold opacity-70 mr-1 uppercase">Top Focus Skills:</span>
                        {renderSummary.primaryMatch.requiredSkills.map((s) => (
                          <Badge key={s} className="rounded-full bg-white/20 text-white border-0 px-4 py-1 text-xs font-semibold backdrop-blur-sm shadow-sm">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </StaggerItem>

                {/* Alternative Paths */}
                {renderSummary.alternativeMatches && renderSummary.alternativeMatches.length > 0 && (
                  <StaggerItem>
                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" /> ทางเลือกอื่นๆ ที่เหมาะสมกับคุณ (Alternative Paths)
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {renderSummary.alternativeMatches.map((alt, i) => (
                        <Card key={i} className="hover:border-primary/50 transition-colors bg-card hover:bg-card/80 shadow-sm">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-lg leading-tight">{alt.title}</CardTitle>
                              <Badge variant="secondary" className="font-bold text-primary shrink-0 bg-primary/10">{alt.matchScore}%</Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm font-medium text-foreground mb-3 leading-relaxed">{alt.description}</p>
                            <div className="text-xs text-muted-foreground bg-accent/40 p-3 rounded-lg border border-border/50 text-foreground/80">
                              <strong>🤔 ทำไมถึงเหมาะ:</strong> {alt.reason}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </StaggerItem>
                )}

                {/* Analytics grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {renderSummary.primaryMatch.skillGapData && renderSummary.primaryMatch.skillGapData.length > 0 && (
                    <StaggerItem>
                      <Card className="h-full rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-0">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Zap className="h-5 w-5 text-primary" /> สิ่งที่ต้องเติมเต็ม (Skill Gap)
                          </CardTitle>
                          <CardDescription>การเปรียบเทียบทักษะของคุณกับงานอันดับ 1</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="h-64 sm:h-72">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={renderSummary.primaryMatch.skillGapData} layout="vertical" margin={{ left: -10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(140 10% 92%)" horizontal={false} />
                                <XAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
                                <YAxis type="category" dataKey="skill" tick={{ fill: "hsl(150 5% 45%)", fontSize: 11 }} width={120} />
                                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: "12px", border: "1px solid hsl(140 10% 90%)", fontSize: 12, padding: "8px 12px" }} />
                                <Bar dataKey="current" name="ปัจจุบัน" radius={[0, 4, 4, 0]} barSize={12}>
                                  {renderSummary.primaryMatch.skillGapData.map((entry, i) => (
                                    <Cell key={i} fill={entry.current >= entry.required ? "hsl(153 100% 25%)" : "hsl(122 50% 60%)"} />
                                  ))}
                                </Bar>
                                <Bar dataKey="required" name="เป้าหมาย" fill="hsl(140 10% 90%)" radius={[0, 4, 4, 0]} barSize={12} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </StaggerItem>
                  )}

                  {renderSummary.primaryMatch.growthTimeline && renderSummary.primaryMatch.growthTimeline.length > 0 && (
                    <StaggerItem>
                      <Card className="h-full rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-0">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <TrendingUp className="h-5 w-5 text-primary" /> เส้นทางการเติบโต (Timeline)
                          </CardTitle>
                          <CardDescription>ก้าวต่อไปสู่เป้าหมาย</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                          <div className="relative ml-4 sm:ml-6 border-l-2 border-primary/20 pl-6 pb-2">
                            {renderSummary.primaryMatch.growthTimeline.map((item, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * i }}
                                className="relative mb-8 last:mb-0"
                              >
                                <div className="absolute -left-[37px] top-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold ring-4 ring-card shadow-sm">
                                  {item.year.slice(-2)}
                                </div>
                                <h4 className="text-[15px] font-bold text-foreground leading-tight">{item.milestone}</h4>
                                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                              </motion.div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </StaggerItem>
                  )}
                </div>

                {/* CoT Agents Proof / Behind the scenes */}
                <StaggerItem>
                  <Card className="border-border/50 bg-card overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 rounded-2xl">
                    <CardHeader className="bg-gradient-to-r from-primary/10 via-background to-background border-b border-border/50 py-4">
                      <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                        <BrainCircuit className="h-6 w-6 text-primary" /> Behind the Scenes: ข้อมูลเจาะลึกจาก AI Agents
                      </CardTitle>
                      <CardDescription>
                        การวิเคราะห์แบบ Chain of Thought ที่แต่ละ Agent ให้มุมมองที่ต่างกัน ก่อนสังเคราะห์เป็นผลลัพธ์สุดท้าย
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <Tabs defaultValue="agent1" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50 p-1.5 rounded-xl h-auto">
                          <TabsTrigger value="agent1" className="py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm font-semibold flex gap-2">
                            🤖 Agent 1: Tech
                          </TabsTrigger>
                          <TabsTrigger value="agent2" className="py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:text-blue-500 data-[state=active]:shadow-sm font-semibold flex gap-2">
                            🧠 Agent 2: Psy & HR
                          </TabsTrigger>
                          <TabsTrigger value="agent3" className="py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:text-orange-500 data-[state=active]:shadow-sm font-semibold flex gap-2">
                            📈 Agent 3: Market
                          </TabsTrigger>
                        </TabsList>
                        
                        <div className="bg-card/50 border border-border/40 rounded-xl max-h-[700px] overflow-y-auto custom-scrollbar">
                          <TabsContent value="agent1" className="m-0 p-5 md:p-6">
                            <JsonInsightRenderer 
                              content={insightData.step1_tech || ""} 
                              colorClass="prose-headings:text-primary prose-a:text-primary" 
                            />
                          </TabsContent>
                          <TabsContent value="agent2" className="m-0 p-5 md:p-6">
                            <JsonInsightRenderer 
                              content={insightData.step2_soft || ""} 
                              colorClass="prose-headings:text-blue-500 prose-a:text-blue-500" 
                            />
                          </TabsContent>
                          <TabsContent value="agent3" className="m-0 p-5 md:p-6">
                            <JsonInsightRenderer 
                              content={insightData.step3_market || ""} 
                              colorClass="prose-headings:text-orange-500 prose-a:text-orange-500" 
                            />
                          </TabsContent>
                        </div>
                      </Tabs>
                    </CardContent>
                  </Card>
                </StaggerItem>

              </StaggerContainer>
            )}
          </div>

          {/* HISTORY SIDEBAR */}
          <div className="xl:w-[320px] shrink-0">
            <div className="sticky top-[100px] flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" /> ประวัติการวิเคราะห์
                </h3>
                {history.length > 0 && <Badge variant="secondary" className="rounded-full bg-primary/10 text-primary">{history.length}</Badge>}
              </div>

              {history.length === 0 ? (
                <Card className="border-dashed border bg-transparent">
                  <CardContent className="p-6 text-center text-sm text-muted-foreground">
                    ยังไม่มีประวัติการวิเคราะห์
                  </CardContent>
                </Card>
              ) : (
                <Card className="rounded-2xl overflow-hidden border-border/50 shadow-sm h-[600px] flex flex-col bg-card/80 backdrop-blur-sm">
                  <ScrollArea className="flex-1 p-2">
                    <div className="space-y-2 p-1">
                      <AnimatePresence>
                        {history.map((h, idx) => {
                          const itemKey = h.id || idx.toString();
                          const isSelected = insightData === h || (insightData?.id && insightData.id === itemKey);
                          const hSummary = (h.summary as any).primaryMatch ? (h.summary as any).primaryMatch : h.summary;
                          
                          return (
                            <motion.button
                              key={itemKey}
                              inherit={false}
                              layout="position"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              onClick={() => handleViewHistory(itemKey)}
                              className={`w-full text-left p-3 rounded-xl border transition-all ${
                                isSelected 
                                  ? 'bg-primary/5 border-primary shadow-sm ring-1 ring-primary/20' 
                                  : 'bg-card border-border/50 hover:border-primary/50 hover:bg-accent/50'
                              }`}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <p className={`text-sm font-bold truncate ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                                  {hSummary.title}
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
                                {hSummary.description}
                              </p>
                              <div className="flex items-center justify-between text-[10px] text-muted-foreground/80">
                                <span className="flex items-center gap-1 font-medium bg-muted px-2 py-0.5 rounded-full">
                                  <Clock className="w-3 h-3" /> 
                                  {h.timestamp ? formatDistanceToNow(new Date(h.timestamp), { addSuffix: true, locale: th }) : "ไม่แน่ชัด"}
                                </span>
                                {isSelected && <span className="text-primary font-bold flex items-center gap-1"><Eye className="h-3 w-3" /> ดูอยู่</span>}
                              </div>
                            </motion.button>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </ScrollArea>
                </Card>
              )}
            </div>
          </div>
        </div>
      </PageTransition>
    </AppLayout>
  );
};

export default CareerInsights;
