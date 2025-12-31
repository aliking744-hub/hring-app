import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Fetch strategic intents
    const { data: intents } = await supabase
      .from("strategic_intents")
      .select("*")
      .eq("status", "active");

    // Fetch recent behaviors
    const { data: behaviors } = await supabase
      .from("behaviors")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30);

    // Fetch profiles
    const deputyIds = [...new Set(behaviors?.map(b => b.deputy_id) || [])];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", deputyIds);

    const profilesMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

    // Prepare data for AI analysis
    const analysisData = {
      intents: intents?.map(i => ({
        id: i.id,
        title: i.title,
        description: i.description,
        strategic_weight: i.strategic_weight,
        tolerance_zone: i.tolerance_zone
      })),
      behaviors: behaviors?.map(b => ({
        deputy: profilesMap.get(b.deputy_id) || "معاون",
        deputy_id: b.deputy_id,
        intent_id: b.intent_id,
        intent_title: intents?.find(i => i.id === b.intent_id)?.title,
        action: b.action_description,
        notes: b.notes
      }))
    };

    console.log("Translation risk analysis data:", JSON.stringify(analysisData).substring(0, 500));

    const systemPrompt = `تو یک تحلیلگر هوشمند هستی که سوءتفاهم در درک دستورات مدیرعامل را شناسایی می‌کنی.

وظیفه: بررسی کن آیا معاونین دستورات استراتژیک را درست فهمیده‌اند یا نه.

داده‌های ورودی:
- intents: دستورات اصلی مدیرعامل
- behaviors: اقداماتی که معاونین انجام داده‌اند

بررسی کن:
1. آیا اقدام انجام شده با نیت اصلی دستور همخوانی دارد؟
2. آیا معاون دستور را اشتباه تفسیر کرده؟
3. چه نوع سوءتفاهمی رخ داده؟ (مثلاً: "تعدیل نیرو" به جای "اخراج" فهمیده شده)

خروجی JSON:
{
  "translation_risks": [
    {
      "intent_title": "عنوان دستور اصلی",
      "deputy": "نام معاون",
      "deputy_id": "آیدی",
      "original_meaning": "منظور اصلی مدیرعامل",
      "interpreted_as": "چگونه معاون فهمیده",
      "risk_level": "high" | "medium" | "low",
      "affected_deputies_count": تعداد افراد با این سوءتفاهم,
      "recommendation": "پیشنهاد اقدام"
    }
  ],
  "overall_clarity_score": عدد 0-100 (میزان شفافیت ارتباطات),
  "summary": "خلاصه یک جمله‌ای وضعیت"
}

فقط JSON برگردان.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify(analysisData) }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "محدودیت درخواست" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "اعتبار تمام شده" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "{}";
    
    console.log("Translation risk AI response:", content.substring(0, 500));

    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        result = { translation_risks: [], overall_clarity_score: 100, summary: "داده‌ای برای تحلیل وجود ندارد" };
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      result = { translation_risks: [], overall_clarity_score: 0, summary: "خطا در پردازش" };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in compass-translation-risk:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "خطای ناشناخته" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
