import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2, User, Building2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AuroraBackground from "@/components/AuroraBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

type AccountType = 'person' | 'company';

const Auth = () => {
  const [accountType, setAccountType] = useState<AccountType>('person');
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { signIn, signUp, signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Email not confirmed')) {
            toast({
              title: "تایید ایمیل",
              description: "لطفاً ابتدا ایمیل خود را از طریق لینک ارسال شده تایید کنید",
              variant: "destructive",
            });
          } else if (error.message.includes('Invalid login credentials')) {
            toast({
              title: "خطا در ورود",
              description: "ایمیل یا رمز عبور اشتباه است",
              variant: "destructive",
            });
          } else {
            toast({
              title: "خطا",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "ورود موفق",
            description: accountType === 'person' 
              ? "به داشبورد hring خوش آمدید" 
              : "به پنل شرکت خوش آمدید",
          });
          navigate('/dashboard');
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: "حساب موجود است",
              description: "این ایمیل قبلاً ثبت‌نام شده. لطفاً وارد شوید",
              variant: "destructive",
            });
          } else {
            toast({
              title: "خطا در ثبت‌نام",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "ثبت‌نام موفق",
            description: "لینک تایید به ایمیل شما ارسال شد. لطفاً ایمیل خود را بررسی کنید",
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "خطا",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast({
          title: "خطا در ورود با گوگل",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "خطا",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderLoginForm = (showCompanyField: boolean = false) => (
    <>
      {/* Google Sign In */}
      <Button 
        type="button" 
        variant="outline" 
        className="w-full mb-4 gap-2 bg-secondary/50 border-border hover:bg-secondary"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        ورود با گوگل
      </Button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">یا</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Company Name Field - Only for company tab */}
        {showCompanyField && (
          <div className="relative">
            <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="نام شرکت"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="pr-10 bg-secondary/50 border-border focus:border-primary"
              required={!isLogin}
              disabled={isLoading}
            />
          </div>
        )}

        <div className="relative">
          <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="email"
            placeholder="ایمیل"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pr-10 bg-secondary/50 border-border focus:border-primary"
            required
            disabled={isLoading}
          />
        </div>

        <div className="relative">
          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="رمز عبور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pr-10 pl-10 bg-secondary/50 border-border focus:border-primary"
            required
            disabled={isLoading}
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <Button 
          type="submit" 
          className="w-full glow-button text-foreground font-semibold py-6 gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              {isLogin ? "ورود" : "ثبت‌نام"}
              <ArrowLeft className="w-4 h-4" />
            </>
          )}
        </Button>
      </form>

      {!isLogin && (
        <p className="text-xs text-muted-foreground text-center mt-4">
          پس از ثبت‌نام، لینک تایید به ایمیل شما ارسال می‌شود
        </p>
      )}

      {/* Toggle */}
      <div className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">
          {isLogin ? "حساب کاربری ندارید؟" : "قبلاً ثبت‌نام کرده‌اید؟"}
        </span>
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-primary hover:underline mr-2 font-medium"
          disabled={isLoading}
        >
          {isLogin ? "ثبت‌نام کنید" : "وارد شوید"}
        </button>
      </div>
    </>
  );

  return (
    <>
      <Helmet>
        <title>{isLogin ? "ورود به حساب" : "ثبت‌نام"} | HRing</title>
        <meta 
          name="description" 
          content={isLogin 
            ? "ورود به پنل مدیریت منابع انسانی HRing. به ابزارهای هوشمند استخدام و مدیریت تیم دسترسی پیدا کنید."
            : "ایجاد حساب کاربری در HRing. همین حالا شروع کنید و از امکانات هوش مصنوعی برای استخدام بهره‌مند شوید."
          } 
        />
      </Helmet>
      <div className="relative min-h-screen flex items-center justify-center p-4" dir="rtl">
        <AuroraBackground />
      
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-block text-3xl font-bold gradient-text-primary mb-4">
              hring
            </Link>
            <h1 className="text-2xl font-semibold text-foreground">
              {isLogin ? "ورود به حساب" : "ایجاد حساب کاربری"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isLogin 
                ? "خوش آمدید! لطفاً وارد شوید" 
                : "همین حالا شروع کنید"}
            </p>
          </div>

          {/* Account Type Tabs */}
          <Tabs 
            value={accountType} 
            onValueChange={(v) => setAccountType(v as AccountType)}
            className="mb-6"
          >
            <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
              <TabsTrigger 
                value="person" 
                className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <User className="w-4 h-4" />
                اشخاص
              </TabsTrigger>
              <TabsTrigger 
                value="company"
                className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Building2 className="w-4 h-4" />
                شرکت‌ها
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="person" className="mt-6">
              {renderLoginForm(false)}
            </TabsContent>
            
            <TabsContent value="company" className="mt-6">
              {renderLoginForm(true)}
            </TabsContent>
          </Tabs>

          {/* Back Link */}
          <div className="mt-8 text-center">
            <Link 
              to="/" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
            >
              بازگشت به خانه
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </div>
        </div>
      </motion.div>
      </div>
    </>
  );
};

export default Auth;
