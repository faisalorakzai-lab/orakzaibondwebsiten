import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const ALLOCATIONS = [
  { share: 0.6, color: "#c7a34d" },
  { share: 0.2, color: "#a98743" },
  { share: 0.1, color: "#8e7847" },
  { share: 0.1, color: "#b99a55" },
];

function VaultAssembly({
  activeIndex,
  animate,
}: {
  activeIndex: number;
  animate: boolean;
}) {
  const orbit = useRef<THREE.Group>(null);
  const handle = useRef<THREE.Group>(null);
  const segments = useMemo(() => {
    let offset = 0;
    return ALLOCATIONS.map((allocation, index) => {
      const start = -Math.PI / 2 + offset * Math.PI * 2;
      const arc = allocation.share * Math.PI * 2 - 0.035;
      const midpoint = start + (allocation.share * Math.PI);
      const x = Math.cos(midpoint) * 2.35;
      const y = Math.sin(midpoint) * 2.35;
      offset += allocation.share;
      return {
        ...allocation,
        index,
        start,
        arc,
        midpoint,
        x,
        y,
        active: index === activeIndex,
      };
    });
  }, [activeIndex]);

  useFrame((_, delta) => {
    if (!animate) return;
    const step = Math.min(delta, 0.05);
    if (orbit.current) orbit.current.rotation.z += step * 0.022;
    if (handle.current) handle.current.rotation.z -= step * 0.045;
  });

  return (
    <>
      <ambientLight intensity={1.15} />
      <directionalLight
        position={[-4, 4, 5]}
        intensity={2.25}
        color="#f6e1ae"
      />
      <pointLight
        position={[3, -2, 3]}
        intensity={1.1}
        color="#a6b39a"
        distance={10}
      />

      <group>
        <mesh position={[0, -0.02, -0.7]}>
          <cylinderGeometry args={[1.08, 1.18, 1.42, 40, 1]} />
          <meshStandardMaterial
            color="#171713"
            metalness={0.8}
            roughness={0.34}
          />
        </mesh>
        <mesh position={[0, 0.78, -0.7]}>
          <cylinderGeometry args={[0.9, 1.08, 0.16, 40, 1]} />
          <meshStandardMaterial
            color="#29261e"
            metalness={0.78}
            roughness={0.36}
          />
        </mesh>
        <mesh position={[0, -0.83, -0.7]}>
          <cylinderGeometry args={[1.16, 1.24, 0.16, 40, 1]} />
          <meshStandardMaterial
            color="#29261e"
            metalness={0.78}
            roughness={0.36}
          />
        </mesh>
        <mesh position={[0, -1.04, -0.48]}>
          <boxGeometry args={[2.7, 0.13, 0.52]} />
          <meshStandardMaterial
            color="#25231d"
            metalness={0.68}
            roughness={0.4}
          />
        </mesh>

        <mesh
          position={[0, -0.02, 0.08]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.84, 0.84, 0.16, 40]} />
          <meshStandardMaterial
            color="#28261f"
            metalness={0.83}
            roughness={0.3}
          />
        </mesh>
        <mesh position={[0, -0.02, 0.18]}>
          <torusGeometry args={[0.86, 0.045, 8, 48]} />
          <meshStandardMaterial
            color="#d2b464"
            metalness={0.86}
            roughness={0.25}
          />
        </mesh>
        <mesh position={[0, -0.02, 0.2]}>
          <torusGeometry args={[0.67, 0.018, 6, 40]} />
          <meshStandardMaterial
            color="#9d8242"
            metalness={0.8}
            roughness={0.3}
          />
        </mesh>

        {Array.from({ length: 8 }, (_, index) => {
          const angle = (index / 8) * Math.PI * 2;
          return (
            <mesh
              key={"bolt-" + index}
              position={[
                Math.cos(angle) * 0.72,
                -0.02 + Math.sin(angle) * 0.72,
                0.24,
              ]}
            >
              <sphereGeometry args={[0.045, 8, 8]} />
              <meshStandardMaterial
                color="#e2c77d"
                metalness={0.85}
                roughness={0.24}
              />
            </mesh>
          );
        })}

        <group ref={handle} position={[0, -0.02, 0.27]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.17, 0.17, 0.08, 24]} />
            <meshStandardMaterial
              color="#d2b464"
              metalness={0.84}
              roughness={0.27}
            />
          </mesh>
          <mesh>
            <torusGeometry args={[0.31, 0.018, 6, 32]} />
            <meshStandardMaterial
              color="#c6a75d"
              metalness={0.82}
              roughness={0.28}
            />
          </mesh>
          {[0, 1].map((index) => (
            <mesh
              key={"spoke-" + index}
              rotation={[0, 0, (index * Math.PI) / 2]}
            >
              <boxGeometry args={[0.48, 0.025, 0.025]} />
              <meshStandardMaterial
                color="#c6a75d"
                metalness={0.82}
                roughness={0.28}
              />
            </mesh>
          ))}
        </group>

        <group ref={orbit}>
          {segments.map((segment) => (
            <group key={"allocation-" + segment.index}>
              <mesh
                position={[0, 0, -0.08]}
                rotation={[0, 0, segment.start]}
              >
                <torusGeometry
                  args={[
                    2.02,
                    segment.active ? 0.083 : 0.064,
                    8,
                    Math.max(8, Math.round(segment.share * 64)),
                    segment.arc,
                  ]}
                />
                <meshStandardMaterial
                  color={segment.active ? "#f1d78f" : segment.color}
                  emissive={segment.active ? "#705523" : "#241d10"}
                  emissiveIntensity={segment.active ? 0.35 : 0.08}
                  metalness={0.85}
                  roughness={0.28}
                />
              </mesh>

              <mesh
                position={[
                  Math.cos(segment.midpoint) * 2.23,
                  Math.sin(segment.midpoint) * 2.23,
                  0.03,
                ]}
                rotation={[0, 0, segment.midpoint]}
              >
                <boxGeometry args={[0.46, 0.026, 0.028]} />
                <meshStandardMaterial
                  color={segment.active ? "#dfc477" : "#77643e"}
                  metalness={0.78}
                  roughness={0.34}
                />
              </mesh>

              <mesh position={[segment.x, segment.y, 0.08]}>
                <octahedronGeometry
                  args={[segment.active ? 0.2 : 0.17, 0]}
                />
                <meshStandardMaterial
                  color={segment.active ? "#f0d38a" : segment.color}
                  emissive={segment.active ? "#5e471f" : "#17130a"}
                  emissiveIntensity={segment.active ? 0.3 : 0.05}
                  metalness={0.78}
                  roughness={0.3}
                />
              </mesh>
            </group>
          ))}
        </group>
      </group>
    </>
  );
}

export default function SovereignVaultScene({
  activeIndex,
  animate,
}: {
  activeIndex: number;
  animate: boolean;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 8.6], fov: 38, near: 0.1, far: 30 }}
      dpr={[1, 1.25]}
      frameloop={animate ? "always" : "demand"}
      gl={{
        alpha: true,
        antialias: false,
        powerPreference: "low-power",
        preserveDrawingBuffer: false,
      }}
    >
      <VaultAssembly activeIndex={activeIndex} animate={animate} />
    </Canvas>
  );
}
