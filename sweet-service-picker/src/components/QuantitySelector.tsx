import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
}

const QuantitySelector = ({ quantity, onDecrease, onIncrease }: QuantitySelectorProps) => {
  return (
    <div className="flex items-center gap-1 bg-muted rounded-full p-1">
      <button
        onClick={onDecrease}
        disabled={quantity <= 1}
        className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center transition-all hover:bg-pastel-pink/20 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Minus className="w-4 h-4 text-foreground" />
      </button>
      <span className="w-10 text-center font-bold text-foreground">{quantity}</span>
      <button
        onClick={onIncrease}
        className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center transition-all hover:bg-pastel-pink/20"
      >
        <Plus className="w-4 h-4 text-foreground" />
      </button>
    </div>
  );
};

export default QuantitySelector;
