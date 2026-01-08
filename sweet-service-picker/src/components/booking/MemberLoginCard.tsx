import { useState } from "react";
import { Phone, Gift, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MemberLoginCardProps {
  isLoggedIn: boolean;
  memberPhone: string;
  onLogin: (phone: string) => void;
  onLogout: () => void;
}

const MemberLoginCard = ({ isLoggedIn, memberPhone, onLogin, onLogout }: MemberLoginCardProps) => {
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone.trim()) return;
    setIsLoading(true);
    // Simulate login
    await new Promise(resolve => setTimeout(resolve, 800));
    onLogin(phone);
    setIsLoading(false);
  };

  if (isLoggedIn) {
    return (
      <div className="bg-gradient-to-r from-milk-tea/20 to-milk-tea/10 rounded-2xl p-4 border border-milk-tea/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-milk-tea/30 flex items-center justify-center">
              <Check className="w-5 h-5 text-milk-tea-dark" />
            </div>
            <div>
              <p className="font-semibold text-foreground">會員已登入</p>
              <p className="text-sm text-muted-foreground">{memberPhone}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onLogout}
            className="text-muted-foreground hover:text-foreground"
          >
            登出
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-3 text-sm text-milk-tea-dark">
          <Gift className="w-4 h-4" />
          <span>您有 <strong>2 張</strong> 可用優惠券</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-4 border border-border">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-milk-tea/20 flex items-center justify-center">
          <Phone className="w-5 h-5 text-milk-tea" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">會員登入</h3>
          <p className="text-xs text-muted-foreground">登入可累積點數、使用優惠券！</p>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="tel"
          placeholder="輸入手機號碼"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="flex-1 px-4 py-3 bg-background rounded-xl border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-milk-tea transition-all text-sm"
        />
        <Button
          onClick={handleLogin}
          disabled={!phone.trim() || isLoading}
          className="bg-milk-tea hover:bg-milk-tea/90 text-white rounded-xl px-5"
        >
          {isLoading ? "..." : "登入"}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mt-2 text-center">
        首次登入自動註冊會員
      </p>
    </div>
  );
};

export default MemberLoginCard;
