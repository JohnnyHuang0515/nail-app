import { useState } from "react";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { Search, Plus, Check, ChevronLeft, ChevronRight, Phone, Clock, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";

interface Client {
  id: string;
  name: string;
  phone: string;
}

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  category: string;
}

interface Staff {
  id: string;
  name: string;
  avatar?: string;
  color: string;
}

const recentClients: Client[] = [
  { id: "1", name: "Emily Chen", phone: "0912-345-678" },
  { id: "2", name: "Sarah Lin", phone: "0923-456-789" },
  { id: "3", name: "Jessica Wang", phone: "0934-567-890" },
  { id: "4", name: "Michelle Liu", phone: "0945-678-901" },
  { id: "5", name: "Amy Chang", phone: "0956-789-012" },
];

const services: Service[] = [
  { id: "1", name: "基礎手部保養", duration: 45, price: 500, category: "Hand" },
  { id: "2", name: "凝膠美甲單色", duration: 60, price: 800, category: "Hand" },
  { id: "3", name: "造型設計 (指)", duration: 15, price: 150, category: "Hand" },
  { id: "4", name: "水晶延甲 (全手)", duration: 120, price: 1500, category: "Hand" },
  { id: "5", name: "基礎足部保養", duration: 45, price: 600, category: "Foot" },
  { id: "6", name: "足部凝膠單色", duration: 60, price: 900, category: "Foot" },
  { id: "7", name: "深層足部護理", duration: 30, price: 400, category: "Care" },
];

const staffMembers: Staff[] = [
  { id: "1", name: "Mika", color: "bg-primary/30 text-primary" },
  { id: "2", name: "Yuki", color: "bg-pink-200 text-pink-700" },
  { id: "3", name: "Mei", color: "bg-blue-200 text-blue-700" },
  { id: "4", name: "Saki", color: "bg-purple-200 text-purple-700" },
  { id: "5", name: "Kana", color: "bg-orange-200 text-orange-700" },
];

const timeSlots = [
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
];

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

interface NewBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewBookingModal = ({ open, onOpenChange }: NewBookingModalProps) => {
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [newClientForm, setNewClientForm] = useState({ name: "", phone: "" });

