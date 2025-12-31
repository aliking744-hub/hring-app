import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Eye, 
  Brain, 
  Plus, 
  Send, 
  CheckCircle2,
  XCircle,
  Users,
  Lightbulb,
  BarChart3,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Scenario {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  category: string;
  ceo_answer: string | null;
  is_active: boolean;
}

interface Response {
  scenario_id: string;
  user_id: string;
  answer: string;
}

const MentalPrism = () => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    question: "",
    option_a: "",
    option_b: "",
    option_c: "",
    category: "general",
    ceo_answer: ""
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [scenariosRes, responsesRes] = await Promise.all([
        supabase.from('scenarios').select('*').order('created_at', { ascending: false }),
        supabase.from('scenario_responses').select('*')
      ]);

      if (scenariosRes.data) setScenarios(scenariosRes.data);
      if (responsesRes.data) setResponses(responsesRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateScenario = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('scenarios')
        .insert({
          question: formData.question,
          option_a: formData.option_a,
          option_b: formData.option_b,
          option_c: formData.option_c,
          category: formData.category,
          ceo_answer: formData.ceo_answer,
          ceo_id: user.id,
        });

      if (error) throw error;

      toast({
        title: "سناریو ایجاد شد",
        description: "سوال جدید برای ارزیابی همسویی ثبت شد",
      });

      setFormData({ question: "", option_a: "", option_b: "", option_c: "", category: "general", ceo_answer: "" });
      setIsCreating(false);
      fetchData();
    } catch (err) {
      console.error('Error creating scenario:', err);
      toast({
        title: "خطا",
        description: "مشکلی در ایجاد سناریو رخ داد",
        variant: "destructive",
      });
    }
  };

  const getAlignmentStats = (scenarioId: string, ceoAnswer: string | null) => {
    if (!ceoAnswer) return { aligned: 0, total: 0, percentage: 0 };
    
    const scenarioResponses = responses.filter(r => r.scenario_id === scenarioId);
    const aligned = scenarioResponses.filter(r => r.answer === ceoAnswer).length;
    const total = scenarioResponses.length;
    const percentage = total > 0 ? Math.round((aligned / total) * 100) : 0;
    
    return { aligned, total, percentage };
  };

  const categories = [
    { value: "general", label: "عمومی" },
    { value: "financial", label: "مالی" },
    { value: "hr", label: "منابع انسانی" },
    { value: "sales", label: "فروش" },
    { value: "strategy", label: "استراتژی" },
  ];

  // Mock analysis data
  const perceptionGapAnalysis = [
    { 
      deputy: "معاون مالی", 
      alignment: 85, 
      deviationType: "محافظه‌کار",
      rootCause: "درک صحیح - اجرای دقیق"
    },
    { 
      deputy: "معاون فروش", 
      alignment: 72, 
      deviationType: "ریسک‌پذیر",
      rootCause: "اختلاف عقیدتی جزئی"
    },
    { 
      deputy: "معاون منابع انسانی", 
      alignment: 55, 
      deviationType: "مقاوم در برابر تغییر",
      rootCause: "درک نادرست دستورات"
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Brain className="w-8 h-8 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Eye className="w-6 h-6 text-primary" />
            منشور ذهنی (Mental Prism)
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            تست قضاوت موقعیتی و تحلیل شکاف ادراکی
          </p>
        </div>
        {!isCreating && (
          <Button 
            onClick={() => setIsCreating(true)}
            className="glow-button text-foreground"
          >
            <Plus className="w-4 h-4 ml-2" />
            سناریوی جدید
          </Button>
        )}
      </div>

      {/* Create Scenario Form */}
      {isCreating && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            ایجاد سناریوی جدید
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            یک موقعیت فرضی تعریف کنید و گزینه‌های مختلف را مشخص نمایید. سپس جواب خود را انتخاب کنید تا معیار همسویی شود.
          </p>

          <div className="space-y-5">
            <div>
              <Label>دسته‌بندی</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {categories.map((cat) => (
                  <Button
                    key={cat.value}
                    type="button"
                    variant={formData.category === cat.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormData({ ...formData, category: cat.value })}
                    className={formData.category === cat.value ? "glow-button" : ""}
                  >
                    {cat.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="question">سوال / موقعیت فرضی</Label>
              <Textarea
                id="question"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="مثال: فرض کنید یک مشتری قدیمی درخواست تخفیفی دارد که با سیاست‌های فعلی مغایرت دارد..."
                className="mt-1.5 bg-secondary/50 border-border min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="option_a" className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-sm font-bold">الف</span>
                  گزینه اول
                </Label>
                <Textarea
                  id="option_a"
                  value={formData.option_a}
                  onChange={(e) => setFormData({ ...formData, option_a: e.target.value })}
                  placeholder="رد می‌کنم و قوانین را توضیح می‌دهم"
                  className="mt-1.5 bg-secondary/50 border-border"
                />
              </div>
              <div>
                <Label htmlFor="option_b" className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-sm font-bold">ب</span>
                  گزینه دوم
                </Label>
                <Textarea
                  id="option_b"
                  value={formData.option_b}
                  onChange={(e) => setFormData({ ...formData, option_b: e.target.value })}
                  placeholder="قبول می‌کنم چون حفظ رابطه مهم‌تره"
                  className="mt-1.5 bg-secondary/50 border-border"
                />
              </div>
              <div>
                <Label htmlFor="option_c" className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center text-sm font-bold">ج</span>
                  گزینه سوم
                </Label>
                <Textarea
                  id="option_c"
                  value={formData.option_c}
                  onChange={(e) => setFormData({ ...formData, option_c: e.target.value })}
                  placeholder="با مدیر بالادستی چک می‌کنم"
                  className="mt-1.5 bg-secondary/50 border-border"
                />
              </div>
            </div>

            <div>
              <Label>جواب شما (Ground Truth)</Label>
              <p className="text-xs text-muted-foreground mb-2">
                این گزینه به عنوان معیار همسویی استفاده می‌شود
              </p>
              <RadioGroup
                value={formData.ceo_answer}
                onValueChange={(value) => setFormData({ ...formData, ceo_answer: value })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="a" id="answer_a" />
                  <Label htmlFor="answer_a">گزینه الف</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="b" id="answer_b" />
                  <Label htmlFor="answer_b">گزینه ب</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="c" id="answer_c" />
                  <Label htmlFor="answer_c">گزینه ج</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button onClick={handleCreateScenario} className="glow-button text-foreground">
                <Send className="w-4 h-4 ml-2" />
                ارسال برای معاونین
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsCreating(false)}
                className="border-border"
              >
                انصراف
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Perception Gap Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          تحلیل شکاف ادراکی
        </h3>
        <div className="space-y-4">
          {perceptionGapAnalysis.map((item, index) => (
            <motion.div
              key={item.deputy}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground">{item.deputy}</span>
                  <span className={`text-lg font-bold ${
                    item.alignment >= 75 ? 'text-green-500' :
                    item.alignment >= 50 ? 'text-yellow-500' :
                    'text-red-500'
                  }`}>
                    {item.alignment}% هم‌راستایی
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">
                    نوع انحراف: <span className="text-foreground">{item.deviationType}</span>
                  </span>
                  <span className="text-muted-foreground">
                    ریشه اختلاف: <span className="text-foreground">{item.rootCause}</span>
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Scenarios List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">سناریوهای فعال</h3>
        {scenarios.filter(s => s.is_active).map((scenario, index) => {
          const stats = getAlignmentStats(scenario.id, scenario.ceo_answer);
          return (
            <motion.div
              key={scenario.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="px-2 py-1 rounded-full text-xs bg-primary/20 text-primary">
                  {categories.find(c => c.value === scenario.category)?.label || 'عمومی'}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {stats.total} پاسخ
                  </span>
                  <span className={`text-sm font-medium ${
                    stats.percentage >= 75 ? 'text-green-500' :
                    stats.percentage >= 50 ? 'text-yellow-500' :
                    'text-red-500'
                  }`}>
                    {stats.percentage}% همسو
                  </span>
                </div>
              </div>
              <p className="text-foreground mb-4">{scenario.question}</p>
              <div className="grid grid-cols-3 gap-3">
                <div className={`p-3 rounded-lg border ${
                  scenario.ceo_answer === 'a' ? 'border-primary bg-primary/10' : 'border-border/50'
                }`}>
                  <span className="text-xs text-muted-foreground">الف)</span>
                  <p className="text-sm text-foreground mt-1">{scenario.option_a}</p>
                </div>
                <div className={`p-3 rounded-lg border ${
                  scenario.ceo_answer === 'b' ? 'border-primary bg-primary/10' : 'border-border/50'
                }`}>
                  <span className="text-xs text-muted-foreground">ب)</span>
                  <p className="text-sm text-foreground mt-1">{scenario.option_b}</p>
                </div>
                <div className={`p-3 rounded-lg border ${
                  scenario.ceo_answer === 'c' ? 'border-primary bg-primary/10' : 'border-border/50'
                }`}>
                  <span className="text-xs text-muted-foreground">ج)</span>
                  <p className="text-sm text-foreground mt-1">{scenario.option_c}</p>
                </div>
              </div>
            </motion.div>
          );
        })}

        {scenarios.filter(s => s.is_active).length === 0 && (
          <div className="glass-card p-12 text-center">
            <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">هنوز سناریویی تعریف نشده</h3>
            <p className="text-muted-foreground text-sm mb-4">
              اولین سناریوی تست قضاوت موقعیتی را ایجاد کنید
            </p>
            <Button onClick={() => setIsCreating(true)} className="glow-button text-foreground">
              <Plus className="w-4 h-4 ml-2" />
              ایجاد سناریو
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentalPrism;
