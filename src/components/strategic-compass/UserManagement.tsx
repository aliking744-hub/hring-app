import { motion } from "framer-motion";
import { Users } from "lucide-react";

const UserManagement = () => {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" />
          مدیریت کاربران
        </h2>
        <p className="text-muted-foreground mt-2">تعریف و ویرایش کاربران سیستم</p>
      </div>
    </div>
  );
};

export default UserManagement;
