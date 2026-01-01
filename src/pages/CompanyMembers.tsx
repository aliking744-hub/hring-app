import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  Users, UserPlus, Copy, Link2, Trash2, 
  Shield, ChevronLeft, Check, RefreshCw,
  Building2, Loader2, UserCog, Mail, Lock, User,
  KeyRound, Edit, Eye, EyeOff
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
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useCompany } from '@/hooks/useCompany';
import { useUserContext } from '@/hooks/useUserContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { CompanyRole, ROLE_NAMES } from '@/types/multiTenant';

const CompanyMembers = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { context, loading: contextLoading } = useUserContext();
  const { 
    company, members, invites, loading, isCEO, canInvite,
    createInvite, removeMember, updateMemberRole, 
    toggleInvitePermission, deactivateInvite, refetch
  } = useCompany();

  // Invite dialog state
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [newInviteRole, setNewInviteRole] = useState<CompanyRole>('employee');
  const [newInviteMaxUses, setNewInviteMaxUses] = useState<number>(1);
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Create user dialog state
  const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserFullName, setNewUserFullName] = useState('');
  const [newUserRole, setNewUserRole] = useState<CompanyRole>('employee');
  const [creatingUser, setCreatingUser] = useState(false);

  // Reset password dialog state
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [selectedUserForReset, setSelectedUserForReset] = useState<{ id: string; name: string } | null>(null);
  const [newPasswordForReset, setNewPasswordForReset] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  // Edit profile dialog state
  const [editProfileDialogOpen, setEditProfileDialogOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<{ id: string; name: string; title: string } | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

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

  const handleCreateUser = async () => {
    if (!context?.companyId || !session?.access_token) return;

    // Validation
    if (!newUserEmail || !newUserPassword || !newUserFullName) {
      toast.error('لطفاً تمام فیلدها را پر کنید');
      return;
    }

    if (newUserPassword.length < 6) {
      toast.error('رمز عبور باید حداقل ۶ کاراکتر باشد');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserEmail)) {
      toast.error('فرمت ایمیل نامعتبر است');
      return;
    }

    setCreatingUser(true);
    try {
      const response = await supabase.functions.invoke('create-company-user', {
        body: {
          email: newUserEmail.trim(),
          password: newUserPassword,
          fullName: newUserFullName.trim(),
          role: newUserRole,
          companyId: context.companyId
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      toast.success(`کاربر "${newUserFullName}" با موفقیت ایجاد شد`);
      setCreateUserDialogOpen(false);
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserFullName('');
      setNewUserRole('employee');
      await refetch();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'خطا در ایجاد کاربر';
      toast.error(errorMessage);
    } finally {
      setCreatingUser(false);
    }
  };

  const handleResetPassword = async () => {
    if (!context?.companyId || !selectedUserForReset) return;

    if (!newPasswordForReset || newPasswordForReset.length < 6) {
      toast.error('رمز عبور باید حداقل ۶ کاراکتر باشد');
      return;
    }

    setResettingPassword(true);
    try {
      const response = await supabase.functions.invoke('reset-company-user-password', {
        body: {
          userId: selectedUserForReset.id,
          newPassword: newPasswordForReset,
          companyId: context.companyId
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      toast.success(`رمز عبور "${selectedUserForReset.name}" با موفقیت تغییر کرد`);
      setResetPasswordDialogOpen(false);
      setSelectedUserForReset(null);
      setNewPasswordForReset('');
      setShowResetPassword(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'خطا در تغییر رمز عبور';
      toast.error(errorMessage);
    } finally {
      setResettingPassword(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!context?.companyId || !selectedUserForEdit) return;

    if (!editFullName.trim()) {
      toast.error('نام نمی‌تواند خالی باشد');
      return;
    }

    setUpdatingProfile(true);
    try {
      const response = await supabase.functions.invoke('update-company-user-profile', {
        body: {
          userId: selectedUserForEdit.id,
          fullName: editFullName.trim(),
          title: editTitle.trim() || null,
          companyId: context.companyId
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      toast.success(`پروفایل "${editFullName}" با موفقیت بروزرسانی شد`);
      setEditProfileDialogOpen(false);
      setSelectedUserForEdit(null);
      setEditFullName('');
      setEditTitle('');
      await refetch();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'خطا در بروزرسانی پروفایل';
      toast.error(errorMessage);
    } finally {
      setUpdatingProfile(false);
    }
  };

  const openResetPasswordDialog = (userId: string, userName: string) => {
    setSelectedUserForReset({ id: userId, name: userName });
    setNewPasswordForReset('');
    setShowResetPassword(false);
    setResetPasswordDialogOpen(true);
  };

  const openEditProfileDialog = (userId: string, userName: string, userTitle: string) => {
    setSelectedUserForEdit({ id: userId, name: userName, title: userTitle });
    setEditFullName(userName);
    setEditTitle(userTitle || '');
    setEditProfileDialogOpen(true);
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
              
              {/* Create User Dialog - CEO Only */}
              {isCEO && (
                <Dialog open={createUserDialogOpen} onOpenChange={setCreateUserDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <UserCog className="w-4 h-4" />
                      ساخت کاربر
                    </Button>
                  </DialogTrigger>
                  <DialogContent dir="rtl" className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>ساخت کاربر جدید</DialogTitle>
                      <DialogDescription>
                        یک حساب کاربری جدید برای عضو شرکت ایجاد کنید. کاربر با این اطلاعات می‌تواند وارد پنل شود.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>نام و نام خانوادگی</Label>
                        <div className="relative">
                          <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="مثال: علی احمدی"
                            value={newUserFullName}
                            onChange={(e) => setNewUserFullName(e.target.value)}
                            className="pr-10"
                            disabled={creatingUser}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>ایمیل</Label>
                        <div className="relative">
                          <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="user@company.com"
                            value={newUserEmail}
                            onChange={(e) => setNewUserEmail(e.target.value)}
                            className="pr-10"
                            dir="ltr"
                            disabled={creatingUser}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>رمز عبور</Label>
                        <div className="relative">
                          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="text"
                            placeholder="حداقل ۶ کاراکتر"
                            value={newUserPassword}
                            onChange={(e) => setNewUserPassword(e.target.value)}
                            className="pr-10"
                            dir="ltr"
                            disabled={creatingUser}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          این رمز را به کاربر اطلاع دهید تا بتواند وارد شود.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label>نقش در شرکت</Label>
                        <Select 
                          value={newUserRole} 
                          onValueChange={(v) => setNewUserRole(v as CompanyRole)}
                          disabled={creatingUser}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="deputy">معاون</SelectItem>
                            <SelectItem value="manager">مدیر</SelectItem>
                            <SelectItem value="employee">کارشناس</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter className="gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setCreateUserDialogOpen(false)}
                        disabled={creatingUser}
                      >
                        انصراف
                      </Button>
                      <Button onClick={handleCreateUser} disabled={creatingUser}>
                        {creatingUser ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin ml-2" />
                            در حال ایجاد...
                          </>
                        ) : (
                          'ایجاد کاربر'
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              {/* Invite Link Dialog */}
              {(isCEO || canInvite) && (
                <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="glow-button text-foreground">
                      <UserPlus className="w-4 h-4 ml-2" />
                      لینک دعوت
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
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      عملیات
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => openEditProfileDialog(
                                        member.user_id,
                                        member.profile?.full_name || '',
                                        member.profile?.title || ''
                                      )}
                                    >
                                      <Edit className="w-4 h-4 ml-2" />
                                      ویرایش پروفایل
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => openResetPasswordDialog(
                                        member.user_id,
                                        member.profile?.full_name || 'کاربر'
                                      )}
                                    >
                                      <KeyRound className="w-4 h-4 ml-2" />
                                      تغییر رمز عبور
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-destructive focus:text-destructive"
                                      onClick={() => handleRemoveMember(
                                        member.user_id, 
                                        member.profile?.full_name || 'کاربر'
                                      )}
                                    >
                                      <Trash2 className="w-4 h-4 ml-2" />
                                      حذف از شرکت
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
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

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
        <DialogContent dir="rtl" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تغییر رمز عبور</DialogTitle>
            <DialogDescription>
              رمز عبور جدید برای "{selectedUserForReset?.name}" وارد کنید.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>رمز عبور جدید</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showResetPassword ? 'text' : 'password'}
                  placeholder="حداقل ۶ کاراکتر"
                  value={newPasswordForReset}
                  onChange={(e) => setNewPasswordForReset(e.target.value)}
                  className="pr-10 pl-10"
                  dir="ltr"
                  disabled={resettingPassword}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute left-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowResetPassword(!showResetPassword)}
                >
                  {showResetPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                این رمز را به کاربر اطلاع دهید تا بتواند وارد شود.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setResetPasswordDialogOpen(false)}
              disabled={resettingPassword}
            >
              انصراف
            </Button>
            <Button onClick={handleResetPassword} disabled={resettingPassword}>
              {resettingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                  در حال تغییر...
                </>
              ) : (
                'تغییر رمز عبور'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={editProfileDialogOpen} onOpenChange={setEditProfileDialogOpen}>
        <DialogContent dir="rtl" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>ویرایش پروفایل</DialogTitle>
            <DialogDescription>
              اطلاعات پروفایل کاربر را ویرایش کنید.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>نام و نام خانوادگی</Label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="مثال: علی احمدی"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="pr-10"
                  disabled={updatingProfile}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>سمت / عنوان شغلی</Label>
              <Input
                placeholder="مثال: مدیر منابع انسانی"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                disabled={updatingProfile}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setEditProfileDialogOpen(false)}
              disabled={updatingProfile}
            >
              انصراف
            </Button>
            <Button onClick={handleUpdateProfile} disabled={updatingProfile}>
              {updatingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                  در حال ذخیره...
                </>
              ) : (
                'ذخیره تغییرات'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CompanyMembers;
