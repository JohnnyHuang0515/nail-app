import { useState } from "react";
import { ChevronLeft, Calendar, Clock, User, Scissors, Filter, Check, X, AlertCircle, Phone, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MobileFrame from "@/components/MobileFrame";
import BottomNavBar from "@/components/BottomNavBar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { adminBookingService, BookingStatus, AdminBooking } from "@/services/adminBooking.service";
import { toast } from "sonner";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { zhTW } from "date-fns/locale";
import { CreateBookingModal } from "@/components/CreateBookingModal";

// Timezone for Taiwan
const TIMEZONE = "Asia/Taipei";

// ... (keep BookingCard and statusConfig as is, or use omit if possible, but replace tool needs full context if contiguous)
// To keep it simple, checking line 129 for Component start

const statusConfig: Record<BookingStatus, { label: string; color: string; bgColor: string }> = {
    PENDING: { label: "待確認", color: "text-orange-600", bgColor: "bg-orange-100" },
    CONFIRMED: { label: "已確認", color: "text-blue-600", bgColor: "bg-blue-100" },
    CHECKED_IN: { label: "已報到", color: "text-purple-600", bgColor: "bg-purple-100" },
    COMPLETED: { label: "已完成", color: "text-green-600", bgColor: "bg-green-100" },
    CANCELLED: { label: "已取消", color: "text-gray-600", bgColor: "bg-gray-100" },
    NO_SHOW: { label: "未到", color: "text-red-600", bgColor: "bg-red-100" },
};

const BookingCard = ({
    booking,
    onStatusChange,
}: {
    booking: AdminBooking;
    onStatusChange: (id: string, status: BookingStatus) => void;
}) => {
    const config = statusConfig[booking.status];
    // Convert UTC to Taiwan timezone for display
    const scheduledDate = toZonedTime(new Date(booking.scheduledAt), TIMEZONE);

    return (
        <div className="bg-card rounded-xl p-4 shadow-soft space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <p className="font-bold text-foreground">{booking.customerName}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {booking.customerPhone}
                    </p>
                </div>
                <span className={cn("px-2 py-1 rounded-full text-xs font-medium", config.bgColor, config.color)}>
                    {config.label}
                </span>
            </div>

            {/* Details */}
            <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{format(scheduledDate, "M/d (E)", { locale: zhTW })}</span>
                    <Clock className="w-4 h-4 ml-2" />
                    <span>{format(scheduledDate, "HH:mm")}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Scissors className="w-4 h-4" />
                    <span className="truncate">{booking.services}</span>
                </div>
                <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{booking.stylistName}</span>
                </div>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <span className="font-bold text-primary">${booking.totalPrice.toLocaleString()}</span>

                {/* Status Actions */}
                <div className="flex gap-2">
                    {booking.status === "PENDING" && (
                        <>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-3 text-green-600 border-green-200 hover:bg-green-50"
                                onClick={() => onStatusChange(booking.id, "CONFIRMED")}
                            >
                                <Check className="w-4 h-4 mr-1" />
                                確認
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-3 text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => onStatusChange(booking.id, "CANCELLED")}
                            >
                                <X className="w-4 h-4 mr-1" />
                                取消
                            </Button>
                        </>
                    )}
                    {booking.status === "CONFIRMED" && (
                        <>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-3 text-purple-600 border-purple-200 hover:bg-purple-50"
                                onClick={() => onStatusChange(booking.id, "CHECKED_IN")}
                            >
                                <Check className="w-4 h-4 mr-1" />
                                報到
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-3 text-orange-600 border-orange-200 hover:bg-orange-50"
                                onClick={() => onStatusChange(booking.id, "NO_SHOW")}
                            >
                                <AlertCircle className="w-4 h-4 mr-1" />
                                未到
                            </Button>
                        </>
                    )}
                    {booking.status === "CHECKED_IN" && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-3 text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => onStatusChange(booking.id, "COMPLETED")}
                        >
                            <Check className="w-4 h-4 mr-1" />
                            結帳
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

const Bookings = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Fetch bookings
    const { data: bookings = [], isLoading } = useQuery({
        queryKey: ["admin-bookings", statusFilter],
        queryFn: () => adminBookingService.getAll({ status: statusFilter !== "all" ? statusFilter : undefined }),
    });

    // Update status mutation
    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: BookingStatus }) => adminBookingService.updateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
            toast.success("狀態已更新");
        },
        onError: () => {
            toast.error("更新失敗");
        },
    });

    const handleStatusChange = (id: string, status: BookingStatus) => {
        updateStatusMutation.mutate({ id, status });
    };

    return (
        <MobileFrame>
            <div className="flex flex-col h-full bg-background">
                {/* Header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50">
                    <button
                        onClick={() => navigate("/menu")}
                        className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl font-bold flex-1">預約管理</h1>

                    <Button
                        size="sm"
                        variant="outline"
                        className="mr-2"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        新增
                    </Button>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-28 h-9 rounded-xl text-sm">
                            <Filter className="w-4 h-4 mr-1" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">全部</SelectItem>
                            <SelectItem value="PENDING">待確認</SelectItem>
                            <SelectItem value="CONFIRMED">已確認</SelectItem>
                            <SelectItem value="CHECKED_IN">已報到</SelectItem>
                            <SelectItem value="COMPLETED">已完成</SelectItem>
                            <SelectItem value="CANCELLED">已取消</SelectItem>
                            <SelectItem value="NO_SHOW">未到</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Booking List */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 pb-24">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-40">
                            <span className="text-muted-foreground">載入中...</span>
                        </div>
                    ) : bookings.length > 0 ? (
                        bookings.map((booking) => (
                            <BookingCard key={booking.id} booking={booking} onStatusChange={handleStatusChange} />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                            <Calendar className="w-10 h-10 mb-2 opacity-50" />
                            <p className="text-sm">沒有預約</p>
                        </div>
                    )}
                </div>

                <CreateBookingModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />

                <BottomNavBar />
            </div>
        </MobileFrame>
    );
};

export default Bookings;
