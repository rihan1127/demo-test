/**
 * LegacyTimeline — GSAP scroll-driven text & UI animation engine
 * All animations target DOM elements via refs; zero React state updates
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ── Utility: staggered clip-path line reveal ── */
export function revealLines(targets, vars = {}) {
  return gsap.fromTo(targets,
    { y: 80, opacity: 0, clipPath: 'inset(100% 0 0 0)' },
    {
      y: 0, opacity: 1, clipPath: 'inset(0% 0 0 0)',
      duration: 1.3, stagger: vars.stagger ?? 0.08,
      ease: 'power4.out',
      ...vars,
    }
  );
}

/* ── Utility: hide elements ── */
export function hideLines(targets, vars = {}) {
  return gsap.to(targets, {
    y: -60, opacity: 0, clipPath: 'inset(0% 0 100% 0)',
    duration: 0.8, ease: 'power3.in',
    ...vars,
  });
}

/* ── Chapter definitions ── */
export const CHAPTERS = [
  { id: '01', label: 'THE LEGACY',       progressStart: 0,    progressEnd: 0.18 },
  { id: '02', label: 'FOUNDATION 1980',  progressStart: 0.18, progressEnd: 0.32 },
  { id: '03', label: 'EVOLUTION 1986',   progressStart: 0.32, progressEnd: 0.50 },
  { id: '04', label: 'EXOTICA',          progressStart: 0.50, progressEnd: 0.72 },
  { id: '05', label: 'VERONA',           progressStart: 0.72, progressEnd: 1.00 },
];

export function getChapterIndex(p) {
  for (let i = 0; i < CHAPTERS.length; i++) {
    if (p <= CHAPTERS[i].progressEnd) return i;
  }
  return CHAPTERS.length - 1;
}

/* ── Master timeline builder ── */
export function buildLegacyTimeline(sectionEl, refs) {
  const tl = gsap.timeline({
    scrollTrigger: {
      id: 'legacy-master',
      trigger: sectionEl,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.8,
    },
  });
  return tl;
}
