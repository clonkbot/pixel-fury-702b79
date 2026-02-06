import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGame } from '../context/GameContext'

interface EnemyProps {
  enemy: {
    id: number
    position: [number, number, number]
    health: number
    maxHealth: number
    isHit: boolean
    type: 'grunt' | 'brute' | 'ninja'
  }
}

export default function Enemy({ enemy }: EnemyProps) {
  const { playerPosition, playerHit, gameState } = useGame()
  const meshRef = useRef<THREE.Group>(null!)
  const posRef = useRef({ x: enemy.position[0], z: enemy.position[2] })
  const attackCooldownRef = useRef(0)

  const colors = {
    grunt: { body: '#ff0066', emissive: '#ff0066' },
    brute: { body: '#aa00ff', emissive: '#aa00ff' },
    ninja: { body: '#ff6600', emissive: '#ff6600' }
  }

  const scale = enemy.type === 'brute' ? 1.3 : enemy.type === 'ninja' ? 0.8 : 1

  useFrame((state, delta) => {
    if (!meshRef.current || gameState !== 'playing') return

    // Move towards player
    const speed = enemy.type === 'ninja' ? 2.5 : enemy.type === 'brute' ? 1 : 1.5
    const dx = playerPosition[0] - posRef.current.x
    const dz = playerPosition[2] - posRef.current.z
    const dist = Math.sqrt(dx * dx + dz * dz)

    if (dist > 1.2) {
      posRef.current.x += (dx / dist) * speed * delta
      posRef.current.z += (dz / dist) * speed * delta
    } else {
      // Attack player
      attackCooldownRef.current -= delta
      if (attackCooldownRef.current <= 0) {
        const damage = enemy.type === 'brute' ? 15 : enemy.type === 'ninja' ? 8 : 10
        playerHit(damage)
        attackCooldownRef.current = enemy.type === 'ninja' ? 0.8 : 1.5
      }
    }

    meshRef.current.position.x = posRef.current.x
    meshRef.current.position.z = posRef.current.z

    // Face player
    meshRef.current.lookAt(playerPosition[0], 0, playerPosition[2])

    // Idle bob
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 4 + enemy.id) * 0.03

    // Hit flash
    if (enemy.isHit) {
      meshRef.current.scale.setScalar(scale * 1.3)
    } else {
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.2)
    }
  })

  // Sync position when enemy respawns
  useEffect(() => {
    posRef.current = { x: enemy.position[0], z: enemy.position[2] }
  }, [enemy.id, enemy.position])

  const { body, emissive } = colors[enemy.type]

  return (
    <group ref={meshRef} position={[enemy.position[0], 0, enemy.position[2]]} scale={scale}>
      {/* Glow */}
      <pointLight position={[0, 1, 0]} intensity={enemy.isHit ? 3 : 0.8} color={emissive} distance={3} />

      {/* Health bar */}
      <group position={[0, 2.2, 0]}>
        <mesh>
          <planeGeometry args={[0.8, 0.1]} />
          <meshBasicMaterial color="#220011" />
        </mesh>
        <mesh position={[-(0.8 - (enemy.health / enemy.maxHealth) * 0.8) / 2, 0, 0.01]}>
          <planeGeometry args={[(enemy.health / enemy.maxHealth) * 0.8, 0.08]} />
          <meshBasicMaterial color={enemy.type === 'brute' ? '#aa00ff' : '#ff0066'} />
        </mesh>
      </group>

      {/* Body */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <boxGeometry args={[0.5, 0.7, 0.35]} />
        <meshStandardMaterial
          color={enemy.isHit ? '#ffffff' : body}
          emissive={enemy.isHit ? '#ffffff' : emissive}
          emissiveIntensity={enemy.isHit ? 2 : 0.4}
        />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <boxGeometry args={[0.45, 0.45, 0.35]} />
        <meshStandardMaterial
          color={enemy.isHit ? '#ffffff' : '#333333'}
          emissive={enemy.isHit ? '#ffffff' : '#111111'}
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Evil eyes */}
      <mesh position={[-0.1, 1.45, 0.18]}>
        <boxGeometry args={[0.1, 0.05, 0.02]} />
        <meshBasicMaterial color={enemy.isHit ? '#ffffff' : '#ff0000'} />
      </mesh>
      <mesh position={[0.1, 1.45, 0.18]}>
        <boxGeometry args={[0.1, 0.05, 0.02]} />
        <meshBasicMaterial color={enemy.isHit ? '#ffffff' : '#ff0000'} />
      </mesh>

      {/* Arms */}
      <mesh position={[-0.38, 0.8, 0]} castShadow>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial
          color={enemy.isHit ? '#ffffff' : '#333333'}
          emissive={enemy.isHit ? '#ffffff' : '#111111'}
        />
      </mesh>
      <mesh position={[0.38, 0.8, 0]} castShadow>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial
          color={enemy.isHit ? '#ffffff' : '#333333'}
          emissive={enemy.isHit ? '#ffffff' : '#111111'}
        />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.15, 0.25, 0]} castShadow>
        <boxGeometry args={[0.2, 0.5, 0.25]} />
        <meshStandardMaterial
          color={enemy.isHit ? '#ffffff' : '#222222'}
          emissive={enemy.isHit ? '#ffffff' : '#000000'}
        />
      </mesh>
      <mesh position={[0.15, 0.25, 0]} castShadow>
        <boxGeometry args={[0.2, 0.5, 0.25]} />
        <meshStandardMaterial
          color={enemy.isHit ? '#ffffff' : '#222222'}
          emissive={enemy.isHit ? '#ffffff' : '#000000'}
        />
      </mesh>

      {/* Brute shoulder pads */}
      {enemy.type === 'brute' && (
        <>
          <mesh position={[-0.4, 1.1, 0]}>
            <boxGeometry args={[0.25, 0.15, 0.35]} />
            <meshStandardMaterial color="#aa00ff" emissive="#aa00ff" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0.4, 1.1, 0]}>
            <boxGeometry args={[0.25, 0.15, 0.35]} />
            <meshStandardMaterial color="#aa00ff" emissive="#aa00ff" emissiveIntensity={0.5} />
          </mesh>
        </>
      )}

      {/* Ninja headband */}
      {enemy.type === 'ninja' && (
        <mesh position={[0, 1.55, 0]}>
          <boxGeometry args={[0.5, 0.08, 0.4]} />
          <meshStandardMaterial color="#ff6600" emissive="#ff6600" emissiveIntensity={0.8} />
        </mesh>
      )}
    </group>
  )
}
