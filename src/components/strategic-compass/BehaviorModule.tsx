import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Activity, 
  Plus, 
  Clock, 
  DollarSign,
  Target,
  Save,
  X,
  FileText,
  CheckCircle2
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
import { DEMO_INTENTS, DEMO_BEHAVIOR_LOGS } from "@/data/demoData";

interface Intent {
  id: string;
  title: string;
  description: string;
}

interface Behavior {
  id: string;
  intent_id: string;
  action_description: string;
  time_spent: number;
  resources_used: number;
  notes: string | null;
  created_at: string;
  intent?: Intent;
}

interface BehaviorModuleProps {
  canEdit?: boolean;
}

const BehaviorModule = ({ canEdit = true }: BehaviorModuleProps) => {
  const [behaviors, setBehaviors] = useState<Behavior[]>([]);
  const [intents, setIntents] = useState<Intent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    intent_id: "",
    action_description: "",
    time_spent: 0,
    resources_used: 0,
    notes: "",
  });
  const { user } = useAuth();
  const { toast } = useToast();

  const { isDemoMode } = useDemoMode();

  useEffect(() => {
    fetchData();
  }, [isDemoMode]);

  const fetchData = async () => {
    if (isDemoMode) {
      // Map intents to behavior logs for demo mode
      const demoBehaviorsWithIntents = DEMO_BEHAVIOR_LOGS.map(b => ({
        ...b,
        intent: DEMO_INTENTS.find(i => i.id === b.intent_id)
      }));
      setIntents(DEMO_INTENTS as Intent[]);
      setBehaviors(demoBehaviorsWithIntents as Behavior[]);
      setIsLoading(false);
      return;
    }

    try {
      const [intentsRes, behaviorsRes] = await Promise.all([
        supabase.from('strategic_intents').select('id, title, description').eq('status', 'active'),
        supabase.from('behaviors').select('*').order('created_at', { ascending: false })
      ]);

      if (intentsRes.data) setIntents(intentsRes.data);
      if (behaviorsRes.data) {
        // Map intents to behaviors
        const behaviorsWithIntents = behaviorsRes.data.map(b => ({
          ...b,
          intent: intentsRes.data?.find(i => i.id === b.intent_id)
        }));
        setBehaviors(behaviorsWithIntents);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!user || !formData.intent_id) return;
    
    try {
      const { error } = await supabase
        .from('behaviors')
        .insert({
          intent_id: formData.intent_id,
          action_description: formData.action_description,
          time_spent: formData.time_spent,
          resources_used: formData.resources_used,
          notes: formData.notes || null,
          deputy_id: user.id,
        });

      if (error) throw error;

      toast({
        title: "گزارش ثبت شد",
        description: "اقدام شما با موفقیت ثبت شد",
      });

      setFormData({ intent_id: "", action_description: "", time_spent: 0, resources_used: 0, notes: "" });
      setIsCreating(false);
      fetchData();
    } catch (err) {
      console.error('Error creating behavior:', err);
      toast({
        title: "خطا",
        description: "مشکلی در ثبت گزارش رخ داد",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            ماژول رفتار (The Behavior)
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            گزارش اقدامات و عملکرد خود را ثبت کنید
          </p>
        </div>
        {!isCreating && canEdit && (
          <Button 
            onClick={() => setIsCreating(true)}
            className="glow-button text-foreground"
          >
            <Plus className="w-4 h-4 ml-2" />
            ثبت اقدام جدید
          </Button>
        )}
        {!canEdit && (
          <div className="glass-card px-4 py-2 border border-amber-500/30 bg-amber-500/10">
            <span className="text-sm text-amber-400">حالت فقط مشاهده</span>
          </div>
        )}
      </div>

      {/* Create Form */}
      {isCreating && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">ثبت اقدام جدید</h3>
          <div className="space-y-5">
            <div>
              <Label>مرتبط با فرمان</Label>
              <Select
                value={formData.intent_id}
                onValueChange={(value) => setFormData({ ...formData, intent_id: value })}
              >
                <SelectTrigger className="mt-1.5 bg-secondary/50 border-border">
                  <SelectValue placeholder="انتخاب فرمان استراتژیک..." />
                </SelectTrigger>
                <SelectContent>
                  {intents.map((intent) => (
                    <SelectItem key={intent.id} value={intent.id}>
                      {intent.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="action">شرح اقدام انجام شده</Label>
              <Textarea
                id="action"
                value={formData.action_description}
                onChange={(e) => setFormData({ ...formData, action_description: e.target.value })}
                placeholder="توضیح کامل اقدامی که انجام داده‌اید..."
                className="mt-1.5 bg-secondary/50 border-border min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="time" className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  زمان صرف شده (ساعت)
                </Label>
                <Input
                  id="time"
                  type="number"
                  value={formData.time_spent}
                  onChange={(e) => setFormData({ ...formData, time_spent: Number(e.target.value) })}
                  placeholder="0"
                  className="mt-1.5 bg-secondary/50 border-border"
                  min={0}
                />
              </div>

              <div>
                <Label htmlFor="resources" className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  منابع مصرف شده (میلیون تومان)
                </Label>
                <Input
                  id="resources"
                  type="number"
                  value={formData.resources_used}
                  onChange={(e) => setFormData({ ...formData, resources_used: Number(e.target.value) })}
                  placeholder="0"
                  className="mt-1.5 bg-secondary/50 border-border"
                  min={0}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">یادداشت‌ها (اختیاری)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="هر نکته اضافی..."
                className="mt-1.5 bg-secondary/50 border-border"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button onClick={handleCreate} className="glow-button text-foreground">
                <Save className="w-4 h-4 ml-2" />
                ثبت گزارش
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCreating(false);
                  setFormData({ intent_id: "", action_description: "", time_spent: 0, resources_used: 0, notes: "" });
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

      {/* Behaviors List */}
      <div className="space-y-4">
        {behaviors.map((behavior, index) => (
          <motion.div
            key={behavior.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card p-5"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex-1">
                {behavior.intent && (
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-primary" />
                    <span className="text-sm text-primary font-medium">{behavior.intent.title}</span>
                  </div>
                )}
                <p className="text-foreground">{behavior.action_description}</p>
                {behavior.notes && (
                  <p className="text-sm text-muted-foreground mt-2 flex items-start gap-2">
                    <FileText className="w-4 h-4 mt-0.5" />
                    {behavior.notes}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{behavior.time_spent} ساعت</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <DollarSign className="w-4 h-4" />
                    <span>{behavior.resources_used} م.ت</span>
                  </div>
                  <span className="text-xs text-muted-foreground/70 mr-auto">
                    {formatDate(behavior.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {behaviors.length === 0 && !isLoading && (
          <div className="glass-card p-12 text-center">
            <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">هنوز گزارشی ثبت نشده</h3>
            <p className="text-muted-foreground text-sm mb-4">
              اولین اقدام خود را گزارش دهید
            </p>
            <Button onClick={() => setIsCreating(true)} className="glow-button text-foreground">
              <Plus className="w-4 h-4 ml-2" />
              ثبت اقدام
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BehaviorModule;
