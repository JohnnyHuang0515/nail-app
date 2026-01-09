import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import MobileFrame from "@/components/MobileFrame";
import BottomNav from "@/components/BottomNav";
import StylistCard from "@/components/stylist/StylistCard";
import StylistProfileModal from "@/components/stylist/StylistProfileModal";
import { ChevronLeft } from "lucide-react";
import { staffService } from "@/services/staff.service";

export interface Stylist {
  id: string;
  name: string;
  nameEn: string;
  title: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  bio: string;
  reviews: {
    id: string;
    author: string;
    rating: number;
    comment: string;
    date: string;
  }[];
  portfolio: string[];
}

// "No preference" option
const noPreferenceStylist: Stylist = {
  id: "no-preference",
  name: "不指定",
  nameEn: "Any Available",
  title: "系統自動安排",
  avatar: "",
  rating: 0,
  reviewCount: 0,
  tags: ["快速配對", "彈性時間"],
  bio: "讓我們為您安排當天最適合的美甲師，享受更多可選時段！",
  reviews: [],
  portfolio: [],
};

const SelectStylist = () => {
  const navigate = useNavigate();
  const [selectedStylist, setSelectedStylist] = useState<Stylist | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Fetch stylists from API
  const { data: stylists, isLoading, error } = useQuery({
    queryKey: ['staff'],
    queryFn: () => staffService.getAll(),
  });

  const handleSelectStylist = (stylist: Stylist) => {
    // Navigate to booking page with selected stylist
    navigate("/booking", { state: { stylist } });
  };

  const handleSelectNoPreference = () => {
    navigate("/booking", { state: { stylist: noPreferenceStylist } });
  };

  const handleViewProfile = (stylist: Stylist) => {
    setSelectedStylist(stylist);
    setShowProfileModal(true);
  };

  return (
    <MobileFrame>
      <div className="h-full flex flex-col bg-background">
        {/* Header */}
        <div className="flex-shrink-0 pt-5 px-5 pb-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1 text-muted-foreground mb-4 hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">返回</span>
          </button>
          <h1 className="text-2xl font-bold text-foreground">
            Choose your Artist
          </h1>
          <p className="text-muted-foreground mt-1">選擇您喜愛的美甲師</p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex-1 overflow-y-auto px-5 pb-32">
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-24 bg-muted rounded-2xl"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex-1 flex items-center justify-center px-5">
            <div className="text-center">
              <p className="text-red-500 mb-4">載入失敗，請稍後再試</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-milk-tea text-white rounded-lg"
              >
                重新載入
              </button>
            </div>
          </div>
        )}

        {/* Stylist List */}
        {!isLoading && !error && stylists && (
          <div className="flex-1 overflow-y-auto px-5 pb-32">
            <div className="space-y-4">
              {/* No Preference Option */}
              <button
                onClick={handleSelectNoPreference}
                className="w-full bg-card rounded-2xl p-4 shadow-soft border border-dashed border-milk-tea/50 hover:border-milk-tea transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-milk-tea/20 to-milk-tea/5 flex items-center justify-center border-2 border-milk-tea/20">
                    <span className="text-3xl">🎲</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-foreground">
                      不指定
                      <span className="text-muted-foreground font-normal text-sm ml-1">
                        Any Available
                      </span>
                    </h3>
                    <p className="text-sm text-muted-foreground">系統自動安排最適合的美甲師</p>
                    <div className="flex gap-1.5 mt-2">
                      <span className="text-xs bg-milk-tea/15 text-milk-tea-dark px-2 py-0.5 rounded-full">
                        快速配對
                      </span>
                      <span className="text-xs bg-milk-tea/15 text-milk-tea-dark px-2 py-0.5 rounded-full">
                        更多時段
                      </span>
                    </div>
                  </div>
                </div>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-border"></div>
                <span className="text-xs text-muted-foreground">或選擇指定美甲師</span>
                <div className="flex-1 h-px bg-border"></div>
              </div>

              {/* Stylist Cards */}
              {stylists.map((stylist) => (
                <StylistCard
                  key={stylist.id}
                  stylist={stylist}
                  onSelect={() => handleSelectStylist(stylist)}
                  onViewProfile={() => handleViewProfile(stylist)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="absolute bottom-0 left-0 right-0">
          <BottomNav activeTab="home" />
        </div>
      </div>

      {/* Profile Modal */}
      <StylistProfileModal
        stylist={selectedStylist}
        open={showProfileModal}
        onOpenChange={setShowProfileModal}
        onSelect={() => selectedStylist && handleSelectStylist(selectedStylist)}
      />
    </MobileFrame>
  );
};

export default SelectStylist;
