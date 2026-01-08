import { Star, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Stylist } from "@/pages/SelectStylist";

interface StylistProfileModalProps {
  stylist: Stylist | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: () => void;
}

const StylistProfileModal = ({
  stylist,
  open,
  onOpenChange,
  onSelect,
}: StylistProfileModalProps) => {
  if (!stylist) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[340px] max-h-[85vh] p-0 rounded-3xl overflow-hidden border-0">
        {/* Header with Avatar */}
        <div className="relative bg-gradient-to-b from-milk-tea/30 to-background pt-8 pb-6 px-6">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-3 right-3 p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>

          <div className="flex flex-col items-center text-center">
            <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
              <AvatarImage src={stylist.avatar} alt={stylist.name} />
              <AvatarFallback className="bg-milk-tea/20 text-foreground text-2xl">
                {stylist.name[0]}
              </AvatarFallback>
            </Avatar>

            <DialogHeader className="mt-4">
              <DialogTitle className="text-xl font-bold">
                {stylist.name}
                <span className="text-muted-foreground font-normal text-base ml-2">
                  {stylist.nameEn}
                </span>
              </DialogTitle>
            </DialogHeader>

            <p className="text-sm text-muted-foreground mt-1">{stylist.title}</p>

            {/* Rating */}
            <div className="flex items-center gap-1 mt-3">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-foreground">{stylist.rating}</span>
              <span className="text-muted-foreground text-sm">
                ({stylist.reviewCount} 評價)
              </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap justify-center gap-1.5 mt-3">
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
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 max-h-[40vh]">
          <div className="px-6 pb-6 space-y-5">
            {/* Bio */}
            <div>
              <h4 className="font-semibold text-foreground mb-2">關於我</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {stylist.bio}
              </p>
            </div>

            {/* Mini Portfolio */}
            <div>
              <h4 className="font-semibold text-foreground mb-3">作品集</h4>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                {stylist.portfolio.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`作品 ${index + 1}`}
                    className="w-20 h-20 rounded-xl object-cover flex-shrink-0 shadow-sm"
                  />
                ))}
              </div>
            </div>

            {/* Recent Reviews */}
            <div>
              <h4 className="font-semibold text-foreground mb-3">近期評價</h4>
              <div className="space-y-3">
                {stylist.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-muted/30 rounded-xl p-3"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-foreground">
                        {review.author}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star
                            key={i}
                            className="w-3 h-3 fill-amber-400 text-amber-400"
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {review.comment}
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      {review.date}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer Button */}
        <div className="p-4 border-t border-border/50">
          <Button
            onClick={() => {
              onSelect();
              onOpenChange(false);
            }}
            className="w-full bg-milk-tea hover:bg-milk-tea/90 text-white rounded-full py-6 font-bold shadow-lg"
          >
            ✨ 選擇 {stylist.name}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StylistProfileModal;
