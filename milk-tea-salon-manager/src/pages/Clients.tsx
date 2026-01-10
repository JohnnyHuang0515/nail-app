import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Phone, ChevronRight } from "lucide-react";
import MobileFrame from "@/components/MobileFrame";
import BottomNavBar from "@/components/BottomNavBar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { clientService, Client } from "@/services/clients.service";
import { toast } from "sonner";

// Use Client type from service
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

const avatarColors = [
  "bg-primary/30 text-primary",
  "bg-accent/30 text-accent",
  "bg-secondary text-secondary-foreground",
  "bg-muted text-muted-foreground",
];

// ... (Client interface and initialClients remain similar, but maybe we could localize lastVisit formats later or use date-fns. For now keep data.)

// ...

const ClientCard = ({
  client,
  colorIndex,
  onClick,
}: {
  client: Client;
  colorIndex: number;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 bg-card rounded-2xl shadow-soft hover:shadow-md transition-all duration-200 active:scale-[0.98]"
    >
      {/* Avatar */}
      <div
        className={`w-12 h-12 rounded-full ${avatarColors[colorIndex % avatarColors.length]} flex items-center justify-center font-bold text-sm`}
      >
        {getInitials(client.name)}
      </div>

      {/* Info */}
      <div className="flex-1 text-left">
        <p className="font-semibold text-foreground">{client.name}</p>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Phone className="w-3 h-3" />
          {client.phone}
        </p>
      </div>

      {/* Tag + Arrow */}
      <div className="flex items-center gap-2">
        {client.isNew ? (
          <span className="px-2 py-1 text-xs font-semibold bg-accent/20 text-accent rounded-full">
            新客
          </span>
        ) : (
          <span className="px-2 py-1 text-xs text-muted-foreground bg-muted rounded-full">
            {client.lastVisit}
          </span>
        )}
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>
    </button>
  );
};

const Clients = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "" });

  // Fetch clients from API
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients', searchQuery],
    queryFn: () => clientService.getAll(searchQuery || undefined),
  });

  // Create client mutation
  const createMutation = useMutation({
    mutationFn: clientService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success("客戶已新增");
      setIsDrawerOpen(false);
    },
    onError: () => {
      toast.error("新增失敗，請稍後再試");
    },
  });

  const handleClientClick = (clientId: string) => {
    navigate(`/clients/${clientId}`);
  };

  const handleAddNew = () => {
    setForm({ name: "", phone: "" });
    setIsDrawerOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.phone.trim()) return;
    createMutation.mutate({
      name: form.name.trim(),
      phone: form.phone.trim(),
    });
  };

  return (
    <MobileFrame>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3">
          <h1 className="text-xl font-bold text-foreground">客戶列表</h1>
          <button className="p-2 rounded-full hover:bg-muted transition-colors">
            <Search className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-5 pb-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="搜尋姓名或電話..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 h-12 bg-muted/50 border-0 rounded-full text-sm placeholder:text-muted-foreground focus-visible:ring-primary/30"
            />
          </div>
        </div>

        {/* Client List */}
        <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <span className="text-muted-foreground">載入中...</span>
            </div>
          ) : clients.length > 0 ? (
            clients.map((client, index) => (
              <ClientCard
                key={client.id}
                client={client}
                colorIndex={index}
                onClick={() => handleClientClick(client.id)}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Search className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-sm">找不到客戶</p>
            </div>
          )}
        </div>

        {/* FAB */}
        <button
          onClick={handleAddNew}
          className="fixed bottom-24 right-8 w-14 h-14 bg-accent text-accent-foreground rounded-full shadow-fab flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 z-40"
          aria-label="Add new client"
        >
          <Plus className="w-6 h-6" strokeWidth={2.5} />
        </button>

        <BottomNavBar />
      </div>

      {/* Add Client Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>新增客戶</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">客戶姓名</Label>
              <Input
                id="name"
                placeholder="輸入客戶姓名"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">電話號碼</Label>
              <Input
                id="phone"
                placeholder="0912-345-678"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="h-12 rounded-xl"
              />
            </div>
          </div>
          <DrawerFooter>
            <Button
              onClick={handleSave}
              disabled={!form.name.trim() || !form.phone.trim()}
              className="h-12 rounded-xl"
            >
              新增
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="h-12 rounded-xl">
                取消
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </MobileFrame>
  );
};

export default Clients;
