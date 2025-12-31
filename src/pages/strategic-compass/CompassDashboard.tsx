import { useCompassAuth } from '@/contexts/CompassAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, Users, Activity } from 'lucide-react';
import CompassAIWarningSystem from '@/components/strategic-compass/CompassAIWarningSystem';
import CompassTranslationRisk from '@/components/strategic-compass/CompassTranslationRisk';

const CompassDashboard = () => {
  const { profile, isCeo } = useCompassAuth();

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            سلام، {profile?.full_name || 'کاربر'}
          </h1>
          <p className="text-muted-foreground">
            به داشبورد قطب‌نمای استراتژی خوش آمدید
          </p>
        </div>
        <Badge variant="outline" className="text-sm px-4 py-2">
          <Activity className="w-4 h-4 ml-2" />
          وضعیت سیستم: فعال
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              دستورات فعال
            </CardTitle>
            <Target className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">استراتژی در حال اجرا</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              گزارش‌های عملکرد
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">رفتار ثبت شده</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              کاربران فعال
            </CardTitle>
            <Users className="w-4 h-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">معاون و مدیر</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Analysis Sections (CEO only) */}
      {isCeo && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CompassAIWarningSystem />
          <CompassTranslationRisk />
        </div>
      )}
    </div>
  );
};

export default CompassDashboard;
