import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { Loader2, TrendingUp, Users, Diamond, Calendar, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DIAMOND_COST_LABELS } from '@/hooks/useCredits';

interface UsageByModule {
  module: string;
  label: string;
  total: number;
  percentage: number;
}

interface TopSpender {
  user_id: string;
  email: string;
  full_name: string | null;
  total_used: number;
}

interface DailyUsage {
  date: string;
  total: number;
}

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  '#8B5CF6',
  '#F59E0B',
  '#10B981',
  '#EC4899',
  '#6366F1',
];

const CreditAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('month');
  const [totalConsumed, setTotalConsumed] = useState(0);
  const [usageByModule, setUsageByModule] = useState<UsageByModule[]>([]);
  const [topSpenders, setTopSpenders] = useState<TopSpender[]>([]);
  const [dailyUsage, setDailyUsage] = useState<DailyUsage[]>([]);
  const [transactionCount, setTransactionCount] = useState(0);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Calculate date range based on period
      const now = new Date();
      let startDate: Date;
      
      if (period === 'today') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (period === 'week') {
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
      } else {
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
      }

      // Fetch credit transactions
      const { data: transactions, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('transaction_type', 'deduction')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate total consumed
      const total = transactions?.reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0;
      setTotalConsumed(total);
      setTransactionCount(transactions?.length || 0);

      // Group by feature_key for module usage
      const moduleMap: Record<string, number> = {};
      transactions?.forEach(t => {
        const key = t.feature_key || 'OTHER';
        moduleMap[key] = (moduleMap[key] || 0) + Math.abs(t.amount);
      });

      const moduleData: UsageByModule[] = Object.entries(moduleMap)
        .map(([module, total]) => ({
          module,
          label: DIAMOND_COST_LABELS[module as keyof typeof DIAMOND_COST_LABELS] || module,
          total,
          percentage: total > 0 ? Math.round((total / (totalConsumed || 1)) * 100) : 0,
        }))
        .sort((a, b) => b.total - a.total);

      // Recalculate percentages with correct total
      const correctedModuleData = moduleData.map(m => ({
        ...m,
        percentage: Math.round((m.total / total) * 100),
      }));

      setUsageByModule(correctedModuleData);

      // Group by user for top spenders
      const userMap: Record<string, number> = {};
      transactions?.forEach(t => {
        if (t.user_id) {
          userMap[t.user_id] = (userMap[t.user_id] || 0) + Math.abs(t.amount);
        }
      });

      const userIds = Object.keys(userMap);
      let topSpendersData: TopSpender[] = [];

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .in('id', userIds);

        topSpendersData = userIds
          .map(userId => {
            const profile = profiles?.find(p => p.id === userId);
            return {
              user_id: userId,
              email: profile?.email || 'Unknown',
              full_name: profile?.full_name || null,
              total_used: userMap[userId],
            };
          })
          .sort((a, b) => b.total_used - a.total_used)
          .slice(0, 10);
      }

      setTopSpenders(topSpendersData);

      // Calculate daily usage
      const dailyMap: Record<string, number> = {};
      transactions?.forEach(t => {
        const date = new Date(t.created_at).toLocaleDateString('fa-IR');
        dailyMap[date] = (dailyMap[date] || 0) + Math.abs(t.amount);
      });

      const dailyData: DailyUsage[] = Object.entries(dailyMap)
        .map(([date, total]) => ({ date, total }))
        .reverse();

      setDailyUsage(dailyData);

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">بازه زمانی:</span>
        <div className="flex gap-2">
          <Button
            variant={period === 'today' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('today')}
          >
            امروز
          </Button>
          <Button
            variant={period === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('week')}
          >
            هفته اخیر
          </Button>
          <Button
            variant={period === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('month')}
          >
            ماه اخیر
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Diamond className="w-4 h-4" />
              کل الماس مصرفی
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{totalConsumed.toLocaleString('fa-IR')}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {period === 'today' ? 'امروز' : period === 'week' ? 'هفته اخیر' : 'ماه اخیر'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="w-4 h-4" />
              تعداد تراکنش
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{transactionCount.toLocaleString('fa-IR')}</p>
            <p className="text-xs text-muted-foreground mt-1">عملیات AI</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              کاربران فعال
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{topSpenders.length.toLocaleString('fa-IR')}</p>
            <p className="text-xs text-muted-foreground mt-1">استفاده‌کننده از AI</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              میانگین مصرف
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {topSpenders.length > 0 
                ? Math.round(totalConsumed / topSpenders.length).toLocaleString('fa-IR')
                : '0'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">الماس به ازای هر کاربر</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage by Module - Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              مصرف به تفکیک ماژول
            </CardTitle>
            <CardDescription>
              درصد استفاده هر ماژول از کل الماس مصرفی
            </CardDescription>
          </CardHeader>
          <CardContent>
            {usageByModule.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={usageByModule}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ label, percentage }) => `${label} (${percentage}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="total"
                  >
                    {usageByModule.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value.toLocaleString('fa-IR')} الماس`, 'مصرف']}
                    contentStyle={{ direction: 'rtl' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                داده‌ای برای نمایش وجود ندارد
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily Usage Trend - Area Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              روند مصرف روزانه
            </CardTitle>
            <CardDescription>
              میزان الماس مصرفی در هر روز
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dailyUsage.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailyUsage}>
                  <defs>
                    <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toLocaleString('fa-IR')} الماس`, 'مصرف']}
                    contentStyle={{ direction: 'rtl' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorUsage)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                داده‌ای برای نمایش وجود ندارد
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Module Usage Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>مقایسه مصرف ماژول‌ها</CardTitle>
          <CardDescription>
            مقایسه میزان الماس مصرفی هر ماژول
          </CardDescription>
        </CardHeader>
        <CardContent>
          {usageByModule.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={usageByModule} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" />
                <YAxis 
                  type="category" 
                  dataKey="label" 
                  width={150}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value.toLocaleString('fa-IR')} الماس`, 'مصرف']}
                  contentStyle={{ direction: 'rtl' }}
                />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]}>
                  {usageByModule.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              داده‌ای برای نمایش وجود ندارد
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Spenders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            بیشترین مصرف‌کنندگان
          </CardTitle>
          <CardDescription>
            ۱۰ کاربری که بیشترین الماس را استفاده کرده‌اند
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topSpenders.length > 0 ? (
            <div className="space-y-3">
              {topSpenders.map((spender, index) => (
                <div 
                  key={spender.user_id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{spender.full_name || 'بدون نام'}</p>
                      <p className="text-sm text-muted-foreground">{spender.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Diamond className="w-4 h-4 text-primary" />
                    <span className="font-bold text-primary">
                      {spender.total_used.toLocaleString('fa-IR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-muted-foreground">
              هنوز تراکنشی ثبت نشده است
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreditAnalytics;
