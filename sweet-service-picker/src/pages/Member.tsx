import { useNavigate } from "react-router-dom";
import MobileFrame from "@/components/MobileFrame";
import BottomNav from "@/components/BottomNav";
import { User, Settings, Heart, Gift, Bell, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/services/auth.service";
import LineLoginSection from "@/components/booking/LineLoginSection";

const Member = () => {
  const { user, logout, isLoading } = useAuthStore();
  const navigate = useNavigate();

  // If not logged in, show LINE Login
  if (!user) {
    return (
      <MobileFrame>
        <div className="h-full flex flex-col bg-background">
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <User className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">會員登入</h1>
            <p className="text-muted-foreground mb-8 text-center">
              使用 LINE 登入以查看您的會員權益與預約紀錄
            </p>

            <div className="w-full">
              <LineLoginSection />
            </div>
          </div>
          <BottomNav activeTab="member" />
        </div>
      </MobileFrame>
    );
  }

  // Calculate Member Tier/Points (Mock for now, could fetch real logic later)
  // In real app, these should come from user object or separate API call
  const memberTier: string = 'Bronze'; // Default
  const points = 0; // Default

  return (
    <MobileFrame>
      <div className="h-full flex flex-col bg-background">
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-20">
          {/* Profile Header */}
          <div className="bg-gradient-to-br from-pastel-pink/40 via-cream to-secondary/30 px-5 py-8">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-card border-4 border-card shadow-soft overflow-hidden flex items-center justify-center">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-muted-foreground" />
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{user.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {memberTier === 'Platinum' ? '白金會員 💎' :
                    memberTier === 'Gold' ? '金卡會員 🥇' :
                      memberTier === 'Silver' ? '銀卡會員 🥈' : '銅卡會員 🥉'}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-1 bg-pastel-pink/30 rounded-full text-xs font-medium text-pastel-pink-hover">
                    {points} 點數
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="px-5 py-4 space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground mb-3">我的帳戶</h2>

            {[
              { icon: Calendar, label: '我的預約', path: '/member/bookings' },
              { icon: Gift, label: '優惠券', path: '/member/coupons', count: 2 },
              { icon: Settings, label: '編輯個人資料', path: '/member/profile' },
            ].map((item, index) => (
              <button
                key={index}
                className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl border border-border hover:border-pastel-pink/50 transition-colors"
                onClick={() => navigate(item.path)}
              >
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <span className="flex-1 text-left font-medium text-foreground">{item.label}</span>
                {item.count && (
                  <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="px-5 mt-4">
            <Button
              variant="outline"
              className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={logout}
            >
              登出
            </Button>
          </div>
        </div>

        <BottomNav activeTab="member" />
      </div>
    </MobileFrame>
  );
};

export default Member;
