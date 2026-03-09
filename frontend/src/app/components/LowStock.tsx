import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { AlertTriangle, Package, ShoppingBag, DollarSign } from 'lucide-react';

interface StockItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  lowStockThreshold: number;
  dateAdded: string;
}

export function LowStock() {
  const [lowStockItems, setLowStockItems] = useState<StockItem[]>([]);

  useEffect(() => {
    loadLowStock();
  }, []);

  const loadLowStock = () => {
    const saved = localStorage.getItem('stockItems');
    if (saved) {
      const allItems: StockItem[] = JSON.parse(saved);
      const low = allItems.filter(item => item.quantity <= item.lowStockThreshold);
      setLowStockItems(low);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-0 shadow-2xl overflow-hidden rounded-3xl bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10">
          <CardHeader className="bg-white/10 dark:bg-black/10 backdrop-blur-sm border-b border-white/20 dark:border-white/10 text-slate-800 dark:text-white">
            <CardTitle className="flex items-center gap-3 text-xl">
              <AlertTriangle className="size-7" />
              Low Stock Alert
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-300 mt-1">
              Items that need restocking
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8 bg-white/5 dark:bg-black/5 backdrop-blur-sm">
            {lowStockItems.length === 0 ? (
              <motion.div
                className="text-center py-16"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Package className="size-20 mx-auto mb-4" style={{ color: '#48BB78' }} />
                </motion.div>
                <h3 className="text-2xl font-bold mb-3" style={{ color: '#48BB78' }}>
                  ✨ All Stock Levels Look Good!
                </h3>
                <p className="text-gray-600">
                  No items are currently below their low stock threshold.
                </p>
                <div className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full" style={{ background: 'linear-gradient(135deg, #E6FFFA 0%, #B2F5EA 100%)' }}>
                  <ShoppingBag className="size-4 text-emerald-500 dark:text-emerald-400" />
                  <span className="text-sm font-semibold" style={{ color: '#2F855A' }}>Your inventory is healthy!</span>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-6">
                <motion.div
                  className="p-5 rounded-2xl shadow-md"
                  style={{ 
                    background: 'linear-gradient(135deg, #FED7D7 0%, #FEB2B2 100%)',
                    borderLeft: '6px solid #FC8181'
                  }}
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <p className="font-bold text-lg flex items-center gap-2" style={{ color: '#C53030' }}>
                    <AlertTriangle className="size-5" />
                    {lowStockItems.length} item{lowStockItems.length !== 1 ? 's' : ''} need{lowStockItems.length === 1 ? 's' : ''} restocking
                  </p>
                </motion.div>

                <div className="space-y-4">
                  <AnimatePresence>
                    {lowStockItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="p-6 rounded-2xl shadow-lg"
                        style={{ 
                          background: 'linear-gradient(135deg, #FFF5F5 0%, #FED7D7 100%)',
                          border: '2px solid #FC8181'
                        }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h4 className="text-xl font-bold">{item.name}</h4>
                              <motion.span
                                className="px-3 py-1 text-xs font-bold rounded-full"
                                style={{ background: 'linear-gradient(135deg, #FC8181 0%, #F56565 100%)', color: 'white' }}
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                              >
                                ⚠️ LOW STOCK
                              </motion.span>
                            </div>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">📦</span>
                                <div>
                                  <p className="text-xs text-gray-600">Current Stock</p>
                                  <p className="text-lg font-bold" style={{ color: '#C53030' }}>
                                    {item.quantity} units
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">🔔</span>
                                <div>
                                  <p className="text-xs text-gray-600">Alert Threshold</p>
                                  <p className="text-lg font-bold text-gray-700">
                                    {item.lowStockThreshold} units
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">💰</span>
                                <div>
                                  <p className="text-xs text-gray-600">Price per Unit</p>
                                  <p className="text-lg font-bold text-gray-700">
                                    ${item.price.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">📊</span>
                                <div>
                                  <p className="text-xs text-gray-600">Status</p>
                                  <p className="text-lg font-bold" style={{ color: '#C53030' }}>
                                    {item.quantity === 0 ? 'OUT' : 'RESTOCK'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {item.quantity === 0 && (
                          <motion.div
                            className="mt-4 p-3 rounded-xl"
                            style={{ background: 'linear-gradient(135deg, #FEB2B2 0%, #FC8181 100%)' }}
                            animate={{ opacity: [1, 0.7, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <p className="text-sm font-bold text-white flex items-center gap-2">
                              <AlertTriangle className="size-4" />
                              CRITICAL: This item is completely out of stock!
                            </p>
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <motion.div
                  className="p-6 rounded-2xl shadow-md"
                  style={{ 
                    background: 'linear-gradient(135deg, #E6FFFA 0%, #B2F5EA 100%)',
                    borderLeft: '6px solid #48BB78'
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: lowStockItems.length * 0.1 + 0.3 }}
                >
                  <h4 className="font-bold text-lg mb-3 flex items-center gap-2" style={{ color: '#2F855A' }}>
                    <ShoppingBag className="size-5" />
                    💡 Restocking Tips
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-lg">✓</span>
                      <span>Update stock quantities in the <strong>Stock Management</strong> section</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-lg">✓</span>
                      <span>Consider increasing low stock thresholds for fast-moving items</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-lg">✓</span>
                      <span>Monitor this page regularly to avoid stockouts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-lg">✓</span>
                      <span>Set up a regular restocking schedule based on sales patterns</span>
                    </li>
                  </ul>
                </motion.div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
