import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowDownRight, ArrowRight, ArrowUpRight, Menu, X, Play, Plus, Minus, MapPin, Phone, Instagram, ChevronLeft, ChevronRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import heroFilm from './assets/Create_an_ultra_premium_photo.mp4';

gsap.registerPlugin(ScrollTrigger);

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
  { name: 'Living room', note: 'A generous canvas for the rituals of everyday life.', image: photos.interior, no: '01' },
  { name: 'Master bedroom', note: 'A quiet retreat, framed by the endless blue.', image: photos.bedroom, no: '02' },
  { name: 'The kitchen', note: 'Made for gathering, finished for the senses.', image: photos.kitchen, no: '03' },
  { name: 'Bath & wellness', note: 'Begin and end every day in a softer light.', image: photos.bath, no: '04' },
  { name: 'Private deck', note: 'The horizon, reserved entirely for you.', image: photos.terrace, no: '05' },
];

const amenities = [
  ['Club Exotica', photos.interior], ['The infinity pool', photos.pool], ['Wellness studio', photos.room],
  ['The private lounge', photos.terrace], ['Courts & open lawns', photos.hero],
];

function Eyebrow({ children, light = false }) { return <div className={`eyebrow ${light ? 'eyebrow-light' : ''}`}><span />{children}</div>; }
function Image({ src, alt = '', className = '' }) { return <img src={src} alt={alt} className={className} loading="lazy" />; }

function Navigation({ onEnquire }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const links = [['Experience', '#experience'], ['Residences', '#residences'], ['Amenities', '#amenities'], ['Location', '#location'], ['Gallery', '#gallery']];
  useEffect(() => { document.body.classList.toggle('menu-open', open); return () => document.body.classList.remove('menu-open'); }, [open]);
  useEffect(() => { const update = () => setScrolled(window.scrollY > 24); update(); window.addEventListener('scroll', update, { passive: true }); return () => window.removeEventListener('scroll', update); }, []);
  return <>
    <header className={`nav ${scrolled ? 'scrolled' : ''}`}><a className="brand" href="#top" aria-label="Verona home"><span className="brand-mark">V</span><span><b>VERONA</b><small>RAHEJA EXOTICA · MUMBAI</small></span></a>
      <nav className="nav-links">{links.map(([label, href]) => <a key={label} href={href}>{label}</a>)}</nav>
      <button className="nav-cta" onClick={onEnquire}>Enquire <ArrowUpRight size={14} /></button>
      <button className="menu-toggle" onClick={() => setOpen(!open)} aria-label={open ? 'Close menu' : 'Open menu'}>{open ? <X /> : <Menu />}</button>
    </header>
    <div className={`menu-overlay ${open ? 'is-open' : ''}`} aria-hidden={!open}><div className="menu-overlay-inner"><Eyebrow>Discover Verona</Eyebrow>{links.map(([label, href], i) => <a key={label} href={href} onClick={() => setOpen(false)}><span>0{i + 1}</span>{label}<ArrowUpRight /></a>)}<p>Madh Island · Mumbai</p></div></div>
  </>;
}

