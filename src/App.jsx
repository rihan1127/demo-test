import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowDownRight, ArrowRight, ArrowUpRight, Menu, X, Play, ChevronLeft, ChevronRight, Phone, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { createFrameScrubber } from './lib/frameScrub.js';
import LegacyExperience from './components/legacy/LegacyExperience';
import './components/legacy/legacy.css';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

const FRAME_SETS = {
  portrait: { dir: '/hero-frames/m', count: 120, srcW: 808, srcH: 1440 },
  landscape: { dir: '/hero-frames/d', count: 120, srcW: 1280, srcH: 720 },
};

/* ── device check (evaluated once per component mount) ── */
const isMobile = () => window.innerWidth <= 900 || 'ontouchstart' in window;

const photos = {
  hero: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=2400&q=90',
  tower: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2200&q=90',
  interior: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2200&q=90',
  terrace: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2200&q=90',
  room: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85',
  bedroom: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=85',
  kitchen: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=85',
  bath: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1600&q=85',
  pool: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1800&q=85',
  night: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=2400&q=90',
};

const rooms = [
  {
    name: 'Living Room',
    subtitle: 'Great Room & Ocean Vista Lounge',
    note: 'An expansive light-filled sanctuary engineered with 11’4” clear heights, framing unbroken 180° Arabian Sea panoramas.',
    image: photos.interior,
    no: '01',
    specs: [
      { label: 'Ceiling Height', value: '11 ft 4 in' },
      { label: 'Glazing', value: 'Low-E acoustic double glass' },
      { label: 'Flooring', value: 'Imported Botticino Italian marble' },
      { label: 'Orientation', value: 'West-facing sunset corridor' },
      { label: 'Ventilation', value: '100% natural cross-breeze airflow' },
    ],
    highlights: [
      'Flush-threshold transition to private ocean verandah',
      'Concealed Daikin VRV multi-zone climate system',
      'Integrated architectural cove lighting and acoustic insulation',
    ],
    hotspots: [
      { id: 'h1', x: 26, y: 38, title: 'Panoramic Ocean Glazing', desc: 'Floor-to-ceiling Low-E double glazing framing unbroken views of the Madh coastline.' },
      { id: 'h2', x: 62, y: 74, title: 'Botticino Italian Marble', desc: 'Seamless book-matched Italian marble slabs throughout the grand living and dining foyer.' },
      { id: 'h3', x: 80, y: 24, title: 'Acoustic Ceiling Architecture', desc: '11’4” clear volume with recessed perimeter slots for zero-draft ducted climate control.' },
    ],
  },
  {
    name: 'Master Bedroom',
    subtitle: 'Private Sanctuary & Sunset Balcony',
    note: 'A quiet retreat oriented to catch morning tranquility and evening sea breezes, with custom-fitted Italian wardrobes.',
    image: photos.bedroom,
    no: '02',
    specs: [
      { label: 'Area', value: '380 sq.ft. private suite' },
      { label: 'Flooring', value: 'Engineered natural oak timber' },
      { label: 'Wardrobe', value: 'Italian custom-fitted walk-in dressing' },
      { label: 'Privacy', value: 'Sound-isolated acoustic perimeter walls' },
    ],
    highlights: [
      'Private sea-facing sunrise balcony',
      'Integrated smart ambient lighting moods',
      'Dedicated dressing & vanity boudoir',
    ],
  },
  {
    name: 'The Kitchen',
    subtitle: 'Chef-Grade Modular Gourmet Kitchen',
    note: 'Ergonomically planned with quartz countertops, integrated European appliances, and a dedicated service utility quarter.',
    image: photos.kitchen,
    no: '03',
    specs: [
      { label: 'Countertops', value: 'Scratch-proof Caesarstone quartz' },
      { label: 'Cabinetry', value: 'Soft-close anti-fingerprint matte lacquer' },
      { label: 'Appliances', value: 'Miele/Siemens built-in oven & hob' },
      { label: 'Utility', value: 'Separate service entry & utility balcony' },
    ],
    highlights: [
      'Heavy-duty exhaust ducting with quiet inline motors',
      'Dual-sink prep and wash zoning',
      'Concealed dry-pantry storage',
    ],
  },
  {
    name: 'Bath & Wellness',
    subtitle: 'Five-Fixture Spa Bathroom',
    note: 'Hand-selected travertine and marble finishes with rain showers, freestanding soaking tubs, and Hansgrohe fixtures.',
    image: photos.bath,
    no: '04',
    specs: [
      { label: 'Fixtures', value: 'Hansgrohe Axor & Kohler Veil' },
      { label: 'Surfaces', value: 'Full-height book-matched travertine' },
      { label: 'Shower', value: 'Thermostatic ceiling rain shower' },
      { label: 'Ventilation', value: 'Whisper-quiet multi-stage extraction' },
    ],
    highlights: [
      'Freestanding soaking tub overlooking private garden niche',
      'Anti-fog heated LED backlit vanity mirrors',
      'Under-counter discreet storage',
    ],
  },
  {
    name: 'Private Deck',
    subtitle: 'Wraparound Ocean & Garden Verandah',
    note: 'Seamless outdoor extension of the living space with weather-resistant hardwood decking and frameless glass balustrades.',
    image: photos.terrace,
    no: '05',
    specs: [
      { label: 'Depth', value: 'Up to 8 ft wide continuous deck' },
      { label: 'Railing', value: 'Frameless laminated safety glass' },
      { label: 'Decking', value: 'UV-treated weather-sealed teak wood' },
      { label: 'Drainage', value: 'Concealed channel drainage system' },
    ],
    highlights: [
      'Zero-level threshold for smooth indoor-outdoor flow',
      'Integrated planter troughs with drip irrigation',
      'Exterior architectural accent wall sconces',
    ],
  },
];

