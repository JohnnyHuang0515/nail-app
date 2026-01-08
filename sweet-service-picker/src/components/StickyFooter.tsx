import { useNavigate } from "react-router-dom";

interface Stylist {
  id: string;
  name: string;
  nameEn: string;
  title: string;
  avatar: string;
  rating: number;
}

interface StickyFooterProps {
  totalPrice: number;
  totalTime: number;
  itemCount: number;
  stylist?: Stylist | null;
}

const StickyFooter = ({ totalPrice, totalTime, itemCount, stylist }: StickyFooterProps) => {
  const navigate = useNavigate();

  const handleNext = () => {
    if (itemCount > 0) {
      navigate('/booking/datetime', {
        state: { totalPrice, totalTime, itemCount, stylist }
      });
    }
  };

  return (
    <div className="bg-card/70 backdrop-blur-xl border-t border-white/20 px-5 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Left side - Price & Time */}
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground font-medium">
            {itemCount > 0 ? `${itemCount} service${itemCount > 1 ? 's' : ''}` : 'No services'}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-foreground bg-milk-tea/10 backdrop-blur-sm px-2 py-0.5 rounded-lg">
              ${totalPrice.toLocaleString()}
            </span>
            {totalTime > 0 && (
              <span className="text-sm text-muted-foreground font-medium">
                • {totalTime}m
              </span>
            )}
          </div>
        </div>
        
        {/* Right side - Action Button */}
        <button 
          onClick={handleNext}
          disabled={itemCount === 0}
          className="py-3.5 px-6 bg-milk-tea/80 hover:bg-milk-tea backdrop-blur-xl border border-white/30 disabled:bg-muted disabled:text-muted-foreground disabled:border-transparent disabled:backdrop-blur-none rounded-full font-bold text-white transition-all active:scale-[0.98] shadow-lg whitespace-nowrap disabled:cursor-not-allowed"
        >
          {itemCount > 0 ? 'Next: Date & Time' : 'Select a Service'}
        </button>
      </div>
    </div>
  );
};

export default StickyFooter;
