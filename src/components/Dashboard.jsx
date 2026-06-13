import React, { useState } from 'react';
import RecipeMaker from './RecipeMaker';
import ThingMaker from './ThingMaker';
import AIAssistantDrawer from './AIAssistantDrawer';

const GearSVG = ({ size = 24, className = '', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
    <path d="M12 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm7.8-3c0-.3 0-.6-.05-.9l1.9-1.5c.2-.15.25-.4.1-.6l-1.8-3.1c-.15-.2-.4-.27-.6-.2l-2.25.9c-.45-.35-.95-.65-1.5-.87L15.25 4c-.05-.25-.25-.45-.5-.45h-3.5c-.25 0-.45.2-.5.45l-.35 2.43c-.55.22-1.05.52-1.5.87l-2.25-.9c-.22-.08-.48 0-.6.2L4.25 9.9c-.14.2-.1.46.1.6l1.9 1.5c-.04.3-.05.6-.05.9s0 .6.05.9l-1.9 1.5c-.2.15-.25.4-.1.6l1.8 3.1c.15.2.4.27.6.2l2.25-.9c.45.35.95.65 1.5.87l.35 2.43c.05.25.25.45.5.45h3.5c.25 0 .45-.2.5-.45l.35-2.43c.55-.22 1.05-.52 1.5-.87l2.25.9c.22.08.48 0 .6-.2l1.8-3.1c.14-.2.1-.46-.1-.6l-1.9-1.5c.04-.3.05-.6.05-.9z" />
  </svg>
);

const LANE_META = {
  recipe: {
    key: 'recipe',
    label: 'RECIPE MAKER KITCHEN',
    sub: 'CREATE • MIX • COOK',
    icon: '🍲',
    panelClass: 'sp-recipe-panel',
    glowClass: 'recipe-glow',
    color: '#e8a060',
    borderColor: '#8b5e14',
    step1: 'INGREDIENTS',
    step2: 'AI RECIPE',
    step3: 'COOKING',
  },
  thing: {
    key: 'thing',
    label: 'THING MAKER WORKSHOP',
    sub: 'DESIGN • BUILD • INVENT',
    icon: <GearSVG size={20} className="animate-gear" style={{ color: '#90b0d0' }} />,
    panelClass: 'sp-thing-panel',
    glowClass: 'thing-glow',
    color: '#90b0d0',
    borderColor: '#4a6080',
    step1: 'MATERIALS',
    step2: 'TOOLS',
    step3: 'BLUEPRINT',
  },
};

function LaneHeader({ meta, isActive }) {
  return (
    <div className={`relative mb-4 p-4 border-b-2 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-60'}`}
      style={{ borderColor: meta.borderColor, background: 'rgba(0,0,0,0.3)' }}>
      {/* Glow overlay */}
      {isActive && <div className={`absolute inset-0 bg-gradient-to-b from-[${meta.color}]/10 to-transparent pointer-events-none`} />}
      
      <div className="relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded" style={{ background: 'rgba(0,0,0,0.5)', border: `1px solid ${meta.borderColor}` }}>
            {typeof meta.icon === 'string' ? <span style={{ fontSize: '1.2rem' }}>{meta.icon}</span> : meta.icon}
          </div>
          <div>
            <h2 className="sp-title text-base sm:text-lg leading-none m-0" style={{ color: meta.color, letterSpacing: '0.15em' }}>
              {meta.label}
            </h2>
            <p className="sp-label text-[9px] mt-1 m-0" style={{ color: '#8a7355', letterSpacing: '0.25em' }}>{meta.sub}</p>
          </div>
        </div>
        
        {/* Flow steps */}
        <div className="hidden sm:flex items-center gap-3">
          {[meta.step1, meta.step2, meta.step3].map((step, i) => (
            <React.Fragment key={i}>
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full"
                  style={{ 
                    border: `1px solid ${isActive ? meta.color : '#8a7355'}`, 
                    color: isActive ? meta.color : '#8a7355',
                    fontFamily: 'Cinzel, serif', fontSize: '0.6rem' 
                  }}>
                  {i + 1}
                </span>
                <span className="sp-label text-[8px]" style={{ color: isActive ? '#d8c4a0' : '#8a7355' }}>{step}</span>
              </div>
              {i < 2 && <span style={{ color: '#5c4020', fontSize: '0.7rem' }}>→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [activeModule, setActiveModule] = useState('recipe');
  const [recipeContext, setRecipeContext] = useState({ ingredientsText: '', activeRecipe: null });
  const [thingContext, setThingContext] = useState({ materialsText: '', selectedToolsCount: 0, activeProject: null });

  const handleRecipeChange = (ctx) => { setRecipeContext(ctx); setActiveModule('recipe'); };
  const handleThingChange  = (ctx) => { setThingContext(ctx);  setActiveModule('thing'); };

  const currentContext = activeModule === 'recipe'
    ? { ingredientsText: recipeContext.ingredientsText, activeRecipe: recipeContext.activeRecipe }
    : { materialsText: thingContext.materialsText, selectedToolsCount: thingContext.selectedToolsCount, activeProject: thingContext.activeProject };

  return (
    <div className="relative flex-1 w-full pb-24" style={{ background: 'var(--mahogany)', backgroundImage: 'url(/parchment.png)', backgroundBlendMode: 'color-burn', backgroundSize: 'cover' }}>

      {/* ── Mobile switcher ─────────────────────── */}
      <div className="lg:hidden p-4 border-b" style={{ borderColor: 'var(--brass)' }}>
        <div className="flex bg-black/40 p-1 border border-amber-900/40">
          {Object.values(LANE_META).map(m => (
            <button
              key={m.key}
              onClick={() => setActiveModule(m.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] tracking-widest font-bold font-['Cinzel'] transition-all ${
                activeModule === m.key 
                  ? 'bg-gradient-to-b from-[#3d2510] to-[#1a0f07] text-[#c9a84c] shadow-[inset_0_1px_0_rgba(200,168,76,0.3)] border border-[#8b6914]' 
                  : 'text-[#8a7355] hover:text-[#c4a882] border border-transparent'
              }`}
            >
              {typeof m.icon === 'string' ? m.icon : <GearSVG size={14} />}
              {m.key === 'recipe' ? 'RECIPE MAKER' : 'THING MAKER'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Dual-Lane Content ───────────────────────────────── */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">

          {/* ── Recipe Lane ─────────────────────── */}
          <div
            className={`transition-all duration-500 ${activeModule !== 'recipe' ? 'hidden lg:block lg:opacity-50 hover:opacity-100 cursor-pointer lg:scale-95' : 'lg:scale-100 z-10'}`}
            onClick={() => activeModule !== 'recipe' && setActiveModule('recipe')}
          >
            <div className={`rounded-sm overflow-hidden transition-all duration-300 ${LANE_META.recipe.panelClass} ${activeModule === 'recipe' ? LANE_META.recipe.glowClass : ''}`}>
              <LaneHeader meta={LANE_META.recipe} isActive={activeModule === 'recipe'} />
              <div className="p-4 pt-0">
                <RecipeMaker onStateChange={handleRecipeChange} />
              </div>
            </div>
          </div>

          {/* ── Vertical Divider (desktop only) ─ */}
          <div className="hidden lg:flex flex-col items-center justify-center absolute left-1/2 top-10 bottom-10 -translate-x-1/2 pointer-events-none opacity-50">
            <div className="w-px flex-1" style={{ background: 'linear-gradient(180deg, transparent, #8b6914, transparent)' }} />
            <div className="my-4 text-[#8b6914] flex flex-col items-center gap-2">
              <span className="text-[10px]">⚙️</span>
              <span className="text-[10px]">🍲</span>
            </div>
            <div className="w-px flex-1" style={{ background: 'linear-gradient(180deg, transparent, #8b6914, transparent)' }} />
          </div>

          {/* ── Thing Maker Lane ────────────────── */}
          <div
            className={`transition-all duration-500 ${activeModule !== 'thing' ? 'hidden lg:block lg:opacity-50 hover:opacity-100 cursor-pointer lg:scale-95' : 'lg:scale-100 z-10'}`}
            onClick={() => activeModule !== 'thing' && setActiveModule('thing')}
          >
            <div className={`rounded-sm overflow-hidden transition-all duration-300 ${LANE_META.thing.panelClass} ${activeModule === 'thing' ? LANE_META.thing.glowClass : ''}`}>
              <LaneHeader meta={LANE_META.thing} isActive={activeModule === 'thing'} />
              <div className="p-4 pt-0">
                <ThingMaker onStateChange={handleThingChange} />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── AI Chat Drawer ──────────────────────────────────── */}
      <AIAssistantDrawer activeModule={activeModule} currentContext={currentContext} />
    </div>
  );
}
