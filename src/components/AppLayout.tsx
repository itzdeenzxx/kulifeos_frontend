import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { BottomNav } from "@/components/BottomNav";
import { TopBar } from "@/components/TopBar";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell } from "lucide-react";
import { useCurrentUserProfile } from "@/lib/db";

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  hideHeader?: boolean;
}

export function AppLayout({ children, title, hideHeader = false }: AppLayoutProps) {
  const { profile: userProfile } = useCurrentUserProfile();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full overflow-x-hidden">
        <AppSidebar />
        <div className="flex flex-1 flex-col min-w-0">
          {/* Desktop TopBar */}
          <div className="hidden md:block">
            <TopBar title={title} />
          </div>

          {/* Mobile App Header */}
          {!hideHeader && (
            <header className="flex items-center justify-between px-5 pb-1 pt-[max(0.75rem,env(safe-area-inset-top))] md:hidden">
              <div>
                <h1 className="text-[22px] font-bold tracking-tight text-foreground">{title}</h1>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => navigate("/notifications")} className="relative flex h-10 w-10 items-center justify-center rounded-full bg-accent text-foreground">
                  <Bell className="h-[18px] w-[18px]" />
                  <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
                </button>
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                    {userProfile.avatar}
                  </AvatarFallback>
                </Avatar>
              </div>
            </header>
          )}

          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-muted/30 p-4 pb-24 md:p-8 md:pb-8">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="mx-auto max-w-7xl"
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
      <BottomNav />
    </SidebarProvider>
  );
}
