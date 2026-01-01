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
    const { query } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Legal advisor query: "${query}"`);

    // Generate embedding for the query
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const embeddingResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'models/text-embedding-004',
          content: {
            parts: [{ text: query }]
          }
        }),
      }
    );

    if (!embeddingResponse.ok) {
      const errorText = await embeddingResponse.text();
      console.error('Embedding API error:', errorText);
      throw new Error('Failed to generate query embedding');
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.embedding?.values;

    if (!queryEmbedding) {
      throw new Error('No embedding returned from API');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Search for relevant legal documents
    const { data: results, error } = await supabase.rpc('search_legal_docs', {
      query_embedding: queryEmbedding,
      match_threshold: 0.3,
      match_count: 5,
      filter_category: null
    });

    if (error) {
      console.error('Search error:', error);
      throw new Error(`Search failed: ${error.message}`);
    }

    console.log(`Found ${results?.length || 0} relevant documents`);

    // Build context from search results
    let context = '';
    if (results && results.length > 0) {
      context = results.map((r: any, i: number) => {
        const articleInfo = r.article_number ? `ماده ${r.article_number}` : '';
        return `[${i + 1}] ${articleInfo}\n${r.content.slice(0, 1500)}`;
      }).join('\n\n---\n\n');
    }

    // Generate answer using Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `شما یک مشاور حقوقی متخصص در قوانین کار ایران هستید. بر اساس متون قانونی ارائه شده، به سوالات کاربران پاسخ دهید.

قوانین پاسخگویی:
1. فقط بر اساس متون قانونی ارائه شده پاسخ دهید
2. اگر اطلاعات کافی در متون نیست، صادقانه بگویید
3. شماره ماده قانونی را ذکر کنید
4. پاسخ را ساده و قابل فهم بنویسید
5. اگر موضوع پیچیده است، توصیه به مشاوره با وکیل کنید`;

    const userPrompt = context 
      ? `متون قانونی مرتبط:\n\n${context}\n\n---\n\nسوال کاربر: ${query}`
      : `سوال کاربر: ${query}\n\nتوجه: متن قانونی مرتبطی یافت نشد. لطفاً بر اساس دانش عمومی حقوقی پاسخ دهید و تأکید کنید که برای پاسخ دقیق‌تر نیاز به بررسی متون قانونی است.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 2000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'سرویس شلوغ است، لطفاً کمی صبر کنید' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error('AI response failed');
    }

    const aiData = await aiResponse.json();
    const answer = aiData.choices?.[0]?.message?.content || 'پاسخی دریافت نشد';

    console.log('Answer generated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        answer,
        sources: results?.slice(0, 3).map((r: any) => ({
          articleNumber: r.article_number,
          category: r.category,
          similarity: r.similarity
        })) || []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in legal-advisor-chat:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'خطای ناشناخته',
        answer: 'متأسفم، در پردازش سوال شما مشکلی پیش آمد. لطفاً دوباره تلاش کنید.'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
