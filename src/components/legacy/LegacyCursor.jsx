import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function LegacyCursor({ containerRef }) {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [cursorText, setCursorText] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      gsap.to(dot, {
        x: mouseX,
        y: mouseY,
        duration: 0.1,
        ease: 'power2.out',
      });
    };

    const tickerFunc = () => {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      gsap.set(ring, { x: ringX, y: ringY });
    };

    gsap.ticker.add(tickerFunc);
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // Handle interactive targets inside legacy experience
    const sectionEl = containerRef?.current;
    const handleMouseOver = (e) => {
      const target = e.target.closest('[data-cursor]');
      if (target) {
        const text = target.getAttribute('data-cursor') || 'VIEW';
        setCursorText(text);
        setIsHovered(true);
      } else {
        setIsHovered(false);
        setCursorText('');
      }
    };

    if (sectionEl) {
      sectionEl.addEventListener('mouseover', handleMouseOver);
    }

    return () => {
      gsap.ticker.remove(tickerFunc);
      window.removeEventListener('mousemove', onMouseMove);
      if (sectionEl) sectionEl.removeEventListener('mouseover', handleMouseOver);
    };
  }, [containerRef]);

  return (
    <div className="legacy-custom-cursor-layer" pointer-events="none">
      <div ref={dotRef} className="legacy-cursor-dot" />
      <div
        ref={ringRef}
        className={`legacy-cursor-ring ${isHovered ? 'is-active' : ''}`}
      >
        {cursorText && <span className="legacy-cursor-text">{cursorText}</span>}
      </div>
    </div>
  );
}