function Hero() {
  const ref = useRef(null);
  const film = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-copy > *', { y: 35, opacity: 0, duration: 1.2, stagger: .13, ease: 'power3.out', delay: .25 });
      const story = gsap.timeline({ scrollTrigger: { id: 'hero-film-scrub', trigger: ref.current, start: 'top top', end: '+=220%', pin: true, scrub: 1.25, anticipatePin: 1, invalidateOnRefresh: true, onUpdate: self => {
        const video = film.current;
        if (!video || !Number.isFinite(video.duration) || !video.duration) return;
        const nextTime = self.progress * video.duration;
        if (Math.abs(video.currentTime - nextTime) > .035) video.currentTime = nextTime;
      } } });
      story.to('.hero-copy', { y: -48, autoAlpha: 0, duration: .2, ease: 'none' }, .45)
        .fromTo('.hero-stats > div', { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .11, stagger: .065, ease: 'none' }, .48)
        .to('.hero-scroll', { autoAlpha: 0, duration: .08, ease: 'none' }, .91);
    }, ref);
    return () => ctx.revert();
  }, []);
  return <section className="hero" id="top" ref={ref}>
    <video ref={film} className="hero-video" src={heroFilm} muted playsInline preload="auto" aria-label="Cinematic Verona property film" onLoadedMetadata={e => { const trigger = ScrollTrigger.getById('hero-film-scrub'); if (trigger && e.currentTarget.duration) e.currentTarget.currentTime = trigger.progress * e.currentTarget.duration; }} /><div className="hero-shade" />
    <div className="hero-top"><span>19°08' N&nbsp; 72°47' E</span><span>MADH ISLAND, MUMBAI</span></div>
    <div className="hero-copy"><Eyebrow light>Raheja Exotica presents</Eyebrow><h1>An island<br /><i>of possibilities.</i></h1><p className="hero-sub">A rare address. A world apart.<br />A life shaped by the sea.</p><a href="#experience" className="round-link"><span>Discover Verona</span><ArrowDownRight size={19} /></a></div>
    <div className="hero-bottom"><span className="hero-scroll"><ArrowDown size={15} /> Scroll to explore</span><div className="hero-stats"><div><b>32</b><span>ACRES OF LAND</span></div><div><b>60<span>+</span></b><span>AMENITIES</span></div><div><b>80<span>%</span></b><span>OPEN GREEN</span></div></div><span className="hero-index">01 / 10</span></div>
    <div className="hero-vertical">A NEW PERSPECTIVE ON ISLAND LIVING</div>
  </section>;
}

function Manifesto() {
  return <section className="manifesto section-pad" id="experience"><div className="manifesto-meta"><Eyebrow>The Verona perspective</Eyebrow><span>01 — A life, more expansive</span></div><div className="manifesto-main"><h2>Some places<br />change your <i>view.</i><br />This one changes<br />your <i>everyday.</i></h2><p>Set on the quiet shores of Madh Island, Verona brings the rarest luxuries together: room to breathe, space to belong, and the sea as your constant.</p></div><div className="manifesto-image"><Image src={photos.tower} alt="Modern residence in natural light" /><div className="image-caption"><span>THE ART OF ARRIVING</span><span>01 / 03</span></div></div></section>;
}

function BuildingSequence() {
  const ref = useRef(null); const film = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({ id: 'building-film-scrub', trigger: ref.current, start: 'top top', end: 'bottom bottom', scrub: 1.2, onUpdate: self => {
        const video = film.current;
        if (!video || !Number.isFinite(video.duration) || !video.duration) return;
        const nextTime = self.progress * video.duration;
        if (Math.abs(video.currentTime - nextTime) > .035) video.currentTime = nextTime;
      } });
      gsap.to('.building-caption', { y: -80, opacity: 0, scrollTrigger: { trigger: ref.current, start: '55% top', end: '75% top', scrub: true } });
    }, ref);
    return () => ctx.revert();
  }, []);
  return <section className="building-sequence" ref={ref}><div className="building-sticky"><video ref={film} className="building-film" src={heroFilm} muted playsInline preload="auto" aria-label="Scroll controlled Verona property film" onLoadedMetadata={e => { const trigger = ScrollTrigger.getById('building-film-scrub'); if (trigger && e.currentTarget.duration) e.currentTarget.currentTime = trigger.progress * e.currentTarget.duration; }} /><div className="building-wash" /><div className="building-caption"><Eyebrow light>Architecture, in harmony</Eyebrow><h2>Presence<br /><i>with purpose.</i></h2><p>A considered silhouette, rising gently<br />from an island of green.</p><div className="sequence-indicator"><span>01</span><i><b /></i><span>360°</span></div></div><div className="building-scroll-label">THE VERONA RESIDENCE&nbsp; · &nbsp;MADH ISLAND</div></div><div className="building-scroll-space" /></section>;
}

