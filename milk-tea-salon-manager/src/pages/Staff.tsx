import { useState } from "react";
import { ChevronLeft, Pencil, UserPlus, Users, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
import { cn } from "@/lib/utils";

interface StaffMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  isOnShift: boolean;
}

const initialStaff: StaffMember[] = [
  { id: "1", name: "Mika", role: "資深美甲師", isOnShift: true },
  { id: "2", name: "Yuki", role: "美甲師", isOnShift: true },
  { id: "3", name: "Luna", role: "實習美甲師", isOnShift: false },
  { id: "4", name: "Hana", role: "櫃檯", isOnShift: true },
  { id: "5", name: "Sakura", role: "美甲師", isOnShift: false },
];

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
    <div className="flex items-center gap-4 p-4 bg-card rounded-2xl shadow-soft">
      {/* Avatar */}
      <div
        className={`w-14 h-14 rounded-full ${avatarColors[colorIndex % avatarColors.length]} flex items-center justify-center font-bold text-lg shrink-0`}
      >
        {getInitials(staff.name)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-foreground truncate">{staff.name}</p>
        <p className="text-sm text-muted-foreground truncate">{staff.role}</p>
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
  );
};

const Staff = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"team" | "roster">("team");
  const [staffList, setStaffList] = useState(initialStaff);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [form, setForm] = useState({ name: "", role: "" });

  const handleToggleShift = (id: string) => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isOnShift: !s.isOnShift } : s))
    );
  };

  const handleAddNew = () => {
    setEditingStaff(null);
    setForm({ name: "", role: "" });
    setIsDrawerOpen(true);
  };

  const handleEdit = (staff: StaffMember) => {
    setEditingStaff(staff);
    setForm({ name: staff.name, role: staff.role });
    setIsDrawerOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.role) return;

    if (editingStaff) {
      // Update existing staff
      setStaffList((prev) =>
        prev.map((s) =>
          s.id === editingStaff.id
            ? { ...s, name: form.name.trim(), role: form.role }
            : s
        )
      );
    } else {
      // Add new staff
      const newStaff: StaffMember = {
        id: Date.now().toString(),
        name: form.name.trim(),
        role: form.role,
        isOnShift: false,
      };
      setStaffList((prev) => [...prev, newStaff]);
    }
    setIsDrawerOpen(false);
  };

  const handleDelete = () => {
    if (!editingStaff) return;
    setStaffList((prev) => prev.filter((s) => s.id !== editingStaff.id));
    setIsDrawerOpen(false);
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
          <div className="px-4 pb-4 space-y-4">
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
              <Label htmlFor="role">職位</Label>
              <Select
                value={form.role}
                onValueChange={(value) => setForm({ ...form, role: value })}
              >
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="選擇職位" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
