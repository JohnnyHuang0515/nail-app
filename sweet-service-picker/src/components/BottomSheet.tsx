import { X, Clock, Sparkles } from "lucide-react";
import AddOnItem from "./AddOnItem";

interface AddOn {
  id: number;
  name: string;
  price: number;
}

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName: string;
  basePrice: number;
  baseTime: number;
  addOns: AddOn[];
  selectedAddOns: number[];
  onToggleAddOn: (id: number) => void;
  onConfirm: () => void;
}

const BottomSheet = ({ 
  isOpen, 
  onClose, 
  serviceName,
  basePrice,
  baseTime,
  addOns,
  selectedAddOns,
  onToggleAddOn,
  onConfirm
}: BottomSheetProps) => {
  
  const addOnsTotal = selectedAddOns.reduce((sum, id) => {
    const addOn = addOns.find(a => a.id === id);
    return sum + (addOn?.price || 0);
  }, 0);
  const totalPrice = basePrice + addOnsTotal;
  const totalTime = baseTime + (selectedAddOns.length * 10);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-foreground/30 animate-fade-in z-[200]"
        onClick={onClose}
      />
      
      {/* Sheet - centered within mobile frame */}
      <div className="fixed inset-0 z-[210] flex items-end justify-center pointer-events-none">
        <div className="w-full max-w-[430px] h-[75%] bg-card rounded-t-[32px] shadow-sheet animate-slide-up flex flex-col pointer-events-auto">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-border rounded-full" />
        </div>
        
        {/* Header */}
        <div className="px-5 pb-4 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-xl bg-pastel-pink/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-pastel-pink-hover" />
                </div>
                <h2 className="text-xl font-bold text-foreground">{serviceName}</h2>
              </div>
              
              {/* Price & Time Tag */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pastel-pink/15 text-pastel-pink-hover rounded-full text-sm font-semibold">
                  ${basePrice.toLocaleString()}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted text-muted-foreground rounded-full text-sm font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  {baseTime} mins
                </span>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-border transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          
          {/* Description */}
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            ✨ Includes cuticle care, nail shaping, and your choice of gel color. Perfect for a clean, polished look!
          </p>
        </div>
        
        {/* Scrollable Add-ons */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🎀</span>
            <h3 className="font-bold text-foreground">Select Add-ons</h3>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              Optional
            </span>
          </div>
          
          <div className="space-y-3 pb-4">
            {addOns.map(addOn => (
              <AddOnItem
                key={addOn.id}
                name={addOn.name}
                price={addOn.price}
                isSelected={selectedAddOns.includes(addOn.id)}
                onToggle={() => onToggleAddOn(addOn.id)}
              />
            ))}
          </div>
        </div>
        
        {/* Modal Footer - Real-time Total */}
        <div className="px-5 py-4 border-t border-border bg-card shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground font-medium">Total with add-ons</span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-foreground">${totalPrice.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground font-medium">• {totalTime}m</span>
              </div>
            </div>
            
            <button 
              onClick={onConfirm}
              className="py-3.5 px-6 bg-pastel-pink hover:bg-pastel-pink-hover rounded-full font-bold text-[#8B4B5C] transition-all active:scale-[0.98] shadow-soft whitespace-nowrap"
            >
              Add to Booking
            </button>
          </div>
        </div>
        </div>
      </div>
    </>
  );
};

export default BottomSheet;
