// Demo data for Strategic Compass components

export const DEMO_INTENTS = [
  {
    id: "demo-intent-1",
    title: "کاهش هزینه لجستیک ۲۰٪",
    description: "کاهش هزینه‌های حمل و نقل و انبارداری با بهینه‌سازی مسیرها و مذاکره با پیمانکاران",
    strategic_weight: 9,
    tolerance_zone: 3,
    status: "active",
    created_at: "2024-01-15T10:00:00Z",
    ceo_id: "demo-ceo"
  },
  {
    id: "demo-intent-2", 
    title: "افزایش رضایت مشتری به ۹۵٪",
    description: "بهبود تجربه مشتری از طریق پاسخگویی سریع‌تر و افزایش کیفیت خدمات پس از فروش",
    strategic_weight: 8,
    tolerance_zone: 5,
    status: "active",
    created_at: "2024-02-01T10:00:00Z",
    ceo_id: "demo-ceo"
  },
  {
    id: "demo-intent-3",
    title: "توسعه بازار صادراتی",
    description: "ورود به بازارهای جدید منطقه‌ای با تمرکز بر کشورهای همسایه",
    strategic_weight: 7,
    tolerance_zone: 7,
    status: "active",
    created_at: "2024-03-10T10:00:00Z",
    ceo_id: "demo-ceo"
  },
  {
    id: "demo-intent-4",
    title: "دیجیتال‌سازی فرآیندها",
    description: "اتوماسیون فرآیندهای کلیدی و حذف کاغذبازی‌های غیرضروری",
    strategic_weight: 6,
    tolerance_zone: 8,
    status: "active",
    created_at: "2024-04-05T10:00:00Z",
    ceo_id: "demo-ceo"
  }
];

export const DEMO_COMPASS_USERS = [
  { id: "demo-user-1", user_id: "demo-user-id-1", role: "deputy", full_name: "علی محمدی", title: "معاون مالی" },
  { id: "demo-user-2", user_id: "demo-user-id-2", role: "deputy", full_name: "مریم احمدی", title: "معاون بازرگانی" },
  { id: "demo-user-3", user_id: "demo-user-id-3", role: "deputy", full_name: "رضا کریمی", title: "معاون فنی" },
  { id: "demo-user-4", user_id: "demo-user-id-4", role: "manager", full_name: "سارا رضایی", title: "مدیر منابع انسانی" },
  { id: "demo-user-5", user_id: "demo-user-id-5", role: "manager", full_name: "حسین نوری", title: "مدیر IT" },
  { id: "demo-user-6", user_id: "demo-user-id-6", role: "manager", full_name: "فاطمه کاظمی", title: "مدیر بازاریابی" }
];

export const DEMO_BEHAVIORS = [
  { id: "demo-beh-1", deputy_id: "demo-user-id-1", intent_id: "demo-intent-1", alignment_score: 85, result_score: 90, created_at: "2024-06-01T10:00:00Z" },
  { id: "demo-beh-2", deputy_id: "demo-user-id-1", intent_id: "demo-intent-2", alignment_score: 78, result_score: 82, created_at: "2024-06-05T10:00:00Z" },
  { id: "demo-beh-3", deputy_id: "demo-user-id-2", intent_id: "demo-intent-1", alignment_score: 92, result_score: 88, created_at: "2024-06-02T10:00:00Z" },
  { id: "demo-beh-4", deputy_id: "demo-user-id-2", intent_id: "demo-intent-3", alignment_score: 70, result_score: 75, created_at: "2024-06-08T10:00:00Z" },
  { id: "demo-beh-5", deputy_id: "demo-user-id-3", intent_id: "demo-intent-4", alignment_score: 95, result_score: 92, created_at: "2024-06-03T10:00:00Z" },
  { id: "demo-beh-6", deputy_id: "demo-user-id-3", intent_id: "demo-intent-1", alignment_score: 88, result_score: 85, created_at: "2024-06-10T10:00:00Z" },
  { id: "demo-beh-7", deputy_id: "demo-user-id-4", intent_id: "demo-intent-2", alignment_score: 65, result_score: 70, created_at: "2024-06-04T10:00:00Z" },
  { id: "demo-beh-8", deputy_id: "demo-user-id-5", intent_id: "demo-intent-4", alignment_score: 98, result_score: 95, created_at: "2024-06-06T10:00:00Z" },
  { id: "demo-beh-9", deputy_id: "demo-user-id-6", intent_id: "demo-intent-3", alignment_score: 72, result_score: 78, created_at: "2024-06-07T10:00:00Z" },
  { id: "demo-beh-10", deputy_id: "demo-user-id-1", intent_id: "demo-intent-3", alignment_score: 80, result_score: 85, created_at: "2024-06-12T10:00:00Z" },
  { id: "demo-beh-11", deputy_id: "demo-user-id-2", intent_id: "demo-intent-4", alignment_score: 55, result_score: 60, created_at: "2024-06-14T10:00:00Z" },
  { id: "demo-beh-12", deputy_id: "demo-user-id-3", intent_id: "demo-intent-2", alignment_score: 82, result_score: 80, created_at: "2024-06-15T10:00:00Z" },
];

