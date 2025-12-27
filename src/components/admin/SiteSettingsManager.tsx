import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Save, Plus, Trash2 } from 'lucide-react';

interface SiteSetting {
  id: string;
  key: string;
  value: string | null;
  label: string | null;
}

const SiteSettingsManager = () => {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  
  // New setting form
  const [showNewForm, setShowNewForm] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      toast.error('خطا در دریافت تنظیمات');
      console.error(error);
    } else {
      setSettings(data || []);
      // Initialize edited values
      const values: Record<string, string> = {};
      (data || []).forEach(s => {
        values[s.id] = s.value || '';
      });
      setEditedValues(values);
    }
    setLoading(false);
  };

  const handleValueChange = (id: string, value: string) => {
    setEditedValues(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = async (setting: SiteSetting) => {
    const newValue = editedValues[setting.id];
    if (newValue === setting.value) return;

    setSaving(true);
    const { error } = await supabase
      .from('site_settings')
      .update({ value: newValue })
      .eq('id', setting.id);

    if (error) {
      toast.error('خطا در ذخیره تنظیمات');
      console.error(error);
    } else {
      toast.success('تنظیمات ذخیره شد');
      fetchSettings();
    }
    setSaving(false);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    
    const updates = settings
      .filter(s => editedValues[s.id] !== s.value)
      .map(s => 
        supabase
          .from('site_settings')
          .update({ value: editedValues[s.id] })
          .eq('id', s.id)
      );

    if (updates.length === 0) {
      toast.info('تغییری وجود ندارد');
      setSaving(false);
      return;
    }

    const results = await Promise.all(updates);
    const hasError = results.some(r => r.error);

    if (hasError) {
      toast.error('خطا در ذخیره برخی تنظیمات');
    } else {
      toast.success('تمام تنظیمات ذخیره شد');
      fetchSettings();
    }
    setSaving(false);
  };

  const handleAddNew = async () => {
    if (!newKey.trim() || !newLabel.trim()) {
      toast.error('کلید و برچسب الزامی است');
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from('site_settings')
      .insert({
        key: newKey.trim().toLowerCase().replace(/\s+/g, '_'),
        label: newLabel.trim(),
        value: newValue.trim()
      });

    if (error) {
      if (error.code === '23505') {
        toast.error('این کلید قبلاً وجود دارد');
      } else {
        toast.error('خطا در ایجاد تنظیم');
      }
      console.error(error);
    } else {
      toast.success('تنظیم جدید اضافه شد');
      setNewKey('');
      setNewLabel('');
      setNewValue('');
      setShowNewForm(false);
      fetchSettings();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این تنظیم مطمئن هستید؟')) return;

    const { error } = await supabase
      .from('site_settings')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('خطا در حذف تنظیم');
      console.error(error);
    } else {
      toast.success('تنظیم حذف شد');
      fetchSettings();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">مدیریت متون سایت</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowNewForm(!showNewForm)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            تنظیم جدید
          </Button>
          <Button
            onClick={handleSaveAll}
            disabled={saving}
            className="gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            ذخیره همه
          </Button>
        </div>
      </div>

      {/* New Setting Form */}
      {showNewForm && (
        <Card>
          <CardHeader>
            <CardTitle>افزودن تنظیم جدید</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>کلید (انگلیسی)</Label>
                <Input
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="hero_title"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>برچسب</Label>
                <Input
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="عنوان هیرو"
                />
              </div>
              <div className="space-y-2">
                <Label>مقدار</Label>
                <Input
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="متن مورد نظر"
                />
              </div>
            </div>
            <Button onClick={handleAddNew} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
              افزودن
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Settings List */}
      <Card>
        <CardContent className="p-6">
          {settings.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              هنوز تنظیمی وجود ندارد
            </div>
          ) : (
            <div className="space-y-6">
              {settings.map((setting) => (
                <div key={setting.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">
                      {setting.label || setting.key}
                    </Label>
                    <div className="flex items-center gap-2">
                      <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        {setting.key}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(setting.id)}
                        className="text-destructive hover:text-destructive h-8 w-8"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={editedValues[setting.id] || ''}
                      onChange={(e) => handleValueChange(setting.id, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleSave(setting)}
                      disabled={saving || editedValues[setting.id] === setting.value}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Guide */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">نحوه استفاده در کد:</h4>
          <code className="text-sm text-muted-foreground block bg-background p-3 rounded">
            {`const { data } = await supabase.from('site_settings').select('*').eq('key', 'hero_title').single();`}
          </code>
        </CardContent>
      </Card>
    </div>
  );
};

export default SiteSettingsManager;
