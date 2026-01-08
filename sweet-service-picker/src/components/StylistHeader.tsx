import { Heart, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Stylist {
  id: string;
  name: string;
  nameEn: string;
  title: string;
  avatar: string;
  rating: number;
}

interface StylistHeaderProps {
  stylist?: Stylist | null;
}

const StylistHeader = ({ stylist }: StylistHeaderProps) => {
  const navigate = useNavigate();
  const isNoPreference = stylist?.id === "no-preference";

  return (
    <div className="px-5 py-4 bg-card border-b border-border">
      <div className="flex items-center gap-4">
        {/* Back Button */}
        <button 
          onClick={() => navigate("/select-stylist")}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>

        {/* Avatar */}
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-milk-tea-light to-secondary overflow-hidden border-2 border-white/30 shadow-soft flex items-center justify-center">
            {isNoPreference ? (
              <span className="text-2xl">🎲</span>
            ) : stylist?.avatar ? (
              <img 
                src={stylist.avatar}
                alt={stylist.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-lg text-muted-foreground">?</span>
            )}
          </div>
          {!isNoPreference && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-milk-tea rounded-full flex items-center justify-center border-2 border-card">
              <Heart className="w-3 h-3 text-white fill-current" />
            </div>
          )}
        </div>
        
        {/* Info */}
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground">
            {stylist?.name || "選擇服務"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {stylist?.title || "請選擇您需要的服務項目"}
          </p>
        </div>
        
        {/* Rating */}
        {stylist && !isNoPreference && stylist.rating > 0 && (
          <div className="flex items-center gap-1 bg-muted px-3 py-1.5 rounded-full">
            <span className="text-lg">⭐</span>
            <span className="font-semibold text-foreground">{stylist.rating}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StylistHeader;
