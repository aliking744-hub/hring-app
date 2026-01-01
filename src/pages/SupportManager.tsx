import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Star, 
  Settings, 
  Download, 
  Loader2,
  ArrowRight,
  Phone,
  FileText,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import AuroraBackground from '@/components/AuroraBackground';
import * as XLSX from 'xlsx';

interface ChatLog {
  id: string;
  session_id: string;
  user_id: string | null;
  messages: Array<{ role: string; content: string }>;
  created_at: string;
  updated_at: string;
}

interface Feedback {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  rewarded: boolean;
  created_at: string;
}

const SupportManager = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [chatLogs, setChatLogs] = useState<ChatLog[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings
  const [supportPhone, setSupportPhone] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');

  // Selected chat for detail view
  const [selectedChat, setSelectedChat] = useState<ChatLog | null>(null);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch chat logs
      const { data: logs } = await supabase
        .from('support_chat_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      setChatLogs((logs as ChatLog[]) || []);

      // Fetch feedbacks
      const { data: fb } = await supabase
        .from('site_feedback')
        .select('*')
        .order('created_at', { ascending: false });
      
      setFeedbacks((fb as Feedback[]) || []);

      // Fetch settings
      const { data: settings } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['support_phone', 'support_system_prompt']);

      settings?.forEach(s => {
        if (s.key === 'support_phone') setSupportPhone(s.value || '');
        if (s.key === 'support_system_prompt') setSystemPrompt(s.value || '');
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('خطا در دریافت اطلاعات');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Update phone
      await supabase
        .from('site_settings')
        .upsert({ key: 'support_phone', value: supportPhone, label: 'شماره تماس پشتیبانی' }, { onConflict: 'key' });

      // Update system prompt
      await supabase
        .from('site_settings')
        .upsert({ key: 'support_system_prompt', value: systemPrompt, label: 'دستورالعمل چت‌بات پشتیبانی' }, { onConflict: 'key' });

      toast.success('تنظیمات ذخیره شد');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('خطا در ذخیره تنظیمات');
    } finally {
      setSaving(false);
    }
  };

  const exportChatLogs = (format: 'csv' | 'json') => {
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = chatLogs.filter(log => 
      log.created_at.startsWith(today)
    );

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(todayLogs, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-logs-${today}.json`;
      a.click();
    } else {
      const rows = todayLogs.flatMap(log => 
        log.messages.map((msg, i) => ({
          session_id: log.session_id,
          user_id: log.user_id || 'anonymous',
          message_index: i,
          role: msg.role,
          content: msg.content,
          created_at: log.created_at
        }))
      );

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Chat Logs');
      XLSX.writeFile(wb, `chat-logs-${today}.csv`);
    }

    toast.success('فایل دانلود شد');
  };

  const exportFeedback = () => {
    const ws = XLSX.utils.json_to_sheet(feedbacks.map(f => ({
      rating: f.rating,
      comment: f.comment || '',
      rewarded: f.rewarded ? 'بله' : 'خیر',
      created_at: new Date(f.created_at).toLocaleString('fa-IR')
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Feedback');
    XLSX.writeFile(wb, `feedback-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('فایل دانلود شد');
  };

  // Stats
  const avgRating = feedbacks.length > 0 
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : 0;
  const totalDiamondsGiven = feedbacks.filter(f => f.rewarded).length * 50;

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">دسترسی غیرمجاز</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>مدیریت پشتیبانی | Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="relative min-h-screen" dir="rtl">
        <AuroraBackground />
        
        <div className="relative z-10 container mx-auto py-8 px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link to="/admin">
                <Button variant="ghost" size="icon">
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">مدیریت پشتیبانی</h1>
            </div>
          </div>

          <Tabs defaultValue="logs" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="logs" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                گفتگوها
              </TabsTrigger>
              <TabsTrigger value="feedback" className="gap-2">
                <Star className="w-4 h-4" />
                نظرات
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="w-4 h-4" />
                تنظیمات
              </TabsTrigger>
            </TabsList>

            {/* Chat Logs Tab */}
            <TabsContent value="logs">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    تاریخچه گفتگوها
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => exportChatLogs('csv')}>
                      <Download className="w-4 h-4 ml-2" />
                      CSV
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => exportChatLogs('json')}>
                      <Download className="w-4 h-4 ml-2" />
                      JSON
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Chat List */}
                    <ScrollArea className="h-[500px] border rounded-lg p-2">
                      {chatLogs.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">هنوز گفتگویی ثبت نشده</p>
                      ) : (
                        <div className="space-y-2">
                          {chatLogs.map(log => (
                            <motion.div
                              key={log.id}
                              onClick={() => setSelectedChat(log)}
                              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                selectedChat?.id === log.id 
                                  ? 'bg-primary/20 border border-primary' 
                                  : 'bg-secondary/50 hover:bg-secondary'
                              }`}
                              whileHover={{ scale: 1.01 }}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <Badge variant={log.user_id ? 'default' : 'secondary'}>
                                  {log.user_id ? 'کاربر' : 'ناشناس'}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(log.created_at).toLocaleString('fa-IR')}
                                </span>
                              </div>
                              <p className="text-sm truncate">
                                {log.messages[0]?.content || 'بدون پیام'}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {log.messages.length} پیام
                              </p>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>

                    {/* Chat Detail */}
                    <div className="border rounded-lg p-4">
                      {selectedChat ? (
                        <ScrollArea className="h-[460px]">
                          <div className="space-y-3">
                            {selectedChat.messages.map((msg, i) => (
                              <div
                                key={i}
                                className={`p-3 rounded-lg ${
                                  msg.role === 'user'
                                    ? 'bg-primary/20 mr-8'
                                    : 'bg-secondary/50 ml-8'
                                }`}
                              >
                                <Badge variant="outline" className="mb-1">
                                  {msg.role === 'user' ? 'کاربر' : 'ربات'}
                                </Badge>
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                          یک گفتگو را انتخاب کنید
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Feedback Tab */}
            <TabsContent value="feedback">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <Star className="w-6 h-6 text-yellow-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{avgRating}</p>
                        <p className="text-sm text-muted-foreground">میانگین امتیاز</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{feedbacks.length}</p>
                        <p className="text-sm text-muted-foreground">تعداد نظرات</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                        <span className="text-green-500 text-lg">💎</span>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{totalDiamondsGiven}</p>
                        <p className="text-sm text-muted-foreground">الماس اهدایی</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>لیست نظرات</CardTitle>
                  <Button variant="outline" size="sm" onClick={exportFeedback}>
                    <Download className="w-4 h-4 ml-2" />
                    اکسل
                  </Button>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    {feedbacks.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">هنوز نظری ثبت نشده</p>
                    ) : (
                      <div className="space-y-3">
                        {feedbacks.map(fb => (
                          <div key={fb.id} className="p-4 bg-secondary/50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= fb.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-muted-foreground'
                                    }`}
                                  />
                                ))}
                              </div>
                              <div className="flex items-center gap-2">
                                {fb.rewarded && (
                                  <Badge variant="secondary">+50 💎</Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {new Date(fb.created_at).toLocaleString('fa-IR')}
                                </span>
                              </div>
                            </div>
                            {fb.comment && (
                              <p className="text-sm">{fb.comment}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    تنظیمات چت‌بات
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Phone Number */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <Phone className="w-4 h-4" />
                      شماره تماس پشتیبانی
                    </label>
                    <Input
                      value={supportPhone}
                      onChange={(e) => setSupportPhone(e.target.value)}
                      placeholder="09123456789"
                      dir="ltr"
                      className="max-w-xs"
                    />
                    <p className="text-xs text-muted-foreground">
                      این شماره در پاسخ‌های fallback به کاربران نمایش داده می‌شود
                    </p>
                  </div>

                  {/* System Prompt */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <FileText className="w-4 h-4" />
                      دستورالعمل سیستم (System Prompt)
                    </label>
                    <Textarea
                      value={systemPrompt}
                      onChange={(e) => setSystemPrompt(e.target.value)}
                      rows={10}
                      placeholder="دستورالعمل رفتار چت‌بات..."
                    />
                    <p className="text-xs text-muted-foreground">
                      از {'{SUPPORT_PHONE}'} برای درج شماره تلفن استفاده کنید
                    </p>
                  </div>

                  <Button onClick={saveSettings} disabled={saving}>
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin ml-2" />
                    ) : null}
                    ذخیره تنظیمات
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default SupportManager;
