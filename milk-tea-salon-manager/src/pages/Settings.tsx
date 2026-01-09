import { useState } from "react";
import { ChevronLeft, Store, Clock, Link2, Bell, Globe, Check, Copy, QrCode, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileFrame from "@/components/MobileFrame";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ... (imports remain the same)

interface BusinessHour {
  day: string;
  isOpen: boolean;
  open: string;
  close: string;
}

const initialBusinessHours: BusinessHour[] = [
  { day: "週一", isOpen: true, open: "10:00", close: "20:00" },
  { day: "週二", isOpen: true, open: "10:00", close: "20:00" },
  { day: "週三", isOpen: true, open: "10:00", close: "20:00" },
  { day: "週四", isOpen: true, open: "10:00", close: "20:00" },
  { day: "週五", isOpen: true, open: "10:00", close: "21:00" },
  { day: "週六", isOpen: true, open: "09:00", close: "21:00" },
  { day: "週日", isOpen: false, open: "10:00", close: "18:00" },
];

const timeOptions = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00",
  "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"
];

const BOOKING_URL = "liff.line.me/1234567890-abcdefgh";

const Settings = () => {
  const navigate = useNavigate();
  const [showQRModal, setShowQRModal] = useState(false);

  // Shop Profile
  const [shopName, setShopName] = useState("Milk Tea Nails");
  const [address, setAddress] = useState("123 Beauty Street, Taipei");
  const [phone, setPhone] = useState("02-1234-5678");

  // Business Hours
  const [businessHours, setBusinessHours] = useState(initialBusinessHours);

  // App Settings
  const [notifications, setNotifications] = useState({
    bookingReminder: true,
    newBooking: true,
    lowStock: true,
    marketing: false,
  });
  const [language, setLanguage] = useState("zh-TW");

  const handleBusinessHourChange = (index: number, field: keyof BusinessHour, value: string | boolean) => {
    setBusinessHours((prev) =>
      prev.map((h, i) => (i === index ? { ...h, [field]: value } : h))
    );
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://${BOOKING_URL}`);
      toast.success("連結已複製！");
    } catch (err) {
      toast.error("複製失敗");
    }
  };

  return (
    <MobileFrame>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4">
          <button
            onClick={() => navigate("/menu")}
            className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">設定</h1>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-4">
          {/* Online Booking Link Card */}
          <div className="bg-gradient-to-br from-primary/20 via-accent/20 to-primary/10 rounded-xl p-4 border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Link2 className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-sm text-foreground">您的預約連結</h2>
            </div>

            {/* URL Display */}
            <div className="flex items-center gap-2 p-3 bg-background/80 rounded-lg mb-3">
              <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
              <p className="text-sm text-foreground font-mono truncate flex-1">
                {BOOKING_URL}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="sm"
                className="flex-1 h-10 rounded-xl gap-2 bg-background"
              >
                <Copy className="w-4 h-4" />
                複製連結
              </Button>
              <Button
                onClick={() => setShowQRModal(true)}
                variant="outline"
                size="sm"
                className="flex-1 h-10 rounded-xl gap-2 bg-background"
              >
                <QrCode className="w-4 h-4" />
                顯示 QR Code
              </Button>
            </div>
          </div>

          {/* Shop Profile Section */}
          <div className="bg-card rounded-xl p-4 shadow-soft">
            <div className="flex items-center gap-2 mb-4">
              <Store className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-sm">店家資料</h2>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="shopName" className="text-xs text-muted-foreground">店家名稱</Label>
                <Input
                  id="shopName"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="h-10 rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="address" className="text-xs text-muted-foreground">地址</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="h-10 rounded-lg"
                />
              </div>
              <div className="space-y-1">
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
          <div className="bg-card rounded-xl p-4 shadow-soft">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-sm">營業時間</h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="hours" className="border-0">
                <AccordionTrigger className="py-2 text-sm text-muted-foreground hover:no-underline">
                  檢視 / 編輯時間
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pt-2">
                    {businessHours.map((hour, index) => (
                      <div key={hour.day} className="flex items-center gap-2">
                        <div className="w-16 text-xs font-medium text-foreground">
                          {hour.day}
                        </div>
                        <Switch
                          checked={hour.isOpen}
                          onCheckedChange={(checked) => handleBusinessHourChange(index, "isOpen", checked)}
                          className="scale-75 data-[state=checked]:bg-green-500"
                        />
                        {hour.isOpen ? (
                          <div className="flex items-center gap-1 flex-1">
                            <Select
                              value={hour.open}
                              onValueChange={(v) => handleBusinessHourChange(index, "open", v)}
                            >
                              <SelectTrigger className="h-7 text-xs rounded-md flex-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {timeOptions.map((t) => (
                                  <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <span className="text-xs text-muted-foreground">-</span>
                            <Select
                              value={hour.close}
                              onValueChange={(v) => handleBusinessHourChange(index, "close", v)}
                            >
                              <SelectTrigger className="h-7 text-xs rounded-md flex-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {timeOptions.map((t) => (
                                  <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">休息</span>
                        )}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Integration Status */}
          <div className="bg-card rounded-xl p-4 shadow-soft">
            <div className="flex items-center gap-2 mb-3">
              <Link2 className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-sm">串接設定</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">L</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">LINE Login</p>
                    <p className="text-xs text-muted-foreground">社群登入已啟用</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                  <Check className="w-3 h-3 mr-1" />
                  已連線
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">$</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">金流串接</p>
                    <p className="text-xs text-muted-foreground">LINE Pay / 信用卡</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                  <Check className="w-3 h-3 mr-1" />
                  已連線
                </Badge>
              </div>
            </div>
          </div>

          {/* App Settings */}
          <div className="bg-card rounded-xl p-4 shadow-soft">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-sm">通知設定</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">預約提醒</span>
                <Switch
                  checked={notifications.bookingReminder}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, bookingReminder: checked })}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">新預約通知</span>
                <Switch
                  checked={notifications.newBooking}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, newBooking: checked })}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">庫存不足提醒</span>
                <Switch
                  checked={notifications.lowStock}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, lowStock: checked })}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">行銷訊息</span>
                <Switch
                  checked={notifications.marketing}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, marketing: checked })}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            </div>
          </div>

          {/* Language */}
          <div className="bg-card rounded-xl p-4 shadow-soft">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-sm">語言設定</h2>
            </div>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="h-10 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zh-TW">繁體中文</SelectItem>
                <SelectItem value="zh-CN">简体中文</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ja">日本語</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="max-w-[320px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-center">預約 QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            {/* Placeholder QR Code */}
            <div className="w-48 h-48 bg-white rounded-xl border-2 border-border flex items-center justify-center mb-4">
              <div className="grid grid-cols-5 gap-1">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-sm ${Math.random() > 0.4 ? "bg-foreground" : "bg-transparent"
                      }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center mb-4">
              掃描此 QR Code 進行預約
            </p>
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="w-full h-10 rounded-xl gap-2"
            >
              <Copy className="w-4 h-4" />
              複製連結
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MobileFrame>
  );
};

export default Settings;
