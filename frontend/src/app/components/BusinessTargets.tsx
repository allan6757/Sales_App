import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Target, Plus, Trash2, TrendingUp, CheckCircle2, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from './ui/progress';

interface BusinessTarget {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  type: 'sales' | 'customers' | 'items';
  deadline: string;
  achieved: boolean;
  achievedAt?: string;
  createdAt: string;
}

interface Sale {
  id: string;
  items: Array<any>;
  total: number;
  date: string;
  timestamp: number;
}

export function BusinessTargets() {
  const [targets, setTargets] = useState<BusinessTarget[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [type, setType] = useState<'sales' | 'customers' | 'items'>('customers');
  const [deadline, setDeadline] = useState('');
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    loadTargets();
    updateTargetsProgress();
  }, []);

  const loadTargets = () => {
    const saved = localStorage.getItem('businessTargets');
    if (saved) {
      setTargets(JSON.parse(saved));
    }
  };

  const saveTargets = (newTargets: BusinessTarget[]) => {
    localStorage.setItem('businessTargets', JSON.stringify(newTargets));
    setTargets(newTargets);
  };

  const updateTargetsProgress = () => {
    const saved = localStorage.getItem('businessTargets');
    if (!saved) return;

    const targets: BusinessTarget[] = JSON.parse(saved);
    const salesData = localStorage.getItem('sales');
    const sales: Sale[] = salesData ? JSON.parse(salesData) : [];

    let updated = false;

    const updatedTargets = targets.map(target => {
      if (target.achieved) return target;

      const targetDate = new Date(target.createdAt);
      const relevantSales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= targetDate;
      });

      let currentValue = 0;

      switch (target.type) {
        case 'customers':
          currentValue = relevantSales.length;
          break;
        case 'sales':
          currentValue = relevantSales.reduce((sum, sale) => sum + sale.total, 0);
          break;
        case 'items':
          currentValue = relevantSales.reduce((sum, sale) => {
            return sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
          }, 0);
          break;
      }

      if (currentValue >= target.targetValue && !target.achieved) {
        updated = true;
        toast.success(`Target Achieved! ${target.title}`, {
          description: `Congratulations! You've reached your target of ${target.targetValue} ${target.type}!`,
          duration: 10000,
        });
        return {
          ...target,
          currentValue,
          achieved: true,
          achievedAt: new Date().toISOString()
        };
      }

      if (currentValue !== target.currentValue) {
        updated = true;
        return { ...target, currentValue };
      }

      return target;
    });

    if (updated) {
      saveTargets(updatedTargets);
    }
  };

  const handleAddTarget = () => {
    if (!title || !targetValue || !deadline) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newTarget: BusinessTarget = {
      id: Date.now().toString(),
      title,
      description,
      targetValue: parseFloat(targetValue),
      currentValue: 0,
      type,
      deadline,
      achieved: false,
      createdAt: new Date().toISOString(),
    };

    saveTargets([...targets, newTarget]);
    toast.success('Target created successfully');
    resetForm();
    updateTargetsProgress();
  };

  const handleDelete = (id: string) => {
    saveTargets(targets.filter(t => t.id !== id));
    toast.success('Target deleted');
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTargetValue('');
    setType('customers');
    setDeadline('');
    setShowDialog(false);
  };

  const getProgressPercentage = (target: BusinessTarget) => {
    return Math.min((target.currentValue / target.targetValue) * 100, 100);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'customers': return 'Customers';
      case 'sales': return 'KES Sales';
      case 'items': return 'Items Sold';
      default: return type;
    }
  };

  const formatValue = (value: number, type: string) => {
    if (type === 'sales') {
      return `KES ${value.toLocaleString()}`;
    }
    return value.toString();
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border shadow-lg">
          <CardHeader className="bg-primary text-primary-foreground">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="size-6" />
                  Business Targets
                </CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  Set and track your business goals
                </CardDescription>
              </div>
              <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="secondary">
                    <Plus className="size-4 mr-2" />
                    New Target
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Business Target</DialogTitle>
                    <DialogDescription>
                      Set a goal for your business
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Target Title</Label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., 40 customers in 2 days"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description (Optional)</Label>
                      <Input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Additional details..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Target Type</Label>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value as any)}
                        className="w-full p-2 border rounded-lg bg-input-background"
                      >
                        <option value="customers">Number of Customers</option>
                        <option value="sales">Sales Amount (KES)</option>
                        <option value="items">Items Sold</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Target Value</Label>
                      <Input
                        type="number"
                        value={targetValue}
                        onChange={(e) => setTargetValue(e.target.value)}
                        placeholder="e.g., 40"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Deadline</Label>
                      <Input
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddTarget}>
                      Create Target
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {targets.length === 0 ? (
              <div className="text-center py-12">
                <Target className="size-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No targets yet. Create your first goal!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <AnimatePresence>
                  {targets.map((target) => (
                    <motion.div
                      key={target.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ y: -4 }}
                      className={`p-5 border rounded-lg shadow-sm hover:shadow-md transition-all ${
                        target.achieved ? 'bg-primary/5 border-primary' : 'bg-card'
                      }`}
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-lg">{target.title}</h4>
                              {target.achieved && (
                                <Trophy className="size-5 text-primary" />
                              )}
                            </div>
                            {target.description && (
                              <p className="text-sm text-muted-foreground">{target.description}</p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(target.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{getTypeLabel(target.type)}</span>
                            <span className="font-semibold">
                              {formatValue(target.currentValue, target.type)} / {formatValue(target.targetValue, target.type)}
                            </span>
                          </div>
                          <Progress value={getProgressPercentage(target)} className="h-3" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{getProgressPercentage(target).toFixed(1)}% Complete</span>
                            <span>Due: {new Date(target.deadline).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {target.achieved && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg"
                          >
                            <CheckCircle2 className="size-5 text-primary" />
                            <span className="text-sm font-semibold text-primary">
                              Achieved on {new Date(target.achievedAt!).toLocaleDateString()}
                            </span>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
