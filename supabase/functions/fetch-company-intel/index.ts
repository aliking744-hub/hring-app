const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ResearchResult {
  query: string;
  findings: string;
  citations: string[];
}

interface CompanyIntel {
  name: string;
  ticker: string | null;
  logo: string;
  industry: string;
  sector: string;
  competitors: { name: string; marketShare: number; innovation: number; source: string }[];
  revenue: string;
  revenueValue: number;
  revenueSource: string;
  cashLiquidity: string;
  technologyLag: number;
  maturityScore: number;
  maturitySource: string;
  subscriberCount: string;
  subscriberSource: string;
  marketShare: number;
  marketShareSource: string;
  recentNews: { title: string; source: string }[];
  dataQuality: 'high' | 'medium' | 'low';
  isEstimate: boolean;
}

// Helper function to perform a single research query
async function performSearch(apiKey: string, query: string): Promise<ResearchResult> {
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          { 
            role: 'system', 
            content: `تو یک محقق هستی که فقط اطلاعات واقعی و قابل استناد را گزارش می‌دهی.
اگر اطلاعات دقیق پیدا نکردی، صراحتاً بگو "اطلاعات دقیق پیدا نشد".
هرگز اطلاعات جعلی نده. هر عدد یا ادعایی باید منبع داشته باشد.
پاسخ را کوتاه و مختصر بده (حداکثر ۳ جمله).` 
          },
          { role: 'user', content: query }
        ],
        temperature: 0.1,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      console.error(`Search failed for query: ${query}`);
      return { query, findings: 'خطا در جستجو', citations: [] };
    }

    const data = await response.json();
    return {
      query,
      findings: data.choices?.[0]?.message?.content || 'نتیجه‌ای یافت نشد',
      citations: data.citations || [],
    };
  } catch (error) {
    console.error(`Error in search: ${query}`, error);
    return { query, findings: 'خطا در اتصال', citations: [] };
  }
}

