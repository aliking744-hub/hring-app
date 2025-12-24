import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { candidateName, jobPosition } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert HR interviewer and hiring consultant. Generate a comprehensive interview guide in Persian (Farsi) for the given job position.

The guide should include:
1. Opening questions (3-4 questions to warm up)
2. Technical/Role-specific questions (5-7 questions based on the position)
3. Behavioral questions using STAR method (4-5 questions)
4. Cultural fit questions (3-4 questions)
5. Expected answers or key points to look for in each answer
6. Red flags to watch out for during the interview
7. Closing questions and next steps

Format the output as a structured JSON with the following schema:
{
  "candidateName": "string",
  "jobPosition": "string",
  "generatedAt": "string",
  "sections": [
    {
      "title": "string",
      "questions": [
        {
          "question": "string",
          "expectedAnswer": "string",
          "redFlags": ["string"]
        }
      ]
    }
  ],
  "generalRedFlags": ["string"],
  "closingTips": ["string"]
}`;

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
          { role: "user", content: `Generate an interview guide for the following:
Candidate Name: ${candidateName}
Job Position: ${jobPosition}

Please create a comprehensive interview guide in Persian.` }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "محدودیت درخواست. لطفاً چند لحظه صبر کنید." }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "اعتبار کافی نیست. لطفاً اکانت خود را شارژ کنید." }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ error: "خطا در تولید راهنما" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    // Try to parse JSON from the response
    let guide;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/```\n?([\s\S]*?)\n?```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      guide = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      // Return raw content if parsing fails
      guide = { rawContent: content, candidateName, jobPosition };
    }

    return new Response(JSON.stringify({ guide }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-interview-guide:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
