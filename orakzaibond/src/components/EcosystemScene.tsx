import { useRef } from "react";
import { ContactShadows, Html } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Group } from "three";

interface EcosystemSceneProps {
  reducedMotion: boolean;
}

function Globe({ reducedMotion }: EcosystemSceneProps) {
  const globe = useRef<Group>(null);
  const orbit = useRef<Group>(null);

  useFrame((_, delta) => {
    if (reducedMotion) return;
    if (globe.current) globe.current.rotation.y += delta * 0.045;
    if (orbit.current) orbit.current.rotation.y -= delta * 0.025;
  });

  return (
    <group>
      <group ref={globe}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[1.08, 56, 56]} />
          <meshPhysicalMaterial
            color="#17130c"
            metalness={0.82}
            roughness={0.24}
            clearcoat={0.9}
            clearcoatRoughness={0.16}
            emissive="#4a2c08"
            emissiveIntensity={0.16}
          />
        </mesh>

        <mesh>
          <sphereGeometry args={[1.092, 24, 16]} />
          <meshBasicMaterial
            color="#d4af37"
            wireframe
            transparent
            opacity={0.14}
          />
        </mesh>

        <Html position={[0, 0, 1.1]} center distanceFactor={1.55}>
          <div className="okbond-3d-wordmark">
            OK<span>BOND</span>
            <small>ORAKZAI</small>
          </div>
        </Html>
      </group>

      <group ref={orbit}>
        <mesh rotation={[1.12, -0.24, 0.38]}>
          <torusGeometry args={[1.52, 0.008, 8, 144]} />
          <meshStandardMaterial
            color="#dbb94f"
            metalness={0.8}
            roughness={0.34}
            transparent
            opacity={0.64}
          />
        </mesh>
        <mesh rotation={[0.48, 0.92, -0.24]}>
          <torusGeometry args={[1.34, 0.004, 8, 144]} />
          <meshStandardMaterial
            color="#a7802d"
            metalness={0.75}
            roughness={0.42}
            transparent
            opacity={0.38}
          />
        </mesh>
      </group>

      <mesh position={[1.06, 0.86, 0.55]}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshStandardMaterial
          color="#f5df9a"
          emissive="#c39a34"
          emissiveIntensity={1.1}
        />
      </mesh>
      <mesh position={[-1.2, -0.22, 0.35]}>
        <sphereGeometry args={[0.032, 16, 16]} />
        <meshStandardMaterial
          color="#b7dfc9"
          emissive="#277554"
          emissiveIntensity={0.8}
        />
      </mesh>
      <ContactShadows
        position={[0, -1.68, 0]}
        opacity={0.28}
        scale={3.6}
        blur={2.6}
        far={3.4}
      />
    </group>
  );
}

export default function EcosystemScene({ reducedMotion }: EcosystemSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.25], fov: 36 }}
      dpr={[1, 1.4]}
      frameloop={reducedMotion ? "demand" : "always"}
      gl={{
        alpha: true,
        antialias: false,
        failIfMajorPerformanceCaveat: true,
        powerPreference: "low-power",
      }}
    >
      <ambientLight intensity={0.55} />
      <pointLight position={[3.8, 3.8, 4]} intensity={22} color="#ffe6ad" />
      <pointLight position={[-3.5, -2.6, -3]} intensity={12} color="#286a50" />
      <pointLight position={[0, -3, 3]} intensity={5} color="#bd8e33" />
      <Globe reducedMotion={reducedMotion} />
    </Canvas>
  );
}
