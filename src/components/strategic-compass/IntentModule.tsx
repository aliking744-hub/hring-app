import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Zap, 
  Plus, 
  Edit2, 
  Trash2, 
  Save,
  X,
  Target,
  Scale,
  Gauge
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Intent {
  id: string;
  title: string;
  description: string;
  strategic_weight: number;
  tolerance_zone: number;
  status: string;
  created_at: string;
}

const IntentModule = () => {
  const [intents, setIntents] = useState<Intent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    strategic_weight: 5,
    tolerance_zone: 5,
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchIntents();
  }, []);

  const fetchIntents = async () => {
    try {
      const { data, error } = await supabase
        .from('strategic_intents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIntents(data || []);
    } catch (err) {
      console.error('Error fetching intents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('strategic_intents')
        .insert({
          title: formData.title,
          description: formData.description,
          strategic_weight: formData.strategic_weight,
          tolerance_zone: formData.tolerance_zone,
          ceo_id: user.id,
        });

      if (error) throw error;

      toast({
        title: "فرمان ثبت شد",
        description: "نیت استراتژیک جدید با موفقیت ایجاد شد",
      });

      setFormData({ title: "", description: "", strategic_weight: 5, tolerance_zone: 5 });
      setIsCreating(false);
      fetchIntents();
    } catch (err) {
      console.error('Error creating intent:', err);
      toast({
        title: "خطا",
        description: "مشکلی در ثبت فرمان رخ داد",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('strategic_intents')
        .update({
          title: formData.title,
          description: formData.description,
          strategic_weight: formData.strategic_weight,
          tolerance_zone: formData.tolerance_zone,
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "بروزرسانی شد",
        description: "فرمان با موفقیت ویرایش شد",
      });

      setEditingId(null);
      fetchIntents();
    } catch (err) {
      console.error('Error updating intent:', err);
      toast({
        title: "خطا",
        description: "مشکلی در ویرایش رخ داد",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('strategic_intents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "حذف شد",
        description: "فرمان با موفقیت حذف شد",
      });

      fetchIntents();
    } catch (err) {
      console.error('Error deleting intent:', err);
      toast({
        title: "خطا",
        description: "مشکلی در حذف رخ داد",
        variant: "destructive",
      });
    }
  };

  const startEditing = (intent: Intent) => {
    setEditingId(intent.id);
    setFormData({
      title: intent.title,
      description: intent.description,
      strategic_weight: intent.strategic_weight,
      tolerance_zone: intent.tolerance_zone,
    });
  };

  const getWeightLabel = (weight: number) => {
    if (weight <= 3) return "کم اهمیت";
    if (weight <= 6) return "متوسط";
    if (weight <= 8) return "مهم";
    return "حیاتی";
  };

  const getToleranceLabel = (tolerance: number) => {
    if (tolerance <= 3) return "دقیقاً همین را اجرا کن";
    if (tolerance <= 6) return "انعطاف محدود";
    return "نتیجه مهمه، روش با خودت";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            ماژول فرمان (The Intent)
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            DNA تصمیمات استراتژیک خود را مشخص کنید
          </p>
        </div>
        {!isCreating && (
          <Button 
            onClick={() => setIsCreating(true)}
            className="glow-button text-foreground"
          >
            <Plus className="w-4 h-4 ml-2" />
            فرمان جدید
          </Button>
        )}
      </div>

      {/* Create Form */}
      {isCreating && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">ثبت فرمان جدید</h3>
          <div className="space-y-5">
            <div>
              <Label htmlFor="title">عنوان فرمان</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="مثال: کاهش هزینه لجستیک"
                className="mt-1.5 bg-secondary/50 border-border"
              />
            </div>

            <div>
              <Label htmlFor="description">شرح استراتژیک</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="توضیحات کامل درباره این نیت استراتژیک..."
                className="mt-1.5 bg-secondary/50 border-border min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-primary" />
                    وزن استراتژیک
                  </Label>
                  <span className="text-sm font-medium text-primary">
                    {formData.strategic_weight} - {getWeightLabel(formData.strategic_weight)}
                  </span>
                </div>
                <Slider
                  value={[formData.strategic_weight]}
                  onValueChange={(value) => setFormData({ ...formData, strategic_weight: value[0] })}
                  min={1}
                  max={10}
                  step={1}
                  className="py-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  انحراف در کار کم‌اهمیت مهم نیست، اما در کار حیاتی فاجعه است
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-accent" />
                    حد تحمل انحراف
                  </Label>
                  <span className="text-sm font-medium text-accent">
                    {formData.tolerance_zone} - {getToleranceLabel(formData.tolerance_zone)}
                  </span>
                </div>
                <Slider
                  value={[formData.tolerance_zone]}
                  onValueChange={(value) => setFormData({ ...formData, tolerance_zone: value[0] })}
                  min={1}
                  max={10}
                  step={1}
                  className="py-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  چقدر اجازه خلاقیت به معاون می‌دهید؟
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button onClick={handleCreate} className="glow-button text-foreground">
                <Save className="w-4 h-4 ml-2" />
                ثبت فرمان
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCreating(false);
                  setFormData({ title: "", description: "", strategic_weight: 5, tolerance_zone: 5 });
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

      {/* Intents List */}
      <div className="space-y-4">
        {intents.map((intent, index) => (
          <motion.div
            key={intent.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card p-5"
          >
            {editingId === intent.id ? (
              <div className="space-y-4">
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-secondary/50 border-border"
                />
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-secondary/50 border-border"
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">وزن استراتژیک: {formData.strategic_weight}</Label>
                    <Slider
                      value={[formData.strategic_weight]}
                      onValueChange={(value) => setFormData({ ...formData, strategic_weight: value[0] })}
                      min={1}
                      max={10}
                      step={1}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">حد تحمل: {formData.tolerance_zone}</Label>
                    <Slider
                      value={[formData.tolerance_zone]}
                      onValueChange={(value) => setFormData({ ...formData, tolerance_zone: value[0] })}
                      min={1}
                      max={10}
                      step={1}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleUpdate(intent.id)}>
                    <Save className="w-4 h-4 ml-1" />
                    ذخیره
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                    انصراف
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">{intent.title}</h3>
                    </div>
                    <p className="text-muted-foreground text-sm">{intent.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="icon" 
                      variant="ghost"
                      onClick={() => startEditing(intent)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(intent.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">وزن:</span>
                    <span className={`text-sm font-medium ${
                      intent.strategic_weight >= 8 ? 'text-red-500' :
                      intent.strategic_weight >= 5 ? 'text-yellow-500' :
                      'text-green-500'
                    }`}>
                      {intent.strategic_weight}/10 ({getWeightLabel(intent.strategic_weight)})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">تحمل:</span>
                    <span className="text-sm font-medium text-accent">
                      {intent.tolerance_zone}/10 ({getToleranceLabel(intent.tolerance_zone)})
                    </span>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        ))}

        {intents.length === 0 && !isLoading && (
          <div className="glass-card p-12 text-center">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">هنوز فرمانی ثبت نشده</h3>
            <p className="text-muted-foreground text-sm mb-4">
              اولین نیت استراتژیک خود را تعریف کنید
            </p>
            <Button onClick={() => setIsCreating(true)} className="glow-button text-foreground">
              <Plus className="w-4 h-4 ml-2" />
              ایجاد فرمان
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntentModule;
