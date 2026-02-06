import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Ground() {
  const glowRef = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    if (glowRef.current) {
      const material = glowRef.current.material as THREE.MeshBasicMaterial
      material.opacity = 0.15 + Math.sin(state.clock.elapsedTime * 2) * 0.05
    }
  })

  return (
    <group>
      {/* Main ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 12]} />
        <meshStandardMaterial
          color="#0d1f2d"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Glowing border */}
      <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[9, 10, 4]} />
        <meshBasicMaterial color="#00fff0" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>

      {/* Corner accent lights */}
      <pointLight position={[-7, 0.5, -4]} intensity={0.5} color="#ff0066" distance={5} />
      <pointLight position={[7, 0.5, -4]} intensity={0.5} color="#ff0066" distance={5} />
      <pointLight position={[-7, 0.5, 4]} intensity={0.5} color="#39ff14" distance={5} />
      <pointLight position={[7, 0.5, 4]} intensity={0.5} color="#39ff14" distance={5} />
    </group>
  )
}
