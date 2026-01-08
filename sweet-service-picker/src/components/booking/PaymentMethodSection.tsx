import { CreditCard, Wallet, Store } from "lucide-react";
import { cn } from "@/lib/utils";

export type PaymentMethod = "line_pay" | "credit_card" | "pay_at_store";

interface PaymentMethodSectionProps {
  selectedMethod: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
  depositAmount: number;
}

const paymentMethods = [
  {
    id: "line_pay" as PaymentMethod,
    name: "LINE Pay",
    icon: Wallet,
    color: "bg-[#00B900]",
    iconColor: "text-white",
  },
  {
    id: "credit_card" as PaymentMethod,
    name: "信用卡",
    icon: CreditCard,
    color: "bg-primary",
    iconColor: "text-primary-foreground",
  },
  {
    id: "pay_at_store" as PaymentMethod,
    name: "現場付款",
    icon: Store,
    color: "bg-muted",
    iconColor: "text-foreground",
  },
];

const PaymentMethodSection = ({ selectedMethod, onSelectMethod, depositAmount }: PaymentMethodSectionProps) => {
  return (
    <div className="bg-card rounded-2xl p-4 border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">💳 支付訂金</h3>
        <span className="text-lg font-bold text-milk-tea-dark">${depositAmount}</span>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        支付訂金以確認預約，餘額於服務當天付款
      </p>

      <div className="space-y-2">
        {paymentMethods.map((method) => {
          const isSelected = selectedMethod === method.id;
          const Icon = method.icon;

          return (
            <button
              key={method.id}
              onClick={() => onSelectMethod(method.id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all",
                isSelected 
                  ? "border-milk-tea bg-milk-tea/5" 
                  : "border-border hover:border-milk-tea/50"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                method.color
              )}>
                <Icon className={cn("w-5 h-5", method.iconColor)} />
              </div>
              <span className="font-medium text-foreground">{method.name}</span>
              
              {/* Radio indicator */}
              <div className="ml-auto">
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                  isSelected 
                    ? "border-milk-tea" 
                    : "border-muted-foreground/30"
                )}>
                  {isSelected && (
                    <div className="w-2.5 h-2.5 rounded-full bg-milk-tea" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedMethod === "pay_at_store" && (
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-3 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg">
          ⚠️ 現場付款若未到店，可能影響未來預約權益
        </p>
      )}
    </div>
  );
};

export default PaymentMethodSection;
