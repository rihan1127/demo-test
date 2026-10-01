import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const getP = (p) => (typeof p === 'object' && p !== null ? (p.current ?? 0) : (Number(p) || 0));

/* ── Minimal Ambient Grid & Architectural Towers ── */
function CityEnvironment({ progress }) {
  const groupRef = useRef();

  const towerData = useMemo(() => {
    const list = [];
    const count = 24;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + 0.1;
      const dist = 5 + (i % 4) * 3;
      const h = 2.5 + (i % 5) * 1.4;
      const w = 0.6 + (i % 3) * 0.3;
      list.push({
        pos: [Math.cos(angle) * dist, h / 2 - 1, Math.sin(angle) * dist - 6],
        scale: [w, h, w],
        isGold: i % 4 === 0,
      });
    }
    return list;
  }, []);

  const gridGeo = useMemo(() => {
    const pts = [];
    const size = 24;
    const step = 2;
    for (let x = -size; x <= size; x += step) {
      pts.push(new THREE.Vector3(x, -1, -size), new THREE.Vector3(x, -1, size));
    }
    for (let z = -size; z <= size; z += step) {
      pts.push(new THREE.Vector3(-size, -1, z), new THREE.Vector3(size, -1, z));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = getP(progress) * 0.18;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Ground Grid - Very subtle */}
      <lineSegments geometry={gridGeo}>
        <lineBasicMaterial color="#18364e" transparent opacity={0.25} />
      </lineSegments>

      {/* Abstract Towers */}
      {towerData.map((t, i) => (
        <group key={i} position={t.pos} scale={t.scale}>
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshPhysicalMaterial
              color={t.isGold ? '#1e180d' : '#05141f'}
              emissive={t.isGold ? '#c9a96a' : '#072033'}
              emissiveIntensity={t.isGold ? 0.2 : 0.05}
              transparent
              opacity={0.3}
              roughness={0.25}
              metalness={0.8}
            />
          </mesh>
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(1, 1, 1)]} />
            <lineBasicMaterial
              color={t.isGold ? '#c9a96a' : '#2d6285'}
              transparent
              opacity={0.35}
            />
          </lineSegments>
        </group>
      ))}
    </group>
  );
}

/* ── Verona Signature Tower Structure ── */
function VeronaStructure({ progress }) {
  const groupRef = useRef();

  useFrame(() => {
    if (!groupRef.current) return;
    const p = getP(progress);
    const vProgress = Math.max(0, Math.min(1, (p - 0.70) / 0.20));
    groupRef.current.visible = vProgress > 0;
    if (vProgress > 0) {
      groupRef.current.rotation.y = (p - 0.75) * 0.8;
    }
  });

  const floorPlates = useMemo(() => {
    const list = [];
    const count = 22;
    for (let i = 0; i < count; i++) {
      list.push({ y: i * 0.3 - 0.8, scale: 1 - (i / count) * 0.2 });
    }
    return list;
  }, []);

  return (
    <group ref={groupRef} position={[0, 0, -1]}>
      {/* Structural Tower Core */}
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[1.6, 7, 1.6]} />
        <meshStandardMaterial
          color="#06131b"
          emissive="#c9a96a"
          emissiveIntensity={0.2}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Wireframe edges */}
      <lineSegments position={[0, 2.5, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(2.2, 7.2, 2.2)]} />
        <lineBasicMaterial color="#c9a96a" transparent opacity={0.7} />
      </lineSegments>

      {/* Floor Plates */}
      {floorPlates.map((fl, i) => (
        <mesh key={i} position={[0, fl.y, 0]} scale={[fl.scale, 1, fl.scale]}>
          <boxGeometry args={[2.5, 0.04, 2.5]} />
          <meshStandardMaterial
            color="#c9a96a"
            emissive="#c9a96a"
            emissiveIntensity={0.35}
            transparent
            opacity={0.75}
          />
        </mesh>
      ))}

      {/* Interior Warm Light */}
      <pointLight position={[0, 2.5, 0]} color="#c9a96a" intensity={2.2} distance={10} />
    </group>
  );
}

