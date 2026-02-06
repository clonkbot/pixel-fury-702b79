import { useRef, useEffect, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGame } from '../context/GameContext'

export default function Player() {
  const { playerPosition, isAttacking, attackType, movePlayer, attack, gameState } = useGame()
  const meshRef = useRef<THREE.Group>(null)
  const bodyRef = useRef<THREE.Group>(null)
  const glowRef = useRef<THREE.PointLight>(null)

  const keysPressed = useRef<Set<string>>(new Set())

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameState !== 'playing') return
    keysPressed.current.add(e.key.toLowerCase())

    // Attack keys
    if (e.key === 'z' || e.key === 'Z') attack('punch')
    if (e.key === 'x' || e.key === 'X') attack('kick')
    if (e.key === 'c' || e.key === 'C') attack('special')
  }, [attack, gameState])

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keysPressed.current.delete(e.key.toLowerCase())
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleKeyDown, handleKeyUp])

  useFrame((state, delta) => {
    if (!meshRef.current || gameState !== 'playing') return

    // Continuous movement
    if (keysPressed.current.has('arrowleft') || keysPressed.current.has('a')) movePlayer('left')
    if (keysPressed.current.has('arrowright') || keysPressed.current.has('d')) movePlayer('right')
    if (keysPressed.current.has('arrowup') || keysPressed.current.has('w')) movePlayer('up')
    if (keysPressed.current.has('arrowdown') || keysPressed.current.has('s')) movePlayer('down')

    // Smooth position
    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, playerPosition[0], delta * 10)
    meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, playerPosition[2], delta * 10)

    // Idle bob
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 0.05

    // Attack animation
    if (isAttacking && bodyRef.current) {
      const targetScale = attackType === 'special' ? 1.4 : 1.2
      bodyRef.current.scale.x = THREE.MathUtils.lerp(bodyRef.current.scale.x, targetScale, 0.3)
      bodyRef.current.scale.z = THREE.MathUtils.lerp(bodyRef.current.scale.z, targetScale, 0.3)

      if (glowRef.current) {
        glowRef.current.intensity = attackType === 'special' ? 5 : 3
      }
    } else if (bodyRef.current) {
      bodyRef.current.scale.x = THREE.MathUtils.lerp(bodyRef.current.scale.x, 1, 0.2)
      bodyRef.current.scale.z = THREE.MathUtils.lerp(bodyRef.current.scale.z, 1, 0.2)

      if (glowRef.current) {
        glowRef.current.intensity = THREE.MathUtils.lerp(glowRef.current.intensity, 1.5, 0.1)
      }
    }
  })

  return (
    <group ref={meshRef as React.RefObject<THREE.Group>} position={[playerPosition[0], 0, playerPosition[2]]}>
      {/* Glow light */}
      <pointLight ref={glowRef as React.RefObject<THREE.PointLight>} position={[0, 1, 0]} intensity={1.5} color="#00fff0" distance={4} />

      {/* Body */}
      <group ref={bodyRef as React.RefObject<THREE.Group>}>
        {/* Torso */}
        <mesh position={[0, 0.9, 0]} castShadow>
          <boxGeometry args={[0.6, 0.8, 0.4]} />
          <meshStandardMaterial
            color="#00cccc"
            emissive="#00fff0"
            emissiveIntensity={0.5}
          />
        </mesh>

        {/* Head */}
        <mesh position={[0, 1.5, 0]} castShadow>
          <boxGeometry args={[0.5, 0.5, 0.4]} />
          <meshStandardMaterial
            color="#ffddaa"
            emissive="#ffaa66"
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* Eyes */}
        <mesh position={[-0.12, 1.55, 0.21]}>
          <boxGeometry args={[0.12, 0.08, 0.02]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.12, 1.55, 0.21]}>
          <boxGeometry args={[0.12, 0.08, 0.02]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* Headband */}
        <mesh position={[0, 1.65, 0]}>
          <boxGeometry args={[0.55, 0.1, 0.45]} />
          <meshStandardMaterial color="#ff0066" emissive="#ff0066" emissiveIntensity={0.5} />
        </mesh>

        {/* Arms */}
        <mesh position={[-0.45, 0.9, 0]} castShadow>
          <boxGeometry args={[0.25, 0.7, 0.25]} />
          <meshStandardMaterial color="#ffddaa" emissive="#ffaa66" emissiveIntensity={0.2} />
        </mesh>
        <mesh position={[0.45, 0.9, 0]} castShadow>
          <boxGeometry args={[0.25, 0.7, 0.25]} />
          <meshStandardMaterial color="#ffddaa" emissive="#ffaa66" emissiveIntensity={0.2} />
        </mesh>

        {/* Legs */}
        <mesh position={[-0.18, 0.25, 0]} castShadow>
          <boxGeometry args={[0.25, 0.5, 0.3]} />
          <meshStandardMaterial color="#222266" emissive="#000033" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0.18, 0.25, 0]} castShadow>
          <boxGeometry args={[0.25, 0.5, 0.3]} />
          <meshStandardMaterial color="#222266" emissive="#000033" emissiveIntensity={0.3} />
        </mesh>
      </group>

      {/* Attack effect ring */}
      {isAttacking && (
        <mesh position={[0, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, attackType === 'special' ? 3 : 1.8, 32]} />
          <meshBasicMaterial
            color={attackType === 'special' ? '#39ff14' : '#00fff0'}
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  )
}
