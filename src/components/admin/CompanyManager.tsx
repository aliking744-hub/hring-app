import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Building2, Trash2, Edit2 } from 'lucide-react';
import { TIER_NAMES, STATUS_NAMES } from '@/types/multiTenant';
import type { Company, SubscriptionTier, CompanyStatus } from '@/types/multiTenant';

const CompanyManager = () => {
  const { toast } = useToast();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    status: 'active' as CompanyStatus,
    subscription_tier: 'corporate_expert' as SubscriptionTier,
    monthly_credits: 100,
    max_members: 10,
  });

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanies(data as Company[]);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: 'خطا',
        description: 'خطا در دریافت لیست شرکت‌ها',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCompany) {
        const { error } = await supabase
          .from('companies')
          .update({
            name: formData.name,
            domain: formData.domain || null,
            status: formData.status,
            subscription_tier: formData.subscription_tier,
            monthly_credits: formData.monthly_credits,
            max_members: formData.max_members,
          })
          .eq('id', editingCompany.id);

        if (error) throw error;
        toast({ title: 'شرکت بروزرسانی شد' });
      } else {
        const { error } = await supabase
          .from('companies')
          .insert({
            name: formData.name,
            domain: formData.domain || null,
            status: formData.status,
            subscription_tier: formData.subscription_tier,
            monthly_credits: formData.monthly_credits,
            max_members: formData.max_members,
          });

        if (error) throw error;
        toast({ title: 'شرکت ایجاد شد' });
      }

      setDialogOpen(false);
      setEditingCompany(null);
      resetForm();
      fetchCompanies();
    } catch (error) {
      console.error('Error saving company:', error);
      toast({
        title: 'خطا',
        description: 'خطا در ذخیره شرکت',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این شرکت مطمئن هستید؟')) return;

    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'شرکت حذف شد' });
      fetchCompanies();
    } catch (error) {
      console.error('Error deleting company:', error);
      toast({
        title: 'خطا',
        description: 'خطا در حذف شرکت',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      domain: '',
      status: 'active',
      subscription_tier: 'corporate_expert',
      monthly_credits: 100,
      max_members: 10,
    });
  };

  const openEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      domain: company.domain || '',
      status: company.status,
      subscription_tier: company.subscription_tier,
      monthly_credits: company.monthly_credits,
      max_members: company.max_members,
    });
    setDialogOpen(true);
  };

  const getStatusColor = (status: CompanyStatus) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'suspended': return 'bg-red-500/20 text-red-400';
      case 'trial': return 'bg-yellow-500/20 text-yellow-400';
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
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          مدیریت شرکت‌ها
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingCompany(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="glow-button gap-2">
              <Plus className="w-4 h-4" />
              شرکت جدید
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border" dir="rtl">
            <DialogHeader>
              <DialogTitle>
                {editingCompany ? 'ویرایش شرکت' : 'ایجاد شرکت جدید'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>نام شرکت</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="نام شرکت"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>دامنه (اختیاری)</Label>
                <Input
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  placeholder="example.com"
                  dir="ltr"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>وضعیت</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => setFormData({ ...formData, status: v as CompanyStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">فعال</SelectItem>
                      <SelectItem value="trial">آزمایشی</SelectItem>
                      <SelectItem value="suspended">معلق</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>اشتراک</Label>
                  <Select
                    value={formData.subscription_tier}
                    onValueChange={(v) => setFormData({ ...formData, subscription_tier: v as SubscriptionTier })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="corporate_expert">کارشناس</SelectItem>
                      <SelectItem value="corporate_decision_support">پشتیبان تصمیم</SelectItem>
                      <SelectItem value="corporate_decision_making">تصمیم‌ساز</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>اعتبار ماهانه</Label>
                  <Input
                    type="number"
                    value={formData.monthly_credits}
                    onChange={(e) => setFormData({ ...formData, monthly_credits: parseInt(e.target.value) || 0 })}
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label>حداکثر اعضا</Label>
                  <Input
                    type="number"
                    value={formData.max_members}
                    onChange={(e) => setFormData({ ...formData, max_members: parseInt(e.target.value) || 1 })}
                    min={1}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full glow-button">
                {editingCompany ? 'بروزرسانی' : 'ایجاد'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {companies.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            هیچ شرکتی ثبت نشده است
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">نام</TableHead>
                  <TableHead className="text-right">دامنه</TableHead>
                  <TableHead className="text-right">وضعیت</TableHead>
                  <TableHead className="text-right">اشتراک</TableHead>
                  <TableHead className="text-right">اعتبار</TableHead>
                  <TableHead className="text-right">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell className="text-muted-foreground" dir="ltr">
                      {company.domain || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(company.status)}>
                        {STATUS_NAMES[company.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {TIER_NAMES[company.subscription_tier]}
                    </TableCell>
                    <TableCell>
                      {company.used_credits} / {company.monthly_credits}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(company)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(company.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CompanyManager;