/* ── Water Surface for Coastal Phase ── */
function CoastalWater({ progress }) {
  const meshRef = useRef();

  useFrame(() => {
    if (!meshRef.current) return;
    const p = getP(progress);
    meshRef.current.visible = p >= 0.55;
    if (p >= 0.55 && meshRef.current.material) {
      meshRef.current.material.opacity = Math.max(0, Math.min(0.7, (p - 0.58) * 3));
    }
  });

  return (
    <mesh ref={meshRef} position={[0, -1.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[80, 80]} />
      <meshStandardMaterial
        color="#04121d"
        roughness={0.15}
        metalness={0.85}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
}

/* ── Subtle Gold Ambient Dust ── */
function AmbientDust({ count = 160 }) {
  const ref = useRef();
  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
      spd[i] = 0.001 + Math.random() * 0.002;
    }
    return [pos, spd];
  }, [count]);

  useFrame(() => {
    if (!ref.current) return;
    const arr = ref.current.attributes.position.array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i];
      if (arr[i * 3 + 1] > 8) arr[i * 3 + 1] = -8;
    }
    ref.current.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#c9a96a" size={0.04} transparent opacity={0.35} sizeAttenuation />
    </points>
  );
}

/* ── Discrete Camera Controller per Chapter ── */
function CameraRig({ progress, mouseRef }) {
  const { camera } = useThree();

  useFrame(() => {
    const p = Math.max(0, Math.min(1, getP(progress)));
    const mx = (mouseRef?.current?.x || 0) * 0.6;
    const my = (mouseRef?.current?.y || 0) * 0.4;

    let targetX = 0;
    let targetY = 2.0;
    let targetZ = 14.0;
    let lookY = 1.0;

    if (p < 0.12) {
      // Scene 0 (Intro): High steady wide angle
      targetX = mx;
      targetY = 2.2 + my;
      targetZ = 14.0;
      lookY = 1.0;
    } else if (p < 0.25) {
      // Scene 1 (1980): Approach 3D environment
      const t = (p - 0.12) / 0.13;
      targetX = mx * 0.8;
      targetY = 1.5 + my;
      targetZ = 14.0 - t * 4.5; // 14 -> 9.5
      lookY = 0.8;
    } else if (p < 0.38) {
      // Scene 2 (1986): Shift sideways into leadership perspective
      const t = (p - 0.25) / 0.13;
      targetX = 2.5 * t + mx;
      targetY = 1.8 + my;
      targetZ = 9.5 - t * 1.5; // 9.5 -> 8.0
      lookY = 1.0;
    } else if (p < 0.62) {
      // Scene 3 (Milestones Museum): Elevated horizontal tracking shot
      const t = (p - 0.38) / 0.24;
      targetX = (t - 0.5) * 4.0 + mx;
      targetY = 2.8 + my;
      targetZ = 9.0;
      lookY = 1.2;
    } else if (p < 0.76) {
      // Scene 4 (City Meets Sea / Madh Island): Rise towards the coastal horizon
      const t = (p - 0.62) / 0.14;
      targetX = mx;
      targetY = 3.5 + t * 1.5 + my;
      targetZ = 9.0 + t * 2.0; // 9 -> 11
      lookY = 1.5;
    } else if (p < 0.90) {
      // Scene 5 (Verona Architecture Reveal): Orbit around Verona tower
      const t = (p - 0.76) / 0.14;
      const angle = t * Math.PI * 0.8;
      targetX = Math.sin(angle) * 6.5 + mx;
      targetY = 3.8 + Math.cos(angle) * 0.8 + my;
      targetZ = Math.cos(angle) * 6.5 + 2.0;
      lookY = 2.2;
    } else {
      // Scene 6 (Finale & Section Blend): Pull back high into aerial horizon
      const t = (p - 0.90) / 0.10;
      targetX = mx;
      targetY = 4.5 + t * 4.0;
      targetZ = 8.0 + t * 10.0; // Pull back to 18
      lookY = 1.2;
    }

    // Smooth lerp
    camera.position.x += (targetX - camera.position.x) * 0.08;
    camera.position.y += (targetY - camera.position.y) * 0.08;
    camera.position.z += (targetZ - camera.position.z) * 0.08;
    camera.lookAt(0, lookY, 0);
  });

  return null;
}

export default function Legacy3DCanvas({ scrollProgress = 0, scrollProgressRef, mouseRef }) {
  const pProp = scrollProgressRef || scrollProgress;
  return (
    <div className="legacy-3d-canvas-wrap">
      <Canvas
        camera={{ position: [0, 2, 14], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ scene, gl }) => {
          scene.fog = new THREE.FogExp2('#06131b', 0.045);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
      >
        <ambientLight color="#324f63" intensity={0.35} />
        <directionalLight position={[8, 12, 5]} color="#c9a96a" intensity={0.8} />
        <directionalLight position={[-8, 6, -5]} color="#3d789e" intensity={0.4} />

        <CityEnvironment progress={pProp} />
        <CoastalWater progress={pProp} />
        <VeronaStructure progress={pProp} />
        <AmbientDust count={160} />
        <CameraRig progress={pProp} mouseRef={mouseRef} />
      </Canvas>
    </div>
  );
}
