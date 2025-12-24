import { motion } from "framer-motion";
import { ArrowRight, Users, Calendar, Clock, Video, Plus, User } from "lucide-react";
import { Link } from "react-router-dom";
import AuroraBackground from "@/components/AuroraBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const upcomingInterviews = [
  { name: "سارا احمدی", position: "طراح UI/UX", date: "۱۴۰۳/۱۰/۱۵", time: "۱۰:۳۰", type: "video" },
  { name: "محمد رضایی", position: "توسعه‌دهنده فرانت‌اند", date: "۱۴۰۳/۱۰/۱۵", time: "۱۴:۰۰", type: "in-person" },
  { name: "زهرا کریمی", position: "مدیر محصول", date: "۱۴۰۳/۱۰/۱۶", time: "۱۱:۰۰", type: "video" },
  { name: "علی موسوی", position: "مهندس DevOps", date: "۱۴۰۳/۱۰/۱۷", time: "۰۹:۳۰", type: "phone" },
];

const InterviewAssistant = () => {
  return (
    <div className="relative min-h-screen" dir="rtl">
      <AuroraBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="outline" size="icon" className="border-border bg-secondary/50">
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                دستیار مصاحبه
              </h1>
              <p className="text-muted-foreground">مدیریت و زمان‌بندی مصاحبه‌ها</p>
            </div>
          </div>
          <Button className="glow-button text-foreground">
            <Plus className="w-4 h-4 ml-2" />
            مصاحبه جدید
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Schedule Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 space-y-6"
          >
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              زمان‌بندی جدید
            </h2>

            <div className="space-y-2">
              <Label htmlFor="candidate">نام متقاضی</Label>
              <Input 
                id="candidate" 
                placeholder="نام و نام خانوادگی" 
                className="bg-secondary/50 border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">موقعیت شغلی</Label>
              <Select>
                <SelectTrigger className="bg-secondary/50 border-border">
                  <SelectValue placeholder="انتخاب موقعیت" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="frontend">توسعه‌دهنده فرانت‌اند</SelectItem>
                  <SelectItem value="backend">توسعه‌دهنده بک‌اند</SelectItem>
                  <SelectItem value="designer">طراح UI/UX</SelectItem>
                  <SelectItem value="pm">مدیر محصول</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="date">تاریخ</Label>
                <Input 
                  id="date" 
                  type="text"
                  placeholder="۱۴۰۳/۱۰/۱۵" 
                  className="bg-secondary/50 border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">ساعت</Label>
                <Input 
                  id="time" 
                  type="text"
                  placeholder="۱۰:۳۰" 
                  className="bg-secondary/50 border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">نوع مصاحبه</Label>
              <Select>
                <SelectTrigger className="bg-secondary/50 border-border">
                  <SelectValue placeholder="انتخاب نوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">ویدیو کنفرانس</SelectItem>
                  <SelectItem value="in-person">حضوری</SelectItem>
                  <SelectItem value="phone">تلفنی</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full glow-button text-foreground">
              <Calendar className="w-4 h-4 ml-2" />
              ثبت مصاحبه
            </Button>
          </motion.div>

          {/* Upcoming Interviews */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 glass-card p-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              مصاحبه‌های پیش رو
            </h2>

            <div className="space-y-3">
              {upcomingInterviews.map((interview, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{interview.name}</p>
                      <p className="text-sm text-muted-foreground">{interview.position}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-left">
                      <p className="text-sm text-foreground">{interview.date}</p>
                      <p className="text-sm text-primary">{interview.time}</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Video className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default InterviewAssistant;
