import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react'

interface Enemy {
  id: number
  position: [number, number, number]
  health: number
  maxHealth: number
  isHit: boolean
  type: 'grunt' | 'brute' | 'ninja'
}

interface GameState {
  score: number
  combo: number
  maxCombo: number
  health: number
  maxHealth: number
  enemies: Enemy[]
  gameState: 'title' | 'playing' | 'gameover'
  playerPosition: [number, number, number]
  isAttacking: boolean
  attackType: 'punch' | 'kick' | 'special' | null
  screenShake: number
  wave: number
}

interface GameContextType extends GameState {
  startGame: () => void
  attack: (type: 'punch' | 'kick' | 'special') => void
  movePlayer: (direction: 'left' | 'right' | 'up' | 'down') => void
  hitEnemy: (enemyId: number, damage: number) => void
  playerHit: (damage: number) => void
  spawnEnemies: () => void
  resetCombo: () => void
}

const GameContext = createContext<GameContextType | null>(null)

export function useGame() {
  const context = useContext(GameContext)
  if (!context) throw new Error('useGame must be used within GameProvider')
  return context
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>({
    score: 0,
    combo: 0,
    maxCombo: 0,
    health: 100,
    maxHealth: 100,
    enemies: [],
    gameState: 'title',
    playerPosition: [0, 0, 0],
    isAttacking: false,
    attackType: null,
    screenShake: 0,
    wave: 1
  })

  const comboTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const enemyIdRef = useRef(0)

  const spawnEnemies = useCallback(() => {
    setState(prev => {
      const newEnemies: Enemy[] = []
      const numEnemies = Math.min(3 + prev.wave, 8)

      for (let i = 0; i < numEnemies; i++) {
        const type = Math.random() < 0.6 ? 'grunt' : Math.random() < 0.7 ? 'ninja' : 'brute'
        const health = type === 'grunt' ? 30 : type === 'ninja' ? 20 : 60

        newEnemies.push({
          id: enemyIdRef.current++,
          position: [
            (Math.random() - 0.5) * 14,
            0,
            (Math.random() - 0.5) * 6
          ],
          health,
          maxHealth: health,
          isHit: false,
          type
        })
      }

      return { ...prev, enemies: newEnemies }
    })
  }, [])

  const startGame = useCallback(() => {
    enemyIdRef.current = 0
    setState({
      score: 0,
      combo: 0,
      maxCombo: 0,
      health: 100,
      maxHealth: 100,
      enemies: [],
      gameState: 'playing',
      playerPosition: [0, 0, 0],
      isAttacking: false,
      attackType: null,
      screenShake: 0,
      wave: 1
    })
    setTimeout(() => spawnEnemies(), 500)
  }, [spawnEnemies])

  const resetCombo = useCallback(() => {
    setState(prev => ({ ...prev, combo: 0 }))
  }, [])

  const attack = useCallback((type: 'punch' | 'kick' | 'special') => {
    setState(prev => {
      if (prev.isAttacking || prev.gameState !== 'playing') return prev
      return { ...prev, isAttacking: true, attackType: type }
    })

    setTimeout(() => {
      setState(prev => ({ ...prev, isAttacking: false, attackType: null }))
    }, type === 'special' ? 400 : 200)
  }, [])

  const movePlayer = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    setState(prev => {
      if (prev.gameState !== 'playing') return prev

      const speed = 0.3
      const [x, y, z] = prev.playerPosition
      let newX = x, newZ = z

      switch (direction) {
        case 'left': newX = Math.max(-7, x - speed); break
        case 'right': newX = Math.min(7, x + speed); break
        case 'up': newZ = Math.max(-3, z - speed); break
        case 'down': newZ = Math.min(3, z + speed); break
      }

      return { ...prev, playerPosition: [newX, y, newZ] }
    })
  }, [])

  const hitEnemy = useCallback((enemyId: number, damage: number) => {
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current)

    setState(prev => {
      const enemyIndex = prev.enemies.findIndex(e => e.id === enemyId)
      if (enemyIndex === -1) return prev

      const enemy = prev.enemies[enemyIndex]
      const newHealth = enemy.health - damage
      const newCombo = prev.combo + 1
      const comboMultiplier = 1 + Math.floor(newCombo / 5) * 0.5
      const points = Math.floor(damage * 10 * comboMultiplier)

      let newEnemies = [...prev.enemies]

      if (newHealth <= 0) {
        newEnemies = newEnemies.filter(e => e.id !== enemyId)
      } else {
        newEnemies[enemyIndex] = { ...enemy, health: newHealth, isHit: true }
        setTimeout(() => {
          setState(p => ({
            ...p,
            enemies: p.enemies.map(e => e.id === enemyId ? { ...e, isHit: false } : e)
          }))
        }, 100)
      }

      // Check for wave completion
      if (newEnemies.length === 0) {
        setTimeout(() => {
          setState(p => ({ ...p, wave: p.wave + 1 }))
          spawnEnemies()
        }, 1500)
      }

      return {
        ...prev,
        enemies: newEnemies,
        score: prev.score + points,
        combo: newCombo,
        maxCombo: Math.max(prev.maxCombo, newCombo),
        screenShake: Math.min(newCombo * 0.5, 3)
      }
    })

    comboTimerRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, combo: 0, screenShake: 0 }))
    }, 2000)
  }, [spawnEnemies])

  const playerHit = useCallback((damage: number) => {
    setState(prev => {
      const newHealth = prev.health - damage
      if (newHealth <= 0) {
        return { ...prev, health: 0, gameState: 'gameover', combo: 0 }
      }
      return { ...prev, health: newHealth, combo: 0, screenShake: 2 }
    })
  }, [])

  return (
    <GameContext.Provider value={{
      ...state,
      startGame,
      attack,
      movePlayer,
      hitEnemy,
      playerHit,
      spawnEnemies,
      resetCombo
    }}>
      {children}
    </GameContext.Provider>
  )
}
