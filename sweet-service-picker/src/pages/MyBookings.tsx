import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileFrame from "@/components/MobileFrame";
import { ArrowLeft, Calendar, Clock, MapPin, XCircle, AlertCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";

// Define Booking Interface (subset of what API returns)
interface Booking {
    id: string;
    scheduledAt: string;
    status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
    totalPrice: number;
    stylist: {
        displayName: string;
    };
    items: {
        service: {
            name: string;
        };
    }[];
}

const MyBookings = () => {
    const navigate = useNavigate();
    const { user, accessToken } = useAuthStore();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("upcoming");

    // Fetch Bookings
    const { data: bookings = [], isLoading } = useQuery<Booking[]>({
        queryKey: ['my-bookings', user?.id],
        queryFn: async () => {
            const res = await fetch('/api/bookings/my-bookings', {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            if (!res.ok) throw new Error('Failed to fetch bookings');
            return res.json();
        },
        enabled: !!user && !!accessToken,
    });

    // Cancel Mutation
    const cancelMutation = useMutation({
        mutationFn: async (bookingId: string) => {
            const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to cancel');
            }
            return res.json();
        },
        onSuccess: () => {
            toast.success("預約已取消");
            queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
        },
        onError: (error: Error) => {
            toast.error(error.message);
        }
    });

    if (!user) {
        return (
            <MobileFrame>
                <div className="h-full flex items-center justify-center">
                    <p>請先登入</p>
                </div>
            </MobileFrame>
        )
    }

    // Filter Bookings
    const now = new Date();
    const upcomingBookings = bookings.filter(b =>
        ['PENDING', 'CONFIRMED'].includes(b.status) && new Date(b.scheduledAt) > now
    );

    const historyBookings = bookings.filter(b =>
        ['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(b.status) ||
        (['PENDING', 'CONFIRMED'].includes(b.status) && new Date(b.scheduledAt) <= now)
    );

    const BookingCard = ({ booking, isHistory }: { booking: Booking, isHistory?: boolean }) => {
        const date = new Date(booking.scheduledAt);
        const serviceNames = booking.items.map(i => i.service.name).join(" + ");

        return (
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Calendar className="w-4 h-4 text-milk-tea" />
                        {format(date, "M月d日 (EE)", { locale: zhTW })}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                            booking.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                booking.status === 'COMPLETED' ? 'bg-gray-100 text-gray-600' :
                                    'bg-yellow-100 text-yellow-700'
                        }`}>
                        {booking.status === 'CONFIRMED' ? '已確認' :
                            booking.status === 'CANCELLED' ? '已取消' :
                                booking.status === 'COMPLETED' ? '已完成' :
                                    booking.status === 'PENDING' ? '待確認' : booking.status}
                    </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {format(date, "HH:mm")}
                </div>

                <div className="pt-2 border-t border-border mt-2">
                    <h3 className="font-bold text-lg text-foreground">{booking.stylist.displayName}</h3>
                    <p className="text-sm text-muted-foreground">{serviceNames}</p>
                </div>

                <div className="flex justify-between items-center pt-2">
                    <span className="font-medium text-milk-tea-dark">NT$ {booking.totalPrice}</span>
                    {!isHistory && booking.status !== 'CANCELLED' && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:bg-red-50 hover:text-red-600 h-8 border-red-200"
                            onClick={() => {
                                if (confirm("確定要取消此預約嗎？")) {
                                    cancelMutation.mutate(booking.id);
                                }
                            }}
                            disabled={cancelMutation.isPending}
                        >
                            取消預約
                        </Button>
                    )}
                </div>
            </div>
        );
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
                    <h1 className="text-lg font-bold text-foreground">我的預約</h1>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                        <div className="px-4 pt-2">
                            <TabsList className="w-full grid grid-cols-2">
                                <TabsTrigger value="upcoming">即將到來</TabsTrigger>
                                <TabsTrigger value="history">歷史紀錄</TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 pb-20">
                            <TabsContent value="upcoming" className="space-y-4 mt-0">
                                {isLoading ? (
                                    <div className="text-center py-10 text-muted-foreground">載入中...</div>
                                ) : upcomingBookings.length > 0 ? (
                                    upcomingBookings.map(booking => (
                                        <BookingCard key={booking.id} booking={booking} />
                                    ))
                                ) : (
                                    <div className="text-center py-10 flex flex-col items-center gap-3">
                                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                                            <Calendar className="w-8 h-8 text-muted-foreground" />
                                        </div>
                                        <p className="text-muted-foreground">目前沒有即將到來的預約</p>
                                        <Button onClick={() => navigate('/')}>去預約</Button>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="history" className="space-y-4 mt-0">
                                {isLoading ? (
                                    <div className="text-center py-10 text-muted-foreground">載入中...</div>
                                ) : historyBookings.length > 0 ? (
                                    historyBookings.map(booking => (
                                        <BookingCard key={booking.id} booking={booking} isHistory={true} />
                                    ))
                                ) : (
                                    <div className="text-center py-10 text-muted-foreground">
                                        沒有歷史紀錄
                                    </div>
                                )}
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>
        </MobileFrame>
    );
};

export default MyBookings;
