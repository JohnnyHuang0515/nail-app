import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Check, MapPin, Clock, Scissors, Calendar } from "lucide-react";
import { format } from "date-fns";
import MobileFrame from "@/components/MobileFrame";

const BookingConfirm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location.state || {
    totalPrice: 2050,
    totalTime: 120,
    itemCount: 2,
    selectedDate: new Date().toISOString(),
    selectedTime: "14:00",
    customerName: "Guest",
    customerPhone: "0912-345-678",
  };

  const [showConfetti, setShowConfetti] = useState(true);
  const [showContent, setShowContent] = useState(true);

  // Generate a random booking reference
  const bookingRef = `MK${Date.now().toString().slice(-6)}`;
  const selectedDate = new Date(bookingData.selectedDate);

  return (
    <MobileFrame>
      <div className="h-full flex flex-col bg-gradient-to-b from-milk-tea-light/30 to-background overflow-y-auto">
        {/* Success Animation Section */}
        <div className="flex-shrink-0 pt-12 pb-6 px-5 flex flex-col items-center">
          {/* Animated Checkmark Circle */}
          <div className={`relative transition-all duration-500 ${showConfetti ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
            {/* Confetti dots */}
            <div className="absolute -inset-8">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className={`absolute w-2 h-2 rounded-full animate-ping`}
                  style={{
                    top: `${50 + 40 * Math.sin(i * Math.PI / 4)}%`,
                    left: `${50 + 40 * Math.cos(i * Math.PI / 4)}%`,
                    backgroundColor: i % 2 === 0 ? 'hsl(var(--milk-tea))' : 'hsl(var(--primary))',
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '1.5s',
                  }}
                />
              ))}
            </div>
            
            {/* Main circle */}
            <div className="w-24 h-24 rounded-full bg-milk-tea flex items-center justify-center shadow-lg">
              <Check className="w-12 h-12 text-white stroke-[3]" />
            </div>
          </div>

          {/* Success Text */}
          <div className={`mt-6 text-center transition-all duration-500 delay-200 ${showConfetti ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <h1 className="text-2xl font-bold text-foreground">
              Booking Confirmed! 🎉
            </h1>
            <p className="text-muted-foreground mt-2">
              We cannot wait to see you!
            </p>
          </div>
        </div>

        {/* Ticket Card */}
        <div className={`flex-1 px-5 pb-6 transition-all duration-500 delay-300 ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="bg-card rounded-3xl overflow-hidden shadow-lg border border-border">
            {/* Ticket Header */}
            <div className="bg-milk-tea-light/30 px-5 py-4 border-b border-dashed border-milk-tea/40">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Booking Reference</p>
                  <p className="text-lg font-bold text-foreground tracking-wider">{bookingRef}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-milk-tea/30 flex items-center justify-center">
                  <span className="text-2xl">💅</span>
                </div>
              </div>
            </div>

            {/* Ticket Body */}
            <div className="px-5 py-5 space-y-4">
              {/* Date & Time */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Date & Time</p>
                  <p className="text-base font-semibold text-foreground">
                    {format(selectedDate, "EEEE, MMMM d, yyyy")}
                  </p>
                  <p className="text-sm text-muted-foreground">{bookingData.selectedTime}</p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Location</p>
                  <p className="text-base font-semibold text-foreground">MIKA Studio</p>
                  <p className="text-sm text-muted-foreground">台北市大安區忠孝東路四段123號3樓</p>
                </div>
              </div>

              {/* Service */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                  <Scissors className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Service</p>
                  <p className="text-base font-semibold text-foreground">
                    {bookingData.itemCount} Service{bookingData.itemCount > 1 ? 's' : ''} Selected
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Duration: ~{bookingData.totalTime} mins
                  </p>
                </div>
              </div>

              {/* Duration */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Customer</p>
                  <p className="text-base font-semibold text-foreground">{bookingData.customerName || "Guest"}</p>
                  <p className="text-sm text-muted-foreground">{bookingData.customerPhone}</p>
                </div>
              </div>
            </div>

            {/* Ticket Footer */}
            <div className="border-t border-dashed border-border px-5 py-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Total Amount</span>
                <span className="text-2xl font-bold text-milk-tea-dark">
                  ${bookingData.totalPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`flex-shrink-0 px-5 pb-8 space-y-3 transition-all duration-500 delay-500 ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <button 
            onClick={() => navigate('/')}
            className="w-full py-4 bg-milk-tea/80 hover:bg-milk-tea backdrop-blur-xl border border-white/30 rounded-full font-bold text-lg text-white transition-all active:scale-[0.98] shadow-lg"
          >
            Back to Home
          </button>
          
          <button 
            onClick={() => navigate('/member')}
            className="w-full py-3 bg-transparent hover:bg-muted rounded-full font-medium text-foreground transition-all"
          >
            View My Orders →
          </button>
        </div>
      </div>
    </MobileFrame>
  );
};

export default BookingConfirm;
