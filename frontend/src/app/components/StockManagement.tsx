import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Package, Search, Edit, Trash2, Lock, Printer, Upload, Plus, X, ShoppingBag, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { useReactToPrint } from 'react-to-print';
import { ImageUpload } from './ImageUpload';
import { ImageViewer } from './ImageViewer';

interface StockItem {
  id: string;
  name: string;
  quantity: number;
  unit: 'pieces' | 'dozens' | 'grosses' | 'packets';
  price: number;
  lowStockThreshold: number;
  dateAdded: string;
  imagePath?: string;
}

interface BulkStockItem {
  name: string;
  quantity: string;
  unit: 'pieces' | 'dozens' | 'grosses' | 'packets';
  price: string;
  lowStockThreshold: string;
  imagePath?: string;
}

interface StockManagementProps {
  onStockUpdate: () => void;
}

export function StockManagement({ onStockUpdate }: StockManagementProps) {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<'pieces' | 'dozens' | 'grosses' | 'packets'>('pieces');
  const [price, setPrice] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('10');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUnit, setFilterUnit] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [pendingAction, setPendingAction] = useState<'add' | 'edit' | 'delete' | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkItems, setBulkItems] = useState<BulkStockItem[]>([{ name: '', quantity: '', unit: 'pieces', price: '', lowStockThreshold: '10' }]);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [currentImagePath, setCurrentImagePath] = useState<string>('');
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewingImage, setViewingImage] = useState<{ path: string; name: string } | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadStock();
  }, []);

  const loadStock = async () => {
    console.log('Loading stock data...');
    try {
      const response = await fetch('http://localhost:5000/api/stock');
      if (response.ok) {
        const items = await response.json();
        console.log('Stock data loaded from backend:', items);
        // Convert snake_case to camelCase for frontend
        const formattedItems = items.map((item: any) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price,
          lowStockThreshold: item.low_stock_threshold,
          dateAdded: item.date_added,
          imagePath: item.image_path
        }));
        setStockItems(formattedItems);
      }
    } catch (error) {
      console.log('Backend not available, using localStorage fallback');
      // Fallback to localStorage if backend is not available
      const saved = localStorage.getItem('stockItems');
      if (saved) {
        const items = JSON.parse(saved);
        console.log('Stock data loaded from localStorage:', items);
        setStockItems(items);
      } else {
        console.log('No stock data found in localStorage');
        // Set some sample data for testing
        const sampleData: StockItem[] = [
          {
            id: '1',
            name: 'Sample Item',
            quantity: 10,
            unit: 'pieces',
            price: 100,
            lowStockThreshold: 5,
            dateAdded: new Date().toISOString()
          }
        ];
        setStockItems(sampleData);
        localStorage.setItem('stockItems', JSON.stringify(sampleData));
      }
    }
  };

  const saveStock = async (items: StockItem[]) => {
    // Always update local state and localStorage as backup
    localStorage.setItem('stockItems', JSON.stringify(items));
    setStockItems(items);
    onStockUpdate();
  };

  const isPersonalModeEnabled = () => {
    return localStorage.getItem('personalMode') === 'true';
  };

  const getStoredPassword = () => {
    return localStorage.getItem('appPassword') || 'Allan123';
  };

  const checkAuthentication = (action: 'add' | 'edit' | 'delete', deleteId?: string) => {
    if (!isPersonalModeEnabled()) {
      return true;
    }
    setPendingAction(action);
    if (deleteId) {
      setPendingDeleteId(deleteId);
    }
    setShowPasswordDialog(true);
    return false;
  };

  const handlePasswordSubmit = () => {
    if (password !== getStoredPassword()) {
      toast.error('Incorrect password');
      return;
    }

    if (pendingAction === 'add' || pendingAction === 'edit') {
      performAddOrUpdate();
    } else if (pendingAction === 'delete' && pendingDeleteId) {
      performDelete(pendingDeleteId);
    }

    setPassword('');
    setShowPasswordDialog(false);
    setPendingAction(null);
    setPendingDeleteId(null);
  };

  const addBulkRow = () => {
    setBulkItems([...bulkItems, { name: '', quantity: '', unit: 'pieces', price: '', lowStockThreshold: '10' }]);
  };

  const removeBulkRow = (index: number) => {
    if (bulkItems.length > 1) {
      setBulkItems(bulkItems.filter((_, i) => i !== index));
    }
  };

  const updateBulkItem = (index: number, field: keyof BulkStockItem, value: string) => {
    const updated = bulkItems.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setBulkItems(updated);
  };

  const handleBulkUpload = () => {
    const validItems = bulkItems.filter(item => 
      item.name.trim() && item.quantity && item.price
    );

    if (validItems.length === 0) {
      toast.error('Please fill in at least one complete item');
      return;
    }

    if (!checkAuthentication('add')) {
      return;
    }

    performBulkUpload(validItems);
  };

  const performBulkUpload = (validItems: BulkStockItem[]) => {
    const newItems: StockItem[] = validItems.map(item => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: item.name.trim(),
      quantity: parseFloat(item.quantity),
      unit: item.unit,
      price: parseFloat(item.price),
      lowStockThreshold: parseFloat(item.lowStockThreshold) || 10,
      dateAdded: new Date().toISOString(),
    }));

    const updatedItems = [...stockItems, ...newItems];
    saveStock(updatedItems);
    toast.success(`${newItems.length} items added successfully`);
    
    setBulkItems([{ name: '', quantity: '', unit: 'pieces', price: '', lowStockThreshold: '10' }]);
    setShowBulkUpload(false);
  };

  const handleAddOrUpdateStock = () => {
    if (!itemName || !quantity || !price) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!checkAuthentication(editingId ? 'edit' : 'add')) {
      return;
    }

    performAddOrUpdate();
  };

  const performAddOrUpdate = async () => {
    const newItem: StockItem = {
      id: editingId || Date.now().toString(),
      name: itemName,
      quantity: parseFloat(quantity),
      unit,
      price: parseFloat(price),
      lowStockThreshold: parseFloat(lowStockThreshold) || 10,
      dateAdded: new Date().toISOString(),
      imagePath: currentImagePath || undefined,
    };

    try {
      let response;
      if (editingId) {
        // Update existing item
        response = await fetch(`http://localhost:5000/api/stock/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: newItem.name,
            quantity: newItem.quantity,
            unit: newItem.unit,
            price: newItem.price,
            lowStockThreshold: newItem.lowStockThreshold,
            imagePath: newItem.imagePath
          }),
        });
      } else {
        // Add new item
        response = await fetch('http://localhost:5000/api/stock', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: newItem.id,
            name: newItem.name,
            quantity: newItem.quantity,
            unit: newItem.unit,
            price: newItem.price,
            lowStockThreshold: newItem.lowStockThreshold,
            dateAdded: newItem.dateAdded,
            imagePath: newItem.imagePath
          }),
        });
      }

      if (response.ok) {
        // Reload stock from backend
        await loadStock();
        toast.success(editingId ? 'Item updated successfully' : 'Item added successfully');
      } else {
        throw new Error('Failed to save item');
      }
    } catch (error) {
      // Fallback to localStorage
      let updatedItems: StockItem[];
      if (editingId) {
        updatedItems = stockItems.map(item => item.id === editingId ? newItem : item);
        toast.success('Item updated successfully (offline)');
      } else {
        updatedItems = [...stockItems, newItem];
        toast.success('Item added successfully (offline)');
      }
      saveStock(updatedItems);
    }

    resetForm();
  };

  const handleEdit = (item: StockItem) => {
    if (!checkAuthentication('edit')) {
      setItemName(item.name);
      setQuantity(item.quantity.toString());
      setUnit(item.unit);
      setPrice(item.price.toString());
      setLowStockThreshold(item.lowStockThreshold.toString());
      setCurrentImagePath(item.imagePath || '');
      setEditingId(item.id);
      return;
    }
    setItemName(item.name);
    setQuantity(item.quantity.toString());
    setUnit(item.unit);
    setPrice(item.price.toString());
    setLowStockThreshold(item.lowStockThreshold.toString());
    setCurrentImagePath(item.imagePath || '');
    setEditingId(item.id);
  };

  const handleDelete = (id: string) => {
    if (!checkAuthentication('delete', id)) {
      return;
    }
    performDelete(id);
  };

  const performDelete = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/stock/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Reload stock from backend
        await loadStock();
        toast.success('Item deleted successfully');
      } else {
        throw new Error('Failed to delete item');
      }
    } catch (error) {
      // Fallback to localStorage
      const updatedItems = stockItems.filter(item => item.id !== id);
      saveStock(updatedItems);
      toast.success('Item deleted successfully (offline)');
    }
  };

  const resetForm = () => {
    setItemName('');
    setQuantity('');
    setUnit('pieces');
    setPrice('');
    setLowStockThreshold('10');
    setCurrentImagePath('');
    setEditingId(null);
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  const filteredItems = stockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUnit = filterUnit === 'all' || item.unit === filterUnit;
    return matchesSearch && matchesUnit;
  });

  const getUnitDisplay = (quantity: number, unit: string) => {
    return `${quantity} ${unit}`;
  };

  return (
    <div className="space-y-6 w-full min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-0 shadow-2xl overflow-hidden rounded-3xl bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10">
          <CardHeader className="bg-white/10 dark:bg-black/10 backdrop-blur-sm border-b border-white/20 dark:border-white/10 text-slate-800 dark:text-white">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-3">
                  <ShoppingBag className="size-7" />
                  {editingId ? 'Edit Stock Item' : 'Add New Stock Item'}
                  {isPersonalModeEnabled() && <Lock className="size-5 opacity-80" />}
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-300 mt-1">
                  {editingId ? 'Update your inventory item' : 'Add items to your inventory'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8 space-y-6 bg-white/5 dark:bg-black/5 backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="itemName">Item Name</Label>
                <Input
                  id="itemName"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="Enter item name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Enter quantity"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select value={unit} onValueChange={(value: any) => setUnit(value)}>
                  <SelectTrigger id="unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pieces">Pieces</SelectItem>
                    <SelectItem value="dozens">Dozens</SelectItem>
                    <SelectItem value="grosses">Grosses</SelectItem>
                    <SelectItem value="packets">Packets</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price per Unit (KES)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Enter price in KES"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="threshold">Low Stock Alert Threshold</Label>
                <Input
                  id="threshold"
                  type="number"
                  step="0.01"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(e.target.value)}
                  placeholder="Enter threshold"
                />
              </div>
              <div className="space-y-2">
                <Label>Item Image</Label>
                <div className="flex gap-2 items-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowImageUpload(true)}
                    className="flex items-center gap-2"
                  >
                    <Camera className="size-4" />
                    {currentImagePath ? 'Change Image' : 'Add Image'}
                  </Button>
                  {currentImagePath && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setViewingImage({ path: currentImagePath, name: itemName || 'Item' });
                        setShowImageViewer(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View Image
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddOrUpdateStock}>
                {editingId ? 'Update Item' : 'Add Item'}
              </Button>
              {editingId && (
                <Button onClick={resetForm} variant="outline">
                  Cancel
                </Button>
              )}
              <Button 
                onClick={() => setShowBulkUpload(true)} 
                variant="secondary"
                className="ml-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-lg"
              >
                <Upload className="size-4 mr-2" />
                BULK UPLOAD
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border-0 shadow-2xl overflow-hidden rounded-3xl bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10">
          <CardHeader className="bg-white/10 dark:bg-black/10 backdrop-blur-sm border-b border-white/20 dark:border-white/10 text-slate-800 dark:text-white">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-3">
                  <Package className="size-7" />
                  Current Stock
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-300 mt-1">
                  View and manage your inventory
                </CardDescription>
              </div>
              <Button size="sm" variant="secondary" onClick={handlePrint} className="bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-white/20 dark:border-white/10 backdrop-blur-sm">
                <Printer className="size-4 mr-2" />
                Print
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-8 bg-white/5 dark:bg-black/5 backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterUnit} onValueChange={setFilterUnit}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Units</SelectItem>
                  <SelectItem value="pieces">Pieces</SelectItem>
                  <SelectItem value="dozens">Dozens</SelectItem>
                  <SelectItem value="grosses">Grosses</SelectItem>
                  <SelectItem value="packets">Packets</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredItems.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                  <Package className="size-12 text-indigo-500" />
                </div>
                <p className="text-slate-600 text-lg">No items found. Add your first stock item above.</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-4" ref={printRef}>
                  <div className="print-only p-4 mb-4">
                    <h2 className="text-2xl font-bold">Stock Inventory Report</h2>
                    <p className="text-sm text-muted-foreground">
                      Generated on {new Date().toLocaleString()}
                    </p>
                  </div>
                  <AnimatePresence>
                    {filteredItems.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`p-4 border rounded-lg ${
                          item.quantity <= item.lowStockThreshold
                            ? 'bg-destructive/10 border-destructive'
                            : 'bg-card'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-lg">{item.name}</h4>
                              {item.quantity <= item.lowStockThreshold && (
                                <span className="px-2 py-1 text-xs font-semibold rounded bg-destructive text-destructive-foreground">
                                  Low Stock
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Quantity:</span>
                                <p className="font-semibold">{getUnitDisplay(item.quantity, item.unit)}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Price:</span>
                                <p className="font-semibold">KES {item.price.toFixed(2)}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Alert At:</span>
                                <p className="font-semibold">{item.lowStockThreshold} {item.unit}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Added:</span>
                                <p className="font-semibold">
                                  {new Date(item.dateAdded).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 no-print">
                            {item.imagePath && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setViewingImage({ path: item.imagePath!, name: item.name });
                                  setShowImageViewer(true);
                                }}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Camera className="size-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(item)}
                            >
                              <Edit className="size-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(item.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Bulk Upload Dialog */}
      <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="size-5" />
              Upload Bulk Stock
            </DialogTitle>
            <DialogDescription>
              Add multiple items at once using the spreadsheet below
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted p-3 grid grid-cols-6 gap-2 text-sm font-semibold">
                <div>Item Name</div>
                <div>Quantity</div>
                <div>Unit</div>
                <div>Price (KES)</div>
                <div>Alert Threshold</div>
                <div>Actions</div>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {bulkItems.map((item, index) => (
                  <div key={index} className="p-2 grid grid-cols-6 gap-2 border-b">
                    <Input
                      placeholder="Enter item name"
                      value={item.name}
                      onChange={(e) => updateBulkItem(index, 'name', e.target.value)}
                    />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Quantity"
                      value={item.quantity}
                      onChange={(e) => updateBulkItem(index, 'quantity', e.target.value)}
                    />
                    <Select 
                      value={item.unit} 
                      onValueChange={(value: any) => updateBulkItem(index, 'unit', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pieces">Pieces</SelectItem>
                        <SelectItem value="dozens">Dozens</SelectItem>
                        <SelectItem value="grosses">Grosses</SelectItem>
                        <SelectItem value="packets">Packets</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      value={item.price}
                      onChange={(e) => updateBulkItem(index, 'price', e.target.value)}
                    />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Threshold"
                      value={item.lowStockThreshold}
                      onChange={(e) => updateBulkItem(index, 'lowStockThreshold', e.target.value)}
                    />
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={addBulkRow}
                      >
                        <Plus className="size-3" />
                      </Button>
                      {bulkItems.length > 1 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeBulkRow(index)}
                        >
                          <X className="size-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <Button onClick={addBulkRow} variant="outline">
                <Plus className="size-4 mr-2" />
                Add Row
              </Button>
              <div className="text-sm text-muted-foreground">
                {bulkItems.filter(item => item.name.trim() && item.quantity && item.price).length} valid items ready
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowBulkUpload(false);
              setBulkItems([{ name: '', quantity: '', unit: 'pieces', price: '', lowStockThreshold: '10' }]);
            }}>
              Cancel
            </Button>
            <Button onClick={handleBulkUpload}>
              UPDATE STOCK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Upload Dialog */}
      <ImageUpload
        isOpen={showImageUpload}
        onClose={() => setShowImageUpload(false)}
        onImageSelect={(imagePath) => {
          setCurrentImagePath(imagePath);
          setShowImageUpload(false);
        }}
      />

      {/* Image Viewer Dialog */}
      {viewingImage && (
        <ImageViewer
          isOpen={showImageViewer}
          onClose={() => {
            setShowImageViewer(false);
            setViewingImage(null);
          }}
          imagePath={viewingImage.path}
          itemName={viewingImage.name}
        />
      )}

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Authentication Required</DialogTitle>
            <DialogDescription>
              Enter password to modify stock (Personal Mode is enabled)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handlePasswordSubmit();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowPasswordDialog(false);
              setPassword('');
              setPendingAction(null);
              setPendingDeleteId(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handlePasswordSubmit}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
        }
        @media screen {
          .print-only {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
