import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../utils/LanguageContext';
import { Globe } from 'lucide-react';

/* ── Inline SVG Icons ──────────────────────────────── */
const GearSVG = ({ size = 24, className = '', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
    <path d="M12 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm7.8-3c0-.3 0-.6-.05-.9l1.9-1.5c.2-.15.25-.4.1-.6l-1.8-3.1c-.15-.2-.4-.27-.6-.2l-2.25.9c-.45-.35-.95-.65-1.5-.87L15.25 4c-.05-.25-.25-.45-.5-.45h-3.5c-.25 0-.45.2-.5.45l-.35 2.43c-.55.22-1.05.52-1.5.87l-2.25-.9c-.22-.08-.48 0-.6-.2L4.25 9.9c-.14.2-.1.46.1.6l1.9 1.5c-.04.3-.05.6-.05.9s0 .6.05.9l-1.9 1.5c-.2.15-.25.4-.1.6l1.8 3.1c.15.2.4.27.6.2l2.25-.9c.45.35.95.65 1.5.87l.35 2.43c.05.25.25.45.5.45h3.5c.25 0 .45-.2.5-.45l.35-2.43c.55-.22 1.05-.52 1.5-.87l2.25.9c.22.08.48 0 .6-.2l1.8-3.1c.14-.2.1-.46-.1-.6l-1.9-1.5c.04-.3.05-.6.05-.9z" />
  </svg>
);

const OrnamentDivider = ({ label = '' }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '14px',
    color: '#a88d4c', fontFamily: 'Cinzel, serif',
    fontSize: '0.6rem', letterSpacing: '0.25em', textTransform: 'uppercase',
    margin: '0 auto',
  }}>
    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, #8b6914)' }} />
    <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={{ color: '#c9a84c' }}>✦</span>
      {label}
      <span style={{ color: '#c9a84c' }}>✦</span>
    </span>
    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, #8b6914, transparent)' }} />
  </div>
);

