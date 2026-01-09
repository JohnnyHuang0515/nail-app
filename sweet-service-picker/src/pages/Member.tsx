import MobileFrame from "@/components/MobileFrame";
import BottomNav from "@/components/BottomNav";
import { User, Settings, Heart, Gift, Bell } from "lucide-react";

const Member = () => {
  return (
    <MobileFrame>
      <div className="h-full flex flex-col bg-background">
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-20">
          {/* Profile Header */}
          <div className="bg-gradient-to-br from-pastel-pink/40 via-cream to-secondary/30 px-5 py-8">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-card border-4 border-card shadow-soft overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Sarah Chen</h1>
                <p className="text-sm text-muted-foreground">白金會員 💎</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-1 bg-pastel-pink/30 rounded-full text-xs font-medium text-pastel-pink-hover">
                    500 點數
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="px-5 py-4 space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground mb-3">我的帳戶</h2>

            {[
              { icon: Heart, label: '我的收藏', count: 12 },
              { icon: Gift, label: '優惠券', count: 3 },
              { icon: Bell, label: '通知中心', count: 5 },
              { icon: Settings, label: '設定' },
            ].map((item, index) => (
              <button
                key={index}
                className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl border border-border hover:border-pastel-pink/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <span className="flex-1 text-left font-medium text-foreground">{item.label}</span>
                {item.count && (
                  <span className="px-2 py-0.5 bg-pastel-pink/20 rounded-full text-xs font-medium text-pastel-pink-hover">
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNav activeTab="member" />
      </div>
    </MobileFrame>
  );
};

export default Member;
