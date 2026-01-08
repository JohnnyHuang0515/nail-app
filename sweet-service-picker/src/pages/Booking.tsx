import { useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import MobileFrame from "@/components/MobileFrame";
import StylistHeader from "@/components/StylistHeader";
import ServiceList from "@/components/ServiceList";
import CategoryTabs from "@/components/CategoryTabs";
import BottomNav from "@/components/BottomNav";
import StickyFooter from "@/components/StickyFooter";

const Booking = () => {
  const location = useLocation();
  const stylist = location.state?.stylist || null;
  
  const [totals, setTotals] = useState({ totalPrice: 0, totalTime: 0, itemCount: 0 });

  const handleTotalsChange = useCallback((newTotals: { totalPrice: number; totalTime: number; itemCount: number }) => {
    setTotals(newTotals);
  }, []);

  return (
    <MobileFrame>
      <div className="h-full flex flex-col bg-background pt-5">
        {/* Fixed Header Area */}
        <div className="flex-shrink-0">
          <StylistHeader stylist={stylist} />
          <CategoryTabs />
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-hidden">
          <ServiceList onTotalsChange={handleTotalsChange} />
        </div>
        
        {/* Fixed Bottom Area */}
        <div className="flex-shrink-0 pb-2">
          <StickyFooter 
            totalPrice={totals.totalPrice}
            totalTime={totals.totalTime}
            itemCount={totals.itemCount}
            stylist={stylist}
          />
          <BottomNav activeTab="booking" />
        </div>
      </div>
    </MobileFrame>
  );
};

export default Booking;