const AMENITY_DATA = [
  {
    name: 'Club Exotica',
    subtitle: 'Grand Clubhouse & Social Hub',
    image: photos.interior,
    tag: '01 · CLUB EXOTICA',
    desc: 'Sprawling private clubhouse with curated social lounges, indoor games pavilion, and concierge services.',
    specs: [
      { label: 'Scale', value: 'Multi-Level Hub' },
      { label: 'Vibe', value: 'Private Club' },
    ],
  },
  {
    name: 'The Infinity Pool',
    subtitle: 'Ocean-Facing Horizon Waters',
    image: photos.pool,
    tag: '02 · AQUA SANCTUARY',
    desc: 'Cascading temperature-controlled infinity pool reflecting Arabian Sea sunsets and coastal palm breezes.',
    specs: [
      { label: 'View', value: 'Arabian Sea' },
      { label: 'Feature', value: 'Sun Deck & Cabanas' },
    ],
  },
  {
    name: 'Wellness Studio',
    subtitle: 'Mind, Body & Fitness Pavilion',
    image: photos.room,
    tag: '03 · WELLNESS & SPA',
    desc: 'State-of-the-art gymnasium, open-air yoga decks, and holistic rejuvenation treatment suites.',
    specs: [
      { label: 'Equipment', value: 'Technogym Suites' },
      { label: 'Decks', value: 'Open-Air Yoga' },
    ],
  },
  {
    name: 'The Private Lounge',
    subtitle: 'Exclusive Resident Sanctuary',
    image: photos.terrace,
    tag: '04 · SKY LOUNGE',
    desc: 'Private dining banquet rooms, cigar & whisky salon, and elevated screening rooms for bespoke entertainment.',
    specs: [
      { label: 'Setting', value: 'Intimate Luxury' },
      { label: 'Access', value: 'Resident Exclusive' },
    ],
  },
  {
    name: 'Courts & Open Lawns',
    subtitle: 'Outdoor Sporting & Flora',
    image: photos.hero,
    tag: '05 · ACTIVE GROUNDS',
    desc: 'Floodlit multi-sport courts, manicured jogging tracks, and 80% lush green open spaces across 32 acres.',
    specs: [
      { label: 'Grounds', value: '32-Acre Estate' },
      { label: 'Greens', value: '80% Open Flora' },
    ],
  },
];

function Eyebrow({ children, light = false }) {
  return <div className={`eyebrow ${light ? 'eyebrow-light' : ''}`}><span />{children}</div>;
}
function Img({ src, alt = '', className = '' }) {
  return <img src={src} alt={alt} className={className} loading="lazy" />;
}

