import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, FileText, Database, Globe, CheckCircle, AlertCircle } from 'lucide-react';

const CATEGORIES = [
  { value: 'labor_law', label: 'قانون کار' },
  { value: 'social_security', label: 'تامین اجتماعی' },
  { value: 'court_rulings', label: 'آرای دیوان' },
];

const LegalImporter = () => {
  const [sourceUrl, setSourceUrl] = useState('');
  const [category, setCategory] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [stats, setStats] = useState<{ totalChunks?: number; savedCount?: number; contentLength?: number } | null>(null);

  const handleProcess = async () => {
    if (!sourceUrl || !category) {
      toast.error('لطفاً URL و دسته‌بندی را وارد کنید');
      return;
    }

    setIsProcessing(true);
    setLogs(['شروع پردازش...']);
    setStats(null);

    try {
      const { data, error } = await supabase.functions.invoke('scrape-legal-docs', {
        body: { sourceUrl, category }
      });

      if (error) throw error;

      if (data.logs) {
        setLogs(data.logs);
      }

      if (data.stats) {
        setStats(data.stats);
      }

      if (data.success) {
        toast.success(`${data.stats?.savedCount || 0} ماده با موفقیت وارد شد`);
      } else {
        toast.error(data.error || 'خطا در پردازش');
      }
    } catch (error) {
      console.error('Error processing:', error);
      const errorMessage = error instanceof Error ? error.message : 'خطای ناشناخته';
      setLogs(prev => [...prev, `خطا: ${errorMessage}`]);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            وارد کردن اسناد حقوقی
          </CardTitle>
          <CardDescription>
            صفحات قوانین را از منابع معتبر اسکرپ کرده و در پایگاه دانش ذخیره کنید
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sourceUrl" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                آدرس URL منبع
              </Label>
              <Input
                id="sourceUrl"
                type="url"
                placeholder="https://rc.majlis.ir/fa/law/..."
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                disabled={isProcessing}
                dir="ltr"
                className="text-left"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                دسته‌بندی
              </Label>
              <Select value={category} onValueChange={setCategory} disabled={isProcessing}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب دسته‌بندی..." />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleProcess} 
            disabled={isProcessing || !sourceUrl || !category}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                در حال پردازش...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 ml-2" />
                پردازش و ذخیره
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Logs Section */}
      {logs.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              📋 گزارش پردازش
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px] w-full rounded-md border bg-muted/30 p-4">
              <div className="space-y-2 font-mono text-sm">
                {logs.map((log, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-2"
                  >
                    {log.includes('خطا') ? (
                      <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    ) : log.includes('ذخیره شد') || log.includes('موفقیت') ? (
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    ) : (
                      <span className="w-4 h-4 shrink-0" />
                    )}
                    <span className={log.includes('خطا') ? 'text-destructive' : ''}>{log}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {stats && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-primary/10 p-3 text-center">
                  <div className="text-2xl font-bold text-primary">{stats.totalChunks || 0}</div>
                  <div className="text-xs text-muted-foreground">ماده یافت شده</div>
                </div>
                <div className="rounded-lg bg-green-500/10 p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.savedCount || 0}</div>
                  <div className="text-xs text-muted-foreground">ذخیره شده</div>
                </div>
                <div className="rounded-lg bg-blue-500/10 p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.contentLength?.toLocaleString('fa-IR') || 0}</div>
                  <div className="text-xs text-muted-foreground">کاراکتر</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LegalImporter;
