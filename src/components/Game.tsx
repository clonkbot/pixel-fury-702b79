import { useRef, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { useGame } from '../context/GameContext'
import Player from './Player'
import Enemy from './Enemy'
import Ground from './Ground'

export default function Game() {
  const { screenShake, gameState, enemies, playerPosition, isAttacking, attackType, hitEnemy } = useGame()
  const groupRef = useRef<THREE.Group>(null!)
  const { camera } = useThree()
  const shakeRef = useRef({ x: 0, y: 0 })

  // Check attack collisions
  useEffect(() => {
    if (!isAttacking || !attackType) return

    const attackRange = attackType === 'special' ? 3 : 1.8
    const damage = attackType === 'punch' ? 10 : attackType === 'kick' ? 15 : 25

    enemies.forEach(enemy => {
      const dx = enemy.position[0] - playerPosition[0]
      const dz = enemy.position[2] - playerPosition[2]
      const dist = Math.sqrt(dx * dx + dz * dz)

      if (dist < attackRange) {
        hitEnemy(enemy.id, damage)
      }
    })
  }, [isAttacking, attackType, enemies, playerPosition, hitEnemy])

  useFrame((state, delta) => {
    if (screenShake > 0 && groupRef.current) {
      shakeRef.current.x = (Math.random() - 0.5) * screenShake * 0.1
      shakeRef.current.y = (Math.random() - 0.5) * screenShake * 0.1
      groupRef.current.position.x = shakeRef.current.x
      groupRef.current.position.y = shakeRef.current.y
    } else if (groupRef.current) {
      groupRef.current.position.x *= 0.9
      groupRef.current.position.y *= 0.9
    }

    // Camera follows player slightly
    const targetX = playerPosition[0] * 0.3
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, delta * 2)
  })

  const gridLines = useMemo(() => {
    const lines: JSX.Element[] = []
    for (let i = -10; i <= 10; i++) {
      lines.push(
        <line key={`h${i}`}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([-15, 0.01, i, 15, 0.01, i])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#1a3a4a" transparent opacity={0.5} />
        </line>
      )
      lines.push(
        <line key={`v${i}`}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([i * 1.5, 0.01, -10, i * 1.5, 0.01, 10])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#1a3a4a" transparent opacity={0.5} />
        </line>
      )
    }
    return lines
  }, [])

  return (
    <group ref={groupRef}>
      {/* Lighting */}
      <ambientLight intensity={0.3} color="#4a2a6a" />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1}
        color="#ff66aa"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-5, 5, -5]} intensity={0.8} color="#00fff0" />
      <pointLight position={[5, 3, 5]} intensity={0.5} color="#39ff14" />

      {/* Background */}
      <Stars
        radius={100}
        depth={50}
        count={1000}
        factor={4}
        saturation={0.5}
        fade
        speed={0.5}
      />

      {/* Ground */}
      <Ground />

      {/* Grid */}
      <group>{gridLines}</group>

      {/* Shadows */}
      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.6}
        scale={30}
        blur={2}
        far={10}
        color="#000020"
      />

      {/* Player */}
      {gameState !== 'title' && <Player />}

      {/* Enemies */}
      {enemies.map(enemy => (
        <Enemy key={enemy.id} enemy={enemy} />
      ))}

      {/* Arena walls (visual) */}
      <mesh position={[-8, 1, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.2, 2, 10]} />
        <meshStandardMaterial color="#0d1f2d" emissive="#00fff0" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[8, 1, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.2, 2, 10]} />
        <meshStandardMaterial color="#0d1f2d" emissive="#00fff0" emissiveIntensity={0.2} />
      </mesh>
    </group>
  )
}
