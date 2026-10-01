import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles, ArrowUpRight, Compass, Shield, Award, Building2 } from 'lucide-react';
import Legacy3DCanvas from './Legacy3DCanvas';
import LegacyCursor from './LegacyCursor';
import './legacy.css';

gsap.registerPlugin(ScrollTrigger);

/* ── Verified Raheja Universal Architectural Landmarks (One by One) ── */
const MILESTONE_PROJECTS = [
  {
    id: 'p1',
    no: '01',
    name: 'Raheja Exotica',
    location: 'Madh Island, Mumbai',
    type: '32-Acre Island Sanctuary',
    desc: 'An oceanfront haven set across 32 acres of coastal flora, secluded verandahs, and resort club living.',
    image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=85',
    spec: '32 Acres · 80% Greenery',
  },
  {
    id: 'p2',
    no: '02',
    name: 'Raheja Imperia',
    location: 'Lower Parel, South Mumbai',
    type: 'Skyline Luxury Residential Tower',
    desc: 'Towering above the financial district with panoramic city & sea views and elevated sky club amenities.',
    image: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1200&q=85',
    spec: 'Central Mumbai Landmark',
  },
  {
    id: 'p3',
    no: '03',
    name: 'Raheja Reflections',
    location: 'Borivali East, Mumbai',
    type: 'Masterplanned Gated Community',
    desc: 'A serene residential oasis blending modern high-rise architecture with curated private landscapes.',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85',
    spec: 'Gated Residential Haven',
  },
  {
    id: 'p4',
    no: '04',
    name: 'Raheja District',
    location: 'Navi Mumbai Hub',
    type: 'Integrated Commercial & Tech Park',
    desc: 'Next-generation commercial campuses engineered for modern corporate headquarters and global enterprises.',
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1200&q=85',
    spec: 'Commercial Scale',
  },
  {
    id: 'p5',
    no: '05',
    name: 'Raheja Centre-Point',
    location: 'Santacruz, Western Express Corridor',
    type: 'Prime Metro Commercial Landmark',
    desc: 'Strategic commercial development serving Mumbai’s major airport and transit corridors.',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85',
    spec: 'Transit-Oriented Hub',
  },
];

