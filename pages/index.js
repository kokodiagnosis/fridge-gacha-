// pages/index.js
import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState("");

  // 入力テキスト → 配列化
  const parseIngredients = (raw) => {
    return raw
      .split(/[,、\n]/) // カンマ / 読点 / 改行
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const handleGacha = async () => {
    setError("");
    setRecipe(null);

    const ingredients = parseIngredients(text);

    if (ingredients.length === 0) {
      setError("食材を入れてね！（例：卵、ツナ、キャベツ）");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients }), // ←ここが超重要：固定配列にしない
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "エラーが起きたよ");
        return;
      }

      setRecipe(data);
    } catch (e) {
      setError("通信に失敗したよ（ネットワーク）");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: 16, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>冷蔵庫ガチャ</h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>食材をカンマ区切りで入れてね（例：卵、ツナ、キャベツ）</p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="卵、ツナ、キャベツ"
        style={{ width: "100%", padding: 12, fontSize: 16, borderRadius: 10, border: "1px solid #ccc" }}
      />

      <button
        onClick={handleGacha}
        disabled={loading}
        style={{
          marginTop: 12,
          padding: "12px 16px",
          fontSize: 16,
          borderRadius: 10,
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "AIが考え中..." : "ガチャる！"}
      </button>

      {error && (
        <div style={{ marginTop: 16, padding: 12, borderRadius: 10, background: "#ffe6e6" }}>
          ❌ {error}
        </div>
      )}

      {recipe && (
        <div style={{ marginTop: 18, padding: 14, borderRadius: 12, background: "#f5f5f5" }}>
          <h2 style={{ marginTop: 0 }}>{recipe.dishName}</h2>
          <div style={{ marginBottom: 8 }}>{recipe.encouragement}</div>
          <div style={{ display: "flex", gap: 10, marginBottom: 10, opacity: 0.9 }}>
            <span>⏱ {recipe.time}</span>
            <span>📌 {recipe.difficulty}</span>
          </div>

          <div style={{ marginBottom: 10 }}>
            <b>使う食材：</b> {Array.isArray(recipe.ingredients) ? recipe.ingredients.join("、") : ""}
          </div>

          <div style={{ marginBottom: 10 }}>
            <b>作り方：</b>
            <ol>
              {(recipe.steps || []).map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>

          <div>
            <b>コツ：</b> {recipe.tip}
          </div>
        </div>
      )}
    </div>
  );
}
