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
    const { jobTitle, seniorityLevel, mainExpectation, buddyRole } = await req.json();

    console.log("Generating onboarding plan for:", { jobTitle, seniorityLevel, mainExpectation, buddyRole });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const seniorityLabels: Record<string, string> = {
      junior: "کارشناس (Junior)",
      senior: "کارشناس ارشد (Senior)",
      manager: "مدیر (Manager)",
      exec: "مدیر ارشد (Executive)",
    };

    const expectationLabels: Record<string, string> = {
      fast_learning: "یادگیری سریع",
      immediate_output: "خروجی فوری",
      cultural_leadership: "رهبری فرهنگی",
      process_reform: "اصلاح فرآیندها",
    };

    const systemPrompt = `تو یک متخصص آنبوردینگ و توسعه منابع انسانی هستی. وظیفه تو طراحی یک نقشه راه ۹۰ روزه برای موفقیت نیروی جدید است.

نکات مهم:
- برنامه باید واقع‌گرایانه و قابل اجرا باشد
- هر ماه باید اهداف مشخص و قابل اندازه‌گیری داشته باشد
- انتظارات باید متناسب با سطح ارشدیت باشد
- ایمیل خوش‌آمدگویی باید گرم، حرفه‌ای و انگیزه‌بخش باشد`;

    const userPrompt = `برای موقعیت شغلی زیر یک نقشه راه ۹۰ روزه طراحی کن:

عنوان شغل: ${jobTitle}
سطح ارشدیت: ${seniorityLabels[seniorityLevel] || seniorityLevel}
انتظار اصلی: ${expectationLabels[mainExpectation] || mainExpectation}
${buddyRole ? `منتور/همراه: ${buddyRole}` : ""}

نقشه راه را در ۳ ماه طراحی کن:
- ماه اول: فاز یادگیری و همسو شدن (The Sponge Phase)
- ماه دوم: فاز مشارکت و بردهای کوچک (The Contributor Phase)
- ماه سوم: فاز عملکرد کامل و استقلال (The Performer Phase)

همچنین یک ایمیل خوش‌آمدگویی بنویس که مدیر می‌تواند قبل از روز اول برای نیروی جدید ارسال کند.`;

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
              name: "generate_onboarding_plan",
              description: "Generate a structured 90-day onboarding plan with welcome email",
              parameters: {
                type: "object",
                properties: {
                  months: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        month: { type: "number", description: "Month number (1, 2, or 3)" },
                        title: { type: "string", description: "Persian title for the month, e.g., ماه اول: یادگیری و همسو شدن" },
                        subtitle: { type: "string", description: "Short Persian subtitle describing the phase" },
                        color: { type: "string", enum: ["blue", "purple", "green"], description: "Color for the month: blue for month 1, purple for month 2, green for month 3" },
                        focus: { type: "string", description: "Main focus area in Persian" },
                        deliverable: { type: "string", description: "Expected deliverable in Persian" },
                        tasks: {
                          type: "array",
                          items: { type: "string" },
                          description: "4-6 key tasks in Persian",
                        },
                        milestones: {
                          type: "array",
                          items: { type: "string" },
                          description: "2-3 milestones to achieve in Persian",
                        },
                      },
                      required: ["month", "title", "subtitle", "color", "focus", "deliverable", "tasks", "milestones"],
                    },
                  },
                  welcomeEmail: {
                    type: "string",
                    description: "A warm, professional welcome email in Persian that the manager can send before day 1. Should briefly outline the 90-day plan and express excitement.",
                  },
                },
                required: ["months", "welcomeEmail"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_onboarding_plan" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response:", JSON.stringify(data, null, 2));

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "generate_onboarding_plan") {
      throw new Error("No valid tool call in response");
    }

    const plan = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ plan }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in generate-onboarding-plan:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
