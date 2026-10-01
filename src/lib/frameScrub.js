/**
 * frameScrub — scroll-driven image-sequence renderer.
 *
 * Why this instead of `video.currentTime = x`:
 *  - Seeking a long-GOP H.264 file forces the decoder to re-decode from the last
 *    keyframe on every scroll tick. Mobile decoders can't keep up → stutter.
 *  - Here every frame is a tiny standalone WebP, decoded OFF the main thread via
 *    createImageBitmap, and painted with a single canvas drawImage().
 *
 * Memory is bounded: compressed blobs for all frames are kept (≈1–4 MB total),
 * but only a small sliding window of frames around the playhead is decoded.
 */

const AHEAD = 8; // frames decoded in the scroll direction
const BEHIND = 3; // frames decoded against the scroll direction
const KEEP = 12; // frames kept decoded around the playhead before eviction
const POOL = 4; // parallel network requests
const SMOOTH = 0.085; // seconds — time-constant for scroll smoothing

const decodeBlob = blob =>
  typeof createImageBitmap === 'function'
    ? createImageBitmap(blob)
    : new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(blob);
        img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
        img.onerror = reject;
        img.src = url;
      });

export function createFrameScrubber(canvas, { dir, count, srcW, srcH, ext = 'webp', focusY = 0.48, limit = count }) {
  const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  const total = Math.min(count, limit);
  const blobs = new Array(total).fill(null);
  const bitmaps = new Array(total).fill(null);
  const pending = new Set();
  const abort = new AbortController();

  let cw = 0, ch = 0;
  let target = 0, current = 0;
  let raf = 0, lastTs = 0, lastKey = '', lastDir = 1, destroyed = false;

  const urlOf = i => `${dir}/${String(i + 1).padStart(4, '0')}.${ext}`;
  const posOf = p => p * (total - 1);

  /* ---------- network: coarse → fine so any scroll position has *something* ---------- */
  const order = [];
  const seen = new Set();
  const push = i => { if (i < total && !seen.has(i)) { seen.add(i); order.push(i); } };
  push(0);
  for (const step of [8, 4, 2, 1]) for (let i = 0; i < total; i += step) push(i);
  let cursor = 0;

  async function worker() {
    while (!destroyed && cursor < order.length) {
      const i = order[cursor++];
      try {
        const res = await fetch(urlOf(i), { signal: abort.signal });
        if (!res.ok) continue;
        blobs[i] = await res.blob();
        const c = Math.floor(posOf(current));
        if (i >= c - BEHIND && i <= c + AHEAD + 1) { ensure(i); }
        if (i === 0) schedule();
      } catch (_) { if (destroyed) return; }
    }
  }

  /* ---------- decode window ---------- */
  function ensure(i) {
    if (i < 0 || i >= total || bitmaps[i] || pending.has(i) || !blobs[i]) return;
    pending.add(i);
    decodeBlob(blobs[i]).then(bmp => {
      pending.delete(i);
      const c = Math.floor(posOf(current));
      if (destroyed || Math.abs(i - c) > KEEP) { bmp.close?.(); return; }
      bitmaps[i] = bmp;
      lastKey = ''; // new pixels available → allow a repaint
      schedule();
    }).catch(() => pending.delete(i));
  }

  function manageWindow() {
    const c = Math.floor(posOf(Math.min(Math.max(current, 0), 1)));
    const from = lastDir >= 0 ? c - BEHIND : c - AHEAD;
    const to = lastDir >= 0 ? c + AHEAD : c + BEHIND;
    for (let i = Math.max(0, from); i <= Math.min(total - 1, to); i++) ensure(i);
    for (let i = 0; i < total; i++) {
      if (bitmaps[i] && Math.abs(i - c) > KEEP) { bitmaps[i].close?.(); bitmaps[i] = null; }
    }
  }

  const nearest = i => {
    for (let d = 0; d <= KEEP; d++) {
      if (i - d >= 0 && bitmaps[i - d]) return bitmaps[i - d];
      if (i + d < total && bitmaps[i + d]) return bitmaps[i + d];
    }
    return null;
  };

  /* ---------- painting ---------- */
  function paint(img) {
    const iw = img.width, ih = img.height;
    const s = Math.max(cw / iw, ch / ih);
    const w = iw * s, h = ih * s;
    ctx.drawImage(img, (cw - w) / 2, (ch - h) * focusY, w, h); // == object-fit: cover
  }

  let lastC = -1;
  function render() {
    if (!cw || !ch) return;
    const pos = posOf(current);
    const lo = Math.min(total - 1, Math.round(pos));
    if (lo !== lastC) { lastC = lo; manageWindow(); }
    const key = lo + ':' + cw + 'x' + ch;
    if (key === lastKey) return;
    const a = nearest(lo);
    if (!a) return; // nothing decoded yet; will repaint when first bitmap lands
    ctx.globalAlpha = 1;
    paint(a);
    lastKey = key;
  }

  function tick(ts) {
    raf = 0;
    const dt = Math.min(0.05, (ts - (lastTs || ts)) / 1000);
    lastTs = ts;
    const diff = target - current;
    if (Math.abs(diff) < 0.0003) current = target;
    else current += diff * (1 - Math.exp(-dt / SMOOTH));
    render();
    if (current !== target) schedule(); else lastTs = 0;
  }

  function schedule() { if (!raf && !destroyed) raf = requestAnimationFrame(tick); }

  /* ---------- public API ---------- */
  for (let k = 0; k < POOL; k++) worker();

  return {
    /** progress: 0..1 */
    setProgress(p) {
      const next = Math.min(1, Math.max(0, p));
      if (next === target) return;
      lastDir = next >= target ? 1 : -1;
      target = next;
      manageWindow();
      schedule();
    },
    /** css-pixel size of the canvas box */
    resize(w, h, dpr = 1) {
      const scale = Math.min(dpr || 1, 2);
      const nw = Math.max(1, Math.round(w * scale));
      const nh = Math.max(1, Math.round(h * scale));
      if (nw === cw && nh === ch) return;
      cw = canvas.width = nw;
      ch = canvas.height = nh;
      lastKey = '';
      render(); // paint synchronously so a resize never flashes blank
    },
    destroy() {
      destroyed = true;
      abort.abort();
      cancelAnimationFrame(raf);
      bitmaps.forEach(b => b?.close?.());
      bitmaps.fill(null);
      blobs.fill(null);
    },
  };
}
