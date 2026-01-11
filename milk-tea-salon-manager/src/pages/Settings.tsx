import { useState, useEffect } from "react";
import { ChevronLeft, Store, Clock, Link2, Bell, Copy, QrCode, ExternalLink, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MobileFrame from "@/components/MobileFrame";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { settingsService, BusinessHour } from "@/services/settings.service";

const timeOptions = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00",
  "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"
];

const Settings = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showQRModal, setShowQRModal] = useState(false);

  // Local state for editing
  const [shopName, setShopName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [bookingUrl, setBookingUrl] = useState("");
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);
  const [notifications, setNotifications] = useState({
    lineReminder: true,
    reminderHoursBefore: 24,
  });

  // Fetch settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsService.getSettings,
  });

  // Sync local state when settings loaded
  useEffect(() => {
    if (settings) {
      setShopName(settings.storeName);
      setAddress(settings.address || "");
      setPhone(settings.phone || "");
      setBookingUrl(settings.bookingUrl);
      setBusinessHours(settings.businessHours);
      setNotifications(settings.notifications);
    }
  }, [settings]);

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: settingsService.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success("設定已儲存");
    },
    onError: () => {
      toast.error("儲存失敗");
    },
  });

  const handleSaveAll = () => {
    updateSettingsMutation.mutate({
      storeName: shopName,
      address: address,
      phone: phone,
      bookingUrl: bookingUrl,
      businessHours: businessHours,
      notifications: notifications
    });
  };

  const handleBusinessHourChange = (index: number, field: keyof BusinessHour, value: string | boolean) => {
    setBusinessHours((prev) =>
      prev.map((h, i) => (i === index ? { ...h, [field]: value } : h))
    );
  };

  const handleNotificationChange = (field: keyof typeof notifications, value: boolean | number) => {
    setNotifications(prev => ({ ...prev, [field]: value }));
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://${bookingUrl}`);
      toast.success("連結已複製！");
    } catch (err) {
      toast.error("複製失敗");
    }
  };

  if (isLoading) {
    return (
      <MobileFrame>
        <div className="flex items-center justify-center h-full">
          <span className="text-muted-foreground">載入中...</span>
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <div className="flex flex-col h-full bg-background">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50">
          <button
            onClick={() => navigate("/menu")}
            className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground flex-1">設定</h1>
          <Button size="sm" onClick={handleSaveAll} className="gap-2">
            <Save className="w-4 h-4" />
            儲存
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 pb-24">
          {/* Online Booking Link Card */}
          <div className="bg-gradient-to-br from-primary/20 via-accent/20 to-primary/10 rounded-xl p-4 border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Link2 className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-sm text-foreground">您的預約連結</h2>
            </div>

            {/* URL Display */}
            <div className="flex items-center gap-2 p-3 bg-background/60 backdrop-blur-sm rounded-lg mb-3 border border-border/50">
              <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
              <Input
                value={bookingUrl}
                onChange={(e) => setBookingUrl(e.target.value)}
                className="h-auto p-0 border-0 bg-transparent text-sm font-mono focus-visible:ring-0"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="sm"
                className="flex-1 h-9 rounded-lg gap-2 bg-background/50 hover:bg-background"
              >
                <Copy className="w-4 h-4" />
                複製連結
              </Button>
              <Button
                onClick={() => setShowQRModal(true)}
                variant="outline"
                size="sm"
                className="flex-1 h-9 rounded-lg gap-2 bg-background/50 hover:bg-background"
              >
                <QrCode className="w-4 h-4" />
                顯示 QR Code
              </Button>
            </div>
          </div>

          {/* Shop Profile Section */}
          <div className="bg-card rounded-xl p-4 shadow-sm border border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <Store className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-sm">店家資料</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shopName" className="text-xs text-muted-foreground">店家名稱</Label>
                <Input
                  id="shopName"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="h-10 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-xs text-muted-foreground">地址</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="h-10 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs text-muted-foreground">電話</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-10 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Business Hours */}
          <div className="bg-card rounded-xl p-4 shadow-sm border border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-sm">營業時間</h2>
            </div>
            <div className="space-y-3">
              {businessHours.map((hour, index) => (
                <div key={hour.day} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={hour.isOpen}
                      onCheckedChange={(checked) => handleBusinessHourChange(index, "isOpen", checked)}
                    />
                    <span className="text-sm font-medium w-10">{hour.day}</span>
                  </div>

                  {hour.isOpen ? (
                    <div className="flex items-center gap-2">
                      <Select
                        value={hour.open}
                        onValueChange={(value) => handleBusinessHourChange(index, "open", value)}
                      >
                        <SelectTrigger className="w-[85px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeOptions.map((t) => (
                            <SelectItem key={`open-${t}`} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-xs text-muted-foreground">至</span>
                      <Select
                        value={hour.close}
                        onValueChange={(value) => handleBusinessHourChange(index, "close", value)}
                      >
                        <SelectTrigger className="w-[85px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeOptions.map((t) => (
                            <SelectItem key={`close-${t}`} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground px-2">休息</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-card rounded-xl p-4 shadow-sm border border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-sm">通知設定</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">LINE 預約提醒</Label>
                  <p className="text-xs text-muted-foreground">透過 LINE 發送預約提醒給客戶</p>
                </div>
                <Switch
                  checked={notifications.lineReminder}
                  onCheckedChange={(checked) => handleNotificationChange("lineReminder", checked)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Modal */}
        <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>預約連結 QR Code</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center p-6 space-y-4">
              <div className="w-48 h-48 bg-white p-2 rounded-xl shadow-inner border">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://${bookingUrl}`}
                  alt="QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-sm text-center text-muted-foreground">
                掃描此 QR Code 即可直接進入預約頁面
              </p>
              <Button onClick={handleCopyLink} className="w-full">
                <Copy className="w-4 h-4 mr-2" />
                複製連結
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MobileFrame>
  );
};

export default Settings;
