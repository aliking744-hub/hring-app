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

    // Fetch behaviors with related data
    const { data: behaviors, error: behaviorsError } = await supabase
      .from("behaviors")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (behaviorsError) {
      console.error("Error fetching behaviors:", behaviorsError);
      throw new Error("Failed to fetch behaviors");
    }

    // Fetch intents
    const { data: intents } = await supabase
      .from("strategic_intents")
      .select("*");

    // Fetch scenario responses
    const { data: scenarioResponses } = await supabase
      .from("scenario_responses")
      .select("*, scenarios(question, ceo_answer, category)");

    // Fetch profiles
    const deputyIds = [...new Set(behaviors?.map(b => b.deputy_id) || [])];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", deputyIds);

    const profilesMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

    // Prepare data for AI analysis
    const analysisData = {
      behaviors: behaviors?.map(b => ({
        deputy: profilesMap.get(b.deputy_id) || "معاون",
        deputy_id: b.deputy_id,
        action: b.action_description,
        alignment_score: b.alignment_score,
        result_score: b.result_score,
        time_spent: b.time_spent,
        resources_used: b.resources_used,
        intent: intents?.find(i => i.id === b.intent_id)?.title || "نامشخص",
        intent_weight: intents?.find(i => i.id === b.intent_id)?.strategic_weight || 5,
        date: b.created_at
      })),
      scenarioMismatches: scenarioResponses?.filter(sr => {
        const scenario = sr.scenarios as any;
        return scenario?.ceo_answer && sr.answer !== scenario.ceo_answer;
      }).map(sr => ({
        deputy_id: sr.user_id,
        deputy: profilesMap.get(sr.user_id) || "معاون",
        question: (sr.scenarios as any)?.question,
        category: (sr.scenarios as any)?.category,
        ceoAnswer: (sr.scenarios as any)?.ceo_answer,
        deputyAnswer: sr.answer
      }))
    };

    console.log("Analysis data prepared:", JSON.stringify(analysisData).substring(0, 500));

    const systemPrompt = `تو یک تحلیلگر هوشمند سازمانی هستی که الگوهای رفتاری معاونین را بررسی می‌کنی.
بر اساس داده‌های ارائه شده، هشدارهای مدیریتی تولید کن.

قوانین تحلیل:
1. اگر یک معاون در چند تصمیم اخیر انحراف داشته (alignment_score کم)، هشدار بده
2. اگر پاسخ‌های سناریو با مدیرعامل متفاوت است، نوع انحراف را شناسایی کن
3. اگر منابع زیادی برای کارهای کم‌اهمیت صرف شده، هشدار بده
4. الگوهای رفتاری را شناسایی کن (مقاومت در برابر تغییر، ریسک‌پذیری بیش از حد، و غیره)

خروجی باید به صورت JSON باشد با ساختار زیر:
{
  "warnings": [
    {
      "level": "red" | "yellow" | "green",
      "deputy": "نام معاون",
      "deputy_id": "آیدی",
      "title": "عنوان کوتاه هشدار",
      "description": "توضیح کامل مشکل و پیشنهاد اقدام",
      "pattern": "نوع الگوی شناسایی شده",
      "deviation_percentage": عدد بین 0 تا 100
    }
  ],
  "summary": "خلاصه وضعیت کلی سازمان"
}

فقط JSON برگردان، بدون هیچ متن اضافی.`;

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
        return new Response(JSON.stringify({ 
          error: "محدودیت درخواست - لطفاً کمی صبر کنید" 
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "اعتبار AI تمام شده - لطفاً اعتبار اضافه کنید" 
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "{}";
    
    console.log("AI response:", content.substring(0, 500));

    // Parse JSON from response
    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        result = { warnings: [], summary: "داده‌ای برای تحلیل وجود ندارد" };
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      result = { warnings: [], summary: "خطا در پردازش نتایج" };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in analyze-compass-deviations:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "خطای ناشناخته" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
