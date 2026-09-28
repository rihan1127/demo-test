import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const phase = { current: 0 };
const focusTarget = new THREE.Vector3(0, 6, 0);

function useScrollCamera(camera, lookAtRef, sceneRef) {
  useEffect(() => {
    const proxy = { progress: 0 };
    const apply = () => {
      const p = proxy.progress;
      const orbitPart = Math.min(1, Math.max(0, p / 0.36));
      const angle = orbitPart * Math.PI * 2 + Math.PI * 0.16;
      const radius = THREE.MathUtils.lerp(28, 24, orbitPart) * (p > .36 && p < .53 ? THREE.MathUtils.lerp(1, .3, (p - .36) / .17) : p >= .53 && p < .78 ? .3 : p >= .78 ? THREE.MathUtils.lerp(.3, 1, (p - .78) / .22) : 1);
      const height = p < .36 ? 12 + Math.sin(orbitPart * Math.PI * 2) * 1.8 : p < .53 ? THREE.MathUtils.lerp(12, 5.2, (p - .36) / .17) : p < .78 ? 5.2 : THREE.MathUtils.lerp(5.2, 14, (p - .78) / .22);
      const target = p > .53 && p < .78 ? new THREE.Vector3(0, 4.4, 5.5) : new THREE.Vector3(0, 6.2, 0);
      camera.position.set(Math.sin(angle) * radius, height, Math.cos(angle) * radius);
      camera.fov = p > .36 && p < .53 ? THREE.MathUtils.lerp(43, 32, (p - .36) / .17) : p >= .53 && p < .78 ? 32 : p >= .78 ? THREE.MathUtils.lerp(32, 44, (p - .78) / .22) : 44;
      camera.updateProjectionMatrix(); camera.lookAt(target); lookAtRef.current.copy(target);
      phase.current = p;
      sceneRef.current?.rotation.set(0, 0, 0);
    };
    const tween = gsap.to(proxy, { progress: 1, ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 1.4, invalidateOnRefresh: true }, onUpdate: apply });
    apply();
    return () => { tween.scrollTrigger?.kill(); tween.kill(); };
  }, [camera, lookAtRef, sceneRef]);
}

function Ocean() {
  const mesh = useRef();
  useFrame(({ clock }) => {
    if (!mesh.current) return;
    mesh.current.material.uniforms.uTime.value = clock.elapsedTime;
  });
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color('#06314a') } },
    vertexShader: `uniform float uTime; varying vec2 vUv; varying float wave; void main(){vUv=uv; vec3 p=position; float a=sin(p.x*.32+uTime*.42)*.13+cos(p.y*.47+uTime*.32)*.09; p.z+=a; wave=a; gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`,
    fragmentShader: `uniform vec3 uColor; uniform float uTime; varying vec2 vUv; varying float wave; void main(){float shimmer=sin(vUv.x*360.0+uTime*2.0)*sin(vUv.y*170.0-uTime)*.035; vec3 col=uColor+vec3(.13,.25,.26)*(vUv.y)+vec3(shimmer); gl_FragColor=vec4(col,1.0);}`,
  }), []);
  return <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} position={[0, -.28, -24]}><planeGeometry args={[180, 150, 90, 70]} /><primitive object={material} attach="material" /></mesh>;
}

function Palm({ position, scale = 1 }) {
  return <group position={position} scale={scale}>
    <mesh position={[0, 1.6, 0]} rotation={[0, 0, -.07]} castShadow><cylinderGeometry args={[.12, .24, 3.2, 9, 8]} /><meshStandardMaterial color="#796248" roughness={.9} /></mesh>
    <mesh position={[0, 3.1, 0]}><sphereGeometry args={[.28, 12, 9]} /><meshStandardMaterial color="#53734f" /></mesh>
    {Array.from({ length: 9 }, (_, i) => <mesh key={i} position={[0, 3.18, 0]} rotation={[Math.cos(i * .7) * .18, i * (Math.PI * 2 / 9), Math.sin(i * .7) * .18]}><coneGeometry args={[.17, 2.1, 5, 2]} /><meshStandardMaterial color={i % 2 ? '#506c48' : '#72855a'} roughness={.85} /></mesh>)}
  </group>;
}

