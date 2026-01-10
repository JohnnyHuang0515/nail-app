import { useState } from "react";
import MobileFrame from "@/components/MobileFrame";
import BottomNav from "@/components/BottomNav";
import { User, Settings, Heart, Gift, Bell, LogIn, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { memberService, MemberProfile } from "@/services/member.service";

const Member = () => {
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone) {
      toast.error("請輸入電話號碼");
      return;
    }

    setIsLoading(true);
    try {
      const data = await memberService.getProfileByPhone(phone);
      if (data) {
        setProfile(data);
        toast.success("歡迎回來！");
      } else {
        toast.error("找不到會員資料，請確認電話號碼");
      }
    } catch (error) {
      toast.error("登入失敗，請稍後再試");
    } finally {
      setIsLoading(false);
    }
  };

  if (!profile) {
    return (
      <MobileFrame>
        <div className="h-full flex flex-col bg-background">
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <User className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">會員登入</h1>
            <p className="text-muted-foreground mb-8 text-center">
              輸入電話號碼以查看您的會員權益與預約紀錄
            </p>

            <div className="w-full space-y-4">
              <Input
                placeholder="請輸入電話號碼 (e.g. 0912345678)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="text-lg h-12"
              />
              <Button
                onClick={handleLogin}
                className="w-full h-12 text-lg"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5 mr-2" />}
                登入
              </Button>
            </div>
          </div>
          <BottomNav activeTab="member" />
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <div className="h-full flex flex-col bg-background">
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-20">
          {/* Profile Header */}
          <div className="bg-gradient-to-br from-pastel-pink/40 via-cream to-secondary/30 px-5 py-8">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-card border-4 border-card shadow-soft overflow-hidden flex items-center justify-center">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-muted-foreground" />
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{profile.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {profile.memberTier === 'Platinum' ? '白金會員 💎' :
                    profile.memberTier === 'Gold' ? '金卡會員 🥇' :
                      profile.memberTier === 'Silver' ? '銀卡會員 🥈' : '銅卡會員 🥉'}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-1 bg-pastel-pink/30 rounded-full text-xs font-medium text-pastel-pink-hover">
                    {profile.points} 點數
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
              { icon: Bell, label: '通知中心', count: 1 },
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
              onClick={() => setProfile(null)}
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
