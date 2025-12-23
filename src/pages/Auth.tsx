import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import AuroraBackground from "@/components/AuroraBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: isLogin ? "ورود موفق" : "ثبت‌نام موفق",
      description: "به داشبورد hring خوش آمدید",
    });
  };

  return (
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
          <div className="text-center mb-8">
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="ایمیل"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pr-10 bg-secondary/50 border-border focus:border-primary"
                required
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
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <Button type="submit" className="w-full glow-button text-foreground font-semibold py-6 gap-2">
              {isLogin ? "ورود" : "ثبت‌نام"}
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              {isLogin ? "حساب کاربری ندارید؟" : "قبلاً ثبت‌نام کرده‌اید؟"}
            </span>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline mr-2 font-medium"
            >
              {isLogin ? "ثبت‌نام کنید" : "وارد شوید"}
            </button>
          </div>

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
  );
};

export default Auth;
