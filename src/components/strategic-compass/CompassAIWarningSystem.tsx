import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { AlertTriangle, AlertCircle, CheckCircle2, Brain, RefreshCw, ShieldAlert } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Warning {
  level: "red" | "yellow" | "green";
  deputy: string;
  deputy_id: string;
  title: string;
  description: string;
  pattern: string;
  deviation_percentage: number;
}

interface AnalysisResult {
  warnings: Warning[];
  summary: string;
}

export default function CompassAIWarningSystem() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);

  const analyzeDeviations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-compass-deviations");

      if (error) {
        console.error("Error:", error);
        toast({ 
          title: "خطا در تحلیل", 
          description: error.message,
          variant: "destructive" 
        });
        return;
      }

      if (data.error) {
        toast({ 
          title: "خطا", 
          description: data.error,
          variant: "destructive" 
        });
        return;
      }

      setResult(data);
      setLastAnalysis(new Date());
      toast({ title: "تحلیل هوشمند انجام شد" });
    } catch (err) {
      console.error("Error analyzing:", err);
      toast({ 
        title: "خطا در اتصال", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const getWarningIcon = (level: string) => {
    switch (level) {
      case "red":
        return <ShieldAlert className="h-5 w-5 text-destructive" />;
      case "yellow":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      default:
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
  };

  const getWarningColor = (level: string) => {
    switch (level) {
      case "red":
        return "border-destructive/50 bg-destructive/5";
      case "yellow":
        return "border-orange-500/50 bg-orange-500/5";
      default:
        return "border-green-500/50 bg-green-500/5";
    }
  };

  const getDeviationColor = (percentage: number) => {
    if (percentage >= 70) return "bg-destructive";
    if (percentage >= 40) return "bg-orange-500";
    return "bg-green-500";
  };

  const redWarnings = result?.warnings.filter(w => w.level === "red") || [];
  const yellowWarnings = result?.warnings.filter(w => w.level === "yellow") || [];
  const greenWarnings = result?.warnings.filter(w => w.level === "green") || [];

  return (
    <div className="space-y-6" dir="rtl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>سیستم هشدار هوشمند</CardTitle>
                <CardDescription>
                  تحلیل الگوهای انحراف معاونین با هوش مصنوعی
                </CardDescription>
              </div>
            </div>
            <Button onClick={analyzeDeviations} disabled={loading}>
              {loading ? (
                <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
              ) : (
                <Brain className="ml-2 h-4 w-4" />
              )}
              {loading ? "در حال تحلیل..." : "تحلیل جدید"}
            </Button>
          </div>
        </CardHeader>
        
        {lastAnalysis && (
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              آخرین تحلیل: {lastAnalysis.toLocaleString("fa-IR")}
            </p>
          </CardContent>
        )}
      </Card>

      {result && (
        <>
          {/* Summary */}
          <Card className="border-primary/20">
            <CardContent className="py-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <AlertCircle className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">خلاصه وضعیت</h3>
                  <p className="text-muted-foreground">{result.summary}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-destructive/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-destructive/10">
                      <ShieldAlert className="h-5 w-5 text-destructive" />
                    </div>
                    <span className="font-medium">هشدار قرمز</span>
                  </div>
                  <span className="text-3xl font-bold text-destructive">{redWarnings.length}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-orange-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-orange-500/10">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                    </div>
                    <span className="font-medium">هشدار زرد</span>
                  </div>
                  <span className="text-3xl font-bold text-orange-500">{yellowWarnings.length}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-green-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-green-500/10">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                    <span className="font-medium">وضعیت مطلوب</span>
                  </div>
                  <span className="text-3xl font-bold text-green-500">{greenWarnings.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Warning Cards */}
          {result.warnings.length > 0 ? (
            <div className="space-y-4">
              {result.warnings.map((warning, index) => (
                <Alert key={index} className={getWarningColor(warning.level)}>
                  <div className="flex items-start gap-4">
                    {getWarningIcon(warning.level)}
                    <div className="flex-1">
                      <AlertTitle className="flex items-center gap-2">
                        {warning.title}
                        <Badge variant="outline" className="mr-2">
                          {warning.deputy}
                        </Badge>
                      </AlertTitle>
                      <AlertDescription className="mt-2">
                        {warning.description}
                      </AlertDescription>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">الگو: {warning.pattern}</span>
                          <span className="font-medium">انحراف: {warning.deviation_percentage}%</span>
                        </div>
                        <Progress 
                          value={warning.deviation_percentage} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-muted-foreground">هیچ هشداری یافت نشد</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
