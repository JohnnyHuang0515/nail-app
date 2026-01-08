import { Check } from "lucide-react";

interface AddOnItemProps {
  name: string;
  price: number;
  isSelected: boolean;
  onToggle: () => void;
}

const AddOnItem = ({ name, price, isSelected, onToggle }: AddOnItemProps) => {
  return (
    <button
      onClick={onToggle}
      className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between ${
        isSelected 
          ? "bg-pastel-pink/15 border-pastel-pink" 
          : "bg-card border-border hover:border-milk-tea"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
          isSelected 
            ? "bg-pastel-pink" 
            : "bg-muted border-2 border-border"
        }`}>
          {isSelected && <Check className="w-4 h-4 text-secondary-foreground" />}
        </div>
        <span className="font-medium text-foreground">{name}</span>
      </div>
      <span className={`font-bold ${isSelected ? "text-pastel-pink-hover" : "text-muted-foreground"}`}>
        +${price}
      </span>
    </button>
  );
};

export default AddOnItem;
