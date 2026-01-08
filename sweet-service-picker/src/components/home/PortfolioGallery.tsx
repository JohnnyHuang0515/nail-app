import { Heart } from "lucide-react";
import { useState } from "react";

const portfolioItems = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=500&fit=crop",
    name: "Cherry Blossom",
    likes: 234,
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=400&h=350&fit=crop",
    name: "French Tips",
    likes: 189,
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400&h=400&fit=crop",
    name: "Gradient Ombre",
    likes: 312,
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=450&fit=crop",
    name: "Glitter Magic",
    likes: 156,
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1571290274554-6a2eaa771e5f?w=400&h=380&fit=crop",
    name: "Marble Art",
    likes: 278,
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=400&h=420&fit=crop",
    name: "Soft Pink",
    likes: 198,
  },
];

const PortfolioGallery = () => {
  const [likedItems, setLikedItems] = useState<number[]>([]);

  const toggleLike = (id: number) => {
    setLikedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="px-5 py-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">💅</span>
        <h2 className="font-bold text-foreground text-lg">Trending Styles</h2>
      </div>
      
      {/* Masonry Grid */}
      <div className="columns-2 gap-3 space-y-3">
        {portfolioItems.map((item, index) => (
          <div 
            key={item.id}
            className="break-inside-avoid mb-3"
          >
            <div className="relative bg-card rounded-2xl overflow-hidden border border-border shadow-soft group">
              <img 
                src={item.image} 
                alt={item.name}
                className="w-full object-cover"
                style={{ height: index % 3 === 0 ? '180px' : index % 3 === 1 ? '140px' : '160px' }}
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* Like Button */}
              <button 
                onClick={() => toggleLike(item.id)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center transition-transform hover:scale-110"
              >
                <Heart 
                  className={`w-4 h-4 transition-colors ${
                    likedItems.includes(item.id) 
                      ? 'text-red-400 fill-red-400' 
                      : 'text-muted-foreground'
                  }`} 
                />
              </button>
              
              {/* Info */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-foreground/70 to-transparent">
                <p className="text-sm font-medium text-card">{item.name}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Heart className="w-3 h-3 text-card/80" />
                  <span className="text-xs text-card/80">
                    {likedItems.includes(item.id) ? item.likes + 1 : item.likes}
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
