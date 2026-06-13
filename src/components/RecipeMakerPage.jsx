import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Send, Sparkles, Search } from 'lucide-react';
import AIAssistantModal from './AIAssistantModal';
import RecipeGenerator from './RecipeGenerator';
import BlueprintModal from './BlueprintModal';
import SmallWindowModal from './SmallWindowModal';
import { useLanguage } from '../utils/LanguageContext';
import { creationsService } from '../services/creationsService';
import { preloadedRecipes } from '../utils/preloadedRecipes';

const SUGGESTED_RECIPES = preloadedRecipes.slice(0, 4).map((r, i) => ({
  ...r,
  time: r.totalTime,
  difficultyKey: r.healthClassification || 'Medium',
  rating: ['4.8', '4.7', '4.9', '4.6'][i] || '4.5',
  reviews: ['128', '93', '157', '112'][i] || '100',
  image: [
    'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1563379091339-03246963d637?w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&auto=format&fit=crop',
  ][i],
}));

export default function RecipeMakerPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [latestRecipe, setLatestRecipe] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [directNameInput, setDirectNameInput] = useState('');
  const [askInput, setAskInput] = useState('');
  const [selectedBlueprint, setSelectedBlueprint] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [visibleCards, setVisibleCards] = useState([]);
  const [isPantryWindowOpen, setIsPantryWindowOpen] = useState(false);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const data = await creationsService.fetchAll();
        const recipes = data.filter(c => c.type === 'recipe');
        if (recipes.length > 0) setLatestRecipe(recipes[0]);
      } catch (e) {
        console.error('Failed to fetch latest recipe', e);
      }
    };
    fetchLatest();
  }, []);

  // Stagger card entrance animation
  useEffect(() => {
    const timers = SUGGESTED_RECIPES.map((_, i) =>
      setTimeout(() => setVisibleCards(prev => [...prev, i]), 100 + i * 120)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const sidebarLinks = [
    { icon: '🏠', labelKey: 'navHome', action: () => setActiveView('dashboard'), active: true },
    { icon: '🍲', labelKey: 'savedRecipes', action: () => navigate('/collections') },
    { icon: '🍳', labelKey: 'newRecipe', action: () => setActiveView('generator') },
    { icon: '🤖', labelKey: 'navAiAssistant', action: () => navigate('/ai-assistant') },
    { icon: '📚', labelKey: 'navCollections', action: () => navigate('/collections') },
    { icon: 'ℹ️', labelKey: 'navAbout', action: () => navigate('/about') },
  ];

  const ingredientCategories = [
    { nameKey: 'vegetables', icon: '🥕' },
    { nameKey: 'meats', icon: '🥩' },
    { nameKey: 'dairy', icon: '🧀' },
    { nameKey: 'spices', icon: '🌶️' },
    { nameKey: 'others', icon: '🥫' },
  ];

  const mealPlanData = [
    { dayKey: 'today', meal: 'Thai Basil Chicken', type: 'Dinner' },
    { dayKey: 'tomorrow', meal: 'Oatmeal Pancakes', type: 'Breakfast' },
    { dayKey: '', meal: 'Vegan Curry', type: 'Lunch' },
  ];

  const handleDirectRecipeSubmit = (e) => {
    e.preventDefault();
    if (directNameInput.trim()) setActiveView('generator-by-name');
  };

  const handleAskSubmit = (e) => {
    e.preventDefault();
    if (askInput.trim()) setIsAiModalOpen(true);
  };

  return (
    <div className="flex flex-1 w-full text-[#e8d9b8]" style={{ backgroundColor: '#0f0a07', fontFamily: 'Lato, sans-serif' }}>

      {/* ── Premium Left Sidebar ────────────────────────────── */}
      <aside className="w-56 flex-shrink-0 border-r border-[#5c4020] overflow-y-auto relative" style={{ background: 'linear-gradient(180deg, #1f140a 0%, #0a0604 100%)' }}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a84c] to-transparent" />
        <div className="p-4 space-y-1 mt-2">
          {sidebarLinks.map((link, idx) => (
            <button
              key={idx}
              onClick={link.action}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs transition-all duration-200 ${
                link.active && activeView === 'dashboard'
                  ? 'bg-gradient-to-r from-[#3d2510] to-[#2a1a0e] text-[#f2e8d0] border border-[#8b6914] shadow-md shadow-[#8b6914]/20'
                  : 'text-[#8a7355] hover:bg-[#1a1008] hover:text-[#d4c49a] hover:translate-x-1'
              }`}
            >
              <span className="text-base">{link.icon}</span>
              <span className="font-semibold tracking-wide">{t(link.labelKey)}</span>
            </button>
          ))}
        </div>
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <div className="rounded-xl border border-[#3d2510] bg-black/30 p-3 text-center">
            <p className="text-[9px] font-bold text-[#5c4020] uppercase tracking-widest">Creaforge</p>
            <p className="text-[8px] text-[#3d2510] mt-1">Kitchen Edition</p>
          </div>
        </div>
      </aside>

      {/* ── Main Content ──────────────────────────────────────── */}
      {activeView === 'generator' ? (
        <RecipeGenerator onBack={() => setActiveView('dashboard')} />
      ) : activeView === 'generator-by-name' ? (
        <RecipeGenerator onBack={() => setActiveView('dashboard')} initialName={directNameInput} />
      ) : (
        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ── Hero Banner ─────────────────────────── */}
          <div className="relative w-full rounded-2xl overflow-hidden border border-[#8b6914] shadow-[0_8px_40px_rgba(0,0,0,0.7)]" style={{ background: '#1f140a', minHeight: '240px' }}>
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-gradient-to-r from-[#1f140a] via-[#1f140a]/90 to-[#1f140a]/40 z-10" />
              <div className="w-full h-full opacity-40 mix-blend-overlay bg-center bg-cover" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=800&auto=format&fit=crop')" }} />
              <div className="absolute inset-0 z-20 animate-gradient-x" style={{ background: 'linear-gradient(90deg, transparent, rgba(200,168,76,0.03), transparent)', backgroundSize: '200% 100%' }} />
            </div>

            <div className="relative z-10 p-8">
              <div className="flex items-center gap-4 mb-1">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#c9a84c] opacity-60" />
                <h2 className="text-3xl font-bold tracking-[0.25em] text-gradient-brass" style={{ fontFamily: 'Cinzel, serif' }}>
                  {t('recipeMakerHeader')}
                </h2>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#c9a84c] opacity-60" />
              </div>
              <p className="text-center text-[10px] tracking-[0.4em] text-[#c9a84c] mb-4 font-bold uppercase">{t('recipeMakerSubtitle')}</p>

              {/* Direct Dish Name Input */}
              <form onSubmit={handleDirectRecipeSubmit} className="max-w-xl mx-auto mb-5">
                <div className="relative group">
                  <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#c9a84c] transition-all group-focus-within:text-[#f2e8d0]" />
                  <input
                    type="text"
                    value={directNameInput}
                    onChange={e => setDirectNameInput(e.target.value)}
                    placeholder="What do you want to cook? (e.g. Butter Chicken, Pasta...)"
                    className="w-full bg-black/60 border border-[#5c4020] rounded-2xl py-3.5 pl-11 pr-36 text-sm text-[#f2e8d0] placeholder:text-[#5c4020] focus:outline-none focus:border-[#c9a84c] transition-all"
                    onFocus={e => e.target.style.boxShadow = '0 0 20px rgba(200,168,76,0.15)'}
                    onBlur={e => e.target.style.boxShadow = 'none'}
                  />
                  <button
                    type="submit"
                    disabled={!directNameInput.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-40"
                    style={{ background: 'linear-gradient(135deg, #8b6914, #c9a84c)', color: '#0a0502' }}
                  >
                    <Search className="h-3 w-3" />
                    Get Recipe
                  </button>
                </div>
              </form>

              <p className="text-center text-[12px] text-[#d4c49a] max-w-3xl mx-auto leading-loose" data-translate="recipeMakerBannerDesc">
                {t('recipeMakerBannerDesc')}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
                <button onClick={() => setActiveView('generator')} className="group flex flex-col items-center justify-center w-36 h-28 rounded-xl border border-[#c9a84c] bg-gradient-to-b from-[#3d2510] to-[#1f140a] hover:from-[#5c3a18] hover:to-[#2a1a0e] transition-all hover:-translate-y-2 shadow-lg shadow-[#8b6914]/20 hover:shadow-[#c9a84c]/30">
                  <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">🍳</span>
                  <span className="text-xs font-bold text-[#f2e8d0]">{t('newRecipe')}</span>
                  <span className="text-[9px] text-[#d4c49a] mt-1">{t('startCooking')}</span>
                </button>
                <button onClick={() => setIsAiModalOpen(true)} className="group flex flex-col items-center justify-center w-36 h-28 rounded-xl border border-[#f2e8d0] bg-gradient-to-b from-[#5c4020] to-[#2a1a0e] hover:from-[#8b6914] hover:to-[#3d2510] transition-all hover:-translate-y-2 shadow-[0_0_25px_rgba(200,168,76,0.25)]">
                  <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">🤖</span>
                  <span className="text-xs font-bold text-[#ffffff]">{t('aiRecipeGenerator')}</span>
                  <span className="text-[9px] text-[#f2e8d0] mt-1">{t('getSmartIdeas')}</span>
                </button>
                <button onClick={() => navigate('/collections')} className="group flex flex-col items-center justify-center w-36 h-28 rounded-xl border border-[#8b6914] bg-gradient-to-b from-[#2a1a0e] to-[#0f0a07] hover:from-[#3d2510] hover:to-[#1a1008] transition-all hover:-translate-y-2 shadow-lg">
                  <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">📚</span>
                  <span className="text-xs font-bold text-[#d4c49a]">{t('navCollections')}</span>
                  <span className="text-[9px] text-[#8a7355] mt-1">View Saved</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── AI Recommended Recipes (Real Blueprints) ────────────────────────── */}
          <div className="rounded-2xl border border-[#5c4020] glass-glow p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold tracking-widest text-[#c9a84c] uppercase">{t('aiRecommendedRecipes')}</h3>
              <button onClick={() => navigate('/collections')} className="text-[10px] text-[#e8d9b8] hover:text-[#c9a84c] transition-colors">{t('viewAll')}</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {SUGGESTED_RECIPES.map((rec, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedBlueprint(rec)}
                  onMouseEnter={() => setHoveredCard(idx)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="group rounded-xl overflow-hidden border cursor-pointer shadow-md transition-all duration-500"
                  style={{
                    background: '#251808',
                    borderColor: hoveredCard === idx ? '#c9a84c' : '#3d2510',
                    transform: visibleCards.includes(idx)
                      ? hoveredCard === idx ? 'translateY(-6px) scale(1.02)' : 'translateY(0)'
                      : 'translateY(20px)',
                    opacity: visibleCards.includes(idx) ? 1 : 0,
                    boxShadow: hoveredCard === idx ? '0 20px 40px rgba(0,0,0,0.5), 0 0 20px rgba(200,168,76,0.12)' : '0 4px 12px rgba(0,0,0,0.4)',
                  }}
                >
                  <div className="h-28 w-full relative overflow-hidden bg-[#0a0604]">
                    <img
                      src={rec.image}
                      alt={rec.title}
                      className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#251808] via-transparent to-transparent" />
                    <div className="absolute bottom-1 left-2 right-2 flex justify-between items-end">
                      <span className="text-[8px] font-bold text-[#c9a84c]">★ {rec.rating}</span>
                      <span className="text-[8px] text-[#c4a882]">({rec.reviews})</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="text-xs font-bold text-[#e8d9b8] mb-2 leading-tight">{rec.title}</h4>
                    <div className="flex items-center justify-between text-[9px] mb-2">
                      <span className="px-2 py-0.5 rounded-full bg-[#1a1008] border border-[#3d2510] text-[#d4c49a]">{rec.time}</span>
                      <span className="text-[#8a7355]">{rec.difficultyKey}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[#8a7355]">
                      <span className="text-[#c9a84c] font-bold text-[9px]">View Blueprint</span>
                      <ChevronRight className="h-3 w-3 group-hover:text-[#c9a84c] transition-colors" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Bottom Grid ───────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-6">

            {/* Left Column (8/12) */}
            <div className="md:col-span-8 space-y-6">

              {/* Recipe In Progress */}
              <div className="rounded-2xl border border-[#5c4020] glass-glow p-5">
                <h3 className="text-xs font-bold tracking-widest text-[#c9a84c] uppercase mb-4">{t('recipeInProgress')}</h3>
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-xl border border-[#8b6914] bg-[#0a0502] overflow-hidden flex-shrink-0 flex items-center justify-center text-4xl shadow-inner">🍕</div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-[9px] text-[#8a7355] uppercase tracking-wider mb-1">{t('cookingNow')}</p>
                      <h4 className="text-sm font-bold text-[#e8d9b8] truncate">{latestRecipe?.data?.title || 'No Recipes Yet'}</h4>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-[10px] text-[#d4c49a] mb-1.5">
                          <span>{latestRecipe ? 'Recipe Saved' : 'Start cooking!'}</span>
                        </div>
                        <div className="h-2 w-full bg-[#120a05] rounded-full overflow-hidden">
                          <div className="h-full rounded-full animate-gradient-x" style={{ width: latestRecipe ? '100%' : '0%', background: 'linear-gradient(90deg, #8b6914, #f2e8d0, #c9a84c)', backgroundSize: '200% 100%' }} />
                        </div>
                      </div>
                    </div>
                    <button onClick={() => latestRecipe ? navigate('/collections') : setActiveView('generator')} className="w-full py-2.5 mt-3 rounded-xl bg-gradient-to-r from-[#8b6914] to-[#c9a84c] text-[#0f0a07] text-xs font-bold hover:opacity-90 transition-opacity shadow-md shadow-[#8b6914]/30">
                      {latestRecipe ? 'View Archives' : t('continueCooking')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Ingredients You Have */}
              <div className="rounded-2xl border border-[#5c4020] glass-glow p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold tracking-widest text-[#c9a84c] uppercase">{t('ingredientsYouHave')}</h3>
                  <button onClick={() => setIsPantryWindowOpen(true)} className="text-[10px] text-[#e8d9b8] hover:text-[#c9a84c] transition-colors">View Pantry</button>
                </div>
                <div className="grid grid-cols-5 gap-3">
                  {ingredientCategories.map((ing, idx) => (
                    <div key={idx} onClick={() => setActiveView('generator')} className="group rounded-xl bg-[#251808] border border-[#3d2510] p-3 flex flex-col items-center justify-center gap-2 hover:bg-[#3d2510] hover:border-[#8b6914] cursor-pointer transition-all hover:-translate-y-1">
                      <span className="text-2xl group-hover:scale-110 transition-transform">{ing.icon}</span>
                      <span className="text-[10px] font-bold text-[#d4c49a] text-center">{t(ing.nameKey)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Chef Assistant */}
              <div className="rounded-2xl border border-[#8b6914] bg-gradient-to-br from-[#2a1a0e] to-[#0f0a07] p-5 relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                  <img src="/steampunk-robot.png" alt="Chef bg" className="w-48 h-48 object-cover" />
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#c9a84c]/5 blur-2xl pointer-events-none" />
                <h3 className="text-xs font-bold tracking-widest text-[#f2e8d0] uppercase mb-4 relative z-10">{t('aiChefAssistant')}</h3>
                <div className="flex gap-4 relative z-10">
                  <div className="w-16 h-16 flex-shrink-0 bg-gradient-to-br from-[#3d2510] to-[#1a1008] rounded-full flex items-center justify-center border-2 border-[#8b6914] shadow-md shadow-[#8b6914]/20">
                    <span className="text-3xl">👨‍🍳</span>
                  </div>
                  <div className="flex-1 space-y-3">
                    <p className="text-[11px] text-[#e8d9b8] leading-relaxed" data-translate="aiChefGreeting">{t('aiChefGreeting')}</p>
                    <div className="space-y-2">
                      {[{ key: 'suggestRecipe' }, { key: 'findSubstitute' }].map((item, i) => (
                        <button key={i} onClick={() => setIsAiModalOpen(true)} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-black/30 border border-[#5c4020] hover:border-[#c9a84c] hover:bg-black/50 transition-all text-[10px] text-[#d4c49a] group">
                          <span>{t(item.key)}</span>
                          <ChevronRight className="h-3 w-3 text-[#c9a84c] group-hover:translate-x-1 transition-transform" />
                        </button>
                      ))}
                    </div>
                    {/* Ask anything input */}
                    <form onSubmit={handleAskSubmit} className="relative">
                      <input
                        type="text"
                        value={askInput}
                        onChange={e => setAskInput(e.target.value)}
                        placeholder="Ask the AI Chef anything..."
                        className="w-full bg-black/50 border border-[#3d2510] rounded-xl py-2.5 pl-3 pr-9 text-[11px] text-[#e8d9b8] placeholder:text-[#5c4020] focus:outline-none focus:border-[#8b6914] transition-colors"
                      />
                      <button type="submit" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8b6914] hover:text-[#c9a84c]">
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (4/12) */}
            <div className="md:col-span-4 space-y-6">

              {/* Pantry Overview */}
              <div className="rounded-2xl border border-[#3d2510] glass-glow p-5">
                <h3 className="text-xs font-bold tracking-widest text-[#8a7355] uppercase mb-4 text-center">{t('pantryOverview')}</h3>
                <div className="flex items-center justify-center gap-8 py-3">
                  {[{ label: t('spices'), value: '85%', color: '#8b6914' }, { label: 'Fresh', value: '42%', color: '#c9a84c' }].map((item, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className="relative w-16 h-16">
                        <div className="w-16 h-16 rounded-full border-4 flex items-center justify-center bg-[#0a0502]" style={{ borderColor: item.color }}>
                          <span className="text-sm font-bold" style={{ color: item.color }}>{item.value}</span>
                        </div>
                        <div className="absolute inset-0 rounded-full blur-md opacity-20" style={{ background: item.color }} />
                      </div>
                      <span className="text-[9px] text-[#8a7355]">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Meal Plan */}
              <div className="rounded-2xl border border-[#3d2510] glass-glow p-5">
                <h3 className="text-xs font-bold tracking-widest text-[#8a7355] uppercase mb-4 text-center">{t('mealPlan')}</h3>
                <div className="space-y-2.5">
                  {mealPlanData.map((plan, i) => (
                    <div key={i} className="flex items-center justify-between bg-[#1a1008] p-2.5 rounded-xl border border-[#2a1a0e] hover:border-[#3d2510] transition-colors">
                      <div>
                        <p className="text-[9px] text-[#8b6914] font-bold">{plan.dayKey ? t(plan.dayKey) : 'Wed'}</p>
                        <p className="text-[10px] font-bold text-[#d8c4a0]">{plan.meal}</p>
                      </div>
                      <span className="text-[8px] bg-[#251808] border border-[#3d2510] text-[#c4a882] px-2 py-0.5 rounded-full">{plan.type}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nutrition Insights */}
              <div className="rounded-2xl border border-[#3d2510] glass-glow p-5">
                <h3 className="text-xs font-bold tracking-widest text-[#8a7355] uppercase mb-4 text-center">{t('nutritionInsights')}</h3>
                <div className="h-24 w-full flex items-end justify-between px-2 gap-1.5 border-b border-[#2a1a0e] pb-2">
                  {[40, 70, 45, 90, 60, 30, 80].map((h, i) => (
                    <div key={i} className="w-full rounded-t transition-all hover:opacity-100 opacity-70 cursor-pointer" style={{ height: `${h}%`, background: 'linear-gradient(to top, #5c4020, #c9a84c)' }} />
                  ))}
                </div>
                <div className="flex justify-between px-2 mt-2">
                  <span className="text-[8px] text-[#8a7355]">Mon</span>
                  <span className="text-[8px] text-[#8a7355]">Sun</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {isAiModalOpen && <AIAssistantModal onClose={() => setIsAiModalOpen(false)} context="recipe" />}
      {selectedBlueprint && (
        <BlueprintModal
          blueprint={selectedBlueprint}
          type="recipe"
          onClose={() => setSelectedBlueprint(null)}
          onNavigate={() => { setSelectedBlueprint(null); setActiveView('generator'); }}
        />
      )}
      <SmallWindowModal title="My Pantry" isOpen={isPantryWindowOpen} onClose={() => setIsPantryWindowOpen(false)}>
        <div className="space-y-3">
          <p className="text-[10px] text-[#8a7355] mb-2">Here are the ingredients currently available in your local pantry storage:</p>
          <div className="flex flex-wrap gap-2">
            {['Garlic', 'Olive Oil', 'Salt', 'Black Pepper', 'Onions', 'Tomatoes', 'Chicken Breast', 'Pasta', 'Eggs', 'Butter'].map((ing, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full bg-[#251808] border border-[#3d2510] text-[#d4c49a] text-xs font-medium">
                {ing}
              </span>
            ))}
          </div>
          <button onClick={() => { setIsPantryWindowOpen(false); setActiveView('generator'); }} className="w-full py-2 mt-4 rounded border border-[#8b6914] bg-[#2a1a0e] hover:bg-[#3d2510] text-[#c9a84c] text-[11px] font-bold transition-colors">
            Manage Full Pantry
          </button>
        </div>
      </SmallWindowModal>
    </div>
  );
}
