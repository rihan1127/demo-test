import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ── Architectural geometry helpers ── */

/** A single glass tower mass */
function Tower({ position = [0, 0, 0], scale = [1, 1, 1], opacity = 0.18, wireframe = false }) {
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#1a3a4f'),
    metalness: 0.55,
    roughness: 0.25,
    transparent: true,
    opacity,
    wireframe,
    side: THREE.DoubleSide,
  }), [opacity, wireframe]);

  return (
    <mesh position={position} scale={scale} material={mat}>
      <boxGeometry args={[1, 1, 1, 4, 16, 4]} />
    </mesh>
  );
}

/** Horizontal floor plate */
function FloorPlate({ position, width = 1.8, depth = 0.9, opacity = 0.12 }) {
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#c8aa78'),
    metalness: 0.4,
    roughness: 0.5,
    transparent: true,
    opacity,
  }), [opacity]);
  return (
    <mesh position={position} material={mat}>
      <boxGeometry args={[width, 0.015, depth]} />
    </mesh>
  );
}

/** Vertical structural line */
function StructuralLine({ start, end, opacity = 0.15 }) {
  const points = useMemo(() => [new THREE.Vector3(...start), new THREE.Vector3(...end)], [start, end]);
  const geo = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);
  return (
    <line geometry={geo}>
      <lineBasicMaterial color="#c8aa78" transparent opacity={opacity} />
    </line>
  );
}

/** Floating particle field */
function ParticleField({ count = 300 }) {
  const posRef = useRef();
  const { positions, speeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 28;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 28;
      spd[i] = 0.0008 + Math.random() * 0.0012;
    }
    return { positions: pos, speeds: spd };
  }, [count]);

  useFrame(({ clock }) => {
    if (!posRef.current) return;
    const arr = posRef.current.attributes.position.array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i];
      if (arr[i * 3 + 1] > 9) arr[i * 3 + 1] = -9;
    }
    posRef.current.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={posRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#c8aa78" size={0.04} transparent opacity={0.35} sizeAttenuation />
    </points>
  );
}

/** Architectural grid on ground plane */
function ArchGrid() {
  const lines = useMemo(() => {
    const pts = [];
    const spacing = 1.2;
    const count = 18;
    for (let i = -count; i <= count; i++) {
      pts.push([i * spacing, -0.01, -count * spacing], [i * spacing, -0.01, count * spacing]);
      pts.push([-count * spacing, -0.01, i * spacing], [count * spacing, -0.01, i * spacing]);
    }
    return pts;
  }, []);

  const geo = useMemo(() => {
    const points = lines.map(p => new THREE.Vector3(...p));
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [lines]);

  return (
    <line geometry={geo}>
      <lineBasicMaterial color="#1d3a52" transparent opacity={0.28} />
    </line>
  );
}

/** The main architectural cluster — city of towers */
function ArchitecturalCity({ sceneProgress }) {
  const groupRef = useRef();

  const towers = useMemo(() => [
    { pos: [-3.2, 1.8, -6], scale: [0.55, 3.6, 0.55] },
    { pos: [-1.8, 1.2, -5], scale: [0.45, 2.4, 0.45] },
    { pos: [0,    2.4, -7], scale: [0.65, 4.8, 0.65] },
    { pos: [1.5,  1.5, -5.5], scale: [0.5, 3.0, 0.5] },
    { pos: [3.0,  2.0, -6.5], scale: [0.6, 4.0, 0.6] },
    { pos: [-4.5, 1.0, -5], scale: [0.4, 2.0, 0.4] },
    { pos: [4.5,  1.3, -5.5], scale: [0.42, 2.6, 0.42] },
    { pos: [-2.5, 0.7, -3.5], scale: [0.38, 1.4, 0.38] },
    { pos: [2.5,  0.8, -4],   scale: [0.4, 1.6, 0.4] },
    { pos: [0,    3.0, -10],  scale: [0.8, 6.0, 0.8] },
  ], []);

  const floors = useMemo(() => {
    const f = [];
    towers.forEach(({ pos, scale }) => {
      const h = scale[1];
      const floors_n = Math.floor(h / 0.35);
      for (let i = 0; i < floors_n; i++) {
        f.push({ pos: [pos[0], i * 0.35 - 0.1, pos[2]], w: scale[0] * 1.8, d: scale[2] * 1.8 });
      }
    });
    return f;
  }, [towers]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.00015;
    }
  });

  return (
    <group ref={groupRef}>
      {towers.map((t, i) => (
        <Tower key={i} position={t.pos} scale={t.scale} opacity={0.12 + sceneProgress * 0.12} />
      ))}
      {floors.map((f, i) => (
        <FloorPlate key={`f${i}`} position={f.pos} width={f.w} depth={f.d}
          opacity={0.06 + sceneProgress * 0.1} />
      ))}
      {towers.map((t, i) => (
        <StructuralLine key={`l${i}`}
          start={[t.pos[0], 0, t.pos[2]]}
          end={[t.pos[0], t.scale[1] * 2, t.pos[2]]}
          opacity={0.1 + sceneProgress * 0.15} />
      ))}
    </group>
  );
}

/* ── Main exported scene ── */
export default function LegacyScene({ sceneProgress = 0, mouseRef }) {
  const { camera, scene } = useThree();

  useEffect(() => {
    scene.fog = new THREE.FogExp2('#04111c', 0.055);
    camera.position.set(0, 2.5, 14);
    camera.lookAt(0, 1, 0);
  }, [camera, scene]);

  useFrame(() => {
    if (!mouseRef?.current) return;
    const { x, y } = mouseRef.current;
    camera.rotation.y += (x * 0.035 - camera.rotation.y) * 0.04;
    camera.rotation.x += (y * -0.02 - camera.rotation.x) * 0.04;
  });

  return (
    <>
      {/* Ambient */}
      <ambientLight intensity={0.18} color="#7ba3ba" />
      {/* Key directional — warm golden */}
      <directionalLight position={[8, 12, -4]} intensity={0.6} color="#d4a96a" castShadow />
      {/* Fill — cool blue */}
      <directionalLight position={[-6, 4, 8]} intensity={0.25} color="#4a8bb5" />
      {/* Accent — gold strip from below */}
      <pointLight position={[0, -2, 0]} intensity={1.2} color="#c8a060" distance={14} decay={2} />

      <ArchGrid />
      <ParticleField count={280} />
      <ArchitecturalCity sceneProgress={sceneProgress} />
    </>
  );
}
