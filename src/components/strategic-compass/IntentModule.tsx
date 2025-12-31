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
  Gauge,
  Users,
  UserPlus,
  FlaskConical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { DEMO_INTENTS, DEMO_COMPASS_USERS, DEMO_INTENT_ASSIGNMENTS } from "@/data/demoData";

interface Intent {
  id: string;
  title: string;
  description: string;
  strategic_weight: number;
  tolerance_zone: number;
  status: string;
  created_at: string;
}

interface CompassUser {
  id: string;
  user_id: string;
  role: 'ceo' | 'deputy' | 'manager';
  full_name: string | null;
  title: string | null;
}

interface IntentAssignment {
  id: string;
  intent_id: string;
  user_id: string;
}

const IntentModule = () => {
  const [intents, setIntents] = useState<Intent[]>([]);
  const [compassUsers, setCompassUsers] = useState<CompassUser[]>([]);
  const [assignments, setAssignments] = useState<IntentAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [assigningIntentId, setAssigningIntentId] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    strategic_weight: 5,
    tolerance_zone: 5,
  });
  const { user } = useAuth();
  const { toast } = useToast();
  const { isDemoMode } = useDemoMode();

  useEffect(() => {
    fetchData();
  }, [isDemoMode]);

  const fetchData = async () => {
    setIsLoading(true);
    
    if (isDemoMode) {
      setIntents(DEMO_INTENTS as Intent[]);
      setCompassUsers(DEMO_COMPASS_USERS as CompassUser[]);
      setAssignments(DEMO_INTENT_ASSIGNMENTS as IntentAssignment[]);
      setIsLoading(false);
      return;
    }

    try {
      const [intentsRes, usersRes, assignmentsRes] = await Promise.all([
        supabase.from('strategic_intents').select('*').order('created_at', { ascending: false }),
        supabase.from('compass_user_roles').select('*').neq('role', 'ceo'),
        supabase.from('intent_assignments').select('*')
      ]);

      if (intentsRes.data) setIntents(intentsRes.data);
      if (usersRes.data) setCompassUsers(usersRes.data);
      if (assignmentsRes.data) setAssignments(assignmentsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
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
      fetchData();
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
      fetchData();
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

      fetchData();
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

  const openAssignDialog = (intentId: string) => {
    const currentAssignments = assignments
      .filter(a => a.intent_id === intentId)
      .map(a => a.user_id);
    setSelectedUsers(currentAssignments);
    setAssigningIntentId(intentId);
  };

  const handleSaveAssignments = async () => {
    if (!assigningIntentId) return;

    try {
      // Delete existing assignments for this intent
      await supabase
        .from('intent_assignments')
        .delete()
        .eq('intent_id', assigningIntentId);

      // Insert new assignments
      if (selectedUsers.length > 0) {
        const newAssignments = selectedUsers.map(userId => ({
          intent_id: assigningIntentId,
          user_id: userId,
        }));

        const { error } = await supabase
          .from('intent_assignments')
          .insert(newAssignments);

        if (error) throw error;
      }

      toast({
        title: "ذخیره شد",
        description: "افراد مسئول با موفقیت اختصاص داده شدند",
      });

      setAssigningIntentId(null);
      setSelectedUsers([]);
      fetchData();
    } catch (err) {
      console.error('Error saving assignments:', err);
      toast({
        title: "خطا",
        description: "مشکلی در ذخیره رخ داد",
        variant: "destructive",
      });
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
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

  const getAssignedUsers = (intentId: string) => {
    const intentAssignments = assignments.filter(a => a.intent_id === intentId);
    return compassUsers.filter(u => intentAssignments.some(a => a.user_id === u.user_id));
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

      {/* Assign Users Dialog */}
      {assigningIntentId && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            اختصاص افراد به این فرمان
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            افرادی که باید در اجرای این فرمان مشارکت داشته باشند را انتخاب کنید
          </p>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {compassUsers.map(compassUser => (
              <div
                key={compassUser.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedUsers.includes(compassUser.user_id)
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:bg-secondary/50'
                }`}
                onClick={() => toggleUserSelection(compassUser.user_id)}
              >
                <Checkbox
                  checked={selectedUsers.includes(compassUser.user_id)}
                  onCheckedChange={() => toggleUserSelection(compassUser.user_id)}
                />
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    {compassUser.full_name || compassUser.title || 'کاربر'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {compassUser.title || (compassUser.role === 'deputy' ? 'معاون' : 'مدیرکل')}
                  </p>
                </div>
              </div>
            ))}
            {compassUsers.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                هنوز کاربری تعریف نشده است
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 mt-4">
            <Button onClick={handleSaveAssignments} className="glow-button text-foreground">
              <Save className="w-4 h-4 ml-2" />
              ذخیره
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setAssigningIntentId(null);
                setSelectedUsers([]);
              }}
              className="border-border"
            >
              انصراف
            </Button>
          </div>
        </motion.div>
      )}

      {/* Intents List */}
      <div className="space-y-4">
        {intents.map((intent, index) => {
          const assignedUsers = getAssignedUsers(intent.id);
          
          return (
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
                        onClick={() => openAssignDialog(intent.id)}
                        title="اختصاص افراد"
                      >
                        <Users className="w-4 h-4" />
                      </Button>
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
                  
                  {/* Assigned Users */}
                  {assignedUsers.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {assignedUsers.map(u => (
                        <span 
                          key={u.id}
                          className="px-2 py-1 rounded-full text-xs bg-primary/20 text-primary"
                        >
                          {u.full_name || u.title || 'کاربر'}
                        </span>
                      ))}
                    </div>
                  )}

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
          );
        })}

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