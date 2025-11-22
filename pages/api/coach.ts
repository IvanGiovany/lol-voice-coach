import type { NextApiRequest, NextApiResponse } from "next";

type Data = { message: string };
type ErrorData = { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | ErrorData>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { champion = "Unknown", role, phase, situation } = req.body as {
      champion?: string;
      role?: string;
      phase?: string;
      situation?: string;
    };

    if (!role || !phase || !situation) {
      return res
        .status(400)
        .json({ error: "Missing required fields in request body." });
    }

    const systemPrompt = `
You are a Challenger-level League of Legends coach and esports analyst.
Your job is to give short, highly actionable advice for the current situation in a match.

Rules:
- Answer in 3–6 bullet points.
- Be concrete: talk about wave states, trading patterns, ward locations, recall timings, and itemization.
- Assume the player is roughly Gold–Platinum level mechanically.
- Do NOT explain basic controls.
- Focus on strategy, decision-making, and clear next steps over the next 1–3 minutes of game time.
- Be encouraging, not toxic.
`.trim();

    const userPrompt = `
Champion: ${champion}
Role: ${role}
Game phase: ${phase}
Situation: ${situation}

Respond with:
1. A short helpful title
2. 3–6 bullet points of advice
`.trim();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Server missing ANTHROPIC_API_KEY" });
    }

    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307", // <--- FIXED MODEL NAME
        max_tokens: 400,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: userPrompt,
          },
        ],
      }),
    });

    if (!claudeRes.ok) {
      const text = await claudeRes.text();
      console.error("Claude error:", text);
      return res.status(500).json({ error: "Claude API failed." });
    }

    const completion = await claudeRes.json();
    const message = completion?.content?.[0]?.text ?? "No response from coach.";

    return res.status(200).json({ message });
  } catch (err) {
    console.error("Coach API error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
}
