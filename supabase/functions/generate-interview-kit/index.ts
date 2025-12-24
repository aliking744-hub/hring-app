import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobTitle, industry, seniorityLevel, focusArea } = await req.json();

    console.log("Generating interview kit for:", { jobTitle, industry, seniorityLevel, focusArea });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const seniorityLabels: Record<string, string> = {
      junior: "کارشناس (Junior)",
      senior: "کارشناس ارشد (Senior)",
      lead: "سرپرست (Lead)",
      manager: "مدیر (Manager)",
    };

    const focusLabels: Record<string, string> = {
      general: "عمومی",
      technical: "تخصصی و فنی",
      leadership: "رهبری و مدیریت",
      cultural: "تناسب فرهنگی",
    };

    const systemPrompt = `تو یک مصاحبه‌کننده حرفه‌ای و متخصص منابع انسانی هستی. وظیفه تو تولید سوالات هوشمند و تیز مصاحبه است که توانایی واقعی داوطلب را آشکار کند.

قوانین مهم:
- هرگز سوالات کلیشه‌ای مثل "درباره خودتان بگویید" نپرس
- سوالات باید عمیق، چالش‌برانگیز و مرتبط با شغل باشند
- کلید ارزیابی باید آموزشی و تحلیلی باشد
- برای سوالات رفتاری از متد STAR استفاده کن
- زبان: فارسی`;

    const userPrompt = `برای موقعیت شغلی زیر یک راهنمای مصاحبه جامع تولید کن:

📋 عنوان شغل: ${jobTitle}
📊 سطح ارشدیت: ${seniorityLabels[seniorityLevel] || seniorityLevel}
${industry ? `🏭 صنعت: ${industry}` : ""}
🎯 تمرکز مصاحبه: ${focusLabels[focusArea] || "عمومی"}

لطفاً این بخش‌ها را تولید کن:

**بخش ۱: سوالات تخصصی و فنی (۴ سوال)**
- سوالات عمیق فنی مرتبط با ${jobTitle}

**بخش ۲: سوالات رفتاری و مهارت‌های نرم (۳ سوال)**
- از متد STAR استفاده کن

**بخش ۳: سوالات هوش و حل مسئله (۲ سوال)**
- یک سناریو یا معمای منطقی مرتبط با شغل

**بخش ۴: سوالات صنعت و تناسب فرهنگی (۲ سوال)**
${industry ? `- سوالات درباره ترندها و چالش‌های صنعت ${industry}` : "- سوالات درباره درک بازار و صنعت"}

${focusArea === "technical" ? "⚠️ تأکید بیشتر روی سوالات تخصصی و فنی" : ""}
${focusArea === "leadership" ? "⚠️ تأکید بیشتر روی سوالات رهبری و مدیریت" : ""}
${focusArea === "cultural" ? "⚠️ تأکید بیشتر روی تناسب فرهنگی" : ""}`;

    console.log("Calling Lovable AI with tool calling...");

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
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_interview_questions",
              description: "تولید سوالات مصاحبه با کلید ارزیابی",
              parameters: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string", description: "شناسه یکتا مثل technical-1" },
                        section: { type: "string", description: "نام بخش فارسی" },
                        sectionIcon: {
                          type: "string",
                          enum: ["technical", "behavioral", "intelligence", "cultural"],
                          description: "نوع آیکون بخش"
                        },
                        question: { type: "string", description: "متن کامل سوال" },
                        goodSigns: {
                          type: "array",
                          items: { type: "string" },
                          description: "نشانه‌های مثبت در پاسخ داوطلب"
                        },
                        redFlags: {
                          type: "array",
                          items: { type: "string" },
                          description: "هشدارها و پاسخ‌های اشتباه"
                        }
                      },
                      required: ["id", "section", "sectionIcon", "question", "goodSigns", "redFlags"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["questions"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_interview_questions" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "سرویس موقتاً در دسترس نیست. لطفاً کمی صبر کنید." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "اعتبار سرویس به پایان رسیده است." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log("AI Response received");

    // Extract tool call arguments
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "generate_interview_questions") {
      throw new Error("No valid tool call in AI response");
    }

    const parsedData = JSON.parse(toolCall.function.arguments);
    console.log("Successfully parsed interview kit with", parsedData.questions?.length, "questions");

    return new Response(
      JSON.stringify(parsedData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in generate-interview-kit:", error);
    const errorMessage = error instanceof Error ? error.message : "خطا در تولید راهنمای مصاحبه";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