export const DEMO_SCENARIOS = [
  {
    id: "demo-scenario-1",
    question: "در صورت کاهش بودجه ۱۵٪، کدام اقدام را در اولویت قرار می‌دهید؟",
    option_a: "کاهش نیروی انسانی موقت",
    option_b: "تعویق پروژه‌های غیرضروری",
    option_c: "مذاکره مجدد با تامین‌کنندگان",
    category: "ai_generated",
    ceo_answer: "b",
    is_active: true,
    intent_id: "demo-intent-1",
    created_at: "2024-05-01T10:00:00Z"
  },
  {
    id: "demo-scenario-2",
    question: "مشتری استراتژیک از کیفیت محصول شکایت کرده. اولویت شما چیست؟",
    option_a: "ارسال فوری محصول جایگزین",
    option_b: "بررسی ریشه‌ای مشکل قبل از اقدام",
    option_c: "ارائه تخفیف برای حفظ رابطه",
    category: "ai_generated",
    ceo_answer: "a",
    is_active: true,
    intent_id: "demo-intent-2",
    created_at: "2024-05-05T10:00:00Z"
  },
  {
    id: "demo-scenario-3",
    question: "فرصت صادرات فوری با سود کم پیش آمده. تصمیم شما؟",
    option_a: "پذیرش برای ورود به بازار",
    option_b: "رد کردن و انتظار فرصت بهتر",
    option_c: "مذاکره برای شرایط بهتر",
    category: "ai_generated",
    ceo_answer: "c",
    is_active: true,
    intent_id: "demo-intent-3",
    created_at: "2024-05-10T10:00:00Z"
  },
  {
    id: "demo-scenario-4",
    question: "تیم IT پیشنهاد سیستم جدید با هزینه بالا داده. واکنش شما؟",
    option_a: "تصویب فوری برای مزیت رقابتی",
    option_b: "درخواست تحلیل ROI دقیق",
    option_c: "پیشنهاد اجرای فازبندی شده",
    category: "ai_generated",
    ceo_answer: "c",
    is_active: true,
    intent_id: "demo-intent-4",
    created_at: "2024-05-15T10:00:00Z"
  },
  {
    id: "demo-scenario-5",
    question: "رقیب قیمت محصول مشابه را ۲۰٪ کاهش داده. استراتژی شما؟",
    option_a: "کاهش قیمت متناسب",
    option_b: "تمرکز بر تمایز کیفی",
    option_c: "حمله به بخش‌های دیگر بازار",
    category: "ai_generated",
    ceo_answer: "b",
    is_active: true,
    intent_id: "demo-intent-2",
    created_at: "2024-05-20T10:00:00Z"
  }
];

