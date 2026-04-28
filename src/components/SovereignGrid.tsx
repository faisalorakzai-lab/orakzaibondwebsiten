import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

function GridSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null);

  // Create random points on the sphere for "nodes"
  const nodes = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 40; i++) {
      const phi = Math.acos(-1 + (2 * i) / 40);
      const theta = Math.sqrt(40 * Math.PI) * phi;
      pts.push(
        new THREE.Vector3().setFromSphericalCoords(1.05, phi, theta)
      );
    }
    return pts;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = time * 0.2;
      meshRef.current.rotation.x = time * 0.1;
    }
    if (pointsRef.current) {
      pointsRef.current.rotation.y = time * 0.2;
      pointsRef.current.rotation.x = time * 0.1;
      
      // Periodic lighting effect for nodes
      const opacity = Math.abs(Math.sin(time * 2));
      if (pointsRef.current.material instanceof THREE.PointsMaterial) {
        pointsRef.current.material.opacity = 0.3 + opacity * 0.7;
      }
    }
  });

  return (
    <group>
      {/* Wireframe Sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial 
          color="#EAB308" 
          wireframe 
          transparent 
          opacity={0.2} 
        />
      </mesh>

      {/* Glowing Nodes */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={nodes.length}
            array={new Float32Array(nodes.flatMap(v => [v.x, v.y, v.z]))}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial 
          color="#22D3EE" 
          size={0.05} 
          transparent 
          opacity={0.8}
          sizeAttenuation
        />
      </points>
    </group>
  );
}

export default function SovereignGrid() {
  return (
    <div className="w-32 h-32 relative pointer-events-none">
      <div className="absolute inset-0 bg-primary/5 rounded-full blur-2xl animate-pulse" />
      <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-[8px] text-primary/40">Loading OSG...</div>}>
        <Canvas camera={{ position: [0, 0, 3], fov: 45 }} gl={{ antialias: true, alpha: true }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <GridSphere />
          </Float>
        </Canvas>
      </Suspense>
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
        <span className="text-[8px] font-mono font-bold text-primary/60 uppercase tracking-[0.2em] bg-black/40 px-2 py-0.5 rounded-full border border-primary/10">
          OSG Active
        </span>
      </div>
    </div>
  );
}
