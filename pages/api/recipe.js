// pages/api/recipe.js

export default async function handler(req, res) {
  // POST以外は拒否
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ingredients の受け取りを堅くする（配列でも文字列でもOK）
  let { ingredients } = req.body;

  // 文字列で来たら分割して配列化（"卵,ツナ" / "卵、ツナ" / 改行など対応）
  if (typeof ingredients === "string") {
    ingredients = ingredients
      .split(/[,、\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  // 配列じゃなければ空配列
  if (!Array.isArray(ingredients)) ingredients = [];

  // 空ならエラー（ここは好みでメッセージ変えてOK）
  if (ingredients.length === 0) {
    return res.status(400).json({ error: "ingredients is empty" });
  }

  try {
    const prompt = `
あなたは優しい料理の先生です。疲れた主婦を元気づけるように、温かく励ましながらレシピを教えてください。

以下の食材を使った簡単で美味しい料理を1つ提案してください：
${ingredients.join("、")}

【重要】
- 必ず「JSONのみ」を返してください（前後に文章・コードブロック禁止）
- 値はすべて日本語
- steps は3〜6個
- ingredients は上の入力食材から中心に選んでOK（全部使わなくていい）

出力フォーマット：
{
  "dishName": "料理名",
  "encouragement": "疲れた主婦への短い励ましメッセージ（絵文字付きで20文字以内）",
  "time": "調理時間（例：15分）",
  "difficulty": "簡単/普通/ちょっと頑張る",
  "ingredients": ["使う食材1", "使う食材2"],
  "steps": ["手順1", "手順2", "手順3"],
  "tip": "ワンポイントアドバイス"
}
`.trim();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "model: "claude-3-5-sonnet-20241022",
",
        max_tokens: 900,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      return res.status(500).json({
        error: "Anthropic API request failed",
        status: response.status,
        detail: errText.slice(0, 500),
      });
    }

    const data = await response.json();

    // content は配列で返ることが多い
    const text = Array.isArray(data?.content) ? data.content.map((c) => c.text || "").join("\n") : "";

    // 余計な ```json ``` を削る（念のため）
    const cleaned = text.replace(/```json|```/g, "").trim();

    // JSONとしてパース
    const recipe = JSON.parse(cleaned);

    // 最低限の形を整える
    recipe.ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : ingredients.slice(0, 5);
    recipe.steps = Array.isArray(recipe.steps) ? recipe.steps : ["材料を切る", "加熱する", "味を整える"];

    return res.status(200).json(recipe);
  } catch (error) {
    // ここで “固定レシピ返し” をやると、失敗時に毎回同じに見えるので
    // 失敗は失敗としてフロントに返す（原因が分かる）
    console.error("Error:", error);
    return res.status(500).json({
      error: "Server error",
      message: error?.message || "unknown",
    });
  }
}
