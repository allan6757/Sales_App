import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Calendar, TrendingUp, DollarSign, Award, CheckCircle, Sparkles, BarChart3, Target } from 'lucide-react';
import { toast } from 'sonner';

interface Sale {
  id: string;
  items: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  total: number;
  date: string;
  timestamp: number;
}

interface CashOutEntry {
  id: string;
  amount: number;
  reason: string;
  date: string;
  timestamp: number;
}

interface DailySummary {
  date: string;
  totalSales: number;
  totalCashOut: number;
  netAmount: number;
  mostSoldItem: string;
  totalTransactions: number;
}

export function DailySummary() {
  const [todaysSummary, setTodaysSummary] = useState<DailySummary | null>(null);
  const [hasEnded, setHasEnded] = useState(false);

  useEffect(() => {
    checkIfDayEnded();
    calculateSummary();
  }, []);

  const checkIfDayEnded = () => {
    const today = new Date().toDateString();
    const endedDate = localStorage.getItem('lastDayEnded');
    setHasEnded(endedDate === today);
  };

  const calculateSummary = () => {
    const today = new Date().toDateString();

    // Get today's sales
    const salesData = localStorage.getItem('sales');
    const allSales: Sale[] = salesData ? JSON.parse(salesData) : [];
    const todaysSales = allSales.filter(
      sale => new Date(sale.date).toDateString() === today
    );

    // Get today's cash outs
    const cashOutData = localStorage.getItem('cashOuts');
    const allCashOuts: CashOutEntry[] = cashOutData ? JSON.parse(cashOutData) : [];
    const todaysCashOuts = allCashOuts.filter(
      entry => new Date(entry.date).toDateString() === today
    );

    // Calculate totals
    const totalSales = todaysSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalCashOut = todaysCashOuts.reduce((sum, entry) => sum + entry.amount, 0);

    // Find most sold item
    const itemCounts: { [key: string]: number } = {};
    todaysSales.forEach(sale => {
      sale.items.forEach(item => {
        itemCounts[item.itemName] = (itemCounts[item.itemName] || 0) + item.quantity;
      });
    });

    let mostSoldItem = 'None';
    let maxCount = 0;
    Object.entries(itemCounts).forEach(([name, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostSoldItem = name;
      }
    });

    setTodaysSummary({
      date: today,
      totalSales,
      totalCashOut,
      netAmount: totalSales - totalCashOut,
      mostSoldItem,
      totalTransactions: todaysSales.length
    });
  };

  const endDay = () => {
    if (!todaysSummary) return;

    const today = new Date().toDateString();

    // Save daily summary
    const summaries = JSON.parse(localStorage.getItem('dailySummaries') || '[]');
    summaries.push({
      ...todaysSummary,
      timestamp: Date.now()
    });
    localStorage.setItem('dailySummaries', JSON.stringify(summaries));
    localStorage.setItem('lastDayEnded', today);

    setHasEnded(true);
    toast.success('Day ended successfully! Summary saved.');
  };

  if (!todaysSummary) {
    return <div>Loading...</div>;
  }

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
              <BarChart3 className="size-7" />
              Today's Summary
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-300 mt-1">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-10 bg-white/5 dark:bg-black/5 backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div
                className="p-8 rounded-3xl shadow-lg bg-white/30 dark:bg-black/20 backdrop-blur-sm border border-white/20 dark:border-white/10"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-4 rounded-2xl bg-emerald-100">
                    <DollarSign className="size-7 text-emerald-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Total Sales</span>
                </div>
                <p className="text-3xl font-bold" style={{ color: '#48BB78' }}>
                  KSH {todaysSummary.totalSales.toFixed(2)}
                </p>
              </motion.div>

              <motion.div
                className="p-8 rounded-3xl shadow-lg bg-white/30 dark:bg-black/20 backdrop-blur-sm border border-white/20 dark:border-white/10"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-4 rounded-2xl bg-red-100">
                    <DollarSign className="size-7 text-red-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Total Cash Out</span>
                </div>
                <p className="text-3xl font-bold" style={{ color: '#E53E3E' }}>
                  KSH {todaysSummary.totalCashOut.toFixed(2)}
                </p>
              </motion.div>

              <motion.div
                className="p-8 rounded-3xl shadow-lg bg-white/30 dark:bg-black/20 backdrop-blur-sm border border-white/20 dark:border-white/10"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-4 rounded-2xl bg-amber-100">
                    <TrendingUp className="size-7 text-amber-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Net Amount</span>
                </div>
                <p className="text-3xl font-bold" style={{ color: '#D97706' }}>
                  KSH {todaysSummary.netAmount.toFixed(2)}
                </p>
              </motion.div>

              <motion.div
                className="p-8 rounded-3xl shadow-lg bg-white/30 dark:bg-black/20 backdrop-blur-sm border border-white/20 dark:border-white/10"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-4 rounded-2xl bg-blue-100">
                    <Target className="size-7 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Transactions</span>
                </div>
                <p className="text-3xl font-bold" style={{ color: '#6366F1' }}>
                  {todaysSummary.totalTransactions}
                </p>
              </motion.div>
            </div>

            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-xl rounded-3xl overflow-hidden bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10">
                <CardHeader className="bg-white/10 dark:bg-black/10 backdrop-blur-sm border-b border-white/20 dark:border-white/10 text-slate-800 dark:text-white">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <Award className="size-7" />
                    Most Sold Item
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-8 bg-white/5 dark:bg-black/5 backdrop-blur-sm">
                  <div className="flex items-center gap-4">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Award className="size-20 text-yellow-500" />
                    </motion.div>
                    <div>
                      <p className="text-4xl font-bold mb-2 text-indigo-600">
                        {todaysSummary.mostSoldItem}
                      </p>
                      <p className="text-sm text-gray-600">
                        Top performing product today
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {hasEnded ? (
              <motion.div
                className="p-12 rounded-3xl text-center shadow-2xl bg-white/30 dark:bg-black/20 backdrop-blur-sm border border-white/20 dark:border-white/10"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <CheckCircle className="size-24 mx-auto mb-6 text-emerald-500" />
                </motion.div>
                <h3 className="text-4xl font-bold mb-4 text-emerald-600">
                  Day Successfully Ended
                </h3>
                <p className="text-gray-700 text-lg">
                  Today's session has been closed and the summary has been saved.
                </p>
              </motion.div>
            ) : (
              <div className="space-y-6">
                <motion.div
                  className="p-6 rounded-2xl shadow-md"
                  style={{ 
                    background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                    borderLeft: '6px solid #FBBF24'
                  }}
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <p className="text-sm flex items-start gap-2">
                    <span className="text-xl">⚠️</span>
                    <span className="text-gray-700">
                      <strong>Important:</strong> Ending the day will finalize today's summary and 
                      save it for monthly reporting. This action marks the completion of your daily session.
                    </span>
                  </p>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={endDay}
                    className="w-full py-6 rounded-xl text-xl shadow-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0"
                  >
                    <Sparkles className="size-6 mr-3" />
                    End Day Session
                  </Button>
                </motion.div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
