import { motion } from "framer-motion";
import { ArrowRight, UserPlus, CheckCircle, Circle, Clock, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import AuroraBackground from "@/components/AuroraBackground";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const roadmapPhases = [
  {
    phase: "هفته ۱-۲",
    title: "آشنایی و استقرار",
    progress: 100,
    tasks: [
      { text: "معرفی به تیم و همکاران", done: true },
      { text: "تنظیم ابزارها و دسترسی‌ها", done: true },
      { text: "مطالعه مستندات شرکت", done: true },
      { text: "آشنایی با فرآیندها", done: true },
    ]
  },
  {
    phase: "هفته ۳-۴",
    title: "یادگیری و آموزش",
    progress: 75,
    tasks: [
      { text: "شرکت در جلسات آموزشی", done: true },
      { text: "همکاری در پروژه‌های کوچک", done: true },
      { text: "دریافت بازخورد اولیه", done: true },
      { text: "تکمیل دوره‌های آنلاین", done: false },
    ]
  },
  {
    phase: "ماه ۲",
    title: "مشارکت فعال",
    progress: 30,
    tasks: [
      { text: "شروع کار مستقل", done: true },
      { text: "مشارکت در جلسات تیم", done: false },
      { text: "ارائه ایده‌های بهبود", done: false },
      { text: "جلسه بازخورد ماهانه", done: false },
    ]
  },
  {
    phase: "ماه ۳",
    title: "استقلال کامل",
    progress: 0,
    tasks: [
      { text: "مدیریت پروژه مستقل", done: false },
      { text: "منتورینگ اعضای جدید", done: false },
      { text: "ارزیابی دوره آزمایشی", done: false },
      { text: "تعیین اهداف بلندمدت", done: false },
    ]
  },
];

const OnboardingRoadmap = () => {
  const overallProgress = Math.round(
    roadmapPhases.reduce((acc, phase) => acc + phase.progress, 0) / roadmapPhases.length
  );

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
                <UserPlus className="w-6 h-6 text-primary" />
                نقشه راه ۹۰ روزه
              </h1>
              <p className="text-muted-foreground">برنامه آنبوردینگ کارمندان جدید</p>
            </div>
          </div>
        </motion.div>

        {/* Overall Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">پیشرفت کلی</h2>
            <span className="text-2xl font-bold text-primary">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-3" />
        </motion.div>

        {/* Roadmap Phases */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {roadmapPhases.map((phase, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="glass-card p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">{phase.phase}</span>
              </div>
              
              <h3 className="text-lg font-semibold text-foreground mb-3">{phase.title}</h3>
              
              <div className="flex items-center gap-2 mb-4">
                <Progress value={phase.progress} className="h-2 flex-1" />
                <span className="text-sm text-muted-foreground">{phase.progress}%</span>
              </div>

              <div className="space-y-2">
                {phase.tasks.map((task, taskIndex) => (
                  <div 
                    key={taskIndex}
                    className="flex items-center gap-2 text-sm"
                  >
                    {task.done ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className={task.done ? "text-muted-foreground line-through" : "text-foreground"}>
                      {task.text}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Timeline View */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card p-6 mt-6"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            جلسات آینده
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: "جلسه بازخورد هفتگی", date: "شنبه ۱۵ دی", time: "۱۰:۰۰" },
              { title: "آموزش ابزارهای تیم", date: "یکشنبه ۱۶ دی", time: "۱۴:۰۰" },
              { title: "معرفی به مدیران ارشد", date: "سه‌شنبه ۱۸ دی", time: "۱۱:۰۰" },
            ].map((event, index) => (
              <div 
                key={index}
                className="p-4 bg-secondary/30 rounded-lg"
              >
                <p className="font-medium text-foreground">{event.title}</p>
                <p className="text-sm text-muted-foreground">{event.date} - {event.time}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OnboardingRoadmap;