/* ─────────────────────────────────────────────────────────────────────────
   VIDEO SCRUBBER
   Attaches to the GSAP ticker (the same RAF Lenis uses).
   No separate requestAnimationFrame — zero duplicate loops.
   Works identically on desktop and mobile devices.
───────────────────────────────────────────────────────────────────────── */
function makeVideoScrubber(video) {
  let target = 0;
  let busy = false;
  let seekTimer = null;

  function tick() {
    if (!video || !video.duration || !Number.isFinite(video.duration)) return;

    /* Always keep playback paused — scrubbing controls frame position */
    if (video.playbackRate !== 0) video.playbackRate = 0;

    if (busy) return;
    const delta = target - video.currentTime;
    if (Math.abs(delta) < 0.012) return;
    busy = true;
    const next = Math.max(0, Math.min(video.duration, video.currentTime + delta * 0.38));
    try {
      if (video.fastSeek) video.fastSeek(next);
      else video.currentTime = next;
    } catch (_) {
      busy = false;
    }

    clearTimeout(seekTimer);
    seekTimer = setTimeout(() => {
      busy = false;
    }, 70);

    video.onseeked = () => {
      clearTimeout(seekTimer);
      video.playbackRate = 0;
      busy = false;
    };
  }

  gsap.ticker.add(tick);
  return {
    setTarget(t) { target = t; },
    destroy() {
      gsap.ticker.remove(tick);
      clearTimeout(seekTimer);
      if (video) video.onseeked = null;
    },
  };
}

