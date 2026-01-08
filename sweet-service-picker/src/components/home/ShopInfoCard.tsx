import { MapPin, Clock, Phone } from "lucide-react";

const ShopInfoCard = () => {
  return (
    <div className="px-5 py-4">
      <div className="bg-card border border-border rounded-3xl p-5 shadow-soft">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🏠</span>
          <h2 className="font-bold text-foreground">Shop Info</h2>
        </div>
        
        <div className="space-y-3">
          {/* Address */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-milk-tea/20 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-milk-tea-dark" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Address</p>
              <p className="text-xs text-muted-foreground">
                台北市大安區忠孝東路四段123號3樓
              </p>
            </div>
            <button className="px-3 py-1.5 bg-muted rounded-full text-xs font-medium text-muted-foreground hover:bg-border transition-colors">
              Map
            </button>
          </div>
          
          {/* Hours */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-secondary/30 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-milk-tea" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Opening Hours</p>
              <p className="text-xs text-muted-foreground">
                Mon-Sat: 10:00 - 20:00 | Sun: Closed
              </p>
            </div>
          </div>
          
          {/* Phone */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-cream flex items-center justify-center flex-shrink-0">
              <Phone className="w-4 h-4 text-foreground/60" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Contact</p>
              <p className="text-xs text-muted-foreground">
                02-1234-5678
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopInfoCard;
