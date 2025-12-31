import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  Save,
  X,
  Shield,
  Crown,
  UserCheck,
  Briefcase,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CompassUser {
  id: string;
  user_id: string;
  role: 'ceo' | 'deputy' | 'manager';
  created_at: string;
  email?: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<CompassUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "deputy" as 'ceo' | 'deputy' | 'manager',
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: rolesData, error } = await supabase
        .from('compass_user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch emails from profiles
      if (rolesData) {
        const userIds = rolesData.map(r => r.user_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', userIds);

        const usersWithEmails = rolesData.map(role => ({
          ...role,
          email: profilesData?.find(p => p.id === role.user_id)?.email || 'نامشخص'
        }));

        setUsers(usersWithEmails);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!formData.email || !formData.password) {
      toast({
        title: "خطا",
        description: "ایمیل و رمز عبور الزامی است",
        variant: "destructive",
      });
      return;
    }

    try {
      // First, sign up the new user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/strategic-compass`,
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Add compass role
        const { error: roleError } = await supabase
          .from('compass_user_roles')
          .insert({
            user_id: authData.user.id,
            role: formData.role,
          });

        if (roleError) throw roleError;

        toast({
          title: "کاربر ایجاد شد",
          description: `کاربر با نقش ${getRoleLabel(formData.role)} اضافه شد`,
        });

        setFormData({ email: "", password: "", role: "deputy" });
        setIsCreating(false);
        fetchUsers();
      }
    } catch (err: any) {
      console.error('Error creating user:', err);
      toast({
        title: "خطا",
        description: err.message || "مشکلی در ایجاد کاربر رخ داد",
        variant: "destructive",
      });
    }
  };

  const handleUpdateRole = async (id: string, newRole: 'ceo' | 'deputy' | 'manager') => {
    try {
      const { error } = await supabase
        .from('compass_user_roles')
        .update({ role: newRole })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "بروزرسانی شد",
        description: "نقش کاربر تغییر یافت",
      });

      setEditingId(null);
      fetchUsers();
    } catch (err) {
      console.error('Error updating role:', err);
      toast({
        title: "خطا",
        description: "مشکلی در بروزرسانی رخ داد",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from('compass_user_roles')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;

      toast({
        title: "حذف شد",
        description: "دسترسی کاربر از سیستم حذف شد",
      });

      setDeleteId(null);
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      toast({
        title: "خطا",
        description: "مشکلی در حذف رخ داد",
        variant: "destructive",
      });
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ceo': return 'مدیرعامل';
      case 'deputy': return 'معاون';
      case 'manager': return 'مدیرکل';
      default: return role;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ceo': return Crown;
      case 'deputy': return Shield;
      case 'manager': return Briefcase;
      default: return Users;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ceo': return 'text-yellow-500 bg-yellow-500/20';
      case 'deputy': return 'text-blue-500 bg-blue-500/20';
      case 'manager': return 'text-green-500 bg-green-500/20';
      default: return 'text-muted-foreground bg-secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Users className="w-8 h-8 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            مدیریت کاربران
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            تعریف و مدیریت دسترسی کاربران سیستم قطب نما
          </p>
        </div>
        {!isCreating && (
          <Button 
            onClick={() => setIsCreating(true)}
            className="glow-button text-foreground"
          >
            <Plus className="w-4 h-4 ml-2" />
            کاربر جدید
          </Button>
        )}
      </div>

      {/* Role Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { role: 'ceo', label: 'مدیرعامل', icon: Crown, color: 'yellow' },
          { role: 'deputy', label: 'معاون', icon: Shield, color: 'blue' },
          { role: 'manager', label: 'مدیرکل', icon: Briefcase, color: 'green' },
        ].map((item) => {
          const count = users.filter(u => u.role === item.role).length;
          return (
            <motion.div
              key={item.role}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4 text-center"
            >
              <div className={`w-12 h-12 mx-auto rounded-xl bg-${item.color}-500/20 flex items-center justify-center mb-2`}>
                <item.icon className={`w-6 h-6 text-${item.color}-500`} />
              </div>
              <p className="text-2xl font-bold text-foreground">{count}</p>
              <p className="text-sm text-muted-foreground">{item.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Create User Form */}
      {isCreating && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">ایجاد کاربر جدید</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  ایمیل
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@company.com"
                  className="mt-1.5 bg-secondary/50 border-border text-left"
                  dir="ltr"
                />
              </div>
              <div>
                <Label htmlFor="password">رمز عبور</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="حداقل ۶ کاراکتر"
                  className="mt-1.5 bg-secondary/50 border-border"
                />
              </div>
            </div>

            <div>
              <Label>سطح دسترسی</Label>
              <Select
                value={formData.role}
                onValueChange={(value: 'ceo' | 'deputy' | 'manager') => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger className="mt-1.5 bg-secondary/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ceo">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-yellow-500" />
                      مدیرعامل
                    </div>
                  </SelectItem>
                  <SelectItem value="deputy">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-500" />
                      معاون
                    </div>
                  </SelectItem>
                  <SelectItem value="manager">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-green-500" />
                      مدیرکل
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button onClick={handleCreateUser} className="glow-button text-foreground">
                <Save className="w-4 h-4 ml-2" />
                ایجاد کاربر
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCreating(false);
                  setFormData({ email: "", password: "", role: "deputy" });
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

      {/* Users List */}
      <div className="space-y-3">
        {users.map((compassUser, index) => {
          const RoleIcon = getRoleIcon(compassUser.role);
          const isCurrentUser = compassUser.user_id === user?.id;

          return (
            <motion.div
              key={compassUser.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getRoleColor(compassUser.role)}`}>
                  <RoleIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-foreground font-medium flex items-center gap-2">
                    {compassUser.email}
                    {isCurrentUser && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                        شما
                      </span>
                    )}
                  </p>
                  {editingId === compassUser.id ? (
                    <Select
                      value={compassUser.role}
                      onValueChange={(value: 'ceo' | 'deputy' | 'manager') => handleUpdateRole(compassUser.id, value)}
                    >
                      <SelectTrigger className="h-8 mt-1 w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ceo">مدیرعامل</SelectItem>
                        <SelectItem value="deputy">معاون</SelectItem>
                        <SelectItem value="manager">مدیرکل</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {getRoleLabel(compassUser.role)}
                    </p>
                  )}
                </div>
              </div>

              {!isCurrentUser && (
                <div className="flex items-center gap-2">
                  {editingId === compassUser.id ? (
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                      بستن
                    </Button>
                  ) : (
                    <>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={() => setEditingId(compassUser.id)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(compassUser.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}

        {users.length === 0 && (
          <div className="glass-card p-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">هنوز کاربری تعریف نشده</h3>
            <p className="text-muted-foreground text-sm">
              اولین کاربر سیستم را اضافه کنید
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف دسترسی کاربر</AlertDialogTitle>
            <AlertDialogDescription>
              آیا مطمئن هستید که می‌خواهید دسترسی این کاربر را از سیستم قطب نما حذف کنید؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserManagement;
