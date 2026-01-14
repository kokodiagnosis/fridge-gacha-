export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { ingredients } = req.body || {};
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({ error: "ingredients is required" });
  }

  // ★モデルは固定（本番向け）
  const MODEL = "claude-sonnet-4-5-20250929";

  const prompt = `あなたは優しい料理の先生です。疲れた主婦を元気づけるように、温かく励ましながらレシピを教えてください。

以下の食材を使った簡単で美味しい料理を1つ提案してください：
${ingredients.join("、")}

以下のJSON形式のみで回答してください（JSON以外は書かないで）：
{
  "dishName": "料理名",
  "encouragement": "疲れた主婦への短い励ましメッセージ（絵文字付きで20文字以内）",
  "time": "調理時間（例：15分）",
  "difficulty": "簡単/普通/ちょっと頑張る",
  "ingredients": ["使う食材1", "使う食材2"],
  "steps": ["手順1", "手順2", "手順3"],
  "tip": "ワンポイントアドバイス"
}`;

  try {
    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "CLAUDE_API_KEY is not set",
        hint: "VercelのEnvironment VariablesにProductionで入ってるか確認",
      });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 900,
        messages: [
          {
            role: "user",
            content: [{ type: "text", text: prompt }],
          },
        ],
      }),
    });

    const raw = await response.text();

    // ★失敗した時に「どのモデルで呼んだか」を必ず返す
    if (!response.ok) {
      return res.status(response.status).json({
        error: "Anthropic API request failed",
        usedModel: MODEL,
        status: response.status,
        details: raw,
      });
    }

    // rawがJSONじゃないケースもあるので、ここはtryで守る
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return res.status(500).json({
        error: "Anthropic response was not valid JSON",
        usedModel: MODEL,
        raw,
      });
    }

    const text = data?.content?.[0]?.text || "";
    const cleaned = text.replace(/```json|```/g, "").trim();

    let recipe;
    try {
      recipe = JSON.parse(cleaned);
    } catch {
      return res.status(500).json({
        error: "Failed to parse Claude response as JSON",
        usedModel: MODEL,
        rawText: text,
      });
    }

    return res.status(200).json({
      ...recipe,
      _debug: { usedModel: MODEL }, // ★成功時も一応返す（確認用）
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      error: "Server error",
      details: String(error),
    });
  }
}
