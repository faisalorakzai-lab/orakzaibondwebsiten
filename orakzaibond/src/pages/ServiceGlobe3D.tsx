import { useEffect, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";

interface ServiceGlobe3DProps {
  enabled: boolean;
  fallback: ReactNode;
}

/** A small, lazy-loaded Three.js scene. Failure always leaves the CSS globe in place. */
export default function ServiceGlobe3D({ enabled, fallback }: ServiceGlobe3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!enabled || !canvas) return;

    let disposed = false;
    let frame = 0;
    let renderer: import("three").WebGLRenderer | undefined;
    let observer: ResizeObserver | undefined;
    let disposeScene: (() => void) | undefined;

    const start = () => {
      try {
        if (disposed || !canvasRef.current) return;

        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: false,
          powerPreference: "low-power",
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 40);
        camera.position.set(0, 0, 4.7);

        scene.add(new THREE.AmbientLight(0xffedc2, 1.35));
        const key = new THREE.PointLight(0xffdfa0, 36, 18);
        key.position.set(3.3, 3.4, 4.2);
        scene.add(key);
        const fill = new THREE.PointLight(0x507b57, 18, 14);
        fill.position.set(-3, -2.5, -2.5);
        scene.add(fill);
        const rim = new THREE.PointLight(0xd5a547, 15, 12);
        rim.position.set(0, -3, 3);
        scene.add(rim);

        const globe = new THREE.Group();
        scene.add(globe);
        const sphere = new THREE.Mesh(
          new THREE.SphereGeometry(1.08, 48, 40),
          new THREE.MeshPhysicalMaterial({
            color: 0x66502a,
            metalness: 0.84,
            roughness: 0.24,
            clearcoat: 0.95,
            clearcoatRoughness: 0.16,
            emissive: 0x3b2609,
            emissiveIntensity: 0.24,
          }),
        );
        globe.add(sphere);

        const grid = new THREE.Mesh(
          new THREE.SphereGeometry(1.091, 32, 24),
          new THREE.MeshBasicMaterial({ color: 0xd5b45c, wireframe: true, transparent: true, opacity: 0.16 }),
        );
        globe.add(grid);

        const orbit = new THREE.Group();
        scene.add(orbit);
        const orbitA = new THREE.Mesh(
          new THREE.TorusGeometry(1.5, 0.008, 6, 128),
          new THREE.MeshStandardMaterial({ color: 0xe1bf65, metalness: 0.82, roughness: 0.3, transparent: true, opacity: 0.72 }),
        );
        orbitA.rotation.set(1.12, -0.24, 0.38);
        orbit.add(orbitA);
        const orbitB = new THREE.Mesh(
          new THREE.TorusGeometry(1.36, 0.005, 6, 128),
          new THREE.MeshStandardMaterial({ color: 0x9d7932, metalness: 0.78, roughness: 0.4, transparent: true, opacity: 0.42 }),
        );
        orbitB.rotation.set(0.48, 0.92, -0.24);
        orbit.add(orbitB);

        const nodeMaterial = new THREE.MeshStandardMaterial({ color: 0xf0d58d, emissive: 0x9b7021, emissiveIntensity: 1.1, metalness: 0.38, roughness: 0.25 });
        for (const position of [[1.02, 0.83, 0.54], [-1.17, -0.2, 0.37], [0.42, -1.02, 0.48], [-0.34, 0.98, 0.51]] as const) {
          const node = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 10), nodeMaterial);
          node.position.set(position[0], position[1], position[2]);
          scene.add(node);
        }

        const resize = () => {
          if (!renderer || !canvas.parentElement) return;
          const { width, height } = canvas.parentElement.getBoundingClientRect();
          if (width < 1 || height < 1) return;
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.render(scene, camera);
        };
        observer = new ResizeObserver(resize);
        if (canvas.parentElement) observer.observe(canvas.parentElement);
        resize();
        setReady(true);

        let last = 0;
        const animate = (time: number) => {
          if (disposed || !renderer) return;
          if (time - last > 30) {
            const delta = Math.min((time - last) / 1000, 0.05);
            last = time;
            globe.rotation.y += delta * 0.045;
            orbit.rotation.y -= delta * 0.025;
            renderer.render(scene, camera);
          }
          frame = window.requestAnimationFrame(animate);
        };
        frame = window.requestAnimationFrame(animate);

        disposeScene = () => {
          scene.traverse((object) => {
            if (object instanceof THREE.Mesh) {
              object.geometry.dispose();
              const materials = Array.isArray(object.material) ? object.material : [object.material];
              materials.forEach((material) => material.dispose());
            }
          });
        };
      } catch {
        if (!disposed) setReady(false);
      }
    };

    start();
    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
      disposeScene?.();
      renderer?.dispose();
      setReady(false);
    };
  }, [enabled]);

  if (!enabled) return <>{fallback}</>;
  return <>
    <canvas ref={canvasRef} className="service-globe-stage__canvas" aria-hidden="true" style={{ opacity: ready ? 1 : 0 }} />
    {!ready && <div className="service-globe-stage__fallback" aria-hidden="true">{fallback}</div>}
  </>;
}
