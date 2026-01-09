import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Calendar, User, Phone } from "lucide-react";
import { format } from "date-fns";
import MobileFrame from "@/components/MobileFrame";
import BottomNav from "@/components/BottomNav";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import BirthdayPicker from "@/components/BirthdayPicker";
import MemberLoginCard from "@/components/booking/MemberLoginCard";
import CouponSection, { Coupon } from "@/components/booking/CouponSection";
import PaymentMethodSection, { PaymentMethod } from "@/components/booking/PaymentMethodSection";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { bookingService } from "@/services/booking.service";
import { useToast } from "@/hooks/use-toast";

const BookingDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location.state || {
    totalPrice: 0,
    totalTime: 0,
    itemCount: 0,
    selectedDate: new Date().toISOString(),
    selectedTime: "10:00",
    stylist: null
  };

  // Member state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [memberPhone, setMemberPhone] = useState("");

  // Coupon state
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("line_pay");

  const [formData, setFormData] = useState({
    phone: "",
    name: "",
    gender: "" as "female" | "male" | "",
    birthday: undefined as Date | undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const subtotal = bookingData.totalPrice;
  const discount = selectedCoupon?.discount || 0;
  const finalPrice = Math.max(0, subtotal - discount);
  const depositAmount = Math.min(500, Math.floor(finalPrice * 0.3));

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: bookingService.create,
    onSuccess: (data: any) => {
      navigate('/booking/confirm', {
        state: {
          ...bookingData,
          bookingId: data.id,
          bookingRef: data.id.slice(-6).toUpperCase(), // Use last 6 chars as ref
          customerName: formData.name,
          customerPhone: formData.phone,
          customerGender: formData.gender,
          customerBirthday: formData.birthday?.toISOString(),
          coupon: selectedCoupon,
          discount,
          finalPrice,
          depositAmount,
          paymentMethod,
        }
      });
    },
    onError: (error) => {
      console.error('Booking failed:', error);
      toast({
        title: "預約失敗",
        description: "無法建立預約，請稍後再試。",
        variant: "destructive",
      });
    }
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.phone.trim()) {
      newErrors.phone = "請輸入電話號碼";
    } else if (!/^[0-9]{8,15}$/.test(formData.phone.replace(/[-\s]/g, ''))) {
      newErrors.phone = "請輸入正確的電話號碼";
    }

    if (!formData.name.trim()) {
      newErrors.name = "請輸入姓名";
    } else if (formData.name.length > 100) {
      newErrors.name = "姓名不可超過 100 字";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = (phone: string) => {
    setIsLoggedIn(true);
    setMemberPhone(phone);
    // Auto-fill phone in form
    if (!formData.phone) {
      setFormData(prev => ({ ...prev, phone }));
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setMemberPhone("");
    setSelectedCoupon(null);
  };

  const handleConfirm = () => {
    if (validateForm()) {
      // Prepare API payload
      const payload = {
        staffId: bookingData.stylist?.id || 'no-preference',
        // TODO: Pass actual service IDs from previous steps. 
        // Currently bookingData.itemCount is just a number. 
        // We need to pass service IDs from Booking page -> DateTime -> Details.
        // For now, using a mock ID if missing, but ideally we fix the flow.
        serviceIds: bookingData.serviceIds || ['mock-service-id'],
        scheduledAt: `${format(selectedDate, 'yyyy-MM-dd')}T${bookingData.selectedTime}:00Z`,
        customerName: formData.name,
        customerPhone: formData.phone,
        notes: `Gender: ${formData.gender}, Birthday: ${formData.birthday ? format(formData.birthday, 'yyyy-MM-dd') : 'N/A'}`,
      };

      createBookingMutation.mutate(payload);
    }
  };

  const selectedDate = new Date(bookingData.selectedDate);
  const stylist = bookingData.stylist;

  return (
    <MobileFrame>
      <div className="h-full flex flex-col bg-background">
        {/* Header */}
        <div className="flex-shrink-0 px-5 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-card hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-xl font-bold text-foreground">確認預約</h1>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Member Login Section */}
          <MemberLoginCard
            isLoggedIn={isLoggedIn}
            memberPhone={memberPhone}
            onLogin={handleLogin}
            onLogout={handleLogout}
          />

          {/* Booking Summary Card */}
          <div className="bg-card rounded-2xl p-4 border border-border">
            <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
              📋 預約摘要
            </h2>

            <div className="space-y-2 text-sm">
              {/* Stylist */}
              {stylist && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">美甲師</span>
                  <span className="font-medium text-foreground">
                    {stylist.id === "no-preference" ? "🎲 不指定" : `${stylist.name}`}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">日期時間</span>
                <span className="font-medium text-foreground">
                  {format(selectedDate, "M/d")} • {bookingData.selectedTime}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">服務項目</span>
                <span className="font-medium text-foreground">
                  {bookingData.itemCount} 項
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">預估時間</span>
                <span className="font-medium text-foreground">
                  約 {bookingData.totalTime} 分鐘
                </span>
              </div>
            </div>
          </div>

          {/* Coupon Section */}
          <CouponSection
            isLoggedIn={isLoggedIn}
            selectedCoupon={selectedCoupon}
            onSelectCoupon={setSelectedCoupon}
            totalPrice={subtotal}
          />

          {/* Price Breakdown */}
          <div className="bg-card rounded-2xl p-4 border border-border">
            <h3 className="font-semibold text-foreground mb-3">💰 費用明細</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">服務費用</span>
                <span className="text-foreground">${subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex items-center justify-between text-milk-tea-dark">
                  <span>優惠券折扣</span>
                  <span>-${discount}</span>
                </div>
              )}
              <div className="border-t border-border pt-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">應付總額</span>
                  <span className="text-xl font-bold text-milk-tea-dark">
                    ${finalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card rounded-2xl p-4 space-y-4 border border-border">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <User className="w-4 h-4" /> 聯絡資訊
            </h2>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                聯絡電話 *
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="tel"
                  placeholder="0912-345-678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={cn(
                    "w-full pl-12 pr-4 py-3 bg-background rounded-xl border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-milk-tea transition-all",
                    errors.phone ? "border-destructive" : "border-border"
                  )}
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone}</p>
              )}
            </div>

            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                姓名 *
              </label>
              <input
                type="text"
                placeholder="您的姓名"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={cn(
                  "w-full px-4 py-3 bg-background rounded-xl border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-milk-tea transition-all",
                  errors.name ? "border-destructive" : "border-border"
                )}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Gender Toggle */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                性別
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: "female" })}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-medium text-sm transition-all border",
                    formData.gender === "female"
                      ? "bg-milk-tea text-white border-milk-tea shadow-md"
                      : "bg-background text-foreground border-border hover:border-milk-tea"
                  )}
                >
                  👩 女
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: "male" })}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-medium text-sm transition-all border",
                    formData.gender === "male"
                      ? "bg-primary text-primary-foreground border-primary shadow-md"
                      : "bg-background text-foreground border-border hover:border-primary"
                  )}
                >
                  👨 男
                </button>
              </div>
            </div>

            {/* Birthday */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                生日
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "w-full px-4 py-3 bg-background rounded-xl border border-border text-left flex items-center gap-3 hover:border-milk-tea transition-all",
                      !formData.birthday && "text-muted-foreground/60"
                    )}
                  >
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    {formData.birthday ? format(formData.birthday, "yyyy/MM/dd") : "選擇生日"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <BirthdayPicker
                    selected={formData.birthday}
                    onSelect={(date) => setFormData({ ...formData, birthday: date })}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Payment Method Section */}
          <PaymentMethodSection
            selectedMethod={paymentMethod}
            onSelectMethod={setPaymentMethod}
            depositAmount={depositAmount}
          />
        </div>

        {/* Fixed Bottom Area */}
        <div className="flex-shrink-0">
          <div className="bg-card/70 backdrop-blur-xl border-t border-white/20 px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">訂金</span>
              <span className="text-lg font-bold text-foreground">${depositAmount}</span>
            </div>
            <button
              onClick={handleConfirm}
              disabled={createBookingMutation.isPending}
              className="w-full py-4 bg-milk-tea/80 hover:bg-milk-tea backdrop-blur-xl border border-white/30 rounded-full font-bold text-lg text-white transition-all active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createBookingMutation.isPending ? "處理中..." : (
                paymentMethod === "pay_at_store"
                  ? "✨ 確認預約"
                  : `💳 支付 $${depositAmount} 並預約`
              )}
            </button>
          </div>

          <BottomNav activeTab="booking" />
        </div>
      </div>
    </MobileFrame>
  );
};

export default BookingDetails;
