import { useState } from "react";
import { motion } from "framer-motion";
import { Compass, Lock, Mail, Eye, EyeOff, Shield, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AuroraBackground from "@/components/AuroraBackground";

type CompassRole = 'ceo' | 'deputy' | 'manager' | null;

interface CompassLoginProps {
  onSuccess: (role: CompassRole) => void;
}

const CompassLogin = ({ onSuccess }: CompassLoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        toast({
          title: "خطا در ورود",
          description: authError.message === "Invalid login credentials" 
            ? "ایمیل یا رمز عبور اشتباه است"
            : authError.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        toast({
          title: "خطا",
          description: "کاربر یافت نشد",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Check compass role
      const { data: roleData, error: roleError } = await supabase
        .from('compass_user_roles')
        .select('role')
        .eq('user_id', authData.user.id)
        .single();

      if (roleError && roleError.code !== 'PGRST116') {
        console.error('Error checking role:', roleError);
      }

      if (roleData) {
        onSuccess(roleData.role as CompassRole);
      } else {
        toast({
          title: "دسترسی ندارید",
          description: "شما به سیستم قطب نمای استراتژی دسترسی ندارید. با مدیرعامل تماس بگیرید.",
          variant: "destructive",
        });
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error('Login error:', err);
      toast({
        title: "خطا",
        description: "مشکلی در ورود رخ داد",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" dir="rtl">
      <AuroraBackground />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center mb-4 shadow-lg shadow-primary/30"
            >
              <Compass className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-foreground mb-2">قطب نمای استراتژی</h1>
            <p className="text-muted-foreground text-sm">رصدخانه استراتژیک سازمان</p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { icon: Shield, label: "امنیت بالا" },
              { icon: UserCheck, label: "نقش‌محور" },
              { icon: Lock, label: "رمزنگاری" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex flex-col items-center gap-1 p-2 rounded-lg bg-secondary/30"
              >
                <item.icon className="w-5 h-5 text-primary" />
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </motion.div>
            ))}
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">ایمیل</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@company.com"
                  className="pr-10 bg-secondary/50 border-border text-left"
                  dir="ltr"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">رمز عبور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="رمز عبور خود را وارد کنید"
                  className="pr-10 pl-10 bg-secondary/50 border-border"
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
            </div>

            <Button 
              type="submit" 
              className="w-full glow-button text-foreground h-12"
              disabled={isLoading}
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Compass className="w-5 h-5" />
                </motion.div>
              ) : (
                <>
                  <Lock className="w-5 h-5 ml-2" />
                  ورود به سیستم
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-border/50 text-center">
            <p className="text-xs text-muted-foreground">
              این سیستم فقط برای کاربران مجاز قابل دسترسی است
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CompassLogin;
