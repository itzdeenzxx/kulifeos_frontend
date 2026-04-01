import { AppLayout } from "@/components/AppLayout";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/MotionWrappers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { ArrowRight, Calendar, FolderKanban, Flame, Trophy, Sparkles, TrendingUp } from "lucide-react";
import { skillData, skillTags, careerRecommendation, deadlines, activeProjects, userProfile } from "@/lib/mockData";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const totalProgress = Math.round(activeProjects.reduce((a, p) => a + p.progress, 0) / activeProjects.length);

  return (
    <AppLayout title="Dashboard" hideHeader>
      <PageTransition>
        {/* ========== MOBILE LAYOUT ========== */}
        <div className="md:hidden space-y-5 overflow-x-hidden">
          {/* Hero Greeting */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-secondary px-5 py-5 text-primary-foreground"
          >
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/8" />
            <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-white/5" />
            <div className="relative z-10">
              <p className="text-sm font-medium opacity-80">สวัสดี 👋</p>
              <h2 className="mt-0.5 text-[26px] font-extrabold leading-tight">{userProfile.name.split(" ")[0]}</h2>
              <p className="mt-1.5 text-sm opacity-70">ทักษะของคุณกำลังเติบโต ✨</p>

              <div className="mt-5 grid grid-cols-3 gap-2">
                {[
                  { icon: Flame, value: "7", label: "Streak" },
                  { icon: Trophy, value: `${careerRecommendation.matchScore}%`, label: "Match" },
                  { icon: TrendingUp, value: `${totalProgress}%`, label: "Progress" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl bg-white/12 px-2 py-2.5 text-center backdrop-blur-sm">
                    <stat.icon className="mx-auto h-4.5 w-4.5 opacity-90" />
                    <p className="mt-1 text-[17px] font-extrabold leading-tight">{stat.value}</p>
                    <p className="text-[10px] font-medium opacity-70">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Career Recommendation */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 }}>
            <button onClick={() => navigate("/career")} className="flex w-full items-center gap-3.5 rounded-2xl border border-border/50 bg-card p-4 text-left active:scale-[0.98] transition-transform">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/8">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">AI แนะนำ</p>
                <p className="truncate text-[15px] font-bold text-foreground">{careerRecommendation.title}</p>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className="text-base font-extrabold text-primary">{careerRecommendation.matchScore}%</span>
                  <span className="text-[11px] text-muted-foreground">match</span>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground/50" />
            </button>
          </motion.div>

          {/* Deadlines - Horizontal scroll */}
          <div>
            <h3 className="mb-2.5 flex items-center gap-2 text-[15px] font-bold text-foreground">
              <Calendar className="h-4 w-4 text-primary" /> เดดไลน์
            </h3>
            <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
              {deadlines.map((d, i) => (
                <motion.div
                  key={d.title}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.06 }}
                >
                  <div className="min-w-[150px] shrink-0 rounded-2xl border border-border/50 bg-card p-3.5">
                    <p className="text-[11px] font-bold text-primary">{d.date}</p>
                    <p className="mt-1 text-[13px] font-semibold leading-tight text-foreground">{d.title}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{d.course}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Active Projects */}
          <div>
            <h3 className="mb-2.5 flex items-center gap-2 text-[15px] font-bold text-foreground">
              <FolderKanban className="h-4 w-4 text-primary" /> โปรเจกต์
            </h3>
            <div className="space-y-2.5">
              {activeProjects.map((p, i) => (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.06 }}
                >
                  <button onClick={() => navigate("/projects")} className="flex w-full items-center gap-3.5 rounded-2xl border border-border/50 bg-card p-3.5 active:scale-[0.98] transition-transform">
                    <div className="relative h-12 w-12 shrink-0">
                      <svg className="h-12 w-12 -rotate-90" viewBox="0 0 48 48">
                        <circle cx="24" cy="24" r="20" fill="none" stroke="hsl(var(--accent))" strokeWidth="4" />
                        <circle cx="24" cy="24" r="20" fill="none" stroke="hsl(var(--primary))" strokeWidth="4"
                          strokeDasharray={`${(p.progress / 100) * 125.6} 125.6`} strokeLinecap="round" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">{p.progress}%</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold text-foreground">{p.name}</p>
                      <p className="text-[11px] text-muted-foreground">{p.members} สมาชิก</p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Skill Radar */}
          <div className="rounded-2xl border border-border/50 bg-card p-4">
            <h3 className="mb-1 text-[15px] font-bold text-foreground">Skill Identity</h3>
            <div className="mx-auto h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={skillData}>
                  <PolarGrid stroke="hsl(140 10% 90%)" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: "hsl(150 5% 45%)", fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar dataKey="value" stroke="hsl(153 100% 20%)" fill="hsl(153 100% 20%)" fillOpacity={0.15} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {skillTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="rounded-full bg-accent text-accent-foreground border-0 px-2.5 py-0.5 text-[10px] font-medium">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* ========== DESKTOP LAYOUT ========== */}
        <div className="hidden md:block">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Welcome back, {userProfile.name.split(" ")[0]} 👋</h2>
            <p className="text-muted-foreground">Your skills are growing. Keep building your future.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <StaggerItem>
                <Card className="rounded-2xl border-border/50">
                  <CardHeader><CardTitle className="text-lg">Your Skill Identity</CardTitle></CardHeader>
                  <CardContent>
                    <div className="mx-auto h-72 w-full max-w-md">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={skillData}>
                          <PolarGrid stroke="hsl(140 10% 90%)" />
                          <PolarAngleAxis dataKey="skill" tick={{ fill: "hsl(150 5% 45%)", fontSize: 12 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar dataKey="value" stroke="hsl(153 100% 20%)" fill="hsl(153 100% 20%)" fillOpacity={0.15} strokeWidth={2} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {skillTags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="rounded-full bg-accent text-accent-foreground border-0 px-3 py-1 text-xs font-medium transition-colors duration-200 hover:bg-primary hover:text-primary-foreground">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            </div>

            <StaggerContainer className="space-y-6">
              <StaggerItem>
                <Card className="card-hover rounded-2xl border-border/50">
                  <CardHeader className="pb-3"><CardTitle className="text-base">Career Recommendation</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-lg font-semibold text-foreground">{careerRecommendation.title}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-2xl font-bold text-primary">{careerRecommendation.matchScore}%</span>
                      <span className="text-sm text-muted-foreground">match</span>
                    </div>
                    <Button variant="ghost" onClick={() => navigate("/career")} className="mt-3 gap-1 px-0 text-primary hover:bg-transparent hover:text-primary/80">
                      View Insight <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </StaggerItem>
              <StaggerItem>
                <Card className="rounded-2xl border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base"><Calendar className="h-4 w-4 text-primary" /> Upcoming Deadlines</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {deadlines.map((d) => (
                      <div key={d.title} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">{d.title}</p>
                          <p className="text-xs text-muted-foreground">{d.course}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{d.date}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </StaggerItem>
              <StaggerItem>
                <Card className="rounded-2xl border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base"><FolderKanban className="h-4 w-4 text-primary" /> Active Projects</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {activeProjects.map((p) => (
                      <div key={p.name}>
                        <div className="mb-1 flex items-center justify-between">
                          <p className="text-sm font-medium text-foreground">{p.name}</p>
                          <span className="text-xs text-muted-foreground">{p.progress}%</span>
                        </div>
                        <Progress value={p.progress} className="h-2 bg-accent [&>div]:bg-primary" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </div>
      </PageTransition>
    </AppLayout>
  );
};

export default Dashboard;
