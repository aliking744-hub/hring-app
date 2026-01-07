const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CompanyIntel {
  name: string;
  ticker: string | null;
  logo: string;
  industry: string;
  sector: string;
  competitors: { name: string; marketShare: number; innovation: number }[];
  revenue: string;
  revenueValue: number;
  cashLiquidity: string;
  technologyLag: number;
  maturityScore: number;
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
      console.error('PERPLEXITY_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Perplexity connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching intel for company:', companyName);

    // Create a comprehensive prompt in Farsi to get company information
    const systemPrompt = `تو یک تحلیلگر ارشد مالی و بورسی هستی که به صورت تخصصی اطلاعات شرکت‌های بورسی ایران را از سایت کدال (codal.ir) و سایت بورس تهران (tsetmc.com) استخراج می‌کنی.

مهم‌ترین وظیفه تو استخراج اطلاعات مالی دقیق از گزارش‌های ۶ ماهه و سالانه در کدال است:
- درآمد عملیاتی / فروش خالص
- سود ناخالص
- سود خالص
- جمع دارایی‌ها
- نقدینگی

خروجی را فقط به صورت JSON بده، بدون هیچ توضیح اضافه. ساختار JSON باید دقیقاً به این شکل باشد:
{
  "name": "نام رسمی شرکت به فارسی",
  "ticker": "نماد بورسی (حتماً پیدا کن)",
  "industry": "صنعت شرکت",
  "sector": "بخش فعالیت",
  "competitors": [
    {"name": "نام رقیب اول در همان صنعت", "marketShare": عدد از 0 تا 100, "innovation": عدد از 0 تا 100},
    {"name": "نام رقیب دوم", "marketShare": عدد از 0 تا 100, "innovation": عدد از 0 تا 100},
    {"name": "نام رقیب سوم", "marketShare": عدد از 0 تا 100, "innovation": عدد از 0 تا 100}
  ],
  "revenue": "درآمد یا فروش خالص از آخرین گزارش مالی به فارسی مثل: ۱۲,۵۰۰ میلیارد ریال (حتماً از کدال استخراج کن)",
  "revenueValue": عدد درآمد به میلیارد ریال (عدد صحیح),
  "cashLiquidity": "وضعیت نقدینگی: healthy/medium/critical با توضیح مختصر",
  "netProfit": "سود خالص از آخرین گزارش",
  "technologyLag": عدد از 0 تا 10,
  "maturityScore": عدد از 0 تا 100
}`;

    const userPrompt = `اطلاعات مالی شرکت "${companyName}" را از منابع زیر استخراج کن:

۱. **کدال (codal.ir)**: حتماً آخرین گزارش صورت‌های مالی ۶ ماهه یا سالانه را بخوان و درآمد عملیاتی/فروش خالص را استخراج کن
۲. **بورس تهران (tsetmc.com)**: نماد بورسی و اطلاعات معاملاتی
۳. **گزارش فعالیت هیئت مدیره**: اطلاعات تکمیلی

نکات مهم:
- درآمد را حتماً از صورت سود و زیان استخراج کن (ردیف درآمدهای عملیاتی یا فروش خالص)
- اگر شرکت بورسی است، اطلاعات مالی حتماً در کدال موجود است
- revenueValue باید عدد باشد (میلیارد ریال)
- اگر اطلاعات دقیق پیدا نشد، بر اساس اندازه شرکت و صنعت تخمین معقول بزن

مثال: اگر فروش خالص ۵۰,۰۰۰,۰۰۰ میلیون ریال باشد، revenueValue برابر با 50000 میلیارد ریال خواهد بود.`;


    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
        max_tokens: 2000,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Perplexity API error:', data);
      return new Response(
        JSON.stringify({ success: false, error: data.error?.message || 'Perplexity API error' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const content = data.choices?.[0]?.message?.content;
    console.log('Perplexity response:', content);

    // Parse JSON from response
    let companyIntel: CompanyIntel;
    try {
      // Extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate and normalize the response
      companyIntel = {
        name: parsed.name || companyName,
        ticker: parsed.ticker || null,
        logo: "🏢", // Default logo, can be enhanced later
        industry: parsed.industry || "نامشخص",
        sector: parsed.sector || "نامشخص",
        competitors: Array.isArray(parsed.competitors) && parsed.competitors.length > 0
          ? parsed.competitors.slice(0, 5).map((c: any) => ({
              name: c.name || "رقیب",
              marketShare: typeof c.marketShare === 'number' ? c.marketShare : 20,
              innovation: typeof c.innovation === 'number' ? c.innovation : 50,
            }))
          : [
              { name: "رقیب ۱", marketShare: 25, innovation: 60 },
              { name: "رقیب ۲", marketShare: 20, innovation: 55 },
              { name: "رقیب ۳", marketShare: 15, innovation: 50 },
            ],
        revenue: parsed.revenue || "نامشخص",
        revenueValue: typeof parsed.revenueValue === 'number' ? parsed.revenueValue : 0,
        cashLiquidity: parsed.cashLiquidity || "نامشخص",
        technologyLag: typeof parsed.technologyLag === 'number' ? Math.min(10, Math.max(0, parsed.technologyLag)) : 5,
        maturityScore: typeof parsed.maturityScore === 'number' ? Math.min(100, Math.max(0, parsed.maturityScore)) : 50,
      };
    } catch (parseError) {
      console.error('Error parsing Perplexity response:', parseError);
      // Return basic info if parsing fails
      companyIntel = {
        name: companyName,
        ticker: null,
        logo: "🏢",
        industry: "نامشخص",
        sector: "نامشخص",
        competitors: [
          { name: "رقیب ۱", marketShare: 25, innovation: 60 },
          { name: "رقیب ۲", marketShare: 20, innovation: 55 },
          { name: "رقیب ۳", marketShare: 15, innovation: 50 },
        ],
        revenue: "نامشخص",
        revenueValue: 0,
        cashLiquidity: "نامشخص",
        technologyLag: 5,
        maturityScore: 50,
      };
    }

    console.log('Processed company intel:', companyIntel);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: companyIntel,
        citations: data.citations || []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error fetching company intel:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
