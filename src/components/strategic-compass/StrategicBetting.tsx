import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Coins, 
  Plus, 
  Target,
  Save,
  BarChart3,
  Users,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";

interface Props {
  userRole: 'ceo' | 'deputy' | 'manager' | null;
}

interface StrategicBet {
  id: string;
  goal_title: string;
  goal_description: string | null;
  year: number;
  ceo_id: string;
}

interface BetAllocation {
  id: string;
  bet_id: string;
  user_id: string;
  coins: number;
}

const StrategicBetting = ({ userRole }: Props) => {
  const [bets, setBets] = useState<StrategicBet[]>([]);
  const [allocations, setAllocations] = useState<BetAllocation[]>([]);
  const [userAllocations, setUserAllocations] = useState<Record<string, number>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    goal_title: "",
    goal_description: "",
  });
  const { user } = useAuth();
  const { toast } = useToast();

  const TOTAL_COINS = 100;
  const isCEO = userRole === 'ceo';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [betsRes, allocationsRes] = await Promise.all([
        supabase.from('strategic_bets').select('*').eq('year', new Date().getFullYear()),
        supabase.from('bet_allocations').select('*')
      ]);

      if (betsRes.data) setBets(betsRes.data);
      if (allocationsRes.data) {
        setAllocations(allocationsRes.data);
        // Set user's current allocations
        if (user) {
          const userAllocs: Record<string, number> = {};
          allocationsRes.data
            .filter(a => a.user_id === user.id)
            .forEach(a => {
              userAllocs[a.bet_id] = a.coins;
            });
          setUserAllocations(userAllocs);
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBet = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('strategic_bets')
        .insert({
          goal_title: formData.goal_title,
          goal_description: formData.goal_description || null,
          ceo_id: user.id,
          year: new Date().getFullYear(),
        });

      if (error) throw error;

      toast({
        title: "هدف ثبت شد",
        description: "هدف استراتژیک جدید اضافه شد",
      });

      setFormData({ goal_title: "", goal_description: "" });
      setIsCreating(false);
      fetchData();
    } catch (err) {
      console.error('Error creating bet:', err);
      toast({
        title: "خطا",
        description: "مشکلی در ثبت هدف رخ داد",
        variant: "destructive",
      });
    }
  };

  const handleAllocationChange = (betId: string, value: number) => {
    const newAllocations = { ...userAllocations, [betId]: value };
    
    // Calculate total
    const total = Object.values(newAllocations).reduce((sum, v) => sum + v, 0);
    
    // If total exceeds 100, adjust
    if (total <= TOTAL_COINS) {
      setUserAllocations(newAllocations);
    }
  };

  const handleSaveAllocations = async () => {
    if (!user) return;

    try {
      // Delete existing allocations
      await supabase
        .from('bet_allocations')
        .delete()
        .eq('user_id', user.id);

      // Insert new allocations
      const allocationsToInsert = Object.entries(userAllocations)
        .filter(([_, coins]) => coins > 0)
        .map(([bet_id, coins]) => ({
          bet_id,
          user_id: user.id,
          coins,
        }));

      if (allocationsToInsert.length > 0) {
        const { error } = await supabase
          .from('bet_allocations')
          .insert(allocationsToInsert);

        if (error) throw error;
      }

      toast({
        title: "ذخیره شد",
        description: "تخصیص سکه‌های شما ثبت شد",
      });

      fetchData();
    } catch (err) {
      console.error('Error saving allocations:', err);
      toast({
        title: "خطا",
        description: "مشکلی در ذخیره رخ داد",
        variant: "destructive",
      });
    }
  };

  const usedCoins = Object.values(userAllocations).reduce((sum, v) => sum + v, 0);
  const remainingCoins = TOTAL_COINS - usedCoins;

  // Prepare comparison data for chart
  const comparisonData = bets.map(bet => {
    const ceoAllocation = allocations.find(a => a.bet_id === bet.id && a.user_id === bet.ceo_id)?.coins || 0;
    const avgOthersAllocation = allocations
      .filter(a => a.bet_id === bet.id && a.user_id !== bet.ceo_id)
      .reduce((sum, a, _, arr) => sum + a.coins / (arr.length || 1), 0);
    
    return {
      name: bet.goal_title.length > 15 ? bet.goal_title.substring(0, 15) + '...' : bet.goal_title,
      ceo: ceoAllocation,
      others: Math.round(avgOthersAllocation),
    };
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Coins className="w-8 h-8 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Coins className="w-6 h-6 text-primary" />
            بازی استراتژیک
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isCEO ? "اهداف سال را تعریف کنید و سکه‌ها را تخصیص دهید" : "سکه‌های خود را بین اهداف تقسیم کنید"}
          </p>
        </div>
        {isCEO && !isCreating && (
          <Button 
            onClick={() => setIsCreating(true)}
            className="glow-button text-foreground"
          >
            <Plus className="w-4 h-4 ml-2" />
            هدف جدید
          </Button>
        )}
      </div>

      {/* Coins Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">سکه‌های شما</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-500" />
              <span className="text-2xl font-bold text-foreground">{remainingCoins}</span>
              <span className="text-muted-foreground">/ {TOTAL_COINS}</span>
            </div>
          </div>
        </div>
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${usedCoins}%` }}
            className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
          />
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {usedCoins} سکه تخصیص داده شده • {remainingCoins} سکه باقیمانده
        </p>
      </motion.div>

      {/* Create Goal Form (CEO only) */}
      {isCreating && isCEO && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">تعریف هدف استراتژیک</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="goal_title">عنوان هدف</Label>
              <Input
                id="goal_title"
                value={formData.goal_title}
                onChange={(e) => setFormData({ ...formData, goal_title: e.target.value })}
                placeholder="مثال: کاهش هزینه‌های لجستیک"
                className="mt-1.5 bg-secondary/50 border-border"
              />
            </div>
            <div>
              <Label htmlFor="goal_description">توضیحات (اختیاری)</Label>
              <Textarea
                id="goal_description"
                value={formData.goal_description}
                onChange={(e) => setFormData({ ...formData, goal_description: e.target.value })}
                placeholder="شرح بیشتر درباره این هدف..."
                className="mt-1.5 bg-secondary/50 border-border"
              />
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleCreateBet} className="glow-button text-foreground">
                <Save className="w-4 h-4 ml-2" />
                ثبت هدف
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                انصراف
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Goals List with Allocation Sliders */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">اهداف استراتژیک سال {new Date().getFullYear()}</h3>
        {bets.map((bet, index) => (
          <motion.div
            key={bet.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{bet.goal_title}</h4>
                  {bet.goal_description && (
                    <p className="text-sm text-muted-foreground">{bet.goal_description}</p>
                  )}
                </div>
              </div>
              <div className="text-left">
                <span className="text-2xl font-bold text-yellow-500">
                  {userAllocations[bet.id] || 0}
                </span>
                <span className="text-sm text-muted-foreground"> سکه</span>
              </div>
            </div>
            <div className="mt-4">
              <Slider
                value={[userAllocations[bet.id] || 0]}
                onValueChange={(value) => handleAllocationChange(bet.id, value[0])}
                min={0}
                max={Math.min(TOTAL_COINS, remainingCoins + (userAllocations[bet.id] || 0))}
                step={5}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>۰</span>
                <span>۱۰۰</span>
              </div>
            </div>
          </motion.div>
        ))}

        {bets.length === 0 && (
          <div className="glass-card p-12 text-center">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">هنوز هدفی تعریف نشده</h3>
            <p className="text-muted-foreground text-sm">
              {isCEO ? "اولین هدف استراتژیک سال را تعریف کنید" : "منتظر تعریف اهداف توسط مدیرعامل باشید"}
            </p>
          </div>
        )}

        {bets.length > 0 && (
          <Button 
            onClick={handleSaveAllocations} 
            className="w-full glow-button text-foreground h-12"
            disabled={usedCoins === 0}
          >
            <Save className="w-4 h-4 ml-2" />
            ذخیره تخصیص‌ها
          </Button>
        )}
      </div>

      {/* Comparison Chart (CEO only) */}
      {isCEO && comparisonData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            مقایسه تخصیص‌ها
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            مقایسه دیدگاه شما با میانگین معاونین
          </p>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="ceo" name="مدیرعامل" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="others" name="میانگین معاونین" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Alignment Warning */}
          {comparisonData.some(d => Math.abs(d.ceo - d.others) > 20) && (
            <div className="mt-4 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-foreground font-medium">تضاد در اولویت‌بندی</p>
                  <p className="text-sm text-muted-foreground">
                    اختلاف قابل توجهی بین دیدگاه شما و معاونین در برخی اهداف وجود دارد
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default StrategicBetting;
