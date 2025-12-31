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
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Target, Edit, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface StrategicIntent {
  id: string;
  title: string;
  description: string;
  strategic_weight: number;
  tolerance_zone: number;
  status: string;
  created_at: string;
}

const StrategicIntents = () => {
  const { user, role } = useCompassAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIntent, setEditingIntent] = useState<StrategicIntent | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    strategic_weight: 5,
    tolerance_zone: 5,
  });

  const { data: intents, isLoading } = useQuery({
    queryKey: ["strategic-intents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("strategic_intents")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as StrategicIntent[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("strategic_intents").insert({
        ...data,
        ceo_id: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["strategic-intents"] });
      toast({ title: "نیت استراتژیک ایجاد شد" });
      resetForm();
    },
    onError: () => toast({ title: "خطا در ایجاد", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("strategic_intents")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["strategic-intents"] });
      toast({ title: "نیت استراتژیک بروزرسانی شد" });
      resetForm();
    },
    onError: () => toast({ title: "خطا در بروزرسانی", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("strategic_intents").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["strategic-intents"] });
      toast({ title: "نیت استراتژیک حذف شد" });
    },
    onError: () => toast({ title: "خطا در حذف", variant: "destructive" }),
  });

  const resetForm = () => {
    setFormData({ title: "", description: "", strategic_weight: 5, tolerance_zone: 5 });
    setEditingIntent(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (intent: StrategicIntent) => {
    setEditingIntent(intent);
    setFormData({
      title: intent.title,
      description: intent.description,
      strategic_weight: intent.strategic_weight,
      tolerance_zone: intent.tolerance_zone,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingIntent) {
      updateMutation.mutate({ id: editingIntent.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const isCEO = role === "ceo";

  return (
    <CompassLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">نیت‌های استراتژیک</h1>
            <p className="text-muted-foreground">مدیریت اهداف کلان سازمان</p>
          </div>
          {isCEO && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  <Plus className="ml-2 h-4 w-4" />
                  نیت جدید
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg" dir="rtl">
                <DialogHeader>
                  <DialogTitle>
                    {editingIntent ? "ویرایش نیت استراتژیک" : "نیت استراتژیک جدید"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>عنوان</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="مثلاً: افزایش سهم بازار"
                    />
                  </div>
                  <div>
                    <Label>توضیحات</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="شرح کامل نیت استراتژیک..."
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label>وزن استراتژیک: {formData.strategic_weight}</Label>
                    <Slider
                      value={[formData.strategic_weight]}
                      onValueChange={([v]) => setFormData({ ...formData, strategic_weight: v })}
                      min={1}
                      max={10}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>ناحیه تحمل: {formData.tolerance_zone}%</Label>
                    <Slider
                      value={[formData.tolerance_zone]}
                      onValueChange={([v]) => setFormData({ ...formData, tolerance_zone: v })}
                      min={1}
                      max={20}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  <Button onClick={handleSubmit} className="w-full">
                    {editingIntent ? "بروزرسانی" : "ایجاد"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">در حال بارگذاری...</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {intents?.map((intent) => (
              <Card key={intent.id} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{intent.title}</CardTitle>
                    </div>
                    <Badge variant={intent.status === "active" ? "default" : "secondary"}>
                      {intent.status === "active" ? "فعال" : "غیرفعال"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">{intent.description}</p>
                  <div className="flex gap-4 text-sm">
                    <span>وزن: <strong>{intent.strategic_weight}</strong></span>
                    <span>تحمل: <strong>{intent.tolerance_zone}%</strong></span>
                  </div>
                  {isCEO && (
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(intent)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteMutation.mutate(intent.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {(!intents || intents.length === 0) && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                هنوز نیت استراتژیکی تعریف نشده است
              </div>
            )}
          </div>
        )}
      </div>
    </CompassLayout>
  );
};

export default StrategicIntents;
