import { useState, forwardRef } from "react";
import { Plus } from "lucide-react";
import NewBookingModal from "./NewBookingModal";

const FloatingActionButton = forwardRef<HTMLButtonElement>((_, ref) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        ref={ref}
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-24 right-8 w-14 h-14 bg-accent text-accent-foreground rounded-full shadow-fab flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 z-40"
        aria-label="Add new booking"
      >
        <Plus className="w-6 h-6" strokeWidth={2.5} />
      </button>
      <NewBookingModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
});

FloatingActionButton.displayName = "FloatingActionButton";

export default FloatingActionButton;
