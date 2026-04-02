import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/MotionWrappers";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, UserPlus, Check } from "lucide-react";
import { useTeammates } from "@/lib/db";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const filterChips = ["All", "AI", "Finance", "Marketing", "Design", "Data"];

const TeamMatching = () => {
  const { data: teammates } = useTeammates();
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [invited, setInvited] = useState<number[]>([]);

  const handleInvite = (student: typeof teammates[0]) => {
    if (invited.includes(student.id)) return;
    setInvited((prev) => [...prev, student.id]);
    toast({ title: `ส่งคำเชิญหา ${student.name} แล้ว ✓`, description: "รอการตอบรับจากสมาชิก" });
  };

  const filtered = teammates.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.skills.some(s => s.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter = activeFilter === "All" || t.skills.some(s => s.toLowerCase().includes(activeFilter.toLowerCase()));
    return matchesSearch && matchesFilter;
  });

  return (
    <AppLayout title="Team">
      <PageTransition>
        {/* Search & Filters */}
        <div className="mb-5 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="ค้นหาตามทักษะหรือชื่อ..."
              className="rounded-2xl border-border/50 bg-card pl-10 h-11 text-[14px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {filterChips.map((chip) => (
              <button
                key={chip}
                onClick={() => setActiveFilter(chip)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-[13px] font-medium transition-all duration-200 ${
                  activeFilter === chip
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-accent text-accent-foreground"
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile: List */}
        <div className="space-y-2.5 md:hidden" key={activeFilter + search}>
          {filtered.map((student, i) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <div className="flex items-center gap-3.5 rounded-2xl border border-border/50 bg-card p-4 active:scale-[0.98] transition-transform">
                <Avatar className="h-12 w-12 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">{student.avatar}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="truncate text-[14px] font-semibold text-foreground">{student.name}</h3>
                    <span className="ml-2 shrink-0 text-[13px] font-bold text-primary">{student.compatibility}%</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{student.faculty}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {student.skills.map((skill) => (
                      <Badge key={skill} className="rounded-full bg-accent text-accent-foreground border-0 px-2 py-0.5 text-[10px]">{skill}</Badge>
                    ))}
                  </div>
                </div>
                <Button size="icon" onClick={() => handleInvite(student)} className={`h-9 w-9 shrink-0 rounded-xl transition-all ${invited.includes(student.id) ? "bg-accent text-primary" : "bg-primary text-primary-foreground"}`}>
                  {invited.includes(student.id) ? <Check className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Desktop: Grid */}
        <StaggerContainer className="hidden gap-5 sm:grid-cols-2 md:grid lg:grid-cols-3" key={activeFilter + search}>
          {filtered.map((student) => (
            <StaggerItem key={student.id}>
              <Card className="card-hover green-glow rounded-2xl border-border/50">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">{student.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-foreground">{student.name}</h3>
                      <p className="text-xs text-muted-foreground">{student.faculty}</p>
                    </div>
                  </div>
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {student.skills.map((skill) => (
                      <Badge key={skill} className="rounded-full bg-accent text-accent-foreground border-0 px-2.5 py-0.5 text-xs">{skill}</Badge>
                    ))}
                  </div>
                  <div className="mb-3">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Compatibility</span>
                      <span className="font-semibold text-primary">{student.compatibility}%</span>
                    </div>
                    <Progress value={student.compatibility} className="h-2 bg-accent [&>div]:bg-primary" />
                  </div>
                  <Button onClick={() => handleInvite(student)} className={`w-full rounded-xl transition-all ${invited.includes(student.id) ? "bg-accent text-primary hover:bg-accent" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}>
                    {invited.includes(student.id) ? <><Check className="mr-2 h-4 w-4" />ส่งคำเชิญแล้ว</> : "Invite to Team"}
                  </Button>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </PageTransition>
    </AppLayout>
  );
};

export default TeamMatching;
