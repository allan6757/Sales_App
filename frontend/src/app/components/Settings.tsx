import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Settings as SettingsIcon, Lock, Unlock, Trash2, Sun, Moon, Monitor, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../contexts/ThemeContext';

export function Settings() {
  const { theme, setTheme } = useTheme();
  const [personalMode, setPersonalMode] = useState(() => {
    return localStorage.getItem('personalMode') === 'true';
  });
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);

  const getStoredPassword = () => {
    return localStorage.getItem('appPassword') || 'Allan123';
  };

  const togglePersonalMode = () => {
    setShowPasswordDialog(true);
  };

  const handlePasswordSubmit = () => {
    const storedPassword = getStoredPassword();
    if (password === storedPassword) {
      const newMode = !personalMode;
      setPersonalMode(newMode);
      localStorage.setItem('personalMode', newMode.toString());
      toast.success(`Personal Mode ${newMode ? 'Enabled' : 'Disabled'}`);
      setPassword('');
      setShowPasswordDialog(false);
    } else {
      toast.error('Incorrect password');
    }
  };

  const handleChangePassword = () => {
    const storedPassword = getStoredPassword();
    if (password !== storedPassword) {
      toast.error('Current password is incorrect');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    localStorage.setItem('appPassword', newPassword);
    toast.success('Password changed successfully');
    setPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowChangePasswordDialog(false);
  };

  const handleResetApp = () => {
    const storedPassword = getStoredPassword();
    if (resetPassword !== storedPassword) {
      toast.error('Incorrect password');
      return;
    }

    // Clear all data except password
    const savedPassword = localStorage.getItem('appPassword');
    const savedTheme = localStorage.getItem('theme');
    
    localStorage.clear();
    
    if (savedPassword) {
      localStorage.setItem('appPassword', savedPassword);
    }
    if (savedTheme) {
      localStorage.setItem('theme', savedTheme);
    }
    
    setPersonalMode(false);
    setResetPassword('');
    setShowResetDialog(false);
    toast.success('App has been reset successfully');
    window.location.reload();
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
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="size-6" />
              Settings
            </CardTitle>
            <CardDescription className="text-primary-foreground/80">
              Configure your app preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-8">
            {/* Theme Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Monitor className="size-5" />
                Theme
              </h3>
              <div className="space-y-2">
                <Label>Appearance</Label>
                <Select value={theme} onValueChange={(value: any) => setTheme(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="size-4" />
                        Light
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="size-4" />
                        Dark
                      </div>
                    </SelectItem>
                    <SelectItem value="auto">
                      <div className="flex items-center gap-2">
                        <Monitor className="size-4" />
                        Auto (System)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred theme or let it follow your system settings
                </p>
              </div>
            </div>

            {/* Personal Mode */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                {personalMode ? <Lock className="size-5" /> : <Unlock className="size-5" />}
                Personal Mode (Stock Protection)
              </h3>
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                <div className="space-y-1">
                  <Label>Restrict Stock Management</Label>
                  <p className="text-sm text-muted-foreground">
                    When enabled, only you can add or edit stock with password
                  </p>
                </div>
                <Switch
                  checked={personalMode}
                  onCheckedChange={togglePersonalMode}
                />
              </div>
              {personalMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 border border-primary rounded-lg bg-primary/5"
                >
                  <p className="text-sm font-medium text-primary flex items-center gap-2">
                    <Lock className="size-4" />
                    Stock management is currently protected
                  </p>
                </motion.div>
              )}
            </div>

            {/* Change Password */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Lock className="size-5" />
                Security
              </h3>
              <Dialog open={showChangePasswordDialog} onOpenChange={setShowChangePasswordDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    Change Password
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>
                      Set a new password for your app
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Current Password</Label>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter current password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>New Password</Label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm New Password</Label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowChangePasswordDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleChangePassword}>
                      Update Password
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Reset App */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-destructive">
                <AlertTriangle className="size-5" />
                Danger Zone
              </h3>
              <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="size-4 mr-2" />
                    Reset App
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-destructive">Reset Application</DialogTitle>
                    <DialogDescription>
                      This will permanently delete all your data including stock, sales, cash outs, notes, reminders, and targets. This action cannot be undone!
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="p-4 border border-destructive rounded-lg bg-destructive/10">
                      <p className="text-sm font-medium text-destructive">
                        Warning: All data will be permanently deleted
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Enter Password to Confirm</Label>
                      <Input
                        type="password"
                        value={resetPassword}
                        onChange={(e) => setResetPassword(e.target.value)}
                        placeholder="Enter your password"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {
                      setShowResetDialog(false);
                      setResetPassword('');
                    }}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleResetApp}>
                      Reset App
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Password</DialogTitle>
            <DialogDescription>
              Password required to change Personal Mode settings
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
            }}>
              Cancel
            </Button>
            <Button onClick={handlePasswordSubmit}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
