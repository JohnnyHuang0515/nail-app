import { useState } from "react";
import { ChevronLeft, Pencil, UserPlus, Users, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MobileFrame from "@/components/MobileFrame";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StaffRoster from "@/components/StaffRoster";
import ImageUpload from "@/components/ImageUpload";
import { cn } from "@/lib/utils";
import { adminStaffService, StaffMember } from "@/services/adminStaff.service";
import { toast } from "sonner";

// Use StaffMember type from service

const roles = ["資深美甲師", "美甲師", "實習美甲師", "櫃檯", "店長"];

const avatarColors = [
  "bg-primary/40 text-primary",
  "bg-accent/40 text-accent",
  "bg-pink-200 text-pink-600",
  "bg-purple-200 text-purple-600",
  "bg-blue-200 text-blue-600",
];

const getInitials = (name: string) => {
  return name.slice(0, 2).toUpperCase();
};

const StaffCard = ({
  staff,
  colorIndex,
  onToggleShift,
  onEdit,
}: {
  staff: StaffMember;
  colorIndex: number;
  onToggleShift: (id: string) => void;
  onEdit: (staff: StaffMember) => void;
}) => {
  return (
    <div className="flex flex-col gap-4 p-4 bg-card rounded-2xl shadow-soft">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div
          className={`w-14 h-14 rounded-full ${avatarColors[colorIndex % avatarColors.length]} flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden border border-border/50`}
        >
          {staff.avatarUrl ? (
            <img src={staff.avatarUrl} alt={staff.name} className="w-full h-full object-cover" />
          ) : (
            getInitials(staff.name)
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-foreground truncate">{staff.name}</p>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
              {staff.role || "美甲師"}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-xs font-medium ${staff.isOnShift ? "text-green-600" : "text-muted-foreground"}`}
            >
              {staff.isOnShift ? "值班中" : "休假中"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <Switch
            checked={staff.isOnShift}
            onCheckedChange={() => onToggleShift(staff.id)}
            className="data-[state=checked]:bg-green-500"
          />
          <button
            onClick={() => onEdit(staff)}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Edit staff"
          >
            <Pencil className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Admin Portfolio Preview */}
      {staff.portfolio && staff.portfolio.length > 0 && (
        <div className="pl-[4.5rem]">
          <p className="text-xs text-muted-foreground mb-1.5">作品集預覽 ({staff.portfolio.length})</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {staff.portfolio.slice(0, 4).map((img, i) => (
              <div key={i} className="w-12 h-12 rounded-lg bg-muted overflow-hidden shrink-0 border border-border/50">
                <img src={img} alt="Portfolio" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Staff = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"team" | "roster">("team");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  // Updated state to include avatarUrl and portfolio
  const [form, setForm] = useState({
    name: "",
    role: "",
    avatarUrl: "",
    portfolio: [] as string[]
  });

  // Fetch staff from API
  const { data: staffList = [], isLoading } = useQuery({
    queryKey: ['admin-staff'],
    queryFn: adminStaffService.getAll,
  });

  // Toggle shift mutation
  const toggleMutation = useMutation({
    mutationFn: adminStaffService.toggleShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-staff'] });
    },
  });

  // Create staff mutation
  const createMutation = useMutation({
    mutationFn: adminStaffService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-staff'] });
      toast.success("員工已新增");
      setIsDrawerOpen(false);
    },
    onError: () => {
      toast.error("新增失敗");
    },
  });

  // Update staff mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminStaffService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-staff'] });
      toast.success("員工已更新");
      setIsDrawerOpen(false);
    },
    onError: () => {
      toast.error("更新失敗");
    },
  });

  // Delete staff mutation
  const deleteMutation = useMutation({
    mutationFn: adminStaffService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-staff'] });
      toast.success("員工已刪除");
      setIsDrawerOpen(false);
    },
  });

  const handleToggleShift = (id: string) => {
    toggleMutation.mutate(id);
  };

  const handleAddNew = () => {
    setEditingStaff(null);
    setForm({ name: "", role: "", avatarUrl: "", portfolio: [] });
    setIsDrawerOpen(true);
  };

  const handleEdit = (staff: StaffMember) => {
    setEditingStaff(staff);
    setForm({
      name: staff.name,
      role: staff.role,
      avatarUrl: staff.avatarUrl || "",
      portfolio: staff.portfolio || []
    });
    setIsDrawerOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.role) return;

    const staffData = {
      name: form.name.trim(),
      role: form.role,
      avatarUrl: form.avatarUrl,
      portfolio: form.portfolio
    };

    if (editingStaff) {
      updateMutation.mutate({
        id: editingStaff.id,
        data: staffData,
      });
    } else {
      createMutation.mutate(staffData);
    }
  };

  const handleDelete = () => {
    if (!editingStaff) return;
    deleteMutation.mutate(editingStaff.id);
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
          <h1 className="text-xl font-bold text-foreground flex-1">員工管理</h1>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pb-4">
          <div className="flex bg-muted/50 rounded-2xl p-1">
            <button
              onClick={() => setActiveTab("team")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all",
                activeTab === "team"
                  ? "bg-card text-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Users className="w-4 h-4" />
              團隊
            </button>
            <button
              onClick={() => setActiveTab("roster")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all",
                activeTab === "roster"
                  ? "bg-card text-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <CalendarDays className="w-4 h-4" />
              每週班表
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-4">
          {activeTab === "team" ? (
            <div className="space-y-3">
              {staffList.map((staff, index) => (
                <StaffCard
                  key={staff.id}
                  staff={staff}
                  colorIndex={index}
                  onToggleShift={handleToggleShift}
                  onEdit={handleEdit}
                />
              ))}

              {/* Add New Staff Button */}
              <Button
                onClick={handleAddNew}
                variant="outline"
                className="w-full h-14 mt-4 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary font-semibold"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                新增員工
              </Button>
            </div>
          ) : (
            <StaffRoster />
          )}
        </div>
      </div>

      {/* Add/Edit Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {editingStaff ? "編輯員工" : "新增員工"}
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="name">姓名</Label>
              <Input
                id="name"
                placeholder="輸入員工姓名"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">職位 ({form.role || "未設定"})</Label>
              <Select
                value={form.role}
                onValueChange={(value) => setForm({ ...form, role: value })}
              >
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="選擇職位" />
                </SelectTrigger>
                <SelectContent>
                  {/* Ensure unique roles by adding current role if custom */}
                  {Array.from(new Set([...roles, form.role].filter(Boolean))).map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>大頭貼照</Label>
              <ImageUpload
                type="avatar"
                currentImage={form.avatarUrl}
                onUpload={(url) => setForm({ ...form, avatarUrl: url as string })}
              />
            </div>

            <div className="space-y-2">
              <Label>作品集</Label>
              <ImageUpload
                type="portfolio"
                multiple
                currentImage={form.portfolio}
                onUpload={(urls) => setForm({ ...form, portfolio: urls as string[] })}
              />
            </div>
          </div>
          <DrawerFooter>
            <Button
              onClick={handleSave}
              disabled={!form.name.trim() || !form.role}
              className="h-12 rounded-xl"
            >
              {editingStaff ? "儲存變更" : "新增員工"}
            </Button>
            {editingStaff && (
              <Button
                onClick={handleDelete}
                variant="destructive"
                className="h-12 rounded-xl"
              >
                刪除員工
              </Button>
            )}
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
export default Staff;
