import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Calendar as CalendarIcon, Bell, Trash2, Plus, Check } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Reminder {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  completed: boolean;
  createdAt: string;
}

export function CalendarReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    loadReminders();
    checkReminders();
    const interval = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const loadReminders = () => {
    const saved = localStorage.getItem('reminders');
    if (saved) {
      setReminders(JSON.parse(saved));
    }
  };

  const saveReminders = (newReminders: Reminder[]) => {
    localStorage.setItem('reminders', JSON.stringify(newReminders));
    setReminders(newReminders);
  };

  const checkReminders = () => {
    const saved = localStorage.getItem('reminders');
    if (!saved) return;

    const reminders: Reminder[] = JSON.parse(saved);
    const now = new Date();
    
    reminders.forEach(reminder => {
      if (reminder.completed) return;
      
      const reminderDateTime = new Date(`${reminder.date}T${reminder.time}`);
      const diff = reminderDateTime.getTime() - now.getTime();
      
      // Notify if reminder is within 5 minutes
      if (diff > 0 && diff <= 300000) {
        toast.info(`Reminder: ${reminder.title}`, {
          description: reminder.description,
          duration: 10000,
        });
      }
    });
  };

  const handleAddReminder = () => {
    if (!title || !date || !time) {
      toast.error('Please fill in all fields');
      return;
    }

    const newReminder: Reminder = {
      id: Date.now().toString(),
      title,
      description,
      date,
      time,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    saveReminders([...reminders, newReminder]);
    toast.success('Reminder added successfully');
    setTitle('');
    setDescription('');
    setDate('');
    setTime('');
    setShowDialog(false);
  };

  const toggleComplete = (id: string) => {
    const updated = reminders.map(r =>
      r.id === id ? { ...r, completed: !r.completed } : r
    );
    saveReminders(updated);
  };

  const deleteReminder = (id: string) => {
    saveReminders(reminders.filter(r => r.id !== id));
    toast.success('Reminder deleted');
  };

  const sortedReminders = [...reminders].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });

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
                  <CalendarIcon className="size-6" />
                  Calendar & Reminders
                </CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  Schedule and manage your reminders
                </CardDescription>
              </div>
              <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="secondary">
                    <Plus className="size-4 mr-2" />
                    Add Reminder
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Reminder</DialogTitle>
                    <DialogDescription>
                      Set up a new reminder for important tasks
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Restock inventory"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description (Optional)</Label>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Additional details..."
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Input
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Time</Label>
                        <Input
                          type="time"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddReminder}>
                      Add Reminder
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {sortedReminders.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="size-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No reminders yet. Create your first one!</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {sortedReminders.map((reminder) => (
                    <motion.div
                      key={reminder.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`p-4 border rounded-lg ${
                        reminder.completed ? 'bg-muted/50 opacity-60' : 'bg-card'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleComplete(reminder.id)}
                          className="mt-1"
                        >
                          {reminder.completed ? (
                            <Check className="size-5 text-primary" />
                          ) : (
                            <div className="size-5 border-2 rounded" />
                          )}
                        </Button>
                        <div className="flex-1">
                          <h4 className={`font-semibold ${reminder.completed ? 'line-through' : ''}`}>
                            {reminder.title}
                          </h4>
                          {reminder.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {reminder.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="size-3" />
                              {format(new Date(reminder.date), 'MMM dd, yyyy')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Bell className="size-3" />
                              {reminder.time}
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteReminder(reminder.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </Button>
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
