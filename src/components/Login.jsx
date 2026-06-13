import React, { useState } from 'react';

const GearSVG = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm7.8-3c0-.3 0-.6-.05-.9l1.9-1.5c.2-.15.25-.4.1-.6l-1.8-3.1c-.15-.2-.4-.27-.6-.2l-2.25.9c-.45-.35-.95-.65-1.5-.87L15.25 4c-.05-.25-.25-.45-.5-.45h-3.5c-.25 0-.45.2-.5.45l-.35 2.43c-.55.22-1.05.52-1.5.87l-2.25-.9c-.22-.08-.48 0-.6.2L4.25 9.9c-.14.2-.1.46.1.6l1.9 1.5c-.04.3-.05.6-.05.9s0 .6.05.9l-1.9 1.5c-.2.15-.25.4-.1.6l1.8 3.1c.15.2.4.27.6.2l2.25-.9c.45.35.95.65 1.5.87l.35 2.43c.05.25.25.45.5.45h3.5c.25 0 .45-.2.5-.45l.35-2.43c.55-.22 1.05-.52 1.5-.87l2.25.9c.22.08.48 0 .6-.2l1.8-3.1c.14-.2.1-.46-.1-.6l-1.9-1.5c.04-.3.05-.6.05-.9z" />
  </svg>
);

const Fleuron = () => (
  <span style={{ color: '#8b6914', fontSize: '0.9em', lineHeight: 1 }}>❧</span>
);

