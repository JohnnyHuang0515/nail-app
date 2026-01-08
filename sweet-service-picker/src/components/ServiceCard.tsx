import { ChevronRight } from "lucide-react";

interface ServiceCardProps {
  name: string;
  price: number;
  isSelected?: boolean;
  onClick?: () => void;
}

const ServiceCard = ({ name, price, isSelected, onClick }: ServiceCardProps) => {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between group ${
        isSelected 
          ? "bg-pastel-pink/20 border-pastel-pink shadow-soft" 
          : "bg-card border-border hover:border-milk-tea hover:shadow-soft"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          isSelected ? "bg-pastel-pink" : "bg-muted"
        }`}>
          <span className="text-xl">💅</span>
        </div>
        <div className="text-left">
          <h3 className="font-semibold text-foreground">{name}</h3>
          <p className="text-pastel-pink-hover font-bold">${price.toLocaleString()}</p>
        </div>
      </div>
      <ChevronRight className={`w-5 h-5 transition-transform ${
        isSelected 
          ? "text-pastel-pink-hover" 
          : "text-muted-foreground group-hover:translate-x-1"
      }`} />
    </button>
  );
};

export default ServiceCard;
