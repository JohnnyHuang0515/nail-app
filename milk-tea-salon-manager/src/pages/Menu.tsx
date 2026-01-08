import { Users, Tag, Package, Ticket, BarChart3, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileFrame from "@/components/MobileFrame";
import BottomNavBar from "@/components/BottomNavBar";
import { cn } from "@/lib/utils";

interface MenuItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
}

const MenuItem = ({ icon: Icon, label, onClick }: MenuItemProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "aspect-square bg-card rounded-squircle border-2 border-accent/30",
        "flex flex-col items-center justify-center gap-3 p-4",
        "transition-all duration-200 hover:border-accent hover:shadow-soft",
        "active:scale-95"
      )}
    >
      <div className="w-12 h-12 rounded-squircle bg-accent/10 flex items-center justify-center">
        <Icon className="w-6 h-6 text-accent" />
      </div>
      <span className="text-sm font-semibold text-foreground text-center leading-tight">
        {label}
      </span>
    </button>
  );
};

const menuItems = [
  { icon: Users, label: "Staff Management", path: "/staff" },
  { icon: Tag, label: "Services & Prices", path: "/services" },
  { icon: Package, label: "Inventory", path: "/inventory" },
  { icon: Ticket, label: "Coupons & Marketing", path: "/coupons" },
  { icon: BarChart3, label: "Reports", path: "/reports" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const Menu = () => {
  const navigate = useNavigate();

  return (
    <MobileFrame>
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="px-5 pt-4 pb-6">
          <h1 className="text-2xl font-bold text-foreground">Store Management</h1>
        </div>

        {/* Grid Menu */}
        <div className="px-5 pb-8">
          <div className="grid grid-cols-2 gap-4">
            {menuItems.map((item) => (
              <MenuItem
                key={item.label}
                icon={item.icon}
                label={item.label}
                onClick={item.path ? () => navigate(item.path) : undefined}
              />
            ))}
          </div>
        </div>
      </div>

      <BottomNavBar />
    </MobileFrame>
  );
};

export default Menu;