export default function Login({ onLogin }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin({
        name: 'Jane Doe',
        email: 'jane@creaforge.app',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
      });
    }, 1600);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #0e0a06 0%, #1a0f07 40%, #2a1a0e 100%)',
        backgroundImage: 'url(/parchment.png)',
        backgroundBlendMode: 'color-burn',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
      }}>

      {/* ── Decorative floating gears ────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <GearSVG size={140} className="absolute top-8 right-16 animate-gear-slow opacity-10" style={{ color: '#8b6914' }} />
        <GearSVG size={80} className="absolute top-24 right-44 animate-gear opacity-10" style={{ color: '#c9a84c' }} />
        <GearSVG size={200} className="absolute -bottom-16 -left-16 animate-gear-slow opacity-8" style={{ color: '#8b6914' }} />
        <GearSVG size={100} className="absolute bottom-24 left-32 animate-gear-rev opacity-8" style={{ color: '#c9a84c' }} />
        <GearSVG size={60} className="absolute top-1/2 left-1/4 animate-gear opacity-5" style={{ color: '#8b6914' }} />
        {/* Horizontal rule lines */}
        <div className="absolute top-16 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(139,105,20,0.3), transparent)' }} />
        <div className="absolute bottom-16 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(139,105,20,0.3), transparent)' }} />
      </div>

      {/* ── Micro-nav bar ───────────────────── */}
      <div className="relative z-10 flex items-center justify-between px-8 py-4 border-b" style={{ borderColor: 'rgba(139,105,20,0.4)' }}>
        <div className="flex items-center gap-3">
          <GearSVG size={22} className="animate-gear-slow" style={{ color: '#c9a84c' }} />
          <div>
            <h1 className="sp-title text-sm tracking-[0.2em]">CREAFORGE</h1>
            <p className="sp-label text-[7px]" style={{ color: '#5c4020' }}>CREATE · COOK · INNOVATE</p>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          {['Home', 'Thing Maker', 'Recipe Maker', 'AI Assistant', 'Collections', 'About'].map(item => (
            <button key={item} className="text-[10px] tracking-widest transition-colors" style={{ color: '#8a7355', fontFamily: 'Lato, sans-serif' }}
              onMouseEnter={e => e.target.style.color = '#c9a84c'}
              onMouseLeave={e => e.target.style.color = '#8a7355'}>{item}</button>
          ))}
        </nav>
        <button onClick={handleSignIn} className="btn-brass px-4 py-1.5 text-[9px] tracking-widest">
          My Studio
        </button>
      </div>

      {/* ── Hero Section ──────────────────────────── */}
      <div className="relative z-10 flex-1 max-w-7xl mx-auto px-6 py-12 w-full">

        {/* Hero main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[60vh]">

          {/* Left: Headline + Maker cards */}
          <div className="space-y-8 animate-fade-up">
            {/* Hero headline */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 mb-4">
                <Fleuron />
                <span className="sp-label text-[8px] tracking-[0.3em]" style={{ color: '#8b6914' }}>THE ULTIMATE MAKER STUDIO</span>
                <Fleuron />
              </div>
              <h1 className="sp-title text-4xl sm:text-6xl font-black leading-none"
                style={{ fontFamily: 'Cinzel, serif', lineHeight: '1.05' }}>
                CREATE<br />ANYTHING.<br />
                <span style={{ color: '#d4a017' }}>MAKE</span> EVERYTHING.
              </h1>
              <p className="sp-body text-sm max-w-md leading-relaxed mt-4" style={{ color: '#c4a882' }}>
                The ultimate fusion of imagination and taste. Design things, craft recipes, and bring your ideas to life with the power of AI.
              </p>
              <button onClick={handleSignIn} disabled={isLoading}
                className="btn-brass mt-4 px-8 py-3 text-xs tracking-widest flex items-center gap-3 disabled:opacity-60">
                {isLoading ? (
                  <><GearSVG size={14} className="animate-gear" /> Entering Studio…</>
                ) : (
                  <>Start Creating <span style={{ fontSize: '1.1em' }}>→</span></>
                )}
              </button>
            </div>

            {/* ── Two Maker Cards ──────────────── */}
            <div className="grid grid-cols-2 gap-4 max-w-lg">
              {/* THING MAKER */}
              <div className="sp-thing-panel p-5 hover-lift cursor-pointer group" onClick={handleSignIn}
                style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.7), 0 6px 6px rgba(0,0,0,0.4)' }}>
                <div className="text-center mb-4">
                  <GearSVG size={32} className="mx-auto animate-gear-slow group-hover:animate-gear transition-all" style={{ color: '#7090b0' }} />
                  <h3 className="sp-title text-base mt-2 tracking-[0.12em]" style={{ color: '#90b0d0' }}>THING MAKER</h3>
                  <p className="sp-body text-[9px] mt-1" style={{ color: '#7a9aaa' }}>Design, build, invent and bring your ideas to reality.</p>
                </div>
                <div className="flex justify-center gap-3 my-3">
                  <GearSVG size={14} className="animate-gear-slow" style={{ color: '#4a6080' }} />
                  <GearSVG size={18} className="animate-gear-rev" style={{ color: '#6080a0' }} />
                  <GearSVG size={14} className="animate-gear" style={{ color: '#4a6080' }} />
                </div>
                <div className="sp-divider mb-3" style={{ background: 'linear-gradient(90deg, transparent, rgba(100,150,200,0.4), transparent)' }} />
                <button className="btn-dark w-full py-1.5 text-[9px] tracking-widest" style={{ borderColor: '#4a6080' }}>
                  Enter Workshop →
                </button>
              </div>

              {/* RECIPE MAKER */}
              <div className="sp-recipe-panel p-5 hover-lift cursor-pointer group" onClick={handleSignIn}
                style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.7), 0 6px 6px rgba(0,0,0,0.4)' }}>
                <div className="text-center mb-4">
                  <div className="text-3xl group-hover:scale-110 transition-transform inline-block">🍲</div>
                  <h3 className="sp-title text-base mt-2 tracking-[0.12em]" style={{ color: '#e8a060' }}>RECIPE MAKER</h3>
                  <p className="sp-body text-[9px] mt-1" style={{ color: '#aa7040' }}>Create, mix, cook and craft delicious recipes.</p>
                </div>
                <div className="flex justify-center gap-3 my-3">
                  <span className="text-base opacity-60">⚗️</span>
                  <span className="text-base opacity-80">🥄</span>
                  <span className="text-base opacity-60">🍴</span>
                </div>
                <div className="sp-divider mb-3" style={{ background: 'linear-gradient(90deg, transparent, rgba(200,130,60,0.4), transparent)' }} />
                <button className="btn-rust w-full py-1.5 text-[9px] tracking-widest">
                  Enter Kitchen →
                </button>
              </div>
            </div>
          </div>

          {/* Right: Hero illustration */}
          <div className="hidden lg:flex items-center justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="relative w-full max-w-md">
              <img src="/hero-bg.png" alt="CreaForge Workshop" className="w-full object-contain animate-flicker"
                style={{ filter: 'sepia(0.3) contrast(0.9) brightness(0.85)', mixBlendMode: 'luminosity', opacity: 0.85 }} />
              {/* Floating gears on illustration */}
              <GearSVG size={40} className="absolute top-4 left-4 animate-gear-slow opacity-40" style={{ color: '#c9a84c' }} />
              <GearSVG size={25} className="absolute top-12 left-12 animate-gear opacity-30" style={{ color: '#8b6914' }} />
              <GearSVG size={30} className="absolute bottom-8 right-8 animate-gear-rev opacity-40" style={{ color: '#c9a84c' }} />
            </div>
          </div>
        </div>

        {/* ── Features strip ───────────────────────── */}
        <div className="mt-12">
          <div className="sp-rule my-6" style={{ color: '#8b6914' }}>
            EVERY CREATION STARTS WITH INSPIRATION
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {[
              { icon: '🤖', title: 'AI POWERED', desc: 'Smart assistant to guide your every step.' },
              { icon: '♾️', title: 'ENDLESS POSSIBILITIES', desc: 'From inventions to recipes, imagination has no limits.' },
              { icon: '📚', title: 'SAVE & ORGANISE', desc: 'Store your creations and build your collection.' },
              { icon: '🌍', title: 'SHARE & INSPIRE', desc: 'Share your work and inspire the community.' },
            ].map((f, i) => (
              <div key={i} className="sp-card p-4 text-center animate-fade-up" style={{ animationDelay: `${0.1 + i * 0.07}s` }}>
                <div className="text-2xl mb-2">{f.icon}</div>
                <h4 className="sp-label text-[8px] tracking-[0.2em] mb-1" style={{ color: '#c9a84c' }}>{f.title}</h4>
                <p className="sp-body text-[9px] leading-snug" style={{ color: '#8a7355' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── AI Assistant Section ─────────────────── */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Robot + chat */}
          <div className="lg:col-span-2 sp-panel p-6 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <div className="sp-rule mb-5" style={{ color: '#c9a84c' }}>MEET YOUR AI ASSISTANT</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
              <img src="/steampunk-robot.png" alt="AI Assistant" className="w-full max-w-[180px] mx-auto object-contain"
                style={{ filter: 'sepia(0.2) contrast(1.1)', opacity: 0.9 }} />
              <div className="space-y-2">
                <div className="sp-inset p-3 text-sm" style={{ color: '#d8c4a0', fontFamily: 'IM Fell English, serif', fontStyle: 'italic' }}>
                  Hello, creator!<br />How can I help you today?
                </div>
                {['Suggest a unique invention', 'Create a delicious recipe', 'Improve my idea', 'Surprise me!'].map((s, i) => (
                  <button key={i} onClick={handleSignIn}
                    className="btn-dark w-full py-2 px-4 text-[10px] tracking-wider flex items-center justify-between">
                    <span style={{ fontFamily: 'Lato, sans-serif', color: '#c4a882' }}>{s}</span>
                    <span style={{ color: '#8b6914' }}>→</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Recent creations */}
          <div className="sp-panel p-5 animate-fade-up" style={{ animationDelay: '0.35s' }}>
            <div className="sp-rule mb-4" style={{ color: '#c9a84c', fontSize: '0.55rem' }}>RECENT CREATIONS</div>
            {[
              { emoji: '⚙️', title: 'Steam-Powered Lamp', type: 'Thing' },
              { emoji: '🍞', title: 'Herb & Garlic Bread', type: 'Recipe' },
              { emoji: '🗄️', title: 'Vintage Desk Organizer', type: 'Thing' },
              { emoji: '🫖', title: 'Spiced Orange Tea', type: 'Recipe' },
            ].map((c, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b cursor-pointer hover:bg-white/5 transition-colors px-1"
                style={{ borderColor: 'rgba(139,105,20,0.25)' }} onClick={handleSignIn}>
                <span className="text-lg">{c.emoji}</span>
                <div className="flex-1">
                  <p className="sp-body text-[10px] font-semibold" style={{ color: '#c4a882' }}>{c.title}</p>
                  <p className="sp-label text-[8px]" style={{ color: '#5c4020' }}>{c.type}</p>
                </div>
                <span style={{ color: '#5c4020', fontSize: '10px' }}>→</span>
              </div>
            ))}
            <button onClick={handleSignIn} className="btn-dark w-full mt-3 py-1.5 text-[9px] tracking-widest">
              View All Creations
            </button>
          </div>
        </div>
      </div>

      {/* ── Footer ──────────────────────────────── */}
      <footer className="relative z-10 border-t" style={{ borderColor: 'rgba(139,105,20,0.4)', background: 'rgba(10,6,2,0.8)' }}>
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <GearSVG size={16} className="animate-gear-slow" style={{ color: '#c9a84c' }} />
              <span className="sp-title text-xs tracking-[0.2em]">CREAFORGE</span>
            </div>
            <p className="sp-body text-[9px] leading-relaxed" style={{ color: '#5c4020' }}>
              Your creative studio for inventing things and crafting recipes with the power of AI.
            </p>
          </div>
          {[
            { title: 'EXPLORE', links: ['Thing Maker', 'Recipe Maker', 'AI Assistant', 'Collections'] },
            { title: 'COMPANY', links: ['About Us', 'How It Works', 'Pricing', 'Contact'] },
            { title: 'HELP', links: ['Help Centre', 'Guides', 'Community', 'Support'] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="sp-label text-[8px] mb-3 tracking-[0.2em]" style={{ color: '#8b6914' }}>{col.title}</h4>
              <ul className="space-y-1.5">
                {col.links.map(l => (
                  <li key={l}>
                    <button className="sp-body text-[9px] transition-colors hover:text-yellow-300"
                      style={{ fontFamily: 'Lato, sans-serif', color: '#5c4020' }}>{l}</button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {/* CTA box */}
          <div className="col-span-2 sm:col-span-1">
            <div className="sp-card p-4 text-center" style={{ border: '1px solid #8b6914' }}>
              <h4 className="sp-heading text-sm mb-1">Ready to Create?</h4>
              <p className="sp-body text-[9px] mb-3" style={{ color: '#8a7355' }}>Your next great idea is just a click away.</p>
              <button onClick={handleSignIn} className="btn-brass w-full py-2 text-[9px] tracking-widest">
                Get Started
              </button>
            </div>
          </div>
        </div>
        <div className="text-center py-3 border-t" style={{ borderColor: 'rgba(139,105,20,0.2)' }}>
          <p className="sp-label text-[8px]" style={{ color: '#3c2a10' }}>© 2024 CREAFORGE. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
