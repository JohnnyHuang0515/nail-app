import { useState } from "react";
import { ChevronLeft, Package, Minus, Plus, Pencil, ClipboardList, ChevronRight } from "lucide-react";
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

interface Product {
  id: string;
  name: string;
  brand: string;
  category: "consumables" | "retail";
  stock: number;
  unit: string;
}

interface UsageLog {
  id: string;
  productId: string;
  amount: string;
  customerName: string;
  date: string;
}

const units = ["瓶", "條", "包", "件", "盒", "ml", "g"];

const initialProducts: Product[] = [
  { id: "1", name: "透明建構膠", brand: "OPI", category: "consumables", stock: 8, unit: "瓶" },
  { id: "2", name: "玫瑰粉指甲油", brand: "Essie", category: "consumables", stock: 2, unit: "瓶" },
  { id: "3", name: "卸甲液", brand: "CND", category: "consumables", stock: 5, unit: "瓶" },
  { id: "4", name: "基底膠", brand: "OPI", category: "consumables", stock: 1, unit: "瓶" },
  { id: "5", name: "霧面封層膠", brand: "Essie", category: "consumables", stock: 4, unit: "瓶" },
  { id: "6", name: "指緣油", brand: "CND", category: "retail", stock: 12, unit: "瓶" },
  { id: "7", name: "薰衣草護手霜", brand: "L'Occitane", category: "retail", stock: 6, unit: "條" },
  { id: "8", name: "硬甲油", brand: "OPI", category: "retail", stock: 2, unit: "瓶" },
  { id: "9", name: "足部修護霜", brand: "Burt's Bees", category: "retail", stock: 0, unit: "條" },
];

