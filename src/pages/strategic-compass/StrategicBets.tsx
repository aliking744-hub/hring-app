import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompassAuth } from "@/contexts/CompassAuthContext";
import CompassLayout from "@/components/strategic-compass/CompassLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Plus, Trophy, Coins, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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

const MAX_COINS = 100;

const StrategicBets = () => {
  const { user, role } = useCompassAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    goal_title: "",
    goal_description: "",
    year: new Date().getFullYear(),
  });
  const [allocations, setAllocations] = useState<Record<string, number>>({});

  const { data: bets, isLoading } = useQuery({
    queryKey: ["strategic-bets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("strategic_bets")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as StrategicBet[];
    },
  });

  const { data: myAllocations } = useQuery({
    queryKey: ["bet-allocations", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bet_allocations")
        .select("*")
        .eq("user_id", user?.id);
      if (error) throw error;
      
      const allocMap: Record<string, number> = {};
      data?.forEach((a: BetAllocation) => {
        allocMap[a.bet_id] = a.coins;
      });
      setAllocations(allocMap);
      return data as BetAllocation[];
    },
    enabled: !!user,
  });

  const { data: allAllocations } = useQuery({
    queryKey: ["all-bet-allocations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bet_allocations")
        .select("*");
      if (error) throw error;
      return data as BetAllocation[];
    },
    enabled: role === "ceo",
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("strategic_bets").insert({
        ...data,
        ceo_id: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["strategic-bets"] });
      toast({ title: "شرط‌بندی ایجاد شد" });
      resetForm();
    },
    onError: () => toast({ title: "خطا در ایجاد", variant: "destructive" }),
  });

  const allocateMutation = useMutation({
    mutationFn: async ({ betId, coins }: { betId: string; coins: number }) => {
      const existing = myAllocations?.find((a) => a.bet_id === betId);
      if (existing) {
        const { error } = await supabase
          .from("bet_allocations")
          .update({ coins })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("bet_allocations").insert({
          bet_id: betId,
          user_id: user?.id,
          coins,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bet-allocations"] });
      toast({ title: "سکه‌ها تخصیص یافت" });
    },
    onError: () => toast({ title: "خطا در تخصیص", variant: "destructive" }),
  });

  const resetForm = () => {
    setFormData({ goal_title: "", goal_description: "", year: new Date().getFullYear() });
    setIsDialogOpen(false);
  };

  const totalAllocated = Object.values(allocations).reduce((sum, v) => sum + v, 0);
  const remainingCoins = MAX_COINS - totalAllocated;

  const handleAllocationChange = (betId: string, value: number) => {
    const currentValue = allocations[betId] || 0;
    const diff = value - currentValue;
    
    if (diff > remainingCoins) {
      value = currentValue + remainingCoins;
    }
    
    setAllocations((prev) => ({ ...prev, [betId]: value }));
  };

  const getBetStats = (betId: string) => {
    if (!allAllocations) return { totalCoins: 0, participantCount: 0 };
    const betAllocs = allAllocations.filter((a) => a.bet_id === betId);
    return {
      totalCoins: betAllocs.reduce((sum, a) => sum + a.coins, 0),
      participantCount: betAllocs.length,
    };
  };

  const isCEO = role === "ceo";

  return (
    <CompassLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">شرط‌بندی استراتژیک</h1>
            <p className="text-muted-foreground">تخصیص سکه به اهداف سال</p>
          </div>
          {isCEO && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="ml-2 h-4 w-4" />
                  هدف جدید
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg" dir="rtl">
                <DialogHeader>
                  <DialogTitle>هدف شرط‌بندی جدید</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>عنوان هدف</Label>
                    <Input
                      value={formData.goal_title}
                      onChange={(e) => setFormData({ ...formData, goal_title: e.target.value })}
                      placeholder="مثلاً: رشد ۳۰٪ فروش"
                    />
                  </div>
                  <div>
                    <Label>توضیحات</Label>
                    <Textarea
                      value={formData.goal_description}
                      onChange={(e) => setFormData({ ...formData, goal_description: e.target.value })}
                      placeholder="شرح هدف..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>سال</Label>
                    <Input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    />
                  </div>
                  <Button onClick={() => createMutation.mutate(formData)} className="w-full">
                    ایجاد
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Coins Summary */}
        {!isCEO && (
          <Card className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-amber-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Coins className="h-8 w-8 text-amber-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">سکه‌های باقیمانده</p>
                    <p className="text-2xl font-bold text-amber-500">{remainingCoins} از {MAX_COINS}</p>
                  </div>
                </div>
                <Progress value={(totalAllocated / MAX_COINS) * 100} className="w-32" />
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">در حال بارگذاری...</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {bets?.map((bet) => {
              const stats = getBetStats(bet.id);
              const myCoins = allocations[bet.id] || 0;

              return (
                <Card key={bet.id}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{bet.goal_title}</CardTitle>
                    </div>
                    <CardDescription>{bet.year}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {bet.goal_description && (
                      <p className="text-sm text-muted-foreground">{bet.goal_description}</p>
                    )}
                    
                    {isCEO ? (
                      <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Coins className="h-4 w-4 text-amber-500" />
                          <span>{stats.totalCoins} سکه</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{stats.participantCount} شرکت‌کننده</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>سکه‌های تخصیصی</span>
                          <span className="font-bold text-amber-500">{myCoins}</span>
                        </div>
                        <Slider
                          value={[myCoins]}
                          onValueChange={([v]) => handleAllocationChange(bet.id, v)}
                          max={Math.min(MAX_COINS, myCoins + remainingCoins)}
                          step={1}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => allocateMutation.mutate({ betId: bet.id, coins: myCoins })}
                          className="w-full"
                        >
                          ذخیره
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            {(!bets || bets.length === 0) && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                هنوز هدفی تعریف نشده است
              </div>
            )}
          </div>
        )}
      </div>
    </CompassLayout>
  );
};

export default StrategicBets;
