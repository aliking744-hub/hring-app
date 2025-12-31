import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompassAuth } from "@/contexts/CompassAuthContext";
import CompassLayout from "@/components/strategic-compass/CompassLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, BookOpen, AlertTriangle, FileText, XCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface DecisionJournal {
  id: string;
  behavior_id: string;
  risk_prediction: string;
  supporting_data: string;
  rejected_options: string;
  created_at: string;
}

interface Behavior {
  id: string;
  action_description: string;
}

const DecisionJournalPage = () => {
  const { user, role } = useCompassAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    behavior_id: "",
    risk_prediction: "",
    supporting_data: "",
    rejected_options: "",
  });

  const { data: behaviors } = useQuery({
    queryKey: ["my-behaviors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("behaviors")
        .select("id, action_description")
        .eq("deputy_id", user?.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Behavior[];
    },
    enabled: !!user && role !== "ceo",
  });

  const { data: journals, isLoading } = useQuery({
    queryKey: ["decision-journals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("decision_journals")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as DecisionJournal[];
    },
  });

  const { data: allBehaviors } = useQuery({
    queryKey: ["all-behaviors-for-journals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("behaviors")
        .select("id, action_description");
      if (error) throw error;
      return data as Behavior[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("decision_journals").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decision-journals"] });
      toast({ title: "ژورنال ثبت شد" });
      resetForm();
    },
    onError: () => toast({ title: "خطا در ثبت", variant: "destructive" }),
  });

  const resetForm = () => {
    setFormData({ behavior_id: "", risk_prediction: "", supporting_data: "", rejected_options: "" });
    setIsDialogOpen(false);
  };

  const getBehaviorDescription = (behaviorId: string) => {
    return allBehaviors?.find((b) => b.id === behaviorId)?.action_description || "نامشخص";
  };

  const isCEO = role === "ceo";

  return (
    <CompassLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">ژورنال تصمیم‌گیری</h1>
            <p className="text-muted-foreground">مستندسازی فرآیند تصمیم‌گیری</p>
          </div>
          {!isCEO && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="ml-2 h-4 w-4" />
                  ژورنال جدید
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg" dir="rtl">
                <DialogHeader>
                  <DialogTitle>ثبت ژورنال تصمیم</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>رفتار مرتبط</Label>
                    <Select
                      value={formData.behavior_id}
                      onValueChange={(v) => setFormData({ ...formData, behavior_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="انتخاب رفتار..." />
                      </SelectTrigger>
                      <SelectContent>
                        {behaviors?.map((b) => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.action_description.substring(0, 50)}...
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>پیش‌بینی ریسک</Label>
                    <Textarea
                      value={formData.risk_prediction}
                      onChange={(e) => setFormData({ ...formData, risk_prediction: e.target.value })}
                      placeholder="چه ریسک‌هایی پیش‌بینی می‌کردید؟"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>داده‌های پشتیبان</Label>
                    <Textarea
                      value={formData.supporting_data}
                      onChange={(e) => setFormData({ ...formData, supporting_data: e.target.value })}
                      placeholder="چه داده‌هایی تصمیم شما را تایید می‌کرد؟"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>گزینه‌های رد شده</Label>
                    <Textarea
                      value={formData.rejected_options}
                      onChange={(e) => setFormData({ ...formData, rejected_options: e.target.value })}
                      placeholder="چه گزینه‌هایی را رد کردید و چرا؟"
                      rows={3}
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
            {journals?.map((journal) => (
              <Card key={journal.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base line-clamp-1">
                        {getBehaviorDescription(journal.behavior_id)}
                      </CardTitle>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(journal.created_at).toLocaleDateString("fa-IR")}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        پیش‌بینی ریسک
                      </div>
                      <p className="text-sm text-muted-foreground">{journal.risk_prediction}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <FileText className="h-4 w-4 text-blue-500" />
                        داده‌های پشتیبان
                      </div>
                      <p className="text-sm text-muted-foreground">{journal.supporting_data}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <XCircle className="h-4 w-4 text-red-500" />
                        گزینه‌های رد شده
                      </div>
                      <p className="text-sm text-muted-foreground">{journal.rejected_options}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {(!journals || journals.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                هنوز ژورنالی ثبت نشده است
              </div>
            )}
          </div>
        )}
      </div>
    </CompassLayout>
  );
};

export default DecisionJournalPage;
