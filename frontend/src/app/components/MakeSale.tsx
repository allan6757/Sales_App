import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ShoppingCart, Plus, Minus, Trash2, Receipt, Printer, Sparkles, ShoppingBag, CreditCard, Package } from 'lucide-react';
import { toast } from 'sonner';
import { useReactToPrint } from 'react-to-print';

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

interface SaleItem {
  itemId: string;
  itemName: string;
  quantity: number;
  price: number;
  total: number;
}

interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  date: string;
  timestamp: number;
}

interface MakeSaleProps {
  onSaleComplete: () => void;
}

export function MakeSale({ onSaleComplete }: MakeSaleProps) {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadStock();
  }, []);

  const loadStock = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/stock');
      if (response.ok) {
        const items = await response.json();
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
      // Fallback to localStorage if backend is not available
      const saved = localStorage.getItem('stockItems');
      if (saved) {
        setStockItems(JSON.parse(saved));
      }
    }
  };

  const addToCart = (item: StockItem) => {
    if (item.quantity <= 0) {
      toast.error('Item out of stock');
      return;
    }

    const existingItem = cart.find(cartItem => cartItem.itemId === item.id);
    
    if (existingItem) {
      if (existingItem.quantity >= item.quantity) {
        toast.error('Cannot add more than available stock');
        return;
      }
      updateCartQuantity(item.id, existingItem.quantity + 1);
    } else {
      setCart([...cart, {
        itemId: item.id,
        itemName: item.name,
        quantity: 1,
        price: item.price,
        total: item.price
      }]);
      toast.success(`${item.name} added to cart`);
    }
  };

  const updateCartQuantity = (itemId: string, newQuantity: number) => {
    const stockItem = stockItems.find(item => item.id === itemId);
    if (!stockItem) return;

    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    if (newQuantity > stockItem.quantity) {
      toast.error('Cannot exceed available stock');
      return;
    }

    setCart(cart.map(item =>
      item.itemId === itemId
        ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
        : item
    ));
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.itemId !== itemId));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  const completeSale = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    // Create sale object
    const sale: Sale = {
      id: Date.now().toString(),
      items: cart,
      total: calculateTotal(),
      date: new Date().toISOString(),
      timestamp: Date.now()
    };

    try {
      // Send sale to backend
      const response = await fetch('http://localhost:5000/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sale),
      });

      if (response.ok) {
        // Reload stock from backend
        await loadStock();
        toast.success('Sale completed successfully!');
      } else {
        throw new Error('Failed to save sale');
      }
    } catch (error) {
      // Fallback to localStorage
      const updatedStock = stockItems.map(stockItem => {
        const cartItem = cart.find(item => item.itemId === stockItem.id);
        if (cartItem) {
          return { ...stockItem, quantity: stockItem.quantity - cartItem.quantity };
        }
        return stockItem;
      });
      localStorage.setItem('stockItems', JSON.stringify(updatedStock));
      setStockItems(updatedStock);

      const sales = JSON.parse(localStorage.getItem('sales') || '[]');
      sales.push(sale);
      localStorage.setItem('sales', JSON.stringify(sales));
      toast.success('Sale completed successfully (offline)');
    }

    setLastSale(sale);
    setShowReceipt(true);
    setCart([]);
    onSaleComplete();
  };

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Available Stock */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-0 shadow-2xl overflow-hidden rounded-3xl h-full bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10">
          <CardHeader className="bg-white/10 dark:bg-black/10 backdrop-blur-sm border-b border-white/20 dark:border-white/10 text-slate-800 dark:text-white">
            <CardTitle className="flex items-center gap-3 text-xl">
              <ShoppingBag className="size-7" />
              Available Items
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-300 mt-1">
              Select items to add to cart
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8 bg-white/5 dark:bg-black/5 backdrop-blur-sm">
            {stockItems.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                  <ShoppingBag className="size-12 text-blue-500" />
                </div>
                <p className="text-slate-600 text-lg">No items in stock. Add items in Stock Management.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                <AnimatePresence>
                  {stockItems.filter(item => item.quantity > 0).map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="flex items-center justify-between p-6 rounded-2xl shadow-lg transition-all hover:shadow-xl bg-white/30 dark:bg-black/20 backdrop-blur-sm border border-white/20 dark:border-white/10"
                    >
                      <div>
                        <h4 className="font-semibold text-lg">{item.name}</h4>
                        <div className="text-sm text-slate-600 flex gap-6 mt-2">
                          <span className="flex items-center gap-1">
                            <CreditCard className="size-4" />
                            KSH {item.price.toFixed(2)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="size-4" />
                            {item.quantity} in stock
                          </span>
                        </div>
                      </div>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          size="sm"
                          onClick={() => addToCart(item)}
                          className="rounded-xl shadow-lg bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white border-0"
                        >
                          ➕ Add
                        </Button>
                      </motion.div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Cart */}
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-0 shadow-2xl overflow-hidden rounded-3xl bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10">
            <CardHeader className="bg-white/10 dark:bg-black/10 backdrop-blur-sm border-b border-white/20 dark:border-white/10 text-slate-800 dark:text-white">
              <CardTitle className="flex items-center gap-3 text-xl">
                <ShoppingCart className="size-7" />
                Shopping Cart
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300 mt-1">
                Review and complete your sale
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8 bg-white/5 dark:bg-black/5 backdrop-blur-sm">
              {cart.length === 0 ? (
                <motion.div
                  className="text-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center">
                    <ShoppingCart className="size-12 text-orange-500" />
                  </div>
                  <p className="text-gray-500">Cart is empty. Add items to start a sale.</p>
                </motion.div>
              ) : (
                <>
                  <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-2">
                    <AnimatePresence>
                      {cart.map((item, index) => (
                        <motion.div
                          key={item.itemId}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-6 rounded-2xl shadow-lg bg-white/30 dark:bg-black/20 backdrop-blur-sm border border-white/20 dark:border-white/10"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold">{item.itemName}</h4>
                              <p className="text-sm text-gray-600">
                                KSH {item.price.toFixed(2)} × {item.quantity} = <strong>KSH {item.total.toFixed(2)}</strong>
                              </p>
                            </div>
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeFromCart(item.itemId)}
                                className="rounded-full"
                                style={{ color: '#FC8181' }}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </motion.div>
                          </div>
                          <div className="flex items-center justify-center gap-3">
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Button
                                size="sm"
                                onClick={() => updateCartQuantity(item.itemId, item.quantity - 1)}
                                className="rounded-full w-10 h-10"
                                style={{ background: 'linear-gradient(135deg, #FC8181 0%, #F56565 100%)' }}
                              >
                                <Minus className="size-4" />
                              </Button>
                            </motion.div>
                            <span className="w-12 text-center font-bold text-lg">{item.quantity}</span>
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Button
                                size="sm"
                                onClick={() => updateCartQuantity(item.itemId, item.quantity + 1)}
                                className="rounded-full w-10 h-10"
                                style={{ background: 'linear-gradient(135deg, #48BB78 0%, #38A169 100%)' }}
                              >
                                <Plus className="size-4" />
                              </Button>
                            </motion.div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  <div className="space-y-4">
                    <motion.div
                      className="p-8 rounded-2xl shadow-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xl text-white font-semibold flex items-center gap-2">
                          <Sparkles className="size-5" />
                          Total:
                        </span>
                        <span className="text-3xl font-bold text-white">
                          KSH {calculateTotal().toFixed(2)}
                        </span>
                      </div>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={completeSale}
                        className="w-full py-4 rounded-xl text-lg shadow-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0"
                      >
                        ✅ Complete Sale
                      </Button>
                    </motion.div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Receipt Modal */}
        <AnimatePresence>
          {showReceipt && lastSale && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
            >
              <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden">
                <CardHeader style={{ background: 'linear-gradient(135deg, #FC8181 0%, #F56565 100%)' }}>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Receipt className="size-5" />
                    🧾 Sale Receipt
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div ref={receiptRef} className="p-8 bg-white rounded-2xl">
                    <div className="text-center mb-6 pb-4 border-b-2 border-dashed border-gray-300">
                      <div className="text-4xl mb-2">🏪</div>
                      <h2 className="text-2xl font-bold mb-2">SALES RECEIPT</h2>
                      <p className="text-sm text-gray-600">
                        {new Date(lastSale.date).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Receipt #: {lastSale.id}</p>
                    </div>

                    <div className="space-y-3 mb-6">
                      {lastSale.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm border-b border-gray-100 pb-2">
                          <span className="flex-1">{item.itemName}</span>
                          <span className="text-gray-600 mx-4">×{item.quantity}</span>
                          <span className="font-semibold">KSH {item.total.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t-2 border-gray-300 pt-4 mb-6">
                      <div className="flex justify-between font-bold text-xl">
                        <span>TOTAL:</span>
                        <span style={{ color: '#667EEA' }}>KSH {lastSale.total.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="text-center text-sm text-gray-600 border-t border-dashed border-gray-300 pt-4">
                      <p className="font-semibold mb-1">Thank you for your purchase!</p>
                      <p className="text-xs">Come back soon! 🌸</p>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={handlePrint}
                        className="w-full rounded-full"
                        style={{ background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)' }}
                      >
                        <Printer className="size-4 mr-2" />
                        Print Receipt
                      </Button>
                    </motion.div>
                    <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={() => setShowReceipt(false)}
                        variant="outline"
                        className="w-full rounded-full"
                      >
                        Close
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
