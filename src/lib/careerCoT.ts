import { ParsedResume } from "./aiAnalyze";

const TOGETHER_API_KEY = import.meta.env.VITE_TOGETHER_API_KEY;
const MODEL = "google/gemma-3n-E4B-it"; // Using the same model specified in aiAnalyze.ts

export interface CareerCoTResult {
  id?: string;
  timestamp?: string;
  step1_tech: string;
  step2_soft: string;
  step3_market: string;
  summary: {
    title: string;
    description: string;
    matchScore: number;
    requiredSkills: string[];
    skillGapData: Array<{ skill: string; current: number; required: number }>;
    growthTimeline: Array<{ year: string; milestone: string; description: string }>;
  };
}

async function callGemma(systemPrompt: string, userMessage: string): Promise<string> {
  if (!TOGETHER_API_KEY) throw new Error("Missing VITE_TOGETHER_API_KEY in environment variables");

  const res = await fetch("https://api.together.xyz/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOGETHER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.3,
    }),
  });

  if (!res.ok) throw new Error(`AI API Error: ${await res.text()}`);

  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? "";
}

export async function generateCareerInsightsCoT(userProfile: any, resumeData?: ParsedResume): Promise<CareerCoTResult> {
  const userDataString = JSON.stringify({ profile: userProfile, resume: resumeData || "No parsed resume provided." }, null, 2);

  // Run 3 Agents in parallel
  const [techReport, softReport, marketReport] = await Promise.all([
    callGemma(
      `You are an expert Technical Career Advisor. Analyze the user's hard skills, education, and technical projects. 
      YOU MUST OUTPUT STRICT VALID JSON ONLY. RESPOND ENTIRELY IN THAI (ภาษาไทย).
      Required JSON Schema:
      {
        "reportTitle": "Title of report (Thai)",
        "summary": "Concise summary of their tech profile (Thai)",
        "topStrengths": ["Strength 1 (Thai)", "Strength 2 (Thai)"],
        "recommendedTechRoles": [
          { "role": "Role Name (Thai/English)", "description": "Why this role fits (Thai)", "requiredSkills": ["Skill 1"] }
        ],
        "areasForGrowth": ["Area 1 (Thai)", "Area 2 (Thai)"],
        "overallAssessment": "Overall tech assessment (Thai)"
      }`,
      `User Data:\n${userDataString}\n\nProvide the technical analysis in pure JSON:`
    ),
    callGemma(
      `You are an expert HR & Soft Skills Analyst. Analyze the user's experiences, extracurriculars, and narrative. 
      YOU MUST OUTPUT STRICT VALID JSON ONLY. RESPOND ENTIRELY IN THAI (ภาษาไทย).
      Required JSON Schema:
      {
        "overall_assessment": "Overall behavioral and soft skill assessment (Thai)",
        "soft_skills_summary": {
          "communication": "Score/100 - Reason (Thai)",
          "teamwork": "Score/100 - Reason (Thai)",
          "problem_solving": "Score/100 - Reason (Thai)",
          "adaptability": "Score/100 - Reason (Thai)",
          "time_management": "Score/100 - Reason (Thai)"
        },
        "recommended_team_culture": "Recommended team culture (Thai)",
        "recommended_leadership_role": "Recommended leadership path (Thai)"
      }`,
      `User Data:\n${userDataString}\n\nProvide the soft skills analysis in pure JSON:`
    ),
    callGemma(
      `You are a Tech Labor Market Analyst. Identify current market trends that align with the user's background.
      YOU MUST OUTPUT STRICT VALID JSON ONLY. RESPOND ENTIRELY IN THAI (ภาษาไทย).
      Required JSON Schema:
      {
        "market_summary": "Overall market analysis for this candidate (Thai)",
        "market_trends": ["Trend 1 (Thai)", "Trend 2 (Thai)"],
        "target_industries": [
          { "industry": "Industry Name (Thai/English)", "potential": "High/Medium (Thai)", "reason": "Why it's a good fit (Thai)" }
        ],
        "salary_growth_potential": "Analysis of salary and growth potential (Thai)",
        "recommended_certifications": ["Cert 1 (Thai/English)", "Cert 2"]
      }`,
      `User Data:\n${userDataString}\n\nProvide the market analysis in pure JSON:`
    )
  ]);

  // Final Summarizer Agent
  const summaryPrompt = `You are the Lead Career Strategist. You have three reports from your team:
1. Technical Analysis: ${techReport}
2. Soft Skills Analysis: ${softReport}
3. Market Analysis: ${marketReport}

Synthesize these into ONE highly recommended career path for the user.
You MUST output ONLY a valid JSON object matching this schema exactly, and nothing else (no markdown wrapping). RESPOND ENTIRELY IN THAI (ภาษาไทย).
{
  "title": "Job Title (Thai/English)",
  "description": "2-3 sentences explaining why this is the perfect fit (Thai)",
  "matchScore": 95, // strict number 0-100
  "requiredSkills": ["Skill 1", "Skill 2"], // top 5 skills
  "skillGapData": [
    {"skill": "Skill Name", "current": 80, "required": 90}
  ], // output exactly 3-5 objects
  "growthTimeline": [
    {"year": "2026", "milestone": "Milestone name (Thai)", "description": "How to achieve it (Thai)"}
  ] // output exactly 2-3 objects
}`;

  const summaryRaw = await callGemma(
    "You are a strict JSON bot. Synthesize reports into the required JSON schema.",
    summaryPrompt
  );

  let summary;
  try {
    const cleaned = summaryRaw.replace(/```json/gi, "").replace(/```/g, "").trim();
    summary = JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to parse summary JSON. Raw Response: ", summaryRaw);
    summary = {
      title: "AI Career Match (Fallback)",
      description: "Could not fully parse the AI response.",
      matchScore: 80,
      requiredSkills: ["Skill 1", "Skill 2"],
      skillGapData: [],
      growthTimeline: []
    };
  }

  return {
    step1_tech: techReport,
    step2_soft: softReport,
    step3_market: marketReport,
    summary
  };
}
