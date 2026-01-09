import { useState, useRef, useEffect } from "react";
import { useQuery } from '@tanstack/react-query';
import CategorySection from "./CategorySection";
import ServiceCard from "./ServiceCard";
import BottomSheet from "./BottomSheet";
import { serviceService, type Service } from "@/services/service.service";

const addOns = [
  { id: 1, name: "加厚凝膠", price: 300, time: 30 },
  { id: 2, name: "霧面封層", price: 100, time: 10 },
  { id: 3, name: "鏡面粉", price: 200, time: 15 },
  { id: 4, name: "造型指甲 (2指)", price: 250, time: 20 },
  { id: 5, name: "卸甲", price: 150, time: 15 },
];

interface BookedService {
  serviceId: string;
  name: string;
  basePrice: number;
  baseTime: number;
  selectedAddOns: number[];
}

interface ServiceListProps {
  onTotalsChange?: (totals: { totalPrice: number; totalTime: number; itemCount: number; serviceIds: string[] }) => void;
}

const ServiceList = ({ onTotalsChange }: ServiceListProps) => {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [tempAddOns, setTempAddOns] = useState<number[]>([]);
  const [bookedServices, setBookedServices] = useState<BookedService[]>([]);

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch all services
  const { data: allServices, isLoading, error } = useQuery({
    queryKey: ['services'],
    queryFn: () => serviceService.getAll(),
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => serviceService.getCategories(),
  });

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

  // Group services by category
  const servicesByCategory = allServices?.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, Service[]>) || {};

  const currentService = allServices?.find(s => s.id === selectedService);

  const handleServiceClick = (id: string) => {
    setSelectedService(id);
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

    setBookedServices(prev => {
      const existing = prev.findIndex(b => b.serviceId === currentService.id);
      const newBooking: BookedService = {
        serviceId: currentService.id,
        name: currentService.name,
        basePrice: Number(currentService.price),
        baseTime: currentService.durationMinutes,
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

  // Calculate totals
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

  // Notify parent
  useEffect(() => {
    onTotalsChange?.({
      totalPrice,
      totalTime,
      itemCount: bookedServices.length,
      serviceIds: bookedServices.map(b => b.serviceId)
    });
  }, [totalPrice, totalTime, bookedServices.length, bookedServices, onTotalsChange]);

  const isServiceBooked = (id: string) => bookedServices.some(b => b.serviceId === id);

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto px-5 py-4">
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-6 w-32 bg-muted rounded mb-3"></div>
              <div className="space-y-2">
                <div className="h-16 bg-muted rounded-2xl"></div>
                <div className="h-16 bg-muted rounded-2xl"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex items-center justify-center px-5">
        <div className="text-center">
          <p className="text-red-500 mb-4">載入服務項目失敗</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-milk-tea text-white rounded-lg"
          >
            重新載入
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Scrollable Services */}
      <div
        ref={scrollContainerRef}
        className="h-full overflow-y-auto px-5 py-4"
      >
        {categories?.map(category => {
          const servicesInCategory = servicesByCategory[category] || [];
          if (servicesInCategory.length === 0) return null;

          return (
            <div key={category} ref={el => sectionRefs.current[category] = el}>
              <CategorySection title={category} icon="💅">
                {servicesInCategory.map(service => (
                  <ServiceCard
                    key={service.id}
                    name={service.name}
                    price={Number(service.price)}
                    isSelected={isServiceBooked(service.id)}
                    onClick={() => handleServiceClick(service.id)}
                  />
                ))}
              </CategorySection>
            </div>
          );
        })}
      </div>

      {/* Bottom Sheet Modal */}
      {currentService && (
        <BottomSheet
          isOpen={isSheetOpen}
          onClose={handleCloseSheet}
          serviceName={currentService.name}
          basePrice={Number(currentService.price)}
          baseTime={currentService.durationMinutes}
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
