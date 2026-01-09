import { useState } from "react";
import { ChevronLeft, Clock, Pencil, Plus, Settings, X, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileFrame from "@/components/MobileFrame";
import { cn } from "@/lib/utils";
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  category: string;
}

const initialCategories = ["手部", "足部", "保養", "加購"];

const initialServices: Service[] = [
  { id: "1", name: "經典手部單色", duration: 45, price: 500, category: "手部" },
  { id: "2", name: "凝膠手部單色", duration: 60, price: 800, category: "手部" },
  { id: "3", name: "造型設計 (單指)", duration: 15, price: 150, category: "手部" },
  { id: "4", name: "水晶指甲延甲", duration: 120, price: 1500, category: "手部" },
  { id: "5", name: "經典足部單色", duration: 60, price: 700, category: "足部" },
  { id: "6", name: "凝膠足部單色", duration: 75, price: 900, category: "足部" },
  { id: "7", name: "深層足部保養", duration: 90, price: 1200, category: "足部" },
  { id: "8", name: "卸甲", duration: 20, price: 300, category: "保養" },
  { id: "9", name: "指甲修補", duration: 15, price: 200, category: "保養" },
  { id: "10", name: "甘皮處理", duration: 20, price: 250, category: "保養" },
  { id: "11", name: "手部按摩", duration: 15, price: 200, category: "加購" },
  { id: "12", name: "蜜蠟保養", duration: 20, price: 350, category: "加購" },
  { id: "13", name: "鏡面粉/極光粉", duration: 30, price: 400, category: "加購" },
];

