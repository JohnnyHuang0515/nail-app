
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarIcon, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { adminBookingService } from "@/services/adminBooking.service";
import { scheduleService } from "@/services/schedule.service"; // Reuse for availability check if needed, or just staff list
// We need services and staff list. reusing clients service? No, need staff and service services.
// Assuming we can fetch them via simple fetch or existing services.
// Let's create a helper or use direct fetch for simplicity if services don't exist.
// Checking previous chats... staffService and serviceService might strictly exist or not.
// Let's use direct API calls for dropdowns to be safe and fast.

interface Staff {
    id: string;
    displayName: string;
    role: string;
}

interface Service {
    id: string;
    name: string;
    durationMinutes: number;
    price: number;
    category: string;
}

interface CreateBookingModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateBookingModal({ open, onOpenChange }: CreateBookingModalProps) {
    const queryClient = useQueryClient();
    const [step, setStep] = useState<1 | 2>(1); // 1: Info, 2: Date/Time? Or single page form.
    // Single page form is better for Admin "Quick Add".

    // Form State
    const [customerPhone, setCustomerPhone] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [stylistId, setStylistId] = useState("");
    const [serviceId, setServiceId] = useState("");
    const [date, setDate] = useState<Date>();
    const [time, setTime] = useState("");
    const [notes, setNotes] = useState("");

    // Fetch Staff
    const { data: staffList = [] } = useQuery<Staff[]>({
        queryKey: ["staff-list"],
        queryFn: async () => {
            const res = await fetch("/api/staff?activeOnly=true");
            if (!res.ok) throw new Error("請求失敗");
            return res.json();
        }
    });

    // Fetch Services
    const { data: serviceList = [] } = useQuery<Service[]>({
        queryKey: ["service-list"],
        queryFn: async () => {
            const res = await fetch("/api/services?activeOnly=true");
            if (!res.ok) throw new Error("請求失敗");
            return res.json();
        }
    });

    // Generate Time Slots (Simple 30m intervals 10:00 - 20:00)
    const timeSlots = [];
    for (let i = 10; i <= 20; i++) {
        timeSlots.push(`${i.toString().padStart(2, '0')}:00`);
        if (i !== 20) timeSlots.push(`${i.toString().padStart(2, '0')}:30`);
    }

    const mutation = useMutation({
        mutationFn: adminBookingService.create,
        onSuccess: () => {
            toast.success("預約建立成功");
            queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
            onOpenChange(false);
            resetForm();
        },
        onError: (error: Error) => {
            toast.error(`建立失敗: ${error.message}`);
        }
    });

    const resetForm = () => {
        setCustomerPhone("");
        setCustomerName("");
        setStylistId("");
        setServiceId("");
        setDate(undefined);
        setTime("");
        setNotes("");
    };

    const handleSubmit = () => {
        if (!customerPhone || !customerName || !stylistId || !serviceId || !date || !time) {
            toast.error("請填寫所有必填欄位");
            return;
        }

        // Combine date and time
        // date is Date object (00:00:00 local usually or UTC? DatePicker usually gives local midnight)
        // time is "HH:mm" string
        const [hours, minutes] = time.split(":").map(Number);
        const scheduledAt = new Date(date);
        scheduledAt.setHours(hours, minutes, 0, 0);

        mutation.mutate({
            customerName,
            customerPhone,
            stylistId,
            serviceIds: [serviceId],
            scheduledAt: scheduledAt.toISOString(),
            notes
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>新增預約</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">

                    {/* Customer Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">客戶電話 *</Label>
                            <Input
                                id="phone"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                placeholder="09..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">客戶姓名 *</Label>
                            <Input
                                id="name"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder="王小美"
                            />
                        </div>
                    </div>

                    {/* Stylist & Service */}
                    <div className="space-y-2">
                        <Label>設計師 *</Label>
                        <Select value={stylistId} onValueChange={setStylistId}>
                            <SelectTrigger>
                                <SelectValue placeholder="選擇設計師" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="no-preference">不指定</SelectItem>
                                {staffList.map((s) => (
                                    <SelectItem key={s.id} value={s.id}>
                                        {s.displayName} ({s.role})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>服務項目 *</Label>
                        <Select value={serviceId} onValueChange={setServiceId}>
                            <SelectTrigger>
                                <SelectValue placeholder="選擇服務" />
                            </SelectTrigger>
                            <SelectContent>
                                {serviceList.map((s) => (
                                    <SelectItem key={s.id} value={s.id}>
                                        {s.name} (${s.price}) - {s.durationMinutes}分
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* DateTime */}
                    <div className="space-y-2">
                        <Label>預約日期 *</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP", { locale: zhTW }) : <span>選擇日期</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        <Label>預約時間 *</Label>
                        <Select value={time} onValueChange={setTime}>
                            <SelectTrigger>
                                <SelectValue placeholder="選擇時間" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                                {timeSlots.map((t) => (
                                    <SelectItem key={t} value={t}>
                                        {t}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">備註</Label>
                        <Input
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="選填..."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
                    <Button onClick={handleSubmit} disabled={mutation.isPending}>
                        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        建立預約
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