export const DEMO_SCENARIO_RESPONSES = [
  { id: "demo-resp-1", scenario_id: "demo-scenario-1", user_id: "demo-user-id-1", answer: "b", created_at: "2024-05-02T10:00:00Z" },
  { id: "demo-resp-2", scenario_id: "demo-scenario-1", user_id: "demo-user-id-2", answer: "b", created_at: "2024-05-02T11:00:00Z" },
  { id: "demo-resp-3", scenario_id: "demo-scenario-1", user_id: "demo-user-id-3", answer: "c", created_at: "2024-05-02T12:00:00Z" },
  { id: "demo-resp-4", scenario_id: "demo-scenario-2", user_id: "demo-user-id-1", answer: "a", created_at: "2024-05-06T10:00:00Z" },
  { id: "demo-resp-5", scenario_id: "demo-scenario-2", user_id: "demo-user-id-2", answer: "b", created_at: "2024-05-06T11:00:00Z" },
  { id: "demo-resp-6", scenario_id: "demo-scenario-2", user_id: "demo-user-id-3", answer: "a", created_at: "2024-05-06T12:00:00Z" },
  { id: "demo-resp-7", scenario_id: "demo-scenario-2", user_id: "demo-user-id-4", answer: "a", created_at: "2024-05-06T13:00:00Z" },
  { id: "demo-resp-8", scenario_id: "demo-scenario-3", user_id: "demo-user-id-1", answer: "c", created_at: "2024-05-11T10:00:00Z" },
  { id: "demo-resp-9", scenario_id: "demo-scenario-3", user_id: "demo-user-id-2", answer: "a", created_at: "2024-05-11T11:00:00Z" },
  { id: "demo-resp-10", scenario_id: "demo-scenario-3", user_id: "demo-user-id-6", answer: "c", created_at: "2024-05-11T12:00:00Z" },
  { id: "demo-resp-11", scenario_id: "demo-scenario-4", user_id: "demo-user-id-3", answer: "c", created_at: "2024-05-16T10:00:00Z" },
  { id: "demo-resp-12", scenario_id: "demo-scenario-4", user_id: "demo-user-id-5", answer: "c", created_at: "2024-05-16T11:00:00Z" },
  { id: "demo-resp-13", scenario_id: "demo-scenario-4", user_id: "demo-user-id-4", answer: "b", created_at: "2024-05-16T12:00:00Z" },
  { id: "demo-resp-14", scenario_id: "demo-scenario-5", user_id: "demo-user-id-1", answer: "b", created_at: "2024-05-21T10:00:00Z" },
  { id: "demo-resp-15", scenario_id: "demo-scenario-5", user_id: "demo-user-id-2", answer: "b", created_at: "2024-05-21T11:00:00Z" },
  { id: "demo-resp-16", scenario_id: "demo-scenario-5", user_id: "demo-user-id-3", answer: "a", created_at: "2024-05-21T12:00:00Z" },
  { id: "demo-resp-17", scenario_id: "demo-scenario-5", user_id: "demo-user-id-4", answer: "b", created_at: "2024-05-21T13:00:00Z" },
  { id: "demo-resp-18", scenario_id: "demo-scenario-5", user_id: "demo-user-id-5", answer: "c", created_at: "2024-05-21T14:00:00Z" },
];

export const DEMO_INTENT_ASSIGNMENTS = [
  { id: "demo-assign-1", intent_id: "demo-intent-1", user_id: "demo-user-id-1" },
  { id: "demo-assign-2", intent_id: "demo-intent-1", user_id: "demo-user-id-2" },
  { id: "demo-assign-3", intent_id: "demo-intent-1", user_id: "demo-user-id-3" },
  { id: "demo-assign-4", intent_id: "demo-intent-2", user_id: "demo-user-id-1" },
  { id: "demo-assign-5", intent_id: "demo-intent-2", user_id: "demo-user-id-4" },
  { id: "demo-assign-6", intent_id: "demo-intent-3", user_id: "demo-user-id-2" },
  { id: "demo-assign-7", intent_id: "demo-intent-3", user_id: "demo-user-id-6" },
  { id: "demo-assign-8", intent_id: "demo-intent-4", user_id: "demo-user-id-3" },
  { id: "demo-assign-9", intent_id: "demo-intent-4", user_id: "demo-user-id-5" },
];

export const DEMO_STRATEGIC_BETS = [
  {
    id: "demo-bet-1",
    goal_title: "رشد ۵۰٪ درآمد صادراتی",
    goal_description: "افزایش سهم صادرات در کل درآمد شرکت از ۱۵٪ به ۲۵٪",
    ceo_id: "demo-ceo",
    year: 2024,
    created_at: "2024-01-01T10:00:00Z"
  },
  {
    id: "demo-bet-2",
    goal_title: "راه‌اندازی خط تولید جدید",
    goal_description: "شروع تولید محصول نسل چهارم با ظرفیت ۱۰۰۰ واحد ماهانه",
    ceo_id: "demo-ceo",
    year: 2024,
    created_at: "2024-01-15T10:00:00Z"
  },
  {
    id: "demo-bet-3",
    goal_title: "دیجیتال‌سازی کامل فروش",
    goal_description: "انتقال ۸۰٪ فرآیند فروش به پلتفرم دیجیتال",
    ceo_id: "demo-ceo",
    year: 2024,
    created_at: "2024-02-01T10:00:00Z"
  }
];

export const DEMO_BET_ALLOCATIONS = [
  { id: "demo-alloc-1", bet_id: "demo-bet-1", user_id: "demo-user-id-1", coins: 35, created_at: "2024-02-10T10:00:00Z" },
  { id: "demo-alloc-2", bet_id: "demo-bet-1", user_id: "demo-user-id-2", coins: 40, created_at: "2024-02-10T11:00:00Z" },
  { id: "demo-alloc-3", bet_id: "demo-bet-2", user_id: "demo-user-id-3", coins: 50, created_at: "2024-02-11T10:00:00Z" },
  { id: "demo-alloc-4", bet_id: "demo-bet-2", user_id: "demo-user-id-1", coins: 25, created_at: "2024-02-11T11:00:00Z" },
  { id: "demo-alloc-5", bet_id: "demo-bet-3", user_id: "demo-user-id-5", coins: 60, created_at: "2024-02-12T10:00:00Z" },
  { id: "demo-alloc-6", bet_id: "demo-bet-3", user_id: "demo-user-id-4", coins: 30, created_at: "2024-02-12T11:00:00Z" },
];

