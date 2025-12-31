import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { Languages, AlertTriangle, RefreshCw, ArrowRight, CheckCircle2 } from "lucide-react";

interface TranslationRiskItem {
  intent_title: string;
  deputy: string;
  deputy_id: string;
  original_meaning: string;
  interpreted_as: string;
  risk_level: "high" | "medium" | "low";
  affected_deputies_count: number;
  recommendation: string;
}

interface AnalysisResult {
  translation_risks: TranslationRiskItem[];
  overall_clarity_score: number;
  summary: string;
}

export default function CompassTranslationRisk() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzeRisks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("compass-translation-risk");

      if (error) {
        console.error("Error:", error);
        toast({ title: "خطا در تحلیل", variant: "destructive" });
        return;
      }

      if (data.error) {
        toast({ title: data.error, variant: "destructive" });
        return;
      }

      setResult(data);
      toast({ title: "تحلیل خطر ترجمه انجام شد" });
    } catch (err) {
      console.error("Error:", err);
      toast({ title: "خطا در اتصال", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high": return "destructive";
      case "medium": return "outline";
      default: return "secondary";
    }
  };

  const getRiskBg = (level: string) => {
    switch (level) {
      case "high": return "bg-destructive/10 border-destructive/30";
      case "medium": return "bg-orange-500/10 border-orange-500/30";
      default: return "bg-green-500/10 border-green-500/30";
    }
  };

  const getClarityColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-green-400";
    if (score >= 40) return "text-orange-400";
    return "text-destructive";
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <Languages className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>خطر ترجمه استراتژی</CardTitle>
                <CardDescription>
                  شناسایی سوءتفاهم‌ها در درک دستورات
                </CardDescription>
              </div>
            </div>
            <Button onClick={analyzeRisks} disabled={loading}>
              {loading ? (
                <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
              ) : (
                <Languages className="ml-2 h-4 w-4" />
              )}
              {loading ? "در حال تحلیل..." : "تحلیل خطر"}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {result && (
        <>
          {/* Clarity Score */}
          <Card>
            <CardContent className="py-6">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium">شفافیت کلی ارتباطات</span>
                <span className={`text-3xl font-bold ${getClarityColor(result.overall_clarity_score)}`}>
                  {result.overall_clarity_score}%
                </span>
              </div>
              <Progress value={result.overall_clarity_score} className="h-3" />
              <p className="text-sm text-muted-foreground mt-4">{result.summary}</p>
            </CardContent>
          </Card>

          {/* Risk Cards */}
          {result.translation_risks.length > 0 ? (
            <div className="space-y-4">
              {result.translation_risks.map((risk, index) => (
                <Alert key={index} className={getRiskBg(risk.risk_level)}>
                  <AlertTriangle className="h-5 w-5" />
                  <AlertTitle className="flex items-center gap-2 flex-wrap">
                    {risk.intent_title}
                    <Badge variant={getRiskColor(risk.risk_level)}>
                      {risk.risk_level === "high" ? "خطر بالا" : risk.risk_level === "medium" ? "خطر متوسط" : "خطر کم"}
                    </Badge>
                    <Badge variant="outline">{risk.deputy}</Badge>
                  </AlertTitle>
                  <AlertDescription className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-background/50">
                        <p className="text-xs text-muted-foreground mb-1">منظور اصلی:</p>
                        <p className="text-sm font-medium">{risk.original_meaning}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-background/50 flex items-center gap-3">
                        <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">برداشت شده:</p>
                          <p className="text-sm font-medium">{risk.interpreted_as}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-xs text-muted-foreground mb-1">پیشنهاد:</p>
                      <p className="text-sm">{risk.recommendation}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {risk.affected_deputies_count} نفر با این سوءتفاهم
                    </p>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-muted-foreground">سوءتفاهمی یافت نشد</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
