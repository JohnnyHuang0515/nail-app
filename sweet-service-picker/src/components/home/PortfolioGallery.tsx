import { Heart, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { staffService } from "@/services/staff.service";
import { useNavigate } from "react-router-dom";
import type { Stylist } from "@/pages/SelectStylist";

const PortfolioGallery = () => {
  const navigate = useNavigate();
  const [likedItems, setLikedItems] = useState<string[]>([]);

  // Fetch real staff data
  const { data: stylists, isLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: () => staffService.getAll(),
  });

  // Flatten portfolios from all stylists into a single gallery list
  const galleryItems = useMemo(() => {
    if (!stylists) return [];

    const items: { id: string; image: string; stylistName: string; stylist: Stylist }[] = [];

    stylists.forEach(stylist => {
      if (stylist.portfolio && stylist.portfolio.length > 0) {
        stylist.portfolio.forEach((img, index) => {
          items.push({
            id: `${stylist.id}-${index}`, // Unique ID for the gallery item
            image: img,
            stylistName: stylist.name,
            stylist: stylist
          });
        });
      }
    });

    // Shuffle items for a "trending" feel, or just reverse to show newest if we had timestamps (we don't, so shuffle or just flat list)
    // For now, random shuffle to make it look dynamic
    return items.sort(() => 0.5 - Math.random()).slice(0, 8); // Show max 8 items
  }, [stylists]);

  const toggleLike = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setLikedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleItemClick = (stylist: Stylist) => {
    navigate("/booking", { state: { stylist } });
  };

  if (isLoading) {
    return (
      <div className="px-5 py-8 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (galleryItems.length === 0) {
    return (
      <div className="px-5 py-8 text-center text-muted-foreground text-sm">
        {/* Fallback if no images are uploaded yet */}
        <p>尚無熱門作品</p>
        <p className="text-xs mt-1 opacity-70">美甲師上傳作品後將顯示於此</p>
      </div>
    );
  }

  return (
    <div className="px-5 py-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">💅</span>
        <h2 className="font-bold text-foreground text-lg">熱門作品 (Trending)</h2>
      </div>

      {/* Uniform Grid */}
      <div className="grid grid-cols-2 gap-3">
        {galleryItems.map((item) => (
          <div
            key={item.id}
            className="cursor-pointer"
            onClick={() => handleItemClick(item.stylist)}
          >
            <div className="relative bg-card rounded-2xl overflow-hidden border border-border shadow-soft group aspect-[4/5]">
              <img
                src={item.image}
                alt={`Work by ${item.stylistName}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Like Button */}
              <button
                onClick={(e) => toggleLike(e, item.id)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center transition-transform hover:scale-110"
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${likedItems.includes(item.id)
                    ? 'text-red-400 fill-red-400'
                    : 'text-muted-foreground'
                    }`}
                />
              </button>

              {/* Info */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-foreground/70 to-transparent">
                <p className="text-sm font-medium text-card line-clamp-1">{item.stylistName}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Heart className="w-3 h-3 text-card/80" />
                  <span className="text-xs text-card/80">
                    {item.stylist.reviewCount || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PortfolioGallery;