  const filteredClients = recentClients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery)
  );

  const resetModal = () => {
    setStep(1);
    setSearchQuery("");
    setSelectedClient(null);
    setSelectedService(null);
    setSelectedStaff(null);
    setSelectedDate(new Date());
    setSelectedTime(null);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(resetModal, 300);
  };

  const handleConfirmBooking = () => {
    if (selectedClient && selectedService && selectedStaff && selectedTime) {
      toast({
        title: "預約建立成功！ 🎉",
        description: `${selectedClient.name} - ${selectedService.name} 指定 ${selectedStaff.name} 於 ${selectedTime}`,
      });
      handleClose();
    }
  };

  const handleAddNewClient = () => {
    if (newClientForm.name.trim() && newClientForm.phone.trim()) {
      const newClient: Client = {
        id: Date.now().toString(),
        name: newClientForm.name.trim(),
        phone: newClientForm.phone.trim(),
      };
      setSelectedClient(newClient);
      setIsAddClientOpen(false);
      setNewClientForm({ name: "", phone: "" });
      setStep(2);
    }
  };

  const canProceedToStep2 = !!selectedClient;
  const canProceedToStep3 = !!selectedService;
  const canConfirm = !!selectedStaff && !!selectedTime;

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-[400px] max-h-[85vh] rounded-3xl p-0 overflow-hidden">
          <DialogHeader className="px-5 pt-5 pb-3 border-b border-border/50">
            <div className="flex items-center gap-3">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="p-1.5 rounded-full hover:bg-muted transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <DialogTitle className="flex-1">
                {step === 1 && "選擇客戶"}
                {step === 2 && "選擇服務"}
                {step === 3 && "選擇設計師與時間"}
              </DialogTitle>
              <div className="flex gap-1.5">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      s === step ? "bg-accent" : s < step ? "bg-primary" : "bg-muted"
                    )}
                  />
                ))}
              </div>
            </div>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[60vh] px-5 py-4">
            {/* Step 1: Select Client */}
            {step === 1 && (
              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="搜尋客戶..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-11 rounded-xl bg-muted/50 border-0"
                  />
                </div>

                {/* Add New Client Button */}
                <button
                  onClick={() => setIsAddClientOpen(true)}
                  className="w-full flex items-center gap-3 p-3 border-2 border-dashed border-accent/40 rounded-2xl text-accent hover:bg-accent/5 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="font-semibold">新增客戶</span>
                </button>

                {/* Recent Clients */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    最近客戶
                  </p>
                  <div className="space-y-2">
                    {filteredClients.map((client, index) => (
                      <button
                        key={client.id}
                        onClick={() => {
                          setSelectedClient(client);
                          setStep(2);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-2xl transition-all",
                          selectedClient?.id === client.id
                            ? "bg-accent/20 ring-2 ring-accent"
                            : "bg-card hover:bg-muted/50"
                        )}
                      >
                        <div
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                            index % 2 === 0
                              ? "bg-primary/20 text-primary"
                              : "bg-accent/20 text-accent"
                          )}
                        >
                          {getInitials(client.name)}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-foreground">{client.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {client.phone}
                          </p>
                        </div>
                        {selectedClient?.id === client.id && (
                          <Check className="w-5 h-5 text-accent" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Select Service */}
            {step === 2 && (
              <div className="space-y-4">
                {/* Selected Client Summary */}
                {selectedClient && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-2xl">
                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                      {getInitials(selectedClient.name)}
                    </div>
                    <span className="font-medium text-sm">{selectedClient.name}</span>
                  </div>
                )}

                {/* Services List */}
                <div className="space-y-2">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => {
                        setSelectedService(service);
                        setStep(3);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-2xl transition-all",
                        selectedService?.id === service.id
                          ? "bg-accent/20 ring-2 ring-accent"
                          : "bg-card hover:bg-muted/50"
                      )}
                    >
                      <div className="text-left">
                        <p className="font-semibold text-foreground">{service.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {service.duration} 分鐘
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-accent">NT${service.price}</span>
                        {selectedService?.id === service.id && (
                          <Check className="w-5 h-5 text-accent" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Select Staff & Time */}
            {step === 3 && (
              <div className="space-y-5">
                {/* Summary */}
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-2xl text-sm">
                  <span className="font-medium">{selectedClient?.name}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{selectedService?.name}</span>
                </div>

                {/* Staff Selection */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    選擇設計師
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {staffMembers.map((staff) => (
                      <button
                        key={staff.id}
                        onClick={() => setSelectedStaff(staff)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all min-w-[70px]",
                          selectedStaff?.id === staff.id
                            ? "bg-accent/20 ring-2 ring-accent"
                            : "bg-card hover:bg-muted/50"
                        )}
                      >
                        <div
                          className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm",
                            staff.color
                          )}
                        >
                          {getInitials(staff.name)}
                        </div>
                        <span className="text-xs font-medium">{staff.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Selection */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    選擇日期
                  </p>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal h-11 rounded-xl"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(selectedDate, "PPP", { locale: zhTW })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Time Selection */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    選擇時間
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={cn(
                          "py-2.5 px-3 rounded-xl text-sm font-medium transition-all",
                          selectedTime === time
                            ? "bg-accent text-accent-foreground"
                            : "bg-card hover:bg-muted/50 text-foreground"
                        )}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-border/50 bg-background">
            {step === 1 && (
              <Button
                onClick={() => selectedClient && setStep(2)}
                disabled={!canProceedToStep2}
                className="w-full h-12 rounded-xl"
              >
                下一步
              </Button>
            )}
            {step === 2 && (
              <Button
                onClick={() => selectedService && setStep(3)}
                disabled={!canProceedToStep3}
                className="w-full h-12 rounded-xl"
              >
                下一步
              </Button>
            )}
            {step === 3 && (
              <Button
                onClick={handleConfirmBooking}
                disabled={!canConfirm}
                className="w-full h-12 rounded-xl"
              >
                確認預約
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add New Client Drawer */}
      <Drawer open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>新增客戶</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newClientName">客戶姓名</Label>
              <Input
                id="newClientName"
                placeholder="輸入客戶姓名"
                value={newClientForm.name}
                onChange={(e) =>
                  setNewClientForm({ ...newClientForm, name: e.target.value })
                }
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newClientPhone">電話號碼</Label>
              <Input
                id="newClientPhone"
                placeholder="0912-345-678"
                value={newClientForm.phone}
                onChange={(e) =>
                  setNewClientForm({ ...newClientForm, phone: e.target.value })
                }
                className="h-12 rounded-xl"
              />
            </div>
          </div>
          <DrawerFooter>
            <Button
              onClick={handleAddNewClient}
              disabled={!newClientForm.name.trim() || !newClientForm.phone.trim()}
              className="h-12 rounded-xl"
            >
              新增並繼續
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="h-12 rounded-xl">
                取消
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

// Also updated service names to Chinese to match local context

export default NewBookingModal;
