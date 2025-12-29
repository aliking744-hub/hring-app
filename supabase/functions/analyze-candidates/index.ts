import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CandidateInput {
  name?: string;
  email?: string;
  phone?: string;
  skills?: string;
  experience?: string;
  education?: string;
  lastCompany?: string;
  location?: string;
}

interface JobRequirements {
  jobTitle: string;
  city: string;
  skills?: string;
  experience?: string;
  industry?: string;
  description?: string;
  seniorityLevel?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { candidates, jobRequirements } = await req.json();

    if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
      return new Response(
        JSON.stringify({ error: "لیست کاندیداها خالی است" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (candidates.length > 100) {
      return new Response(
        JSON.stringify({ error: "حداکثر ۱۰۰ کاندیدا قابل پردازش است" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Processing ${candidates.length} candidates for job: ${jobRequirements.jobTitle}`);

    // Prepare the prompt for AI analysis
    const systemPrompt = `You are an expert HR recruiter AI assistant. Analyze candidates against job requirements and provide match scores.

For each candidate, calculate scores (0-100) for:
- skills: How well their skills match the job requirements
- experience: How relevant their work experience is
- education: How suitable their education background is
- culture: Estimated cultural fit based on their profile

Also provide:
- matchScore: Overall match percentage (weighted average)
- summary: Brief explanation in Persian of why they match or don't match

IMPORTANT: Respond ONLY with valid JSON array, no markdown or extra text.`;

    const userPrompt = `Job Requirements:
- عنوان شغل: ${jobRequirements.jobTitle}
- شهر: ${jobRequirements.city}
- مهارت‌های مورد نیاز: ${jobRequirements.skills || 'مشخص نشده'}
- سابقه کار: ${jobRequirements.experience || 'مشخص نشده'}
- صنعت: ${jobRequirements.industry || 'مشخص نشده'}
- سطح ارشدیت: ${jobRequirements.seniorityLevel || 'مشخص نشده'}
- توضیحات: ${jobRequirements.description || 'ندارد'}

Candidates to analyze:
${JSON.stringify(candidates, null, 2)}

Analyze each candidate and return a JSON array with this structure for each:
{
  "id": "unique_id",
  "name": "candidate name",
  "email": "email if available",
  "phone": "phone if available",
  "title": "suggested job title based on their experience",
  "education": "their education",
  "experience": "years of experience",
  "lastCompany": "last company",
  "location": "their location",
  "skills": ["skill1", "skill2"],
  "matchScore": 85,
  "scores": {
    "skills": 90,
    "experience": 80,
    "education": 75,
    "culture": 85
  },
  "summary": "توضیح کوتاه به فارسی"
}

Sort by matchScore descending. Return ONLY the JSON array.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "محدودیت درخواست. لطفاً چند دقیقه صبر کنید." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "اعتبار کافی نیست. لطفاً اعتبار خود را شارژ کنید." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log("AI response received, parsing results...");

    // Parse the JSON response (handle markdown code blocks if present)
    let analyzedCandidates;
    try {
      let jsonStr = content.trim();
      // Remove markdown code blocks if present
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
      }
      analyzedCandidates = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI analysis results");
    }

    // Ensure all candidates have required fields
    const processedCandidates = analyzedCandidates.map((c: any, index: number) => ({
      id: c.id || `candidate_${Date.now()}_${index}`,
      name: c.name || `کاندیدا ${index + 1}`,
      email: c.email || '',
      phone: c.phone || '',
      title: c.title || 'نامشخص',
      education: c.education || 'نامشخص',
      experience: c.experience || 'نامشخص',
      lastCompany: c.lastCompany || 'نامشخص',
      location: c.location || jobRequirements.city,
      skills: Array.isArray(c.skills) ? c.skills : [],
      matchScore: typeof c.matchScore === 'number' ? c.matchScore : 50,
      scores: {
        skills: c.scores?.skills || 50,
        experience: c.scores?.experience || 50,
        education: c.scores?.education || 50,
        culture: c.scores?.culture || 50,
      },
      summary: c.summary || '',
    }));

    // Sort by match score
    processedCandidates.sort((a: any, b: any) => b.matchScore - a.matchScore);

    // Calculate statistics
    const stats = {
      total: processedCandidates.length,
      excellent: processedCandidates.filter((c: any) => c.matchScore >= 85).length,
      good: processedCandidates.filter((c: any) => c.matchScore >= 70 && c.matchScore < 85).length,
      average: processedCandidates.filter((c: any) => c.matchScore < 70).length,
      avgScore: Math.round(processedCandidates.reduce((sum: number, c: any) => sum + c.matchScore, 0) / processedCandidates.length),
    };

    console.log(`Analysis complete. Stats: ${JSON.stringify(stats)}`);

    return new Response(
      JSON.stringify({
        candidates: processedCandidates,
        stats,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-candidates function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "خطای ناشناخته" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