// The Analyst Agent: Synthesize all research into structured data
async function synthesizeIntel(
  apiKey: string, 
  companyName: string, 
  researchResults: ResearchResult[]
): Promise<CompanyIntel> {
  
  const researchSummary = researchResults.map(r => 
    `### جستجو: ${r.query}\n${r.findings}\nمنابع: ${r.citations.slice(0, 2).join(', ') || 'بدون منبع'}`
  ).join('\n\n');

  const systemPrompt = `تو یک تحلیلگر ارشد هستی که بر اساس نتایج جستجو، اطلاعات را استخراج و تحلیل می‌کنی.

قوانین مهم:
1. فقط از اطلاعاتی استفاده کن که در نتایج جستجو موجود است
2. اگر اطلاعاتی موجود نیست، مقدار "نامشخص" یا عدد 0 بده
3. اگر تخمین می‌زنی، حتماً در فیلد source بنویس "تخمین AI"
4. برای هر عدد مهم، منبع را ذکر کن

خروجی را فقط به صورت JSON بده:
{
  "name": "نام رسمی شرکت",
  "ticker": "نماد بورسی یا null",
  "industry": "صنعت",
  "sector": "بخش",
  "competitors": [
    {"name": "رقیب واقعی در همان صنعت", "marketShare": عدد یا 0, "innovation": عدد یا 50, "source": "منبع"}
  ],
  "revenue": "درآمد به فارسی",
  "revenueValue": عدد میلیارد ریال یا 0,
  "revenueSource": "منبع اطلاعات درآمد",
  "cashLiquidity": "وضعیت مالی",
  "subscriberCount": "تعداد مشترک/مشتری",
  "subscriberSource": "منبع",
  "marketShare": عدد درصد سهم بازار یا 0,
  "marketShareSource": "منبع",
  "technologyLag": عدد 0-10,
  "maturityScore": عدد 0-100,
  "maturitySource": "توضیح چرا این امتیاز",
  "recentNews": [{"title": "عنوان خبر", "source": "منبع"}],
  "dataQuality": "high/medium/low",
  "isEstimate": true/false
}`;

  const userPrompt = `بر اساس نتایج جستجوی زیر، اطلاعات شرکت "${companyName}" را استخراج کن:

${researchSummary}

نکات مهم:
- رقبا باید شرکت‌های همان صنعت باشند (نه بانک برای اپراتور!)
- اگر درآمد دقیق نیست و تعداد مشترک داری، می‌توانی تخمین بزنی: مشترکین × ARPU متوسط صنعت
- اگر سهم بازار مستقیم نیست، از مقایسه‌ها استخراج کن
- dataQuality بر اساس تعداد منابع معتبر پیدا شده`;

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error('Synthesis API failed');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    const jsonMatch = content?.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON in synthesis response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      name: parsed.name || companyName,
      ticker: parsed.ticker || null,
      logo: "🏢",
      industry: parsed.industry || "نامشخص",
      sector: parsed.sector || "نامشخص",
      competitors: Array.isArray(parsed.competitors) ? parsed.competitors.slice(0, 5) : [],
      revenue: parsed.revenue || "نامشخص",
      revenueValue: parsed.revenueValue || 0,
      revenueSource: parsed.revenueSource || "نامشخص",
      cashLiquidity: parsed.cashLiquidity || "نامشخص",
      technologyLag: parsed.technologyLag || 5,
      maturityScore: parsed.maturityScore || 50,
      maturitySource: parsed.maturitySource || "نامشخص",
      subscriberCount: parsed.subscriberCount || "نامشخص",
      subscriberSource: parsed.subscriberSource || "نامشخص",
      marketShare: parsed.marketShare || 0,
      marketShareSource: parsed.marketShareSource || "نامشخص",
      recentNews: Array.isArray(parsed.recentNews) ? parsed.recentNews.slice(0, 5) : [],
      dataQuality: parsed.dataQuality || 'low',
      isEstimate: parsed.isEstimate ?? true,
    };
  } catch (error) {
    console.error('Synthesis error:', error);
    return {
      name: companyName,
      ticker: null,
      logo: "🏢",
      industry: "نامشخص",
      sector: "نامشخص",
      competitors: [],
      revenue: "نامشخص",
      revenueValue: 0,
      revenueSource: "خطا در تحلیل",
      cashLiquidity: "نامشخص",
      technologyLag: 5,
      maturityScore: 50,
      maturitySource: "خطا در تحلیل",
      subscriberCount: "نامشخص",
      subscriberSource: "خطا در تحلیل",
      marketShare: 0,
      marketShareSource: "خطا در تحلیل",
      recentNews: [],
      dataQuality: 'low',
      isEstimate: true,
    };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyName } = await req.json();

    if (!companyName) {
      return new Response(
        JSON.stringify({ success: false, error: 'Company name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Perplexity connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔍 Starting Agentic Research for:', companyName);
    const startTime = Date.now();

    // PHASE 1: The "Hunter" Agent - Perform targeted searches
    const searchQueries = [
      `"${companyName}" درآمد فروش صورت مالی کدال ۱۴۰۳ ۱۴۰۲`,
      `"${companyName}" تعداد مشترکین کاربران فعال ۱۴۰۳`,
      `"${companyName}" سهم بازار رتبه در صنعت رقابت`,
      `"${companyName}" اخبار جدید سرمایه گذاری توسعه ۱۴۰۳`,
      `رقبای "${companyName}" مقایسه شرکت‌های مشابه در ایران`,
    ];

    console.log('🕵️ Hunter Agent: Running', searchQueries.length, 'searches...');
    
    // Run all searches in parallel
    const searchResults = await Promise.all(
      searchQueries.map(query => performSearch(apiKey, query))
    );

    console.log('📊 Search results received:', searchResults.map(r => ({
      query: r.query.substring(0, 30) + '...',
      hasFindings: r.findings !== 'خطا در جستجو',
      citationCount: r.citations.length
    })));

    // PHASE 2: The "Analyst" Agent - Synthesize all findings
    console.log('🧠 Analyst Agent: Synthesizing data...');
    const companyIntel = await synthesizeIntel(apiKey, companyName, searchResults);

    const duration = Date.now() - startTime;
    console.log(`✅ Research complete in ${duration}ms. Data quality: ${companyIntel.dataQuality}`);

    // Collect all citations
    const allCitations = [...new Set(searchResults.flatMap(r => r.citations))];

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: companyIntel,
        citations: allCitations,
        researchMeta: {
          queriesRun: searchQueries.length,
          sourcesFound: allCitations.length,
          processingTimeMs: duration,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in agentic research:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Research failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
