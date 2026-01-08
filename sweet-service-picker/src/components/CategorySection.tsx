import { ReactNode } from "react";

interface CategorySectionProps {
  title: string;
  icon: string;
  children: ReactNode;
}

const CategorySection = ({ title, icon, children }: CategorySectionProps) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className="text-xl">{icon}</span>
        <h2 className="font-bold text-foreground">{title}</h2>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
};

export default CategorySection;
