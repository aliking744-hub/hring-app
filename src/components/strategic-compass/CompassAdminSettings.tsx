import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Settings,
  UserPlus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  Diamond,
  Shield,
  Eye,
  Edit3,
} from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";

type CompassRole = "ceo" | "deputy" | "manager" | "expert";

interface CompassUser {
  id: string;
  user_id: string;
  role: CompassRole;
  full_name: string | null;
  title: string | null;
  diamonds: number;
  accessible_sections: string[];
  can_edit: boolean;
  created_at: string;
}

const SECTIONS = [
  { id: "intent", label: "ثبت فرمان", icon: "📋" },
  { id: "behavior", label: "ثبت رفتار", icon: "🎯" },
  { id: "betting", label: "شرط‌بندی استراتژیک", icon: "🎰" },
  { id: "erdtree", label: "درخت استراتژیک", icon: "🌳" },
  { id: "analysis", label: "تحلیل‌گر", icon: "📊" },
  { id: "dream", label: "تجلی رویا", icon: "✨" },
  { id: "prism", label: "منشور ذهن", icon: "🔮" },
  { id: "journal", label: "دفترچه تصمیم", icon: "📓" },
];

const ROLE_LABELS: Record<CompassRole, string> = {
  ceo: "مدیرعامل",
  deputy: "معاون",
  manager: "مدیر",
  expert: "کارشناس",
};

const ROLE_COLORS: Record<CompassRole, string> = {
  ceo: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  deputy: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  manager: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  expert: "bg-green-500/20 text-green-400 border-green-500/30",
};

