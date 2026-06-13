import React, { useState, useRef } from 'react';
import { Camera, Sparkles, ChefHat, Clock, Flame, AlertCircle, RefreshCw, Layers, Play, CheckCircle2, Circle } from 'lucide-react';
import { preloadedRecipes } from '../utils/preloadedRecipes';
import { aiService } from '../services/aiService';
import { youtubeService } from '../services/youtubeService';

export default function RecipeMaker({ onStateChange }) {
  const [ingredientsInput, setIngredientsInput] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [isGeneratingRecipe, setIsGeneratingRecipe] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState(null);
  const [recipeVideos, setRecipeVideos] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [completedSteps, setCompletedSteps] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const updateParentContext = (recipe) =>
    onStateChange({ ingredientsText: ingredientsInput, activeRecipe: recipe });

  const handleTextChange = (e) => {
    setIngredientsInput(e.target.value);
    onStateChange({ ingredientsText: e.target.value, activeRecipe: currentRecipe });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      triggerImageAnalysis(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const triggerImageAnalysis = async (base64Str) => {
    setIsAnalyzingImage(true);
    setErrorMessage('');
    try {
      const detected = await aiService.analyzeIngredients(base64Str);
      setIngredientsInput(detected);
      onStateChange({ ingredientsText: detected, activeRecipe: currentRecipe });
    } catch (err) {
      setErrorMessage('Image analysis failed. Type ingredients manually!');
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const triggerPresetScan = (presetType) => {
    const presets = {
      stirfry: 'broccoli, carrots, bell pepper, tofu, garlic, soy sauce',
      breakfast: 'eggs, white bread, butter, cherry tomatoes, spinach',
      pasta: 'pasta, tomato sauce, mozzarella cheese, garlic, fresh basil',
    };
    setIsAnalyzingImage(true);
    setErrorMessage('');
    setTimeout(() => {
      setIngredientsInput(presets[presetType] || '');
      setImagePreview(null);
      setIsAnalyzingImage(false);
      onStateChange({ ingredientsText: presets[presetType] || '', activeRecipe: currentRecipe });
    }, 900);
  };

  const generateRecipe = async () => {
    if (!ingredientsInput.trim()) { setErrorMessage('Please enter ingredients first!'); return; }
    setIsGeneratingRecipe(true);
    setErrorMessage('');
    setCurrentRecipe(null);
    setRecipeVideos([]);
    setCompletedSteps({});
    try {
      const recipe = await aiService.generateRecipe(ingredientsInput);
      setCurrentRecipe(recipe);
      updateParentContext(recipe);
      if (recipe.youtubeSearchQuery) {
        const videos = await youtubeService.searchVideos(recipe.youtubeSearchQuery, 'recipe');
        setRecipeVideos(videos);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to generate recipe.');
    } finally {
      setIsGeneratingRecipe(false);
    }
  };

  const selectPreloadedRecipe = async (recipe) => {
    setCurrentRecipe(recipe);
    setCompletedSteps({});
    setErrorMessage('');
    setIngredientsInput(recipe.ingredients.join(', '));
    updateParentContext(recipe);
    setIsGeneratingRecipe(true);
    try {
      const videos = await youtubeService.searchVideos(recipe.youtubeSearchQuery, 'recipe');
      setRecipeVideos(videos);
    } catch (err) { console.warn(err); }
    finally { setIsGeneratingRecipe(false); }
  };

  const toggleStep = (idx) =>
    setCompletedSteps(prev => ({ ...prev, [idx]: !prev[idx] }));

  const categories = ['All', 'Rice items', 'Non-veg', 'Snacks', 'Healthy foods', 'Tiffins'];
  const filteredPreloaded = activeCategory === 'All'
    ? preloadedRecipes
    : preloadedRecipes.filter(r => r.category === activeCategory);

  return (
    <div className="space-y-6">

      {/* ── Preloaded Examples ─────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="sp-label" style={{ color: '#c9a84c' }}>Library of Recipes</span>
          <div className="flex gap-2 overflow-x-auto sp-scroll pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-[9px] font-bold px-3 py-1 whitespace-nowrap transition-all uppercase tracking-widest ${
                  activeCategory === cat
                    ? 'btn-rust'
                    : 'sp-chip hover:bg-[#8b3a2a] hover:text-[#f2e8d0] hover:border-[#a04030]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 sp-scroll snap-x scroll-smooth">
          {filteredPreloaded.map(recipe => (
            <button
              key={recipe.id}
              onClick={() => selectPreloadedRecipe(recipe)}
              className="flex-shrink-0 w-48 snap-start text-left sp-card p-4 hover-lift group"
            >
              <div className="h-10 w-10 bg-gradient-to-br from-[#c0523a] to-[#8b3a2a] rounded flex items-center justify-center mb-3 shadow-[0_4px_10px_rgba(0,0,0,0.6)] border border-[#c9a84c] group-hover:scale-110 transition-transform">
                <ChefHat className="h-5 w-5 text-[#f2e8d0]" />
              </div>
              <p className="sp-title text-xs line-clamp-2 leading-snug group-hover:text-yellow-400 transition-colors">{recipe.title}</p>
              <div className="flex items-center gap-3 mt-3 text-[10px] text-[#c4a882] font-semibold font-['Lato']">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {recipe.totalTime}</span>
                <span className="flex items-center gap-1"><Flame className="h-3 w-3 text-red-500" /> {recipe.nutrition?.healthScore}</span>
              </div>
              <span className="sp-chip mt-2 inline-block border-orange-800 bg-orange-950/40">{recipe.category}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Input Panel ────────────────────────── */}
      <div className="sp-panel p-5 space-y-4">
        <label className="sp-title text-sm block" style={{ color: '#d8c4a0' }}>What ingredients do you have?</label>

        <div className="grid grid-cols-2 gap-4">
          {/* Upload zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative border border-dashed border-[#8b6914] hover:border-[#c9a84c] hover:bg-black/30 rounded p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all group overflow-hidden"
          >
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            {imagePreview ? (
              <div className="absolute inset-0">
                <img src={imagePreview} alt="preview" className="w-full h-full object-cover rounded opacity-70" />
                <div className="absolute inset-0 bg-[#3d2510]/60 flex items-center justify-center">
                  <div className="text-[#c9a84c] text-[10px] font-bold flex items-center gap-2 uppercase tracking-widest">
                    <RefreshCw className="h-4 w-4 animate-spin" /> Change
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="h-10 w-10 bg-gradient-to-b from-[#8b6914] to-[#5c4020] border border-[#c9a84c] rounded flex items-center justify-center mb-2 shadow-[0_2px_8px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform">
                  <Camera className="h-5 w-5 text-[#f2e8d0]" />
                </div>
                <p className="sp-title text-[10px] text-[#e8d9b8] mt-1">Upload Photo</p>
                <p className="sp-body text-[9px] mt-1">AI ocular scan</p>
              </>
            )}
          </div>

          {/* Quick presets */}
          <div className="space-y-2">
            <span className="sp-label" style={{ color: '#c9a84c' }}>Quick Presets</span>
            {[
              { key: 'stirfry', emoji: '🥦', label: 'Fresh Veggies & Tofu' },
              { key: 'breakfast', emoji: '🍳', label: 'Breakfast Egg Plate' },
              { key: 'pasta', emoji: '🍅', label: 'Tomato Garlic Pasta' },
            ].map(p => (
              <button
                key={p.key}
                onClick={(e) => { e.stopPropagation(); triggerPresetScan(p.key); }}
                className="w-full text-left sp-input text-[10px] px-3 py-2 rounded-sm flex items-center gap-2 transition-all hover:border-[#c9a84c] hover:bg-black/50 hover:shadow-[0_0_10px_rgba(200,168,76,0.2)]"
              >
                <span>{p.emoji}</span>
                <span className="truncate flex-1">{p.label}</span>
                <Sparkles className="h-3 w-3 text-[#c9a84c] flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={ingredientsInput}
          onChange={handleTextChange}
          placeholder="e.g. eggs, spinach, garlic, olive oil, cherry tomatoes..."
          className="sp-input h-20 resize-none w-full p-3 text-xs"
        />

        {isAnalyzingImage && (
          <div className="flex items-center gap-2 text-[#c9a84c] text-[10px] uppercase font-['Cinzel'] tracking-widest py-1">
            <RefreshCw className="animate-spin h-3.5 w-3.5" />
            Engaging optical scanners…
          </div>
        )}

        <button
          onClick={generateRecipe}
          disabled={isGeneratingRecipe || isAnalyzingImage}
          className="btn-rust w-full py-3 text-sm flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
        >
          {isGeneratingRecipe ? (
            <>
              <RefreshCw className="animate-spin h-4 w-4" />
              <span>Synthesizing Formula…</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Generate Recipe with AI</span>
            </>
          )}
        </button>

        {errorMessage && (
          <div className="flex items-start gap-2 p-3 bg-red-950/40 border border-red-900 rounded text-red-400 text-[10px] font-['Lato']">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            {errorMessage}
          </div>
        )}
      </div>

      {/* ── Generated Recipe Output ─────────────── */}
      {currentRecipe && (
        <div className="space-y-4 animate-slide-up">

          {/* Recipe Header Card - Vintage Style */}
          <div className="sp-panel-parch p-6 space-y-5">
            {/* Title row */}
            <div className="flex items-start justify-between gap-4 border-b pb-4" style={{ borderColor: 'rgba(139,105,20,0.3)' }}>
              <div className="flex-1">
                <p className="sp-label" style={{ color: '#8b6914' }}>Formula Established</p>
                <h3 className="sp-heading text-2xl mt-1 leading-tight text-[#1a0f07]">
                  {currentRecipe.title}
                </h3>
                <div className="flex flex-wrap items-center gap-4 mt-3">
                  <span className="flex items-center gap-1.5 text-[10px] text-[#3d2510] font-['Cinzel'] font-bold">
                    <Clock className="h-3.5 w-3.5 text-[#8b6914]" /> PREP: {currentRecipe.prepTime}
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] text-[#3d2510] font-['Cinzel'] font-bold">
                    <Flame className="h-3.5 w-3.5 text-[#c0523a]" /> COOK: {currentRecipe.cookTime}
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] text-[#3d2510] font-['Cinzel'] font-bold">
                    <ChefHat className="h-3.5 w-3.5 text-[#2a5a5a]" /> YIELD: {currentRecipe.servings || 2}
                  </span>
                </div>
              </div>
              <span className="sp-chip text-[#8b3a2a] border-[#8b3a2a] bg-[#8b3a2a]/10 flex-shrink-0 text-xs py-1 px-3">
                {currentRecipe.healthClassification || 'Healthy'}
              </span>
            </div>

            {/* Nutrition strip */}
            <div className="grid grid-cols-4 gap-2 bg-[#2a1a0e] rounded p-3 border border-[#8b6914]">
              {[
                { label: 'Carbs', value: currentRecipe.nutrition?.carbs },
                { label: 'Protein', value: currentRecipe.nutrition?.protein },
                { label: 'Fats', value: currentRecipe.nutrition?.fats },
                { label: 'Vitality', value: `${currentRecipe.nutrition?.healthScore || 0}/100` },
              ].map(n => (
                <div key={n.label} className="text-center">
                  <p className="sp-label text-[8px]" style={{ color: '#8a7355' }}>{n.label}</p>
                  <p className="sp-title text-sm mt-1 text-[#e8d9b8]">{n.value || 'N/A'}</p>
                </div>
              ))}
            </div>

            {/* Split: Ingredients + Steps */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="md:col-span-2 space-y-3">
                <h4 className="sp-label flex items-center gap-1 border-b pb-1" style={{ borderColor: 'rgba(139,105,20,0.3)', color: '#1a0f07' }}>
                  <Layers className="h-3 w-3 text-[#8b6914]" /> Required Components
                </h4>
                <ul className="space-y-2">
                  {currentRecipe.ingredients?.map((ing, idx) => (
                    <li key={idx} className="text-xs text-[#251808] font-['Lato'] font-bold flex items-start gap-2 border-b border-[#8b6914]/20 pb-2">
                      <span className="text-[#8b6914] text-xs leading-none mt-0.5 font-serif">❧</span>
                      {ing}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="md:col-span-3 space-y-3">
                <h4 className="sp-label flex items-center gap-1 border-b pb-1" style={{ borderColor: 'rgba(139,105,20,0.3)', color: '#1a0f07' }}>
                  <ChefHat className="h-3 w-3 text-[#8b6914]" /> Execution Procedure
                </h4>
                <div className="space-y-3">
                  {currentRecipe.instructions?.map((step, idx) => (
                    <div
                      key={idx}
                      onClick={() => toggleStep(idx)}
                      className={`flex items-start gap-3 p-3 rounded border border-[#8b6914]/40 cursor-pointer transition-all duration-200 ${
                        completedSteps[idx]
                          ? 'opacity-40 grayscale bg-black/5'
                          : 'bg-[#e8d9b8]/40 hover:bg-[#c9a84c]/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]'
                      }`}
                    >
                      {completedSteps[idx]
                        ? <CheckCircle2 className="h-4 w-4 text-[#2a5a5a] mt-0.5 flex-shrink-0" />
                        : <Circle className="h-4 w-4 text-[#8b6914] mt-0.5 flex-shrink-0" />
                      }
                      <div className="text-xs font-['Lato'] text-[#1a0f07] leading-relaxed">
                        <span className="font-['Cinzel'] font-bold text-[#8b3a2a] mr-2">STEP {idx + 1}:</span>
                        {step}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* YouTube Video */}
          {recipeVideos.length > 0 && (
            <div className="sp-panel p-5 space-y-4">
              <h4 className="sp-label flex items-center gap-1.5" style={{ color: '#c9a84c' }}>
                <Play className="h-3 w-3 text-[#c0523a] fill-[#c0523a]" /> Visual Demonstration
              </h4>
              {recipeVideos.slice(0, 1).map(video => (
                <div key={video.videoId} className="overflow-hidden rounded border border-[#8b6914] shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
                  <div className="relative aspect-video w-full border-b border-[#8b6914]">
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={`https://www.youtube.com/embed/${video.videoId}`}
                      title={video.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="p-3 bg-[#1a0f07]">
                    <p className="sp-title text-[10px] text-[#e8d9b8] line-clamp-1">{video.title}</p>
                    <p className="sp-body text-[9px] mt-0.5">by {video.channelTitle}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
