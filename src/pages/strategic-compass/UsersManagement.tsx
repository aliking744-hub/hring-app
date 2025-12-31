import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompassAuth } from "@/contexts/CompassAuthContext";
import CompassLayout from "@/components/strategic-compass/CompassLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Users, Shield, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type CompassRole = Database["public"]["Enums"]["compass_role"];

interface CompassUserRole {
  id: string;
  user_id: string;
  role: CompassRole;
  created_at: string;
}

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
}

const UsersManagement = () => {
  const { role } = useCompassAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    role: "deputy" as CompassRole,
  });

  const { data: userRoles, isLoading } = useQuery({
    queryKey: ["compass-user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("compass_user_roles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as CompassUserRole[];
    },
    enabled: role === "ceo",
  });

  const { data: profiles } = useQuery({
    queryKey: ["profiles-for-compass"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id, email, full_name");
      if (error) throw error;
      return data as Profile[];
    },
    enabled: role === "ceo",
  });

  const addRoleMutation = useMutation({
    mutationFn: async ({ email, newRole }: { email: string; newRole: CompassRole }) => {
      // Find user by email
      const profile = profiles?.find((p) => p.email === email);
      if (!profile) throw new Error("کاربر یافت نشد");

      // Check if already has a role
      const existingRole = userRoles?.find((r) => r.user_id === profile.id);
      if (existingRole) throw new Error("این کاربر قبلاً نقش دارد");

      const { error } = await supabase.from("compass_user_roles").insert({
        user_id: profile.id,
        role: newRole,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compass-user-roles"] });
      toast({ title: "نقش اضافه شد" });
      resetForm();
    },
    onError: (error: Error) => toast({ title: error.message, variant: "destructive" }),
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, newRole }: { id: string; newRole: CompassRole }) => {
      const { error } = await supabase
        .from("compass_user_roles")
        .update({ role: newRole })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compass-user-roles"] });
      toast({ title: "نقش بروزرسانی شد" });
    },
    onError: () => toast({ title: "خطا در بروزرسانی", variant: "destructive" }),
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("compass_user_roles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compass-user-roles"] });
      toast({ title: "نقش حذف شد" });
    },
    onError: () => toast({ title: "خطا در حذف", variant: "destructive" }),
  });

  const resetForm = () => {
    setFormData({ email: "", role: "deputy" });
    setIsDialogOpen(false);
  };

  const getUserInfo = (userId: string) => {
    const profile = profiles?.find((p) => p.id === userId);
    return {
      email: profile?.email || "نامشخص",
      name: profile?.full_name || "-",
    };
  };

  const getRoleBadge = (r: CompassRole) => {
    const colors = {
      ceo: "bg-purple-100 text-purple-800",
      deputy: "bg-blue-100 text-blue-800",
      manager: "bg-green-100 text-green-800",
    };
    const labels = {
      ceo: "مدیرعامل",
      deputy: "معاون",
      manager: "مدیر",
    };
    return <Badge className={colors[r]}>{labels[r]}</Badge>;
  };

  if (role !== "ceo") {
    return (
      <CompassLayout>
        <div className="text-center py-12 text-muted-foreground">
          شما دسترسی به این بخش را ندارید
        </div>
      </CompassLayout>
    );
  }

  return (
    <CompassLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">مدیریت کاربران</h1>
            <p className="text-muted-foreground">تخصیص نقش به کاربران سیستم</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                افزودن کاربر
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md" dir="rtl">
              <DialogHeader>
                <DialogTitle>افزودن نقش به کاربر</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>ایمیل کاربر</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <Label>نقش</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(v) => setFormData({ ...formData, role: v as CompassRole })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deputy">معاون</SelectItem>
                      <SelectItem value="manager">مدیر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => addRoleMutation.mutate({ email: formData.email, newRole: formData.role })}
                  className="w-full"
                >
                  افزودن
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle>کاربران سیستم</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">در حال بارگذاری...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">ایمیل</TableHead>
                    <TableHead className="text-right">نام</TableHead>
                    <TableHead className="text-right">نقش</TableHead>
                    <TableHead className="text-right">عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userRoles?.map((userRole) => {
                    const userInfo = getUserInfo(userRole.user_id);
                    return (
                      <TableRow key={userRole.id}>
                        <TableCell>{userInfo.email}</TableCell>
                        <TableCell>{userInfo.name}</TableCell>
                        <TableCell>
                          <Select
                            value={userRole.role}
                            onValueChange={(v) =>
                              updateRoleMutation.mutate({ id: userRole.id, newRole: v as CompassRole })
                            }
                            disabled={userRole.role === "ceo"}
                          >
                            <SelectTrigger className="w-28">
                              <SelectValue>{getRoleBadge(userRole.role)}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="deputy">معاون</SelectItem>
                              <SelectItem value="manager">مدیر</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {userRole.role !== "ceo" && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteRoleMutation.mutate(userRole.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {(!userRoles || userRoles.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        هنوز کاربری اضافه نشده
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>راهنمای نقش‌ها</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Badge className="bg-purple-100 text-purple-800">مدیرعامل (CEO)</Badge>
                <p className="text-sm text-muted-foreground">
                  تعریف نیت‌ها، ایجاد سناریو، مشاهده تمام داده‌ها، مدیریت کاربران
                </p>
              </div>
              <div className="space-y-2">
                <Badge className="bg-blue-100 text-blue-800">معاون (Deputy)</Badge>
                <p className="text-sm text-muted-foreground">
                  ثبت رفتار، پاسخ به سناریو، مشاهده نیت‌ها، ثبت ژورنال تصمیم
                </p>
              </div>
              <div className="space-y-2">
                <Badge className="bg-green-100 text-green-800">مدیر (Manager)</Badge>
                <p className="text-sm text-muted-foreground">
                  مشاهده نیت‌ها و سناریوها، دسترسی محدود به داشبورد
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </CompassLayout>
  );
};

export default UsersManagement;
