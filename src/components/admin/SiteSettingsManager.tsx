import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Save, Plus, Trash2, Type, Image, FileText, Upload } from 'lucide-react';

interface SiteSetting {
  id: string;
  key: string;
  value: string | null;
  label: string | null;
}

// Available fonts in the system
const AVAILABLE_FONTS = [
  { value: 'IRANSans', label: 'ایران سنس (پیش‌فرض)' },
  { value: 'BNazanin', label: 'بی نازنین' },
  { value: 'Afarin', label: 'آفرین' },
  { value: 'Inter', label: 'Inter (انگلیسی)' },
];

// Font setting keys and their labels
const FONT_SETTINGS = [
  { key: 'font_heading', label: 'فونت عناوین', description: 'عناوین اصلی و تیترها' },
  { key: 'font_body', label: 'فونت متن', description: 'متن‌های بدنه و پاراگراف‌ها' },
  { key: 'font_button', label: 'فونت دکمه‌ها', description: 'متن داخل دکمه‌ها' },
  { key: 'font_nav', label: 'فونت منو', description: 'آیتم‌های نوبار و منو' },
];

// Logo setting keys
const LOGO_SETTINGS = [
  { key: 'logo_main', label: 'لوگوی اصلی', description: 'لوگوی هدر و صفحات اصلی' },
  { key: 'logo_footer', label: 'لوگوی فوتر', description: 'لوگوی پایین صفحه' },
  { key: 'logo_auth', label: 'لوگوی ورود', description: 'لوگوی صفحه ورود و ثبت‌نام' },
  { key: 'logo_favicon', label: 'فاوآیکون', description: 'آیکون تب مرورگر' },
];

