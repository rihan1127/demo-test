import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import gsap from 'gsap';
import * as THREE from 'three';

/* Camera keyframes — scroll 0→1 through all chapters */
const CAM_PATH = [
  // 0 — Far intro
  { progress: 0,    pos: [0, 3.5, 16],  look: [0, 0.5, 0],  fov: 52 },
  // 1 — 1980 chapter
  { progress: 0.15, pos: [-2.5, 1.8, 9], look: [-2.5, 1, 0], fov: 48 },
  // 2 — 1986 chapter
  { progress: 0.3,  pos: [2.0, 1.2, 7],  look: [2.0, 0.5, 0], fov: 46 },
  // 3 — Evolution/Mumbai
  { progress: 0.48, pos: [0, 4.5, 8],    look: [0, 0, -4],   fov: 55 },
  // 4 — Project Memory Wall
  { progress: 0.62, pos: [-4, 2.0, 5],   look: [0, 1.5, -5], fov: 50 },
  // 5 — Exotica transition
  { progress: 0.76, pos: [0, 6, 2],      look: [0, 0, -8],   fov: 58 },
  // 6 — Verona reveal
  { progress: 0.88, pos: [0, 1.5, 3.5],  look: [0, 1.5, -5], fov: 44 },
  // 7 — Final pull-back
  { progress: 1.0,  pos: [0, 8, 18],     look: [0, 0, 0],    fov: 52 },
];

function lerp3(a, b, t) {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

function getCameraAtProgress(p) {
  let i = 0;
  for (let k = 0; k < CAM_PATH.length - 1; k++) {
    if (p >= CAM_PATH[k].progress && p <= CAM_PATH[k + 1].progress) { i = k; break; }
    if (p > CAM_PATH[CAM_PATH.length - 1].progress) i = CAM_PATH.length - 2;
  }
  const a = CAM_PATH[i];
  const b = CAM_PATH[i + 1];
  const t = (p - a.progress) / (b.progress - a.progress);
  const st = Math.sin((t * Math.PI) / 2); // ease-in-sine
  return {
    pos: lerp3(a.pos, b.pos, st),
    look: lerp3(a.look, b.look, st),
    fov: a.fov + (b.fov - a.fov) * st,
  };
}

export default function LegacyCameraController({ progressRef, mouseRef }) {
  const { camera } = useThree();
  const lookTarget = useRef(new THREE.Vector3());
  const currentPos = useRef(new THREE.Vector3(...CAM_PATH[0].pos));

  useFrame(() => {
    const p = progressRef.current ?? 0;
    const { pos, look, fov } = getCameraAtProgress(Math.max(0, Math.min(1, p)));

    /* Smooth position interpolation */
    currentPos.current.lerp(new THREE.Vector3(...pos), 0.045);
    camera.position.copy(currentPos.current);

    /* Mouse offset */
    const mx = mouseRef?.current?.x ?? 0;
    const my = mouseRef?.current?.y ?? 0;
    camera.position.x += mx * 0.3;
    camera.position.y += my * -0.2;

    /* Look-at smooth */
    lookTarget.current.lerp(new THREE.Vector3(...look), 0.045);
    camera.lookAt(lookTarget.current);

    /* FOV */
    if (camera.fov) {
      camera.fov += (fov - camera.fov) * 0.04;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

export { getCameraAtProgress, CAM_PATH };
