import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY") ?? "";

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      console.error("Missing backend env vars");
      return json(500, { error: "Backend not configured" });
    }

    if (!lovableApiKey) {
      console.error("LOVABLE_API_KEY is not configured");
      return json(500, { error: "AI service not configured" });
    }

    // Manual auth
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

    if (!token) {
      return json(401, { error: "Missing Authorization token" });
    }

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);

    if (userError || !userData?.user) {
      console.error("Invalid token", userError);
      return json(401, { error: "Invalid JWT" });
    }

    const caller = userData.user;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: isCeo, error: isCeoError } = await supabaseAdmin.rpc("is_ceo", {
      _user_id: caller.id,
    });

    if (isCeoError) {
      console.error("is_ceo rpc error", isCeoError);
      return json(500, { error: "Role check failed" });
    }

    if (!isCeo) {
      return json(403, { error: "Access denied" });
    }

    const { intentId } = await req.json();

    if (!intentId) {
      return json(400, { error: "Intent ID is required" });
    }

    // Fetch the strategic intent
    const { data: intent, error: intentError } = await supabaseAdmin
      .from("strategic_intents")
      .select("id, title, description, strategic_weight, tolerance_zone")
      .eq("id", intentId)
      .maybeSingle();

    if (intentError || !intent) {
      console.error("Intent fetch error:", intentError);
      return json(404, { error: "Intent not found" });
    }

    console.log("Generating scenarios for intent:", intent.title);

    const systemPrompt = `شما یک متخصص در طراحی سوالات قضاوت موقعیتی (Situational Judgment Test) هستید.
بر اساس دستور استراتژیک زیر، 3 سوال سناریویی طراحی کنید که همسویی کارمندان با این دستور را بسنجد.

دستور استراتژیک:
عنوان: ${intent.title}
توضیحات: ${intent.description}
وزن استراتژیک: ${intent.strategic_weight}/10
حد تحمل انحراف: ${intent.tolerance_zone}/10

قوانین مهم:
1. هر سوال باید یک موقعیت واقعی کاری را شبیه‌سازی کند
2. هر سوال باید 3 گزینه داشته باشد (الف=a، ب=b، ج=c)
3. یک گزینه باید کاملاً همسو با دستور باشد (پاسخ صحیح)
4. یک گزینه باید انحراف جزئی داشته باشد
5. یک گزینه باید انحراف کامل از دستور باشد
6. حتماً فیلد "correct_answer" را با یکی از مقادیر "a" یا "b" یا "c" مشخص کنید

پاسخ را دقیقاً در فرمت JSON زیر برگردانید:
{
  "scenarios": [
    {
      "question": "متن سوال",
      "option_a": "گزینه الف",
      "option_b": "گزینه ب",
      "option_c": "گزینه ج",
      "correct_answer": "a"
    }
  ]
}`;

    const userPrompt = `لطفاً 3 سوال سناریویی برای سنجش همسویی با دستور استراتژیک "${intent.title}" طراحی کنید. حتماً برای هر سوال مشخص کنید کدام گزینه (a, b یا c) پاسخ صحیح است.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) return json(429, { error: "محدودیت درخواست. لطفاً کمی صبر کنید." });
      if (response.status === 402) return json(402, { error: "اعتبار کافی نیست." });

      return json(500, { error: "خطا در سرویس هوش مصنوعی" });
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content as string | undefined;

    if (!content) {
      return json(500, { error: "پاسخ خالی از هوش مصنوعی" });
    }

    // Parse JSON from the response
    let scenarios: unknown;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in response");
      const parsed = JSON.parse(jsonMatch[0]);
      scenarios = parsed.scenarios;
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      return json(500, { error: "خطا در پردازش پاسخ هوش مصنوعی" });
    }

    // Ensure each scenario has correct_answer
    const validatedScenarios = (scenarios as any[]).map((s) => ({
      question: s.question || "",
      option_a: s.option_a || "",
      option_b: s.option_b || "",
      option_c: s.option_c || "",
      correct_answer: s.correct_answer || "b",
    }));

    if (validatedScenarios.length === 0) {
      return json(500, { error: "سناریویی تولید نشد" });
    }

    console.log(`Successfully generated ${validatedScenarios.length} scenarios`);
    return json(200, { scenarios: validatedScenarios, intent });
  } catch (error) {
    console.error("Error in generate-compass-scenarios:", error);
    return json(500, { error: error instanceof Error ? error.message : "Unknown error" });
  }
});
