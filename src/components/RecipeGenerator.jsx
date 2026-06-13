import React, { useState, useMemo, useEffect } from 'react';
import { ChefHat, Plus, X, PlayCircle, Bot, Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import AIAssistantDrawer from './AIAssistantDrawer';
import { aiService } from '../services/aiService';
import { INGREDIENTS } from '../utils/ingredientsList';
import { youtubeService } from '../services/youtubeService';
import { creationsService } from '../services/creationsService';
import { useLanguage } from '../utils/LanguageContext';

export default function RecipeGenerator({ onBack, initialName = '' }) {
  const { t } = useLanguage();
  const [ingredients, setIngredients] = useState([]);
  const [inputText, setInputText] = useState('');
  const [dishName, setDishName] = useState(initialName);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState(null);

  useEffect(() => {
    if (initialName && initialName.trim()) {
      handleGenerateByName(initialName.trim());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredIngredients = useMemo(() => {
    if (!inputText.trim()) return [];
    return INGREDIENTS.filter(t => 
      t.toLowerCase().includes(inputText.toLowerCase()) && !ingredients.includes(t)
    ).slice(0, 15);
  }, [inputText, ingredients]);

  const handleAddIngredient = (ing) => {
    if (ing && !ingredients.includes(ing)) {
      setIngredients([...ingredients, ing]);
    }
    setInputText('');
  };

  const handleRemoveIngredient = (ing) => {
    setIngredients(ingredients.filter(i => i !== ing));
  };

  const renderMarkdown = (text) => {
    if (!text) return { __html: '' };
    // Replace **text** with styled bold span
    const formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#f2e8d0] font-bold">$1</strong>');
    return { __html: formatted };
  };

  const handleGenerateByName = async (name) => {
    setIsGenerating(true);
    setGeneratedResult(null);
    try {
      const result = await aiService.generateRecipeByName(name || dishName);
      const videos = await youtubeService.searchVideos(result.youtubeSearchQuery || result.title, 'recipe');
      if (videos && videos.length > 0) result.videoSuggestions = videos;
      setGeneratedResult(result);
      await creationsService.save('recipe', result);
    } catch (err) {
      console.error('Failed to generate recipe by name', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = async () => {
    if (dishName.trim() && ingredients.length === 0) {
      return handleGenerateByName(dishName.trim());
    }
    if (ingredients.length === 0) return;
    setIsGenerating(true);
    setGeneratedResult(null);
    try {
      const result = await aiService.generateRecipe(ingredients.join(', '));
      
      // Fetch YouTube Videos
      const videos = await youtubeService.searchVideos(result.youtubeSearchQuery || result.title, 'recipe');
      if (videos && videos.length > 0) {
        result.videoSuggestions = videos;
      }
      
      setGeneratedResult(result);
      await creationsService.save('recipe', result);
    } catch (err) {
      console.error('Failed to generate recipe', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto w-full relative">
      <div className="max-w-4xl mx-auto p-8 space-y-8">
        
        {/* Header & AI Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-[#8a7355] hover:text-[#d4c49a] transition-colors text-sm font-bold">
              {t('backToDashboard')}
            </button>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 rounded-full border-2 border-[#8b6914] bg-[#1a1008] flex items-center justify-center shadow-[0_0_15px_rgba(200,168,76,0.2)]">
              <ChefHat className="h-6 w-6 text-[#c9a84c]" />
            </div>
            <h1 className="text-2xl font-bold tracking-[0.1em] text-[#e8d9b8] mt-3" style={{ fontFamily: 'Cinzel, serif' }}>
              {t('recipeGenTitle')}
            </h1>
            <p className="text-xs text-[#8a7355] uppercase tracking-widest mt-1">{t('ingredients')}</p>
          </div>
          <button 
            onClick={() => setIsAiDrawerOpen(!isAiDrawerOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#8b6914] bg-[#1f140a] hover:bg-[#3d2510] transition-colors shadow-[0_0_10px_rgba(200,168,76,0.15)]"
          >
            <Bot className="h-5 w-5 text-[#c9a84c]" />
            <span className="text-sm font-bold text-[#d4c49a]">{t('navAiAssistant')}</span>
          </button>
        </div>

        {/* Input Card */}
        <div className="rounded-xl border border-[#5c4020] bg-[#1a1008] p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#8b6914]/10 to-transparent pointer-events-none rounded-bl-full" />
          
          {/* Dish Name Direct Input */}
          <div className="mb-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#8a7355] mb-2 block">Dish Name (what do you want to cook?)</label>
            <div className="relative flex gap-3">
              <div className="relative flex-1">
                <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#c9a84c]" />
                <input
                  type="text"
                  value={dishName}
                  onChange={e => setDishName(e.target.value)}
                  placeholder="e.g. Butter Chicken, Pasta Carbonara, Avocado Toast..."
                  className="w-full bg-[#0f0a07] border border-[#5c4020] rounded-lg px-4 pl-10 py-3 text-sm text-[#e8d9b8] placeholder:text-[#5c4020] focus:outline-none focus:border-[#c9a84c] transition-colors"
                />
              </div>
              {dishName.trim() && ingredients.length === 0 && (
                <button
                  onClick={() => handleGenerateByName(dishName.trim())}
                  disabled={isGenerating}
                  className="px-4 py-3 rounded-lg text-xs font-bold transition-all flex items-center gap-2 flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #8b6914, #c9a84c)', color: '#0a0502' }}
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Quick Recipe
                </button>
              )}
            </div>
          </div>

          <div className="relative mb-2">
            <div className="h-px bg-gradient-to-r from-transparent via-[#5c4020] to-transparent" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] uppercase tracking-widest text-[#5c4020] bg-[#1a1008] px-2">or add specific ingredients</span>
          </div>

          <h3 className="text-sm font-bold text-[#d4c49a] mb-4">{t('ingredients')}</h3>
          
          <div className="relative mb-6">
            <div className="flex gap-3">
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && inputText.trim() && handleAddIngredient(inputText.trim())}
                placeholder={t('ingredientsPlaceholder')} 
                className="flex-1 bg-[#0f0a07] border border-[#3d2510] rounded-lg px-4 py-3 text-sm text-[#e8d9b8] placeholder:text-[#5c4020] focus:outline-none focus:border-[#8b6914] transition-colors"
              />
              <button 
                onClick={() => inputText.trim() && handleAddIngredient(inputText.trim())}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#8b6914] to-[#5c4020] hover:from-[#c9a84c] hover:to-[#8b6914] text-[#0f0a07] font-bold text-sm transition-all shadow-lg flex items-center gap-2 border border-[#8b6914]"
              >
                <Plus className="h-4 w-4" /> {t('ingredients')}
              </button>
            </div>
            
            {/* Autocomplete Dropdown */}
            {filteredIngredients.length > 0 && (
              <div className="absolute top-full mt-2 w-full max-w-2xl bg-[#0f0a07] border border-[#5c4020] rounded-lg shadow-2xl z-20 max-h-48 overflow-y-auto no-scrollbar">
                {filteredIngredients.map((ing, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAddIngredient(ing)}
                    className="w-full text-left px-4 py-2.5 text-sm text-[#d4c49a] hover:bg-[#1a1008] hover:text-[#e8d9b8] border-b border-[#2a1a0e] last:border-0 transition-colors"
                  >
                    {ing}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Added Ingredients */}
          {ingredients.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {ingredients.map((ing, idx) => (
                <span key={idx} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1f140a] border border-[#8b6914] text-[#d4c49a] text-xs font-medium shadow-sm">
                  {ing}
                  <button onClick={() => handleRemoveIngredient(ing)} className="hover:text-[#c9a84c]"><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
          )}

          {/* Popular Defaults */}
          {ingredients.length === 0 && !inputText && (
            <div className="mb-8">
              <p className="text-[10px] text-[#8a7355] uppercase tracking-wider mb-3">Popular Staples:</p>
              <div className="flex flex-wrap gap-2">
                {INGREDIENTS.slice(0, 8).map((ing, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleAddIngredient(ing)}
                    className="px-3 py-1.5 rounded bg-[#0a0604] border border-[#2a1a0e] text-[#8a7355] text-[11px] hover:border-[#5c4020] hover:text-[#d4c49a] transition-colors"
                  >
                    + {ing}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Generate Button */}
          <div className="flex justify-center mt-6">
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || (ingredients.length === 0 && !dishName.trim())}
              className={`px-8 py-3.5 rounded-full bg-gradient-to-r from-[#2a1a0e] via-[#8b6914] to-[#2a1a0e] border border-[#c9a84c] text-[#f2e8d0] font-bold tracking-wide transition-all flex items-center gap-3 ${(ingredients.length === 0 && !dishName.trim()) ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-[0_0_20px_rgba(200,168,76,0.4)] hover:scale-105'}`}
            >
              {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <ChefHat className="h-5 w-5" />}
              {isGenerating ? t('generatingRecipe') : t('generateRecipe')}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {generatedResult ? (
          <div className="rounded-xl border border-[#8b6914] bg-[#1a1008] p-8 animate-fade-up shadow-[0_0_20px_rgba(200,168,76,0.15)]">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 pb-6 border-b border-[#3d2510]">
              <div>
                <h2 className="text-3xl font-bold text-[#e8d9b8] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>{generatedResult.title}</h2>
                <div className="flex items-center gap-4 text-xs font-bold text-[#8a7355]">
                  <span className="bg-[#0f0a07] px-2.5 py-1 rounded border border-[#5c4020]">Prep: <span className="text-[#d4c49a]">{generatedResult.prepTime}</span></span>
                  <span className="bg-[#0f0a07] px-2.5 py-1 rounded border border-[#5c4020]">Cook: <span className="text-[#d4c49a]">{generatedResult.cookTime}</span></span>
                  <span className="bg-[#0f0a07] px-2.5 py-1 rounded border border-[#5c4020]">Servings: <span className="text-[#d4c49a]">{generatedResult.servings}</span></span>
                  <span className={`px-2.5 py-1 rounded text-white ${generatedResult.healthClassification === 'Healthy' ? 'bg-[#2a5a2a]' : 'bg-[#8b3a2a]'}`}>{generatedResult.healthClassification}</span>
                </div>
              </div>
              <button onClick={() => setIsAiDrawerOpen(true)} className="px-4 py-2 rounded border border-[#c9a84c] bg-[#2a1a0e] text-[#f2e8d0] text-xs font-bold hover:bg-[#3d2510] transition-colors flex items-center gap-2">
                <Bot className="h-4 w-4" /> Ask AI Chef
              </button>
            </div>
            
            <div className="grid md:grid-cols-12 gap-8 mb-8">
              <div className="md:col-span-4">
                <h3 className="text-sm font-bold text-[#c9a84c] mb-4 uppercase tracking-widest border-b border-[#5c4020] pb-2">{t('ingredients')}</h3>
                <ul className="space-y-2 mb-6">
                  {generatedResult.ingredients.map((item, i) => (
                    <li key={i} className="text-sm text-[#d4c49a] flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#8b6914] mt-0.5 shrink-0" /> <span dangerouslySetInnerHTML={renderMarkdown(item)} />
                    </li>
                  ))}
                </ul>
                <div className="bg-[#0f0a07] rounded-lg border border-[#3d2510] p-4">
                   <p className="text-[10px] uppercase text-[#8a7355] font-bold mb-2 tracking-widest">Nutrition Estimate</p>
                   <div className="flex justify-between text-xs text-[#d4c49a] mb-1"><span>Carbs</span> <span>{generatedResult.nutrition?.carbs || 'N/A'}</span></div>
                   <div className="flex justify-between text-xs text-[#d4c49a] mb-1"><span>Protein</span> <span>{generatedResult.nutrition?.protein || 'N/A'}</span></div>
                   <div className="flex justify-between text-xs text-[#d4c49a]"><span>Fats</span> <span>{generatedResult.nutrition?.fats || 'N/A'}</span></div>
                </div>
              </div>
              <div className="md:col-span-8">
                <h3 className="text-sm font-bold text-[#c9a84c] mb-4 uppercase tracking-widest border-b border-[#5c4020] pb-2">{t('instructions')}</h3>
                <div className="space-y-4">
                  {generatedResult.instructions.map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="h-6 w-6 rounded-full bg-[#1f140a] border border-[#8b6914] flex items-center justify-center text-[#e8d9b8] text-xs font-bold shrink-0 mt-0.5">{i + 1}</div>
                      <p className="text-sm text-[#c4a882] leading-relaxed" dangerouslySetInnerHTML={renderMarkdown(step)} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* YouTube Video Section */}
            <div className="rounded-xl border border-[#3d2510] bg-[#120a05] p-6 mt-8">
              <h3 className="text-sm font-bold text-[#c9a84c] mb-4 flex items-center gap-2">
                <PlayCircle className="h-5 w-5" /> {t('watchTutorial')}
              </h3>
              {generatedResult.videoSuggestions ? (
                <VideoPlayer videos={generatedResult.videoSuggestions} />
              ) : (
                <p className="text-sm text-[#8a7355] italic">We couldn't find a matching video tutorial for this recipe.</p>
              )}
            </div>

          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[#5c4020] bg-[#120a05] p-10 text-center">
            <h2 className="text-lg font-bold text-[#d4c49a] mb-2">{t('recipeMakerTitle')}</h2>
            <p className="text-sm text-[#8a7355]">{t('recipeGenDesc').slice(0, 100)}...</p>
          </div>
        )}
        
        <div className="text-center pb-8 pt-4">
          <p className="text-[10px] text-[#5c4020] font-bold tracking-widest uppercase">Powered by Local AI Engine</p>
        </div>

      </div>

      <AIAssistantDrawer 
        activeModule="recipe" 
        currentContext={{ 
          ingredientsText: ingredients.join(', '),
          activeRecipe: generatedResult 
        }} 
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        hideFab={true}
      />
    </div>
  );
}

function VideoPlayer({ videos }) {
  const [activeVideo, setActiveVideo] = useState(videos[0]);
  return (
    <div className="flex flex-col gap-6">
      {/* Main Video */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/2 aspect-video bg-[#080503] rounded-lg border border-[#3d2510] overflow-hidden shadow-lg">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${activeVideo.videoId}`}
            title={activeVideo.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
        <div className="w-full md:w-1/2 flex flex-col justify-center">
          <h4 className="text-md font-bold text-[#e8d9b8] mb-2 leading-tight">
            {activeVideo.title}
          </h4>
          <p className="text-xs text-[#8a7355] mb-4">
            Channel: <span className="text-[#d4c49a]">{activeVideo.channelTitle}</span>
          </p>
          <a 
            href={`https://www.youtube.com/watch?v=${activeVideo.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-5 py-2.5 rounded bg-[#8b6914] hover:bg-[#c9a84c] text-[#0a0502] text-xs font-bold transition-colors w-max"
          >
            Watch on YouTube
          </a>
        </div>
      </div>
      
      {/* Video Suggestions List */}
      {videos.length > 1 && (
        <div className="mt-2">
          <p className="text-xs text-[#8a7355] uppercase tracking-widest mb-3 font-bold">More Suggestions:</p>
          <div className="flex overflow-x-auto gap-4 pb-2 no-scrollbar">
            {videos.map((vid, i) => (
              <button 
                key={i} 
                onClick={() => setActiveVideo(vid)}
                className={`flex-shrink-0 w-40 text-left transition-all ${activeVideo.videoId === vid.videoId ? 'opacity-100 ring-2 ring-[#c9a84c] rounded-md scale-[1.02]' : 'opacity-60 hover:opacity-100'}`}
              >
                <div className="aspect-video bg-[#1a1008] border border-[#3d2510] rounded-md overflow-hidden mb-2">
                  <img src={vid.thumbnail} alt={vid.title} className="w-full h-full object-cover" />
                </div>
                <h5 className="text-[11px] font-bold text-[#d4c49a] leading-tight line-clamp-2 mb-1">{vid.title}</h5>
                <p className="text-[9px] text-[#8a7355]">{vid.channelTitle}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
