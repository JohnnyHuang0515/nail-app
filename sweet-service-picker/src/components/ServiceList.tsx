import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import CategorySection from "./CategorySection";
import ServiceCard from "./ServiceCard";
import BottomSheet from "./BottomSheet";

const services = {
  handGel: [
    { id: 1, name: "Single Color Gel", price: 1200, time: 90 },
    { id: 2, name: "French Gel Tips", price: 1500, time: 100 },
    { id: 3, name: "Gradient Ombre Gel", price: 1400, time: 95 },
  ],
  footGel: [
    { id: 4, name: "Foot Single Color", price: 1000, time: 75 },
    { id: 5, name: "Foot French Gel", price: 1300, time: 85 },
  ],
  care: [
    { id: 6, name: "Basic Manicure", price: 600, time: 45 },
    { id: 7, name: "Spa Manicure", price: 900, time: 60 },
    { id: 8, name: "Hand Paraffin Treatment", price: 500, time: 30 },
  ],
  removal: [
    { id: 9, name: "Gel Removal", price: 300, time: 30 },
    { id: 10, name: "Acrylic Removal", price: 500, time: 45 },
  ],
};

const addOns = [
  { id: 1, name: "Hard Gel Overlay", price: 300, time: 30 },
  { id: 2, name: "Matte Top Coat", price: 100, time: 10 },
  { id: 3, name: "Chrome Powder", price: 200, time: 15 },
  { id: 4, name: "Nail Art (2 nails)", price: 250, time: 20 },
  { id: 5, name: "Gel Removal", price: 150, time: 15 },
];

interface BookedService {
  serviceId: number;
  name: string;
  basePrice: number;
  baseTime: number;
  selectedAddOns: number[];
}

interface ServiceListProps {
  onTotalsChange?: (totals: { totalPrice: number; totalTime: number; itemCount: number }) => void;
}

const ServiceList = ({ onTotalsChange }: ServiceListProps) => {
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [tempAddOns, setTempAddOns] = useState<number[]>([]);
  const [bookedServices, setBookedServices] = useState<BookedService[]>([]);
  
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Listen for category change from CategoryTabs
  useEffect(() => {
    const handleScrollToCategory = (e: CustomEvent<string>) => {
      const section = sectionRefs.current[e.detail];
      if (section && scrollContainerRef.current) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    window.addEventListener('scrollToCategory', handleScrollToCategory as EventListener);
    return () => window.removeEventListener('scrollToCategory', handleScrollToCategory as EventListener);
  }, []);

  const allServices = [...services.handGel, ...services.footGel, ...services.care, ...services.removal];
  const currentService = allServices.find(s => s.id === selectedService);

  const handleServiceClick = (id: number) => {
    setSelectedService(id);
    // Check if already booked, restore add-ons
    const existing = bookedServices.find(b => b.serviceId === id);
    setTempAddOns(existing?.selectedAddOns || []);
    setIsSheetOpen(true);
  };

  const handleToggleAddOn = (id: number) => {
    setTempAddOns(prev => 
      prev.includes(id) 
        ? prev.filter(a => a !== id)
        : [...prev, id]
    );
  };

  const handleConfirmSelection = () => {
    if (!currentService) return;
    
    // Update or add to booked services
    setBookedServices(prev => {
      const existing = prev.findIndex(b => b.serviceId === currentService.id);
      const newBooking: BookedService = {
        serviceId: currentService.id,
        name: currentService.name,
        basePrice: currentService.price,
        baseTime: currentService.time,
        selectedAddOns: tempAddOns,
      };
      
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = newBooking;
        return updated;
      }
      return [...prev, newBooking];
    });
    
    setIsSheetOpen(false);
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setTempAddOns([]);
  };

  // Calculate totals from booked services
  const totalPrice = bookedServices.reduce((sum, booking) => {
    const addOnsPrice = booking.selectedAddOns.reduce((addSum, addOnId) => {
      const addOn = addOns.find(a => a.id === addOnId);
      return addSum + (addOn?.price || 0);
    }, 0);
    return sum + booking.basePrice + addOnsPrice;
  }, 0);

  const totalTime = bookedServices.reduce((sum, booking) => {
    const addOnsTime = booking.selectedAddOns.reduce((addSum, addOnId) => {
      const addOn = addOns.find(a => a.id === addOnId);
      return addSum + (addOn?.time || 0);
    }, 0);
    return sum + booking.baseTime + addOnsTime;
  }, 0);

  // Notify parent of totals change
  useEffect(() => {
    onTotalsChange?.({ totalPrice, totalTime, itemCount: bookedServices.length });
  }, [totalPrice, totalTime, bookedServices.length, onTotalsChange]);

  const isServiceBooked = (id: number) => bookedServices.some(b => b.serviceId === id);

  return (
    <>
      {/* Scrollable Services */}
      <div 
        ref={scrollContainerRef}
        className="h-full overflow-y-auto px-5 py-4"
      >
        <div ref={el => sectionRefs.current['handGel'] = el}>
          <CategorySection title="手部凝膠 Hand Gel" icon="💅">
            {services.handGel.map(service => (
              <ServiceCard
                key={service.id}
                name={service.name}
                price={service.price}
                isSelected={isServiceBooked(service.id)}
                onClick={() => handleServiceClick(service.id)}
              />
            ))}
          </CategorySection>
        </div>
        
        <div ref={el => sectionRefs.current['footGel'] = el}>
          <CategorySection title="足部凝膠 Foot Gel" icon="🦶">
            {services.footGel.map(service => (
              <ServiceCard
                key={service.id}
                name={service.name}
                price={service.price}
                isSelected={isServiceBooked(service.id)}
                onClick={() => handleServiceClick(service.id)}
              />
            ))}
          </CategorySection>
        </div>
        
        <div ref={el => sectionRefs.current['care'] = el}>
          <CategorySection title="保養護理 Care" icon="🤍">
            {services.care.map(service => (
              <ServiceCard
                key={service.id}
                name={service.name}
                price={service.price}
                isSelected={isServiceBooked(service.id)}
                onClick={() => handleServiceClick(service.id)}
              />
            ))}
          </CategorySection>
        </div>
        
        <div ref={el => sectionRefs.current['removal'] = el}>
          <CategorySection title="卸甲服務 Removal" icon="✨">
            {services.removal.map(service => (
              <ServiceCard
                key={service.id}
                name={service.name}
                price={service.price}
                isSelected={isServiceBooked(service.id)}
                onClick={() => handleServiceClick(service.id)}
              />
            ))}
          </CategorySection>
        </div>
      </div>
      
      {/* Bottom Sheet Modal */}
      {currentService && (
        <BottomSheet 
          isOpen={isSheetOpen} 
          onClose={handleCloseSheet}
          serviceName={currentService.name}
          basePrice={currentService.price}
          baseTime={currentService.time}
          addOns={addOns}
          selectedAddOns={tempAddOns}
          onToggleAddOn={handleToggleAddOn}
          onConfirm={handleConfirmSelection}
        />
      )}
    </>
  );
};

export default ServiceList;