function Tower({ position, height = 21, width = 4.6, depth = 4.1, floors = 26, label, accent = '#c3aa81', onSelect }) {
  const group = useRef(); const [hover, setHover] = useState(false);
  const glass = useMemo(() => new THREE.MeshPhysicalMaterial({ color: hover ? '#6fa5af' : '#496474', metalness: .63, roughness: .23, clearcoat: .72, clearcoatRoughness: .18, envMapIntensity: 1.15 }), [hover]);
  const floorHeight = height / floors;
  useFrame(() => { group.current?.traverse(object => { if (object.userData.windowLight && object.material) object.material.emissiveIntensity = .08 + Math.max(0, phase.current - .2) * 1.65; }); });
  return <group ref={group} position={position} onPointerOver={e => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer'; }} onPointerOut={() => { setHover(false); document.body.style.cursor = ''; }} onClick={e => { e.stopPropagation(); onSelect?.(label); }}>
    <mesh position={[0, height / 2, 0]} castShadow receiveShadow><boxGeometry args={[width, height, depth]} /><primitive object={glass} attach="material" /></mesh>
    <mesh position={[0, height / 2, depth / 2 + .035]}><planeGeometry args={[width * .92, height * .975]} /><meshStandardMaterial color="#182a34" roughness={.28} metalness={.5} /></mesh>
    {Array.from({ length: floors + 1 }, (_, i) => <group key={i} position={[0, i * floorHeight, 0]}>
      <mesh position={[0, .035, 0]} castShadow receiveShadow><boxGeometry args={[width + .34, .1, depth + .34]} /><meshStandardMaterial color={i % 5 === 0 ? '#d1c5ad' : '#a99d88'} roughness={.52} metalness={.18} /></mesh>
      <mesh position={[0, .12, depth / 2 + .22]}><boxGeometry args={[width + .12, .075, .58]} /><meshStandardMaterial color={accent} roughness={.31} metalness={.32} /></mesh>
      {i % 4 === 0 && <mesh position={[0, -.13, 0]}><boxGeometry args={[width + .58, .07, depth + .6]} /><meshStandardMaterial color="#b6a68d" roughness={.5} /></mesh>}
      {i % 2 === 0 && <mesh userData={{ windowLight: true }} position={[width / 2 - .14, .2, depth / 2 + .34]}><boxGeometry args={[.08, .55, .06]} /><meshStandardMaterial color="#f2c77e" emissive="#e09c43" emissiveIntensity={.08} /></mesh>}
    </group>)}
    <mesh position={[0, height + .24, 0]} castShadow><boxGeometry args={[width * .62, .42, depth * .64]} /><meshStandardMaterial color="#b7a484" metalness={.35} roughness={.38} /></mesh>
    <mesh position={[0, height + .52, 0]}><boxGeometry args={[width * .48, .14, depth * .5]} /><meshStandardMaterial color="#d2c9b7" emissive="#c89d5b" emissiveIntensity={phase.current > .55 ? 1 : .18} /></mesh>
    <mesh position={[0, height * .49, depth / 2 + .085]}><boxGeometry args={[.055, height * .89, .07]} /><meshStandardMaterial color="#c5b79a" metalness={.7} roughness={.22} /></mesh>
  </group>;
}

function Development({ sceneRef, onSelect }) {
  const windows = useRef(); const count = 260;
  const windowGeometry = useMemo(() => new THREE.BoxGeometry(.08, .14, .04), []);
  useEffect(() => {
    if (!windows.current) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) { const x = (Math.random() - .5) * 48; const z = -34 - Math.random() * 16; const h = .5 + Math.random() * 4; dummy.position.set(x, h, z); dummy.scale.setScalar(.4 + Math.random() * .7); dummy.updateMatrix(); windows.current.setMatrixAt(i, dummy.matrix); }
    windows.current.instanceMatrix.needsUpdate = true;
  }, []);
  return <group ref={sceneRef}>
    <mesh position={[0, -.55, 1]} receiveShadow><cylinderGeometry args={[19, 22, .48, 64]} /><meshStandardMaterial color="#33463b" roughness={1} /></mesh>
    <mesh position={[0, -.21, 1]} receiveShadow><cylinderGeometry args={[17.7, 18.8, .24, 64]} /><meshStandardMaterial color="#738168" roughness={1} /></mesh>
    <mesh position={[0, -.15, -3]} receiveShadow><boxGeometry args={[19, .18, 8]} /><meshStandardMaterial color="#c1b19a" roughness={.7} /></mesh>
    <mesh position={[0, -.02, -7.7]} receiveShadow><boxGeometry args={[8.7, .08, 3.5]} /><meshStandardMaterial color="#15778b" metalness={.42} roughness={.2} /></mesh>
    <mesh position={[0, -.04, -7.7]}><boxGeometry args={[8.9, .045, 3.65]} /><meshStandardMaterial color="#79c4c4" transparent opacity={.17} roughness={.12} metalness={.65} /></mesh>
    <mesh position={[0, .16, -9.7]} castShadow><boxGeometry args={[7.2, .66, 2.6]} /><meshStandardMaterial color="#c8bba6" roughness={.58} /></mesh>
    <Tower label="Verona Tower" position={[-1.1, -.02, 0]} height={21} width={4.35} depth={4.5} floors={25} onSelect={onSelect} />
    <Tower label="Verona North" position={[-7.5, -.02, -4.5]} height={16.7} width={3.75} depth={3.8} floors={20} accent="#b6a887" onSelect={onSelect} />
    <Tower label="Verona South" position={[7.1, -.02, -4.4]} height={17.6} width={3.8} depth={3.8} floors={21} accent="#bca780" onSelect={onSelect} />
    <group position={[4.2, 0, -9.3]}><mesh position={[0, .75, 0]} castShadow><boxGeometry args={[5.8, 1.5, 4.6]} /><meshStandardMaterial color="#c1b29c" roughness={.45} /></mesh><mesh position={[0, .8, 2.34]}><planeGeometry args={[4.8, 1.25]} /><meshStandardMaterial color="#32505a" metalness={.52} roughness={.22} /></mesh><mesh position={[0, 1.55, 0]}><boxGeometry args={[6.1, .14, 4.9]} /><meshStandardMaterial color="#ddd2bf" /></mesh></group>
    <instancedMesh ref={windows} args={[windowGeometry, undefined, count]}><meshStandardMaterial color="#f3c887" emissive="#d88c3f" emissiveIntensity={.7} /></instancedMesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -.55, -24]} receiveShadow><planeGeometry args={[70, 55]} /><meshStandardMaterial color="#4b5946" roughness={1} /></mesh>
    {Array.from({ length: 28 }, (_, i) => { const a = i * Math.PI * 2 / 28; const r = 12 + Math.sin(i * 15) * 2; return <Palm key={i} position={[Math.cos(a) * r, -.3, Math.sin(a) * r - 1]} scale={.6 + (i % 4) * .1} />; })}
    {Array.from({ length: 9 }, (_, i) => <mesh key={`city-${i}`} position={[-29 + i * 7.4, 2.6 + (i % 3), -43]}><boxGeometry args={[4.5 + (i % 2), 5 + (i % 3) * 2, 3]} /><meshStandardMaterial color="#263b49" emissive="#bf9861" emissiveIntensity={.12} roughness={.82} /></mesh>)}
    <Ocean />
    <Sparkles count={65} scale={[45, 17, 38]} size={1.3} speed={.12} opacity={.22} color="#f0c880" position={[0, 6, -18]} />
  </group>;
}

