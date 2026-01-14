import { useState } from 'react'
import Head from 'next/head'

export default function Home() {
  const [ingredients, setIngredients] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [gameState, setGameState] = useState('input')
  const [recipe, setRecipe] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [capsuleColor, setCapsuleColor] = useState('#FF6B6B')

  const capsuleColors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3']

  const addIngredient = () => {
    if (inputValue.trim() && ingredients.length < 20) {
      setIngredients([...ingredients, inputValue.trim()])
      setInputValue('')
    }
  }

  const removeIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const spinGacha = () => {
    if (ingredients.length === 0) return
    setGameState('spinning')
    setCapsuleColor(capsuleColors[Math.floor(Math.random() * capsuleColors.length)])
    setTimeout(() => setGameState('capsule'), 3000)
  }

  const openCapsule = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients })
      })
      const data = await res.json()
      setRecipe(data)
    } catch (e) {
      setRecipe({
        dishName: "おまかせ炒め",
        encouragement: "エラーでも大丈夫！💪",
        time: "15分",
        difficulty: "簡単",
        ingredients: ingredients.slice(0, 5),
        steps: ["材料を切る", "炒める", "味付けして完成！"],
        tip: "あるもので作るのが一番！"
      })
    }
    setGameState('recipe')
    setIsLoading(false)
  }

  const reset = () => {
    setGameState('input')
    setRecipe(null)
    setIngredients([])
  }

  return (
    <>
      <Head>
        <title>冷蔵庫ガチャ</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FFF5F5 0%, #FFF0F5 50%, #F0F8FF 100%)',
        padding: '20px',
        fontFamily: 'sans-serif',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '28px', color: '#E91E63', margin: 0 }}>🎰 冷蔵庫ガチャ 🎰</h1>
          <p style={{ color: '#888', fontSize: '14px' }}>今日のごはん、運命に任せちゃお？</p>
        </div>

        {gameState === 'input' && (
          <div>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '20px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              marginBottom: '20px',
            }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
                  placeholder="冷蔵庫の中身を入力..."
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: '25px',
                    border: '2px solid #FFB6C1',
                    fontSize: '16px',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={addIngredient}
                  disabled={ingredients.length >= 20}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '25px',
                    border: 'none',
                    background: ingredients.length >= 20 ? '#ccc' : 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
                    color: 'white',
                    fontSize: '16px',
                    cursor: ingredients.length >= 20 ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  追加
                </button>
              </div>
              <p style={{ color: '#888', fontSize: '12px', margin: '0 0 10px' }}>{ingredients.length}/20個</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {ingredients.map((ing, i) => (
                  <span key={i} onClick={() => removeIngredient(i)} style={{
                    background: 'linear-gradient(135deg, #FFE5EC, #FFF0F5)',
                    padding: '8px 14px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    border: '1px solid #FFB6C1',
                  }}>{ing} ✕</span>
                ))}
              </div>
            </div>
            {ingredients.length > 0 && (
              <button onClick={spinGacha} style={{
                width: '100%',
                padding: '18px',
                borderRadius: '30px',
                border: 'none',
                background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
                color: 'white',
                fontSize: '20px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(255,107,107,0.4)',
              }}>🎲 ガチャを回す！</button>
            )}
            {ingredients.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                <p style={{ fontSize: '48px', margin: 0 }}>🥬🥚🧅</p>
                <p>冷蔵庫の中身を教えてね</p>
              </div>
            )}
          </div>
        )}

        {gameState === 'spinning' && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{
              width: '200px',
              height: '280px',
              margin: '0 auto 30px',
              background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 100%)',
              borderRadius: '20px',
              position: 'relative',
              boxShadow: '0 10px 30px rgba(255,165,0,0.4)',
            }}>
              <div style={{
                position: 'absolute',
                top: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '120px',
                height: '120px',
                background: 'rgba(255,255,255,0.3)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px',
                animation: 'shake 0.5s infinite',
              }}>🥚🥚🥚</div>
              <div style={{
                position: 'absolute',
                right: '-20px',
                top: '50%',
                width: '50px',
                height: '50px',
                background: '#FF4444',
                borderRadius: '50%',
                animation: 'spin 0.3s linear infinite',
              }} />
              <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '80px',
                height: '60px',
                background: '#333',
                borderRadius: '10px 10px 20px 20px',
              }} />
            </div>
            <p style={{ fontSize: '24px', color: '#E91E63', fontWeight: 'bold' }}>ガラガラガラ...🎰</p>
          </div>
        )}

        {gameState === 'capsule' && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ fontSize: '18px', color: '#E91E63', marginBottom: '30px' }}>✨ カプセルが出てきた！ ✨</p>
            <div onClick={!isLoading ? openCapsule : undefined} style={{
              width: '150px',
              height: '180px',
              margin: '0 auto',
              cursor: isLoading ? 'wait' : 'pointer',
              animation: isLoading ? 'none' : 'bounce 1s infinite',
            }}>
              <div style={{
                width: '150px',
                height: '90px',
                background: `linear-gradient(135deg, ${capsuleColor}, ${capsuleColor}dd)`,
                borderRadius: '75px 75px 0 0',
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  left: '25px',
                  width: '30px',
                  height: '30px',
                  background: 'rgba(255,255,255,0.4)',
                  borderRadius: '50%',
                }} />
              </div>
              <div style={{
                width: '150px',
                height: '90px',
                background: 'linear-gradient(135deg, #f5f5f5, #e0e0e0)',
                borderRadius: '0 0 75px 75px',
              }} />
            </div>
            <p style={{ marginTop: '30px', fontSize: '16px', color: isLoading ? '#888' : '#E91E63', fontWeight: 'bold' }}>
              {isLoading ? '🔮 レシピを占い中...' : '👆 タップして開けよう！'}
            </p>
          </div>
        )}

        {gameState === 'recipe' && recipe && (
          <div>
            <div style={{
              background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
              color: 'white',
              padding: '15px 20px',
              borderRadius: '15px',
              textAlign: 'center',
              marginBottom: '20px',
              fontSize: '18px',
              fontWeight: 'bold',
            }}>{recipe.encouragement}</div>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '25px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            }}>
              <h2 style={{ fontSize: '24px', color: '#333', margin: '0 0 15px', textAlign: 'center' }}>🍳 {recipe.dishName}</h2>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
                <span style={{ background: '#FFE5EC', padding: '6px 14px', borderRadius: '20px', fontSize: '14px' }}>⏱ {recipe.time}</span>
                <span style={{ background: '#E5F6FF', padding: '6px 14px', borderRadius: '20px', fontSize: '14px' }}>📊 {recipe.difficulty}</span>
              </div>
              <h3 style={{ fontSize: '16px', color: '#E91E63', margin: '0 0 10px' }}>🥗 使う食材</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                {recipe.ingredients.map((ing, i) => (
                  <span key={i} style={{ background: '#F0F8FF', padding: '6px 12px', borderRadius: '15px', fontSize: '14px' }}>{ing}</span>
                ))}
              </div>
              <h3 style={{ fontSize: '16px', color: '#E91E63', margin: '0 0 10px' }}>📝 作り方</h3>
              {recipe.steps.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <span style={{
                    background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
                    color: 'white',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    flexShrink: 0,
                  }}>{i + 1}</span>
                  <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.6, color: '#444' }}>{step}</p>
                </div>
              ))}
              {recipe.tip && (
                <div style={{ background: '#FFF9E5', padding: '15px', borderRadius: '12px', borderLeft: '4px solid #FFD700', marginTop: '20px' }}>
                  <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>💡 {recipe.tip}</p>
                </div>
              )}
            </div>
            <button onClick={reset} style={{
              width: '100%',
              marginTop: '20px',
              padding: '16px',
              borderRadius: '30px',
              border: 'none',
              background: 'linear-gradient(135deg, #4ECDC4, #44A08D)',
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}>🔄 もう一回ガチャる！</button>
          </div>
        )}

        <style jsx global>{`
          @keyframes shake {
            0%, 100% { transform: translateX(-50%); }
            25% { transform: translateX(calc(-50% - 5px)); }
            75% { transform: translateX(calc(-50% + 5px)); }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
        `}</style>
      </div>
    </>
  )
}
