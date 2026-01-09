import { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { serviceService } from "@/services/service.service";

const CategoryTabs = () => {
  const [activeCategory, setActiveCategory] = useState<string>("");

  // Fetch categories from API
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => serviceService.getCategories(),
  });

  // Set first category as active when data loads
  useState(() => {
    if (categories && categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  });

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    // Dispatch custom event for ServiceList to handle scroll
    window.dispatchEvent(new CustomEvent('scrollToCategory', { detail: categoryId }));
  };

  if (isLoading) {
    return (
      <div className="px-5 py-3 bg-cream border-b border-border flex-shrink-0">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-8 w-24 bg-muted rounded-full animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 py-3 bg-cream border-b border-border flex-shrink-0">
      <div
        className="flex gap-2 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories?.map(category => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className={`
              flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all
              ${activeCategory === category
                ? 'bg-milk-tea text-white shadow-soft'
                : 'bg-card border border-border text-muted-foreground hover:border-milk-tea/50'
              }
            `}
          >
            <span>💅</span>
            <span>{category}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryTabs;
