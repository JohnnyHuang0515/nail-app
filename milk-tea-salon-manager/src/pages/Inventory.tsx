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

const units = ["bottles", "tubes", "packs", "pieces", "boxes", "ml", "g"];

const initialProducts: Product[] = [
  { id: "1", name: "UV Gel - Clear", brand: "OPI", category: "consumables", stock: 8, unit: "bottles" },
  { id: "2", name: "Nail Polish - Rose Pink", brand: "Essie", category: "consumables", stock: 2, unit: "bottles" },
  { id: "3", name: "Gel Remover", brand: "CND", category: "consumables", stock: 5, unit: "bottles" },
  { id: "4", name: "Base Coat", brand: "OPI", category: "consumables", stock: 1, unit: "bottles" },
  { id: "5", name: "Top Coat - Matte", brand: "Essie", category: "consumables", stock: 4, unit: "bottles" },
  { id: "6", name: "Cuticle Oil", brand: "CND", category: "retail", stock: 12, unit: "bottles" },
  { id: "7", name: "Hand Cream - Lavender", brand: "L'Occitane", category: "retail", stock: 6, unit: "tubes" },
  { id: "8", name: "Nail Strengthener", brand: "OPI", category: "retail", stock: 2, unit: "bottles" },
  { id: "9", name: "Foot Cream", brand: "Burt's Bees", category: "retail", stock: 0, unit: "tubes" },
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
            Out
          </Badge>
        )}
        {isLowStock && !isOutOfStock && (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-[9px] px-1.5 py-0 h-5 shrink-0">
            Low
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
      customerName: logForm.customerName || "Walk-in",
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

    toast.success(`Usage logged: ${logForm.amount} for ${logForm.customerName || "Walk-in"}`);
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
          <h1 className="text-xl font-bold text-foreground flex-1">Inventory</h1>
          {lowStockCount > 0 && (
            <Badge variant="destructive" className="text-xs mr-2">
              {lowStockCount} Low
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
                Consumables
              </TabsTrigger>
              <TabsTrigger value="retail" className="flex-1 text-sm data-[state=active]:bg-card">
                Retail
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Legend */}
        <div className="px-5 py-2 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Good ({">"} 5)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Low ({"<"} 3)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-destructive" />
            <span>Out</span>
          </div>
        </div>

        {/* Product List */}
        <div className="flex-1 overflow-y-auto px-5 pb-4">
          <div className="space-y-2 py-2">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No products in this category</p>
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
                  <p className="font-semibold">Log Usage</p>
                  <p className="text-xs text-muted-foreground font-normal">Record usage for a customer</p>
                </div>
              </Button>
              <Button
                onClick={handleEdit}
                variant="outline"
                className="w-full h-14 rounded-xl justify-start gap-3 text-left"
              >
                <Pencil className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-semibold">Edit Product</p>
                  <p className="text-xs text-muted-foreground font-normal">Update name, brand, or unit</p>
                </div>
              </Button>
            </div>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="ghost" className="h-12 rounded-xl">
                Cancel
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
              Log Usage - {loggingProduct?.name}
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
                <p className="text-xs text-muted-foreground">{loggingProduct?.unit} left</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount Used</Label>
              <Input
                id="amount"
                placeholder="e.g., 5ml, 2g, 1 coat"
                value={logForm.amount}
                onChange={(e) => setLogForm({ ...logForm, amount: e.target.value })}
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer">Customer Name (Optional)</Label>
              <Input
                id="customer"
                placeholder="e.g., Emily Chen"
                value={logForm.customerName}
                onChange={(e) => setLogForm({ ...logForm, customerName: e.target.value })}
                className="h-12 rounded-xl"
              />
            </div>

            {/* Recent Logs */}
            {recentLogs.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Recent Usage</p>
                {recentLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between text-xs p-2 bg-muted/30 rounded-lg">
                    <span>{log.amount} for {log.customerName}</span>
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
              Log Usage
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="h-12 rounded-xl">
                Cancel
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
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                placeholder="Enter product name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                placeholder="Enter brand name"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={form.category}
                onValueChange={(value) => setForm({ ...form, category: value })}
              >
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consumables">Consumables</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity</Label>
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
                <Label htmlFor="unit">Unit</Label>
                <Select
                  value={form.unit}
                  onValueChange={(value) => setForm({ ...form, unit: value })}
                >
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Select unit" />
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
              {editingProduct ? "Save Changes" : "Add Product"}
            </Button>
            {editingProduct && (
              <Button
                onClick={handleDelete}
                variant="destructive"
                className="h-12 rounded-xl"
              >
                Delete Product
              </Button>
            )}
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

export default Inventory;
