import { useGame } from '../context/GameContext'
import { useEffect, useState } from 'react'

export default function HUD() {
  const {
    score,
    combo,
    maxCombo,
    health,
    maxHealth,
    gameState,
    startGame,
    attack,
    wave,
    enemies
  } = useGame()

  const [comboScale, setComboScale] = useState(1)
  const [showComboText, setShowComboText] = useState(false)

  useEffect(() => {
    if (combo > 0) {
      setComboScale(1.5)
      setShowComboText(true)
      const timer = setTimeout(() => setComboScale(1), 150)
      return () => clearTimeout(timer)
    } else {
      setShowComboText(false)
    }
  }, [combo])

  const comboTier = combo >= 20 ? 'LEGENDARY' : combo >= 15 ? 'INSANE' : combo >= 10 ? 'BRUTAL' : combo >= 5 ? 'NICE' : ''
  const comboColor = combo >= 20 ? '#ffd700' : combo >= 15 ? '#ff0066' : combo >= 10 ? '#aa00ff' : combo >= 5 ? '#39ff14' : '#00fff0'

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {/* Title Screen */}
      {gameState === 'title' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto bg-black/60">
          <div className="text-center px-4">
            <h1
              className="font-display text-5xl md:text-8xl lg:text-9xl font-black tracking-tight mb-2"
              style={{
                color: '#00fff0',
                textShadow: '0 0 20px #00fff0, 0 0 40px #00fff0, 0 0 60px #00fff0, 4px 4px 0 #ff0066',
                fontFamily: '"Press Start 2P", monospace'
              }}
            >
              PIXEL
            </h1>
            <h1
              className="font-display text-5xl md:text-8xl lg:text-9xl font-black tracking-tight mb-8"
              style={{
                color: '#ff0066',
                textShadow: '0 0 20px #ff0066, 0 0 40px #ff0066, 0 0 60px #ff0066, 4px 4px 0 #00fff0',
                fontFamily: '"Press Start 2P", monospace'
              }}
            >
              FURY
            </h1>

            <p className="text-[#39ff14] text-xs md:text-sm font-mono mb-8 tracking-widest animate-pulse">
              BEAT THEM ALL
            </p>

            <button
              onClick={startGame}
              className="px-8 py-4 md:px-12 md:py-6 text-lg md:text-2xl font-bold tracking-wider transition-all duration-150 hover:scale-110 active:scale-95"
              style={{
                fontFamily: '"Press Start 2P", monospace',
                background: 'linear-gradient(180deg, #ff0066 0%, #aa0044 100%)',
                color: '#ffffff',
                border: '4px solid #ff66aa',
                boxShadow: '0 6px 0 #660033, 0 0 30px rgba(255,0,102,0.5)',
                textShadow: '2px 2px 0 #660033'
              }}
            >
              START GAME
            </button>

            <div className="mt-8 md:mt-12 text-[#666688] text-[10px] md:text-xs font-mono space-y-1">
              <p className="hidden md:block">WASD / ARROWS - MOVE</p>
              <p className="hidden md:block">Z - PUNCH | X - KICK | C - SPECIAL</p>
              <p className="md:hidden">TAP BUTTONS TO ATTACK</p>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto bg-black/80">
          <div className="text-center px-4">
            <h1
              className="text-4xl md:text-7xl font-black mb-4 md:mb-8"
              style={{
                color: '#ff0066',
                textShadow: '0 0 30px #ff0066',
                fontFamily: '"Press Start 2P", monospace'
              }}
            >
              GAME OVER
            </h1>

            <div className="space-y-2 md:space-y-4 mb-6 md:mb-8 font-mono">
              <p className="text-xl md:text-3xl text-[#ffd700]">SCORE: {score.toLocaleString()}</p>
              <p className="text-lg md:text-2xl text-[#39ff14]">MAX COMBO: {maxCombo}x</p>
              <p className="text-lg md:text-2xl text-[#00fff0]">WAVE: {wave}</p>
            </div>

            <button
              onClick={startGame}
              className="px-6 py-3 md:px-10 md:py-5 text-base md:text-xl font-bold tracking-wider transition-all duration-150 hover:scale-110 active:scale-95"
              style={{
                fontFamily: '"Press Start 2P", monospace',
                background: 'linear-gradient(180deg, #39ff14 0%, #22aa00 100%)',
                color: '#000',
                border: '4px solid #66ff44',
                boxShadow: '0 6px 0 #116600, 0 0 30px rgba(57,255,20,0.5)',
              }}
            >
              TRY AGAIN
            </button>
          </div>
        </div>
      )}

      {/* In-Game HUD */}
      {gameState === 'playing' && (
        <>
          {/* Top HUD */}
          <div className="absolute top-0 left-0 right-0 p-3 md:p-6">
            <div className="flex justify-between items-start max-w-4xl mx-auto">
              {/* Health & Score */}
              <div className="space-y-2">
                {/* Health Bar */}
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs md:text-sm font-bold tracking-wider"
                    style={{ fontFamily: '"Press Start 2P", monospace', color: '#ff0066' }}
                  >
                    HP
                  </span>
                  <div className="w-24 md:w-40 h-4 md:h-6 bg-[#220011] border-2 border-[#ff0066] relative overflow-hidden">
                    <div
                      className="h-full transition-all duration-200"
                      style={{
                        width: `${(health / maxHealth) * 100}%`,
                        background: health > 30
                          ? 'linear-gradient(180deg, #ff0066 0%, #aa0044 100%)'
                          : 'linear-gradient(180deg, #ff3333 0%, #aa0000 100%)',
                        boxShadow: health <= 30 ? '0 0 10px #ff0000' : 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Score */}
                <div
                  className="text-lg md:text-2xl font-bold"
                  style={{
                    fontFamily: '"Press Start 2P", monospace',
                    color: '#ffd700',
                    textShadow: '2px 2px 0 #664400'
                  }}
                >
                  {score.toLocaleString()}
                </div>
              </div>

              {/* Wave indicator */}
              <div className="text-right">
                <div
                  className="text-xs md:text-sm"
                  style={{ fontFamily: '"Press Start 2P", monospace', color: '#666688' }}
                >
                  WAVE
                </div>
                <div
                  className="text-2xl md:text-4xl font-bold"
                  style={{
                    fontFamily: '"Press Start 2P", monospace',
                    color: '#00fff0',
                    textShadow: '0 0 15px #00fff0'
                  }}
                >
                  {wave}
                </div>
                <div
                  className="text-[10px] md:text-xs mt-1"
                  style={{ fontFamily: '"Press Start 2P", monospace', color: '#ff0066' }}
                >
                  {enemies.length} ENEMIES
                </div>
              </div>
            </div>
          </div>

          {/* Combo Display */}
          {showComboText && combo > 0 && (
            <div
              className="absolute top-1/4 left-1/2 -translate-x-1/2 text-center transition-transform duration-150"
              style={{ transform: `translate(-50%, 0) scale(${comboScale})` }}
            >
              <div
                className="text-4xl md:text-7xl font-black"
                style={{
                  fontFamily: '"Press Start 2P", monospace',
                  color: comboColor,
                  textShadow: `0 0 30px ${comboColor}, 0 0 60px ${comboColor}`
                }}
              >
                {combo}x
              </div>
              {comboTier && (
                <div
                  className="text-sm md:text-xl font-bold mt-2 animate-pulse"
                  style={{
                    fontFamily: '"Press Start 2P", monospace',
                    color: comboColor,
                    textShadow: `0 0 10px ${comboColor}`
                  }}
                >
                  {comboTier}!
                </div>
              )}
            </div>
          )}

          {/* Mobile Controls */}
          <div className="md:hidden absolute bottom-16 left-0 right-0 pointer-events-auto">
            <div className="flex justify-center gap-3 px-4">
              <button
                onTouchStart={() => attack('punch')}
                className="w-16 h-16 rounded-full font-bold text-xs flex items-center justify-center active:scale-90 transition-transform"
                style={{
                  fontFamily: '"Press Start 2P", monospace',
                  background: 'linear-gradient(180deg, #00fff0 0%, #00aaaa 100%)',
                  color: '#000',
                  border: '3px solid #66ffff',
                  boxShadow: '0 4px 0 #006666'
                }}
              >
                Z
              </button>
              <button
                onTouchStart={() => attack('kick')}
                className="w-16 h-16 rounded-full font-bold text-xs flex items-center justify-center active:scale-90 transition-transform"
                style={{
                  fontFamily: '"Press Start 2P", monospace',
                  background: 'linear-gradient(180deg, #ff0066 0%, #aa0044 100%)',
                  color: '#fff',
                  border: '3px solid #ff66aa',
                  boxShadow: '0 4px 0 #660033'
                }}
              >
                X
              </button>
              <button
                onTouchStart={() => attack('special')}
                className="w-16 h-16 rounded-full font-bold text-xs flex items-center justify-center active:scale-90 transition-transform"
                style={{
                  fontFamily: '"Press Start 2P", monospace',
                  background: 'linear-gradient(180deg, #39ff14 0%, #22aa00 100%)',
                  color: '#000',
                  border: '3px solid #66ff44',
                  boxShadow: '0 4px 0 #116600'
                }}
              >
                C
              </button>
            </div>
          </div>

          {/* Desktop Controls hint */}
          <div className="hidden md:block absolute bottom-8 left-6 text-[10px] font-mono text-[#444466] space-y-1">
            <p>WASD / ARROWS - MOVE</p>
            <p>Z - PUNCH | X - KICK | C - SPECIAL</p>
          </div>
        </>
      )}
    </div>
  )
}