/* ── Feature Icons as SVG paths ─────────────────── */
const FeatureIcons = {
  ai: (
    <svg viewBox="0 0 40 40" fill="none" width="38" height="38">
      <circle cx="20" cy="14" r="8" stroke="#c9a84c" strokeWidth="1.5" />
      <path d="M12 14c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="#a88d4c" strokeWidth="1" strokeDasharray="2 2" />
      <circle cx="17" cy="13" r="1.5" fill="#c9a84c" />
      <circle cx="23" cy="13" r="1.5" fill="#c9a84c" />
      <path d="M16 18c1.1 1.3 2.9 1.3 4 0" stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M20 22v6M14 34h12" stroke="#a88d4c" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="20" cy="22" r="1" fill="#8b6914" />
    </svg>
  ),
  endless: (
    <svg viewBox="0 0 40 40" fill="none" width="38" height="38">
      <circle cx="20" cy="20" r="12" stroke="#c9a84c" strokeWidth="1.5" />
      <path d="M20 8v3M20 29v3M8 20h3M29 20h3" stroke="#a88d4c" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="20" cy="20" r="4" fill="none" stroke="#c9a84c" strokeWidth="1.5" />
      <path d="M14 14l4 4M26 14l-4 4M14 26l4-4M26 26l-4-4" stroke="#8b6914" strokeWidth="1" strokeLinecap="round" />
    </svg>
  ),
  save: (
    <svg viewBox="0 0 40 40" fill="none" width="38" height="38">
      <rect x="8" y="8" width="24" height="28" rx="1" stroke="#c9a84c" strokeWidth="1.5" />
      <path d="M14 8v10h12V8" stroke="#a88d4c" strokeWidth="1.2" />
      <path d="M17 8v8" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M13 22h14M13 27h10" stroke="#8b6914" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  ),
  share: (
    <svg viewBox="0 0 40 40" fill="none" width="38" height="38">
      <circle cx="10" cy="20" r="4" stroke="#c9a84c" strokeWidth="1.5" />
      <circle cx="30" cy="10" r="4" stroke="#c9a84c" strokeWidth="1.5" />
      <circle cx="30" cy="30" r="4" stroke="#c9a84c" strokeWidth="1.5" />
      <path d="M14 18l12-6M14 22l12 6" stroke="#a88d4c" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  ),
};

export default function HeroPage() {
  const { language, setLanguage, t, getLanguageName } = useLanguage();
  const navigate = useNavigate();
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const enterAsGuest = (path = '/thing-maker') => {
    const targetPath = path?.startsWith('/') ? path : '/thing-maker';
    navigate(targetPath);
  };


  const S = styles;

  return (
    <div style={S.pageWrap}>
      {/* ── Ambient background layer ── */}
      <div style={S.ambientLayer} />

      {/* ── TOP NAVBAR ──────────────────────────────── */}
      <header style={{ ...S.navbar, ...(scrolled ? S.navbarScrolled : {}) }}>
        <div style={S.navInner}>
          {/* Brand */}
          <div style={S.brand}>
            <div style={S.brandLogo}>
              <div style={S.brandName}>CREAFORGE</div>
              <div style={S.brandSub}>CREATE. COOK. INNOVATE.</div>
            </div>
          </div>

          {/* Nav links */}
          <nav style={S.navLinks}>
            {[
              { key: 'navHome', path: '/' },
              { key: 'navThingMaker', path: '/thing-maker' },
              { key: 'navRecipeMaker', path: '/recipe-maker' },
              { key: 'navAiAssistant', path: '/ai-assistant' },
              { key: 'navCollections', path: '/collections' },
              { key: 'navAbout', path: '/about' }
            ].map(item => (
              <NavLink key={item.key} label={t(item.key)} onClick={() => enterAsGuest(item.path)} />
            ))}
          </nav>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {/* Language Selector */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                style={{ ...S.btnDark, padding: '6px 12px', background: 'rgba(0,0,0,0.5)' }}
              >
                <Globe size={14} style={{ marginRight: '6px' }} />
                {getLanguageName(language)}
              </button>
              {isLangMenuOpen && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: 'var(--panel)', border: '1px solid var(--brass)', borderRadius: '8px', zIndex: 1000, minWidth: '120px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
                  {['en', 'hi', 'te', 'ta'].map(lang => (
                    <button 
                      key={lang} 
                      onClick={() => { setLanguage(lang); setIsLangMenuOpen(false); }}
                      style={{ display: 'block', width: '100%', padding: '10px 16px', textAlign: 'left', background: language === lang ? 'rgba(200,168,76,0.2)' : 'transparent', color: language === lang ? 'var(--brass-light)' : 'var(--parch)', border: 'none', cursor: 'pointer', fontFamily: 'Lato, sans-serif', fontSize: '14px', transition: 'all 0.2s' }}
                      onMouseEnter={(e) => { if(language !== lang) e.target.style.background = 'rgba(255,255,255,0.05)' }}
                      onMouseLeave={(e) => { if(language !== lang) e.target.style.background = 'transparent' }}
                    >
                      {getLanguageName(lang)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button style={S.btnBrass} onClick={() => enterAsGuest()} id="nav-my-studio-btn">
              {t('myStudio')}
            </button>
            <div style={S.avatarCircle} onClick={() => enterAsGuest()}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style={{ color: '#c9a84c' }}>
                <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-5.33 0-8 2.67-8 4v1h16v-1c0-1.33-2.67-4-8-4z" />
              </svg>
            </div>
          </div>
        </div>
      </header>

      {/* ── HERO SECTION ──────────────────────────────── */}
      <section style={S.heroSection}>
        {/* Blurred background image */}
        <div style={S.heroBgWrap}>
          <img src="/hero-bg.png" alt="" style={S.heroBgImg} />
          <div style={S.heroBgOverlay} />
        </div>

        {/* Hero Content */}
        <div style={S.heroContent}>
          <div style={S.heroCenter} className="animate-fade-up">
            <div style={{ margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <span style={{ color: '#c9a84c', fontSize: '1rem' }}>◈</span>
              <div style={{ width: 40, height: 1, background: '#c9a84c' }} />
              <span style={{ color: '#c9a84c', fontSize: '1rem' }}>◈</span>
            </div>

            <h1 className="text-gradient-brass" style={S.headline}>
              {t('heroHeadline1')}<br />
              {t('heroHeadline2')}
            </h1>

            <p style={S.heroDesc}>
              {t('heroDesc')}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 40 }}>
              <button
                style={{ ...S.btnDark, display: 'inline-flex', justifyContent: 'center', width: 'auto', padding: '12px 32px', fontSize: '0.85rem', borderRadius: 24, background: 'linear-gradient(180deg, #1c2635 0%, #0a1018 100%)', borderColor: '#4a5b70', boxShadow: '0 0 20px rgba(139,105,20,0.3)' }}
                onClick={() => enterAsGuest('/ai-assistant')}
                id="hero-start-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <><GearSVG size={14} className="animate-gear" /> {t('authenticating')}</>
                ) : (
                  <>{t('startCreating')} <span style={{ fontSize: '1.15em', marginLeft: 8 }}>→</span></>
                )}
              </button>

            </div>

            <div style={S.makerCardsGrid} className="hero-maker-cards">
              <MakerCard
                id="thing-maker-card"
                title={t('thingMakerTitle')}
                desc={t('thingMakerDesc')}
                accentColor="#e0d4c0"
                borderColor="#3a4b60"
                glowColor="rgba(80,130,200,0.1)"
                btnLabel={t('enterWorkshop')}
                btnStyle="dark"
                isHovered={hoveredCard === 'thing'}
                onHover={() => setHoveredCard('thing')}
                onLeave={() => setHoveredCard(null)}
                onClick={() => enterAsGuest('/thing-maker')}
                icon={
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 10 }}>
                    <GearSVG size={22} className="animate-gear-slow" style={{ color: '#7090b0' }} />
                    <GearSVG size={30} className="animate-gear-rev" style={{ color: '#90b0d0' }} />
                    <GearSVG size={22} className="animate-gear" style={{ color: '#7090b0' }} />
                  </div>
                }
                panelStyle="thing"
              />

              <div style={S.andConnector}>
                <div style={S.andConnectorInner}>&amp;</div>
              </div>

              <MakerCard
                id="recipe-maker-card"
                title={t('recipeMakerTitle')}
                desc={t('recipeMakerDesc')}
                accentColor="#e0d4c0"
                borderColor="#8b5e14"
                glowColor="rgba(196,122,30,0.1)"
                btnLabel={t('enterKitchen')}
                btnStyle="rust"
                isHovered={hoveredCard === 'recipe'}
                onHover={() => setHoveredCard('recipe')}
                onLeave={() => setHoveredCard(null)}
                onClick={() => enterAsGuest('/recipe-maker')}
                icon={
                  <div style={{ fontSize: '2rem', textAlign: 'center', marginBottom: 8 }}>
                    🍲
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 4 }}>
                      <span style={{ fontSize: '1rem', opacity: 0.6 }}>⚗️</span>
                      <span style={{ fontSize: '1.1rem' }}>🥄</span>
                      <span style={{ fontSize: '1rem', opacity: 0.6 }}>🍴</span>
                    </div>
                  </div>
                }
                panelStyle="recipe"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES STRIP ──────────────────────────── */}
      <section style={S.featuresSection}>
        <div style={S.featuresInner}>
          <OrnamentDivider label="Every Creation Starts With Inspiration" />

          <div style={S.featuresGrid} className="hero-features-grid">
            {[
              { key: 'ai', title: t('aiPowered'), desc: t('aiPoweredDesc') },
              { key: 'endless', title: t('endlessPoss'), desc: t('endlessPossDesc') },
              { key: 'save', title: t('saveOrg'), desc: t('saveOrgDesc') },
              { key: 'share', title: t('shareInspire'), desc: t('shareInspireDesc') },
            ].map((f, i) => (
              <div key={i} style={S.featureCard} className="animate-fade-up hover-lift">
                <div style={{ marginBottom: 12 }}>{FeatureIcons[f.key]}</div>
                <h4 style={S.featureTitle}>{f.title}</h4>
                <p style={S.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI ASSISTANT SECTION ──────────────────── */}
      <section style={S.assistantSection}>
        <div style={S.assistantInner} className="hero-assistant-grid">

          {/* Left big panel: Robot + Chat */}
          <div style={S.assistantPanel} className="animate-fade-up glass-glow">
            <OrnamentDivider label={t('meetAi')} />
            <div style={S.assistantContent}>
              {/* Robot image */}
              <div style={S.robotImgWrap}>
                <img src="/steampunk-robot.png" alt="AI Assistant Robot" style={S.robotImg} />
                {/* Ambient glow behind robot */}
                <div style={S.robotGlow} />
              </div>
              {/* Chat area */}
              <div style={S.chatArea}>
                <div style={S.chatBubble}>
                  <p style={{ fontFamily: 'IM Fell English, serif', fontStyle: 'italic', color: '#d8c4a0', fontSize: '0.95rem', lineHeight: 1.5 }}>
                    Hello, creator!<br />How can I help you today?
                  </p>
                </div>
                {['Suggest a unique invention', 'Create a delicious recipe', 'Improve my idea', 'Surprise me!'].map((s, i) => (
                  <button key={i} style={S.chatOption} onClick={() => enterAsGuest(`/ai-assistant?prompt=${encodeURIComponent(s)}`)} id={`chat-option-${i}`}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#c9a84c';
                      e.currentTarget.style.background = 'rgba(139,105,20,0.2)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(139,105,20,0.3)';
                      e.currentTarget.style.background = 'rgba(0,0,0,0.3)';
                    }}>
                    <span style={{ color: '#c4a882', fontFamily: 'Lato, sans-serif', fontSize: '0.8rem' }}>{s}</span>
                    <span style={{ color: '#8b6914' }}>→</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Recent Creations */}
          <div style={S.recentPanel} className="animate-fade-up glass-glow">
            <OrnamentDivider label={t('recentCreations')} />
            <div style={{ marginTop: 16 }}>
              {[
                { img: '/thing-maker-lamp.png', title: 'Steam-Powered Lamp', type: 'Thing' },
                { emoji: '🍞', title: 'Herb & Garlic Bread', type: 'Recipe' },
                { emoji: '🗄️', title: 'Vintage Desk Organizer', type: 'Thing' },
                { emoji: '🫖', title: 'Spiced Orange Tea', type: 'Recipe' },
              ].map((c, i) => (
                <div key={i} style={S.recentItem}
                  onClick={() => enterAsGuest('/collections')}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,105,20,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={S.recentThumb}>
                    {c.img
                      ? <img src={c.img} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 2 }} />
                      : <span style={{ fontSize: '1.4rem' }}>{c.emoji}</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: '#c4a882', fontFamily: 'Lato, sans-serif', fontSize: '0.78rem', fontWeight: 600, margin: 0 }}>{c.title}</p>
                    <p style={{ color: '#5c4020', fontFamily: 'Cinzel, serif', fontSize: '0.55rem', letterSpacing: '0.15em', margin: '2px 0 0' }}>{c.type}</p>
                  </div>
                  <span style={{ color: '#5c4020', fontSize: '0.7rem' }}>→</span>
                </div>
              ))}
            </div>
            <button style={S.btnDark} onClick={() => enterAsGuest('/collections')} id="view-all-creations-btn">
              View All Collections ⊛
            </button>
          </div>
        </div>

        {/* Quote strip */}
        <div style={S.quoteStrip} className="glass-glow">
          <span style={{ color: '#c9a84c', fontSize: '1.2rem' }}>"</span>
          <span style={S.quoteText}>{t('quote')}</span>
          <span style={{ color: '#c9a84c', fontSize: '1.2rem' }}>"</span>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────── */}
      <footer style={S.footer}>
        <div style={S.footerInner}>
          {/* Brand col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <GearSVG size={18} className="animate-gear-slow" style={{ color: '#c9a84c' }} />
              <span style={S.brandName}>CREAFORGE</span>
            </div>
            <p style={{ color: '#5c4020', fontFamily: 'Lato, sans-serif', fontSize: '0.72rem', lineHeight: 1.6, maxWidth: 180 }}>
              Your creative studio for inventing things and crafting recipes with the power of AI.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              {['f', 'in', 'P', '✕'].map(s => (
                <button key={s} style={S.socialIcon}>
                  <span style={{ color: '#5c4020', fontSize: '0.6rem', fontFamily: 'Cinzel, serif' }}>{s}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {[
            { title: 'EXPLORE', links: ['Thing Maker', 'Recipe Maker', 'AI Assistant', 'Collections'] },
            { title: 'COMPANY', links: ['About Us', 'How It Works', 'Pricing', 'Contact'] },
            { title: 'HELP', links: ['Help Center', 'Guides', 'Community', 'Support'] },
          ].map(col => (
            <div key={col.title}>
              <h4 style={S.footerColTitle}>{col.title}</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {col.links.map(l => (
                  <li key={l}>
                    <button style={S.footerLink}
                      onClick={() => enterAsGuest()}
                      onMouseEnter={e => e.currentTarget.style.color = '#c9a84c'}
                      onMouseLeave={e => e.currentTarget.style.color = '#5c4020'}
                    >{l}</button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* CTA box */}
          <div style={S.footerCTA}>
            <h4 style={{ fontFamily: 'Playfair Display, serif', color: '#d8c4a0', fontSize: '1rem', marginBottom: 6 }}>Ready to Create?</h4>
            <p style={{ color: '#8a7355', fontFamily: 'Lato, sans-serif', fontSize: '0.72rem', marginBottom: 14 }}>
              Your next great idea is just a click away.
            </p>
            <button style={{ ...S.btnBrass, width: '100%', padding: '9px 0', fontSize: '0.7rem', marginBottom: 8 }} onClick={() => enterAsGuest()} id="footer-get-started-btn">
              Continue as Guest
            </button>

          </div>
        </div>

        <div style={S.footerBottom}>
          <span style={{ color: '#3c2a10', fontFamily: 'Cinzel, serif', fontSize: '0.6rem', letterSpacing: '0.15em' }}>
            © 2026 CREAFORGE. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────── */
function NavLink({ label, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: 'Lato, sans-serif', fontSize: '0.72rem', fontWeight: 600,
        color: hov ? '#e8c060' : '#c4a882', letterSpacing: '0.05em',
        background: 'none', border: 'none', cursor: 'pointer',
        padding: '4px 2px', transition: 'color 0.2s',
        borderBottom: hov ? '1px solid rgba(200,168,76,0.5)' : '1px solid transparent',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {label}
    </button>
  );
}

function MakerCard({ id, title, desc, accentColor, borderColor, glowColor, btnLabel, btnStyle, isHovered, onHover, onLeave, onClick, icon, panelStyle }) {
  const isRecipe = panelStyle === 'recipe';
  return (
    <div
      id={id}
      style={{
        background: isRecipe
          ? 'linear-gradient(145deg, rgba(60,35,15,0.95) 0%, rgba(35,18,8,0.98) 100%)'
          : 'linear-gradient(145deg, rgba(30,45,65,0.95) 0%, rgba(15,22,32,0.98) 100%)',
        border: `3px solid ${borderColor}`,
        outline: `2px solid ${isRecipe ? '#2a1505' : '#08101a'}`,
        outlineOffset: '-5px',
        padding: '30px 20px',
        transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
        boxShadow: isHovered
          ? `0 20px 40px rgba(0,0,0,0.8), 0 0 20px ${glowColor}`
          : `0 10px 30px rgba(0,0,0,0.7), 0 6px 6px rgba(0,0,0,0.5)`,
        transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
        cursor: 'pointer',
        flex: 1,
        minWidth: 0,
        borderRadius: '8px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      {icon}
      <h3 style={{
        fontFamily: 'Cinzel, serif', fontSize: '1.1rem', letterSpacing: '0.12em',
        color: accentColor, textAlign: 'center', margin: '0 0 10px',
        textShadow: `0 0 20px ${glowColor}`,
      }}>{title.toUpperCase()}</h3>
      <p style={{ fontFamily: 'Lato, sans-serif', fontSize: '0.8rem', color: isRecipe ? '#aa7040' : '#7a9aaa', textAlign: 'center', marginBottom: 20, lineHeight: 1.5, flex: 1 }}>
        {desc}
      </p>
      <button
        style={{ ...(btnStyle === 'rust' ? styles.btnRust : styles.btnDark), justifyContent: 'center', width: 'auto', padding: '8px 24px', borderRadius: '4px', display: 'inline-flex' }}
        onClick={e => { e.stopPropagation(); onClick(); }}
      >
        {btnLabel} →
      </button>
    </div>
  );
}

/* ── Styles object ───────────────────────────────── */
const styles = {
  pageWrap: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #0e0a06 0%, #1a0f07 30%, #2a1a0e 70%, #1a0f07 100%)',
    position: 'relative',
    fontFamily: 'Lato, sans-serif',
  },
  ambientLayer: {
    position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
    backgroundImage: `
      radial-gradient(ellipse 60% 40% at 20% 20%, rgba(139,105,20,0.08) 0%, transparent 70%),
      radial-gradient(ellipse 50% 30% at 80% 80%, rgba(100,60,20,0.06) 0%, transparent 70%)
    `,
  },
  navbar: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    background: 'linear-gradient(180deg, rgba(14,10,6,0.98) 0%, rgba(20,12,5,0.96) 100%)',
    borderBottom: '2px solid #8b6914',
    boxShadow: '0 4px 20px rgba(0,0,0,0.9), 0 1px 0 rgba(200,168,76,0.2)',
    transition: 'all 0.3s ease',
  },
  navbarScrolled: {
    backdropFilter: 'blur(8px)',
    background: 'rgba(10,6,2,0.95)',
  },
  navInner: {
    maxWidth: 1200, margin: '0 auto', padding: '0 24px',
    height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
  },
  brand: { display: 'flex', alignItems: 'center', flexShrink: 0 },
  brandLogo: { display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'linear-gradient(180deg, #1f140c 0%, #120a05 100%)', border: '2px solid #5c4020', padding: '12px 24px', borderRadius: '4px', boxShadow: 'inset 0 0 10px #000' },
  brandName: {
    fontFamily: 'Cinzel, serif', fontSize: '1.1rem', fontWeight: 700,
    letterSpacing: '0.15em', color: '#d8c4a0',
  },
  brandSub: {
    fontFamily: 'Lato, sans-serif', fontSize: '0.45rem', letterSpacing: '0.2em',
    color: '#8a7355', textTransform: 'uppercase', marginTop: 4,
  },
  navLinks: { display: 'flex', alignItems: 'center', gap: 20, flex: 1, justifyContent: 'center' },
  btnBrass: {
    background: 'linear-gradient(180deg, #c9a84c 0%, #8b6914 100%)',
    border: '1px solid #d4a017',
    color: '#0e0a06',
    fontFamily: 'Cinzel, serif', fontWeight: 600,
    fontSize: '0.65rem', letterSpacing: '0.08em',
    padding: '7px 16px', cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,220,100,0.4)',
    transition: 'all 0.2s ease',
    display: 'inline-flex', alignItems: 'center', gap: 6,
  },
  btnDark: {
    background: 'linear-gradient(180deg, #3d2510 0%, #2a1a0e 100%)',
    border: '1px solid #8b6914', color: '#d8c4a0',
    fontFamily: 'Cinzel, serif', fontSize: '0.65rem', letterSpacing: '0.08em',
    padding: '8px 16px', cursor: 'pointer', width: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    boxShadow: '0 4px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(200,168,76,0.1)',
    transition: 'all 0.2s ease',
  },
  btnRust: {
    background: 'linear-gradient(180deg, #c0523a 0%, #8b3a2a 100%)',
    border: '1px solid #a04030', color: '#f2e8d0',
    fontFamily: 'Cinzel, serif', fontSize: '0.65rem', letterSpacing: '0.08em',
    padding: '8px 16px', cursor: 'pointer', width: '100%',
    boxShadow: '0 4px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,150,100,0.2)',
    transition: 'all 0.2s ease',
  },
  avatarCircle: {
    width: 32, height: 32, borderRadius: '50%',
    border: '2px solid #8b6914', background: 'rgba(0,0,0,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
  },
  /* Hero */
  heroSection: {
    position: 'relative', paddingTop: 80, minHeight: '100vh',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
  },
  heroBgWrap: {
    position: 'absolute', inset: 0, zIndex: 0,
  },
  heroBgImg: {
    width: '100%', height: '100%', objectFit: 'cover',
    filter: 'sepia(0.3) contrast(1.1) brightness(0.7) blur(8px)', // Added blur and darkened for text visibility
    transform: 'scale(1.05)', // Prevent blur edges
    opacity: 1,
  },
  heroBgOverlay: {
    position: 'absolute', inset: 0,
    background: 'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(20,10,5,0.4) 0%, rgba(10,5,2,0.8) 100%)', // Darker overlay
  },
  heroContent: {
    position: 'relative', zIndex: 1,
    maxWidth: 1000, margin: '0 auto', padding: '60px 32px 80px',
    display: 'flex', justifyContent: 'center', textAlign: 'center',
  },
  heroCenter: { 
    display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' 
  },
  headline: {
    fontFamily: 'Cinzel, serif', fontWeight: 900,
    fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 1.1,
    color: '#e8d9b8', margin: '0 0 20px', // Brightened text
    textShadow: '0px 4px 20px rgba(0,0,0,0.8), 0 0 40px rgba(200,168,76,0.3)',
    letterSpacing: '0.02em',
  },
  heroDesc: {
    fontFamily: 'Lato, sans-serif', fontSize: '0.95rem', color: '#d4c49a', // Brightened text
    lineHeight: 1.6, margin: '0 0 30px', maxWidth: 600, fontWeight: 500,
    textShadow: '0 2px 10px rgba(0,0,0,0.8)',
  },
  makerCardsGrid: {
    display: 'flex', gap: 0, alignItems: 'stretch', marginTop: 20,
    width: '100%', maxWidth: 850, justifyContent: 'center', position: 'relative', zIndex: 2,
  },
  andConnector: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 44, flexShrink: 0, zIndex: 2, margin: '0 -22px'
  },
  andConnectorInner: {
    width: 44, height: 44, borderRadius: '50%',
    background: 'linear-gradient(135deg, #3d2510, #2a1a0e)',
    border: '2px solid #8b6914',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'Cinzel, serif', fontSize: '1.2rem', color: '#c9a84c',
    boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
  },
  /* Features */
  featuresSection: {
    position: 'relative', zIndex: 1,
    background: 'linear-gradient(180deg, rgba(196,168,130,0.12) 0%, rgba(196,168,130,0.06) 100%)',
    borderTop: '1px solid rgba(139,105,20,0.3)', borderBottom: '1px solid rgba(139,105,20,0.3)',
    padding: '40px 0',
  },
  featuresInner: { maxWidth: 1200, margin: '0 auto', padding: '0 32px' },
  featuresGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20,
    marginTop: 28,
  },
  featureCard: {
    background: 'linear-gradient(145deg, #251808 0%, #1a0f07 100%)',
    border: '1px solid rgba(139,105,20,0.4)',
    outline: '2px double rgba(61,37,16,0.6)', outlineOffset: '-4px',
    padding: '24px 16px', textAlign: 'center',
    boxShadow: '0 6px 20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(200,168,76,0.08)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    cursor: 'default',
  },
  featureTitle: {
    fontFamily: 'Cinzel, serif', fontSize: '0.6rem',
    letterSpacing: '0.2em', color: '#c9a84c',
    textTransform: 'uppercase', margin: '0 0 8px',
  },
  featureDesc: {
    fontFamily: 'Lato, sans-serif', fontSize: '0.72rem',
    color: '#8a7355', lineHeight: 1.55, margin: 0,
  },
  /* AI Assistant */
  assistantSection: {
    position: 'relative', zIndex: 1,
    background: 'linear-gradient(180deg, #1a0f07 0%, #0e0a06 100%)',
    borderTop: '2px solid rgba(139,105,20,0.3)',
    padding: '48px 0 0',
  },
  assistantInner: {
    maxWidth: 1200, margin: '0 auto', padding: '0 32px',
    display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24,
  },
  assistantPanel: {
    background: 'linear-gradient(145deg, #251808 0%, #1a0f07 100%)',
    border: '2px solid #8b6914',
    outline: '3px double #3d2510', outlineOffset: '-5px',
    padding: '24px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.7), inset 0 1px 0 rgba(200,168,76,0.12)',
  },
  assistantContent: {
    display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20,
    marginTop: 20, alignItems: 'start',
  },
  robotImgWrap: { position: 'relative' },
  robotImg: {
    width: '100%', objectFit: 'contain',
    filter: 'sepia(0.1) contrast(1.1)',
    maxHeight: 260,
  },
  robotGlow: {
    position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
    width: '80%', height: 40,
    background: 'radial-gradient(ellipse, rgba(139,105,20,0.3), transparent)',
    filter: 'blur(10px)',
  },
  chatArea: { display: 'flex', flexDirection: 'column', gap: 8 },
  chatBubble: {
    background: 'rgba(0,0,0,0.35)',
    border: '1px solid rgba(139,105,20,0.4)',
    padding: '12px 16px', marginBottom: 8,
    boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)',
  },
  chatOption: {
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(139,105,20,0.3)',
    padding: '9px 14px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    cursor: 'pointer', transition: 'all 0.2s ease', width: '100%',
  },
  recentPanel: {
    background: 'linear-gradient(145deg, #251808 0%, #1a0f07 100%)',
    border: '2px solid #8b6914',
    outline: '3px double #3d2510', outlineOffset: '-5px',
    padding: '24px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.7), inset 0 1px 0 rgba(200,168,76,0.12)',
  },
  recentItem: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 8px', borderBottom: '1px solid rgba(139,105,20,0.2)',
    cursor: 'pointer', transition: 'background 0.2s ease',
  },
  recentThumb: {
    width: 40, height: 40, flexShrink: 0,
    border: '1px solid rgba(139,105,20,0.4)',
    background: 'rgba(0,0,0,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  quoteStrip: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
    padding: '20px 32px', marginTop: 32,
    background: 'rgba(0,0,0,0.4)',
    borderTop: '1px solid rgba(139,105,20,0.2)',
  },
  quoteText: {
    fontFamily: 'IM Fell English, serif', fontStyle: 'italic',
    fontSize: '0.82rem', color: '#8a7355', letterSpacing: '0.02em',
  },
  /* Footer */
  footer: {
    background: 'rgba(8,4,1,0.97)',
    borderTop: '2px solid rgba(139,105,20,0.5)',
  },
  footerInner: {
    maxWidth: 1200, margin: '0 auto', padding: '40px 32px',
    display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1.2fr', gap: 32,
  },
  footerColTitle: {
    fontFamily: 'Cinzel, serif', fontSize: '0.6rem',
    letterSpacing: '0.2em', color: '#8b6914',
    textTransform: 'uppercase', marginBottom: 14,
  },
  footerLink: {
    fontFamily: 'Lato, sans-serif', fontSize: '0.72rem',
    color: '#5c4020', background: 'none', border: 'none',
    cursor: 'pointer', transition: 'color 0.2s', padding: 0,
  },
  footerCTA: {
    background: 'linear-gradient(145deg, #251808, #1a0f07)',
    border: '1px solid #8b6914',
    padding: '20px 16px', textAlign: 'center',
    outline: '2px double #3d2510', outlineOffset: '-4px',
  },
  footerBottom: {
    borderTop: '1px solid rgba(139,105,20,0.2)',
    padding: '14px 32px', textAlign: 'center',
  },
  socialIcon: {
    width: 28, height: 28, border: '1px solid rgba(139,105,20,0.4)',
    background: 'rgba(0,0,0,0.3)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  },
};
