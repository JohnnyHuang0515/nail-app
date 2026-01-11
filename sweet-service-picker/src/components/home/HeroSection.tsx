import { useQuery } from "@tanstack/react-query";
import { settingsService } from "@/services/settings.service";

const HeroSection = () => {
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.getSettings(),
  });

  const storeName = settings?.storeName || "MIKA Studio";

  return (
    <div className="relative">
      {/* Hero Banner */}
      <div className="relative h-48 bg-gradient-to-br from-milk-tea-light/50 via-cream to-secondary/40 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-4 right-4 text-4xl opacity-60">✨</div>
        <div className="absolute bottom-8 left-6 text-3xl opacity-50">💅</div>
        <div className="absolute top-12 left-12 text-2xl opacity-40">🎀</div>

        {/* Welcome Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            歡迎來到 {storeName} ✨
          </h1>
          <p className="text-sm text-muted-foreground">
            為您打造最完美的指尖藝術 💕
          </p>
        </div>
      </div>

      {/* Announcement Bar */}
      <div className="mx-5 -mt-4 relative z-10">
        <div className="bg-card border border-milk-tea/30 rounded-2xl px-4 py-3 shadow-soft">
          <div className="flex items-center gap-2">
            <span className="text-lg">📢</span>
            <p className="text-sm text-foreground font-medium">
              夏季新色上市！立即預約體驗 🌸
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