const SiteSettingsManager = () => {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [uploadingLogo, setUploadingLogo] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('texts');
  
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
        values[s.key] = s.value || '';
      });
      setEditedValues(values);
    }
    setLoading(false);
  };

  const getSettingByKey = (key: string) => {
    return settings.find(s => s.key === key);
  };

  const handleValueChange = (key: string, value: string) => {
    setEditedValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSetting = async (key: string, label: string) => {
    const newValue = editedValues[key];
    const existing = getSettingByKey(key);

    setSaving(true);

    if (existing) {
      if (newValue === existing.value) {
        setSaving(false);
        return;
      }
      const { error } = await supabase
        .from('site_settings')
        .update({ value: newValue })
        .eq('id', existing.id);

      if (error) {
        toast.error('خطا در ذخیره تنظیمات');
        console.error(error);
      } else {
        toast.success('تنظیمات ذخیره شد');
        fetchSettings();
      }
    } else {
      // Create new setting
      const { error } = await supabase
        .from('site_settings')
        .insert({ key, label, value: newValue });

      if (error) {
        toast.error('خطا در ایجاد تنظیم');
        console.error(error);
      } else {
        toast.success('تنظیمات ذخیره شد');
        fetchSettings();
      }
    }
    setSaving(false);
  };

  const handleLogoUpload = async (key: string, label: string, file: File) => {
    setUploadingLogo(key);

    const fileExt = file.name.split('.').pop();
    const fileName = `${key}_${Date.now()}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error('خطا در آپلود لوگو');
      console.error(uploadError);
      setUploadingLogo(null);
      return;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    // Save to settings
    const existing = getSettingByKey(key);
    if (existing) {
      await supabase
        .from('site_settings')
        .update({ value: publicUrl })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('site_settings')
        .insert({ key, label, value: publicUrl });
    }

    toast.success('لوگو آپلود شد');
    setEditedValues(prev => ({ ...prev, [key]: publicUrl }));
    fetchSettings();
    setUploadingLogo(null);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    
    const updates = settings
      .filter(s => editedValues[s.key] !== s.value)
      .map(s => 
        supabase
          .from('site_settings')
          .update({ value: editedValues[s.key] })
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

  // Filter out font and logo settings from text settings
  const textSettings = settings.filter(s => 
    !FONT_SETTINGS.some(f => f.key === s.key) && 
    !LOGO_SETTINGS.some(l => l.key === s.key)
  );

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
        <h2 className="text-2xl font-bold">تنظیمات ظاهری سایت</h2>
        <Button
          onClick={handleSaveAll}
          disabled={saving}
          className="gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          ذخیره همه تغییرات
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="texts" className="gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">متون</span>
          </TabsTrigger>
          <TabsTrigger value="fonts" className="gap-2">
            <Type className="w-4 h-4" />
            <span className="hidden sm:inline">فونت‌ها</span>
          </TabsTrigger>
          <TabsTrigger value="logos" className="gap-2">
            <Image className="w-4 h-4" />
            <span className="hidden sm:inline">لوگوها</span>
          </TabsTrigger>
        </TabsList>

        {/* Texts Tab */}
        <TabsContent value="texts">
          <div className="space-y-6">
            {/* New Setting Button */}
            <Button
              variant="outline"
              onClick={() => setShowNewForm(!showNewForm)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              تنظیم متنی جدید
            </Button>

            {/* New Setting Form */}
            {showNewForm && (
              <Card>
                <CardHeader>
                  <CardTitle>افزودن متن جدید</CardTitle>
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

            {/* Text Settings List */}
            <Card>
              <CardContent className="p-6">
                {textSettings.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    هنوز متنی وجود ندارد
                  </div>
                ) : (
                  <div className="space-y-6">
                    {textSettings.map((setting) => (
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
                            value={editedValues[setting.key] || ''}
                            onChange={(e) => handleValueChange(setting.key, e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleSaveSetting(setting.key, setting.label || setting.key)}
                            disabled={saving || editedValues[setting.key] === setting.value}
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
          </div>
        </TabsContent>

        {/* Fonts Tab */}
        <TabsContent value="fonts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="w-5 h-5" />
                تنظیمات فونت
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                با تغییر این تنظیمات، فونت بخش‌های مختلف سایت تغییر خواهد کرد.
              </p>
              
              <div className="grid gap-6 sm:grid-cols-2">
                {FONT_SETTINGS.map((fontSetting) => {
                  const currentValue = editedValues[fontSetting.key] || 'IRANSans';
                  return (
                    <div key={fontSetting.key} className="space-y-3 p-4 rounded-lg border border-border bg-card">
                      <div>
                        <Label className="text-base font-medium">{fontSetting.label}</Label>
                        <p className="text-xs text-muted-foreground mt-1">{fontSetting.description}</p>
                      </div>
                      <Select
                        value={currentValue}
                        onValueChange={(value) => handleValueChange(fontSetting.key, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="انتخاب فونت" />
                        </SelectTrigger>
                        <SelectContent>
                          {AVAILABLE_FONTS.map((font) => (
                            <SelectItem key={font.value} value={font.value}>
                              <span style={{ fontFamily: font.value }}>{font.label}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {/* Preview */}
                      <div 
                        className="p-3 rounded bg-muted text-center"
                        style={{ fontFamily: currentValue }}
                      >
                        <span className="text-lg">نمونه متن فارسی</span>
                        <span className="text-sm block text-muted-foreground">Sample English Text</span>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSaveSetting(fontSetting.key, fontSetting.label)}
                        disabled={saving}
                        className="w-full"
                      >
                        <Save className="w-4 h-4 ml-2" />
                        ذخیره
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logos Tab */}
        <TabsContent value="logos">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5" />
                مدیریت لوگوها
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                لوگوهای مختلف سایت را در اینجا آپلود و مدیریت کنید.
              </p>
              
              <div className="grid gap-6 sm:grid-cols-2">
                {LOGO_SETTINGS.map((logoSetting) => {
                  const currentValue = editedValues[logoSetting.key] || '';
                  const isUploading = uploadingLogo === logoSetting.key;
                  
                  return (
                    <div key={logoSetting.key} className="space-y-3 p-4 rounded-lg border border-border bg-card">
                      <div>
                        <Label className="text-base font-medium">{logoSetting.label}</Label>
                        <p className="text-xs text-muted-foreground mt-1">{logoSetting.description}</p>
                      </div>
                      
                      {/* Current Logo Preview */}
                      <div className="h-24 rounded bg-muted flex items-center justify-center overflow-hidden">
                        {currentValue ? (
                          <img 
                            src={currentValue} 
                            alt={logoSetting.label}
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <div className="text-muted-foreground text-sm">لوگو تنظیم نشده</div>
                        )}
                      </div>
                      
                      {/* Upload Button */}
                      <div className="flex gap-2">
                        <label className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleLogoUpload(logoSetting.key, logoSetting.label, file);
                              }
                            }}
                          />
                          <Button
                            variant="outline"
                            className="w-full gap-2"
                            disabled={isUploading}
                            asChild
                          >
                            <span>
                              {isUploading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Upload className="w-4 h-4" />
                              )}
                              آپلود لوگو جدید
                            </span>
                          </Button>
                        </label>
                        
                        {currentValue && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const existing = getSettingByKey(logoSetting.key);
                              if (existing) handleDelete(existing.id);
                            }}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      {/* Manual URL Input */}
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">یا آدرس مستقیم:</Label>
                        <div className="flex gap-2">
                          <Input
                            value={currentValue}
                            onChange={(e) => handleValueChange(logoSetting.key, e.target.value)}
                            placeholder="https://..."
                            dir="ltr"
                            className="flex-1 text-xs"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleSaveSetting(logoSetting.key, logoSetting.label)}
                            disabled={saving}
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Usage Guide */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">نحوه استفاده در کد:</h4>
          <div className="space-y-2">
            <code className="text-sm text-muted-foreground block bg-background p-3 rounded">
              {`// دریافت تنظیم`}<br/>
              {`const { getSetting } = useSiteSettings();`}<br/>
              {`const heroTitle = getSetting('hero_title');`}
            </code>
            <code className="text-sm text-muted-foreground block bg-background p-3 rounded">
              {`// استفاده از فونت`}<br/>
              {`const headingFont = getSetting('font_heading') || 'IRANSans';`}<br/>
              {`<h1 style={{ fontFamily: headingFont }}>عنوان</h1>`}
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SiteSettingsManager;
