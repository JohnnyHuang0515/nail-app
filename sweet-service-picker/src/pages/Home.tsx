import { useNavigate } from "react-router-dom";
import MobileFrame from "@/components/MobileFrame";
import HeroSection from "@/components/home/HeroSection";
import ShopInfoCard from "@/components/home/ShopInfoCard";
import PortfolioGallery from "@/components/home/PortfolioGallery";
import BottomNav from "@/components/BottomNav";

const Home = () => {
  const navigate = useNavigate();

  return (
    <MobileFrame>
      <div className="h-full flex flex-col bg-background relative">
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-40">
          <HeroSection />
          <ShopInfoCard />
          <PortfolioGallery />
        </div>

        {/* Fixed Bottom Area */}
        <div className="absolute bottom-0 left-0 right-0">
          {/* Booking Button */}
          <div className="px-5 py-3 bg-gradient-to-t from-background via-background to-transparent">
            <button
              onClick={() => navigate('/select-stylist')}
              className="w-full py-4 bg-milk-tea/80 hover:bg-milk-tea backdrop-blur-xl border border-white/30 rounded-full font-bold text-lg text-white transition-all active:scale-[0.98] shadow-lg"
            >
              ✨ 立即預約
            </button>
          </div>

          {/* Bottom Navigation */}
          <BottomNav activeTab="home" />
        </div>
      </div>
    </MobileFrame>
  );
};

export default Home;
