import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { DollarSign, Trash2, Sparkles, CreditCard, Receipt as ReceiptIcon, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface CashOutEntry {
  id: string;
  amount: number;
  reason: string;
  date: string;
  timestamp: number;
}

export function CashOut() {
  const [cashOuts, setCashOuts] = useState<CashOutEntry[]>([]);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    loadCashOuts();
  }, []);

  const loadCashOuts = () => {
    const today = new Date().toDateString();
    const saved = localStorage.getItem('cashOuts');
    if (saved) {
      const allCashOuts: CashOutEntry[] = JSON.parse(saved);
      const todaysCashOuts = allCashOuts.filter(
        entry => new Date(entry.date).toDateString() === today
      );
      setCashOuts(todaysCashOuts);
    }
  };

  const handleAddCashOut = () => {
    if (!amount || !reason) {
      toast.error('Please fill in all fields');
      return;
    }

    const cashOutAmount = parseFloat(amount);
    if (cashOutAmount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    const newEntry: CashOutEntry = {
      id: Date.now().toString(),
      amount: cashOutAmount,
      reason,
      date: new Date().toISOString(),
      timestamp: Date.now()
    };

    const saved = localStorage.getItem('cashOuts');
    const allCashOuts = saved ? JSON.parse(saved) : [];
    allCashOuts.push(newEntry);
    localStorage.setItem('cashOuts', JSON.stringify(allCashOuts));

    setCashOuts([...cashOuts, newEntry]);
    setAmount('');
    setReason('');
    toast.success('Cash out recorded successfully');
  };

  const handleDelete = (id: string) => {
    const saved = localStorage.getItem('cashOuts');
    if (saved) {
      const allCashOuts: CashOutEntry[] = JSON.parse(saved);
      const updated = allCashOuts.filter(entry => entry.id !== id);
      localStorage.setItem('cashOuts', JSON.stringify(updated));
      setCashOuts(cashOuts.filter(entry => entry.id !== id));
      toast.success('Cash out entry deleted');
    }
  };

  const getTotalCashOut = () => {
    return cashOuts.reduce((sum, entry) => sum + entry.amount, 0);
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
              <CreditCard className="size-7" />
              Record Cash Out
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-300 mt-1">
              Track expenses and cash withdrawals
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8 space-y-8 bg-white/5 dark:bg-black/5 backdrop-blur-sm">
            <div className="grid grid-cols-1 gap-6">
              <motion.div 
                className="space-y-2"
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Label htmlFor="amount" className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                  <CreditCard className="size-4 text-indigo-500 dark:text-indigo-400" />
                  Amount (KSH)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="rounded-xl border-2 transition-all focus:shadow-lg text-lg text-indigo-600 dark:text-indigo-400 font-semibold h-14 border-white/30 dark:border-white/20 bg-white/20 dark:bg-black/20 backdrop-blur-sm focus:border-indigo-400 dark:focus:border-indigo-500"
                />
              </motion.div>
              <motion.div 
                className="space-y-2"
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Label htmlFor="reason" className="text-slate-700 dark:text-slate-300 font-semibold">Reason / Description</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter reason for cash out (e.g., supplies, utilities, wages...)"
                  rows={4}
                  className="rounded-xl border-2 transition-all focus:shadow-lg resize-none text-indigo-600 dark:text-indigo-400 font-semibold border-white/30 dark:border-white/20 bg-white/20 dark:bg-black/20 backdrop-blur-sm focus:border-indigo-400 dark:focus:border-indigo-500"
                />
              </motion.div>
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleAddCashOut}
                className="w-full rounded-xl py-4 text-lg shadow-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0"
              >
                <Plus className="size-5 mr-2" />
                Record Cash Out
              </Button>
            </motion.div>
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
            <CardTitle className="flex items-center gap-3 text-xl">
              <ReceiptIcon className="size-7" />
              Today's Cash Outs
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-300 mt-1">
              All recorded expenses for today
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8 bg-white/5 dark:bg-black/5 backdrop-blur-sm">
            {cashOuts.length === 0 ? (
              <motion.div
                className="text-center py-16"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                    <CreditCard className="size-12 text-slate-500" />
                  </div>
                <p className="text-gray-500 text-lg">No cash outs recorded today</p>
              </motion.div>
            ) : (
              <>
                <div className="space-y-4 mb-8">
                  <AnimatePresence>
                    {cashOuts.map((entry, index) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="flex items-start justify-between p-6 rounded-2xl shadow-lg bg-white/30 dark:bg-black/20 backdrop-blur-sm border border-white/20 dark:border-white/10"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-3xl font-bold" style={{ color: '#E53E3E' }}>
                              -KSH {entry.amount.toFixed(2)}
                            </span>
                            <span className="px-3 py-1 text-xs font-semibold rounded-full" style={{ 
                              background: 'linear-gradient(135deg, #FC8181 0%, #F56565 100%)',
                              color: 'white'
                            }}>
                              {new Date(entry.date).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">{entry.reason}</p>
                        </div>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(entry.id)}
                            className="rounded-full"
                            style={{ color: '#E53E3E' }}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </motion.div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <motion.div
                  className="p-8 rounded-3xl shadow-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xl text-white font-semibold flex items-center gap-2">
                      <Sparkles className="size-6" />
                      Total Cash Out Today:
                    </span>
                    <span className="text-4xl font-bold text-white">
                      KSH {getTotalCashOut().toFixed(2)}
                    </span>
                  </div>
                </motion.div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
