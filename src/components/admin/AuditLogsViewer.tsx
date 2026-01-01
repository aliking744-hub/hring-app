import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Search, RefreshCw, Eye, Edit, Trash2, UserPlus, FileText, Users } from 'lucide-react';
import { format } from 'date-fns-jalali';
import { motion, AnimatePresence } from 'framer-motion';

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id: string | null;
  details: any;
  ip_address: string | null;
  created_at: string;
  user_email?: string;
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  'INSERT': <UserPlus className="w-4 h-4 text-green-500" />,
  'UPDATE': <Edit className="w-4 h-4 text-amber-500" />,
  'DELETE': <Trash2 className="w-4 h-4 text-red-500" />,
  'ADMIN_VIEW': <Eye className="w-4 h-4 text-blue-500" />,
};

const ACTION_LABELS: Record<string, string> = {
  'INSERT': 'ایجاد',
  'UPDATE': 'ویرایش',
  'DELETE': 'حذف',
  'ADMIN_VIEW': 'مشاهده ادمین',
};

const TABLE_LABELS: Record<string, string> = {
  'candidates': 'کاندیداها',
  'profiles': 'پروفایل‌ها',
};

const AuditLogsViewer = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tableFilter, setTableFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (tableFilter !== 'all') {
        query = query.eq('table_name', tableFilter);
      }

      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch user emails for display
      const userIds = [...new Set(data?.map(log => log.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', userIds);

      const emailMap = new Map(profiles?.map(p => [p.id, p.email]) || []);

      const logsWithEmails = data?.map(log => ({
        ...log,
        user_email: emailMap.get(log.user_id) || 'نامشخص'
      })) || [];

      setLogs(logsWithEmails);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [tableFilter, actionFilter]);

  const filteredLogs = logs.filter(log => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      log.user_email?.toLowerCase().includes(searchLower) ||
      log.table_name.toLowerCase().includes(searchLower) ||
      JSON.stringify(log.details).toLowerCase().includes(searchLower)
    );
  });

  const getActionBadge = (action: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'INSERT': 'default',
      'UPDATE': 'secondary',
      'DELETE': 'destructive',
      'ADMIN_VIEW': 'outline',
    };
    return (
      <Badge variant={variants[action] || 'outline'} className="gap-1">
        {ACTION_ICONS[action]}
        {ACTION_LABELS[action] || action}
      </Badge>
    );
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            لاگ دسترسی‌ها
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchLogs}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            بروزرسانی
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="جستجو در لاگ‌ها..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>
          <Select value={tableFilter} onValueChange={setTableFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="جدول" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه جداول</SelectItem>
              <SelectItem value="candidates">کاندیداها</SelectItem>
              <SelectItem value="profiles">پروفایل‌ها</SelectItem>
            </SelectContent>
          </Select>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="عملیات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه عملیات</SelectItem>
              <SelectItem value="INSERT">ایجاد</SelectItem>
              <SelectItem value="UPDATE">ویرایش</SelectItem>
              <SelectItem value="DELETE">حذف</SelectItem>
              <SelectItem value="ADMIN_VIEW">مشاهده ادمین</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-secondary/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{logs.length}</div>
            <div className="text-sm text-muted-foreground">کل لاگ‌ها</div>
          </div>
          <div className="bg-green-500/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-500">
              {logs.filter(l => l.action === 'INSERT').length}
            </div>
            <div className="text-sm text-muted-foreground">ایجاد</div>
          </div>
          <div className="bg-amber-500/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-amber-500">
              {logs.filter(l => l.action === 'UPDATE').length}
            </div>
            <div className="text-sm text-muted-foreground">ویرایش</div>
          </div>
          <div className="bg-red-500/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-500">
              {logs.filter(l => l.action === 'DELETE').length}
            </div>
            <div className="text-sm text-muted-foreground">حذف</div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-right">زمان</TableHead>
                <TableHead className="text-right">کاربر</TableHead>
                <TableHead className="text-right">عملیات</TableHead>
                <TableHead className="text-right">جدول</TableHead>
                <TableHead className="text-right">جزئیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-primary" />
                    </TableCell>
                  </TableRow>
                ) : filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      هیچ لاگی یافت نشد
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log, index) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="border-b border-border hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="font-mono text-sm">
                        {format(new Date(log.created_at), 'yyyy/MM/dd HH:mm')}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{log.user_email}</span>
                      </TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          {log.table_name === 'candidates' ? (
                            <Users className="w-3 h-3" />
                          ) : (
                            <FileText className="w-3 h-3" />
                          )}
                          {TABLE_LABELS[log.table_name] || log.table_name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {log.details && (
                          <code className="text-xs bg-muted px-2 py-1 rounded max-w-[200px] truncate block">
                            {JSON.stringify(log.details)}
                          </code>
                        )}
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuditLogsViewer;
