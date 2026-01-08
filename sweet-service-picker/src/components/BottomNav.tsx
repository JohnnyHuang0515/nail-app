import { Home, Calendar, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BottomNavProps {
  activeTab: 'home' | 'booking' | 'member';
}

const BottomNav = ({ activeTab }: BottomNavProps) => {
  const navigate = useNavigate();

  const tabs = [
    { id: 'home' as const, icon: Home, label: 'Home', path: '/' },
    { id: 'booking' as const, icon: Calendar, label: 'Booking', path: '/booking' },
    { id: 'member' as const, icon: User, label: 'Member', path: '/member' },
  ];

  return (
    <div className="bg-card border-t border-border px-4 py-2 pb-4">
      <div className="flex items-center justify-around">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all ${
                isActive 
                  ? 'bg-milk-tea/20 text-milk-tea-dark' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
