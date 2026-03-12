import { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { StockManagement } from './components/StockManagement';
import { MakeSale } from './components/MakeSale';
import { LowStock } from './components/LowStock';
import { CashOut } from './components/CashOut';
import { DailySummary } from './components/DailySummary';
import { MonthlySummary } from './components/MonthlySummary';
import { CalendarReminders } from './components/CalendarReminders';
import { Notes } from './components/Notes';
import { BusinessTargets } from './components/BusinessTargets';
import { Settings } from './components/Settings';
import { Toaster } from './components/ui/sonner';
import { 
  Package, 
  ShoppingCart, 
  AlertTriangle, 
  CreditCard, 
  BarChart3, 
  CalendarDays,
  Store,
  Settings as SettingsIcon,
  FileText,
  Target,
  Bell,
  Clock
} from 'lucide-react';

function FuturisticDateTime() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="hidden sm:flex items-center gap-2 sm:gap-4 px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 dark:from-cyan-400/10 dark:to-blue-400/10 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-cyan-300/30 dark:border-cyan-400/20 shadow-2xl text-xs sm:text-sm">
      <div className="flex items-center gap-1 sm:gap-2">
        <div className="p-1 sm:p-2 bg-cyan-400/20 dark:bg-cyan-400/10 rounded-lg sm:rounded-xl backdrop-blur-sm">
          <Clock className="size-3 sm:size-5 text-cyan-600 dark:text-cyan-400" />
        </div>
        <div className="flex flex-col">
          <div className="text-xs sm:text-sm font-mono font-bold text-cyan-700 dark:text-cyan-300 tracking-wider">
            {formatTime(currentTime)}
          </div>
          <div className="text-xs font-medium text-cyan-600 dark:text-cyan-400 tracking-wide hidden sm:block">
            {formatDate(currentTime)}
          </div>
        </div>
      </div>
      <div className="w-px h-6 sm:h-8 bg-gradient-to-b from-transparent via-cyan-400/50 to-transparent"></div>
      <div className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">
        LIVE
      </div>
    </div>
  );
}

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDataUpdate = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Toaster />
        
        {/* Header */}
        <header className="bg-white/20 dark:bg-black/20 backdrop-blur-xl border-b border-white/20 dark:border-white/10 text-slate-800 dark:text-white shadow-2xl sticky top-0 z-50">
          <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-8">
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                <div className="p-2 sm:p-3 bg-white/10 dark:bg-white/5 rounded-xl sm:rounded-2xl backdrop-blur-sm border border-white/20 dark:border-white/10 flex-shrink-0">
                  <img 
                    src="/sales-logo.svg" 
                    alt="$ALEs_ Logo" 
                    className="size-7 sm:size-10" 
                    onLoad={() => console.log('Sales Logo loaded successfully')}
                    onError={(e) => {
                      console.log('Sales Logo failed, trying focus-logo.png');
                      e.currentTarget.src = '/focus-logo.png';
                      e.currentTarget.onerror = () => {
                        console.log('Focus Logo failed, trying logo.svg');
                        e.currentTarget.src = '/logo.svg';
                        e.currentTarget.onerror = () => {
                          console.log('All logos failed, using fallback');
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.classList.remove('hidden');
                        };
                      };
                    }}
                  />
                  <div className="size-7 sm:size-10 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold text-lg sm:text-2xl shadow-lg hidden">
                    $
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-4xl font-bold text-slate-800 dark:text-white truncate">
                    $ALEs_
                  </h1>
                  <p className="text-xs sm:text-lg text-slate-600 dark:text-slate-300 mt-0 sm:mt-1 truncate">
                    Professional Business Management Solution
                  </p>
                </div>
              </div>
              
              <div className="flex-shrink-0">
                <FuturisticDateTime />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-3 sm:px-6 py-4 sm:py-8">
          <Tabs defaultValue="stock" className="space-y-4 sm:space-y-8">
            <div className="bg-white/30 dark:bg-black/20 backdrop-blur-xl rounded-xl sm:rounded-2xl p-1 sm:p-2 shadow-2xl border border-white/20 dark:border-white/10 overflow-x-auto">
              <TabsList className="grid grid-cols-5 lg:grid-cols-10 gap-0.5 sm:gap-1 h-auto p-0.5 sm:p-1 bg-transparent min-w-max sm:min-w-full">
                <TabsTrigger 
                  value="stock" 
                  className="flex flex-col items-center gap-1 sm:gap-2 py-2 sm:py-4 px-2 sm:px-3 rounded-lg sm:rounded-xl text-xs sm:text-sm data-[state=active]:bg-white/20 dark:data-[state=active]:bg-white/10 data-[state=active]:backdrop-blur-sm data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-white/30 dark:data-[state=active]:border-white/20 transition-all duration-200 hover:bg-white/10 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
                >
                  <Package className="size-4 sm:size-5" />
                  <span className="text-xs font-semibold hidden sm:inline">Stock</span>
                  <span className="text-xs font-semibold sm:hidden">Stock</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="sale" 
                  className="flex flex-col items-center gap-1 sm:gap-2 py-2 sm:py-4 px-2 sm:px-3 rounded-lg sm:rounded-xl text-xs sm:text-sm data-[state=active]:bg-white/20 dark:data-[state=active]:bg-white/10 data-[state=active]:backdrop-blur-sm data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-white/30 dark:data-[state=active]:border-white/20 transition-all duration-200 hover:bg-white/10 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
                >
                  <ShoppingCart className="size-4 sm:size-5" />
                  <span className="text-xs font-semibold">Sale</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="lowstock" 
                  className="flex flex-col items-center gap-1 sm:gap-2 py-2 sm:py-4 px-2 sm:px-3 rounded-lg sm:rounded-xl text-xs sm:text-sm data-[state=active]:bg-white/20 dark:data-[state=active]:bg-white/10 data-[state=active]:backdrop-blur-sm data-[state=active]:text-orange-600 dark:data-[state=active]:text-orange-400 data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-white/30 dark:data-[state=active]:border-white/20 transition-all duration-200 hover:bg-white/10 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
                >
                  <AlertTriangle className="size-4 sm:size-5" />
                  <span className="text-xs font-semibold">Alerts</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="cashout" 
                  className="flex flex-col items-center gap-1 sm:gap-2 py-2 sm:py-4 px-2 sm:px-3 rounded-lg sm:rounded-xl text-xs sm:text-sm data-[state=active]:bg-white/20 dark:data-[state=active]:bg-white/10 data-[state=active]:backdrop-blur-sm data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400 data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-white/30 dark:data-[state=active]:border-white/20 transition-all duration-200 hover:bg-white/10 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
                >
                  <CreditCard className="size-4 sm:size-5" />
                  <span className="text-xs font-semibold">Cash Out</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="daily" 
                  className="flex flex-col items-center gap-1 sm:gap-2 py-2 sm:py-4 px-2 sm:px-3 rounded-lg sm:rounded-xl text-xs sm:text-sm data-[state=active]:bg-white/20 dark:data-[state=active]:bg-white/10 data-[state=active]:backdrop-blur-sm data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-white/30 dark:data-[state=active]:border-white/20 transition-all duration-200 hover:bg-white/10 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
                >
                  <BarChart3 className="size-4 sm:size-5" />
                  <span className="text-xs font-semibold">Daily</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="monthly" 
                  className="flex flex-col items-center gap-1 sm:gap-2 py-2 sm:py-4 px-2 sm:px-3 rounded-lg sm:rounded-xl text-xs sm:text-sm data-[state=active]:bg-white/20 dark:data-[state=active]:bg-white/10 data-[state=active]:backdrop-blur-sm data-[state=active]:text-cyan-600 dark:data-[state=active]:text-cyan-400 data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-white/30 dark:data-[state=active]:border-white/20 transition-all duration-200 hover:bg-white/10 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
                >
                  <CalendarDays className="size-4 sm:size-5" />
                  <span className="text-xs font-semibold">Monthly</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="reminders" 
                  className="flex flex-col items-center gap-1 sm:gap-2 py-2 sm:py-4 px-2 sm:px-3 rounded-lg sm:rounded-xl text-xs sm:text-sm data-[state=active]:bg-white/20 dark:data-[state=active]:bg-white/10 data-[state=active]:backdrop-blur-sm data-[state=active]:text-yellow-600 dark:data-[state=active]:text-yellow-400 data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-white/30 dark:data-[state=active]:border-white/20 transition-all duration-200 hover:bg-white/10 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
                >
                  <Bell className="size-4 sm:size-5" />
                  <span className="text-xs font-semibold">Reminders</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="notes" 
                  className="flex flex-col items-center gap-1 sm:gap-2 py-2 sm:py-4 px-2 sm:px-3 rounded-lg sm:rounded-xl text-xs sm:text-sm data-[state=active]:bg-white/20 dark:data-[state=active]:bg-white/10 data-[state=active]:backdrop-blur-sm data-[state=active]:text-slate-600 dark:data-[state=active]:text-slate-400 data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-white/30 dark:data-[state=active]:border-white/20 transition-all duration-200 hover:bg-white/10 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
                >
                  <FileText className="size-4 sm:size-5" />
                  <span className="text-xs font-semibold">Notes</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="targets" 
                  className="flex flex-col items-center gap-1 sm:gap-2 py-2 sm:py-4 px-2 sm:px-3 rounded-lg sm:rounded-xl text-xs sm:text-sm data-[state=active]:bg-white/20 dark:data-[state=active]:bg-white/10 data-[state=active]:backdrop-blur-sm data-[state=active]:text-rose-600 dark:data-[state=active]:text-rose-400 data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-white/30 dark:data-[state=active]:border-white/20 transition-all duration-200 hover:bg-white/10 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
                >
                  <Target className="size-4 sm:size-5" />
                  <span className="text-xs font-semibold">Targets</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="settings" 
                  className="flex flex-col items-center gap-1 sm:gap-2 py-2 sm:py-4 px-2 sm:px-3 rounded-lg sm:rounded-xl text-xs sm:text-sm data-[state=active]:bg-white/20 dark:data-[state=active]:bg-white/10 data-[state=active]:backdrop-blur-sm data-[state=active]:text-gray-600 dark:data-[state=active]:text-gray-400 data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-white/30 dark:data-[state=active]:border-white/20 transition-all duration-200 hover:bg-white/10 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
                >
                  <SettingsIcon className="size-4 sm:size-5" />
                  <span className="text-xs font-semibold">Settings</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="stock" className="space-y-4">
              <StockManagement onStockUpdate={handleDataUpdate} key={`stock-${refreshKey}`} />
            </TabsContent>

            <TabsContent value="sale" className="space-y-4">
              <MakeSale onSaleComplete={handleDataUpdate} key={`sale-${refreshKey}`} />
            </TabsContent>

            <TabsContent value="lowstock" className="space-y-4">
              <LowStock key={`lowstock-${refreshKey}`} />
            </TabsContent>

            <TabsContent value="cashout" className="space-y-4">
              <CashOut key={`cashout-${refreshKey}`} />
            </TabsContent>

            <TabsContent value="daily" className="space-y-4">
              <DailySummary key={`daily-${refreshKey}`} />
            </TabsContent>

            <TabsContent value="monthly" className="space-y-4">
              <MonthlySummary key={`monthly-${refreshKey}`} />
            </TabsContent>

            <TabsContent value="reminders" className="space-y-4">
              <CalendarReminders key={`reminders-${refreshKey}`} />
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <Notes key={`notes-${refreshKey}`} />
            </TabsContent>

            <TabsContent value="targets" className="space-y-4">
              <BusinessTargets key={`targets-${refreshKey}`} />
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Settings />
            </TabsContent>
          </Tabs>
        </main>

        {/* Footer */}
        <footer className="mt-12 sm:mt-20 py-6 sm:py-8 bg-white/10 dark:bg-black/20 backdrop-blur-xl border-t border-white/20 dark:border-white/10 text-slate-700 dark:text-slate-300">
          <div className="container mx-auto px-3 sm:px-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <p className="text-base sm:text-lg font-semibold">
                $ALEs_ - Premium Business Solution
              </p>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              © 2024 Professional Business Management System
            </p>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}