function Residence() {
  return <section className="residence section-pad" id="residences"><div className="residence-head"><div><Eyebrow>Step inside</Eyebrow><h2>A residence<br /><i>defined by light.</i></h2></div><p>Generous rooms open to the horizon. Thoughtful details make each day feel considered, and every return feel like an arrival.</p></div><div className="residence-visual"><Image src={photos.interior} alt="Sunlit living room opening to the ocean" /><div className="residence-label"><span>THE VERONA RESIDENCE</span><span>SEA-FACING LIVING</span></div><div className="residence-play"><Play size={14} fill="currentColor" /> <span>Explore the residence</span></div></div><div className="residence-foot"><span>01 — OPENNESS</span><span>Living, with the horizon in view.</span><a href="#rooms">Explore the rooms <ArrowRight size={15} /></a></div></section>;
}

function RoomExplorer() {
  const [active, setActive] = useState(0); const section = useRef(null); const track = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.room-card');
      gsap.to(track.current, { x: () => -(track.current.scrollWidth - window.innerWidth), ease: 'none', scrollTrigger: { trigger: section.current, start: 'top top', end: () => `+=${track.current.scrollWidth - window.innerWidth}`, scrub: 1, pin: true, invalidateOnRefresh: true, onUpdate: self => setActive(Math.min(cards.length - 1, Math.floor(self.progress * cards.length))) } });
    }, section);
    return () => ctx.revert();
  }, []);
  return <section className="rooms-section" id="rooms" ref={section}><div className="rooms-head"><Eyebrow>Space to make your own</Eyebrow><span>02 — The residences</span><div className="rooms-progress">{String(active + 1).padStart(2, '0')} <i /> 05</div></div><div className="rooms-track" ref={track}>{rooms.map((room, i) => <article className={`room-card ${i === active ? 'active' : ''}`} key={room.name}><div className="room-image"><Image src={room.image} alt={room.name} /><span className="room-number">{room.no}</span></div><div className="room-info"><div><h3>{room.name}</h3><p>{room.note}</p></div><ArrowUpRight size={19} /></div></article>)}</div><div className="rooms-footer"><span>SCROLL TO MOVE THROUGH THE RESIDENCE</span><ArrowRight size={17} /></div></section>;
}

function Amenities() {
  const section = useRef(null); const track = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => gsap.to(track.current, { x: () => -(track.current.scrollWidth - window.innerWidth), ease: 'none', scrollTrigger: { trigger: section.current, start: 'top top', end: () => `+=${track.current.scrollWidth - window.innerWidth}`, scrub: 1, pin: true, invalidateOnRefresh: true } }), section);
    return () => ctx.revert();
  }, []);
  return <section className="amenities" id="amenities" ref={section}><div className="amenity-intro"><Eyebrow light>Beyond the expected</Eyebrow><h2>Room for<br /><i>every version</i><br />of you.</h2><p>At Verona, the everyday finds new ways to surprise.</p><span>03 — THE CLUB LIFE</span></div><div className="amenities-track" ref={track}>{amenities.map(([name, src], i) => <article className="amenity-card" key={name}><Image src={src} alt={name} /><div className="amenity-overlay" /><div className="amenity-number">0{i + 1} / 05</div><div className="amenity-title"><span>{name}</span><ArrowUpRight size={17} /></div></article>)}</div><div className="amenity-scroll">SCROLL TO DISCOVER <ArrowRight size={15} /></div></section>;
}

