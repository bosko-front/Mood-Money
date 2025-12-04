import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const data = req.body;

        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0.3,
            max_tokens: 400,
            messages: [
                {
                    role: "system",
                    content: `
You are a friendly financial and emotional coach.
Respond *only* in English.
Return *only a JSON array* in the following format:
[
  { "title": "Insight title", "description": "Short 2-3 sentence description", "recommendation": "Suggestion for next week" }
]
Do not include any text outside the JSON.
Instead of numeric mood values, use these emojis:
😀 = 1, 😊 = 2, 😐 = 3, 😞 = 4, 😡 = 5, 😢 = 6
For example, if a mood is 1, write 😀 in your insight.
If there is not enough data, return an empty array [].
          `,
                },
                {
                    role: "user",
                    content: `
Analyze the following user spending and mood data:
${JSON.stringify(data, null, 2)}

Tasks:
1. Find patterns between spending and mood.
2. Write 2–3 short insights about spending and mood correlation.
3. Add 1 concrete recommendation for next week.
Return only a JSON array.
          `,
                },
            ],
        });

        const text = response.choices?.[0]?.message?.content?.trim() ?? "[]";

        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch {
            parsed = [{ title: "AI Insight", description: text, recommendation: "" }];
        }

        res.status(200).json({ insights: parsed });
    } catch (err) {
        console.error("AI error:", err);
        res.status(500).json({ error: "AI analysis failed" });
    }
}
