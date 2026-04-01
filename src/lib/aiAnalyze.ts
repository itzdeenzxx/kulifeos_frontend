const API_KEY = "tgp_v1_ncGvcNM7S9oFE_l0FgtYaJ97OryTcZoLnfiM1spP7DM";

export async function analyzeResumeWithAI(
  content: string,
  isImage: boolean = false
): Promise<any> {
  const systemPrompt = `You are a professional resume parser. 
Extract the following information into a structured JSON string:
- "name" (string)
- "email" (string)
- "phone" (string)
- "skills" (array of strings)
- "education" (array of objects with "degree", "field", "institution")
- "experience" (array of objects with "title", "company", "description")

If any value is missing or cannot be found, return a null or empty string/array.
Output ONLY the raw JSON string WITHOUT any Markdown markup such as \`\`\`json.`;

  const model = isImage ? "Qwen/Qwen3-VL-8B-Instruct" : "google/gemma-3n-E4B-it";

  const messageContent = isImage
    ? [
        { type: "text", text: "Parse this resume image into the format requested." },
        { type: "image_url", image_url: { url: content } }, // content is a base64 Data URL
      ]
    : content;

  const payload = {
    model: model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: messageContent },
    ],
    temperature: 0.1,
  };

  const res = await fetch("https://api.together.xyz/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`AI API Error: await ${await res.text()}`);
  }

  const data = await res.json();
  const rawText = data.choices[0].message.content;

  // Clean the markdown output block if AI didn't follow the system prompt completely
  let cleanJsonStr = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
  
  try {
    return JSON.parse(cleanJsonStr);
  } catch (error) {
    console.error("Failed to parse JSON:", cleanJsonStr);
    return { name: "", email: "", phone: "", skills: [], education: [], experience: [] };
  }
}
