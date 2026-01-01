import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  Users, UserPlus, Copy, Link2, Trash2, 
  Shield, ChevronLeft, Check, RefreshCw,
  Building2, Loader2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AuroraBackground from '@/components/AuroraBackground';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, 
  DialogTitle, DialogTrigger, DialogFooter 
} from '@/components/ui/dialog';
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useCompany } from '@/hooks/useCompany';
import { useUserContext } from '@/hooks/useUserContext';
import { CompanyRole, ROLE_NAMES } from '@/types/multiTenant';

const CompanyMembers = () => {
  const navigate = useNavigate();
  const { context, loading: contextLoading } = useUserContext();
  const { 
    company, members, invites, loading, isCEO, canInvite,
    createInvite, removeMember, updateMemberRole, 
    toggleInvitePermission, deactivateInvite, refetch
  } = useCompany();

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [newInviteRole, setNewInviteRole] = useState<CompanyRole>('employee');
  const [newInviteMaxUses, setNewInviteMaxUses] = useState<number>(1);
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCreateInvite = async () => {
    setCreatingInvite(true);
    try {
      await createInvite(newInviteRole, newInviteMaxUses);
      setInviteDialogOpen(false);
      setNewInviteRole('employee');
      setNewInviteMaxUses(1);
    } finally {
      setCreatingInvite(false);
    }
  };

  const handleCopyInviteLink = async (code: string) => {
    const link = `${window.location.origin}/auth?invite=${code}`;
    await navigator.clipboard.writeText(link);
    setCopiedCode(code);
    toast.success('لینک دعوت کپی شد');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleRemoveMember = async (userId: string, userName: string) => {
    if (confirm(`آیا مطمئن هستید که می‌خواهید "${userName}" را از شرکت حذف کنید؟`)) {
      await removeMember(userId);
    }
  };

  if (contextLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Only corporate users can access
  if (context?.userType !== 'corporate') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">دسترسی محدود</h2>
            <p className="text-muted-foreground mb-4">این صفحه فقط برای کاربران شرکتی قابل دسترسی است.</p>
            <Button onClick={() => navigate('/dashboard')}>بازگشت به داشبورد</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>مدیریت اعضا | {company?.name || 'شرکت'}</title>
      </Helmet>
      <div className="relative min-h-screen" dir="rtl">
        <AuroraBackground />
        
        <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">مدیریت اعضا</h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  {company?.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" onClick={refetch}>
                <RefreshCw className="w-4 h-4" />
              </Button>
              {(isCEO || canInvite) && (
                <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="glow-button text-foreground">
                      <UserPlus className="w-4 h-4 ml-2" />
                      ایجاد لینک دعوت
                    </Button>
                  </DialogTrigger>
                  <DialogContent dir="rtl">
                    <DialogHeader>
                      <DialogTitle>ایجاد لینک دعوت جدید</DialogTitle>
                      <DialogDescription>
                        یک لینک دعوت برای اضافه کردن اعضای جدید به شرکت ایجاد کنید.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>نقش کاربر دعوت‌شده</Label>
                        <Select 
                          value={newInviteRole} 
                          onValueChange={(v) => setNewInviteRole(v as CompanyRole)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {isCEO && <SelectItem value="deputy">معاون</SelectItem>}
                            <SelectItem value="manager">مدیر</SelectItem>
                            <SelectItem value="employee">کارشناس</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>حداکثر تعداد استفاده</Label>
                        <Input
                          type="number"
                          min={1}
                          max={100}
                          value={newInviteMaxUses}
                          onChange={(e) => setNewInviteMaxUses(parseInt(e.target.value) || 1)}
                        />
                        <p className="text-xs text-muted-foreground">
                          بعد از این تعداد، لینک غیرفعال می‌شود.
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                        انصراف
                      </Button>
                      <Button onClick={handleCreateInvite} disabled={creatingInvite}>
                        {creatingInvite ? <Loader2 className="w-4 h-4 animate-spin" /> : 'ایجاد لینک'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </motion.div>

          {/* Active Invites - Only for CEO/Deputy */}
          {(isCEO || canInvite) && invites.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Card className="glass-card border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Link2 className="w-5 h-5 text-primary" />
                    لینک‌های دعوت فعال
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {invites.map((invite) => (
                      <div 
                        key={invite.id} 
                        className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <code className="bg-background/50 px-3 py-1 rounded text-sm font-mono">
                            {invite.invite_code}
                          </code>
                          <Badge variant="secondary">{ROLE_NAMES[invite.role]}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {invite.used_count}/{invite.max_uses || '∞'} استفاده شده
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopyInviteLink(invite.invite_code)}
                          >
                            {copiedCode === invite.invite_code ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                          {isCEO && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => deactivateInvite(invite.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Members Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  اعضای شرکت
                  <Badge variant="secondary" className="mr-2">{members.length} نفر</Badge>
                </CardTitle>
                <CardDescription>
                  لیست تمام اعضای فعال شرکت و نقش‌های آن‌ها
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">نام</TableHead>
                      <TableHead className="text-right">ایمیل</TableHead>
                      <TableHead className="text-right">سمت</TableHead>
                      <TableHead className="text-right">نقش</TableHead>
                      {isCEO && (
                        <>
                          <TableHead className="text-center">اجازه دعوت</TableHead>
                          <TableHead className="text-center">عملیات</TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                              <span className="text-sm font-bold text-primary">
                                {member.profile?.full_name?.charAt(0) || '?'}
                              </span>
                            </div>
                            <span className="font-medium">
                              {member.profile?.full_name || 'بدون نام'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {member.profile?.email || '-'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {member.profile?.title || '-'}
                        </TableCell>
                        <TableCell>
                          {isCEO && member.role !== 'ceo' ? (
                            <Select
                              value={member.role}
                              onValueChange={(v) => updateMemberRole(member.user_id, v as CompanyRole)}
                            >
                              <SelectTrigger className="w-28">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="deputy">معاون</SelectItem>
                                <SelectItem value="manager">مدیر</SelectItem>
                                <SelectItem value="employee">کارشناس</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge 
                              variant={member.role === 'ceo' ? 'default' : 'secondary'}
                              className={member.role === 'ceo' ? 'bg-primary' : ''}
                            >
                              {ROLE_NAMES[member.role]}
                            </Badge>
                          )}
                        </TableCell>
                        {isCEO && (
                          <>
                            <TableCell className="text-center">
                              {member.role !== 'ceo' && (
                                <Switch
                                  checked={member.can_invite}
                                  onCheckedChange={() => toggleInvitePermission(member.user_id, !member.can_invite)}
                                />
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {member.role !== 'ceo' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => handleRemoveMember(
                                    member.user_id, 
                                    member.profile?.full_name || 'کاربر'
                                  )}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default CompanyMembers;
