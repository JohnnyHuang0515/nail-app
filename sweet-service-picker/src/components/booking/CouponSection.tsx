import { ChevronRight, Ticket, X, Check } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useMobileFrameContainer } from "@/components/MobileFrame";

export interface Coupon {
  id: string;
  name: string;
  description: string;
  discount: number;
  minSpend: number;
  expiresAt: string;
  type: "birthday" | "welcome" | "reward";
}

interface CouponSectionProps {
  isLoggedIn: boolean;
  selectedCoupon: Coupon | null;
  onSelectCoupon: (coupon: Coupon | null) => void;
  totalPrice: number;
}

const availableCoupons: Coupon[] = [
  {
    id: "1",
    name: "🎂 生日優惠",
    description: "生日當月專屬折扣",
    discount: 100,
    minSpend: 500,
    expiresAt: "2024-12-31",
    type: "birthday",
  },
  {
    id: "2",
    name: "🎁 新會員禮",
    description: "首次預約享優惠",
    discount: 50,
    minSpend: 300,
    expiresAt: "2024-12-31",
    type: "welcome",
  },
  {
    id: "3",
    name: "⭐ 點數兌換",
    description: "累積點數兌換折扣",
    discount: 80,
    minSpend: 400,
    expiresAt: "2024-12-31",
    type: "reward",
  },
];

const CouponSection = ({ isLoggedIn, selectedCoupon, onSelectCoupon, totalPrice }: CouponSectionProps) => {
  const eligibleCoupons = availableCoupons.filter(c => totalPrice >= c.minSpend);
  const container = useMobileFrameContainer();

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button 
          className="w-full flex items-center justify-between p-4 bg-card rounded-2xl border border-border hover:border-milk-tea/50 transition-colors"
          disabled={!isLoggedIn}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Ticket className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-left">
              <p className="font-medium text-foreground">
                {selectedCoupon ? selectedCoupon.name : "使用優惠券"}
              </p>
              <p className="text-xs text-muted-foreground">
                {!isLoggedIn 
                  ? "請先登入會員" 
                  : selectedCoupon 
                    ? `已折 $${selectedCoupon.discount}` 
                    : `${eligibleCoupons.length} 張可用`
                }
              </p>
            </div>
          </div>
          {selectedCoupon ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectCoupon(null);
              }}
              className="p-1.5 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          ) : (
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
      </DrawerTrigger>

      <DrawerContent container={container} className="rounded-t-3xl px-5 pb-8">
        <DrawerHeader className="pb-4">
          <DrawerTitle className="text-xl">選擇優惠券</DrawerTitle>
        </DrawerHeader>

        {!isLoggedIn ? (
          <div className="text-center py-8 text-muted-foreground">
            <Ticket className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>請先登入會員以使用優惠券</p>
          </div>
        ) : eligibleCoupons.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Ticket className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>目前沒有符合條件的優惠券</p>
          </div>
        ) : (
          <div className="space-y-3">
            {eligibleCoupons.map((coupon) => {
              const isSelected = selectedCoupon?.id === coupon.id;
              return (
                <button
                  key={coupon.id}
                  onClick={() => onSelectCoupon(isSelected ? null : coupon)}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                    isSelected 
                      ? "border-milk-tea bg-milk-tea/10" 
                      : "border-border bg-card hover:border-milk-tea/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{coupon.name}</p>
                      <p className="text-sm text-muted-foreground">{coupon.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        滿 ${coupon.minSpend} 可用 • 有效期至 {coupon.expiresAt}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-milk-tea-dark">
                        -${coupon.discount}
                      </span>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-milk-tea flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default CouponSection;
