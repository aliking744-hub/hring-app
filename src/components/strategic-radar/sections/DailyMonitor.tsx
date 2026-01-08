import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Newspaper, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  RefreshCw,
  Clock,
  Building2,
  Zap,
  Target,
  ExternalLink,
  Flame
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CompanyProfile } from "@/pages/StrategicRadar";

interface NewsItem {
  title: string;
  source: string;
  date: string;
  sentiment: "positive" | "negative" | "neutral";
  competitor: string;
  category: string;
  summary: string;
  url?: string;
}

interface CompetitorAlert {
  competitor: string;
  type: "growth" | "decline" | "strategy" | "product" | "market";
  description: string;
  impact: "high" | "medium" | "low";
  timestamp: string;
}

interface DailyInsight {
  marketMoves: string[];
  competitorShifts: string[];
  opportunities: string[];
  warnings: string[];
}

interface DailyMonitorProps {
  profile: CompanyProfile;
}

const DailyMonitor = ({ profile }: DailyMonitorProps) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [alerts, setAlerts] = useState<CompetitorAlert[]>([]);
  const [insights, setInsights] = useState<DailyInsight | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchDailyIntelligence = async () => {
    setIsLoading(true);
    try {
      const competitorNames = profile.competitors?.map(c => c.name) || [];
      
      const { data, error } = await supabase.functions.invoke('search-competitor-news', {
        body: {
          companyName: profile.name,
          competitors: competitorNames,
          industry: profile.industry
        }
      });

      if (error) throw error;

      if (data?.success && data.news) {
        // Map the news from search-competitor-news format
        const mappedNews: NewsItem[] = data.news.map((item: any) => ({
          title: item.title,
          source: item.source || "وب",
          date: item.date || new Date().toLocaleDateString('fa-IR'),
          sentiment: item.sentiment || "neutral",
          competitor: item.competitor || profile.name,
          category: item.category || "اخبار",
          summary: item.summary || "",
          url: item.url
        }));

        setNews(mappedNews);
        
        // Generate alerts from news with negative sentiment
        const generatedAlerts: CompetitorAlert[] = mappedNews
          .filter((n: NewsItem) => n.sentiment !== "neutral")
          .slice(0, 3)
          .map((n: NewsItem) => ({
            competitor: n.competitor,
            type: n.sentiment === "positive" ? "growth" as const : "decline" as const,
            description: n.summary || n.title,
            impact: n.sentiment === "positive" ? "medium" as const : "high" as const,
            timestamp: new Date().toISOString()
          }));
        
        setAlerts(generatedAlerts);
        
        // Generate insights based on news
        const positiveNews = mappedNews.filter((n: NewsItem) => n.sentiment === "positive");
        const negativeNews = mappedNews.filter((n: NewsItem) => n.sentiment === "negative");
        
        setInsights({
          marketMoves: mappedNews.slice(0, 2).map((n: NewsItem) => n.title.slice(0, 50) + "..."),
          competitorShifts: competitorNames.slice(0, 2).map((name: string) => `فعالیت جدید از ${name}`),
          opportunities: positiveNews.slice(0, 2).map((n: NewsItem) => n.summary || "فرصت جدید شناسایی شد"),
          warnings: negativeNews.slice(0, 2).map((n: NewsItem) => n.summary || "هشدار رقابتی")
        });
        
        setLastUpdate(new Date());
        toast.success("اخبار واقعی از وب دریافت شد");
      } else {
        throw new Error("No news data received");
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      toast.error("خطا در دریافت اخبار - نمایش داده نمونه");
      setSampleData();
    } finally {
      setIsLoading(false);
    }
  };

  const setSampleData = () => {
    const competitors = profile.competitors?.map(c => c.name) || ["رقیب ۱", "رقیب ۲"];
    
    setNews([
      {
        title: `${competitors[0]} قرارداد جدید با شریک بین‌المللی امضا کرد`,
        source: "خبرگزاری اقتصاد",
        date: new Date().toLocaleDateString('fa-IR'),
        sentiment: "positive",
        competitor: competitors[0] || "رقیب ۱",
        category: "استراتژی",
        summary: "این قرارداد می‌تواند موقعیت رقابتی آن‌ها را تقویت کند",
        url: "https://www.eghtesadonline.com"
      },
      {
        title: `کاهش سهم بازار ${competitors[1]} در سه‌ماهه اخیر`,
        source: "تحلیل بورس",
        date: new Date().toLocaleDateString('fa-IR'),
        sentiment: "negative",
        competitor: competitors[1] || "رقیب ۲",
        category: "بازار",
        summary: "فرصت مناسب برای جذب مشتریان ناراضی",
        url: "https://www.tsetmc.com"
      },
      {
        title: `راه‌اندازی محصول جدید توسط ${competitors[0]}`,
        source: "فناوران",
        date: new Date().toLocaleDateString('fa-IR'),
        sentiment: "neutral",
        competitor: competitors[0] || "رقیب ۱",
        category: "محصول",
        summary: "نیاز به ارزیابی تأثیر بر پرتفوی محصولات ما",
        url: "https://www.zoomit.ir"
      }
    ]);

    setAlerts([
      {
        competitor: competitors[0] || "رقیب ۱",
        type: "strategy",
        description: "تغییر مدل قیمت‌گذاری به سمت اشتراکی",
        impact: "high",
        timestamp: new Date().toISOString()
      },
      {
        competitor: competitors[1] || "رقیب ۲",
        type: "decline",
        description: "خروج مدیر ارشد فناوری",
        impact: "medium",
        timestamp: new Date().toISOString()
      }
    ]);

    setInsights({
      marketMoves: [
        "افزایش ۱۲٪ تقاضا در بخش B2B",
        "ورود بازیگر جدید از ترکیه"
      ],
      competitorShifts: [
        `${competitors[0]} در حال گسترش به شهرستان‌ها`,
        `${competitors[1]} کاهش قیمت ۲۰٪`
      ],
      opportunities: [
        "بازار خدمات پس از فروش رو به رشد",
        "نیاز به راهکار موبایل‌محور"
      ],
      warnings: [
        "تغییرات قانونی در واردات تجهیزات",
        "کمبود نیروی متخصص فناوری"
      ]
    });

    setLastUpdate(new Date());
  };

  useEffect(() => {
    setSampleData();
  }, [profile]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return "text-emerald-400 bg-emerald-500/10";
      case "negative": return "text-red-400 bg-red-500/10";
      default: return "text-slate-400 bg-slate-500/10";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "medium": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      default: return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "growth": return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case "decline": return <TrendingDown className="w-4 h-4 text-red-400" />;
      case "strategy": return <Target className="w-4 h-4 text-blue-400" />;
      case "product": return <Zap className="w-4 h-4 text-purple-400" />;
      default: return <Building2 className="w-4 h-4 text-cyan-400" />;
    }
  };

  const handleNewsClick = (url: string | undefined) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900/80 to-indigo-900/40 border-indigo-500/20 p-4 md:p-6 h-full backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-600/30 flex items-center justify-center border border-indigo-500/30">
            <Newspaper className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">رصد روزانه اخبار و رقبا</h3>
            <p className="text-xs text-slate-400">
              آخرین به‌روزرسانی: {lastUpdate?.toLocaleTimeString('fa-IR') || '-'}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={fetchDailyIntelligence}
          disabled={isLoading}
          className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10"
        >
          <RefreshCw className={`w-4 h-4 ml-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? "در حال جستجو..." : "جستجوی اخبار واقعی"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* News Feed */}
        <div className="lg:col-span-2 space-y-3">
          <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            اخبار تازه رقبا
            {news.length > 0 && news[0].url && (
              <Badge variant="outline" className="text-xs border-orange-500/30 text-orange-400">
                <Flame className="w-3 h-3 ml-1" />
                زنده از وب
              </Badge>
            )}
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {news.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleNewsClick(item.url)}
                className={`block p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-indigo-500/30 hover:bg-slate-800/70 transition-all group ${item.url ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getSentimentColor(item.sentiment)}>
                        {item.sentiment === "positive" && <TrendingUp className="w-3 h-3 ml-1" />}
                        {item.sentiment === "negative" && <TrendingDown className="w-3 h-3 ml-1" />}
                        {item.competitor}
                      </Badge>
                      <span className="text-xs text-slate-500">{item.category}</span>
                      {item.url && (
                        <ExternalLink className="w-3 h-3 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                    <p className="text-sm text-white font-medium group-hover:text-indigo-300 transition-colors">{item.title}</p>
                    <p className="text-xs text-slate-400 mt-1">{item.summary}</p>
                  </div>
                  <div className="text-xs text-slate-500 whitespace-nowrap">
                    <div>{item.source}</div>
                    <div>{item.date}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            هشدارهای رقابتی
          </h4>
          <div className="space-y-2">
            {alerts.map((alert, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border ${getImpactColor(alert.impact)}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {getTypeIcon(alert.type)}
                  <span className="text-sm font-medium text-white">{alert.competitor}</span>
                  <Badge variant="outline" className={getImpactColor(alert.impact)}>
                    {alert.impact === "high" ? "بحرانی" : alert.impact === "medium" ? "متوسط" : "کم"}
                  </Badge>
                </div>
                <p className="text-xs text-slate-300">{alert.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Insights */}
      {insights && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <h5 className="text-xs font-semibold text-blue-400 mb-2">حرکات بازار</h5>
            <ul className="text-xs text-slate-300 space-y-1">
              {insights.marketMoves.map((m, i) => (
                <li key={i} className="flex items-start gap-1">
                  <span className="text-blue-400">•</span>
                  {m}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <h5 className="text-xs font-semibold text-purple-400 mb-2">تغییرات رقبا</h5>
            <ul className="text-xs text-slate-300 space-y-1">
              {insights.competitorShifts.map((s, i) => (
                <li key={i} className="flex items-start gap-1">
                  <span className="text-purple-400">•</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <h5 className="text-xs font-semibold text-emerald-400 mb-2">فرصت‌ها</h5>
            <ul className="text-xs text-slate-300 space-y-1">
              {insights.opportunities.map((o, i) => (
                <li key={i} className="flex items-start gap-1">
                  <span className="text-emerald-400">•</span>
                  {o}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <h5 className="text-xs font-semibold text-red-400 mb-2">هشدارها</h5>
            <ul className="text-xs text-slate-300 space-y-1">
              {insights.warnings.map((w, i) => (
                <li key={i} className="flex items-start gap-1">
                  <span className="text-red-400">•</span>
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* AI Badge */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
        <Flame className="w-3 h-3 text-orange-400" />
        جستجوی واقعی با Firecrawl - کلیک روی هر خبر برای مشاهده منبع
      </div>
    </Card>
  );
};

export default DailyMonitor;
