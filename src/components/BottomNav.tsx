import { LayoutDashboard, User, Users, FolderKanban, Settings } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";

const navItems = [
  { title: "Home", url: "/dashboard", icon: LayoutDashboard },
  { title: "Profile", url: "/profile", icon: User },
  { title: "Team", url: "/team", icon: Users },
  { title: "Projects", url: "/projects", icon: FolderKanban },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-card/95 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex h-[60px] items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.url || location.pathname.startsWith(item.url + "/");
          return (
            <NavLink
              key={item.title}
              to={item.url}
              end={item.url === "/dashboard"}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1.5"
              activeClassName=""
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-2xl transition-all duration-200 ${
                isActive ? "bg-primary/10 scale-110" : ""
              }`}>
                <item.icon className={`h-[20px] w-[20px] transition-colors duration-200 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`} />
              </div>
              <span className={`text-[10px] font-medium transition-colors duration-200 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}>
                {item.title}
              </span>
              {isActive && (
                <span className="absolute -top-[1px] left-1/2 h-[3px] w-5 -translate-x-1/2 rounded-full bg-primary" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