/* ─── Navigation ─── */
function Navigation({ onEnquire }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const links = [
    ['Experience', '#experience'], ['Legacy', '#legacy'], ['Residences', '#residences'],
    ['Amenities', '#amenities'],
  ];

  useEffect(() => {
    document.body.classList.toggle('menu-open', open);
    return () => document.body.classList.remove('menu-open');
  }, [open]);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 80);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return <>
    <header className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <a className="brand" href="#top" aria-label="Verona home">
        <span className="brand-mark">V</span>
        <span><b>VERONA</b><small>RAHEJA EXOTICA · MUMBAI</small></span>
      </a>
      <nav className="nav-links">{links.map(([l, h]) => <a key={l} href={h}>{l}</a>)}</nav>
      <button className="nav-cta" onClick={onEnquire}>Enquire <ArrowUpRight size={14} /></button>
      <button className="menu-toggle" onClick={() => setOpen(v => !v)} aria-label={open ? 'Close' : 'Open menu'}>
        {open ? <span style={{ fontSize: 22, lineHeight: 1 }}>✕</span> : <span style={{ fontSize: 22, lineHeight: 1 }}>☰</span>}
      </button>
    </header>
    <div className={`menu-overlay ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      <div className="menu-overlay-inner">
        <Eyebrow>Discover Verona</Eyebrow>
        {links.map(([l, h], i) => (
          <a key={l} href={h} onClick={() => setOpen(false)}>
            <span>0{i + 1}</span>{l}<ArrowUpRight />
          </a>
        ))}
        <p>Madh Island · Mumbai</p>
      </div>
    </div>
  </>;
}

/* ─── Hero Phase Data ─── */
const heroPhases = [
  {
    phase: 0,
    tag: 'PHASE 01 · THE ARRIVAL',
    eyebrow: 'Raheja Exotica presents',
    title: 'An island of possibilities.',
    sub: 'A rare address. A world apart. A life shaped by the sea.',
    pills: ['19°08\' N · Madh Island', '32-Acre Estate', 'Gated Island Haven'],
    hasCta: true,
  },
  {
    phase: 1,
    tag: 'PHASE 02 · MASTER SANCTUARY',
    eyebrow: 'Private Ocean Suite',
    title: 'Awaken to unbroken blue.',
    sub: 'Floor-to-ceiling sea breeze drapery, Italian marble spa bath, and private sunrise views.',
    pills: ['11\' 4" Clear Volume', 'Cross-Ventilated Breeze', 'En-Suite Ocean Bath'],
    hasCta: false,
  },
  {
    phase: 2,
    tag: 'PHASE 03 · SUNSET VERANDAH',
    eyebrow: 'Private Outdoor Living',
    title: 'The horizon, reserved for you.',
    sub: 'Private teak sun deck & infinity plunge terrace framing sunset waters over the Arabian Sea.',
    pills: ['180° Panoramic Horizon', 'UV-Sealed Teak Deck', 'Infinity Plunge Pool'],
    hasCta: false,
  },
  {
    phase: 3,
    tag: 'PHASE 04 · THE RESORT OASIS',
    eyebrow: 'Club Exotica & Grounds',
    title: 'Resort living, every single day.',
    sub: 'Lush tropical grounds, cascading swimming pools, and 60+ curated club amenities.',
    pills: ['32 Acres of Land', '60+ Club Amenities', '80% Open Greens'],
    hasCta: false,
  },
];

/* ─── Hero ─── */
function Hero() {
  const track = useRef(null);
  const ref = useRef(null);
  const canvas = useRef(null);
  const [activePhase, setActivePhase] = useState(0);
  const activePhaseRef = useRef(0);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const portraitMQ = window.matchMedia('(max-aspect-ratio: 4/5)');
    let scrubber = null;
    let progress = 0;

    const mount = () => {
      scrubber?.destroy();
      const set = portraitMQ.matches ? FRAME_SETS.portrait : FRAME_SETS.landscape;
      scrubber = createFrameScrubber(canvas.current, { ...set, limit: reduce ? 1 : set.count });
      const r = ref.current?.getBoundingClientRect();
      if (r) scrubber.resize(r.width, r.height, window.devicePixelRatio || 1);
      scrubber.setProgress(progress);
    };
    mount();
    portraitMQ.addEventListener('change', mount);

    const ro = new ResizeObserver(([e]) => scrubber?.resize(e.contentRect.width, e.contentRect.height, window.devicePixelRatio || 1));
    if (ref.current) ro.observe(ref.current);

    const ctx = gsap.context(() => {
      gsap.from('.hero-phase-0 > *', { y: 35, opacity: 0, duration: 1.2, stagger: 0.13, ease: 'power3.out', delay: 0.25 });
      if (reduce) return;

      const story = gsap.timeline({
        scrollTrigger: {
          id: 'hero-film-scrub',
          trigger: track.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: self => {
            progress = self.progress;
            scrubber?.setProgress(progress);
            
            let nextPhase = 0;
            if (progress >= 0.775) nextPhase = 3;
            else if (progress >= 0.505) nextPhase = 2;
            else if (progress >= 0.235) nextPhase = 1;

            if (nextPhase !== activePhaseRef.current) {
              activePhaseRef.current = nextPhase;
              setActivePhase(nextPhase);
            }
          }
        }
      });

      // Strict non-overlapping phase timelines (fade durations: 0.08, clear gaps between out & in)
      story.to('.hero-phase-0', { y: -48, autoAlpha: 0, duration: 0.08, ease: 'power1.in' }, 0.16);

      story.fromTo('.hero-phase-1', { y: 48, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.08, ease: 'power1.out' }, 0.26);
      story.to('.hero-phase-1', { y: -48, autoAlpha: 0, duration: 0.08, ease: 'power1.in' }, 0.43);

      story.fromTo('.hero-phase-2', { y: 48, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.08, ease: 'power1.out' }, 0.53);
      story.to('.hero-phase-2', { y: -48, autoAlpha: 0, duration: 0.08, ease: 'power1.in' }, 0.70);

      story.fromTo('.hero-phase-3', { y: 48, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.08, ease: 'power1.out' }, 0.80);

      story.fromTo('.hero-stats > div', { y: 15, autoAlpha: 0.7 }, { y: 0, autoAlpha: 1, duration: 0.11, stagger: 0.065, ease: 'none' }, 0.3);
      story.to('.hero-scroll', { autoAlpha: 0, duration: 0.08, ease: 'none' }, 0.91);
    }, ref);

    return () => {
      ctx.revert();
      ro.disconnect();
      portraitMQ.removeEventListener('change', mount);
      scrubber?.destroy();
    };
  }, []);

  return (
    <div className="hero-track" ref={track}>
      <section className="hero" id="top" ref={ref}>
        <canvas ref={canvas} className="hero-canvas" role="img" aria-label="Cinematic Verona property film" />
        <div className="hero-shade" />

        <div className="hero-top">
          <span>19°08' N&nbsp; 72°47' E</span>
          <span>MADH ISLAND, MUMBAI</span>
        </div>

        {/* 4 Cinematic Hero Phases Overlays */}
        <div className="hero-phases-container">
          {heroPhases.map((item, idx) => (
            <div key={item.phase} className={`hero-copy hero-phase hero-phase-${idx}`}>
              <span className="hero-phase-tag">{item.tag}</span>
              <Eyebrow light>{item.eyebrow}</Eyebrow>
              <h1>
                {item.title.split(' ').map((w, i, arr) => {
                  if (i >= arr.length - 2) return <i key={i}> {w}</i>;
                  return (i === 0 ? '' : ' ') + w;
                })}
              </h1>
              <p className="hero-sub">{item.sub}</p>
              
              <div className="hero-phase-pills">
                {item.pills.map((pill, pi) => (
                  <span key={pi} className="hero-phase-pill">{pill}</span>
                ))}
              </div>

              {item.hasCta && (
                <a href="#experience" className="round-link" style={{ marginTop: 22 }}>
                  <span>Discover Verona</span><ArrowDownRight size={19} />
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Phase Navigator Indicators */}
        <div className="hero-phase-nav">
          {heroPhases.map((hp, i) => (
            <div
              key={i}
              className={`hero-phase-indicator ${i === activePhase ? 'is-active' : ''}`}
            >
              <span className="phase-dot" />
              <span className="phase-name">{hp.tag.split('·')[1]?.trim() || `0${i+1}`}</span>
            </div>
          ))}
        </div>

        <div className="hero-bottom">
          <span className="hero-scroll"><ArrowDown size={15} /> Scroll to explore</span>
          <div className="hero-stats">
            <div><b>32</b><span>ACRES OF LAND</span></div>
            <div><b>60<span>+</span></b><span>AMENITIES</span></div>
            <div><b>80<span>%</span></b><span>OPEN GREEN</span></div>
          </div>
          <span className="hero-index">0{activePhase + 1} / 04</span>
        </div>

        <div className="hero-vertical">A NEW PERSPECTIVE ON ISLAND LIVING</div>
      </section>
    </div>
  );
}

/* ─── Manifesto ─── */
function Manifesto() {
  return (
    <section className="manifesto section-pad" id="experience">
      <div className="manifesto-meta"><Eyebrow>The Verona perspective</Eyebrow><span>01 — A life, more expansive</span></div>
      <div className="manifesto-main">
        <h2>Some places<br />change your <i>view.</i><br />This one changes<br />your <i>everyday.</i></h2>
        <p>Set on the quiet shores of Madh Island, Verona brings the rarest luxuries together: room to breathe, space to belong, and the sea as your constant.</p>
      </div>
      <div className="manifesto-image">
        <Img src={photos.tower} alt="Modern residence in natural light" />
        <div className="image-caption"><span>THE ART OF ARRIVING</span><span>01 / 03</span></div>
      </div>
    </section>
  );
}

/* ─── Room Analysis Modal ─── */
function RoomAnalysisModal({ room, onClose }) {
  if (!room) return null;
  return (
    <div className="room-modal-backdrop" onClick={onClose}>
      <div className="room-modal-card" onClick={e => e.stopPropagation()}>
        <div className="room-modal-header">
          <div>
            <span className="room-modal-tag">ARCHITECTURAL SPECIFICATION · NO. {room.no}</span>
            <h2>{room.name}</h2>
            {room.subtitle && <p className="room-modal-sub">{room.subtitle}</p>}
          </div>
          <button className="room-modal-close" onClick={onClose} aria-label="Close modal">✕</button>
        </div>

        <div className="room-modal-body">
          <div className="room-modal-media">
            <Img src={room.image} alt={room.name} />
            <div className="room-modal-badge">19°08' N · MADH ISLAND</div>
          </div>
          <div className="room-modal-details">
            <div className="room-modal-section">
              <h4>Spatial Analysis & Overview</h4>
              <p>{room.note}</p>
            </div>

            {room.specs && (
              <div className="room-modal-specs-grid">
                {room.specs.map(s => (
                  <div className="room-modal-spec-item" key={s.label}>
                    <span className="spec-label">{s.label}</span>
                    <strong className="spec-value">{s.value}</strong>
                  </div>
                ))}
              </div>
            )}

            {room.highlights && (
              <div className="room-modal-highlights">
                <h4>Design & Material Highlights</h4>
                <ul>
                  {room.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="room-modal-footer">
          <span>RAHEJA EXOTICA · VERONA RESIDENCES</span>
          <button className="room-modal-action" onClick={onClose}>Close Analysis</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Residence (Living Room Feature) ─── */
function Residence() {
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [modalRoom, setModalRoom] = useState(null);
  const livingRoomData = rooms[0];

  return (
    <section className="residence section-pad" id="residences">
      <div className="residence-head">
        <div>
          <Eyebrow>Step inside</Eyebrow>
          <h2>A residence<br /><i>defined by light.</i></h2>
        </div>
        <p>Generous rooms open to the horizon. Thoughtful details make each day feel considered, and every return feel like an arrival.</p>
      </div>

      <div className="residence-visual">
        <Img src={photos.interior} alt="Sunlit living room opening to the ocean" />
        <div className="residence-label">
          <span>THE VERONA RESIDENCE · NO. 01</span>
          <span>LIVING ROOM · 180° SEA-FACING</span>
        </div>

        {/* Interactive Living Room Hotspots */}
        {livingRoomData.hotspots?.map((spot) => (
          <div
            key={spot.id}
            className={`residence-hotspot ${activeHotspot === spot.id ? 'is-active' : ''}`}
            style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
            onClick={() => setActiveHotspot(activeHotspot === spot.id ? null : spot.id)}
          >
            <button className="hotspot-trigger" aria-label={spot.title}>
              <span className="hotspot-pulse" />
              <span className="hotspot-dot" />
            </button>
            <div className="hotspot-card" onClick={e => e.stopPropagation()}>
              <div className="hotspot-title">{spot.title}</div>
              <p className="hotspot-desc">{spot.desc}</p>
            </div>
          </div>
        ))}

        <button className="residence-play" onClick={() => setModalRoom(livingRoomData)}>
          <Play size={14} fill="currentColor" /> <span>Analyze Living Room</span>
        </button>
      </div>

      {/* Real-time Architectural Living Room Analytics Grid */}
      <div className="residence-analytics-bar">
        <div className="residence-analytic-item">
          <span className="residence-analytic-num">11’ 4”</span>
          <span className="residence-analytic-label">Clear Ceiling Height</span>
        </div>
        <div className="residence-analytic-item">
          <span className="residence-analytic-num">680 <small>SQ.FT.</small></span>
          <span className="residence-analytic-label">Great Room Volume</span>
        </div>
        <div className="residence-analytic-item">
          <span className="residence-analytic-num">180°</span>
          <span className="residence-analytic-label">Arabian Sea Panorama</span>
        </div>
        <div className="residence-analytic-item">
          <span className="residence-analytic-num">100%</span>
          <span className="residence-analytic-label">Natural Cross-Breeze</span>
        </div>
      </div>

      <div className="residence-foot">
        <span>01 — OPENNESS</span>
        <span>Living room, with the horizon in view.</span>
        <a href="#rooms">Explore all rooms <ArrowRight size={15} /></a>
      </div>

      {modalRoom && <RoomAnalysisModal room={modalRoom} onClose={() => setModalRoom(null)} />}
    </section>
  );
}

/* ─── RoomExplorer (Sheryians-Style Showcase) ─── */
function RoomExplorer() {
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const [modalRoom, setModalRoom] = useState(null);
  const section = useRef(null);
  const track = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.room-card');
      gsap.to(track.current, {
        x: () => -(track.current.scrollWidth - window.innerWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: section.current,
          start: 'top top',
          end: () => `+=${track.current.scrollWidth - window.innerWidth}`,
          scrub: true,
          pin: true,
          pinSpacing: true,
          invalidateOnRefresh: true,
          onUpdate: self => {
            const idx = Math.min(cards.length - 1, Math.floor(self.progress * cards.length));
            if (idx !== activeRef.current) {
              activeRef.current = idx;
              setActive(idx);
            }
          },
        },
      });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section className="rooms-section" id="rooms" ref={section}>
      <div className="rooms-head">
        <div>
          <Eyebrow light>Space to make your own</Eyebrow>
          <span className="rooms-subhead">02 — The residences architectural exploration</span>
        </div>
        <div className="rooms-progress">{String(active + 1).padStart(2, '0')} <i /> 05</div>
      </div>

      <div className="rooms-track" ref={track}>
        {rooms.map((room, i) => (
          <article
            className={`room-card sheryians-card ${i === active ? 'active' : ''}`}
            key={room.name}
            onClick={() => setModalRoom(room)}
          >
            <div className="sheryians-card-media">
              <Img src={room.image} alt={room.name} />
              <div className="sheryians-card-overlay" />
            </div>

            {/* Top Controls: Badge + Circular Floating Action */}
            <div className="sheryians-card-top">
              <span className="sheryians-tag">
                <Sparkles size={11} /> {room.subtitle?.split('&')[0]?.trim() || `Residence ${room.no}`}
              </span>
              <div className="sheryians-circle-btn" aria-label={`Inspect ${room.name}`}>
                <ArrowUpRight size={18} className="sheryians-arrow" />
              </div>
            </div>

            {/* Bottom Content Floating inside the Card */}
            <div className="sheryians-card-bottom">
              <div className="sheryians-room-index">0{room.no} / 05 · 19°08' N SEA CORRIDOR</div>
              <h3 className="sheryians-title">{room.name}</h3>
              <p className="sheryians-desc">{room.note}</p>

              {room.specs && (
                <div className="sheryians-pills-row">
                  {room.specs.slice(0, 3).map(s => (
                    <span key={s.label} className="sheryians-spec-pill">
                      <b>{s.label}:</b> {s.value}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      <div className="rooms-footer">
        <span>SCROLL TO MOVE THROUGH THE RESIDENCE · TAP ANY CARD TO INSPECT</span>
        <ArrowRight size={17} />
      </div>

      {modalRoom && <RoomAnalysisModal room={modalRoom} onClose={() => setModalRoom(null)} />}
    </section>
  );
}

/* ─── Amenities (Sheryians-Style Showcase) ─── */
function Amenities() {
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const section = useRef(null);
  const track = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.amenity-card');
      gsap.to(track.current, {
        x: () => -(track.current.scrollWidth - window.innerWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: section.current,
          start: 'top top',
          end: () => `+=${track.current.scrollWidth - window.innerWidth}`,
          scrub: true,
          pin: true,
          pinSpacing: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const idx = Math.min(cards.length - 1, Math.floor(self.progress * cards.length));
            if (idx !== activeRef.current) {
              activeRef.current = idx;
              setActive(idx);
            }
          },
        },
      });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section className="amenities-section" id="amenities" ref={section}>
      <div className="amenities-head">
        <div>
          <Eyebrow light>Beyond the expected</Eyebrow>
          <span className="amenities-subhead">03 — 60+ Resort-Style Club & Island Amenities</span>
        </div>
        <div className="amenities-progress">{String(active + 1).padStart(2, '0')} <i /> 05</div>
      </div>

      <div className="amenities-track" ref={track}>
        {AMENITY_DATA.map((item, i) => (
          <article
            className={`amenity-card sheryians-card ${i === active ? 'active' : ''}`}
            key={item.name}
          >
            <div className="sheryians-card-media">
              <Img src={item.image} alt={item.name} />
              <div className="sheryians-card-overlay" />
            </div>

            <div className="sheryians-card-top">
              <span className="sheryians-tag">
                <Sparkles size={11} /> {item.tag}
              </span>
              <div className="sheryians-circle-btn" aria-label={item.name}>
                <ArrowUpRight size={18} className="sheryians-arrow" />
              </div>
            </div>

            <div className="sheryians-card-bottom">
              <span className="sheryians-room-index">AMENITY 0{i + 1} / 05 · MADH ISLAND</span>
              <h3 className="sheryians-title">{item.name}</h3>
              <p className="sheryians-desc">{item.desc}</p>
              <div className="sheryians-pills-row">
                {item.specs.map((s) => (
                  <span key={s.label} className="sheryians-spec-pill">
                    <b>{s.label}:</b> {s.value}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="amenities-footer">
        <span>SCROLL TO EXPLORE 60+ CLUB AMENITIES · 32-ACRE RESORT LIVING</span>
        <ArrowRight size={17} />
      </div>
    </section>
  );
}

/* ─── Enquiry ─── */
function Enquiry() {
  const [sent, setSent] = useState(false);
  return (
    <section className="enquiry" id="enquire">
      <div className="enquiry-image"><Img src={photos.night} alt="Verona at twilight" /><div className="enquiry-overlay" /></div>
      <div className="enquiry-content">
        <Eyebrow light>A world of your own</Eyebrow>
        <h2>Your island<br /><i>home awaits.</i></h2>
        <p>Some addresses are discovered.<br />Others are felt.</p>
        <a className="enquire-main" href="#contact">Begin a conversation <ArrowUpRight size={17} /></a>
        <span className="enquiry-location">RAHEJA EXOTICA · MADH ISLAND · MUMBAI</span>
      </div>
      <form id="contact" className="enquiry-form" onSubmit={e => { e.preventDefault(); setSent(true); }}>
        <Eyebrow light>Request a private viewing</Eyebrow>
        <h3>{sent ? 'Thank you.' : 'Let us introduce you.'}</h3>
        {sent ? <p className="form-success">Our Verona concierge will be in touch shortly.</p> : <>
          <label>Your name<input required placeholder="Full name" /></label>
          <div className="form-row">
            <label>Mobile number<input type="tel" required placeholder="+91" /></label>
            <label>Email address<input type="email" placeholder="you@email.com" /></label>
          </div>
          <label>I'm interested in
            <select defaultValue="">
              <option value="" disabled>Select a residence</option>
              <option>2 bedroom residence</option>
              <option>3 bedroom residence</option>
              <option>4 bedroom residence</option>
              <option>Private viewing</option>
            </select>
          </label>
          <button className="form-submit" type="submit">Request a callback <ArrowUpRight size={16} /></button>
          <small>By submitting, you consent to be contacted by our team.</small>
        </>}
      </form>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="footer">
      <a href="#top" className="footer-brand">
        <span className="brand-mark">V</span>
        <span><b>VERONA</b><small>RAHEJA EXOTICA · MUMBAI</small></span>
      </a>
      <div className="footer-mid">
        <span>A LIFE APART, YET CLOSE TO IT ALL.</span>
        <span>MADE FOR THE MOMENTS THAT MATTER.</span>
      </div>
      <div className="footer-right"><a href="#top">Back to top ↑</a><span>© RAHEJA UNIVERSAL</span></div>
    </footer>
  );
}

/* ─── App root ─── */
export default function App() {
  const progressBarRef = useRef(null);

  useEffect(() => {
    /* ── Lenis smooth scroll ── */
    const lenis = new Lenis({
      duration: 1.2,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.88,
      touchMultiplier: 1.5,
      syncTouch: true,
    });

    /* Single shared RAF via GSAP ticker */
    const tickLenis = time => lenis.raf(time * 1000);
    gsap.ticker.add(tickLenis);
    gsap.ticker.lagSmoothing(0);

    /* Keep ScrollTrigger positions in sync with Lenis */
    lenis.on('scroll', ScrollTrigger.update);

    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0 && progressBarRef.current) {
        const scale = Math.min(1, Math.max(0, window.scrollY / total));
        progressBarRef.current.style.transform = `scaleX(${scale})`;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      gsap.ticker.remove(tickLenis);
      window.removeEventListener('scroll', onScroll);
      lenis.destroy();
    };
  }, []);

  const handleEnquire = () => document.querySelector('#enquire')?.scrollIntoView({ behavior: 'smooth' });

  return <>
    <div className="scroll-progress" ref={progressBarRef} style={{ transformOrigin: 'left', transform: 'scaleX(0)' }} />
    <Navigation onEnquire={handleEnquire} />
    <main>
      <Hero />
      <Manifesto />
      <LegacyExperience />
      <Residence />
      <RoomExplorer />
      <Amenities />
      <Enquiry />
    </main>
    <Footer />
    <div className="mobile-bar">
      <a href="tel:+912240000000"><Phone size={15} />Call</a>
      <a href="#enquire">Enquire <ArrowUpRight size={15} /></a>
    </div>
  </>;
}
