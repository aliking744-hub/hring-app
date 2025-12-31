import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompassAuth } from "@/contexts/CompassAuthContext";
import CompassLayout from "@/components/strategic-compass/CompassLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Plus, HelpCircle, CheckCircle, Loader2, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Scenario {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  ceo_answer: string | null;
  category: string;
  is_active: boolean;
  intent_id: string | null;
}

interface ScenarioResponse {
  id: string;
  scenario_id: string;
  answer: string;
}

const Scenarios = () => {
  const { user, role } = useCompassAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    question: "",
    option_a: "",
    option_b: "",
    option_c: "",
    category: "general",
    intent_id: "",
  });

  const { data: intents } = useQuery({
    queryKey: ["strategic-intents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("strategic_intents")
        .select("id, title")
        .eq("status", "active");
      if (error) throw error;
      return data;
    },
  });

  const { data: scenarios, isLoading } = useQuery({
    queryKey: ["scenarios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scenarios")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Scenario[];
    },
  });

  const { data: myResponses } = useQuery({
    queryKey: ["scenario-responses", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scenario_responses")
        .select("*")
        .eq("user_id", user?.id);
      if (error) throw error;
      return data as ScenarioResponse[];
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("scenarios").insert({
        question: data.question,
        option_a: data.option_a,
        option_b: data.option_b,
        option_c: data.option_c,
        category: data.category,
        intent_id: data.intent_id || null,
        ceo_id: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scenarios"] });
      toast({ title: "سناریو ایجاد شد" });
      resetForm();
    },
    onError: () => toast({ title: "خطا در ایجاد", variant: "destructive" }),
  });

  const answerMutation = useMutation({
    mutationFn: async ({ scenarioId, answer }: { scenarioId: string; answer: string }) => {
      if (role === "ceo") {
        const { error } = await supabase
          .from("scenarios")
          .update({ ceo_answer: answer })
          .eq("id", scenarioId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("scenario_responses").insert({
          scenario_id: scenarioId,
          answer,
          user_id: user?.id,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scenarios"] });
      queryClient.invalidateQueries({ queryKey: ["scenario-responses"] });
      toast({ title: "پاسخ ثبت شد" });
    },
    onError: () => toast({ title: "خطا در ثبت پاسخ", variant: "destructive" }),
  });

  const generateScenarios = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-compass-scenarios", {
        body: { intents: intents?.map((i) => ({ id: i.id, title: i.title })) },
      });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["scenarios"] });
      toast({ title: `${data.count} سناریو تولید شد` });
    } catch {
      toast({ title: "خطا در تولید سناریو", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setFormData({ question: "", option_a: "", option_b: "", option_c: "", category: "general", intent_id: "" });
    setIsDialogOpen(false);
  };

  const getMyAnswer = (scenarioId: string) => {
    return myResponses?.find((r) => r.scenario_id === scenarioId)?.answer;
  };

  const isCEO = role === "ceo";

  return (
    <CompassLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">سناریوها</h1>
            <p className="text-muted-foreground">تست همسویی ذهنی با تصمیم‌گیری مدیرعامل</p>
          </div>
          {isCEO && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={generateScenarios} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Sparkles className="ml-2 h-4 w-4" />}
                تولید با AI
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="ml-2 h-4 w-4" />
                    سناریو جدید
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg" dir="rtl">
                  <DialogHeader>
                    <DialogTitle>سناریو جدید</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>نیت مرتبط (اختیاری)</Label>
                      <Select
                        value={formData.intent_id}
                        onValueChange={(v) => setFormData({ ...formData, intent_id: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="انتخاب..." />
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
                      <Label>سوال</Label>
                      <Textarea
                        value={formData.question}
                        onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                        placeholder="سوال سناریو..."
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label>گزینه الف</Label>
                      <Textarea
                        value={formData.option_a}
                        onChange={(e) => setFormData({ ...formData, option_a: e.target.value })}
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label>گزینه ب</Label>
                      <Textarea
                        value={formData.option_b}
                        onChange={(e) => setFormData({ ...formData, option_b: e.target.value })}
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label>گزینه ج</Label>
                      <Textarea
                        value={formData.option_c}
                        onChange={(e) => setFormData({ ...formData, option_c: e.target.value })}
                        rows={2}
                      />
                    </div>
                    <Button onClick={() => createMutation.mutate(formData)} className="w-full">
                      ایجاد
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">در حال بارگذاری...</div>
        ) : (
          <div className="space-y-4">
            {scenarios?.map((scenario) => {
              const myAnswer = getMyAnswer(scenario.id);
              const hasAnswered = isCEO ? !!scenario.ceo_answer : !!myAnswer;

              return (
                <Card key={scenario.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{scenario.question}</CardTitle>
                      </div>
                      {hasAnswered && (
                        <Badge variant="secondary" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          پاسخ داده‌شده
                        </Badge>
                      )}
                    </div>
                    <CardDescription>دسته: {scenario.category}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={isCEO ? scenario.ceo_answer || "" : myAnswer || ""}
                      onValueChange={(v) => answerMutation.mutate({ scenarioId: scenario.id, answer: v })}
                      disabled={hasAnswered}
                      className="space-y-3"
                    >
                      {["a", "b", "c"].map((opt) => {
                        const optionKey = `option_${opt}` as keyof Scenario;
                        return (
                          <div key={opt} className="flex items-start gap-2">
                            <RadioGroupItem value={opt} id={`${scenario.id}-${opt}`} />
                            <Label htmlFor={`${scenario.id}-${opt}`} className="font-normal cursor-pointer">
                              {scenario[optionKey] as string}
                            </Label>
                          </div>
                        );
                      })}
                    </RadioGroup>
                  </CardContent>
                </Card>
              );
            })}
            {(!scenarios || scenarios.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                هنوز سناریویی تعریف نشده است
              </div>
            )}
          </div>
        )}
      </div>
    </CompassLayout>
  );
};

export default Scenarios;