export default function LegacyExperience() {
  const sectionRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const scrollProgressRef = useRef(0);
  const barIndicatorRef = useRef(null);
  const sceneNameRef = useRef(null);
  const activeSceneRef = useRef('');
  const hudProgressRef = useRef(null);
  const [debugMode, setDebugMode] = useState(false);

  // Check URL debug parameter (?debug=true)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('debug') === 'true') {
        setDebugMode(true);
      }
    }
  }, []);

  // Mouse Parallax tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Master GSAP Timeline with Strict Non-Overlapping Scene Lifecycles
  useEffect(() => {
    const ctx = gsap.context(() => {
      const section = sectionRef.current;
      if (!section) return;

      // Set all scenes initially completely hidden
      gsap.set(['.scene-intro', '.scene-1980', '.scene-1986', '.scene-museum', '.scene-sea', '.scene-verona', '.scene-finale'], {
        autoAlpha: 0,
        pointerEvents: 'none',
      });

      // Master Timeline: 1 unified ScrollTrigger
      const masterTL = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=7000',
          pin: true,
          scrub: 1.2,
          anticipatePin: 1,
          onUpdate: (self) => {
            const p = self.progress;
            scrollProgressRef.current = p;
            if (barIndicatorRef.current) {
              barIndicatorRef.current.style.transform = `scaleX(${p})`;
            }
            if (hudProgressRef.current) {
              hudProgressRef.current.textContent = `${(p * 100).toFixed(1)}%`;
            }

            let name = 'SCENE 0: INTRO';
            if (p < 0.12) name = 'SCENE 0: INTRO';
            else if (p < 0.25) name = 'SCENE 1: 1980 FOUNDATION';
            else if (p < 0.38) name = 'SCENE 2: 1986 EXPANSION';
            else if (p < 0.62) name = 'SCENE 3: MILESTONES MUSEUM';
            else if (p < 0.76) name = 'SCENE 4: CITY MEETS SEA';
            else if (p < 0.90) name = 'SCENE 5: VERONA REVEAL';
            else name = 'SCENE 6: FINALE & TRANSITION';

            if (name !== activeSceneRef.current) {
              activeSceneRef.current = name;
              if (sceneNameRef.current) {
                sceneNameRef.current.textContent = name;
              }
            }
          },
        },
      });

      /* ─────────────────────────────────────────────────────────────
         SCENE 0 — INTRO (Progress 0.00 -> 0.12)
         Completely clean screen. Only: FOUR DECADES OF ARCHITECTURE / A LEGACY SHAPED BY MUMBAI.
      ───────────────────────────────────────────────────────────── */
      masterTL
        // Enter Intro
        .to('.scene-intro', { autoAlpha: 1, duration: 0.03 }, 0.00)
        .fromTo('.intro-eyebrow', { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.04 }, 0.01)
        .fromTo('.intro-title', { y: 40, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.05 }, 0.02)
        .fromTo('.intro-line', { scaleX: 0 }, { scaleX: 1, duration: 0.03 }, 0.04)
        // Hold Intro (0.05 -> 0.08)
        // Exit Intro cleanly
        .to('.scene-intro', { yPercent: -40, scale: 0.92, autoAlpha: 0, duration: 0.04, ease: 'power2.in' }, 0.09);

      /* ─────────────────────────────────────────────────────────────
         SCENE 1 — 1980 THE FOUNDATION (Progress 0.12 -> 0.25)
         Enter 1980 + The Foundation + One image. NO other text visible.
      ───────────────────────────────────────────────────────────── */
      masterTL
        .to('.scene-1980', { autoAlpha: 1, duration: 0.03 }, 0.12)
        .fromTo('.card-1980-col-left', { x: -60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.05 }, 0.13)
        .fromTo('.card-1980-col-right', { x: 60, opacity: 0, clipPath: 'inset(0 100% 0 0)' }, { x: 0, opacity: 1, clipPath: 'inset(0 0% 0 0)', duration: 0.06 }, 0.14)
        // Hold (0.16 -> 0.20)
        // Exit 1980 completely
        .to('.scene-1980', { yPercent: -30, scale: 0.94, autoAlpha: 0, duration: 0.04, ease: 'power2.in' }, 0.21);

      /* ─────────────────────────────────────────────────────────────
         SCENE 2 — 1986 THE NEXT CHAPTER (Progress 0.25 -> 0.38)
         Enter 1986 + Suresh L. Raheja + Decisive luxury entry.
      ───────────────────────────────────────────────────────────── */
      masterTL
        .to('.scene-1986', { autoAlpha: 1, duration: 0.03 }, 0.25)
        .fromTo('.year-1986-badge', { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.04 }, 0.26)
        .fromTo('.card-1986-left', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.05 }, 0.27)
        .fromTo('.card-1986-right', { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.05 }, 0.28)
        // Hold (0.30 -> 0.34)
        // Exit 1986 completely
        .to('.scene-1986', { yPercent: -30, autoAlpha: 0, duration: 0.04, ease: 'power2.in' }, 0.34);

      /* ─────────────────────────────────────────────────────────────
         SCENE 3 — MILESTONES MUSEUM (Progress 0.38 -> 0.62)
         Horizontal track: Shows ONE project at a time.
      ───────────────────────────────────────────────────────────── */
      masterTL
        .to('.scene-museum', { autoAlpha: 1, duration: 0.03 }, 0.38)
        .fromTo('.museum-heading', { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.03 }, 0.38)
        // Horizontal scroll through projects (1 -> 5)
        .fromTo('.museum-project-track', { xPercent: 0 }, { xPercent: -80, duration: 0.20, ease: 'none' }, 0.40)
        // Exit Museum
        .to('.scene-museum', { autoAlpha: 0, duration: 0.03, ease: 'power2.in' }, 0.59);

      /* ─────────────────────────────────────────────────────────────
         SCENE 4 — AND THEN, THE CITY MEETS THE SEA (Progress 0.62 -> 0.76)
         32-Acre Madh Island sanctuary & ocean horizon.
      ───────────────────────────────────────────────────────────── */
      masterTL
        .to('.scene-sea', { autoAlpha: 1, duration: 0.03 }, 0.62)
        .fromTo('.sea-tag', { opacity: 0, y: -15 }, { opacity: 1, y: 0, duration: 0.03 }, 0.63)
        .fromTo('.sea-title', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.05 }, 0.64)
        .fromTo('.sea-line', { scaleX: 0 }, { scaleX: 1, duration: 0.03 }, 0.66)
        .fromTo('.sea-desc', { opacity: 0 }, { opacity: 1, duration: 0.04 }, 0.67)
        // Hold (0.68 -> 0.72)
        // Exit Sea
        .to('.scene-sea', { yPercent: -30, autoAlpha: 0, duration: 0.04, ease: 'power2.in' }, 0.72);

      /* ─────────────────────────────────────────────────────────────
         SCENE 5 — VERONA ARCHITECTURAL REVEAL (Progress 0.76 -> 0.90)
         Progressive 4-step structural construction.
      ───────────────────────────────────────────────────────────── */
      masterTL
        .to('.scene-verona', { autoAlpha: 1, duration: 0.03 }, 0.76)
        .fromTo('.verona-panel', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.05 }, 0.77)
        .fromTo('.verona-step', { x: -20, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.02, duration: 0.05 }, 0.79)
        // Hold (0.83 -> 0.86)
        // Exit Verona
        .to('.scene-verona', { scale: 0.94, autoAlpha: 0, duration: 0.04, ease: 'power2.in' }, 0.86);

      /* ─────────────────────────────────────────────────────────────
         SCENE 6 — FINALE & TRANSITION (Progress 0.90 -> 1.00)
         A Legacy Continues + VERONA + background smooth transition to #F5F0E8
      ───────────────────────────────────────────────────────────── */
      masterTL
        .to('.scene-finale', { autoAlpha: 1, duration: 0.03 }, 0.90)
        .fromTo('.finale-title', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.04 }, 0.91)
        .fromTo('.finale-brand', { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.05 }, 0.93)
        // Background smooth color fade from Deep Navy (#06131B) to Warm Ivory (#F5F0E8)
        .to(section, { backgroundColor: '#F5F0E8', duration: 0.06, ease: 'power1.inOut' }, 0.94)
        .to('.finale-brand', { color: '#06131B', duration: 0.04 }, 0.95);

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="legacy-cinematic-film-section" id="legacy" ref={sectionRef}>
      <LegacyCursor containerRef={sectionRef} />

      {/* Persistent Three.js WebGL Canvas in Background */}
      <Legacy3DCanvas scrollProgressRef={scrollProgressRef} mouseRef={mouseRef} />

      {/* Subtle Vignette & Grid */}
      <div className="legacy-film-vignette" />
      <div className="legacy-architectural-grid-overlay" />

      {/* Realtime Debug HUD (?debug=true) */}
      {debugMode && (
        <div className="legacy-debug-hud">
          <div className="hud-title">⚡ RAHEJA LEGACY FILM DEBUG HUD</div>
          <div className="hud-row"><span>Active Scene:</span> <b ref={sceneNameRef} style={{ color: '#c9a96a' }}>SCENE 0: INTRO</b></div>
          <div className="hud-row"><span>Master Progress:</span> <b ref={hudProgressRef}>0.0%</b></div>
          <div className="hud-row"><span>WebGL Canvas:</span> <b style={{ color: '#66e0a3' }}>ACTIVE (ONE SCENE ONLY)</b></div>
        </div>
      )}

      {/* Cinematic Stage: Only 1 Scene is Active & Visible at any moment */}
      <div className="legacy-stage-container">

        {/* ─── SCENE 0: INTRO ─── */}
        <div className="legacy-scene scene-intro">
          <div className="intro-content">
            <span className="intro-eyebrow">
              <Sparkles size={11} /> FOUR DECADES OF ARCHITECTURE
            </span>
            <div className="intro-line" />
            <h1 className="intro-title">
              A LEGACY<br />SHAPED BY<br /><i>MUMBAI.</i>
            </h1>
            <p className="intro-hint">SCROLL TO BEGIN THE JOURNEY</p>
          </div>
        </div>

        {/* ─── SCENE 1: 1980 THE FOUNDATION ─── */}
        <div className="legacy-scene scene-1980">
          <div className="card-1980">
            <div className="card-1980-col-left">
              <span className="scene-tag"><Compass size={11} /> CHAPTER 01 — 1980</span>
              <div className="year-hero">1980</div>
              <h2 className="scene-heading">The Foundation of an<br /><i>Urban Legacy</i></h2>
              <p className="scene-body">
                The journey began with the incorporation of Garden View Properties and Hotels Private Limited, laying the institutional bedrock for Raheja Universal’s Mumbai real-estate journey.
              </p>
              <blockquote className="scene-quote">
                “A steadfast commitment to visionary planning and uncompromising structural integrity.”
              </blockquote>
            </div>

            <div className="card-1980-col-right">
              <div className="scene-img-frame">
                <img
                  src="https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1000&q=85"
                  alt="Origins 1980"
                  loading="lazy"
                />
                <div className="img-badge">ORIGINS · MUMBAI 1980</div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── SCENE 2: 1986 THE NEXT CHAPTER ─── */}
        <div className="legacy-scene scene-1986">
          <div className="card-1986">
            <div className="card-1986-left">
              <span className="scene-tag"><Shield size={11} /> CHAPTER 02 — 1986</span>
              <div className="year-1986-badge">1986</div>
              <h2 className="scene-heading">Suresh L. Raheja<br /><i>Enters Real Estate</i></h2>
              <p className="scene-body">
                Under the leadership of Suresh L. Raheja, the group made its decisive entry into real-estate development, setting new industry standards for quality audits and modern architectural engineering.
              </p>
              <div className="scene-stat-pill">Prime Mumbai Residential & Commercial</div>
            </div>

            <div className="card-1986-right">
              <div className="scene-img-frame">
                <img
                  src="https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1000&q=85"
                  alt="1986 Expansion"
                  loading="lazy"
                />
                <div className="img-badge">EXPANSION · 1986</div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── SCENE 3: A MUSEUM OF MILESTONES (1 Project at a time) ─── */}
        <div className="legacy-scene scene-museum">
          <div className="museum-header-bar">
            <span className="scene-tag"><Building2 size={11} /> CHAPTER 03 — ARCHITECTURAL MILESTONES</span>
            <h3 className="museum-heading">A Museum of Milestones</h3>
          </div>

          <div className="museum-project-track">
            {MILESTONE_PROJECTS.map((proj) => (
              <article key={proj.id} className="museum-single-card" data-cursor="PROJECT">
                <div className="museum-card-media">
                  <img src={proj.image} alt={proj.name} loading="lazy" />
                  <div className="museum-media-scrim" />
                  <div className="museum-card-num">{proj.no} / 05</div>
                </div>

                <div className="museum-card-info">
                  <span className="museum-card-loc">{proj.location}</span>
                  <h4 className="museum-card-title">{proj.name}</h4>
                  <p className="museum-card-desc">{proj.desc}</p>
                  <div className="museum-card-spec">{proj.spec}</div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* ─── SCENE 4: CITY MEETS THE SEA ─── */}
        <div className="legacy-scene scene-sea">
          <div className="sea-box">
            <span className="sea-tag"><Sparkles size={11} /> CHAPTER 04 — MADH ISLAND</span>
            <h2 className="sea-title">And then,<br />the city meets <i>the sea.</i></h2>
            <div className="sea-line" />
            <p className="sea-desc">
              The creation of the 32-acre Raheja Exotica coastal sanctuary — where over 80% is dedicated to native green landscape, watercourses, and ocean breeze corridors.
            </p>
            <div className="sea-stats-row">
              <div><b>32</b><span>ACRES HAVEN</span></div>
              <div><b>80%</b><span>PROTECTED GREENS</span></div>
              <div><b>180°</b><span>OCEAN PANORAMA</span></div>
            </div>
          </div>
        </div>

        {/* ─── SCENE 5: VERONA REVEAL ─── */}
        <div className="legacy-scene scene-verona">
          <div className="verona-panel">
            <span className="scene-tag"><Award size={11} /> CHAPTER 05 — THE PINNACLE</span>
            <h2 className="verona-title">Verona: <i>The Crowning Address</i></h2>
            <p className="verona-sub">
              Guided today by Suresh Raheja and Ashish Raheja, four decades of masterplanning culminate at Verona.
            </p>

            <div className="verona-steps-grid">
              <div className="verona-step">
                <b>01</b>
                <div><strong>Wireframe Logic</strong><span>Low-density floor plates</span></div>
              </div>
              <div className="verona-step">
                <b>02</b>
                <div><strong>Cantilevers</strong><span>8-ft deep shaded verandahs</span></div>
              </div>
              <div className="verona-step">
                <b>03</b>
                <div><strong>Acoustic Glass</strong><span>Floor-to-ceiling double Low-E</span></div>
              </div>
              <div className="verona-step">
                <b>04</b>
                <div><strong>Resort Living</strong><span>60+ club & wellness amenities</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── SCENE 6: FINALE & SEAMLESS SECTION BLEND ─── */}
        <div className="legacy-scene scene-finale">
          <div className="finale-box">
            <span className="scene-tag">THE LEGACY CONTINUES</span>
            <h2 className="finale-title">A Legacy Continues.</h2>
            <p className="finale-sub">
              From Mumbai’s evolving urban landscape to a new standard of island living.
            </p>
            <div className="finale-brand">VERONA</div>
            <a href="#residences" className="finale-cta-btn" data-cursor="EXPLORE">
              <span>Step Inside the Residences</span>
              <ArrowUpRight size={16} />
            </a>
          </div>
        </div>

      </div>

      {/* Persistent Bottom Bar */}
      <div className="legacy-bottom-bar">
        <div className="bar-progress-track">
          <div className="bar-progress-indicator" ref={barIndicatorRef} style={{ transformOrigin: 'left', transform: 'scaleX(0)' }} />
        </div>
        <div className="bar-labels">
          <span ref={sceneNameRef}>SCENE 0: INTRO</span>
          <span>RAHEJA UNIVERSAL · 1980 — TODAY</span>
        </div>
      </div>
    </section>
  );
}