const CompassAdminSettings = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [users, setUsers] = useState<CompassUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<CompassUser | null>(null);

  // Form states
  const [formEmail, setFormEmail] = useState("");
  const [formFullName, setFormFullName] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formRole, setFormRole] = useState<CompassRole>("manager");
  const [formDiamonds, setFormDiamonds] = useState(100);
  const [formSections, setFormSections] = useState<string[]>(SECTIONS.map(s => s.id));
  const [formCanEdit, setFormCanEdit] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("compass_user_roles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data as CompassUser[]);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("خطا در بارگذاری کاربران");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormEmail("");
    setFormFullName("");
    setFormTitle("");
    setFormRole("manager");
    setFormDiamonds(100);
    setFormSections(SECTIONS.map(s => s.id));
    setFormCanEdit(true);
  };

  const handleAddUser = async () => {
    if (!formEmail.trim()) {
      toast.error("ایمیل کاربر الزامی است");
      return;
    }

    setSubmitting(true);
    try {
      // First find user by email
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", formEmail.trim())
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profileData) {
        toast.error("کاربر با این ایمیل یافت نشد");
        setSubmitting(false);
        return;
      }

      // Check if user already has a compass role
      const { data: existingRole } = await supabase
        .from("compass_user_roles")
        .select("id")
        .eq("user_id", profileData.id)
        .maybeSingle();

      if (existingRole) {
        toast.error("این کاربر قبلاً نقش دارد");
        setSubmitting(false);
        return;
      }

      // Add compass role
      const { error: insertError } = await supabase
        .from("compass_user_roles")
        .insert({
          user_id: profileData.id,
          role: formRole,
          full_name: formFullName.trim() || null,
          title: formTitle.trim() || null,
          diamonds: formDiamonds,
          accessible_sections: formSections,
          can_edit: formCanEdit,
        });

      if (insertError) throw insertError;

      toast.success("کاربر با موفقیت اضافه شد");
      setIsAddDialogOpen(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error("خطا در افزودن کاربر");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = async () => {
    if (!editingUser) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("compass_user_roles")
        .update({
          role: formRole,
          full_name: formFullName.trim() || null,
          title: formTitle.trim() || null,
          diamonds: formDiamonds,
          accessible_sections: formSections,
          can_edit: formCanEdit,
        })
        .eq("id", editingUser.id);

      if (error) throw error;

      toast.success("کاربر با موفقیت ویرایش شد");
      setIsEditDialogOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("خطا در ویرایش کاربر");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (user: CompassUser) => {
    if (!confirm(`آیا از حذف ${user.full_name || "این کاربر"} مطمئن هستید؟`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("compass_user_roles")
        .delete()
        .eq("id", user.id);

      if (error) throw error;

      toast.success("کاربر با موفقیت حذف شد");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("خطا در حذف کاربر");
    }
  };

  const openEditDialog = (user: CompassUser) => {
    setEditingUser(user);
    setFormFullName(user.full_name || "");
    setFormTitle(user.title || "");
    setFormRole(user.role);
    setFormDiamonds(user.diamonds);
    setFormSections(user.accessible_sections || SECTIONS.map(s => s.id));
    setFormCanEdit(user.can_edit);
    setIsEditDialogOpen(true);
  };

  const toggleSection = (sectionId: string) => {
    setFormSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(s => s !== sectionId)
        : [...prev, sectionId]
    );
  };

  const filteredUsers = users.filter(
    user =>
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ROLE_LABELS[user.role].includes(searchQuery)
  );

  if (adminLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center" dir="rtl">
        <Shield className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">دسترسی محدود</h2>
        <p className="text-muted-foreground">
          فقط مدیران سیستم به این بخش دسترسی دارند
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-[#D4AF37]" />
          <h2 className="text-xl font-bold text-foreground">تنظیمات قطب‌نما</h2>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={resetForm}>
              <UserPlus className="w-4 h-4" />
              افزودن کاربر
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg" dir="rtl">
            <DialogHeader>
              <DialogTitle>افزودن کاربر جدید</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>ایمیل کاربر *</Label>
                <Input
                  placeholder="user@example.com"
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  dir="ltr"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>نام کامل</Label>
                  <Input
                    placeholder="نام و نام‌خانوادگی"
                    value={formFullName}
                    onChange={e => setFormFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>سمت</Label>
                  <Input
                    placeholder="مثال: مدیر منابع انسانی"
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>نقش</Label>
                  <Select value={formRole} onValueChange={v => setFormRole(v as CompassRole)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ceo">مدیرعامل</SelectItem>
                      <SelectItem value="deputy">معاون</SelectItem>
                      <SelectItem value="manager">مدیر</SelectItem>
                      <SelectItem value="expert">کارشناس</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <Diamond className="w-4 h-4 text-[#D4AF37]" />
                    الماس
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={formDiamonds}
                    onChange={e => setFormDiamonds(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>بخش‌های قابل دسترسی</Label>
                <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg bg-muted/30">
                  {SECTIONS.map(section => (
                    <label
                      key={section.id}
                      className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded"
                    >
                      <Checkbox
                        checked={formSections.includes(section.id)}
                        onCheckedChange={() => toggleSection(section.id)}
                      />
                      <span className="text-sm">
                        {section.icon} {section.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                <Checkbox
                  id="canEdit"
                  checked={formCanEdit}
                  onCheckedChange={v => setFormCanEdit(v as boolean)}
                />
                <label htmlFor="canEdit" className="flex items-center gap-2 cursor-pointer">
                  {formCanEdit ? (
                    <>
                      <Edit3 className="w-4 h-4 text-green-400" />
                      <span>امکان ویرایش و ثبت اطلاعات</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 text-blue-400" />
                      <span>فقط مشاهده</span>
                    </>
                  )}
                </label>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                انصراف
              </Button>
              <Button onClick={handleAddUser} disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
                افزودن
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="جستجوی کاربر..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Users Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">نام</TableHead>
              <TableHead className="text-right">سمت</TableHead>
              <TableHead className="text-right">نقش</TableHead>
              <TableHead className="text-center">الماس</TableHead>
              <TableHead className="text-center">دسترسی</TableHead>
              <TableHead className="text-center">سطح</TableHead>
              <TableHead className="text-left">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  کاربری یافت نشد
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.full_name || "بدون نام"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.title || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge className={ROLE_COLORS[user.role]}>
                      {ROLE_LABELS[user.role]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="flex items-center justify-center gap-1">
                      <Diamond className="w-4 h-4 text-[#D4AF37]" />
                      {user.diamonds}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm text-muted-foreground">
                      {user.accessible_sections?.length || 0} بخش
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {user.can_edit ? (
                      <Badge variant="outline" className="gap-1 border-green-500/30 text-green-400">
                        <Edit3 className="w-3 h-3" />
                        ویرایش
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1 border-blue-500/30 text-blue-400">
                        <Eye className="w-3 h-3" />
                        مشاهده
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(user)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:text-red-300"
                        onClick={() => handleDeleteUser(user)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>ویرایش کاربر</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>نام کامل</Label>
                <Input
                  placeholder="نام و نام‌خانوادگی"
                  value={formFullName}
                  onChange={e => setFormFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>سمت</Label>
                <Input
                  placeholder="مثال: مدیر منابع انسانی"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>نقش</Label>
                <Select value={formRole} onValueChange={v => setFormRole(v as CompassRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ceo">مدیرعامل</SelectItem>
                    <SelectItem value="deputy">معاون</SelectItem>
                    <SelectItem value="manager">مدیر</SelectItem>
                    <SelectItem value="expert">کارشناس</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Diamond className="w-4 h-4 text-[#D4AF37]" />
                  الماس
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={formDiamonds}
                  onChange={e => setFormDiamonds(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>بخش‌های قابل دسترسی</Label>
              <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg bg-muted/30">
                {SECTIONS.map(section => (
                  <label
                    key={section.id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded"
                  >
                    <Checkbox
                      checked={formSections.includes(section.id)}
                      onCheckedChange={() => toggleSection(section.id)}
                    />
                    <span className="text-sm">
                      {section.icon} {section.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
              <Checkbox
                id="canEditEdit"
                checked={formCanEdit}
                onCheckedChange={v => setFormCanEdit(v as boolean)}
              />
              <label htmlFor="canEditEdit" className="flex items-center gap-2 cursor-pointer">
                {formCanEdit ? (
                  <>
                    <Edit3 className="w-4 h-4 text-green-400" />
                    <span>امکان ویرایش و ثبت اطلاعات</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 text-blue-400" />
                    <span>فقط مشاهده</span>
                  </>
                )}
              </label>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              انصراف
            </Button>
            <Button onClick={handleEditUser} disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
              ذخیره تغییرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompassAdminSettings;
