export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { ingredients } = req.body

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `あなたは優しい料理の先生です。疲れた主婦を元気づけるように、温かく励ましながらレシピを教えてください。

以下の食材を使った簡単で美味しい料理を1つ提案してください：
${ingredients.join('、')}

以下のJSON形式のみで回答してください（JSON以外は書かないで）：
{
  "dishName": "料理名",
  "encouragement": "疲れた主婦への短い励ましメッセージ（絵文字付きで20文字以内）",
  "time": "調理時間（例：15分）",
  "difficulty": "簡単/普通/ちょっと頑張る",
  "ingredients": ["使う食材1", "使う食材2"],
  "steps": ["手順1", "手順2", "手順3"],
  "tip": "ワンポイントアドバイス"
}`
        }]
      })
    })

    const data = await response.json()
    const text = data.content[0].text
    const recipe = JSON.parse(text.replace(/```json|```/g, '').trim())
    
    res.status(200).json(recipe)
  } catch (error) {
    res.status(500).json({
      dishName: "おまかせ炒め",
      encouragement: "今日も頑張ってる！💪",
      time: "15分",
      difficulty: "簡単",
      ingredients: ingredients.slice(0, 5),
      steps: ["材料を切る", "フライパンで炒める", "お好みの調味料で味付け"],
      tip: "あるもので作るのが一番！"
    })
  }
}
