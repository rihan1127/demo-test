/**
 * cameraPaths.js — Master Camera Path Definitions
 * 
 * Each chapter defines keyframes for camera position, target, FOV, and lighting.
 * The CinematicController interpolates between these states based on scroll progress.
 */
import * as THREE from 'three';

// Helper to create Vector3 shorthand
const v = (x, y, z) => new THREE.Vector3(x, y, z);

/**
 * Master chapter definitions.
 * scrollRange: [start, end] as fraction of total scroll (0–1)
 * keyframes: array of { at, position, target, fov, ... }
 *   - 'at' is local progress within the chapter (0–1)
 */
export const chapters = [
  // ─── CHAPTER 01 — THE ARRIVAL (Hero) ───
  {
    id: 1,
    title: 'THE ARRIVAL',
    scrollRange: [0, 0.10],
    keyframes: [
      { at: 0.0, position: v(7, 14, 30), target: v(0, 6.5, 0), fov: 44 },
      { at: 0.5, position: v(6.5, 13.5, 28), target: v(0, 6.5, 0), fov: 45 },
      { at: 1.0, position: v(5, 12.5, 24), target: v(0, 7, 0), fov: 47 },
    ],
    lighting: { startTime: 0.0, endTime: 0.15 }, // early day
  },

  // ─── CHAPTER 02 — THE ARCHITECTURE (360° orbit) ───
  {
    id: 2,
    title: 'THE ARCHITECTURE',
    scrollRange: [0.10, 0.24],
    keyframes: (() => {
      const frames = [];
      const steps = 12;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const angle = t * Math.PI * 2 + Math.PI * 0.16;
        const radius = 26 - Math.sin(t * Math.PI) * 4;
        const height = 12 + Math.sin(t * Math.PI * 2) * 2.5;
        frames.push({
          at: t,
          position: v(Math.sin(angle) * radius, height, Math.cos(angle) * radius),
          target: v(0, 7 + Math.sin(t * Math.PI) * 1.5, 0),
          fov: 44 + Math.sin(t * Math.PI) * 6,
        });
      }
      return frames;
    })(),
    lighting: { startTime: 0.15, endTime: 0.45 }, // day to warm afternoon
  },

  // ─── CHAPTER 03 — THE RESIDENCE (Architectural details) ───
  {
    id: 3,
    title: 'THE RESIDENCE',
    scrollRange: [0.24, 0.34],
    keyframes: [
      { at: 0.0, position: v(8, 12, 20), target: v(0, 8, 0), fov: 42 },
      { at: 0.2, position: v(5, 10, 14), target: v(-1, 9, 0), fov: 38 },
      { at: 0.4, position: v(3, 11, 9), target: v(-1, 10, 2), fov: 34 },
      { at: 0.6, position: v(1, 12, 7), target: v(-1, 11, 1), fov: 32 },
      { at: 0.8, position: v(-2, 10, 8), target: v(-1, 9, 0), fov: 36 },
      { at: 1.0, position: v(-4, 9, 12), target: v(0, 7, 0), fov: 40 },
    ],
    lighting: { startTime: 0.35, endTime: 0.55 },
  },

  // ─── CHAPTER 04 — THE AMENITIES ───
  {
    id: 4,
    title: 'THE AMENITIES',
    scrollRange: [0.34, 0.44],
    keyframes: [
      { at: 0.0, position: v(-4, 9, 12), target: v(0, 5, -5), fov: 42 },
      { at: 0.25, position: v(-2, 6, 6), target: v(0, 3, -6), fov: 44 },
      { at: 0.5, position: v(0, 3, 0), target: v(2, 1, -7), fov: 48 },
      { at: 0.75, position: v(3, 2.5, -4), target: v(4, 1.5, -8), fov: 50 },
      { at: 1.0, position: v(5, 4, -6), target: v(4, 2, -9), fov: 46 },
    ],
    lighting: { startTime: 0.45, endTime: 0.58 },
  },

  // ─── CHAPTER 05 — THE LIFESTYLE ───
  {
    id: 5,
    title: 'THE LIFESTYLE',
    scrollRange: [0.44, 0.52],
    keyframes: [
      { at: 0.0, position: v(5, 4, -6), target: v(0, 3, -8), fov: 46 },
      { at: 0.3, position: v(2, 2, -8), target: v(0, 1.5, -9), fov: 52 },
      { at: 0.6, position: v(-1, 1.5, -7), target: v(0, 1.2, -8), fov: 55 },
      { at: 1.0, position: v(-3, 3, -5), target: v(0, 2, -7), fov: 48 },
    ],
    lighting: { startTime: 0.52, endTime: 0.62 },
  },

  // ─── CHAPTER 06 — THE LOCATION ───
  {
    id: 6,
    title: 'THE LOCATION',
    scrollRange: [0.52, 0.62],
    keyframes: [
      { at: 0.0, position: v(-3, 3, -5), target: v(0, 5, 0), fov: 48 },
      { at: 0.25, position: v(-5, 10, -10), target: v(0, 6, 0), fov: 50 },
      { at: 0.5, position: v(0, 20, -15), target: v(0, 4, 0), fov: 55 },
      { at: 0.75, position: v(5, 28, -20), target: v(0, 2, -5), fov: 58 },
      { at: 1.0, position: v(0, 35, -10), target: v(0, 0, -10), fov: 60 },
    ],
    lighting: { startTime: 0.55, endTime: 0.68 }, // approaching sunset
  },

  // ─── CHAPTER 07 — THE X-RAY ───
  {
    id: 7,
    title: 'THE X-RAY',
    scrollRange: [0.62, 0.72],
    keyframes: [
      { at: 0.0, position: v(0, 35, -10), target: v(0, 6, 0), fov: 55 },
      { at: 0.25, position: v(5, 22, 5), target: v(0, 8, 0), fov: 48 },
      { at: 0.5, position: v(8, 15, 10), target: v(0, 9, 0), fov: 44 },
      { at: 0.75, position: v(6, 11, 14), target: v(-1, 8, 0), fov: 42 },
      { at: 1.0, position: v(4, 10, 16), target: v(-1, 7, 0), fov: 40 },
    ],
    lighting: { startTime: 0.62, endTime: 0.75 }, // sunset
  },

  // ─── CHAPTER 08 — THE FLOOR PLAN ───
  {
    id: 8,
    title: 'THE FLOOR PLAN',
    scrollRange: [0.72, 0.82],
    keyframes: [
      { at: 0.0, position: v(4, 10, 16), target: v(-1, 8, 2), fov: 40 },
      { at: 0.3, position: v(2, 12, 10), target: v(-1, 10, 1), fov: 38 },
      { at: 0.6, position: v(0, 14, 8), target: v(-1, 12, 0), fov: 35 },
      { at: 1.0, position: v(-1, 13, 9), target: v(-1, 11, 0), fov: 36 },
    ],
    lighting: { startTime: 0.72, endTime: 0.82 },
  },

  // ─── CHAPTER 09 — THE EXPERIENCE ───
  {
    id: 9,
    title: 'THE EXPERIENCE',
    scrollRange: [0.82, 0.91],
    keyframes: [
      { at: 0.0, position: v(-1, 13, 9), target: v(0, 6, 0), fov: 36 },
      { at: 0.3, position: v(3, 10, 18), target: v(0, 7, 0), fov: 42 },
      { at: 0.6, position: v(6, 8, 22), target: v(0, 6, 0), fov: 46 },
      { at: 1.0, position: v(8, 11, 26), target: v(0, 6, 0), fov: 44 },
    ],
    lighting: { startTime: 0.80, endTime: 0.92 }, // deep sunset to night
  },

  // ─── CHAPTER 10 — ENQUIRE ───
  {
    id: 10,
    title: 'ENQUIRE',
    scrollRange: [0.91, 1.0],
    keyframes: [
      { at: 0.0, position: v(8, 11, 26), target: v(0, 6, 0), fov: 44 },
      { at: 0.3, position: v(7, 13, 28), target: v(0, 7, 0), fov: 44 },
      { at: 0.6, position: v(6, 14, 30), target: v(0, 7, 0), fov: 43 },
      { at: 1.0, position: v(7, 14, 30), target: v(0, 6.5, 0), fov: 44 },
    ],
    lighting: { startTime: 0.90, endTime: 1.0 }, // night
  },
];

