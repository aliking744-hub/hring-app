import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  Building2, Settings, Save, ChevronLeft, 
  CreditCard, Users, Gem, Crown, Shield, Loader2, Coins
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AuroraBackground from '@/components/AuroraBackground';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/hooks/useCompany';
import { useUserContext } from '@/hooks/useUserContext';
import { TIER_NAMES, STATUS_NAMES } from '@/types/multiTenant';

const CompanySettings = () => {
  const navigate = useNavigate();
  const { context, loading: contextLoading } = useUserContext();
  const { company, members, loading, isCEO, refetch } = useCompany();

  const [companyName, setCompanyName] = useState('');
  const [companyDomain, setCompanyDomain] = useState('');
  const [creditPoolEnabled, setCreditPoolEnabled] = useState(false);
  const [saving, setSaving] = useState(false);

  // Update state when company loads
  useEffect(() => {
    if (company) {
      setCompanyName(company.name);
      setCompanyDomain(company.domain || '');
      setCreditPoolEnabled(company.credit_pool_enabled || false);
    }
  }, [company]);

  const handleSave = async () => {
    if (!company || !isCEO) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('companies')
        .update({
          name: companyName,
          domain: companyDomain || null,
          credit_pool_enabled: creditPoolEnabled
        })
        .eq('id', company.id);

      if (error) throw error;
      toast.success('تغییرات ذخیره شد');
      refetch();
    } catch (error) {
      console.error('Error saving company:', error);
      toast.error('خطا در ذخیره تغییرات');
    } finally {
      setSaving(false);
    }
  };

  if (contextLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Only CEO can access
  if (!isCEO) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">دسترسی محدود</h2>
            <p className="text-muted-foreground mb-4">فقط مدیرعامل شرکت می‌تواند به تنظیمات دسترسی داشته باشد.</p>
            <Button onClick={() => navigate('/dashboard')}>بازگشت به داشبورد</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const creditsUsedPercent = company ? (company.used_credits / company.monthly_credits) * 100 : 0;
  const membersPercent = company ? (members.length / company.max_members) * 100 : 0;

  return (
    <>
      <Helmet>
        <title>تنظیمات شرکت | {company?.name || 'شرکت'}</title>
      </Helmet>
      <div className="relative min-h-screen" dir="rtl">
        <AuroraBackground />
        
        <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">تنظیمات شرکت</h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Crown className="w-4 h-4 text-primary" />
                  مدیرعامل
                </p>
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving} className="glow-button text-foreground">
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin ml-2" />
              ) : (
                <Save className="w-4 h-4 ml-2" />
              )}
              ذخیره تغییرات
            </Button>
          </motion.div>

          <div className="space-y-6">
            {/* Company Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    اطلاعات شرکت
                  </CardTitle>
                  <CardDescription>اطلاعات پایه شرکت را ویرایش کنید</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>نام شرکت</Label>
                      <Input
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="نام شرکت"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>دامنه ایمیل (اختیاری)</Label>
                      <Input
                        value={companyDomain}
                        onChange={(e) => setCompanyDomain(e.target.value)}
                        placeholder="company.com"
                        dir="ltr"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <Badge variant="outline">{STATUS_NAMES[company?.status || 'active']}</Badge>
                    <span className="text-sm text-muted-foreground">
                      تاریخ ایجاد: {new Date(company?.created_at || '').toLocaleDateString('fa-IR')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Subscription Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="glass-card border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    اشتراک و پلن
                  </CardTitle>
                  <CardDescription>مشخصات پلن اشتراک فعلی شرکت</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Current Plan */}
                    <div className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl border border-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Crown className="w-5 h-5 text-primary" />
                        <span className="font-medium text-foreground">پلن فعلی</span>
                      </div>
                      <p className="text-2xl font-bold text-primary">
                        {TIER_NAMES[company?.subscription_tier || 'corporate_expert']}
                      </p>
                    </div>

                    {/* Credits */}
                    <div className="p-4 bg-secondary/30 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Gem className="w-5 h-5 text-primary" />
                        <span className="font-medium text-foreground">اعتبار ماهانه</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-foreground">
                          {company ? company.monthly_credits - company.used_credits : 0}
                        </span>
                        <span className="text-muted-foreground">از {company?.monthly_credits || 0}</span>
                      </div>
                      <Progress value={100 - creditsUsedPercent} className="mt-2 h-2" />
                    </div>

                    {/* Members */}
                    <div className="p-4 bg-secondary/30 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-primary" />
                        <span className="font-medium text-foreground">اعضای تیم</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-foreground">{members.length}</span>
                        <span className="text-muted-foreground">از {company?.max_members || 10}</span>
                      </div>
                      <Progress value={membersPercent} className="mt-2 h-2" />
                    </div>
                  </div>

                  <Separator className="my-6" />

                  {/* Credit Pool Toggle */}
                  <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Coins className="w-6 h-6 text-amber-500" />
                        <div>
                          <p className="font-medium text-foreground">اعتبار مشترک تیمی (Credit Pool)</p>
                          <p className="text-sm text-muted-foreground">
                            اعضای تیم از یک مخزن اعتبار مشترک استفاده می‌کنند
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={creditPoolEnabled}
                        onCheckedChange={setCreditPoolEnabled}
                      />
                    </div>
                    {creditPoolEnabled && company && (
                      <div className="mt-4 p-3 bg-background/50 rounded-lg">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-bold text-amber-500">
                            {company.credit_pool}
                          </span>
                          <span className="text-muted-foreground">اعتبار موجود در مخزن</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          اعتبار مخزن هر ماه بر اساس پلن شرکت ریست می‌شود
                        </p>
                      </div>
                    )}
                  </div>

                  <Separator className="my-6" />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">ارتقای پلن</p>
                      <p className="text-sm text-muted-foreground">
                        برای افزایش اعتبار و امکانات بیشتر، پلن خود را ارتقا دهید
                      </p>
                    </div>
                    <Button variant="outline" disabled>
                      ارتقا به پلن بالاتر
                      <Badge className="mr-2 bg-primary/20 text-primary text-xs">به زودی</Badge>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    دسترسی سریع
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      className="justify-start h-14"
                      onClick={() => navigate('/company-members')}
                    >
                      <Users className="w-5 h-5 ml-3 text-primary" />
                      <div className="text-right">
                        <p className="font-medium">مدیریت اعضا</p>
                        <p className="text-xs text-muted-foreground">افزودن، ویرایش و حذف اعضای تیم</p>
                      </div>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="justify-start h-14"
                      onClick={() => navigate('/strategic-compass')}
                    >
                      <Building2 className="w-5 h-5 ml-3 text-primary" />
                      <div className="text-right">
                        <p className="font-medium">قطب‌نمای استراتژی</p>
                        <p className="text-xs text-muted-foreground">مدیریت نیت‌ها و رفتارها</p>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CompanySettings;
