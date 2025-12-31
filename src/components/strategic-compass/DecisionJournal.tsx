import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FileText, 
  Plus, 
  Save,
  X,
  Target,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { DEMO_BEHAVIOR_LOGS, DEMO_DECISION_JOURNALS } from "@/data/demoData";

interface Behavior {
  id: string;
  action_description: string;
  intent_id: string;
}

interface DecisionJournal {
  id: string;
  behavior_id: string;
  rejected_options: string;
  supporting_data: string;
  risk_prediction: string;
  created_at: string;
}

const DecisionJournal = () => {
  const [journals, setJournals] = useState<DecisionJournal[]>([]);
  const [behaviors, setBehaviors] = useState<Behavior[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    behavior_id: "",
    rejected_options: "",
    supporting_data: "",
    risk_prediction: "",
  });
  const { user } = useAuth();
  const { toast } = useToast();
  const { isDemoMode } = useDemoMode();

  useEffect(() => {
    fetchData();
  }, [isDemoMode]);

  const fetchData = async () => {
    if (isDemoMode) {
      // Map behaviors for demo mode
      const demoBehaviors = DEMO_BEHAVIOR_LOGS.map(b => ({
        id: b.id,
        action_description: b.action_description,
        intent_id: b.intent_id
      }));
      
      setBehaviors(demoBehaviors);
      setJournals(DEMO_DECISION_JOURNALS as DecisionJournal[]);
      setIsLoading(false);
      return;
    }

    try {
      const [journalsRes, behaviorsRes] = await Promise.all([
        supabase.from('decision_journals').select('*').order('created_at', { ascending: false }),
        supabase.from('behaviors').select('id, action_description, intent_id')
      ]);

      if (journalsRes.data) setJournals(journalsRes.data);
      if (behaviorsRes.data) setBehaviors(behaviorsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!user || !formData.behavior_id) return;

    if (isDemoMode) {
      toast({
        title: "حالت نمایشی",
        description: "در حالت نمایشی امکان ثبت وجود ندارد",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('decision_journals')
        .insert({
          behavior_id: formData.behavior_id,
          rejected_options: formData.rejected_options,
          supporting_data: formData.supporting_data,
          risk_prediction: formData.risk_prediction,
        });

      if (error) throw error;

      toast({
        title: "ژورنال ثبت شد",
        description: "فرآیند تصمیم‌گیری شما با موفقیت مستند شد",
      });

      setFormData({ behavior_id: "", rejected_options: "", supporting_data: "", risk_prediction: "" });
      setIsCreating(false);
      fetchData();
    } catch (err) {
      console.error('Error creating journal:', err);
      toast({
        title: "خطا",
        description: "مشکلی در ثبت ژورنال رخ داد",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getBehaviorTitle = (behaviorId: string) => {
    const behavior = behaviors.find(b => b.id === behaviorId);
    return behavior?.action_description.substring(0, 50) + '...' || 'نامشخص';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FileText className="w-8 h-8 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            ژورنال تصمیم (Decision Audit)
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            مستندسازی فرآیند تصمیم‌گیری - الهام از Ray Dalio
          </p>
        </div>
        {!isCreating && (
          <Button 
            onClick={() => setIsCreating(true)}
            className="glow-button text-foreground"
          >
            <Plus className="w-4 h-4 ml-2" />
            ثبت تصمیم جدید
          </Button>
        )}
      </div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 border-2 border-primary/20"
      >
        <p className="text-foreground text-sm">
          <strong className="text-primary">فلسفه:</strong> نتیجه مهم نیست، "فرآیند تصمیم‌گیری" مهمه. ممکنه یه معاون شانسی یه کار خوب بکنه، یا با یه منطق درست شکست بخوره. مدیرعامل باید بدونه "چرا" این تصمیم گرفته شد.
        </p>
      </motion.div>

      {/* Create Form */}
      {isCreating && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">مستندسازی تصمیم</h3>
          <div className="space-y-5">
            <div>
              <Label>مرتبط با اقدام</Label>
              <Select
                value={formData.behavior_id}
                onValueChange={(value) => setFormData({ ...formData, behavior_id: value })}
              >
                <SelectTrigger className="mt-1.5 bg-secondary/50 border-border">
                  <SelectValue placeholder="انتخاب اقدام..." />
                </SelectTrigger>
                <SelectContent>
                  {behaviors.map((behavior) => (
                    <SelectItem key={behavior.id} value={behavior.id}>
                      {behavior.action_description.substring(0, 60)}...
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="rejected" className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                گزینه‌های رد شده
              </Label>
              <p className="text-xs text-muted-foreground mb-1.5">
                چه راه‌حل‌های دیگه‌ای رو بررسی کردی و چرا ردشون کردی؟
              </p>
              <Textarea
                id="rejected"
                value={formData.rejected_options}
                onChange={(e) => setFormData({ ...formData, rejected_options: e.target.value })}
                placeholder="مثال: گزینه A به دلیل هزینه بالا رد شد..."
                className="bg-secondary/50 border-border min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="data" className="flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-500" />
                داده‌های پشتیبان
              </Label>
              <p className="text-xs text-muted-foreground mb-1.5">
                بر اساس کدام عدد یا داده این تصمیم رو گرفتی؟
              </p>
              <Textarea
                id="data"
                value={formData.supporting_data}
                onChange={(e) => setFormData({ ...formData, supporting_data: e.target.value })}
                placeholder="مثال: طبق گزارش فروش سه ماه اخیر که نشان می‌دهد..."
                className="bg-secondary/50 border-border min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="risk" className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                پیش‌بینی ریسک
              </Label>
              <p className="text-xs text-muted-foreground mb-1.5">
                اگر این تصمیم غلط از آب دربیاد، بدترین اتفاق چیه؟
              </p>
              <Textarea
                id="risk"
                value={formData.risk_prediction}
                onChange={(e) => setFormData({ ...formData, risk_prediction: e.target.value })}
                placeholder="مثال: در بدترین حالت، ممکن است ۱۰٪ از مشتریان را از دست بدهیم..."
                className="bg-secondary/50 border-border min-h-[100px]"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button onClick={handleCreate} className="glow-button text-foreground">
                <Save className="w-4 h-4 ml-2" />
                ثبت ژورنال
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCreating(false);
                  setFormData({ behavior_id: "", rejected_options: "", supporting_data: "", risk_prediction: "" });
                }}
                className="border-border"
              >
                <X className="w-4 h-4 ml-2" />
                انصراف
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Journals List */}
      <div className="space-y-4">
        {journals.map((journal, index) => (
          <motion.div
            key={journal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card p-5"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">مرتبط با:</p>
                  <p className="text-foreground font-medium">{getBehaviorTitle(journal.behavior_id)}</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDate(journal.created_at)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-red-500">گزینه‌های رد شده</span>
                </div>
                <p className="text-sm text-foreground">{journal.rejected_options}</p>
              </div>

              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Search className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-500">داده‌های پشتیبان</span>
                </div>
                <p className="text-sm text-foreground">{journal.supporting_data}</p>
              </div>

              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-yellow-500">پیش‌بینی ریسک</span>
                </div>
                <p className="text-sm text-foreground">{journal.risk_prediction}</p>
              </div>
            </div>
          </motion.div>
        ))}

        {journals.length === 0 && !isLoading && (
          <div className="glass-card p-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">هنوز ژورنالی ثبت نشده</h3>
            <p className="text-muted-foreground text-sm mb-4">
              فرآیند تصمیم‌گیری خود را مستند کنید
            </p>
            <Button onClick={() => setIsCreating(true)} className="glow-button text-foreground">
              <Plus className="w-4 h-4 ml-2" />
              ثبت تصمیم
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DecisionJournal;
