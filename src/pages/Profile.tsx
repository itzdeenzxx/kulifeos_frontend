import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/MotionWrappers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { Pencil, Briefcase, Award, ChevronRight } from "lucide-react";
import { useCurrentUserProfile, useSkillData, skillTagsDefault as skillTags, usePortfolioProjects, useExperienceTimeline } from "@/lib/db";
import { motion } from "framer-motion";

const Profile = () => {
  const { profile: mockUserProfile } = useCurrentUserProfile();
  const { data: skillData = [] } = useSkillData();
  const { data: mockProjects = [] } = usePortfolioProjects();
  const { data: mockTimeline = [] } = useExperienceTimeline();

  const navigate = useNavigate();

  // Load persisted onboarding data or fall back to mock
  const storedRaw = localStorage.getItem("ku_profile");
  const stored = storedRaw ? JSON.parse(storedRaw) : null;

  const userProfile = stored ? {
    name: stored.name || mockUserProfile.name,
    faculty: [stored.faculty, stored.major].filter(Boolean).join(" — ") || mockUserProfile.faculty,
    year: stored.year || mockUserProfile.year,
    avatar: stored.avatar || mockUserProfile.avatar,
    bio: stored.bio || mockUserProfile.bio,
  } : mockUserProfile;

  const allSkillTags: string[] = stored?.skills?.length
    ? [...stored.skills, ...(stored.interests ?? [])].slice(0, 12)
    : [...skillTags, "Python", "React", "TensorFlow", "SQL", "Figma"];

  const radarData = stored?.radarData ?? skillData;
  const techRadarData = stored?.techRadarData ?? [
    { skill: "Frontend", value: 80, fullMark: 100 },
    { skill: "Backend", value: 65, fullMark: 100 },
    { skill: "Design", value: 70, fullMark: 100 },
    { skill: "Database", value: 60, fullMark: 100 },
    { skill: "Testing", value: 50, fullMark: 100 },
  ];

  const portfolioProjects = stored?.projects?.length
    ? stored.projects.map((p: any) => ({
        title: p.name,
        description: p.desc,
        tech: p.tech ? p.tech.split(",").map((t: string) => t.trim()) : [],
        status: "In Progress",
      }))
    : mockProjects;

  const experienceTimeline = stored?.experiences?.length
    ? stored.experiences.map((e: any) => ({
        year: e.year || "2026",
        title: e.title,
        org: e.org,
        description: e.desc,
      }))
    : mockTimeline;

  return (
    <AppLayout title="Profile" hideHeader>
      <PageTransition>
        {/* ========== MOBILE ========== */}
        <div className="md:hidden space-y-5">
          {/* Profile Hero */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center pt-2"
          >
            <Avatar className="h-20 w-20 ring-4 ring-primary/10">
              <AvatarImage src={userProfile?.photoURL || userProfile?.avatar} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                {userProfile.avatar}
              </AvatarFallback>
            </Avatar>
            <h2 className="mt-3 text-xl font-extrabold text-foreground">{userProfile.name}</h2>
            <p className="text-sm text-muted-foreground">{userProfile.faculty}</p>
            <div className="mt-1.5 flex items-center gap-2">
              <Badge className="rounded-full bg-primary/10 text-primary border-0 px-3 py-0.5 text-xs font-semibold">
                {userProfile.year}
              </Badge>
            </div>
            <p className="mt-2 max-w-[280px] text-center text-[13px] text-muted-foreground leading-relaxed">{userProfile.bio}</p>
            <Button variant="outline" size="sm" onClick={() => navigate("/settings")} className="mt-3 gap-2 rounded-xl border-border/60 text-foreground">
              <Pencil className="h-3.5 w-3.5" /> แก้ไขโปรไฟล์
            </Button>
          </motion.div>

          {/* Skills - Horizontal chips */}
          <div>
            <h3 className="mb-2.5 text-[15px] font-bold text-foreground">ทักษะ</h3>
            <div className="flex flex-wrap gap-2">
              {allSkillTags.map((tag) => (
                <Badge key={tag} className="rounded-full bg-accent text-accent-foreground border-0 px-3 py-1.5 text-[12px] font-medium">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Skill Radar - compact */}
          <div className="rounded-2xl border border-border/50 bg-card p-4">
            <h3 className="mb-1 text-[15px] font-bold text-foreground">Soft Skills Radar</h3>
            <div className="mx-auto h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            <h3 className="mt-4 mb-1 text-[15px] font-bold text-foreground">Hard Skills Radar</h3>
            <div className="mx-auto h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={techRadarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar dataKey="value" stroke="hsl(var(--chart-2, 210 100% 50%))" fill="hsl(var(--chart-2, 210 100% 50%))" fillOpacity={0.15} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Portfolio */}
          <div>
            <h3 className="mb-2.5 flex items-center gap-2 text-[15px] font-bold text-foreground">
              <Briefcase className="h-4 w-4 text-primary" /> Portfolio
            </h3>
            <div className="space-y-2.5">
              {portfolioProjects.map((p, i) => (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <div className="flex items-center gap-3 rounded-2xl border border-border/50 bg-card p-4 active:scale-[0.98] transition-transform">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-[14px] font-semibold text-foreground">{p.title}</p>
                        <Badge className={`shrink-0 rounded-full border-0 px-2 py-0.5 text-[10px] font-semibold ${
                          p.status === "Completed" ? "bg-primary/10 text-primary" : "bg-amber-100 text-amber-700"
                        }`}>{p.status}</Badge>
                      </div>
                      <p className="mt-0.5 text-[12px] text-muted-foreground line-clamp-1">{p.description}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {p.tech.map((t) => (
                          <span key={t} className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{t}</span>
                        ))}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Experience Timeline */}
          <div>
            <h3 className="mb-2.5 flex items-center gap-2 text-[15px] font-bold text-foreground">
              <Award className="h-4 w-4 text-primary" /> ประสบการณ์
            </h3>
            <div className="relative ml-3 border-l-2 border-accent pl-5 pb-2">
              {experienceTimeline.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  className="relative mb-6 last:mb-0"
                >
                  <div className="absolute -left-[25px] top-1 h-3 w-3 rounded-full border-2 border-primary bg-background" />
                  <span className="text-[11px] font-bold text-primary">{item.year}</span>
                  <h4 className="text-[13px] font-semibold text-foreground">{item.title}</h4>
                  <p className="text-[11px] text-muted-foreground">{item.org}</p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ========== DESKTOP ========== */}
        <div className="hidden md:block">
          <StaggerItem>
            <Card className="mb-6 rounded-2xl border-border/50">
              <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-start">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={userProfile?.photoURL || userProfile?.avatar} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">{userProfile.avatar}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-foreground">{userProfile.name}</h2>
                  <p className="text-muted-foreground">{userProfile.faculty} • {userProfile.year}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{userProfile.bio}</p>
                </div>
                <Button variant="outline" onClick={() => navigate("/settings")} className="gap-2 rounded-xl border-primary/20 text-primary hover:bg-accent">
                  <Pencil className="h-4 w-4" /> Edit Profile
                </Button>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerContainer className="grid gap-6 lg:grid-cols-3">
            <StaggerItem>
              <Card className="rounded-2xl border-border/50">
                <CardHeader><CardTitle>Soft Skills Radar</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis dataKey="skill" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card className="rounded-2xl border-border/50">
                <CardHeader><CardTitle>Hard Skills Radar</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={techRadarData}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis dataKey="skill" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar dataKey="value" stroke="hsl(var(--chart-2, 210 100% 50%))" fill="hsl(var(--chart-2, 210 100% 50%))" fillOpacity={0.15} strokeWidth={2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card className="rounded-2xl border-border/50">
                <CardHeader><CardTitle>Skill Badges</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {allSkillTags.map((tag) => (
                      <Badge key={tag} className="rounded-full bg-accent text-accent-foreground border-0 px-4 py-2 text-sm font-medium">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          </StaggerContainer>

          <h3 className="mb-4 mt-8 text-xl font-bold text-foreground">Portfolio Projects</h3>
          <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {portfolioProjects.map((p) => (
              <StaggerItem key={p.title}>
                <Card className="card-hover rounded-2xl border-border/50">
                  <CardContent className="p-5">
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="font-semibold text-foreground">{p.title}</h4>
                      <Badge variant="secondary" className="rounded-full bg-accent text-accent-foreground border-0 text-xs">{p.status}</Badge>
                    </div>
                    <p className="mb-3 text-sm text-muted-foreground">{p.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {p.tech.map((t) => (
                        <span key={t} className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">{t}</span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <h3 className="mb-4 mt-8 text-xl font-bold text-foreground">Experience Timeline</h3>
          <div className="relative ml-4 border-l-2 border-accent pl-6 pb-4">
            {experienceTimeline.map((item, i) => (
              <StaggerItem key={i}>
                <div className="relative mb-8 last:mb-0">
                  <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-primary bg-background" />
                  <span className="text-xs font-semibold text-primary">{item.year}</span>
                  <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                  <p className="text-xs text-muted-foreground">{item.org}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                </div>
              </StaggerItem>
            ))}
          </div>
        </div>
      </PageTransition>
    </AppLayout>
  );
};

export default Profile;
