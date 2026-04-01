import { AppLayout } from "@/components/AppLayout";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/MotionWrappers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, Target, Zap, ChevronRight } from "lucide-react";
import { careerRecommendation, skillGapData, growthTimeline } from "@/lib/mockData";
import { motion } from "framer-motion";

const CareerInsights = () => {
  return (
    <AppLayout title="Career">
      <PageTransition>
        {/* ========== MOBILE ========== */}
        <div className="md:hidden space-y-5">
          {/* Career Match Hero */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-secondary p-6 text-primary-foreground"
          >
            <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/8" />
            <div className="relative z-10">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 opacity-80" />
                <span className="text-sm font-medium opacity-80">Top Career Match</span>
              </div>
              <h2 className="mt-2 text-2xl font-extrabold">{careerRecommendation.title}</h2>
              <p className="mt-1 text-sm opacity-70 leading-relaxed">{careerRecommendation.description}</p>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-5xl font-extrabold">{careerRecommendation.matchScore}</span>
                <span className="mb-1 text-xl font-bold opacity-70">%</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {careerRecommendation.requiredSkills.map((s) => (
                  <Badge key={s} className="rounded-full bg-white/15 text-white border-0 px-2.5 py-0.5 text-[11px] font-medium backdrop-blur-sm">{s}</Badge>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Skill Gap - compact bars */}
          <div>
            <h3 className="mb-2.5 flex items-center gap-2 text-[15px] font-bold text-foreground">
              <Zap className="h-4 w-4 text-primary" /> Skill Gap Analysis
            </h3>
            <div className="space-y-3 rounded-2xl border border-border/50 bg-card p-4">
              {skillGapData.map((item, i) => (
                <motion.div
                  key={item.skill}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] font-medium text-foreground">{item.skill}</span>
                    <span className={`text-[11px] font-bold ${item.current >= item.required ? "text-primary" : "text-amber-500"}`}>
                      {item.current}/{item.required}
                    </span>
                  </div>
                  <div className="relative h-2 w-full rounded-full bg-accent">
                    <div
                      className={`absolute left-0 top-0 h-full rounded-full transition-all ${item.current >= item.required ? "bg-primary" : "bg-amber-400"}`}
                      style={{ width: `${Math.min(item.current, 100)}%` }}
                    />
                    <div
                      className="absolute top-0 h-full w-0.5 bg-foreground/30"
                      style={{ left: `${item.required}%` }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Growth Timeline */}
          <div>
            <h3 className="mb-2.5 flex items-center gap-2 text-[15px] font-bold text-foreground">
              <TrendingUp className="h-4 w-4 text-primary" /> Growth Path
            </h3>
            <div className="relative ml-3 border-l-2 border-primary/20 pl-5 pb-1">
              {growthTimeline.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="relative mb-6 last:mb-0"
                >
                  <div className="absolute -left-[25px] top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-[9px] font-bold">
                    {item.year.slice(-2)}
                  </div>
                  <h4 className="text-[14px] font-bold text-foreground">{item.milestone}</h4>
                  <p className="text-[12px] text-muted-foreground">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ========== DESKTOP ========== */}
        <div className="hidden md:block">
          <StaggerContainer className="space-y-6">
            <StaggerItem>
              <Card className="rounded-2xl border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" /> Top Career Match
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">{careerRecommendation.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{careerRecommendation.description}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {careerRecommendation.requiredSkills.map((s) => (
                          <Badge key={s} className="rounded-full bg-accent text-accent-foreground border-0 px-3 py-1 text-xs">{s}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-4xl font-bold text-primary">{careerRecommendation.matchScore}%</span>
                      <span className="text-sm text-muted-foreground">Match Score</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card className="rounded-2xl border-border/50">
                <CardHeader><CardTitle>Skill Gap Analysis</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={skillGapData} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(140 10% 92%)" horizontal={false} />
                        <XAxis type="number" domain={[0, 100]} tick={{ fill: "hsl(150 5% 45%)", fontSize: 12 }} />
                        <YAxis type="category" dataKey="skill" tick={{ fill: "hsl(150 5% 45%)", fontSize: 12 }} width={110} />
                        <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid hsl(140 10% 90%)", fontSize: 12 }} />
                        <Bar dataKey="current" name="Current" radius={[0, 6, 6, 0]} barSize={14}>
                          {skillGapData.map((entry, i) => (
                            <Cell key={i} fill={entry.current >= entry.required ? "hsl(153 100% 20%)" : "hsl(122 39% 49%)"} />
                          ))}
                        </Bar>
                        <Bar dataKey="required" name="Required" fill="hsl(140 10% 90%)" radius={[0, 6, 6, 0]} barSize={14} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card className="rounded-2xl border-border/50">
                <CardHeader><CardTitle>Growth Timeline</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex overflow-x-auto pb-2">
                    {growthTimeline.map((item, i) => (
                      <div key={i} className="flex min-w-[200px] flex-1 flex-col items-center text-center">
                        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">{item.year}</div>
                        <h4 className="mt-2 text-sm font-semibold text-foreground">{item.milestone}</h4>
                        <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    ))}
                  </div>
                  <div className="relative -mt-[88px] mx-auto mb-16 hidden sm:block" style={{ height: 2, width: "80%", background: "hsl(140 10% 90%)" }} />
                </CardContent>
              </Card>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </PageTransition>
    </AppLayout>
  );
};

export default CareerInsights;