// Demo Behavior Logs (for BehaviorModule)
export const DEMO_BEHAVIOR_LOGS = [
  {
    id: "demo-behavior-log-1",
    intent_id: "demo-intent-1",
    action_description: "برگزاری جلسه هماهنگی با تیم فروش برای بررسی استراتژی جدید نفوذ به بازار",
    time_spent: 4,
    resources_used: 5,
    notes: "تیم به خوبی همکاری کرد. نیاز به پیگیری هفتگی داریم.",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    deputy_id: "demo-user-id-1"
  },
  {
    id: "demo-behavior-log-2",
    intent_id: "demo-intent-2",
    action_description: "آماده‌سازی گزارش تحلیل رقبا و ارائه به هیئت مدیره",
    time_spent: 8,
    resources_used: 12,
    notes: "گزارش مورد تایید قرار گرفت. نیاز به آپدیت ماهانه.",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    deputy_id: "demo-user-id-1"
  },
  {
    id: "demo-behavior-log-3",
    intent_id: "demo-intent-3",
    action_description: "برنامه‌ریزی و اجرای دوره آموزشی برای کارکنان جدید",
    time_spent: 16,
    resources_used: 25,
    notes: null,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    deputy_id: "demo-user-id-2"
  },
  {
    id: "demo-behavior-log-4",
    intent_id: "demo-intent-1",
    action_description: "مذاکره با تامین‌کننده جدید برای کاهش هزینه‌های تولید",
    time_spent: 6,
    resources_used: 2,
    notes: "توافق اولیه حاصل شد. قرارداد در حال تنظیم است.",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    deputy_id: "demo-user-id-1"
  }
];

// Demo Decision Journals (for DecisionJournal)
export const DEMO_DECISION_JOURNALS = [
  {
    id: "demo-journal-1",
    behavior_id: "demo-behavior-log-1",
    rejected_options: "گزینه اول: استفاده از تبلیغات سنتی - هزینه بالا و بازده نامشخص\nگزینه دوم: همکاری با اینفلوئنسرها - ریسک اعتباری بالا",
    supporting_data: "تحلیل داده‌های فروش ۳ ماه گذشته نشان می‌دهد که کانال‌های دیجیتال ۴۰٪ بازده بیشتری دارند. همچنین نظرسنجی از مشتریان نشان داد ۷۵٪ آن‌ها از طریق شبکه‌های اجتماعی با برند آشنا شده‌اند.",
    risk_prediction: "در صورت عدم موفقیت این استراتژی، می‌توانیم به روش‌های سنتی بازگردیم. حداکثر ضرر مالی ۱۵ میلیون تومان خواهد بود.",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "demo-journal-2",
    behavior_id: "demo-behavior-log-2",
    rejected_options: "گزینه اول: ارائه گزارش ساده بدون تحلیل عمیق\nگزینه دوم: تمرکز فقط بر رقیب اصلی و نادیده گرفتن سایرین",
    supporting_data: "مطالعه ۵ رقیب اصلی و ۱۰ رقیب فرعی انجام شد. داده‌های مالی عمومی، استراتژی‌های بازاریابی و نقاط قوت/ضعف هر کدام تحلیل گردید.",
    risk_prediction: "اگر تحلیل‌ها دقیق نباشد، ممکن است تصمیمات استراتژیک اشتباه گرفته شود. برای کاهش این ریسک، از منابع متعدد استفاده شده است.",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "demo-journal-3",
    behavior_id: "demo-behavior-log-4",
    rejected_options: "گزینه اول: ادامه همکاری با تامین‌کننده فعلی با همان شرایط\nگزینه دوم: تولید داخلی قطعات - نیاز به سرمایه‌گذاری سنگین",
    supporting_data: "۳ تامین‌کننده جدید شناسایی و بررسی شدند. قیمت‌ها، کیفیت نمونه‌ها و شرایط تحویل مقایسه گردید. تامین‌کننده انتخابی ۱۸٪ ارزان‌تر با کیفیت مشابه است.",
    risk_prediction: "ریسک اصلی عدم تحویل به موقع در ماه‌های اول است. برای پوشش این ریسک، موجودی احتیاطی ۲ هفته‌ای نگهداری می‌شود.",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];
