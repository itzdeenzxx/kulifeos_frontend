import { LayoutDashboard, User, Users, FolderKanban, TrendingUp, Settings, Upload, Bell, LogOut, MessageSquare } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Separator } from "@/components/ui/separator";
import { useLogout } from "@/hooks/use-logout";
import { LogoutDialog } from "@/components/LogoutDialog";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const mainNav = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Community", url: "/community", icon: MessageSquare },
  { title: "My Profile", url: "/profile", icon: User },
  { title: "Team Matching", url: "/team", icon: Users },
  { title: "Projects", url: "/projects", icon: FolderKanban },
  { title: "Career Insights", url: "/career", icon: TrendingUp },
  { title: "Notifications", url: "/notifications", icon: Bell },
];

const secondaryNav = [
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { open, promptLogout, confirmLogout, cancel } = useLogout();

  return (
    <>
    <LogoutDialog open={open} onConfirm={confirmLogout} onCancel={cancel} />
    <Sidebar className="border-r border-border bg-card">
      <div className="flex h-16 items-center gap-2 px-6 border-b border-border">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">KU</span>
        </div>
        <span className="font-bold text-foreground text-lg">LifeOS</span>
      </div>
      <SidebarContent className="pt-4 flex flex-col">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-11 px-4">
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-accent-foreground"
                      activeClassName="bg-accent text-primary font-semibold border-l-[3px] border-primary"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="px-4 py-2"><Separator /></div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-11 px-4">
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-accent-foreground"
                      activeClassName="bg-accent text-primary font-semibold border-l-[3px] border-primary"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Logout at the bottom */}
        <div className="mt-auto px-4 py-2"><Separator /></div>
        <SidebarGroup className="pb-4">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-11 px-4">
                  <button
                    onClick={promptLogout}
                    className="flex w-full items-center gap-3 rounded-lg text-destructive transition-colors duration-200 hover:bg-destructive/10"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>ออกจากระบบ</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
    </>
  );
}
