import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Send, Sparkles, Search } from 'lucide-react';
import AIAssistantModal from './AIAssistantModal';
import ThingGenerator from './ThingGenerator';
import BlueprintModal from './BlueprintModal';
import SmallWindowModal from './SmallWindowModal';
import { useLanguage } from '../utils/LanguageContext';
import { creationsService } from '../services/creationsService';
import { preloadedThings } from '../utils/preloadedThings';

export default function ThingMakerPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [latestProject, setLatestProject] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [askInput, setAskInput] = useState('');
  const [directNameInput, setDirectNameInput] = useState('');
  const [selectedBlueprint, setSelectedBlueprint] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [visibleCards, setVisibleCards] = useState([]);
  const [isToolsWindowOpen, setIsToolsWindowOpen] = useState(false);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const data = await creationsService.fetchAll();
        const things = data.filter(c => c.type === 'thing');
        if (things.length > 0) setLatestProject(things[0]);
      } catch (e) {
        console.error('Failed to fetch latest project', e);
      }
    };
    fetchLatest();
  }, []);

  // Stagger card entrance animation
  useEffect(() => {
    const timers = preloadedThings.map((_, i) =>
      setTimeout(() => setVisibleCards(prev => [...prev, i]), 100 + i * 120)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const sidebarLinks = [
    { icon: '🏠', labelKey: 'navHome', action: () => setActiveView('dashboard'), active: true },
    { icon: '📁', labelKey: 'savedProjects', action: () => navigate('/collections') },
    { icon: '🔨', labelKey: 'newProject', action: () => setActiveView('generator') },
    { icon: '🤖', labelKey: 'navAiAssistant', action: () => navigate('/ai-assistant') },
    { icon: '📚', labelKey: 'navCollections', action: () => navigate('/collections') },
    { icon: 'ℹ️', labelKey: 'navAbout', action: () => navigate('/about') },
  ];

  const materialCategories = [
    { nameKey: 'wood', icon: '🪵' },
    { nameKey: 'metal', icon: '⚙️' },
    { nameKey: 'plastic', icon: '🥤' },
    { nameKey: 'electronics', icon: '🔋' },
    { nameKey: 'others', icon: '📦' },
  ];

  const safetyItems = [
    { title: 'useProtectiveGear', desc: 'useProtectiveGearDesc', icon: '🥽' },
    { title: 'checkToolConditions', desc: 'checkToolConditionsDesc', icon: '🔧' },
    { title: 'workInSafeArea', desc: 'workInSafeAreaDesc', icon: '⚠️' },
  ];

  const handleAskSubmit = (e) => {
    e.preventDefault();
    if (askInput.trim()) setIsAiModalOpen(true);
  };

  const handleDirectBlueprintSubmit = (e) => {
    e.preventDefault();
    if (directNameInput.trim()) {
      setActiveView('generator-by-name');
    }
  };

  return (
    <div className="flex flex-1 w-full text-[#d8c4a0]" style={{ backgroundColor: '#080503', fontFamily: 'Lato, sans-serif' }}>

      {/* ── Premium Left Sidebar ─────────────────────────────── */}
      <aside className="w-56 flex-shrink-0 border-r border-[#3d2510] overflow-y-auto relative" style={{ background: 'linear-gradient(180deg, #120a05 0%, #040201 100%)' }}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#8b6914] to-transparent" />
        <div className="p-4 space-y-1 mt-2">
          {sidebarLinks.map((link, idx) => (
            <button
              key={idx}
              onClick={link.action}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs transition-all duration-200 ${
                link.active && activeView === 'dashboard'
                  ? 'bg-gradient-to-r from-[#2a1a0e] to-[#1a1008] text-[#c9a84c] border border-[#5c4020] shadow-md shadow-[#5c4020]/20'
                  : 'text-[#8a7355] hover:bg-[#1a1008] hover:text-[#d8c4a0] hover:translate-x-1'
              }`}
            >
              <span className="text-base">{link.icon}</span>
              <span className="font-semibold tracking-wide">{t(link.labelKey)}</span>
            </button>
          ))}
        </div>
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <div className="rounded-xl border border-[#2a1a0e] bg-black/30 p-3 text-center">
            <p className="text-[9px] font-bold text-[#3d2510] uppercase tracking-widest">Creaforge</p>
            <p className="text-[8px] text-[#2a1a0e] mt-1">Workshop Edition</p>
          </div>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────── */}
      {activeView === 'generator' ? (
        <ThingGenerator onBack={() => setActiveView('dashboard')} />
      ) : activeView === 'generator-by-name' ? (
        <ThingGenerator onBack={() => setActiveView('dashboard')} initialName={directNameInput} />
      ) : (
        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ── Hero Banner ───────────────────────────────────── */}
          <div className="relative w-full rounded-2xl overflow-hidden border border-[#5c4020] shadow-[0_8px_40px_rgba(0,0,0,0.8)]" style={{ background: '#120a05', minHeight: '240px' }}>
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-gradient-to-r from-[#120a05] via-[#120a05]/90 to-[#120a05]/40 z-10" />
              <div className="w-full h-full opacity-35 mix-blend-luminosity bg-center bg-cover" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=800&auto=format&fit=crop')" }} />
              <div className="absolute inset-0 z-20 animate-gradient-x" style={{ background: 'linear-gradient(90deg, transparent, rgba(139,105,20,0.04), transparent)', backgroundSize: '200% 100%' }} />
            </div>
            <div className="relative z-10 p-8">
              <div className="flex items-center gap-4 mb-1">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#8b6914] opacity-60" />
                <h2 className="text-3xl font-bold tracking-[0.25em]" style={{ fontFamily: 'Cinzel, serif', color: '#d8c4a0' }}>
                  {t('thingMakerHeader')}
                </h2>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#8b6914] opacity-60" />
              </div>
              <p className="text-center text-[10px] tracking-[0.4em] text-[#8b6914] mb-4 font-bold uppercase">{t('thingMakerSubtitle')}</p>

              {/* Direct Name Input */}
              <form onSubmit={handleDirectBlueprintSubmit} className="max-w-xl mx-auto mb-5">
                <div className="relative group">
                  <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#c9a84c] transition-all group-focus-within:text-[#f2e8d0]" />
                  <input
                    type="text"
                    value={directNameInput}
                    onChange={e => setDirectNameInput(e.target.value)}
                    placeholder="What do you want to build? (e.g. Solar Lamp, Phone Stand...)"
                    className="w-full bg-black/60 border border-[#5c4020] rounded-2xl py-3.5 pl-11 pr-36 text-sm text-[#f2e8d0] placeholder:text-[#5c4020] focus:outline-none focus:border-[#c9a84c] transition-all"
                    style={{ boxShadow: '0 0 0 0 rgba(200,168,76,0)', transition: 'border-color 0.3s, box-shadow 0.3s' }}
                    onFocus={e => e.target.style.boxShadow = '0 0 20px rgba(200,168,76,0.15)'}
                    onBlur={e => e.target.style.boxShadow = '0 0 0 0 rgba(200,168,76,0)'}
                  />
                  <button
                    type="submit"
                    disabled={!directNameInput.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-40"
                    style={{ background: 'linear-gradient(135deg, #8b6914, #c9a84c)', color: '#0a0502' }}
                  >
                    <Search className="h-3 w-3" />
                    Get Blueprint
                  </button>
                </div>
              </form>

              <p className="text-center text-[11px] text-[#c4a882] max-w-3xl mx-auto leading-loose" data-translate="thingMakerBannerDesc">
                {t('thingMakerBannerDesc')}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
                <button onClick={() => setActiveView('generator')} className="group flex flex-col items-center justify-center w-36 h-28 rounded-xl border border-[#8b6914] bg-gradient-to-b from-[#251808] to-[#120a05] hover:from-[#3d2510] hover:to-[#1a1008] transition-all hover:-translate-y-2 shadow-lg">
                  <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">🔨</span>
                  <span className="text-xs font-bold text-[#d8c4a0]">{t('newProject')}</span>
                  <span className="text-[9px] text-[#8a7355] mt-1">{t('startFromScratch')}</span>
                </button>
                <button onClick={() => setIsAiModalOpen(true)} className="group flex flex-col items-center justify-center w-36 h-28 rounded-xl border border-[#c9a84c] bg-gradient-to-b from-[#3d2510] to-[#1f140a] hover:from-[#5c4020] hover:to-[#2a1a0e] transition-all hover:-translate-y-2 shadow-[0_0_25px_rgba(200,168,76,0.2)]">
                  <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">🤖</span>
                  <span className="text-xs font-bold text-[#f2e8d0]">{t('aiIdeaGenerator')}</span>
                  <span className="text-[9px] text-[#d4c49a] mt-1">{t('getSmartSuggestions')}</span>
                </button>
                <button onClick={() => alert('Blueprint import requires the Pro Version!')} className="group flex flex-col items-center justify-center w-36 h-28 rounded-xl border border-[#3d2510] bg-gradient-to-b from-[#1a1008] to-[#0a0502] hover:from-[#251808] hover:to-[#120a05] transition-all hover:-translate-y-2 opacity-70 hover:opacity-100">
                  <span className="text-2xl mb-2">📐</span>
                  <span className="text-xs font-bold text-[#d8c4a0]">{t('importBlueprint')}</span>
                  <span className="text-[9px] text-[#8a7355] mt-1">{t('requiresPro')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── AI Suggested Projects (Real Blueprints) ─────────── */}
          <div className="rounded-2xl border border-[#3d2510] glass-glow p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold tracking-widest text-[#8a7355] uppercase">{t('aiSuggestedProjects')}</h3>
              <button onClick={() => navigate('/collections')} className="text-[10px] text-[#c9a84c] hover:underline">{t('viewAll')}</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {preloadedThings.map((proj, idx) => (
                <div
                  key={proj.id}
                  onClick={() => setSelectedBlueprint(proj)}
                  onMouseEnter={() => setHoveredCard(idx)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="group rounded-xl overflow-hidden border cursor-pointer shadow-md transition-all duration-500"
                  style={{
                    background: '#1a1008',
                    borderColor: hoveredCard === idx ? '#c9a84c' : '#2a1a0e',
                    transform: visibleCards.includes(idx)
                      ? hoveredCard === idx ? 'translateY(-6px) scale(1.02)' : 'translateY(0) scale(1)'
                      : 'translateY(20px) scale(0.95)',
                    opacity: visibleCards.includes(idx) ? 1 : 0,
                    boxShadow: hoveredCard === idx ? '0 20px 40px rgba(0,0,0,0.6), 0 0 20px rgba(200,168,76,0.15)' : '0 4px 12px rgba(0,0,0,0.4)',
                  }}
                >
                  <div className="h-32 w-full relative overflow-hidden">
                    <img src={proj.image} alt={proj.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" style={{ opacity: 0.85 }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1008] via-transparent to-transparent" />
                    <span className="absolute top-2 right-2 text-[8px] font-bold px-1.5 py-0.5 rounded border" style={{ background: 'rgba(0,0,0,0.7)', borderColor: '#5c4020', color: '#c9a84c' }}>
                      {proj.levelKey}
                    </span>
                    <div className="absolute bottom-0 left-0 right-0 p-2 flex items-center justify-between">
                      <span className="text-[8px] text-[#c4a882] font-bold">{proj.category}</span>
                      <span className="text-[8px] text-[#c9a84c]">★ {proj.rating}</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="text-xs font-bold text-[#d8c4a0] mb-1.5 leading-tight">{proj.title}</h4>
                    <div className="flex items-center justify-between text-[9px] text-[#8a7355]">
                      <span>⏱ {proj.estimatedTime}</span>
                      <span className="flex items-center gap-1 font-bold" style={{ color: '#c9a84c' }}>
                        View Blueprint <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Middle Grid ───────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* My Workbench */}
            <div className="col-span-4 rounded-2xl border border-[#3d2510] glass-glow p-5">
              <h3 className="text-xs font-bold tracking-widest text-[#8a7355] uppercase mb-4">{t('myWorkbench')}</h3>
              <div className="flex gap-4">
                <div className="w-20 h-24 rounded-xl border border-[#5c4020] bg-[#0a0502] overflow-hidden flex-shrink-0 flex items-center justify-center text-4xl">⏱️</div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-[9px] text-[#8a7355] uppercase tracking-wider mb-1">{t('currentProject')}</p>
                    <h4 className="text-sm font-bold text-[#d8c4a0] truncate">{latestProject?.data?.title || 'No Projects Yet'}</h4>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[10px] text-[#c4a882] mb-1.5">
                        <span>{latestProject ? 'Blueprint Saved' : 'Start your first project!'}</span>
                      </div>
                      <div className="h-2 w-full bg-[#2a1a0e] rounded-full overflow-hidden">
                        <div className="h-full rounded-full animate-gradient-x" style={{ width: latestProject ? '100%' : '0%', background: 'linear-gradient(90deg, #5c4020, #c9a84c, #8b6914)', backgroundSize: '200% 100%' }} />
                      </div>
                    </div>
                  </div>
                  <button onClick={() => latestProject ? navigate('/collections') : setActiveView('generator')} className="w-full py-2.5 mt-3 rounded-xl bg-gradient-to-r from-[#8b6914] to-[#c9a84c] text-[#0a0502] text-xs font-bold hover:opacity-90 transition-opacity shadow-md">
                    {latestProject ? 'View Archives' : t('continueBuilding')}
                  </button>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[#2a1a0e] grid grid-cols-3 gap-2">
                {[
                  { labelKey: 'projectsBuilt', value: '12' },
                  { labelKey: 'inProgress', value: '4' },
                  { labelKey: 'ideasSaved', value: '18' },
                ].map((stat, i) => (
                  <div key={i} className={`text-center ${i === 1 ? 'border-l border-r border-[#2a1a0e]' : ''}`}>
                    <p className="text-[8px] text-[#8a7355]">{t(stat.labelKey)}</p>
                    <p className="text-lg font-bold text-[#d8c4a0]">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Materials Inventory */}
            <div className="col-span-8 rounded-2xl border border-[#3d2510] glass-glow p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold tracking-widest text-[#8a7355] uppercase">{t('materialsInventory')}</h3>
                <button onClick={() => setIsToolsWindowOpen(true)} className="text-[10px] text-[#c9a84c] hover:underline">View Tools</button>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {materialCategories.map((mat, idx) => (
                  <div key={idx} onClick={() => setActiveView('generator')} className="group rounded-xl bg-[#1a1008] border border-[#2a1a0e] p-4 flex flex-col items-center justify-center gap-2 hover:bg-[#251808] hover:border-[#5c4020] cursor-pointer transition-all hover:-translate-y-1">
                    <span className="text-2xl group-hover:scale-110 transition-transform">{mat.icon}</span>
                    <span className="text-[10px] font-bold text-[#c4a882]">{t(mat.nameKey)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Bottom Row ────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
            {/* AI Assistant Widget */}
            <div className="rounded-2xl border border-[#5c4020] bg-gradient-to-b from-[#1a1008] to-[#060402] p-5 relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                <img src="/steampunk-robot.png" alt="Robot bg" className="w-48 h-48 object-cover" />
              </div>
              <div className="absolute top-0 left-0 w-40 h-40 rounded-full bg-[#8b6914]/5 blur-3xl pointer-events-none" />
              <h3 className="text-xs font-bold tracking-widest text-[#c9a84c] uppercase mb-4 relative z-10">{t('aiAssistantWidget')}</h3>
              <div className="flex gap-4 relative z-10">
                <div className="w-20 h-20 flex-shrink-0">
                  <img src="/steampunk-robot.png" alt="Robot" className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(200,168,76,0.4)]" />
                </div>
                <div className="flex-1 space-y-3">
                  <p className="text-[11px] text-[#d8c4a0] leading-relaxed" data-translate="aiCreatorGreeting">{t('aiCreatorGreeting')}</p>
                  <div className="space-y-2">
                    {[{ key: 'suggestProjectMaterials' }, { key: 'helpImproveDesign' }, { key: 'checkSafetyProject' }].map((item, i) => (
                      <button key={i} onClick={() => setIsAiModalOpen(true)} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-black/40 border border-[#3d2510] hover:border-[#8b6914] hover:bg-black/60 transition-all text-[10px] text-[#c4a882] group">
                        <span>{t(item.key)}</span>
                        <ChevronRight className="h-3 w-3 text-[#8b6914] group-hover:translate-x-1 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <form onSubmit={handleAskSubmit} className="mt-4 relative z-10">
                <div className="relative">
                  <input
                    type="text"
                    value={askInput}
                    onChange={e => setAskInput(e.target.value)}
                    placeholder={t('askAnything')}
                    className="w-full bg-black/50 border border-[#3d2510] rounded-xl py-3 pl-4 pr-10 text-xs text-[#d8c4a0] placeholder:text-[#5c4020] focus:outline-none focus:border-[#8b6914] transition-colors"
                  />
                  <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[#8b6914] hover:text-[#c9a84c] transition-colors">
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </form>
            </div>

            {/* Safety First */}
            <div className="rounded-2xl border border-[#3d2510] glass-glow p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold tracking-widest text-[#8a7355] uppercase mb-5 text-center">{t('safetyFirst')}</h3>
                <div className="grid grid-cols-1 gap-4">
                  {safetyItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[#1a1008] border border-[#2a1a0e] hover:border-[#3d2510] transition-colors">
                      <div className="text-xl mt-0.5 opacity-90">{item.icon}</div>
                      <div>
                        <p className="text-[11px] font-bold text-[#d8c4a0]" data-translate={item.title}>{t(item.title)}</p>
                        <p className="text-[10px] text-[#8a7355] mt-1 leading-relaxed" data-translate={item.desc}>{t(item.desc)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => alert(t('useProtectiveGearDesc') + '\n\n' + t('checkToolConditionsDesc') + '\n\n' + t('workInSafeAreaDesc'))}
                className="w-full py-3 mt-4 rounded-xl border border-[#2a1a0e] hover:border-[#5c4020] bg-black/30 hover:bg-black/50 text-[#c4a882] text-xs transition-all hover:-translate-y-0.5"
              >
                {t('viewSafetyGuide')}
              </button>
            </div>
          </div>
        </main>
      )}

      {isAiModalOpen && <AIAssistantModal onClose={() => setIsAiModalOpen(false)} context="thing" />}
      {selectedBlueprint && (
        <BlueprintModal
          blueprint={selectedBlueprint}
          type="thing"
          onClose={() => setSelectedBlueprint(null)}
          onNavigate={() => { setSelectedBlueprint(null); setActiveView('generator'); }}
        />
      )}
      <SmallWindowModal title="My Tools" isOpen={isToolsWindowOpen} onClose={() => setIsToolsWindowOpen(false)}>
        <div className="space-y-3">
          <p className="text-[10px] text-[#8a7355] mb-2">Here are the tools currently available in your workshop inventory:</p>
          <div className="flex flex-wrap gap-2">
            {['Hammer', 'Screwdriver', 'Pliers', 'Measuring Tape', 'Utility Knife', 'Safety Glasses', 'Wrench', 'Level', 'Wood Glue', 'Sandpaper'].map((tool, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full bg-[#1a1008] border border-[#2a1a0e] text-[#c4a882] text-xs font-medium">
                {tool}
              </span>
            ))}
          </div>
          <button onClick={() => { setIsToolsWindowOpen(false); setActiveView('generator'); }} className="w-full py-2 mt-4 rounded border border-[#5c4020] bg-[#1f140a] hover:bg-[#2a1a0e] text-[#d8c4a0] text-[11px] font-bold transition-colors">
            Manage Full Inventory
          </button>
        </div>
      </SmallWindowModal>
    </div>
  );
}
