import { MapPin, Clock, Phone } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { settingsService } from "@/services/settings.service";
import { Skeleton } from "@/components/ui/skeleton";

const ShopInfoCard = () => {
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.getSettings(),
  });

  const address = settings?.address || "台北市大安區忠孝東路四段123號3樓";
  const phone = settings?.phone || "02-1234-5678";

  // Format business hours text (simple summary)
  const businessHoursText = settings?.businessHours
    ? (() => {
      const weekdays = settings.businessHours.filter(h => h.isOpen && h.day !== '週日' && h.day !== '週六');
      const saturday = settings.businessHours.find(h => h.day === '週六');
      const sunday = settings.businessHours.find(h => h.day === '週日');

      // Simple heuristic: if Mon-Fri are same
      const weekdayTime = weekdays[0] ? `${weekdays[0].open} - ${weekdays[0].close}` : "";
      const mapping = [];
      if (weekdays.length > 0) mapping.push(`週一至週五: ${weekdayTime}`);
      if (saturday?.isOpen) mapping.push(`週六: ${saturday.open} - ${saturday.close}`);
      if (!sunday?.isOpen) mapping.push(`週日: 公休`);

      return mapping.join(" | ") || "週一至週六: 10:00 - 20:00 | 週日: 公休";
    })()
    : "週一至週六: 10:00 - 20:00 | 週日: 公休";

  // Google Map Query URL
  const mapQuery = encodeURIComponent(address);

  if (isLoading) {
    return (
      <div className="px-5 py-4">
        <div className="bg-card border border-border rounded-3xl p-5 shadow-soft space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 py-4">
      <div className="bg-card border border-border rounded-3xl p-5 shadow-soft">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🏠</span>
          <h2 className="font-bold text-foreground">店家資訊</h2>
        </div>

        <div className="space-y-3">
          {/* Address */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-milk-tea/20 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-milk-tea-dark" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">地址</p>
              <p className="text-xs text-muted-foreground">
                {address}
              </p>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-muted rounded-full text-xs font-medium text-muted-foreground hover:bg-border transition-colors block text-center min-w-[50px] decoration-0"
            >
              地圖
            </a>
          </div>

          {/* Hours */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-secondary/30 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-milk-tea" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">營業時間</p>
              <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                {businessHoursText}
              </p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-cream flex items-center justify-center flex-shrink-0">
              <Phone className="w-4 h-4 text-foreground/60" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">聯絡電話</p>
              <p className="text-xs text-muted-foreground">
                {phone}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopInfoCard;

