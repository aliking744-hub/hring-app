import { useState } from 'react';
import { Employee, FilterState, TabType } from '@/types/employee';
import { FilterBar } from '@/components/hr-dashboard/FilterBar';
import { OverviewTab } from '@/components/hr-dashboard/OverviewTab';
import { BirthdaysTab } from '@/components/hr-dashboard/BirthdaysTab';
import { SalaryTab } from '@/components/hr-dashboard/SalaryTab';
import { UploadPage } from '@/components/hr-dashboard/UploadPage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowRight, LayoutDashboard, Cake, Banknote, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuroraBackground from '@/components/AuroraBackground';

export default function HRDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<Employee[] | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    gender: [],
    education: [],
    department: [],
    location: [],
    position: [],
  });
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Show upload page if no data
  if (!data) {
    return <UploadPage onDataLoaded={setData} />;
  }

  const filterOptions = {
    genders: [...new Set(data.map(e => e.gender))],
    educations: [...new Set(data.map(e => e.education))].filter(Boolean),
    departments: [...new Set(data.map(e => e.department))].filter(Boolean),
    locations: [...new Set(data.map(e => e.location))].filter(Boolean),
    positions: [...new Set(data.map(e => e.position))].filter(Boolean),
  };

  const filteredData = data.filter(e => {
    if (filters.gender.length > 0 && !filters.gender.includes(e.gender)) return false;
    if (filters.education.length > 0 && !filters.education.includes(e.education)) return false;
    if (filters.department.length > 0 && !filters.department.includes(e.department)) return false;
    if (filters.location.length > 0 && !filters.location.includes(e.location)) return false;
    if (filters.position.length > 0 && !filters.position.includes(e.position)) return false;
    return true;
  });

  const handleFilterChange = (key: keyof FilterState, value: string[]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

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
          <Button variant="outline" size="sm" onClick={() => setData(null)} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            <span>بارگذاری مجدد</span>
          </Button>
        </div>

        {/* Filter Bar */}
        <FilterBar filters={filters} onFilterChange={handleFilterChange} options={filterOptions} />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="space-y-6">
          <TabsList className="bg-card/50 backdrop-blur-sm p-1 h-auto flex flex-wrap gap-1 justify-center border border-border">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2 px-4 py-2">
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="mt-0">
            <OverviewTab data={filteredData} />
          </TabsContent>

          <TabsContent value="birthdays" className="mt-0">
            <BirthdaysTab data={filteredData} />
          </TabsContent>

          <TabsContent value="salary" className="mt-0">
            <SalaryTab data={filteredData} />
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>تعداد رکوردهای نمایش داده شده: {filteredData.length} از {data.length}</p>
        </div>
      </div>
    </div>
  );
}
