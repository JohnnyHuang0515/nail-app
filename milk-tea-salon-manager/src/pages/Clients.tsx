import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

interface Client {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  lastVisit: string;
  isNew: boolean;
  totalSpend: number;
  visitCount: number;
}

const initialClients: Client[] = [
  {
    id: "1",
    name: "Emily Chen",
    phone: "0912-345-678",
    lastVisit: "2 days ago",
    isNew: false,
    totalSpend: 4500,
    visitCount: 8,
  },
  {
    id: "2",
    name: "Sarah Lin",
    phone: "0923-456-789",
    lastVisit: "1 week ago",
    isNew: false,
    totalSpend: 2800,
    visitCount: 4,
  },
  {
    id: "3",
    name: "Jessica Wang",
    phone: "0934-567-890",
    lastVisit: "",
    isNew: true,
    totalSpend: 0,
    visitCount: 0,
  },
  {
    id: "4",
    name: "Michelle Liu",
    phone: "0945-678-901",
    lastVisit: "3 days ago",
    isNew: false,
    totalSpend: 6200,
    visitCount: 12,
  },
  {
    id: "5",
    name: "Amy Chang",
    phone: "0956-789-012",
    lastVisit: "5 days ago",
    isNew: false,
    totalSpend: 1600,
    visitCount: 2,
  },
];

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
            New
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
  const [searchQuery, setSearchQuery] = useState("");
  const [clients, setClients] = useState(initialClients);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "" });

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery)
  );

  const handleClientClick = (clientId: string) => {
    navigate(`/clients/${clientId}`);
  };

  const handleAddNew = () => {
    setForm({ name: "", phone: "" });
    setIsDrawerOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.phone.trim()) return;

    const newClient: Client = {
      id: Date.now().toString(),
      name: form.name.trim(),
      phone: form.phone.trim(),
      lastVisit: "",
      isNew: true,
      totalSpend: 0,
      visitCount: 0,
    };
    setClients((prev) => [...prev, newClient]);
    setIsDrawerOpen(false);
  };

  return (
    <MobileFrame>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3">
          <h1 className="text-xl font-bold text-foreground">Client List</h1>
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
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 h-12 bg-muted/50 border-0 rounded-full text-sm placeholder:text-muted-foreground focus-visible:ring-primary/30"
            />
          </div>
        </div>

        {/* Client List */}
        <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-2">
          {filteredClients.length > 0 ? (
            filteredClients.map((client, index) => (
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
              <p className="text-sm">No clients found</p>
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
            <DrawerTitle>Add New Client</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Client Name</Label>
              <Input
                id="name"
                placeholder="Enter client name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
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
              Add Client
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="h-12 rounded-xl">
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </MobileFrame>
  );
};

export default Clients;
