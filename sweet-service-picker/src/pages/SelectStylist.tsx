import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileFrame from "@/components/MobileFrame";
import BottomNav from "@/components/BottomNav";
import StylistCard from "@/components/stylist/StylistCard";
import StylistProfileModal from "@/components/stylist/StylistProfileModal";
import { ChevronLeft } from "lucide-react";

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

const stylists: Stylist[] = [
  {
    id: "1",
    name: "小雅",
    nameEn: "Yaya",
    title: "Senior Nail Artist",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
    rating: 4.9,
    reviewCount: 128,
    tags: ["凝膠專家", "手部護理", "法式美甲"],
    bio: "擁有8年美甲經驗，專精於日系凝膠設計與手部護理。曾赴日本進修，擅長將流行元素融入設計中，為每位客人打造獨一無二的指尖藝術。",
    reviews: [
      { id: "1", author: "小美", rating: 5, comment: "超級細心！做完手好漂亮～", date: "2024-01-15" },
      { id: "2", author: "安安", rating: 5, comment: "每次來都很滿意，推推！", date: "2024-01-10" },
      { id: "3", author: "Mia", rating: 4, comment: "很有耐心，會幫忙選顏色", date: "2024-01-05" },
    ],
    portfolio: [
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=300&h=300&fit=crop",
      "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=300&h=300&fit=crop",
      "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=300&h=300&fit=crop",
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=300&h=300&fit=crop",
    ],
  },
  {
    id: "2",
    name: "小薰",
    nameEn: "Kaori",
    title: "Creative Director",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    rating: 4.8,
    reviewCount: 96,
    tags: ["創意設計", "暈染藝術", "新娘美甲"],
    bio: "專注於創意美甲設計，擅長暈染、大理石紋等藝術風格。喜歡挑戰新技法，為客人帶來驚喜。新娘美甲也是我的拿手項目！",
    reviews: [
      { id: "1", author: "婷婷", rating: 5, comment: "婚禮當天的美甲超夢幻！", date: "2024-01-12" },
      { id: "2", author: "小玲", rating: 5, comment: "暈染做得太美了", date: "2024-01-08" },
    ],
    portfolio: [
      "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=300&h=300&fit=crop",
      "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=300&h=300&fit=crop",
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=300&h=300&fit=crop",
    ],
  },
  {
    id: "3",
    name: "小雯",
    nameEn: "Wendy",
    title: "Nail Technician",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face",
    rating: 4.7,
    reviewCount: 64,
    tags: ["日系風格", "可愛設計", "美睫"],
    bio: "溫柔細心，擅長日系可愛風格的美甲設計。同時也提供美睫服務，讓妳一次變美！新客人我會特別用心照顧喔～",
    reviews: [
      { id: "1", author: "小花", rating: 5, comment: "好溫柔的美甲師！", date: "2024-01-14" },
      { id: "2", author: "珊珊", rating: 4, comment: "做得很細緻", date: "2024-01-06" },
    ],
    portfolio: [
      "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=300&h=300&fit=crop",
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=300&h=300&fit=crop",
      "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=300&h=300&fit=crop",
    ],
  },
];

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

        {/* Stylist List */}
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
