import { useNavigate } from "react-router-dom";
import MobileFrame from "@/components/MobileFrame";
import { ArrowLeft, Ticket, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const MyCoupons = () => {
    const navigate = useNavigate();

    // Mock Data for now - Backend doesn't support user-coupon relation yet
    const coupons = [
        {
            id: '1',
            code: 'WELCOME2024',
            title: '新客體驗優惠',
            discount: '9折',
            validUntil: '2025-12-31',
            isActive: true
        },
        {
            id: '2',
            code: 'BDAY_GIFT',
            title: '壽星專屬好禮',
            discount: '折抵 $200',
            validUntil: '2025-12-31',
            isActive: true
        }
    ];

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success("已複製優惠碼");
    };

    return (
        <MobileFrame>
            <div className="h-full flex flex-col bg-background">
                {/* Header */}
                <div className="p-4 border-b border-border flex items-center gap-3 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-foreground" />
                    </button>
                    <h1 className="text-lg font-bold text-foreground">我的優惠券</h1>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {coupons.map(coupon => (
                        <div key={coupon.id} className="bg-card border border-border rounded-xl p-0 overflow-hidden relative shadow-sm group hover:shadow-md transition-all">
                            <div className="absolute left-0 top-0 bottom-0 w-2 bg-milk-tea"></div>
                            <div className="flex">
                                <div className="p-4 flex-1">
                                    <h3 className="font-bold text-lg text-foreground">{coupon.title}</h3>
                                    <p className="text-milk-tea-dark font-medium mt-1">{coupon.discount}</p>
                                    <p className="text-xs text-muted-foreground mt-2">有效期限：{coupon.validUntil}</p>
                                </div>
                                <div className="w-24 border-l border-dashed border-border bg-muted/20 flex flex-col items-center justify-center p-2 gap-2">
                                    <span className="font-mono text-xs font-bold text-foreground">{coupon.code}</span>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 text-xs gap-1"
                                        onClick={() => copyCode(coupon.code)}
                                    >
                                        <Copy className="w-3 h-3" />
                                        複製
                                    </Button>
                                </div>
                            </div>
                            {/* Circle punch outs */}
                            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-background border border-border"></div>
                            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-background border border-border"></div>
                        </div>
                    ))}
                </div>
            </div>
        </MobileFrame>
    );
};

export default MyCoupons;
