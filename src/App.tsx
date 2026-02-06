import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import Game from './components/Game'
import HUD from './components/HUD'
import { GameProvider } from './context/GameContext'

export default function App() {
  return (
    <GameProvider>
      <div className="w-screen h-screen bg-[#0a0612] overflow-hidden relative">
        {/* CRT Scanlines Overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-50"
          style={{
            background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 3px)',
            mixBlendMode: 'multiply'
          }}
        />

        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none z-40"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(10,6,18,0.8) 100%)'
          }}
        />

        {/* 3D Canvas */}
        <Canvas
          camera={{ position: [0, 8, 12], fov: 50 }}
          shadows
          style={{ background: 'linear-gradient(180deg, #0a0612 0%, #1a0a2e 50%, #0d1f2d 100%)' }}
        >
          <Suspense fallback={null}>
            <Game />
          </Suspense>
        </Canvas>

        {/* HUD Overlay */}
        <HUD />

        {/* Footer */}
        <footer className="absolute bottom-2 left-0 right-0 z-30 text-center">
          <p className="text-[10px] md:text-xs text-[#3a3a5a] font-mono tracking-wider opacity-60">
            Requested by @lol00302503 · Built by @clonkbot
          </p>
        </footer>
      </div>
    </GameProvider>
  )
}
