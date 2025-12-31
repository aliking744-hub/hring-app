import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompassAuth } from "@/contexts/CompassAuthContext";
import CompassLayout from "@/components/strategic-compass/CompassLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Activity, Clock, Coins, TrendingUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Behavior {
  id: string;
  intent_id: string;
  action_description: string;
  time_spent: number;
  resources_used: number;
  alignment_score: number | null;
  result_score: number | null;
  notes: string | null;
  created_at: string;
}

interface StrategicIntent {
  id: string;
  title: string;
}

const Behaviors = () => {
  const { user, role } = useCompassAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    intent_id: "",
    action_description: "",
    time_spent: 0,
    resources_used: 0,
    notes: "",
  });

  const { data: intents } = useQuery({
    queryKey: ["strategic-intents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("strategic_intents")
        .select("id, title")
        .eq("status", "active");
      if (error) throw error;
      return data as StrategicIntent[];
    },
  });

  const { data: behaviors, isLoading } = useQuery({
    queryKey: ["behaviors"],
    queryFn: async () => {
      let query = supabase.from("behaviors").select("*").order("created_at", { ascending: false });
      
      // Deputies see only their own behaviors
      if (role === "deputy") {
        query = query.eq("deputy_id", user?.id);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Behavior[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("behaviors").insert({
        intent_id: data.intent_id,
        action_description: data.action_description,
        time_spent: data.time_spent,
        resources_used: data.resources_used,
        notes: data.notes || null,
        deputy_id: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["behaviors"] });
      toast({ title: "رفتار ثبت شد" });
      resetForm();
    },
    onError: () => toast({ title: "خطا در ثبت", variant: "destructive" }),
  });

  const resetForm = () => {
    setFormData({ intent_id: "", action_description: "", time_spent: 0, resources_used: 0, notes: "" });
    setIsDialogOpen(false);
  };

  const getIntentTitle = (intentId: string) => {
    return intents?.find((i) => i.id === intentId)?.title || "نامشخص";
  };

  return (
    <CompassLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">رفتارها</h1>
            <p className="text-muted-foreground">ثبت و پایش اقدامات در راستای نیت‌های استراتژیک</p>
          </div>
          {role !== "ceo" && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="ml-2 h-4 w-4" />
                  ثبت رفتار
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg" dir="rtl">
                <DialogHeader>
                  <DialogTitle>ثبت رفتار جدید</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>نیت استراتژیک مرتبط</Label>
                    <Select
                      value={formData.intent_id}
                      onValueChange={(v) => setFormData({ ...formData, intent_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="انتخاب نیت..." />
                      </SelectTrigger>
                      <SelectContent>
                        {intents?.map((intent) => (
                          <SelectItem key={intent.id} value={intent.id}>
                            {intent.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>شرح اقدام</Label>
                    <Textarea
                      value={formData.action_description}
                      onChange={(e) => setFormData({ ...formData, action_description: e.target.value })}
                      placeholder="چه کاری انجام دادید؟"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>زمان صرف‌شده (ساعت)</Label>
                      <Input
                        type="number"
                        value={formData.time_spent}
                        onChange={(e) => setFormData({ ...formData, time_spent: Number(e.target.value) })}
                        min={0}
                      />
                    </div>
                    <div>
                      <Label>منابع مصرفی (میلیون تومان)</Label>
                      <Input
                        type="number"
                        value={formData.resources_used}
                        onChange={(e) => setFormData({ ...formData, resources_used: Number(e.target.value) })}
                        min={0}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>یادداشت</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="توضیحات تکمیلی..."
                      rows={2}
                    />
                  </div>
                  <Button onClick={() => createMutation.mutate(formData)} className="w-full">
                    ثبت
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">در حال بارگذاری...</div>
        ) : (
          <div className="space-y-4">
            {behaviors?.map((behavior) => (
              <Card key={behavior.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">{getIntentTitle(behavior.intent_id)}</CardTitle>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(behavior.created_at).toLocaleDateString("fa-IR")}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-foreground">{behavior.action_description}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{behavior.time_spent} ساعت</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Coins className="h-4 w-4 text-muted-foreground" />
                      <span>{behavior.resources_used} م.ت</span>
                    </div>
                    {behavior.alignment_score !== null && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span>همسویی: {behavior.alignment_score}%</span>
                      </div>
                    )}
                  </div>
                  {behavior.notes && (
                    <p className="text-sm text-muted-foreground border-t pt-2">{behavior.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))}
            {(!behaviors || behaviors.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                هنوز رفتاری ثبت نشده است
              </div>
            )}
          </div>
        )}
      </div>
    </CompassLayout>
  );
};

export default Behaviors;
