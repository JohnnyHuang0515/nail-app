import { Star } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Stylist } from "@/pages/SelectStylist";

interface StylistCardProps {
  stylist: Stylist;
  onSelect: () => void;
  onViewProfile: () => void;
}

const StylistCard = ({ stylist, onSelect, onViewProfile }: StylistCardProps) => {
  return (
    <div className="bg-card rounded-2xl p-4 shadow-soft border border-border/50">
      <div className="flex items-start gap-4">
        {/* Avatar - Clickable to view profile */}
        <button
          onClick={onViewProfile}
          className="flex-shrink-0 transition-transform hover:scale-105 active:scale-95"
        >
          <Avatar className="w-20 h-20 border-2 border-milk-tea/30 shadow-md">
            <AvatarImage src={stylist.avatar} alt={stylist.name} />
            <AvatarFallback className="bg-milk-tea/20 text-foreground text-lg">
              {stylist.name[0]}
            </AvatarFallback>
          </Avatar>
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-lg text-foreground">
                {stylist.name}
                <span className="text-muted-foreground font-normal text-sm ml-1">
                  {stylist.nameEn}
                </span>
              </h3>
              <p className="text-sm text-muted-foreground">{stylist.title}</p>
            </div>

            {/* Rating Badge */}
            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                {stylist.rating}
              </span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {stylist.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs bg-milk-tea/15 text-milk-tea-dark hover:bg-milk-tea/25 border-0"
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* Portfolio Preview (New) */}
          {stylist.portfolio && stylist.portfolio.length > 0 && (
            <div className="flex gap-1.5 mt-3 overflow-hidden">
              {stylist.portfolio.slice(0, 3).map((img, i) => (
                <div key={i} className="w-12 h-12 rounded-lg bg-muted overflow-hidden shrink-0 border border-border/50">
                  <img src={img} alt="Portfolio" className="w-full h-full object-cover" />
                </div>
              ))}
              {stylist.portfolio.length > 3 && (
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground border border-border/50">
                  +{stylist.portfolio.length - 3}
                </div>
              )}
            </div>
          )}

          {/* Review count & Select button */}
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-muted-foreground">
              {stylist.reviewCount} 則評價
            </span>
            <Button
              onClick={onSelect}
              size="sm"
              className="bg-milk-tea hover:bg-milk-tea/90 text-white rounded-full px-5 shadow-sm"
            >
              選擇
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StylistCard;
