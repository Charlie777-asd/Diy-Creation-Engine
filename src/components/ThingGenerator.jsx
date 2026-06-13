import React, { useState, useMemo, useEffect } from 'react';
import { Wrench, Plus, X, PlayCircle, Bot, Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import AIAssistantDrawer from './AIAssistantDrawer';
import { aiService } from '../services/aiService';
import { TOOLS_AND_MATERIALS } from '../utils/toolsList';
import { youtubeService } from '../services/youtubeService';
import { creationsService } from '../services/creationsService';
import { useLanguage } from '../utils/LanguageContext';

export default function ThingGenerator({ onBack, initialName = '' }) {
  const { t } = useLanguage();
  const [materials, setMaterials] = useState([]);
  const [inputText, setInputText] = useState('');
  const [projectName, setProjectName] = useState(initialName);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState(null);

  // Auto-generate if initialName is provided
  useEffect(() => {
    if (initialName && initialName.trim()) {
      handleGenerateByName(initialName.trim());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredTools = useMemo(() => {
    if (!inputText.trim()) return [];
    return TOOLS_AND_MATERIALS.filter(t => 
      t.toLowerCase().includes(inputText.toLowerCase()) && !materials.includes(t)
    ).slice(0, 15);
  }, [inputText, materials]);

  const handleAddMaterial = (mat) => {
    if (mat && !materials.includes(mat)) {
      setMaterials([...materials, mat]);
    }
    setInputText('');
  };

  const handleRemoveMaterial = (mat) => {
    setMaterials(materials.filter(i => i !== mat));
  };

  const renderMarkdown = (text) => {
    if (!text) return { __html: '' };
    const formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#d8c4a0] font-bold">$1</strong>');
    return { __html: formatted };
  };

  const handleGenerateByName = async (name) => {
    setIsGenerating(true);
    setGeneratedResult(null);
    try {
      const result = await aiService.generateDIYProjectByName(name || projectName);
      const videos = await youtubeService.searchVideos(result.youtubeSearchQuery || result.title, 'diy');
      if (videos && videos.length > 0) result.videoSuggestions = videos;
      setGeneratedResult(result);
      await creationsService.save('thing', result);
    } catch (err) {
      console.error('Failed to generate project by name', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = async () => {
    if (projectName.trim() && materials.length === 0) {
      return handleGenerateByName(projectName.trim());
    }
    if (materials.length === 0) return;
    setIsGenerating(true);
    setGeneratedResult(null);
    try {
      const result = await aiService.generateDIYProject(materials.join(', '), materials);
      
      // Fetch YouTube Videos
      const videos = await youtubeService.searchVideos(result.youtubeSearchQuery || result.title, 'diy');
      if (videos && videos.length > 0) {
        result.videoSuggestions = videos;
      }
      
      setGeneratedResult(result);
      await creationsService.save('thing', result);
    } catch (err) {
      console.error('Failed to generate project', err);
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
            <button onClick={onBack} className="text-[#8a7355] hover:text-[#d8c4a0] transition-colors text-sm font-bold">
              {t('backToDashboard')}
            </button>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 rounded-full border-2 border-[#5c4020] bg-[#120a05] flex items-center justify-center shadow-[0_0_15px_rgba(200,168,76,0.1)]">
              <Wrench className="h-6 w-6 text-[#c9a84c]" />
            </div>
            <h1 className="text-2xl font-bold tracking-[0.1em] text-[#d8c4a0] mt-3" style={{ fontFamily: 'Cinzel, serif' }}>
              {t('thingGenTitle')}
            </h1>
            <p className="text-xs text-[#8a7355] uppercase tracking-widest mt-1">{t('yourMaterials')}</p>
          </div>
          <button 
            onClick={() => setIsAiDrawerOpen(!isAiDrawerOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#5c4020] bg-[#120a05] hover:bg-[#251808] transition-colors shadow-[0_0_10px_rgba(200,168,76,0.1)]"
          >
            <Bot className="h-5 w-5 text-[#c9a84c]" />
            <span className="text-sm font-bold text-[#c4a882]">{t('navAiAssistant')}</span>
          </button>
        </div>

        {/* Input Card */}
        <div className="rounded-xl border border-[#3d2510] bg-[#120a05] p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#8b6914]/5 to-transparent pointer-events-none rounded-bl-full" />
          
          {/* Project Name (direct input) */}
          <div className="mb-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#8a7355] mb-2 block">Project Name (or describe what you want to build)</label>
            <div className="relative flex gap-3">
              <div className="relative flex-1">
                <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#c9a84c]" />
                <input
                  type="text"
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  placeholder="e.g. Solar Lamp, Cardboard Shelf, DIY Phone Stand..."
                  className="w-full bg-[#080503] border border-[#5c4020] rounded-lg px-4 pl-10 py-3 text-sm text-[#d8c4a0] placeholder:text-[#5c4020] focus:outline-none focus:border-[#c9a84c] transition-colors"
                />
              </div>
              {projectName.trim() && materials.length === 0 && (
                <button
                  onClick={() => handleGenerateByName(projectName.trim())}
                  disabled={isGenerating}
                  className="px-4 py-3 rounded-lg text-xs font-bold transition-all flex items-center gap-2 flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #8b6914, #c9a84c)', color: '#0a0502' }}
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Quick Blueprint
                </button>
              )}
            </div>
          </div>

          <div className="relative mb-2">
            <div className="h-px bg-gradient-to-r from-transparent via-[#3d2510] to-transparent" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] uppercase tracking-widest text-[#5c4020] bg-[#120a05] px-2">or add specific materials & tools</span>
          </div>

          <h3 className="text-sm font-bold text-[#c4a882] mb-4">{t('yourMaterials')} & {t('toolsAvailable')}</h3>
          
          <div className="relative mb-6">
            <div className="flex gap-3">
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && inputText.trim() && handleAddMaterial(inputText.trim())}
                placeholder={t('materialsPlaceholder')} 
                className="flex-1 bg-[#080503] border border-[#2a1a0e] rounded-lg px-4 py-3 text-sm text-[#d8c4a0] placeholder:text-[#5c4020] focus:outline-none focus:border-[#5c4020] transition-colors"
              />
              <button 
                onClick={() => inputText.trim() && handleAddMaterial(inputText.trim())}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#5c4020] to-[#2a1a0e] hover:from-[#8b6914] hover:to-[#3d2510] text-[#d8c4a0] font-bold text-sm transition-all shadow-lg flex items-center gap-2 border border-[#3d2510]"
              >
                <Plus className="h-4 w-4" /> {t('selectTools')}
              </button>
            </div>
            
            {/* Autocomplete Dropdown */}
            {filteredTools.length > 0 && (
              <div className="absolute top-full mt-2 w-full max-w-2xl bg-[#080503] border border-[#3d2510] rounded-lg shadow-2xl z-20 max-h-48 overflow-y-auto no-scrollbar">
                {filteredTools.map((tool, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAddMaterial(tool)}
                    className="w-full text-left px-4 py-2.5 text-sm text-[#c4a882] hover:bg-[#1a1008] hover:text-[#d8c4a0] border-b border-[#1f140a] last:border-0 transition-colors"
                  >
                    {tool}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Added Materials */}
          {materials.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {materials.map((mat, idx) => (
                <span key={idx} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1a1008] border border-[#5c4020] text-[#c4a882] text-xs font-medium shadow-sm">
                  {mat}
                  <button onClick={() => handleRemoveMaterial(mat)} className="hover:text-[#c9a84c]"><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
          )}

          {/* Popular Defaults */}
          {materials.length === 0 && !inputText && (
            <div className="mb-8">
              <p className="text-[10px] text-[#8a7355] uppercase tracking-wider mb-3">Popular Items:</p>
              <div className="flex flex-wrap gap-2">
                {TOOLS_AND_MATERIALS.slice(0, 8).map((mat, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleAddMaterial(mat)}
                    className="px-3 py-1.5 rounded bg-[#0a0502] border border-[#1f140a] text-[#8a7355] text-[11px] hover:border-[#3d2510] hover:text-[#c4a882] transition-colors"
                  >
                    + {mat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Generate Button */}
          <div className="flex justify-center mt-6">
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || (materials.length === 0 && !projectName.trim())}
              className={`px-8 py-3.5 rounded-full bg-gradient-to-r from-[#1a1008] via-[#5c4020] to-[#1a1008] border border-[#8b6914] text-[#d8c4a0] font-bold tracking-wide transition-all flex items-center gap-3 ${(materials.length === 0 && !projectName.trim()) ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-[0_0_20px_rgba(139,105,20,0.3)] hover:scale-105'}`}
            >
              {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Wrench className="h-5 w-5" />}
              {isGenerating ? t('generating') : t('generateProject')}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {generatedResult ? (
          <div className="rounded-xl border border-[#5c4020] bg-[#120a05] p-8 animate-fade-up shadow-xl">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 pb-6 border-b border-[#2a1a0e]">
              <div>
                <h2 className="text-2xl font-bold text-[#d8c4a0] mb-2" style={{ fontFamily: 'Cinzel, serif' }}>{generatedResult.title}</h2>
                <div className="flex items-center gap-4 text-xs font-bold text-[#8a7355]">
                  <span className="bg-[#1a1008] px-2.5 py-1 rounded border border-[#3d2510]">Difficulty: <span className="text-[#c4a882]">{generatedResult.difficulty}</span></span>
                  <span className="bg-[#1a1008] px-2.5 py-1 rounded border border-[#3d2510]">Time: <span className="text-[#c4a882]">{generatedResult.estimatedTime}</span></span>
                  <span className="bg-[#1a1008] px-2.5 py-1 rounded border border-[#3d2510]">Size: <span className="text-[#c4a882]">{generatedResult.dimensions}</span></span>
                </div>
              </div>
              <button onClick={() => setIsAiDrawerOpen(true)} className="px-4 py-2 rounded border border-[#8b6914] bg-[#251808] text-[#d8c4a0] text-xs font-bold hover:bg-[#3d2510] transition-colors flex items-center gap-2">
                <Bot className="h-4 w-4" /> Ask AI about this
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-sm font-bold text-[#c9a84c] mb-4 uppercase tracking-widest border-b border-[#3d2510] pb-2">{t('materialsRequired')} & {t('toolsUsed')}</h3>
                <ul className="space-y-2 mb-6">
                  {generatedResult.materialsRequired.map((item, i) => (
                    <li key={i} className="text-sm text-[#d8c4a0] flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#8b6914] mt-0.5 shrink-0" /> <span dangerouslySetInnerHTML={renderMarkdown(item)} />
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2">
                  {generatedResult.toolsUsed.map((tool, i) => (
                    <span key={i} className="text-[10px] bg-[#1a1008] text-[#8a7355] border border-[#2a1a0e] px-2 py-1 rounded">{tool}</span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#c0523a] mb-4 uppercase tracking-widest border-b border-[#3d2510] pb-2">Safety First</h3>
                <ul className="space-y-2">
                  {generatedResult.safetyGuidelines.map((guideline, i) => (
                    <li key={i} className="text-sm text-[#c4a882] flex items-start gap-2">
                      <span className="text-[#c0523a] mt-0.5">⚠️</span> <span dangerouslySetInnerHTML={renderMarkdown(guideline)} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#c9a84c] mb-4 uppercase tracking-widest border-b border-[#3d2510] pb-2">{t('buildInstructions')}</h3>
              <div className="space-y-4">
                {generatedResult.instructions.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="h-6 w-6 rounded-full bg-[#251808] border border-[#8b6914] flex items-center justify-center text-[#d8c4a0] text-xs font-bold shrink-0 mt-0.5">{i + 1}</div>
                    <p className="text-sm text-[#c4a882] leading-relaxed" dangerouslySetInnerHTML={renderMarkdown(step)} />
                  </div>
                ))}
              </div>
            </div>

            {/* YouTube Video Section */}
            <div className="rounded-xl border border-[#2a1a0e] bg-[#0a0502] p-6 mt-8">
              <h3 className="text-sm font-bold text-[#8b6914] mb-4 flex items-center gap-2">
                <PlayCircle className="h-5 w-5" /> {t('watchTutorial')}
              </h3>
              {generatedResult.videoSuggestions ? (
                <VideoPlayer videos={generatedResult.videoSuggestions} />
              ) : (
                <p className="text-sm text-[#8a7355] italic">We couldn't find a matching video tutorial for this project.</p>
              )}
            </div>

          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[#3d2510] bg-[#0a0502] p-10 text-center">
            <h2 className="text-lg font-bold text-[#c4a882] mb-2">{t('thingMakerTitle')}</h2>
            <p className="text-sm text-[#8a7355]">{t('thingGenDesc').slice(0, 100)}...</p>
          </div>
        )}
        
        <div className="text-center pb-8 pt-4">
          <p className="text-[10px] text-[#3d2510] font-bold tracking-widest uppercase">Powered by Local AI Engine</p>
        </div>

      </div>

      <AIAssistantDrawer 
        activeModule="thing" 
        currentContext={{ 
          materialsText: materials.join(', '),
          activeProject: generatedResult 
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
          <h4 className="text-md font-bold text-[#d8c4a0] mb-2 leading-tight">
            {activeVideo.title}
          </h4>
          <p className="text-xs text-[#8a7355] mb-4">
            Channel: <span className="text-[#c4a882]">{activeVideo.channelTitle}</span>
          </p>
          <a 
            href={`https://www.youtube.com/watch?v=${activeVideo.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-5 py-2.5 rounded bg-[#5c4020] hover:bg-[#8b6914] text-[#0a0502] text-xs font-bold transition-colors w-max"
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
                <h5 className="text-[11px] font-bold text-[#d8c4a0] leading-tight line-clamp-2 mb-1">{vid.title}</h5>
                <p className="text-[9px] text-[#8a7355]">{vid.channelTitle}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