/**
 * Interpolate between keyframes for a given local progress (0–1)
 */
export function interpolateKeyframes(keyframes, localProgress) {
  const p = Math.max(0, Math.min(1, localProgress));

  // Find the two keyframes to interpolate between
  let a = keyframes[0];
  let b = keyframes[keyframes.length - 1];

  for (let i = 0; i < keyframes.length - 1; i++) {
    if (p >= keyframes[i].at && p <= keyframes[i + 1].at) {
      a = keyframes[i];
      b = keyframes[i + 1];
      break;
    }
  }

  // Local interpolation factor between the two keyframes
  const range = b.at - a.at;
  const t = range > 0 ? (p - a.at) / range : 0;

  // Smooth step for cinematic feel
  const smooth = t * t * (3 - 2 * t);

  return {
    position: new THREE.Vector3().lerpVectors(a.position, b.position, smooth),
    target: new THREE.Vector3().lerpVectors(a.target, b.target, smooth),
    fov: THREE.MathUtils.lerp(a.fov, b.fov, smooth),
  };
}

/**
 * Given a global scroll progress (0–1), find the active chapter and local progress
 */
export function getChapterState(globalProgress) {
  const p = Math.max(0, Math.min(1, globalProgress));

  for (let i = chapters.length - 1; i >= 0; i--) {
    const ch = chapters[i];
    if (p >= ch.scrollRange[0]) {
      const range = ch.scrollRange[1] - ch.scrollRange[0];
      const local = range > 0 ? (p - ch.scrollRange[0]) / range : 0;
      return {
        chapter: ch,
        chapterIndex: i,
        localProgress: Math.min(1, local),
        globalProgress: p,
      };
    }
  }

  return {
    chapter: chapters[0],
    chapterIndex: 0,
    localProgress: 0,
    globalProgress: 0,
  };
}

/**
 * Compute the camera state for a given global scroll progress
 */
export function computeCameraState(globalProgress) {
  const state = getChapterState(globalProgress);
  const cameraState = interpolateKeyframes(state.chapter.keyframes, state.localProgress);
  return {
    ...cameraState,
    ...state,
  };
}

/**
 * Lighting time of day (0 = dawn, 0.3 = day, 0.6 = sunset, 1 = night)
 */
export function getTimeOfDay(globalProgress) {
  if (globalProgress < 0.15) return 0.25; // bright day
  if (globalProgress < 0.45) return THREE.MathUtils.lerp(0.25, 0.4, (globalProgress - 0.15) / 0.3);
  if (globalProgress < 0.65) return THREE.MathUtils.lerp(0.4, 0.65, (globalProgress - 0.45) / 0.2);
  if (globalProgress < 0.82) return THREE.MathUtils.lerp(0.65, 0.85, (globalProgress - 0.65) / 0.17);
  return THREE.MathUtils.lerp(0.85, 1.0, (globalProgress - 0.82) / 0.18);
}
