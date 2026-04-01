import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, BookOpen, ArrowRight } from "lucide-react";

const roles = [
  {
    title: "นิสิต",
    subtitle: "Student",
    description: "เข้าสู่ระบบเพื่อสร้างโปรไฟล์ หาทีม และจัดการโปรเจกต์",
    icon: BookOpen,
    to: "/onboarding",
    accent: "bg-primary",
  },
  {
    title: "อาจารย์",
    subtitle: "Teacher",
    description: "สร้าง Classroom, จัดกลุ่มนิสิต และติดตามผลงาน",
    icon: GraduationCap,
    to: "/teacher",
    accent: "bg-secondary",
  },
];

const RoleSelect = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      {/* Logo */}
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
          <span className="text-sm font-bold text-primary-foreground">KU</span>
        </div>
        <span className="text-2xl font-bold text-foreground">LifeOS</span>
      </div>
      <p className="mb-10 text-sm text-muted-foreground">เลือกบทบาทของคุณเพื่อเข้าสู่ระบบ</p>

      <div className="grid w-full max-w-md gap-4 sm:max-w-2xl sm:grid-cols-2">
        {roles.map((role) => (
          <Link key={role.title} to={role.to}>
            <Card className="card-hover group cursor-pointer rounded-2xl border-border/50 transition-all hover:border-primary/40">
              <CardContent className="flex flex-col items-center p-8 text-center">
                <div className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${role.accent}`}>
                  <role.icon className="h-8 w-8 text-primary-foreground" />
                </div>
                <h2 className="text-xl font-bold text-foreground">{role.title}</h2>
                <p className="mb-1 text-xs font-medium text-muted-foreground">{role.subtitle}</p>
                <p className="mb-5 text-sm leading-relaxed text-muted-foreground">{role.description}</p>
                <div className="flex items-center gap-1 text-sm font-semibold text-primary transition-transform group-hover:translate-x-1">
                  เข้าสู่ระบบ <ArrowRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RoleSelect;