function Location() {
  const [selected, setSelected] = useState('Verona');
  const places = [{ name: 'Verona', x: 52, y: 27, time: 'YOU ARE HERE', kind: 'home' }, { name: 'Versova', x: 24, y: 49, time: 'FERRY · 10 MIN', kind: 'current' }, { name: 'Bandra', x: 77, y: 51, time: 'BY ROAD · 45 MIN', kind: 'current' }, { name: 'BKC', x: 76, y: 27, time: 'BY ROAD · 55 MIN', kind: 'current' }, { name: 'Airport', x: 32, y: 76, time: 'BY ROAD · 50 MIN', kind: 'current' }, { name: 'South Mumbai', x: 87, y: 79, time: 'BY ROAD · 70 MIN', kind: 'current' }];
  return <section className="location section-pad" id="location"><div className="location-copy"><Eyebrow>At the edge of the city</Eyebrow><h2>Close to<br />everything.<br /><i>A world away.</i></h2><p>Rooted on Madh Island, with the city within reach and the sea at your doorstep.</p><div className="location-legend"><span><i className="dot-current" /> Existing connections</span><span><i className="dot-proposed" /> Proposed infrastructure</span></div><small>Travel times are indicative and may vary by route and traffic.</small></div><div className="map-area"><div className="map-texture" /><svg className="map-lines" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M52 27 Q40 36 24 49 M52 27 Q68 34 77 51 M52 27 Q66 18 76 27 M52 27 Q34 53 32 76 M52 27 Q74 49 87 79" /><path className="proposed-route" d="M52 27 Q52 54 68 67" /></svg>{places.map(p => <button key={p.name} onClick={() => setSelected(p.name)} className={`map-point ${p.kind} ${selected === p.name ? 'selected' : ''}`} style={{ left: `${p.x}%`, top: `${p.y}%` }}><span className="point-core" /><span className="point-label">{p.name}<small>{p.time}</small></span></button>)}<div className="map-north">N <ArrowUpRight size={17} /></div><div className="map-scale"><i /> 5 KM</div><div className="map-water-label">ARABIAN SEA</div><div className="map-island-label">MADH ISLAND</div></div><div className="location-foot"><span>19°08' N&nbsp; 72°47' E</span><span>CONNECTIVITY, CONSIDERED.</span></div></section>;
}

function FloorPlan() {
  const [room, setRoom] = useState('Living room'); const roomNames = ['Living room', 'Kitchen', 'Master bedroom', 'Bedroom', 'Bathroom', 'Deck'];
  return <section className="floorplan section-pad"><div className="floor-copy"><Eyebrow>A place for every rhythm</Eyebrow><h2>Considered<br /><i>down to the detail.</i></h2><p>Explore a residence shaped around light, privacy, and the quiet luxury of space.</p><div className="plan-room-list">{roomNames.map((r, i) => <button key={r} onMouseEnter={() => setRoom(r)} onClick={() => setRoom(r)} className={room === r ? 'selected' : ''}><span>0{i + 1}</span>{r}<ArrowUpRight size={15} /></button>)}</div></div><div className="plan-wrap"><div className="plan-tag">VERONA · RESIDENCE STUDY</div><div className={`plan-drawing room-${room.toLowerCase().replace(' ', '-')}`}><div className="plan-room plan-living" onMouseEnter={() => setRoom('Living room')}><span>LIVING</span></div><div className="plan-room plan-kitchen" onMouseEnter={() => setRoom('Kitchen')}><span>KITCHEN</span></div><div className="plan-room plan-master" onMouseEnter={() => setRoom('Master bedroom')}><span>MASTER<br />BEDROOM</span></div><div className="plan-room plan-bedroom" onMouseEnter={() => setRoom('Bedroom')}><span>BEDROOM</span></div><div className="plan-room plan-bath" onMouseEnter={() => setRoom('Bathroom')}><span>BATH</span></div><div className="plan-room plan-deck" onMouseEnter={() => setRoom('Deck')}><span>PRIVATE DECK</span></div><div className="plan-furniture sofa" /><div className="plan-furniture table" /><div className="plan-furniture bed" /><div className="plan-furniture bed-two" /></div><div className="plan-selection"><span>SELECTED SPACE</span><b>{room}</b><span>Illustrative plan · indicative layout</span></div></div></section>;
}

