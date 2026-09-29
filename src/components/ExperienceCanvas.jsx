/**
 * ExperienceCanvas.jsx — ONE Persistent WebGL Scene
 * 
 * ONE Canvas. ONE Camera. ONE Renderer. ONE Master GSAP timeline.
 * The camera path is driven by scroll progress through cameraPaths.js.
 */
import React, { Suspense, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { computeCameraState, getTimeOfDay, chapters } from '../cameraPaths.js';

/* ═══════════════════════════════════════════════════════════════
   GLOBAL STATE — shared across all 3D components
   ═══════════════════════════════════════════════════════════════ */
const scrollState = {
  progress: 0,
  chapter: 1,
  localProgress: 0,
  mouseX: 0,
  mouseY: 0,
  timeOfDay: 0.25,
};

/* ═══════════════════════════════════════════════════════════════
   OCEAN — Animated water shader
   ═══════════════════════════════════════════════════════════════ */
function Ocean() {
  const mesh = useRef();
  useFrame(({ clock }) => {
    if (!mesh.current) return;
    mesh.current.material.uniforms.uTime.value = clock.elapsedTime;
    // Darken ocean at night
    const tod = scrollState.timeOfDay;
    const nightFactor = Math.max(0, (tod - 0.6) / 0.4);
    mesh.current.material.uniforms.uNight.value = nightFactor;
  });

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#06314a') },
      uNight: { value: 0 },
    },
    vertexShader: `
      uniform float uTime;
      varying vec2 vUv;
      varying float wave;
      void main() {
        vUv = uv;
        vec3 p = position;
        float a = sin(p.x * 0.32 + uTime * 0.42) * 0.13 + cos(p.y * 0.47 + uTime * 0.32) * 0.09;
        p.z += a;
        wave = a;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uTime;
      uniform float uNight;
      varying vec2 vUv;
      varying float wave;
      void main() {
        float shimmer = sin(vUv.x * 360.0 + uTime * 2.0) * sin(vUv.y * 170.0 - uTime) * 0.035;
        vec3 dayCol = uColor + vec3(0.13, 0.25, 0.26) * vUv.y + vec3(shimmer);
        vec3 nightCol = vec3(0.02, 0.05, 0.08) + vec3(shimmer * 0.3);
        vec3 col = mix(dayCol, nightCol, uNight);
        // Moonlight reflection at night
        float moonReflect = smoothstep(0.45, 0.55, vUv.x) * smoothstep(0.3, 0.5, vUv.y) * uNight * 0.08;
        col += vec3(0.6, 0.7, 0.85) * moonReflect;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  }), []);

  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.28, -24]}>
      <planeGeometry args={[180, 150, 90, 70]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PALM TREES
   ═══════════════════════════════════════════════════════════════ */
function Palm({ position, scale = 1 }) {
  const group = useRef();
  useFrame(({ clock }) => {
    if (!group.current) return;
    // Subtle wind sway
    const t = clock.elapsedTime;
    const sway = Math.sin(t * 0.5 + position[0]) * 0.015;
    group.current.rotation.z = sway;
    group.current.rotation.x = Math.cos(t * 0.3 + position[2]) * 0.008;
  });

  return (
    <group ref={group} position={position} scale={scale}>
      <mesh position={[0, 1.6, 0]} rotation={[0, 0, -0.07]} castShadow>
        <cylinderGeometry args={[0.12, 0.24, 3.2, 9, 8]} />
        <meshStandardMaterial color="#796248" roughness={0.9} />
      </mesh>
      <mesh position={[0, 3.1, 0]}>
        <sphereGeometry args={[0.28, 12, 9]} />
        <meshStandardMaterial color="#53734f" />
      </mesh>
      {Array.from({ length: 9 }, (_, i) => (
        <mesh
          key={i}
          position={[0, 3.18, 0]}
          rotation={[
            Math.cos(i * 0.7) * 0.18,
            i * (Math.PI * 2 / 9),
            Math.sin(i * 0.7) * 0.18,
          ]}
        >
          <coneGeometry args={[0.17, 2.1, 5, 2]} />
          <meshStandardMaterial color={i % 2 ? '#506c48' : '#72855a'} roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TOWER — Building with animated windows
   ═══════════════════════════════════════════════════════════════ */
function Tower({ position, height = 21, width = 4.6, depth = 4.1, floors = 26, accent = '#c3aa81', xrayProgress = 0 }) {
  const group = useRef();

  const glass = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#496474',
    metalness: 0.63,
    roughness: 0.23,
    clearcoat: 0.72,
    clearcoatRoughness: 0.18,
    envMapIntensity: 1.15,
    transparent: true,
  }), []);

  const floorHeight = height / floors;

  useFrame(() => {
    if (!group.current) return;
    const tod = scrollState.timeOfDay;
    const nightIntensity = Math.max(0, (tod - 0.5) / 0.5);

    // X-ray transparency effect
    const xray = scrollState.chapter === 7 ? scrollState.localProgress : 0;
    glass.opacity = 1 - xray * 0.4;
    glass.wireframe = xray > 0.7;

    group.current.traverse(object => {
      if (object.userData.windowLight && object.material) {
        object.material.emissiveIntensity = 0.08 + nightIntensity * 2.0;
      }
    });
  });

  return (
    <group ref={group} position={position}>
      {/* Main building body */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <primitive object={glass} attach="material" />
      </mesh>

      {/* Facade panel */}
      <mesh position={[0, height / 2, depth / 2 + 0.035]}>
        <planeGeometry args={[width * 0.92, height * 0.975]} />
        <meshStandardMaterial color="#182a34" roughness={0.28} metalness={0.5} />
      </mesh>

      {/* Floor slabs and details */}
      {Array.from({ length: floors + 1 }, (_, i) => (
        <group key={i} position={[0, i * floorHeight, 0]}>
          <mesh position={[0, 0.035, 0]} castShadow receiveShadow>
            <boxGeometry args={[width + 0.34, 0.1, depth + 0.34]} />
            <meshStandardMaterial color={i % 5 === 0 ? '#d1c5ad' : '#a99d88'} roughness={0.52} metalness={0.18} />
          </mesh>
          <mesh position={[0, 0.12, depth / 2 + 0.22]}>
            <boxGeometry args={[width + 0.12, 0.075, 0.58]} />
            <meshStandardMaterial color={accent} roughness={0.31} metalness={0.32} />
          </mesh>
          {i % 4 === 0 && (
            <mesh position={[0, -0.13, 0]}>
              <boxGeometry args={[width + 0.58, 0.07, depth + 0.6]} />
              <meshStandardMaterial color="#b6a68d" roughness={0.5} />
            </mesh>
          )}
          {i % 2 === 0 && (
            <mesh userData={{ windowLight: true }} position={[width / 2 - 0.14, 0.2, depth / 2 + 0.34]}>
              <boxGeometry args={[0.08, 0.55, 0.06]} />
              <meshStandardMaterial color="#f2c77e" emissive="#e09c43" emissiveIntensity={0.08} />
            </mesh>
          )}
        </group>
      ))}

      {/* Crown */}
      <mesh position={[0, height + 0.24, 0]} castShadow>
        <boxGeometry args={[width * 0.62, 0.42, depth * 0.64]} />
        <meshStandardMaterial color="#b7a484" metalness={0.35} roughness={0.38} />
      </mesh>
      <mesh position={[0, height + 0.52, 0]}>
        <boxGeometry args={[width * 0.48, 0.14, depth * 0.5]} />
        <meshStandardMaterial color="#d2c9b7" emissive="#c89d5b" emissiveIntensity={0.18} />
      </mesh>

      {/* Vertical spine */}
      <mesh position={[0, height * 0.49, depth / 2 + 0.085]}>
        <boxGeometry args={[0.055, height * 0.89, 0.07]} />
        <meshStandardMaterial color="#c5b79a" metalness={0.7} roughness={0.22} />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ATMOSPHERIC CLOUDS
   ═══════════════════════════════════════════════════════════════ */
function AtmosphericClouds() {
  const clouds = useRef();
  const count = 18;

  const positions = useMemo(() => {
    const pos = [];
    for (let i = 0; i < count; i++) {
      pos.push({
        x: (Math.random() - 0.5) * 80,
        y: 18 + Math.random() * 14,
        z: -20 - Math.random() * 40,
        scale: 3 + Math.random() * 6,
        speed: 0.05 + Math.random() * 0.08,
        offset: Math.random() * Math.PI * 2,
      });
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (!clouds.current) return;
    const t = clock.elapsedTime;
    clouds.current.children.forEach((cloud, i) => {
      const p = positions[i];
      cloud.position.x = p.x + Math.sin(t * p.speed + p.offset) * 3;
      cloud.position.y = p.y + Math.cos(t * p.speed * 0.5) * 0.3;

      // Fade clouds based on time of day
      const tod = scrollState.timeOfDay;
      const opacity = tod > 0.7 ? 0.06 : 0.12 - tod * 0.06;
      cloud.material.opacity = opacity;
    });
  });

  return (
    <group ref={clouds}>
      {positions.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]}>
          <sphereGeometry args={[p.scale, 8, 6]} />
          <meshStandardMaterial
            color="#a8b8c4"
            transparent
            opacity={0.1}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ENVIRONMENTAL PARTICLES — Subtle atmospheric dust
   ═══════════════════════════════════════════════════════════════ */
function EnvironmentalParticles() {
  const particles = useRef();
  const count = 120;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 50;
      arr[i * 3 + 1] = Math.random() * 25;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (!particles.current) return;
    const t = clock.elapsedTime;
    const posArr = particles.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      posArr[i * 3] += Math.sin(t * 0.1 + i) * 0.003;
      posArr[i * 3 + 1] += Math.cos(t * 0.15 + i * 0.5) * 0.002;
      // Reset particles that drift too far
      if (posArr[i * 3 + 1] > 28) posArr[i * 3 + 1] = 0;
      if (posArr[i * 3 + 1] < -1) posArr[i * 3 + 1] = 25;
    }
    particles.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particles}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#f0d8a8"
        size={0.06}
        transparent
        opacity={0.25}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DEVELOPMENT — Full property with all buildings
   ═══════════════════════════════════════════════════════════════ */
function Development({ sceneRef }) {
  const windows = useRef();
  const count = 260;
  const windowGeometry = useMemo(() => new THREE.BoxGeometry(0.08, 0.14, 0.04), []);

  useEffect(() => {
    if (!windows.current) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 48;
      const z = -34 - Math.random() * 16;
      const h = 0.5 + Math.random() * 4;
      dummy.position.set(x, h, z);
      dummy.scale.setScalar(0.4 + Math.random() * 0.7);
      dummy.updateMatrix();
      windows.current.setMatrixAt(i, dummy.matrix);
    }
    windows.current.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <group ref={sceneRef}>
      {/* Ground island */}
      <mesh position={[0, -0.55, 1]} receiveShadow>
        <cylinderGeometry args={[19, 22, 0.48, 64]} />
        <meshStandardMaterial color="#33463b" roughness={1} />
      </mesh>
      <mesh position={[0, -0.21, 1]} receiveShadow>
        <cylinderGeometry args={[17.7, 18.8, 0.24, 64]} />
        <meshStandardMaterial color="#738168" roughness={1} />
      </mesh>

      {/* Pathways */}
      <mesh position={[0, -0.15, -3]} receiveShadow>
        <boxGeometry args={[19, 0.18, 8]} />
        <meshStandardMaterial color="#c1b19a" roughness={0.7} />
      </mesh>

      {/* Pool */}
      <mesh position={[0, -0.02, -7.7]} receiveShadow>
        <boxGeometry args={[8.7, 0.08, 3.5]} />
        <meshStandardMaterial color="#15778b" metalness={0.42} roughness={0.2} />
      </mesh>
      <mesh position={[0, -0.04, -7.7]}>
        <boxGeometry args={[8.9, 0.045, 3.65]} />
        <meshStandardMaterial color="#79c4c4" transparent opacity={0.17} roughness={0.12} metalness={0.65} />
      </mesh>

      {/* Clubhouse */}
      <mesh position={[0, 0.16, -9.7]} castShadow>
        <boxGeometry args={[7.2, 0.66, 2.6]} />
        <meshStandardMaterial color="#c8bba6" roughness={0.58} />
      </mesh>

      {/* Main towers */}
      <Tower position={[-1.1, -0.02, 0]} height={21} width={4.35} depth={4.5} floors={25} />
      <Tower position={[-7.5, -0.02, -4.5]} height={16.7} width={3.75} depth={3.8} floors={20} accent="#b6a887" />
      <Tower position={[7.1, -0.02, -4.4]} height={17.6} width={3.8} depth={3.8} floors={21} accent="#bca780" />

      {/* Clubhouse building */}
      <group position={[4.2, 0, -9.3]}>
        <mesh position={[0, 0.75, 0]} castShadow>
          <boxGeometry args={[5.8, 1.5, 4.6]} />
          <meshStandardMaterial color="#c1b29c" roughness={0.45} />
        </mesh>
        <mesh position={[0, 0.8, 2.34]}>
          <planeGeometry args={[4.8, 1.25]} />
          <meshStandardMaterial color="#32505a" metalness={0.52} roughness={0.22} />
        </mesh>
        <mesh position={[0, 1.55, 0]}>
          <boxGeometry args={[6.1, 0.14, 4.9]} />
          <meshStandardMaterial color="#ddd2bf" />
        </mesh>
      </group>

      {/* City windows (distant buildings) */}
      <instancedMesh ref={windows} args={[windowGeometry, undefined, count]}>
        <meshStandardMaterial color="#f3c887" emissive="#d88c3f" emissiveIntensity={0.7} />
      </instancedMesh>

      {/* Background ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.55, -24]} receiveShadow>
        <planeGeometry args={[70, 55]} />
        <meshStandardMaterial color="#4b5946" roughness={1} />
      </mesh>

      {/* Palm trees */}
      {Array.from({ length: 28 }, (_, i) => {
        const a = i * Math.PI * 2 / 28;
        const r = 12 + Math.sin(i * 15) * 2;
        return (
          <Palm
            key={i}
            position={[Math.cos(a) * r, -0.3, Math.sin(a) * r - 1]}
            scale={0.6 + (i % 4) * 0.1}
          />
        );
      })}

      {/* City skyline */}
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={`city-${i}`} position={[-29 + i * 7.4, 2.6 + (i % 3), -43]}>
          <boxGeometry args={[4.5 + (i % 2), 5 + (i % 3) * 2, 3]} />
          <meshStandardMaterial
            color="#263b49"
            emissive="#bf9861"
            emissiveIntensity={0.12}
            roughness={0.82}
          />
        </mesh>
      ))}

      {/* Ocean */}
      <Ocean />

      {/* Atmospheric elements */}
      <AtmosphericClouds />
      <EnvironmentalParticles />

      {/* Sparkles */}
      <Sparkles
        count={65}
        scale={[45, 17, 38]}
        size={1.3}
        speed={0.12}
        opacity={0.22}
        color="#f0c880"
        position={[0, 6, -18]}
      />
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CAMERA RIG — The cinematic camera controller
   ═══════════════════════════════════════════════════════════════ */
function CameraRig({ sceneRef }) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(7, 14, 30));
  const targetLookAt = useRef(new THREE.Vector3(0, 6.5, 0));
  const targetFov = useRef(44);
  const currentLookAt = useRef(new THREE.Vector3(0, 6.5, 0));

  useFrame((_, delta) => {
    // Compute desired camera state from scroll progress
    const state = computeCameraState(scrollState.progress);

    targetPos.current.copy(state.position);
    targetLookAt.current.copy(state.target);
    targetFov.current = state.fov;

    // Mouse parallax offset (very subtle)
    const mx = scrollState.mouseX * 0.3;
    const my = scrollState.mouseY * 0.15;
    targetPos.current.x += mx;
    targetPos.current.y += my;

    // Smooth camera interpolation (cinematic lag)
    const lerpFactor = 1 - Math.exp(-3.5 * delta);
    camera.position.lerp(targetPos.current, lerpFactor);
    currentLookAt.current.lerp(targetLookAt.current, lerpFactor);
    camera.lookAt(currentLookAt.current);

    // Smooth FOV
    camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov.current, lerpFactor);
    camera.updateProjectionMatrix();

    // Update time of day
    scrollState.timeOfDay = getTimeOfDay(scrollState.progress);

    // Keep scene rotation neutral
    if (sceneRef.current) {
      sceneRef.current.rotation.set(0, 0, 0);
    }
  });

  return null;
}

/* ═══════════════════════════════════════════════════════════════
   LIGHTING — Day → Sunset → Night choreography
   ═══════════════════════════════════════════════════════════════ */
function LightChoreography({ sun, fill }) {
  const { scene } = useThree();
  const dayColor = useMemo(() => new THREE.Color('#91a9b9'), []);
  const sunsetColor = useMemo(() => new THREE.Color('#bf9279'), []);
  const nightColor = useMemo(() => new THREE.Color('#071522'), []);
  const warmLight = useMemo(() => new THREE.Color('#ffe1b2'), []);
  const coolLight = useMemo(() => new THREE.Color('#7490ad'), []);
  const skyColor = useMemo(() => new THREE.Color(), []);

  useFrame(() => {
    const tod = scrollState.timeOfDay;

    // Sky background: day → sunset → night
    const sunsetFactor = THREE.MathUtils.smoothstep(tod, 0.3, 0.65);
    const nightFactor = THREE.MathUtils.smoothstep(tod, 0.6, 0.95);

    skyColor.copy(dayColor);
    skyColor.lerp(sunsetColor, sunsetFactor);
    skyColor.lerp(nightColor, nightFactor);

    if (scene.background) scene.background.copy(skyColor);
    if (scene.fog) {
      scene.fog.color.copy(skyColor);
      // Fog density changes with time
      scene.fog.near = THREE.MathUtils.lerp(57, 35, nightFactor);
      scene.fog.far = THREE.MathUtils.lerp(125, 80, nightFactor);
    }

    // Sun light
    if (sun.current) {
      sun.current.intensity = THREE.MathUtils.lerp(2.1, 0.15, nightFactor);
      sun.current.color.copy(warmLight).lerp(coolLight, sunsetFactor * 0.6);

      // Sun position moves during sunset
      const sunAngle = THREE.MathUtils.lerp(0.3, -0.8, sunsetFactor);
      sun.current.position.set(
        -15 + sunsetFactor * 20,
        23 - nightFactor * 18,
        8 + sunsetFactor * 5
      );
    }

    // Hemisphere fill light
    if (fill.current) {
      fill.current.intensity = THREE.MathUtils.lerp(0.9, 0.15, nightFactor);
    }
  });

  return null;
}

/* ═══════════════════════════════════════════════════════════════
   MAIN CANVAS EXPORT
   ═══════════════════════════════════════════════════════════════ */
export { scrollState };

export default function ExperienceCanvas() {
  const sceneRef = useRef();
  const [loading, setLoading] = useState(true);
  const sun = useRef();
  const fill = useRef();

  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(id);
  }, []);

  // Mouse tracking for subtle parallax
  useEffect(() => {
    const onMouseMove = (e) => {
      scrollState.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      scrollState.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  return (
    <div className="experience-canvas" aria-label="Interactive 3D architectural view of the Verona waterfront development">
      <Canvas
        shadows
        dpr={[1, 1.6]}
        camera={{ position: [7, 14, 30], fov: 44, near: 0.1, far: 180 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#718395']} />
        <fog attach="fog" args={['#718395', 57, 125]} />

        <Suspense fallback={null}>
          <ambientLight intensity={0.48} />
          <hemisphereLight ref={fill} args={['#c8d7df', '#26302b', 0.9]} />
          <directionalLight
            ref={sun}
            position={[-15, 23, 8]}
            intensity={2.1}
            color="#ffe0b0"
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <pointLight position={[5, 7, -8]} intensity={8} color="#efa65e" distance={34} />

          <Development sceneRef={sceneRef} />
          <ContactShadows position={[0, -0.3, 0]} opacity={0.25} scale={38} blur={3} far={18} />
          <CameraRig sceneRef={sceneRef} />
          <LightChoreography sun={sun} fill={fill} />
        </Suspense>
      </Canvas>

      {loading && (
        <div className="scene-loading">
          <span>VERONA</span>
          <i />
        </div>
      )}
    </div>
  );
}
