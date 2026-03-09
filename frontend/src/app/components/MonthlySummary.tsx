import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { CalendarDays, TrendingUp, DollarSign, Award, Bell, BarChart3, Star } from 'lucide-react';

interface DailySummary {
  date: string;
  totalSales: number;
  totalCashOut: number;
  netAmount: number;
  mostSoldItem: string;
  totalTransactions: number;
  timestamp: number;
}

interface MonthlySummary {
  month: string;
  year: number;
  totalSales: number;
  totalCashOut: number;
  netAmount: number;
  mostSoldItem: string;
  totalTransactions: number;
  daysActive: number;
}

export function MonthlySummary() {
  const [monthlySummaries, setMonthlySummaries] = useState<MonthlySummary[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [notification, setNotification] = useState<string>('');

  useEffect(() => {
    calculateMonthlySummaries();
    checkMonthlyNotification();
  }, []);

  const checkMonthlyNotification = () => {
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    // Check if today is the last day of the month
    if (today.getDate() === lastDay.getDate()) {
      const monthName = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      setNotification(`📊 Monthly Summary Available for ${monthName}`);
    }
  };

  const calculateMonthlySummaries = () => {
    const dailySummaries: DailySummary[] = JSON.parse(
      localStorage.getItem('dailySummaries') || '[]'
    );

    if (dailySummaries.length === 0) {
      return;
    }

    // Group by month and year
    const monthlyData: { [key: string]: MonthlySummary } = {};

    dailySummaries.forEach(summary => {
      const date = new Date(summary.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'long' });
      const year = date.getFullYear();

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthName,
          year,
          totalSales: 0,
          totalCashOut: 0,
          netAmount: 0,
          mostSoldItem: '',
          totalTransactions: 0,
          daysActive: 0
        };
      }

      const monthly = monthlyData[monthKey];
      monthly.totalSales += summary.totalSales;
      monthly.totalCashOut += summary.totalCashOut;
      monthly.netAmount += summary.netAmount;
      monthly.totalTransactions += summary.totalTransactions;
      monthly.daysActive += 1;
    });

    // Calculate most sold item per month
    const sales = JSON.parse(localStorage.getItem('sales') || '[]');
    Object.keys(monthlyData).forEach(monthKey => {
      const [year, month] = monthKey.split('-').map(Number);
      const monthSales = sales.filter((sale: any) => {
        const saleDate = new Date(sale.date);
        return saleDate.getFullYear() === year && saleDate.getMonth() === month;
      });

      const itemCounts: { [key: string]: number } = {};
      monthSales.forEach((sale: any) => {
        sale.items.forEach((item: any) => {
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

      monthlyData[monthKey].mostSoldItem = mostSoldItem;
    });

    const summaries = Object.values(monthlyData).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return new Date(`${b.month} 1, ${b.year}`).getMonth() - new Date(`${a.month} 1, ${a.year}`).getMonth();
    });

    setMonthlySummaries(summaries);
    if (summaries.length > 0 && !selectedMonth) {
      setSelectedMonth(`${summaries[0].month} ${summaries[0].year}`);
    }
  };

  const selectedSummary = monthlySummaries.find(
    s => `${s.month} ${s.year}` === selectedMonth
  );

  return (
    <div className="space-y-6">
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-white/30 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10">
            <CardContent className="pt-6">
              <motion.div
                className="flex items-center gap-4"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Bell className="size-8 text-indigo-600 dark:text-indigo-400" />
                </motion.div>
                <p className="font-bold text-lg text-indigo-600 dark:text-indigo-400">
                  {notification}
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-0 shadow-2xl overflow-hidden rounded-3xl bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10">
          <CardHeader className="bg-white/10 dark:bg-black/10 backdrop-blur-sm border-b border-white/20 dark:border-white/10 text-slate-800 dark:text-white">
            <CardTitle className="flex items-center gap-3 text-xl">
              <CalendarDays className="size-7" />
              Monthly Summary
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-300 mt-1">
              View your monthly performance reports
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8 bg-white/5 dark:bg-black/5 backdrop-blur-sm">
            {monthlySummaries.length === 0 ? (
              <motion.div
                className="text-center py-16"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800/20 dark:to-slate-900/20 rounded-full flex items-center justify-center">
                    <CalendarDays className="size-12 text-slate-500 dark:text-slate-400" />
                  </div>
                </motion.div>
                <h3 className="text-2xl font-bold text-slate-600 dark:text-slate-400 mb-3">
                  No Monthly Data Available
                </h3>
                <p className="text-slate-500 dark:text-slate-500">
                  Complete at least one day session to see monthly summaries
                </p>
              </motion.div>
            ) : (
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-semibold mb-3 flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <BarChart3 className="size-4 text-indigo-500 dark:text-indigo-400" />
                    Select Month
                  </label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="rounded-2xl border-2 h-14 text-lg shadow-lg bg-white/20 dark:bg-black/20 backdrop-blur-sm border-white/30 dark:border-white/20">
                      <SelectValue placeholder="Select a month" />
                    </SelectTrigger>
                    <SelectContent>
                      {monthlySummaries.map((summary) => (
                        <SelectItem
                          key={`${summary.month}-${summary.year}`}
                          value={`${summary.month} ${summary.year}`}
                        >
                          📅 {summary.month} {summary.year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedSummary && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <motion.div
                        className="p-6 rounded-3xl shadow-lg"
                        style={{ background: 'linear-gradient(135deg, #E6FFFA 0%, #B2F5EA 100%)' }}
                        whileHover={{ scale: 1.05, y: -5 }}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-3 rounded-2xl" style={{ background: 'rgba(72, 187, 120, 0.2)' }}>
                            <DollarSign className="size-6" style={{ color: '#48BB78' }} />
                          </div>
                          <span className="text-sm font-medium text-gray-600">Total Sales</span>
                        </div>
                        <p className="text-3xl font-bold" style={{ color: '#48BB78' }}>
                          KSH {selectedSummary.totalSales.toFixed(2)}
                        </p>
                      </motion.div>

                      <motion.div
                        className="p-6 rounded-3xl shadow-lg"
                        style={{ background: 'linear-gradient(135deg, #FFF5F7 0%, #FED7D7 100%)' }}
                        whileHover={{ scale: 1.05, y: -5 }}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-3 rounded-2xl" style={{ background: 'rgba(229, 62, 62, 0.2)' }}>
                            <DollarSign className="size-6" style={{ color: '#E53E3E' }} />
                          </div>
                          <span className="text-sm font-medium text-gray-600">Total Cash Out</span>
                        </div>
                        <p className="text-3xl font-bold" style={{ color: '#E53E3E' }}>
                          KSH {selectedSummary.totalCashOut.toFixed(2)}
                        </p>
                      </motion.div>

                      <motion.div
                        className="p-6 rounded-3xl shadow-lg"
                        style={{ background: 'linear-gradient(135deg, #FEF3C7 0%, #FCD34D 100%)' }}
                        whileHover={{ scale: 1.05, y: -5 }}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-3 rounded-2xl" style={{ background: 'rgba(251, 191, 36, 0.3)' }}>
                            <TrendingUp className="size-6" style={{ color: '#D97706' }} />
                          </div>
                          <span className="text-sm font-medium text-gray-600">Net Amount</span>
                        </div>
                        <p className="text-3xl font-bold" style={{ color: '#D97706' }}>
                          KSH {selectedSummary.netAmount.toFixed(2)}
                        </p>
                      </motion.div>

                      <motion.div
                        className="p-6 rounded-3xl shadow-lg"
                        style={{ background: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)' }}
                        whileHover={{ scale: 1.05, y: -5 }}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-3 rounded-2xl" style={{ background: 'rgba(99, 102, 241, 0.2)' }}>
                            <CalendarDays className="size-6" style={{ color: '#6366F1' }} />
                          </div>
                          <span className="text-sm font-medium text-gray-600">Days Active</span>
                        </div>
                        <p className="text-3xl font-bold" style={{ color: '#6366F1' }}>
                          {selectedSummary.daysActive}
                        </p>
                      </motion.div>

                      <motion.div
                        className="p-6 rounded-3xl shadow-lg"
                        style={{ background: 'linear-gradient(135deg, #F3E8FF 0%, #DDD6FE 100%)' }}
                        whileHover={{ scale: 1.05, y: -5 }}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-3 rounded-2xl" style={{ background: 'rgba(139, 92, 246, 0.2)' }}>
                            <TrendingUp className="size-6" style={{ color: '#8B5CF6' }} />
                          </div>
                          <span className="text-sm font-medium text-gray-600">Transactions</span>
                        </div>
                        <p className="text-3xl font-bold" style={{ color: '#8B5CF6' }}>
                          {selectedSummary.totalTransactions}
                        </p>
                      </motion.div>

                      <motion.div
                        className="p-6 rounded-3xl shadow-lg"
                        style={{ background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)' }}
                        whileHover={{ scale: 1.05, y: -5 }}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-3 rounded-2xl" style={{ background: 'rgba(249, 115, 22, 0.2)' }}>
                            <Star className="size-6" style={{ color: '#F97316' }} />
                          </div>
                          <span className="text-sm font-medium text-gray-600">Avg Daily Sales</span>
                        </div>
                        <p className="text-3xl font-bold" style={{ color: '#F97316' }}>
                          KSH {(selectedSummary.totalSales / selectedSummary.daysActive).toFixed(2)}
                        </p>
                      </motion.div>
                    </div>

                    <Card className="border-0 shadow-lg rounded-3xl overflow-hidden">
                      <CardHeader style={{ background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)' }}>
                        <CardTitle className="flex items-center gap-2 text-white">
                          <Award className="size-6" />
                          🏆 Most Sold Item This Month
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-8">
                        <div className="flex items-center gap-6">
                          <motion.div
                            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                            transition={{ duration: 3, repeat: Infinity }}
                          >
                            <Award className="size-20" style={{ color: '#FBBF24' }} />
                          </motion.div>
                          <div>
                            <p className="text-5xl font-bold mb-2" style={{ color: '#667EEA' }}>
                              {selectedSummary.mostSoldItem}
                            </p>
                            <p className="text-gray-600">
                              Top performing product for {selectedSummary.month} {selectedSummary.year}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <motion.div
                      className="p-8 rounded-3xl shadow-lg"
                      style={{ 
                        background: 'linear-gradient(135deg, #E6FFFA 0%, #B2F5EA 100%)',
                        borderLeft: '8px solid #48BB78'
                      }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h4 className="font-bold text-xl mb-4 flex items-center gap-2" style={{ color: '#2F855A' }}>
                        <Sparkles className="size-6" />
                        📈 Performance Insights
                      </h4>
                      <ul className="space-y-3 text-gray-700">
                        <li className="flex items-start gap-3">
                          <span className="text-2xl">📊</span>
                          <span>
                            Average transactions per day:{' '}
                            <strong className="text-lg">{(selectedSummary.totalTransactions / selectedSummary.daysActive).toFixed(1)}</strong>
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-2xl">💰</span>
                          <span>
                            Total profit (after cash outs):{' '}
                            <strong className="text-lg" style={{ color: '#48BB78' }}>
                              KSH {selectedSummary.netAmount.toFixed(2)}
                            </strong>
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-2xl">📅</span>
                          <span>
                            Business was active for{' '}
                            <strong className="text-lg">{selectedSummary.daysActive} days</strong> this month
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-2xl">🎯</span>
                          <span>
                            Average profit per active day:{' '}
                            <strong className="text-lg" style={{ color: '#48BB78' }}>
                              KSH {(selectedSummary.netAmount / selectedSummary.daysActive).toFixed(2)}
                            </strong>
                          </span>
                        </li>
                      </ul>
                    </motion.div>
                  </motion.div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