function Gallery() {
  const [active, setActive] = useState(0); const pics = [photos.terrace, photos.interior, photos.pool, photos.bedroom];
  return <section className="gallery" id="gallery"><div className="gallery-heading"><Eyebrow light>A glimpse of the extraordinary</Eyebrow><h2>The Verona<br /><i>state of mind.</i></h2><span>04 — GALLERY</span></div><div className="gallery-frame"><Image src={pics[active]} alt="Verona residence gallery" key={active} /><div className="gallery-frame-shade" /><div className="gallery-counter">0{active + 1} <i /> 0{pics.length}</div><div className="gallery-arrows"><button onClick={() => setActive((active + pics.length - 1) % pics.length)} aria-label="Previous image"><ChevronLeft /></button><button onClick={() => setActive((active + 1) % pics.length)} aria-label="Next image"><ChevronRight /></button></div><div className="gallery-caption"><span>{['THE PRIVATE DECK', 'LIVING, OPEN TO THE SEA', 'A DIFFERENT KIND OF STILLNESS', 'A ROOM WITH A VIEW'][active]}</span><ArrowUpRight size={17} /></div></div><div className="gallery-thumbs">{pics.map((src, i) => <button className={i === active ? 'selected' : ''} onClick={() => setActive(i)} key={src}><Image src={src} alt="" /><span>0{i + 1}</span></button>)}</div></section>;
}

function Enquiry() {
  const [sent, setSent] = useState(false);
  return <section className="enquiry" id="enquire"><div className="enquiry-image"><Image src={photos.night} alt="Verona at twilight" /><div className="enquiry-overlay" /></div><div className="enquiry-content"><Eyebrow light>A world of your own</Eyebrow><h2>Your island<br /><i>home awaits.</i></h2><p>Some addresses are discovered.<br />Others are felt.</p><a className="enquire-main" href="#contact">Begin a conversation <ArrowUpRight size={17} /></a><span className="enquiry-location">RAHEJA EXOTICA · MADH ISLAND · MUMBAI</span></div><form id="contact" className="enquiry-form" onSubmit={e => { e.preventDefault(); setSent(true); }}><Eyebrow light>Request a private viewing</Eyebrow><h3>{sent ? 'Thank you.' : 'Let us introduce you.'}</h3>{sent ? <p className="form-success">Our Verona concierge will be in touch shortly.</p> : <><label>Your name<input required placeholder="Full name" /></label><div className="form-row"><label>Mobile number<input type="tel" required placeholder="+91" /></label><label>Email address<input type="email" placeholder="you@email.com" /></label></div><label>I'm interested in<select defaultValue=""><option value="" disabled>Select a residence</option><option>2 bedroom residence</option><option>3 bedroom residence</option><option>4 bedroom residence</option><option>Private viewing</option></select></label><button className="form-submit" type="submit">Request a callback <ArrowUpRight size={16} /></button><small>By submitting, you consent to be contacted by our team.</small></>}</form></section>;
}

function Footer() { return <footer className="footer"><a href="#top" className="footer-brand"><span className="brand-mark">V</span><span><b>VERONA</b><small>RAHEJA EXOTICA · MUMBAI</small></span></a><div className="footer-mid"><span>A LIFE APART, YET CLOSE TO IT ALL.</span><span>MADE FOR THE MOMENTS THAT MATTER.</span></div><div className="footer-right"><a href="#top">Back to top ↑</a><span>© RAHEJA UNIVERSAL</span></div></footer>; }

export default function App() {
  const [scrollPct, setScrollPct] = useState(0);
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: .85 });
    lenis.on('scroll', ScrollTrigger.update);
    const tick = t => lenis.raf(t * 1000); gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0);
    const onScroll = () => setScrollPct(Math.min(100, Math.round(window.scrollY / (document.documentElement.scrollHeight - innerHeight) * 100)));
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); gsap.ticker.remove(tick); lenis.destroy(); };
  }, []);
  const scrollEnquiry = () => document.querySelector('#enquire')?.scrollIntoView({ behavior: 'smooth' });
  return <><div className="scroll-progress" style={{ transform: `scaleX(${scrollPct / 100})` }} /><Navigation onEnquire={scrollEnquiry} /><main><Hero /><Manifesto /><BuildingSequence /><Residence /><RoomExplorer /><Amenities /><Location /><FloorPlan /><Gallery /><Enquiry /></main><Footer /><div className="mobile-bar"><a href="tel:+912240000000"><Phone size={15} />Call</a><a href="#enquire">Enquire <ArrowUpRight size={15} /></a></div></>;
}
