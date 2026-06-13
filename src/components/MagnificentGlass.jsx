import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLanguage } from '../utils/LanguageContext';

export default function MagicLens() {
  const { language: appLanguage, getLanguageName, translations } = useLanguage();
  const [isActive, setIsActive] = useState(false);
  
  // Independent lens language
  const [lensLanguage, setLensLanguage] = useState(appLanguage === 'en' ? 'te' : 'en');
  const [showLangMenu, setShowLangMenu] = useState(false);
  
  const [mousePos, setMousePos] = useState({ x: -999, y: -999 });
  const [targetPos, setTargetPos] = useState({ x: -999, y: -999 });
  const animFrameRef = useRef(null);
  
  // Store exact styling and bounds of hovered element
  const [hoverData, setHoverData] = useState(null);
  const [dynamicLensText, setDynamicLensText] = useState(null);
  const dynamicTranslationsCache = useRef(new Map());
  
  const [ripple, setRipple] = useState(false);
  const LENS_RADIUS = 120; // Slightly larger for better reading

  // Trigger ripple when lens language changes or activates
  useEffect(() => {
    if (isActive) {
      setRipple(true);
      const id = setTimeout(() => setRipple(false), 700);
      return () => clearTimeout(id);
    }
  }, [lensLanguage, isActive]);

  // Sync default lens language if app language changes
  useEffect(() => {
    if (appLanguage === lensLanguage) {
      setLensLanguage(appLanguage === 'en' ? 'te' : 'en');
    }
  }, [appLanguage, lensLanguage]);

  // rAF loop
  const animate = useCallback(() => {
    setMousePos(prev => {
      const dx = targetPos.x - prev.x;
      const dy = targetPos.y - prev.y;
      if (Math.abs(dx) < 0.3 && Math.abs(dy) < 0.3) return prev;
      return { x: prev.x + dx * 0.18, y: prev.y + dy * 0.18 };
    });
    animFrameRef.current = requestAnimationFrame(animate);
  }, [targetPos]);

  useEffect(() => {
    if (!isActive) return;
    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isActive, animate]);

  // Track mouse and hovered elements
  useEffect(() => {
    if (!isActive) return;
    
    let currentTagged = null;
    
    const updateHoverData = (el) => {
      const tagged = el?.closest('[data-translate]');
      if (tagged) {
        currentTagged = tagged;
        const rect = tagged.getBoundingClientRect();
        const style = window.getComputedStyle(tagged);
        setHoverData({
          isDynamic: false,
          key: tagged.getAttribute('data-translate'),
          rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
          style: {
            fontSize: style.fontSize, fontFamily: style.fontFamily, fontWeight: style.fontWeight,
            color: '#f2e8d0', lineHeight: style.lineHeight, textAlign: style.textAlign,
            letterSpacing: style.letterSpacing, textTransform: style.textTransform,
            display: style.display, alignItems: style.alignItems, justifyContent: style.justifyContent
          }
        });
      } else {
        const textEl = el?.closest('p, span, h1, h2, h3, h4, h5, h6, li, button, a');
        if (textEl && textEl.innerText && textEl.innerText.trim().length > 0 && textEl.innerText.trim().length < 800) {
          // Exclude the lens's own watermark or overlay text to prevent infinite loops
          if (textEl.closest('div[aria-hidden="true"]')) return;
          
          currentTagged = textEl;
          const rect = textEl.getBoundingClientRect();
          const style = window.getComputedStyle(textEl);
          setHoverData({
            isDynamic: true,
            originalText: textEl.innerText.trim(),
            rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
            style: {
              fontSize: style.fontSize, fontFamily: style.fontFamily, fontWeight: style.fontWeight,
              color: '#f2e8d0', lineHeight: style.lineHeight, textAlign: style.textAlign,
              letterSpacing: style.letterSpacing, textTransform: style.textTransform,
              display: style.display, alignItems: style.alignItems, justifyContent: style.justifyContent
            }
          });
        } else {
          setHoverData(null);
        }
      }
    };

    const onMove = (e) => {
      setTargetPos({ x: e.clientX, y: e.clientY });
      
      // We don't want the overlay's own elements blocking the hit test
      // So we hide the overlay via CSS pointerEvents: none
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (el !== currentTagged) {
        updateHoverData(el);
      }
    };
    
    const onScroll = () => {
      if (currentTagged) {
         updateHoverData(currentTagged);
      }
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll', onScroll, { capture: true });
    };
  }, [isActive]);

  const langColors = { en: '#4a9eff', hi: '#ff8c42', te: '#22d3ee', ta: '#a78bfa' };
  const langChar  = { en: 'A', hi: 'अ', te: 'అ', ta: 'அ' };
  const availableLangs = ['en', 'hi', 'te', 'ta'];
  const glow = langColors[lensLanguage] || '#c9a84c';

  const translateDynamicText = async (text, targetLang) => {
    if (!text || !text.trim() || targetLang === 'en') return text;
    const cacheKey = `${targetLang}:${text}`;
    if (dynamicTranslationsCache.current.has(cacheKey)) {
      return dynamicTranslationsCache.current.get(cacheKey);
    }
    try {
      const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`);
      const data = await res.json();
      const translated = data[0].map(x => x[0]).join('');
      dynamicTranslationsCache.current.set(cacheKey, translated);
      return translated;
    } catch (e) {
      console.warn('Dynamic translation failed', e);
      return text;
    }
  };

  useEffect(() => {
    if (hoverData && hoverData.isDynamic) {
      setDynamicLensText('...'); // loading state
      const targetLang = lensLanguage;
      translateDynamicText(hoverData.originalText, targetLang).then(res => {
         setDynamicLensText(res);
      });
    }
  }, [hoverData, hoverData?.originalText, lensLanguage]);

  const clipPath = `circle(${LENS_RADIUS}px at ${mousePos.x}px ${mousePos.y}px)`;

  const lensText = hoverData 
    ? (hoverData.isDynamic 
        ? dynamicLensText 
        : (translations[lensLanguage]?.[hoverData.key] || translations['en']?.[hoverData.key])) 
    : null;

  return (
    <>
      {/* ── True Transparent Glass Overlay ─────────────────────────────── */}
      {isActive && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9990,
            pointerEvents: 'none',
            willChange: 'clip-path',
            clipPath,
            transition: 'clip-path 0ms linear',
          }}
        >
          {/* Frosted glass base */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(8, 5, 2, 0.65)',
              backdropFilter: 'blur(12px) saturate(140%) brightness(1.2)',
              WebkitBackdropFilter: 'blur(12px) saturate(140%) brightness(1.2)',
            }}
          />

          {/* Render the translated text EXACTLY over the original text */}
          {hoverData && lensText && (
            <div
              style={{
                position: 'absolute',
                top: hoverData.rect.top,
                left: hoverData.rect.left,
                width: hoverData.rect.width,
                height: hoverData.rect.height,
                ...hoverData.style,
                zIndex: 9991,
                textShadow: `0 0 10px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.9)`,
              }}
            >
              {lensText}
            </div>
          )}

          {/* Lens edge ring */}
          <div
            style={{
              position: 'fixed',
              left: mousePos.x - LENS_RADIUS,
              top: mousePos.y - LENS_RADIUS,
              width: LENS_RADIUS * 2,
              height: LENS_RADIUS * 2,
              borderRadius: '50%',
              border: `1px solid rgba(255,255,255,0.25)`,
              boxShadow: `
                inset 0 4px 12px rgba(255,255,255,0.15),
                inset 0 -2px 10px rgba(0,0,0,0.5),
                0 0 0 1.5px ${glow}60,
                0 0 40px ${glow}40,
                0 12px 40px rgba(0,0,0,0.8)
              `,
              zIndex: 9992,
            }}
          >
            {/* Interior light refraction shimmer */}
            <div style={{
              position: 'absolute',
              top: '8%',
              left: '15%',
              width: '40%',
              height: '20%',
              borderRadius: '50%',
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.15), transparent)',
              transform: 'rotate(-25deg)',
              filter: 'blur(5px)',
            }} />
          </div>

          {/* Subtle Watermark inside lens */}
          <div style={{
            position: 'fixed',
            left: mousePos.x,
            top: mousePos.y,
            transform: 'translate(-50%, -50%)',
            fontSize: '64px',
            fontWeight: 900,
            color: `${glow}10`,
            fontFamily: 'serif',
            userSelect: 'none',
            letterSpacing: '-2px',
            zIndex: 9991,
          }}>
            {langChar[lensLanguage]}
          </div>
        </div>
      )}

      {/* ── Lens Controls (bottom-right) ───────────────────────── */}
      <div
        style={{
          position: 'fixed',
          bottom: '28px',
          right: '28px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '12px',
        }}
        onMouseLeave={() => setShowLangMenu(false)}
      >
        {/* Language Selector Menu */}
        {isActive && showLangMenu && (
          <div style={{
            background: 'rgba(8,5,2,0.92)',
            backdropFilter: 'blur(16px)',
            border: `1px solid ${glow}40`,
            borderRadius: '12px',
            padding: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            boxShadow: `0 8px 32px rgba(0,0,0,0.8), 0 0 16px ${glow}20`,
            animation: 'menu-slide 0.2s ease-out forwards',
            transformOrigin: 'bottom right',
          }}>
            <div style={{ fontSize: '9px', color: '#8a7355', textAlign: 'center', fontWeight: 'bold', padding: '4px 0', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Lens Language
            </div>
            {availableLangs.map(l => (
              <button
                key={l}
                onClick={() => {
                  setLensLanguage(l);
                  setShowLangMenu(false);
                }}
                style={{
                  background: lensLanguage === l ? `${glow}20` : 'transparent',
                  border: 'none',
                  color: lensLanguage === l ? glow : '#d4c49a',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: lensLanguage === l ? 700 : 500,
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = `${glow}15`}
                onMouseOut={(e) => e.currentTarget.style.background = lensLanguage === l ? `${glow}20` : 'transparent'}
              >
                <span style={{ fontSize: '14px', fontFamily: 'serif' }}>{langChar[l]}</span>
                {getLanguageName(l)}
              </button>
            ))}
          </div>
        )}

        <div style={{ position: 'relative' }}>
          {/* Ripple on language change */}
          {ripple && (
            <div style={{
              position: 'absolute',
              inset: '-4px',
              borderRadius: '50%',
              border: `2px solid ${glow}`,
              animation: 'magic-ripple 0.7s ease-out forwards',
              pointerEvents: 'none',
            }} />
          )}

          {/* Pulse glow when active */}
          {isActive && (
            <div style={{
              position: 'absolute',
              inset: '-8px',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${glow}20, transparent 70%)`,
              animation: 'magic-pulse 2s ease-in-out infinite',
              pointerEvents: 'none',
            }} />
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Lang toggle indicator (only when active) */}
            {isActive && !showLangMenu && (
              <div 
                style={{
                  background: 'rgba(8,5,2,0.85)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${glow}40`,
                  borderRadius: '20px',
                  padding: '6px 12px',
                  color: glow,
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: `0 4px 12px rgba(0,0,0,0.5)`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseEnter={() => setShowLangMenu(true)}
              >
                <span style={{ fontFamily: 'serif' }}>{langChar[lensLanguage]}</span>
                {getLanguageName(lensLanguage)}
                <span style={{ fontSize: '8px', opacity: 0.7 }}>▼</span>
              </div>
            )}

            <button
              onClick={() => setIsActive(a => !a)}
              onMouseEnter={() => isActive && setShowLangMenu(true)}
              title={isActive ? 'Deactivate Magic Lens' : 'Activate Magic Lens — hover over text to translate'}
              style={{
                width: '62px',
                height: '62px',
                borderRadius: '50%',
                border: `1.5px solid ${isActive ? glow : 'rgba(200,168,76,0.45)'}`,
                background: isActive
                  ? `radial-gradient(circle at 35% 35%, ${glow}40, rgba(8,5,2,0.92))`
                  : 'radial-gradient(circle at 35% 35%, rgba(200,168,76,0.22), rgba(8,5,2,0.88))',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: isActive
                  ? `0 0 0 2px ${glow}40, 0 0 32px ${glow}50, 0 8px 32px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.12)`
                  : '0 0 0 1px rgba(200,168,76,0.2), 0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                transform: isActive ? 'scale(1.12)' : 'scale(1)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Glass shine */}
              <div style={{
                position: 'absolute',
                top: '9px', left: '11px',
                width: '18px', height: '9px',
                background: 'rgba(255,255,255,0.14)',
                borderRadius: '50%',
                transform: 'rotate(-28deg)',
                pointerEvents: 'none',
              }} />

              {/* Magnifying glass SVG */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                style={{ filter: `drop-shadow(0 0 ${isActive ? 6 : 2}px ${glow})`, transition: 'filter 0.3s' }}>
                <circle cx="11" cy="11" r="7"
                  stroke={isActive ? glow : '#c9a84c'} strokeWidth="1.8"
                  fill={isActive ? `${glow}18` : 'transparent'} />
                <line x1="16.5" y1="16.5" x2="20" y2="20"
                  stroke={isActive ? glow : '#c9a84c'} strokeWidth="2" strokeLinecap="round" />
                <text x="7.5" y="14.5" fontSize="7.5" fill={isActive ? glow : '#c9a84c'}
                  fontWeight="bold" fontFamily="serif">
                  {langChar[lensLanguage]}
                </text>
              </svg>

              <div style={{
                width: 5, height: 5, borderRadius: '50%',
                background: isActive ? glow : 'rgba(200,168,76,0.4)',
                boxShadow: isActive ? `0 0 5px ${glow}` : 'none',
                transition: 'all 0.3s ease',
              }} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes magic-ripple {
          0%   { transform: scale(1);   opacity: 0.9; }
          100% { transform: scale(2.8); opacity: 0; }
        }
        @keyframes magic-pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 0.8; transform: scale(1.15); }
        }
        @keyframes menu-slide {
          from { opacity: 0; transform: scale(0.9) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>
  );
}
