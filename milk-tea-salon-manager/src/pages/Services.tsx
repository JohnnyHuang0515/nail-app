import { useState, useEffect } from "react";
import { ChevronLeft, Clock, Pencil, Plus, Settings, X, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { servicesService, Service } from "@/services/services.service";
import ImageUpload from "@/components/ImageUpload";
import { toast } from "sonner";

// Use Service type from service

const ServiceItem = ({
  service,
  onEdit,
}: {
  service: Service;
  onEdit: (service: Service) => void;
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-card rounded-2xl shadow-soft">
      <div className="flex items-center gap-4 flex-1">
        {/* Service Image */}
        <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden shrink-0">
          {service.imageUrl ? (
            <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <Settings className="w-6 h-6 opacity-20" />
            </div>
          )}
        </div>

        <div>
          <p className="font-semibold text-foreground">{service.name}</p>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>{service.duration} 分鐘</span>
          </div>
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
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form, setForm] = useState({ name: "", duration: "", price: "", category: "", imageUrl: "" });

  // Category management
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");

  // Fetch services from API
  const { data: services = [], isLoading } = useQuery({
    queryKey: ['admin-services'],
    queryFn: () => servicesService.getAll(true),
  });

  // Fetch categories from API
  const { data: categories = [] } = useQuery({
    queryKey: ['admin-services-categories'],
    queryFn: servicesService.getCategories,
  });

  // Set first category as active when categories load
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: servicesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      queryClient.invalidateQueries({ queryKey: ['admin-services-categories'] });
      toast.success("服務已新增");
      setIsDrawerOpen(false);
    },
    onError: () => {
      toast.error("新增失敗");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => servicesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      toast.success("服務已更新");
      setIsDrawerOpen(false);
    },
    onError: () => {
      toast.error("更新失敗");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: servicesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      toast.success("服務已刪除");
      setIsDrawerOpen(false);
    },
  });

  const filteredServices = services.filter((s) => s.category === activeCategory);

  const handleAddNew = () => {
    setEditingService(null);
    setForm({ name: "", duration: "", price: "", category: activeCategory, imageUrl: "" });
    setIsDrawerOpen(true);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setForm({
      name: service.name,
      duration: service.duration.toString(),
      price: service.price.toString(),
      category: service.category,
      imageUrl: service.imageUrl || "",
    });
    setIsDrawerOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.duration || !form.price || !form.category) return;

    const serviceData = {
      name: form.name.trim(),
      durationMinutes: parseInt(form.duration) || 30,
      price: parseInt(form.price) || 0,
      category: form.category,
      imageUrl: form.imageUrl,
    };

    if (editingService) {
      updateMutation.mutate({ id: editingService.id, data: serviceData });
    } else {
      createMutation.mutate(serviceData);
    }
  };

  const handleDelete = () => {
    if (!editingService) return;
    deleteMutation.mutate(editingService.id);
  };

  // Category handlers - simplified since categories are derived from services in DB
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    if (categories.includes(newCategoryName.trim())) {
      toast.error("分類已存在");
      return;
    }
    // For new category, we'll just switch to it - it will appear when a service is added
    setActiveCategory(newCategoryName.trim());
    setNewCategoryName("");
    toast.info("請新增服務到此分類");
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
    // In a real implementation, we'd update all services with this category
    toast.info("分類更名功能需要後端支援");
    setEditingCategory(null);
  };

  const handleDeleteCategory = (cat: string) => {
    // Don't delete if it has services
    const hasServices = services.some((s) => s.category === cat);
    if (hasServices) {
      toast.error("無法刪除有服務的分類");
      return;
    }
    // Categories are derived from services, so we just switch away
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
              <Label>服務封面圖</Label>
              <ImageUpload
                type="service"
                currentImage={form.imageUrl}
                onUpload={(url) => setForm({ ...form, imageUrl: url as string })}
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
