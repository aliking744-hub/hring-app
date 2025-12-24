import { useState, useMemo } from 'react';
import { Employee, FilterState, TabType } from '@/types/employee';
import { FilterBar } from '@/components/hr-dashboard/FilterBar';
import { KPICard } from '@/components/hr-dashboard/KPICard';
import { ChartCard } from '@/components/hr-dashboard/ChartCard';
import { generateSampleData } from '@/utils/sampleData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Building2, Banknote, Clock, Calendar, LayoutDashboard, Cake } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area } from 'recharts';
import AuroraBackground from '@/components/AuroraBackground';

const COLORS = {
  cyan: '#2dd4bf',
  pink: '#f472b6',
  purple: '#a78bfa',
  orange: '#fb923c',
  yellow: '#facc15',
  green: '#22c55e',
};

const CURRENT_PERSIAN_YEAR = 1403;
const persianToEnglish = (str: string) => str.replace(/[۰-۹]/g, d => '0123456789'['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)]);

function calculateTenureFromPersianDate(hireDate: string): number | null {
  if (!hireDate || hireDate.trim() === '') return null;
  const normalizedDate = persianToEnglish(hireDate);
  const parts = normalizedDate.split('/');
  if (parts.length !== 3) return null;
  const hireYear = parseInt(parts[0]);
  if (isNaN(hireYear) || hireYear < 1350 || hireYear > CURRENT_PERSIAN_YEAR) return null;
  const tenure = CURRENT_PERSIAN_YEAR - hireYear;
  return tenure >= 0 && tenure < 60 ? tenure : null;
}

function calculateAgeFromPersianDate(birthDate: string): number | null {
  if (!birthDate || birthDate.trim() === '') return null;
  const normalizedDate = persianToEnglish(birthDate);
  const parts = normalizedDate.split('/');
  if (parts.length !== 3) return null;
  const birthYear = parseInt(parts[0]);
  if (isNaN(birthYear) || birthYear < 1300 || birthYear > 1410) return null;
  const age = CURRENT_PERSIAN_YEAR - birthYear;
  return age > 0 && age < 100 ? age : null;
}

export default function HRDashboard() {
  const navigate = useNavigate();
  const [data] = useState<Employee[]>(() => generateSampleData(78));
  const [filters, setFilters] = useState<FilterState>({
    gender: [],
    education: [],
    department: [],
    location: [],
    position: [],
  });
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const filterOptions = useMemo(() => ({
    genders: [...new Set(data.map(e => e.gender))],
    educations: [...new Set(data.map(e => e.education))].filter(Boolean),
    departments: [...new Set(data.map(e => e.department))].filter(Boolean),
    locations: [...new Set(data.map(e => e.location))].filter(Boolean),
    positions: [...new Set(data.map(e => e.position))].filter(Boolean),
  }), [data]);

  const filteredData = useMemo(() => {
    return data.filter(e => {
      if (filters.gender.length > 0 && !filters.gender.includes(e.gender)) return false;
      if (filters.education.length > 0 && !filters.education.includes(e.education)) return false;
      if (filters.department.length > 0 && !filters.department.includes(e.department)) return false;
      if (filters.location.length > 0 && !filters.location.includes(e.location)) return false;
      if (filters.position.length > 0 && !filters.position.includes(e.position)) return false;
      return true;
    });
  }, [data, filters]);

  const handleFilterChange = (key: keyof FilterState, value: string[]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Stats
  const totalStaff = filteredData.length;
  const departments = [...new Set(filteredData.map(e => e.department))].length;
  const avgSalary = Math.round(filteredData.reduce((sum, e) => sum + e.salary, 0) / totalStaff);
  const tenures = filteredData.map(e => calculateTenureFromPersianDate(e.employmentDate)).filter((t): t is number => t !== null);
  const avgTenure = tenures.length > 0 ? (tenures.reduce((sum, t) => sum + t, 0) / tenures.length).toFixed(1) : '0';
  const ages = filteredData.map(e => calculateAgeFromPersianDate(e.birthDate)).filter((age): age is number => age !== null);
  const avgAge = ages.length > 0 ? (ages.reduce((sum, age) => sum + age, 0) / ages.length).toFixed(1) : '0';

  const formatNumber = (num: number) => new Intl.NumberFormat('fa-IR').format(num);

  // Chart data
  const genderData = [
    { name: 'مرد', value: filteredData.filter(e => e.gender === 'مرد').length, color: COLORS.cyan },
    { name: 'زن', value: filteredData.filter(e => e.gender === 'زن').length, color: COLORS.pink },
  ];

  const deptCounts: Record<string, number> = {};
  filteredData.forEach(e => { deptCounts[e.department] = (deptCounts[e.department] || 0) + 1; });
  const deptData = Object.entries(deptCounts).map(([name, value]) => ({ name, value }));

  const ageGroupOrder = ['20-30', '30-40', '40-50', '50+'];
  const ageCounts: Record<string, number> = {};
  filteredData.forEach(e => {
    if (e.ageGroup && e.ageGroup !== '') {
      ageCounts[e.ageGroup] = (ageCounts[e.ageGroup] || 0) + 1;
    }
  });
  const ageData = ageGroupOrder.map(group => ({ name: group, value: ageCounts[group] || 0 }));

  const tabs = [
    { id: 'overview' as TabType, label: 'نمای کلی', icon: LayoutDashboard },
    { id: 'birthdays' as TabType, label: 'تولدها', icon: Cake },
    { id: 'salary' as TabType, label: 'حقوق', icon: Banknote },
  ];

  return (
    <div className="relative min-h-screen" dir="rtl">
      <AuroraBackground />
      <div className="relative z-10 p-3 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowRight className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">داشبورد منابع انسانی</h1>
              <p className="text-muted-foreground text-xs md:text-sm mt-1 hidden sm:block">تحلیل و گزارش‌گیری اطلاعات پرسنلی</p>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <FilterBar filters={filters} onFilterChange={handleFilterChange} options={filterOptions} />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="space-y-6">
          <TabsList className="glass-card p-1 h-auto flex flex-wrap gap-1 justify-center">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2 px-4 py-2">
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="mt-0 space-y-4">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4">
              <KPICard title="تعداد معاونت" value={formatNumber(departments)} icon={Building2} color="cyan" />
              <KPICard title="تعداد پرسنل" value={formatNumber(totalStaff)} icon={Users} color="pink" />
              <KPICard title="میانگین سنی" value={avgAge} icon={Calendar} color="orange" />
              <KPICard title="میانگین حقوق" value={formatNumber(avgSalary)} icon={Banknote} color="green" />
              <KPICard title="میانگین سابقه" value={avgTenure} icon={Clock} color="purple" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              <ChartCard title="رده سنی پرسنل">
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={ageData}>
                    <defs>
                      <linearGradient id="colorAge" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.cyan} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={COLORS.cyan} stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} width={25} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="value" stroke={COLORS.cyan} fillOpacity={1} fill="url(#colorAge)" />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="تفکیک جنسیت">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={genderData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} labelLine={false}>
                      {genderData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="توزیع در معاونت‌ها">
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={deptData} layout="vertical">
                    <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                    <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9 }} width={70} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Bar dataKey="value" fill={COLORS.purple} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </TabsContent>

          <TabsContent value="birthdays" className="mt-0">
            <ChartCard title="لیست تولدها به زودی اضافه می‌شود">
              <p className="text-center text-muted-foreground py-8">این بخش در حال توسعه است...</p>
            </ChartCard>
          </TabsContent>

          <TabsContent value="salary" className="mt-0">
            <ChartCard title="گزارش حقوق به زودی اضافه می‌شود">
              <p className="text-center text-muted-foreground py-8">این بخش در حال توسعه است...</p>
            </ChartCard>
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>تعداد رکوردهای نمایش داده شده: {filteredData.length} از {data.length}</p>
        </div>
      </div>
    </div>
  );
}
