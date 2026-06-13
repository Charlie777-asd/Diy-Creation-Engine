import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ChevronDown, Wifi, WifiOff, Loader2, Globe } from 'lucide-react';
import { useLanguage } from '../utils/LanguageContext';

const GearIcon = ({ size = 14, className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
    <path d="M12 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm7.8-3c0-.3 0-.6-.05-.9l1.9-1.5c.2-.15.25-.4.1-.6l-1.8-3.1c-.15-.2-.4-.27-.6-.2l-2.25.9c-.45-.35-.95-.65-1.5-.87L15.25 4c-.05-.25-.25-.45-.5-.45h-3.5c-.25 0-.45.2-.5.45l-.35 2.43c-.55.22-1.05.52-1.5.87l-2.25-.9c-.22-.08-.48 0-.6.2L4.25 9.9c-.14.2-.1.46.1.6l1.9 1.5c-.04.3-.05.6-.05.9s0 .6.05.9l-1.9 1.5c-.2.15-.25.4-.1.6l1.8 3.1c.15.2.4.27.6.2l2.25-.9c.45.35.95.65 1.5.87l.35 2.43c.05.25.25.45.5.45h3.5c.25 0 .45-.2.5-.45l.35-2.43c.55-.22 1.05-.52 1.5-.87l2.25.9c.22.08.48 0 .6-.2l1.8-3.1c.14-.2.1-.46-.1-.6l-1.9-1.5c.04-.3.05-.6.05-.9z"/>
  </svg>
);

export default function Navbar({
  ollamaStatus = 'offline',
  modelsList = [],
  selectedModel = '',
  onModelChange,
}) {
  const navigate = useNavigate();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langRef = useRef(null);
  const { language, setLanguage, t, getLanguageName } = useLanguage();

  const links = [
    { label: t('navHome'), path: '/' },
    { label: t('navThingMaker'), path: '/thing-maker' },
    { label: t('navRecipeMaker'), path: '/recipe-maker' },
    { label: t('navAiAssistant'), path: '/ai-assistant' },
    { label: t('navCollections'), path: '/collections' },
    { label: t('navAbout'), path: '/about' },
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full sp-nav">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-3 shrink-0 bg-transparent border-none cursor-pointer"
        >
          <div className="relative flex items-center justify-center w-8 h-8">
            <GearIcon size={28} className="animate-gear-slow absolute" style={{ color: '#c9a84c' }} />
            <GearIcon size={14} className="animate-gear absolute top-0 right-0" style={{ color: '#8b6914' }} />
          </div>
          <div className="text-left hidden sm:block">
            <h1 className="text-sm font-bold tracking-[0.15em] leading-none" style={{ fontFamily: 'Cinzel, serif', color: '#d8c4a0' }}>
              CREAFORGE
            </h1>
            <p className="text-[8px] tracking-[0.2em] mt-1" style={{ fontFamily: 'Cinzel, serif', color: '#c9a84c' }}>
              CREATE · COOK · INNOVATE
            </p>
          </div>
        </button>

        {/* Nav links */}
        <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `px-3 py-2 text-[11px] font-bold tracking-wider transition-all duration-200 border-b-2 ${
                  isActive
                    ? 'border-[#c9a84c] text-[#e8c060]'
                    : 'border-transparent text-[#8a7355] hover:text-[#c4a882]'
                }`
              }
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Language Selector */}
          <div className="relative hidden md:block" ref={langRef}>
            <button
              type="button"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 px-2 py-1 rounded border border-[#3d2510] bg-black/30 hover:bg-black/50 transition-colors"
              title="Select Language"
            >
              <Globe className="h-3 w-3 text-[#8a7355]" />
              <span className="text-[9px] font-bold text-[#8a7355] uppercase tracking-wider">
                {getLanguageName(language)}
              </span>
              <ChevronDown className="h-3 w-3 text-[#8a7355]" />
            </button>
            {langMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-32 bg-[#1a1008] border border-[#3d2510] rounded-lg shadow-2xl py-2 z-50">
                {['en', 'hi', 'te', 'ta'].map(lang => (
                  <button
                    key={lang}
                    onClick={() => { setLanguage(lang); setLangMenuOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-xs transition-colors ${language === lang ? 'text-[#c9a84c] bg-[#251808]' : 'text-[#c4a882] hover:bg-[#251808]'}`}
                  >
                    {getLanguageName(lang)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Ollama status */}
          <div
            className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded border border-[#3d2510] bg-black/30"
            title={ollamaStatus === 'connected' ? 'Local AI connected' : 'Using offline AI fallback'}
          >
            {ollamaStatus === 'checking' ? (
              <Loader2 className="h-3 w-3 text-[#8a7355] animate-spin" />
            ) : ollamaStatus === 'connected' ? (
              <Wifi className="h-3 w-3 text-[#4ade80]" />
            ) : (
              <WifiOff className="h-3 w-3 text-[#8a7355]" />
            )}
            <span className="text-[9px] font-bold text-[#8a7355] uppercase tracking-wider">
              {ollamaStatus === 'checking' ? 'AI…' : ollamaStatus === 'connected' ? 'Local AI' : 'Offline AI'}
            </span>
          </div>

          {/* Model selector */}
          {modelsList.length > 0 && onModelChange && (
            <select
              value={selectedModel}
              onChange={(e) => onModelChange(e.target.value)}
              className="hidden md:block sp-select text-[10px] py-1 px-2 max-w-[140px] rounded"
              title="Select AI model"
            >
              {modelsList.map((m) => (
                <option key={m} value={m}>{m.split(':')[0]}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="lg:hidden flex items-center gap-1 overflow-x-auto px-4 pb-2 no-scrollbar border-t border-[#2a1a0e]">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `flex-shrink-0 px-3 py-1.5 text-[10px] font-bold tracking-wider rounded transition-colors ${
                isActive ? 'bg-[#251808] text-[#c9a84c]' : 'text-[#8a7355]'
              }`
            }
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
