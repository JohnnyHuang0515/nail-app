import { useState } from "react";
import { ChevronLeft, Plus, Ticket, Send, Pause, Play, Pencil, Trash2, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileFrame from "@/components/MobileFrame";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { toast } from "@/hooks/use-toast";

interface Coupon {
  id: string;
  title: string;
  discount: string;
  expiry: string;
  isActive: boolean;
  usedCount: number;
}

const initialCoupons: Coupon[] = [
  { id: "1", title: "New Member", discount: "10% Off", expiry: "Dec 31, 2024", isActive: true, usedCount: 45 },
  { id: "2", title: "Holiday Special", discount: "$100 Off", expiry: "Jan 15, 2025", isActive: true, usedCount: 23 },
  { id: "3", title: "Refer a Friend", discount: "15% Off", expiry: "Feb 28, 2025", isActive: false, usedCount: 12 },
  { id: "4", title: "Birthday Treat", discount: "20% Off", expiry: "Ongoing", isActive: true, usedCount: 89 },
];

const CouponCard = ({
  coupon,
  onToggle,
  onEdit,
  onDelete,
}: {
  coupon: Coupon;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  return (
    <div className="relative bg-card rounded-2xl shadow-soft overflow-hidden">
      {/* Ticket notches */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-background rounded-r-full" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-background rounded-l-full" />
      
      {/* Dashed line */}
      <div className="absolute left-6 right-6 top-1/2 border-t-2 border-dashed border-muted-foreground/20" />

      <div className="p-4 pl-6 pr-6">
        {/* Top section */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Ticket className="w-4 h-4 text-accent" />
              <span className="font-semibold text-foreground">{coupon.title}</span>
            </div>
            <p className="text-2xl font-bold text-primary">{coupon.discount}</p>
          </div>
          <Badge
            className={cn(
              "text-xs",
              coupon.isActive
                ? "bg-green-100 text-green-700 hover:bg-green-100"
                : "bg-muted text-muted-foreground hover:bg-muted"
            )}
          >
            {coupon.isActive ? "Active" : "Paused"}
          </Badge>
        </div>

        {/* Bottom section */}
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            <p>Expiry: {coupon.expiry}</p>
            <p className="text-xs mt-0.5">{coupon.usedCount} times used</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onToggle}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              {coupon.isActive ? (
                <Pause className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Play className="w-4 h-4 text-green-600" />
              )}
            </button>
            <button
              onClick={onEdit}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <Pencil className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 rounded-full hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Coupons = () => {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState(initialCoupons);
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [form, setForm] = useState({ title: "", discount: "", expiry: "" });

  const handleToggle = (id: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
  };

  const handleAddNew = () => {
    setEditingCoupon(null);
    setForm({ title: "", discount: "", expiry: "" });
    setIsDrawerOpen(true);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setForm({ title: coupon.title, discount: coupon.discount, expiry: coupon.expiry });
    setIsDrawerOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.discount.trim() || !form.expiry.trim()) return;

    if (editingCoupon) {
      setCoupons((prev) =>
        prev.map((c) =>
          c.id === editingCoupon.id
            ? { ...c, title: form.title.trim(), discount: form.discount.trim(), expiry: form.expiry.trim() }
            : c
        )
      );
    } else {
      const newCoupon: Coupon = {
        id: Date.now().toString(),
        title: form.title.trim(),
        discount: form.discount.trim(),
        expiry: form.expiry.trim(),
        isActive: true,
        usedCount: 0,
      };
      setCoupons((prev) => [...prev, newCoupon]);
    }
    setIsDrawerOpen(false);
  };

  const handleDelete = (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSendBroadcast = () => {
    if (!broadcastMessage.trim()) return;
    toast({
      title: "Broadcast Sent",
      description: "Your message has been sent to all LINE followers.",
    });
    setBroadcastMessage("");
  };

  return (
    <MobileFrame>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4">
          <button
            onClick={() => navigate("/menu")}
            className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground flex-1">Coupons & Marketing</h1>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-4">
          {/* Create Campaign Button */}
          <Button
            onClick={handleAddNew}
            className="w-full h-12 rounded-2xl bg-accent hover:bg-accent/90"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Campaign
          </Button>

          {/* Coupons Section */}
          <div>
            <h2 className="font-semibold text-sm text-muted-foreground mb-3">
              Active Campaigns ({coupons.filter((c) => c.isActive).length})
            </h2>
            <div className="space-y-3">
              {coupons.map((coupon) => (
                <CouponCard
                  key={coupon.id}
                  coupon={coupon}
                  onToggle={() => handleToggle(coupon.id)}
                  onEdit={() => handleEdit(coupon)}
                  onDelete={() => handleDelete(coupon.id)}
                />
              ))}
            </div>
          </div>

          {/* Broadcast Message Section */}
          <div className="bg-card rounded-2xl p-4 shadow-soft">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-accent" />
              <h2 className="font-semibold text-sm">Broadcast to LINE Followers</h2>
            </div>
            <Textarea
              placeholder="Type your message here..."
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              className="min-h-[100px] rounded-xl border-muted resize-none mb-3"
            />
            <Button
              onClick={handleSendBroadcast}
              disabled={!broadcastMessage.trim()}
              variant="outline"
              className="w-full h-10 rounded-xl"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Broadcast
            </Button>
          </div>
        </div>
      </div>

      {/* Add/Edit Coupon Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {editingCoupon ? "Edit Campaign" : "Create Campaign"}
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Campaign Title</Label>
              <Input
                id="title"
                placeholder="e.g., New Member"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount">Discount</Label>
              <Input
                id="discount"
                placeholder="e.g., 10% Off or $100 Off"
                value={form.discount}
                onChange={(e) => setForm({ ...form, discount: e.target.value })}
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input
                id="expiry"
                placeholder="e.g., Dec 31, 2024"
                value={form.expiry}
                onChange={(e) => setForm({ ...form, expiry: e.target.value })}
                className="h-12 rounded-xl"
              />
            </div>
          </div>
          <DrawerFooter>
            <Button
              onClick={handleSave}
              disabled={!form.title.trim() || !form.discount.trim() || !form.expiry.trim()}
              className="h-12 rounded-xl"
            >
              {editingCoupon ? "Save Changes" : "Create Campaign"}
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

export default Coupons;
