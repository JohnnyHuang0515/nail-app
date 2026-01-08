import { useState, useEffect } from "react";

const categories = [
  { id: "handGel", name: "手部凝膠", icon: "💅" },
  { id: "footGel", name: "足部凝膠", icon: "🦶" },
  { id: "care", name: "保養護理", icon: "🤍" },
  { id: "removal", name: "卸甲服務", icon: "✨" },
];

interface CategoryTabsProps {
  onCategoryChange?: (categoryId: string) => void;
}

const CategoryTabs = ({ onCategoryChange }: CategoryTabsProps) => {
  const [activeCategory, setActiveCategory] = useState("handGel");

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    onCategoryChange?.(categoryId);
    // Dispatch custom event for ServiceList to handle scroll
    window.dispatchEvent(new CustomEvent('scrollToCategory', { detail: categoryId }));
  };

  return (
    <div className="px-5 py-3 bg-cream border-b border-border flex-shrink-0">
      <div 
        className="flex gap-2 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={`
              flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all
              ${activeCategory === category.id 
                ? 'bg-milk-tea text-white shadow-soft' 
                : 'bg-card border border-border text-muted-foreground hover:border-milk-tea/50'
              }
            `}
          >
            <span>{category.icon}</span>
            <span>{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryTabs;
