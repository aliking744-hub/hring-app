const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CompetitorAnalysis {
  name: string;
  status: "winning" | "losing" | "stable";
  reason: string;
  strengths: string[];
  weaknesses: string[];
  marketPosition: string;
  recentNews: string[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { competitorName, industry, userCompanyName } = await req.json();

    if (!competitorName) {
      return new Response(
        JSON.stringify({ success: false, error: 'Competitor name is required' }),
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

    console.log('Analyzing competitor:', competitorName, 'in industry:', industry);

    const systemPrompt = `تو یک تحلیلگر رقابتی هستی که اطلاعات شرکت‌های ایرانی را تحلیل می‌کنی.

خروجی را فقط به صورت JSON بده، بدون هیچ توضیح اضافه. ساختار JSON باید دقیقاً به این شکل باشد:
{
  "name": "نام شرکت",
  "status": "winning" یا "losing" یا "stable",
  "reason": "دلیل وضعیت فعلی شرکت در یک جمله",
  "strengths": ["نقطه قوت ۱", "نقطه قوت ۲", "نقطه قوت ۳"],
  "weaknesses": ["نقطه ضعف ۱", "نقطه ضعف ۲", "نقطه ضعف ۳"],
  "marketPosition": "توضیح مختصر جایگاه در بازار",
  "recentNews": ["خبر اخیر ۱", "خبر اخیر ۲"]
}

معیار تعیین status:
- winning: اگر شرکت در حال رشد سهم بازار یا سودآوری است
- losing: اگر شرکت در حال از دست دادن سهم بازار یا زیان‌ده است
- stable: اگر وضعیت شرکت نسبتاً ثابت است`;

    const userPrompt = `شرکت "${competitorName}" که رقیب "${userCompanyName || 'شرکت مورد نظر'}" در صنعت "${industry || 'نامشخص'}" است را تحلیل کن.

اطلاعات را از منابع زیر استخراج کن:
1. سایت کدال (codal.ir) برای گزارش‌های مالی
2. سایت بورس تهران (tsetmc.com)
3. خبرگزاری‌های اقتصادی ایران
4. سایت رسمی شرکت
5. شبکه‌های اجتماعی و رسانه‌ها

لطفاً تحلیل واقعی و به‌روز ارائه بده با نقاط قوت و ضعف مشخص.`;

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
        max_tokens: 1500,
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

    let analysis: CompetitorAnalysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      analysis = {
        name: parsed.name || competitorName,
        status: ["winning", "losing", "stable"].includes(parsed.status) ? parsed.status : "stable",
        reason: parsed.reason || "تحلیل در حال بررسی است",
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 5) : ["نقطه قوت نامشخص"],
        weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.slice(0, 5) : ["نقطه ضعف نامشخص"],
        marketPosition: parsed.marketPosition || "جایگاه در حال بررسی",
        recentNews: Array.isArray(parsed.recentNews) ? parsed.recentNews.slice(0, 3) : [],
      };
    } catch (parseError) {
      console.error('Error parsing Perplexity response:', parseError);
      analysis = {
        name: competitorName,
        status: "stable",
        reason: "اطلاعات در حال جمع‌آوری است",
        strengths: ["نیاز به بررسی بیشتر"],
        weaknesses: ["نیاز به بررسی بیشتر"],
        marketPosition: "نامشخص",
        recentNews: [],
      };
    }

    console.log('Processed competitor analysis:', analysis);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: analysis,
        citations: data.citations || []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error analyzing competitor:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
