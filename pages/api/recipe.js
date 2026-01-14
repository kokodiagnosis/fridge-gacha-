export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { ingredients } = req.body || {};

  // 入力の最低限チェック
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({ error: "ingredients is required" });
  }

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
    // Vercel の環境変数に入れた CLAUDE_API_KEY を使う
    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "CLAUDE_API_KEY is not set" });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 900,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const raw = await response.text();

    if (!response.ok) {
      // ここでAnthropicからのエラーをそのまま返す（原因特定しやすい）
      return res.status(response.status).json({
        error: "Anthropic API request failed",
        status: response.status,
        details: raw,
      });
    }

    const data = JSON.parse(raw);
    const text = data?.content?.[0]?.text || "";

    // Claudeが ```json ``` で囲むことがあるので除去
    const cleaned = text.replace(/```json|```/g, "").trim();

    let recipe;
    try {
      recipe = JSON.parse(cleaned);
    } catch (e) {
      // JSONとしてパースできなかった場合、内容を返して原因が見えるようにする
      return res.status(500).json({
        error: "Failed to parse Claude response as JSON",
        rawText: text,
      });
    }

    return res.status(200).json(recipe);
  } catch (error) {
    console.error("Error:", error);
    // フォールバック（最低限動く）
    return res.status(200).json({
      dishName: "おまかせ炒め",
      encouragement: "今日も頑張ってる！💪",
      time: "15分",
      difficulty: "簡単",
      ingredients: ingredients.slice(0, 5),
      steps: ["材料を切る", "フライパンで炒める", "お好みの調味料で味付け"],
      tip: "あるもので作るのが一番！",
    });
  }
}