const ServiceItem = ({
  service,
  onEdit,
}: {
  service: Service;
  onEdit: (service: Service) => void;
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-card rounded-2xl shadow-soft">
      <div className="flex-1">
        <p className="font-semibold text-foreground">{service.name}</p>
        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span>{service.duration} 分鐘</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-bold text-primary text-lg">
          ${service.price.toLocaleString()}
        </span>
        <button
          onClick={() => onEdit(service)}
          className="p-2 rounded-full hover:bg-muted transition-colors"
          aria-label="Edit service"
        >
          <Pencil className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

const Services = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState(initialCategories);
  const [activeCategory, setActiveCategory] = useState(initialCategories[0]);
  const [services, setServices] = useState(initialServices);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form, setForm] = useState({ name: "", duration: "", price: "", category: "" });

  // Category management
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");

  const filteredServices = services.filter((s) => s.category === activeCategory);

  const handleAddNew = () => {
    setEditingService(null);
    setForm({ name: "", duration: "", price: "", category: activeCategory });
    setIsDrawerOpen(true);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setForm({
      name: service.name,
      duration: service.duration.toString(),
      price: service.price.toString(),
      category: service.category,
    });
    setIsDrawerOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.duration || !form.price || !form.category) return;

    if (editingService) {
      setServices((prev) =>
        prev.map((s) =>
          s.id === editingService.id
            ? {
              ...s,
              name: form.name.trim(),
              duration: parseInt(form.duration) || s.duration,
              price: parseInt(form.price) || s.price,
              category: form.category,
            }
            : s
        )
      );
    } else {
      const newService: Service = {
        id: Date.now().toString(),
        name: form.name.trim(),
        duration: parseInt(form.duration) || 30,
        price: parseInt(form.price) || 0,
        category: form.category,
      };
      setServices((prev) => [...prev, newService]);
    }
    setIsDrawerOpen(false);
  };

  const handleDelete = () => {
    if (!editingService) return;
    setServices((prev) => prev.filter((s) => s.id !== editingService.id));
    setIsDrawerOpen(false);
  };

  // Category handlers
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    if (categories.includes(newCategoryName.trim())) return;
    setCategories((prev) => [...prev, newCategoryName.trim()]);
    setNewCategoryName("");
  };

  const handleStartEditCategory = (cat: string) => {
    setEditingCategory(cat);
    setEditCategoryName(cat);
  };

  const handleSaveCategory = () => {
    if (!editingCategory || !editCategoryName.trim()) return;
    if (editCategoryName.trim() === editingCategory) {
      setEditingCategory(null);
      return;
    }
    // Update category name in services
    setServices((prev) =>
      prev.map((s) =>
        s.category === editingCategory
          ? { ...s, category: editCategoryName.trim() }
          : s
      )
    );
    // Update categories list
    setCategories((prev) =>
      prev.map((c) => (c === editingCategory ? editCategoryName.trim() : c))
    );
    // Update active category if needed
    if (activeCategory === editingCategory) {
      setActiveCategory(editCategoryName.trim());
    }
    setEditingCategory(null);
  };

  const handleDeleteCategory = (cat: string) => {
    // Don't delete if it has services
    const hasServices = services.some((s) => s.category === cat);
    if (hasServices) return;

    setCategories((prev) => prev.filter((c) => c !== cat));
    if (activeCategory === cat && categories.length > 1) {
      setActiveCategory(categories.find((c) => c !== cat) || categories[0]);
    }
  };

  const getCategoryServiceCount = (cat: string) => {
    return services.filter((s) => s.category === cat).length;
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
          <h1 className="text-xl font-bold text-foreground flex-1">服務價目表</h1>
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
          <button
            onClick={handleAddNew}
            className="p-2 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="px-5 pb-3">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all",
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Service List */}
        <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-2">
          {filteredServices.length > 0 ? (
            filteredServices.map((service) => (
              <ServiceItem
                key={service.id}
                service={service}
                onEdit={handleEdit}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Clock className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-sm">此分類尚無服務項目</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Service Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {editingService ? "編輯服務" : "新增服務"}
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">服務名稱</Label>
              <Input
                id="name"
                placeholder="輸入服務名稱"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">分類</Label>
              <Select
                value={form.category}
                onValueChange={(value) => setForm({ ...form, category: value })}
              >
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="選擇分類" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">時間 (分鐘)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="30"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">價格 ($)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="500"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="h-12 rounded-xl"
                />
              </div>
            </div>
          </div>
          <DrawerFooter>
            <Button
              onClick={handleSave}
              disabled={!form.name.trim() || !form.duration || !form.price || !form.category}
              className="h-12 rounded-xl"
            >
              {editingService ? "儲存變更" : "新增服務"}
            </Button>
            {editingService && (
              <Button
                onClick={handleDelete}
                variant="destructive"
                className="h-12 rounded-xl"
              >
                刪除服務
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

      {/* Category Management Modal */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="max-w-[360px] rounded-3xl">
          <DialogHeader>
            <DialogTitle>管理分類</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Add new category */}
            <div className="flex gap-2">
              <Input
                placeholder="新分類名稱"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="h-10 rounded-xl flex-1"
                onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
              />
              <Button
                onClick={handleAddCategory}
                disabled={!newCategoryName.trim()}
                size="sm"
                className="h-10 rounded-xl"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Category list */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {categories.map((cat) => {
                const count = getCategoryServiceCount(cat);
                const isEditing = editingCategory === cat;

                return (
                  <div
                    key={cat}
                    className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl"
                  >
                    {isEditing ? (
                      <Input
                        value={editCategoryName}
                        onChange={(e) => setEditCategoryName(e.target.value)}
                        className="h-8 rounded-lg flex-1 text-sm"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveCategory();
                          if (e.key === "Escape") setEditingCategory(null);
                        }}
                      />
                    ) : (
                      <span className="flex-1 font-medium text-sm">{cat}</span>
                    )}
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {count}
                    </span>
                    {isEditing ? (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={handleSaveCategory}
                        >
                          <Plus className="w-3.5 h-3.5 rotate-45" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => setEditingCategory(null)}
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => handleStartEditCategory(cat)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteCategory(cat)}
                          disabled={count > 0}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-muted-foreground text-center">
              含有服務項目的分類無法刪除
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </MobileFrame>
  );
};

export default Services;
