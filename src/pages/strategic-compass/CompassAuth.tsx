import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompassAuth } from '@/contexts/CompassAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Eye, EyeOff, Target, TrendingUp, Users } from 'lucide-react';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('ایمیل معتبر وارد کنید'),
  password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
});

const CompassAuth = () => {
  const navigate = useNavigate();
  const { signIn, user, loading } = useCompassAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  useEffect(() => {
    if (user && !loading) {
      navigate('/strategic-compass/dashboard');
    }
  }, [user, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = loginSchema.safeParse({ email: loginEmail, password: loginPassword });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    
    if (error) {
      if (error.message.includes('Invalid login')) {
        toast.error('ایمیل یا رمز عبور اشتباه است');
      } else {
        toast.error('خطا در ورود به سیستم');
      }
    } else {
      toast.success('ورود موفقیت‌آمیز');
      navigate('/strategic-compass/dashboard');
    }
    setIsLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary text-xl">در حال بارگذاری...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background" dir="rtl">
      {/* Left Panel - Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 via-primary/10 to-background p-12 flex-col justify-center">
        <div className="max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">قطب‌نمای استراتژی</h1>
              <p className="text-muted-foreground">سیستم رصد همسویی سازمانی</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-chart-1/20 flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 text-chart-1" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">دستورات استراتژیک</h3>
                <p className="text-sm text-muted-foreground">تعریف DNA تصمیمات سازمانی</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-chart-2/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-chart-2" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">تحلیل هوشمند</h3>
                <p className="text-sm text-muted-foreground">شناسایی الگوهای انحراف با AI</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">همسویی تیمی</h3>
                <p className="text-sm text-muted-foreground">سنجش درک مشترک از اهداف</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md border-border/50 shadow-xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-4 lg:hidden">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">ورود به سیستم</CardTitle>
            <CardDescription>
              وارد حساب کاربری قطب‌نمای استراتژی شوید
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">ایمیل</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@company.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="text-left"
                  dir="ltr"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">رمز عبور</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="text-left pl-10"
                    dir="ltr"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute left-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "در حال ورود..." : "ورود"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompassAuth;
