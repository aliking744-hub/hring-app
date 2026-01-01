import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, sessionId, userId } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch system prompt and phone from settings
    const { data: settings } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['support_system_prompt', 'support_phone']);

    const settingsMap: Record<string, string> = {};
    settings?.forEach(s => {
      if (s.key && s.value) settingsMap[s.key] = s.value;
    });

    const supportPhone = settingsMap['support_phone'] || '09123456789';
    let systemPrompt = settingsMap['support_system_prompt'] || 
      `تو یک دستیار پشتیبانی فوق‌العاده مودب، فروتن و صمیمی هستی که به زبان فارسی عامیانه ولی بسیار محترمانه صحبت می‌کنی. همیشه پاسخت رو با یک عذرخواهی بابت معطل شدن یا تشکر گرم شروع کن. فقط و فقط در مورد: نحوه استفاده از سایت، امکانات داشبورد، پلن‌های قیمت‌گذاری و راهنمای خرید پاسخ بده. اگر کسی در مورد "مشاوره حقوقی" یا "قانون کار" سوال کرد، مودبانه عذرخواهی کن و بگو: "شرمنده‌تونم، سواد من به این چیزا نمی‌رسه. برای راهنمایی دقیق و تخصصی لطفاً از بخش وکیل جیبی داخل پنل استفاده کنید." اگر موضوع نامربوط بود یا گیج شدی بگو: "قربان باز هم عذر میخوام، برای اینکه معطل نشید پیشنهاد میکنم مستقیم با مدیریت صحبت کنید: {SUPPORT_PHONE}"`;

    // Replace placeholder with actual phone
    systemPrompt = systemPrompt.replace(/{SUPPORT_PHONE}/g, supportPhone);

    console.log("Processing chat request for session:", sessionId);

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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "تعداد درخواست‌ها زیاد است، لطفاً کمی صبر کنید." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "اعتبار سرویس تمام شده است." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "خطا در پردازش درخواست" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log the chat to database (async, don't wait)
    const logChat = async (assistantResponse: string) => {
      try {
        const allMessages = [
          ...messages,
          { role: 'assistant', content: assistantResponse }
        ];

        // Check if session exists
        const { data: existing } = await supabase
          .from('support_chat_logs')
          .select('id, messages')
          .eq('session_id', sessionId)
          .single();

        if (existing) {
          // Update existing
          await supabase
            .from('support_chat_logs')
            .update({ 
              messages: allMessages,
              user_id: userId || null 
            })
            .eq('id', existing.id);
        } else {
          // Create new
          await supabase
            .from('support_chat_logs')
            .insert({
              session_id: sessionId,
              user_id: userId || null,
              messages: allMessages
            });
        }
      } catch (err) {
        console.error("Error logging chat:", err);
      }
    };

    // Create a transform stream to capture the response for logging
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    let fullResponse = "";

    // Process the stream
    (async () => {
      const reader = response.body!.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const text = decoder.decode(value, { stream: true });
          
          // Parse SSE to extract content for logging
          const lines = text.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const json = JSON.parse(line.slice(6));
                const content = json.choices?.[0]?.delta?.content;
                if (content) fullResponse += content;
              } catch {}
            }
          }
          
          await writer.write(value);
        }
      } finally {
        writer.close();
        // Log after stream is complete
        if (fullResponse) {
          logChat(fullResponse);
        }
      }
    })();

    return new Response(readable, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("hring-support error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