function CameraRig({ sceneRef }) {
  const { camera } = useThree(); const look = useRef(new THREE.Vector3());
  useScrollCamera(camera, look, sceneRef);
  return null;
}

function LightChoreography({ sun, fill }) {
  const { scene } = useThree();
  const day = useMemo(() => new THREE.Color('#91a9b9'), []);
  const night = useMemo(() => new THREE.Color('#071522'), []);
  const sunset = useMemo(() => new THREE.Color('#bf9279'), []);
  const warm = useMemo(() => new THREE.Color('#ffe1b2'), []);
  const cool = useMemo(() => new THREE.Color('#7490ad'), []);
  const sky = useMemo(() => new THREE.Color(), []);
  useFrame(() => {
    const p = phase.current;
    const dusk = THREE.MathUtils.smoothstep(p, .18, .66);
    const evening = THREE.MathUtils.smoothstep(p, .58, .95);
    sky.copy(day).lerp(sunset, THREE.MathUtils.smoothstep(p, .12, .52)).lerp(night, evening);
    scene.background?.copy(sky);
    if (scene.fog) scene.fog.color.copy(sky);
    if (sun.current) { sun.current.intensity = THREE.MathUtils.lerp(2.1, .42, dusk); sun.current.color.copy(warm).lerp(cool, dusk); }
    if (fill.current) fill.current.intensity = THREE.MathUtils.lerp(.9, .24, dusk);
  });
  return null;
}

export default function ExperienceCanvas({ onSelect }) {
  const sceneRef = useRef(); const [loading, setLoading] = useState(true);
  const sun = useRef(); const fill = useRef();
  useEffect(() => { const id = setTimeout(() => setLoading(false), 900); return () => clearTimeout(id); }, []);
  return <div className="experience-canvas" aria-label="Interactive 3D architectural view of the Verona waterfront development">
    <Canvas shadows dpr={[1, 1.6]} camera={{ position: [7, 12, 28], fov: 44, near: .1, far: 180 }} gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}>
      <color attach="background" args={['#718395']} /><fog attach="fog" args={['#718395', 57, 125]} />
      <Suspense fallback={null}>
        <ambientLight intensity={.48} /><hemisphereLight ref={fill} args={['#c8d7df', '#26302b', .9]} />
        <directionalLight ref={sun} position={[-15, 23, 8]} intensity={2.1} color="#ffe0b0" castShadow shadow-mapSize={[1024, 1024]} />
        <pointLight position={[5, 7, -8]} intensity={8} color="#efa65e" distance={34} />
        <Development sceneRef={sceneRef} onSelect={onSelect} />
        <ContactShadows position={[0, -.3, 0]} opacity={.25} scale={38} blur={3} far={18} />
        <CameraRig sceneRef={sceneRef} />
        <LightChoreography sun={sun} fill={fill} />
      </Suspense>
    </Canvas>
    {loading && <div className="scene-loading"><span>VERONA</span><i /></div>}
  </div>;
}
