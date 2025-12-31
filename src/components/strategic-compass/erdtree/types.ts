export interface Task {
  id: string;
  name: string;
  ownerName: string;
  departmentId: string;
  departmentName: string;
  strategicImportance: number; // 1-10
  completedAt: Date;
}

export interface Department {
  id: string;
  name: string;
  color: string; // Neon color hex
}

export const DEPARTMENTS: Department[] = [
  { id: "sales", name: "فروش", color: "#ff3366" }, // Neon Red
  { id: "tech", name: "فناوری", color: "#00d4ff" }, // Neon Blue
  { id: "hr", name: "منابع انسانی", color: "#00ff88" }, // Neon Green
  { id: "finance", name: "مالی", color: "#ffcc00" }, // Neon Yellow
  { id: "marketing", name: "بازاریابی", color: "#ff00ff" }, // Neon Magenta
  { id: "operations", name: "عملیات", color: "#ff6600" }, // Neon Orange
];

export const SAMPLE_TASKS: Task[] = [
  // Visionary Tasks (8-10)
  { id: "1", name: "استراتژی توسعه بین‌المللی", ownerName: "علی محمدی", departmentId: "sales", departmentName: "فروش", strategicImportance: 10, completedAt: new Date() },
  { id: "2", name: "معماری سیستم جدید", ownerName: "سارا احمدی", departmentId: "tech", departmentName: "فناوری", strategicImportance: 9, completedAt: new Date() },
  { id: "3", name: "برنامه تحول دیجیتال", ownerName: "محمد رضایی", departmentId: "tech", departmentName: "فناوری", strategicImportance: 10, completedAt: new Date() },
  { id: "4", name: "استراتژی برندینگ", ownerName: "زهرا کریمی", departmentId: "marketing", departmentName: "بازاریابی", strategicImportance: 9, completedAt: new Date() },
  { id: "5", name: "چشم‌انداز مالی ۵ ساله", ownerName: "حسین علوی", departmentId: "finance", departmentName: "مالی", strategicImportance: 8, completedAt: new Date() },
  
  // Strategic Tasks (5-7)
  { id: "6", name: "بهینه‌سازی فرآیند فروش", ownerName: "مریم حسینی", departmentId: "sales", departmentName: "فروش", strategicImportance: 7, completedAt: new Date() },
  { id: "7", name: "توسعه API جدید", ownerName: "امیر نوری", departmentId: "tech", departmentName: "فناوری", strategicImportance: 6, completedAt: new Date() },
  { id: "8", name: "برنامه آموزش کارکنان", ownerName: "فاطمه صادقی", departmentId: "hr", departmentName: "منابع انسانی", strategicImportance: 7, completedAt: new Date() },
  { id: "9", name: "کمپین تبلیغاتی", ownerName: "رضا باقری", departmentId: "marketing", departmentName: "بازاریابی", strategicImportance: 6, completedAt: new Date() },
  { id: "10", name: "بهبود زنجیره تأمین", ownerName: "نازنین موسوی", departmentId: "operations", departmentName: "عملیات", strategicImportance: 7, completedAt: new Date() },
  { id: "11", name: "سیستم CRM جدید", ownerName: "کاوه رحیمی", departmentId: "sales", departmentName: "فروش", strategicImportance: 5, completedAt: new Date() },
  { id: "12", name: "امنیت سایبری", ownerName: "پریسا شریفی", departmentId: "tech", departmentName: "فناوری", strategicImportance: 6, completedAt: new Date() },
  
  // Operational Tasks (1-4)
  { id: "13", name: "گزارش ماهانه فروش", ownerName: "داود کاظمی", departmentId: "sales", departmentName: "فروش", strategicImportance: 3, completedAt: new Date() },
  { id: "14", name: "به‌روزرسانی سرورها", ownerName: "بهرام فرهادی", departmentId: "tech", departmentName: "فناوری", strategicImportance: 2, completedAt: new Date() },
  { id: "15", name: "استخدام کارشناس", ownerName: "لیلا حیدری", departmentId: "hr", departmentName: "منابع انسانی", strategicImportance: 4, completedAt: new Date() },
  { id: "16", name: "تسویه حساب‌ها", ownerName: "آرش نیکو", departmentId: "finance", departmentName: "مالی", strategicImportance: 2, completedAt: new Date() },
  { id: "17", name: "مدیریت شبکه‌های اجتماعی", ownerName: "شیما خسروی", departmentId: "marketing", departmentName: "بازاریابی", strategicImportance: 3, completedAt: new Date() },
  { id: "18", name: "بازرسی انبار", ownerName: "کامران فتحی", departmentId: "operations", departmentName: "عملیات", strategicImportance: 1, completedAt: new Date() },
  { id: "19", name: "پشتیبانی مشتریان", ownerName: "مینا قاسمی", departmentId: "sales", departmentName: "فروش", strategicImportance: 4, completedAt: new Date() },
  { id: "20", name: "مستندسازی فنی", ownerName: "سینا یزدانی", departmentId: "tech", departmentName: "فناوری", strategicImportance: 3, completedAt: new Date() },
  
  // More tasks for visual density
  { id: "21", name: "تحلیل بازار", ownerName: "نگار امینی", departmentId: "marketing", departmentName: "بازاریابی", strategicImportance: 8, completedAt: new Date() },
  { id: "22", name: "مذاکره قرارداد", ownerName: "پویا سلطانی", departmentId: "sales", departmentName: "فروش", strategicImportance: 7, completedAt: new Date() },
  { id: "23", name: "توسعه موبایل", ownerName: "آتنا رستمی", departmentId: "tech", departmentName: "فناوری", strategicImportance: 8, completedAt: new Date() },
  { id: "24", name: "ارزیابی عملکرد", ownerName: "شهاب منصوری", departmentId: "hr", departmentName: "منابع انسانی", strategicImportance: 5, completedAt: new Date() },
  { id: "25", name: "حسابرسی داخلی", ownerName: "گلناز واحدی", departmentId: "finance", departmentName: "مالی", strategicImportance: 4, completedAt: new Date() },
];