const ProductItem = ({
  product,
  onTap,
}: {
  product: Product;
  onTap: (product: Product) => void;
}) => {
  const isLowStock = product.stock < 3;
  const isOutOfStock = product.stock === 0;
  const isGoodStock = product.stock > 5;

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
          <p className="text-[10px] text-muted-foreground">{product.unit}</p>
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
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isActionDrawerOpen, setIsActionDrawerOpen] = useState(false);
  const [isLogDrawerOpen, setIsLogDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loggingProduct, setLoggingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: "", brand: "", stock: "", unit: "", category: "" });
  const [logForm, setLogForm] = useState({ amount: "", customerName: "" });
  const [usageLogs, setUsageLogs] = useState<UsageLog[]>([]);

  const filteredProducts = products.filter((p) => p.category === activeTab);
  const lowStockCount = products.filter((p) => p.stock < 3).length;

  const handleProductTap = (product: Product) => {
    setSelectedProduct(product);
    setIsActionDrawerOpen(true);
  };

  const handleQuickAdjust = (id: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p
      )
    );
    const product = products.find((p) => p.id === id);
    if (product) {
      const newStock = Math.max(0, product.stock + delta);
      toast.success(`${product.name}: ${newStock} ${product.unit}`);
    }
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setForm({ name: "", brand: "", stock: "", unit: "bottles", category: activeTab });
    setIsDrawerOpen(true);
  };

  const handleEdit = () => {
    if (!selectedProduct) return;
    setEditingProduct(selectedProduct);
    setForm({
      name: selectedProduct.name,
      brand: selectedProduct.brand,
      stock: selectedProduct.stock.toString(),
      unit: selectedProduct.unit,
      category: selectedProduct.category,
    });
    setIsActionDrawerOpen(false);
    setIsDrawerOpen(true);
  };

  const handleLogUsage = () => {
    if (!selectedProduct) return;
    setLoggingProduct(selectedProduct);
    setLogForm({ amount: "", customerName: "" });
    setIsActionDrawerOpen(false);
    setIsLogDrawerOpen(true);
  };

  const handleSaveLog = () => {
    if (!loggingProduct || !logForm.amount) return;

    const newLog: UsageLog = {
      id: Date.now().toString(),
      productId: loggingProduct.id,
      amount: logForm.amount,
      customerName: logForm.customerName || "現場客",
      date: new Date().toLocaleDateString(),
    };

    setUsageLogs((prev) => [newLog, ...prev]);

    // Optionally reduce stock
    setProducts((prev) =>
      prev.map((p) =>
        p.id === loggingProduct.id
          ? { ...p, stock: Math.max(0, p.stock - 1) }
          : p
      )
    );

    toast.success(`已記錄使用量: ${logForm.amount} - ${logForm.customerName || "現場客"}`);
    setIsLogDrawerOpen(false);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.unit || !form.category) return;

    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
              ...p,
              name: form.name.trim(),
              brand: form.brand.trim(),
              stock: parseInt(form.stock) || 0,
              unit: form.unit,
              category: form.category as "consumables" | "retail",
            }
            : p
        )
      );
    } else {
      const newProduct: Product = {
        id: Date.now().toString(),
        name: form.name.trim(),
        brand: form.brand.trim(),
        stock: parseInt(form.stock) || 0,
        unit: form.unit,
        category: form.category as "consumables" | "retail",
      };
      setProducts((prev) => [...prev, newProduct]);
    }
    setIsDrawerOpen(false);
  };

  const handleDelete = () => {
    if (!editingProduct) return;
    setProducts((prev) => prev.filter((p) => p.id !== editingProduct.id));
    setIsDrawerOpen(false);
  };

  const recentLogs = usageLogs.filter((log) => log.productId === loggingProduct?.id).slice(0, 3);

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
            onClick={handleAddNew}
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
            <span>充足 ({">"} 5)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span>短缺 ({"<"} 3)</span>
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
            {/* Product Info with Stock Adjust */}
            <div className="p-4 bg-muted/50 rounded-xl">
              <p className="text-sm text-muted-foreground mb-3">{selectedProduct?.brand}</p>

              {/* Stock Adjustment */}
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
                  <p className="text-xs text-muted-foreground">{selectedProduct?.unit}</p>
                </div>
                <button
                  onClick={() => selectedProduct && handleQuickAdjust(selectedProduct.id, 1)}
                  className="w-12 h-12 rounded-full flex items-center justify-center transition-all bg-accent text-accent-foreground hover:bg-accent/90 active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                onClick={handleLogUsage}
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
                onClick={handleEdit}
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
            <DrawerTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              登記使用量 - {loggingProduct?.name}
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4 space-y-4">
            {/* Product Info */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
              <Package className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium text-sm">{loggingProduct?.name}</p>
                <p className="text-xs text-muted-foreground">{loggingProduct?.brand}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm">{loggingProduct?.stock}</p>
                <p className="text-xs text-muted-foreground">剩餘 {loggingProduct?.unit}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">使用數量</Label>
              <Input
                id="amount"
                placeholder="例如: 5ml, 2g, 1層"
                value={logForm.amount}
                onChange={(e) => setLogForm({ ...logForm, amount: e.target.value })}
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer">客戶姓名 (選填)</Label>
              <Input
                id="customer"
                placeholder="例如: 王小美"
                value={logForm.customerName}
                onChange={(e) => setLogForm({ ...logForm, customerName: e.target.value })}
                className="h-12 rounded-xl"
              />
            </div>

            {/* Recent Logs */}
            {recentLogs.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">最近使用紀錄</p>
                {recentLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between text-xs p-2 bg-muted/30 rounded-lg">
                    <span>{log.amount} - {log.customerName}</span>
                    <span className="text-muted-foreground">{log.date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DrawerFooter>
            <Button
              onClick={handleSaveLog}
              disabled={!logForm.amount.trim()}
              className="h-12 rounded-xl"
            >
              確認登記
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="h-12 rounded-xl">
                取消
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Add/Edit Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {editingProduct ? "編輯商品" : "新增商品"}
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">商品名稱</Label>
              <Input
                id="name"
                placeholder="輸入商品名稱"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">品牌</Label>
              <Input
                id="brand"
                placeholder="輸入品牌名稱"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
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
                  <SelectItem value="consumables">消耗品</SelectItem>
                  <SelectItem value="retail">零售商品</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">庫存數量</Label>
                <Input
                  id="stock"
                  type="number"
                  placeholder="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">單位</Label>
                <Select
                  value={form.unit}
                  onValueChange={(value) => setForm({ ...form, unit: value })}
                >
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="選擇單位" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DrawerFooter>
            <Button
              onClick={handleSave}
              disabled={!form.name.trim() || !form.unit || !form.category}
              className="h-12 rounded-xl"
            >
              {editingProduct ? "儲存變更" : "新增商品"}
            </Button>
            {editingProduct && (
              <Button
                onClick={handleDelete}
                variant="destructive"
                className="h-12 rounded-xl"
              >
                刪除商品
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

export default Inventory;
