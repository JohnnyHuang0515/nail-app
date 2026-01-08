import { Home, Calendar, Users, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Calendar, label: "Schedule", path: "/schedule" },
  { icon: Users, label: "Clients", path: "/clients" },
  { icon: Menu, label: "Menu", path: "/menu" },
];

const BottomNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="sticky bottom-0 bg-card/95 backdrop-blur-lg border-t border-border px-4 py-2 pb-6">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-squircle transition-all duration-200",
                isActive
                  ? "text-accent"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div
                className={cn(
                  "p-2 rounded-squircle transition-all duration-200",
                  isActive && "bg-primary/20"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 transition-transform",
                    isActive && "scale-110"
                  )}
                />
              </div>
              <span className="text-xs font-semibold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavBar;
