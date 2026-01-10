import { useState, useEffect } from "react";
import { ChevronLeft, Package, Minus, Plus, Pencil, ClipboardList, ChevronRight, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileFrame from "@/components/MobileFrame";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
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
import { inventoryService, Product } from "@/services/inventory.service";

// Keep UsageLog interface for now
interface UsageLog {
  id: string;
  productId: string;
  amount: string;
  customerName: string;
  date: string;
}

const units = ["瓶", "條", "包", "件", "盒", "ml", "g"];

const ProductItem = ({
  product,
  onTap,
}: {
  product: Product;
  onTap: (product: Product) => void;
}) => {
  const isLowStock = product.stock <= (product.minStockLevel || 3);
  const isOutOfStock = product.stock === 0;
  const isGoodStock = product.stock > (product.minStockLevel || 3) + 2;

  return (
    <button
      onClick={() => onTap(product)}
      className={cn(
        "w-full bg-card rounded-xl p-3 border transition-all text-left hover:shadow-md active:scale-[0.98]",
        isOutOfStock ? "border-destructive/30 bg-destructive/5" :
          isLowStock ? "border-amber-400/30 bg-amber-50/50" :
            "border-border"
      )}
    >
      <div className="flex items-center gap-3">
        {/* Status Dot */}
        <div className={cn(
          "w-3 h-3 rounded-full shrink-0",
          isOutOfStock ? "bg-destructive" :
            isLowStock ? "bg-amber-500" :
              isGoodStock ? "bg-green-500" :
                "bg-muted-foreground"
        )} />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-foreground truncate">{product.name}</p>
          <p className="text-xs text-muted-foreground">{product.brand}</p>
        </div>

        {/* Stock */}
        <div className="text-right shrink-0">
          <p className="font-bold text-sm text-foreground">{product.stock}</p>
          <p className="text-[10px] text-muted-foreground">{product.unit || '個'}</p>
        </div>

        {/* Badge */}
        {isOutOfStock && (
          <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-5 shrink-0">
            缺貨
          </Badge>
        )}
        {isLowStock && !isOutOfStock && (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-[9px] px-1.5 py-0 h-5 shrink-0">
            短缺
          </Badge>
        )}

        {/* Arrow */}
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
      </div>
    </button>
  );
};

const Inventory = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"consumables" | "retail">("consumables");
  const [products, setProducts] = useState<Product[]>([]);
  const [usageLogs, setUsageLogs] = useState<UsageLog[]>([]);

  // Drawer States
  const [isDetailOpen, setIsDetailOpen] = useState(false); // For Add/Edit Form
  const [isActionDrawerOpen, setIsActionDrawerOpen] = useState(false); // For View/Actions
  const [isLogDrawerOpen, setIsLogDrawerOpen] = useState(false); // For Logging Usage

  // Selection States
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null); // For View

  // Form States
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "",
    brand: "",
    category: "consumables",
    stock: 0,
    unit: "瓶"
  });
  const [logForm, setLogForm] = useState({ amount: "", customerName: "" });

  const fetchProducts = async () => {
    try {
      const data = await inventoryService.getAll();
      setProducts(data);
    } catch (error) {
      console.error(error);
      toast.error("無法載入庫存資料");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handlers
  const handleProductTap = (product: Product) => {
    setSelectedProduct(product);
    setIsActionDrawerOpen(true);
  };

  const openNewProduct = () => {
    setNewProduct({ name: "", brand: "", category: activeTab, stock: 0, unit: "瓶" });
    setIsDetailOpen(true);
  };

  const openEditProduct = () => {
    if (!selectedProduct) return;
    setNewProduct({
      name: selectedProduct.name,
      brand: selectedProduct.brand,
      category: selectedProduct.category as any,
      stock: selectedProduct.stock,
      unit: selectedProduct.unit
    });
    setIsActionDrawerOpen(false);
    setIsDetailOpen(true);
  };

  const handleSaveProduct = async () => {
    try {
      if (selectedProduct && isDetailOpen && newProduct.name === selectedProduct.name) {
        // Naive check for edit mode vs create mode if I reused modal. 
        // Actually better to have an 'isEditing' flag or check selectedProduct ID if we passed it.
        // But here 'newProduct' is just state. 
        // Let's use 'selectedProduct' existence to determine update IF we are coming from edit flow.
        // But wait, openNewProduct doesn't clear selectedProduct? I should clear it.
      }

      // Let's rely on a specific logic: if selectedProduct is set AND we clicked "Edit", strict way:
      // But simplifying:

      const isUpdate = selectedProduct && newProduct.name === selectedProduct.name; // Weak check
      // Let's fix openNewProduct to clear selectedProduct
    } catch (e) { }
  };

  // Revised Save Handler
  const confirmSaveProduct = async () => {
    try {
      if (selectedProduct) {
        // Update
        await inventoryService.update(selectedProduct.id, newProduct);
        toast.success("商品更新成功");
      } else {
        // Create
        if (!newProduct.name) return toast.error("請輸入名稱");
        await inventoryService.create(newProduct as Omit<Product, 'id'>);
        toast.success("商品新增成功");
      }
      setIsDetailOpen(false);
      setSelectedProduct(null); // Clear selection
      fetchProducts();
    } catch (error) {
      toast.error("儲存失敗");
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    if (!confirm("確定要刪除此商品嗎？")) return;
    try {
      await inventoryService.delete(selectedProduct.id);
      toast.success("商品已刪除");
      setIsDetailOpen(false);
      setIsActionDrawerOpen(false);
      setSelectedProduct(null);
      fetchProducts();
    } catch (error) {
      toast.error("刪除失敗");
    }
  };

  const handleQuickAdjust = async (id: string, delta: number) => {
    // Optimistic update
    const product = products.find(p => p.id === id);
    if (!product) return;

    const newStock = Math.max(0, product.stock + delta);

    // Update UI immediately
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));
    if (selectedProduct?.id === id) {
      setSelectedProduct({ ...selectedProduct, stock: newStock });
    }

    // API Call (Debounce or just fire)
    try {
      await inventoryService.update(id, { stock: newStock });
    } catch (error) {
      toast.error("更新庫存失敗");
      fetchProducts(); // Revert
    }
  };

  const handleLogUsageSetup = () => {
    if (!selectedProduct) return;
    setLogForm({ amount: "", customerName: "" });
    setIsActionDrawerOpen(false);
    setIsLogDrawerOpen(true);
  };

  const handleSaveLog = async () => {
    // For now, just logging locally or reducing stock via API
    if (!selectedProduct) return;

    // Reduce stock as 'usage'
    await handleQuickAdjust(selectedProduct.id, -1);

    // Create local log (backend doesn't support log history yet)
    const newLog: UsageLog = {
      id: Date.now().toString(),
      productId: selectedProduct.id,
      amount: logForm.amount,
      customerName: logForm.customerName || "現場客",
      date: new Date().toLocaleDateString(),
    };
    setUsageLogs(prev => [newLog, ...prev]);

    toast.success("已記錄使用量");
    setIsLogDrawerOpen(false);
  };

  const filteredProducts = products.filter((p) => (p.category || "consumables") === activeTab);
  const lowStockCount = products.filter((p) => p.stock <= (p.minStockLevel || 3)).length;

  return (
    <MobileFrame>
      <div className="flex flex-col h-full bg-background">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4">
          <button
            onClick={() => navigate("/menu")}
            className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground flex-1">庫存管理</h1>
          {lowStockCount > 0 && (
            <Badge variant="destructive" className="text-xs mr-2">
              {lowStockCount} 短缺
            </Badge>
          )}
          <button
            onClick={() => {
              setSelectedProduct(null); // Clear for create mode
              openNewProduct();
            }}
            className="p-2 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="px-5 py-2">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "consumables" | "retail")}>
            <TabsList className="w-full bg-muted/50">
              <TabsTrigger value="consumables" className="flex-1 text-sm data-[state=active]:bg-card">
                消耗品
              </TabsTrigger>
              <TabsTrigger value="retail" className="flex-1 text-sm data-[state=active]:bg-card">
                零售商品
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Legend */}
        <div className="px-5 py-2 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>充足</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span>短缺</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-destructive" />
            <span>缺貨</span>
          </div>
        </div>

        {/* Product List */}
        <div className="flex-1 overflow-y-auto px-5 pb-4">
          <div className="space-y-2 py-2">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">此分類尚無商品</p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <ProductItem
                  key={product.id}
                  product={product}
                  onTap={handleProductTap}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Action Selection Drawer */}
      <Drawer open={isActionDrawerOpen} onOpenChange={setIsActionDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              {selectedProduct?.name}
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4 space-y-4">
            <div className="p-4 bg-muted/50 rounded-xl">
              <p className="text-sm text-muted-foreground mb-3">{selectedProduct?.brand}</p>

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => selectedProduct && handleQuickAdjust(selectedProduct.id, -1)}
                  disabled={selectedProduct?.stock === 0}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                    "bg-muted hover:bg-muted/80 active:scale-95",
                    selectedProduct?.stock === 0 && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Minus className="w-5 h-5 text-foreground" />
                </button>
                <div className="text-center min-w-[80px]">
                  <p className="font-bold text-3xl text-foreground">{selectedProduct?.stock}</p>
                  <p className="text-xs text-muted-foreground">{selectedProduct?.unit || '個'}</p>
                </div>
                <button
                  onClick={() => selectedProduct && handleQuickAdjust(selectedProduct.id, 1)}
                  className="w-12 h-12 rounded-full flex items-center justify-center transition-all bg-accent text-accent-foreground hover:bg-accent/90 active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                onClick={handleLogUsageSetup}
                variant="outline"
                className="w-full h-14 rounded-xl justify-start gap-3 text-left"
              >
                <ClipboardList className="w-5 h-5 text-accent" />
                <div>
                  <p className="font-semibold">登記使用量</p>
                  <p className="text-xs text-muted-foreground font-normal">記錄客戶使用量</p>
                </div>
              </Button>
              <Button
                onClick={openEditProduct}
                variant="outline"
                className="w-full h-14 rounded-xl justify-start gap-3 text-left"
              >
                <Pencil className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-semibold">編輯商品</p>
                  <p className="text-xs text-muted-foreground font-normal">更新名稱、品牌或單位</p>
                </div>
              </Button>
            </div>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="ghost" className="h-12 rounded-xl">
                取消
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Log Usage Drawer */}
      <Drawer open={isLogDrawerOpen} onOpenChange={setIsLogDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>登記使用量</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4 space-y-4">
            <Label>使用數量</Label>
            <Input
              value={logForm.amount}
              onChange={(e) => setLogForm({ ...logForm, amount: e.target.value })}
              placeholder="例如: 5ml"
            />
            <Label>客戶 (選填)</Label>
            <Input
              value={logForm.customerName}
              onChange={(e) => setLogForm({ ...logForm, customerName: e.target.value })}
              placeholder="王大明"
            />
            <Button onClick={handleSaveLog} className="w-full mt-4">確認登記</Button>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Add/Edit Product Drawer */}
      <Drawer open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{selectedProduct ? "編輯商品" : "新增商品"}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>名稱</Label>
              <Input
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                placeholder="輸入商品名稱"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>品牌</Label>
                <Input
                  value={newProduct.brand}
                  onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                  placeholder="輸入品牌"
                />
              </div>
              <div className="space-y-2">
                <Label>分類</Label>
                <Select
                  value={newProduct.category}
                  onValueChange={(val) => setNewProduct({ ...newProduct, category: val as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consumables">消耗品</SelectItem>
                    <SelectItem value="retail">零售商品</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>庫存數量</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setNewProduct(p => ({ ...p, stock: Math.max(0, (p.stock || 0) - 1) }))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    type="number"
                    className="text-center"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setNewProduct(p => ({ ...p, stock: (p.stock || 0) + 1 }))}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>單位</Label>
                <Select
                  value={newProduct.unit}
                  onValueChange={(val) => setNewProduct({ ...newProduct, unit: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DrawerFooter className="flex-row gap-2">
            <Button className="flex-1" onClick={confirmSaveProduct}>儲存</Button>
            {selectedProduct && (
              <Button variant="destructive" size="icon" onClick={handleDeleteProduct}>
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            <DrawerClose asChild>
              <Button variant="outline" className="flex-1">取消</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </MobileFrame>
  );
};

export default Inventory;
