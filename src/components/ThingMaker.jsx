import React, { useState, useRef, useMemo } from 'react';
import { Camera, Search, CheckSquare, Square, Sparkles, Wrench, ShieldAlert, Clock, Compass, AlertCircle, Play, RefreshCw, Grid3X3, Layers } from 'lucide-react';
import { toolsList } from '../utils/toolsList';
import { aiService } from '../services/aiService';
import { youtubeService } from '../services/youtubeService';

export default function ThingMaker({ onStateChange }) {
  const [materialsInput, setMaterialsInput] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [isGeneratingProject, setIsGeneratingProject] = useState(false);
  const [selectedTools, setSelectedTools] = useState({});
  const [toolSearch, setToolSearch] = useState('');
  const [selectedToolCategory, setSelectedToolCategory] = useState('All');
  const [currentProject, setCurrentProject] = useState(null);
  const [projectVideos, setProjectVideos] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const selectedCount = useMemo(
    () => Object.values(selectedTools).filter(Boolean).length,
    [selectedTools]
  );

  const notifyStateChange = (project, tools) =>
    onStateChange({
      materialsText: materialsInput,
      selectedToolsCount: Object.values(tools || selectedTools).filter(Boolean).length,
      activeProject: project,
    });

  const handleTextChange = (e) => {
    setMaterialsInput(e.target.value);
    onStateChange({ materialsText: e.target.value, selectedToolsCount: selectedCount, activeProject: currentProject });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => { setImagePreview(reader.result); triggerImageAnalysis(reader.result); };
    reader.readAsDataURL(file);
  };

  const triggerImageAnalysis = async (base64Str) => {
    setIsAnalyzingImage(true);
    setErrorMessage('');
    try {
      const detected = await aiService.analyzeMaterials(base64Str);
      setMaterialsInput(detected);
      onStateChange({ materialsText: detected, selectedToolsCount: selectedCount, activeProject: currentProject });
    } catch (err) {
      setErrorMessage('Material analysis failed. Type manually!');
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const triggerPresetScan = (presetType) => {
    const presets = {
      box: '3 empty cardboard shoe boxes, paper towel roll cores, newspaper',
      bottles: '5 plastic soda bottles, colorful bottle caps, plastic straws',
      wood: 'old wooden pallet slats, rusty metal hinges, wood screws',
    };
    setIsAnalyzingImage(true);
    setErrorMessage('');
    setTimeout(() => {
      setMaterialsInput(presets[presetType] || '');
      setImagePreview(null);
      setIsAnalyzingImage(false);
      onStateChange({ materialsText: presets[presetType] || '', selectedToolsCount: selectedCount, activeProject: currentProject });
    }, 900);
  };

  const toggleTool = (toolId) => {
    const updated = { ...selectedTools, [toolId]: !selectedTools[toolId] };
    setSelectedTools(updated);
    notifyStateChange(currentProject, updated);
  };

  const applyToolPreset = (presetName) => {
    let presetIds = [];
    if (presetName === 'none') { setSelectedTools({}); notifyStateChange(currentProject, {}); return; }
    if (presetName === 'crafter') presetIds = ['scissors', 'utility-knife', 'glue-gun', 'tape-measure', 'ruler-metal', 'mod-podge', 'needle-thread', 'cutting-mat', 'paintbrush-flat', 'sandpaper-fine', 'hot-glue-sticks', 'tweezers'];
    if (presetName === 'handyman') presetIds = ['hammer', 'screwdriver-flat', 'screwdriver-phillips', 'handsaw', 'pliers-needle', 'pliers-slip', 'wrench-adj', 'scissors', 'utility-knife', 'tape-measure', 'ruler-metal', 'level', 'carpenter-pencil', 'c-clamp', 'spring-clamp', 'safety-glasses', 'dust-mask', 'gloves-work'];
    const updated = {};
    presetIds.forEach(id => { updated[id] = true; });
    setSelectedTools(updated);
    notifyStateChange(currentProject, updated);
  };

  const filteredTools = useMemo(() =>
    toolsList.filter(t => {
      const matchSearch = t.name.toLowerCase().includes(toolSearch.toLowerCase());
      const matchCat = selectedToolCategory === 'All' || t.category === selectedToolCategory;
      return matchSearch && matchCat;
    }),
    [toolSearch, selectedToolCategory]
  );

  const toolCategories = ['All', 'Hand Tools', 'Power Tools', 'Measuring & Marking', 'Adhesives & Tapes', 'Crafting & Sewing', 'Painting & Finishing', 'Safety Gear'];

  const generateProject = async () => {
    if (!materialsInput.trim()) { setErrorMessage('Please enter materials first!'); return; }
    const selectedToolNames = toolsList.filter(t => selectedTools[t.id]).map(t => t.name);
    if (selectedToolNames.length === 0) { setErrorMessage('Select at least 1 tool from your inventory!'); return; }
    setIsGeneratingProject(true);
    setErrorMessage('');
    setCurrentProject(null);
    setProjectVideos([]);
    try {
      const project = await aiService.generateDIYProject(materialsInput, selectedToolNames);
      setCurrentProject(project);
      onStateChange({ materialsText: materialsInput, selectedToolsCount: selectedCount, activeProject: project });
      if (project.youtubeSearchQuery) {
        const videos = await youtubeService.searchVideos(project.youtubeSearchQuery, 'diy');
        setProjectVideos(videos);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to generate DIY project.');
    } finally {
      setIsGeneratingProject(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* ── Input Panel ────────────────────────── */}
      <div className="sp-panel p-5 space-y-4">
        <label className="sp-title text-sm block" style={{ color: '#90b0d0' }}>What junk or raw materials do you have?</label>

        <div className="grid grid-cols-2 gap-4">
          {/* Upload zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative border border-dashed border-[#4a6080] hover:border-[#90b0d0] hover:bg-black/30 rounded p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all group overflow-hidden"
          >
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            {imagePreview ? (
              <div className="absolute inset-0">
                <img src={imagePreview} alt="preview" className="w-full h-full object-cover rounded opacity-70" />
                <div className="absolute inset-0 bg-[#0c121c]/60 flex items-center justify-center">
                  <div className="text-[#90b0d0] text-[10px] font-bold flex items-center gap-2 uppercase tracking-widest">
                    <RefreshCw className="h-4 w-4 animate-spin" /> Change
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="h-10 w-10 bg-gradient-to-b from-[#4a6080] to-[#2a3a4a] border border-[#7090b0] rounded flex items-center justify-center mb-2 shadow-[0_2px_8px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform">
                  <Camera className="h-5 w-5 text-[#f2e8d0]" />
                </div>
                <p className="sp-title text-[10px] text-[#e8d9b8] mt-1">Upload Photo</p>
                <p className="sp-body text-[9px] mt-1">AI ocular scan</p>
              </>
            )}
          </div>

          {/* Quick presets */}
          <div className="space-y-2">
            <span className="sp-label" style={{ color: '#7090b0' }}>Quick Presets</span>
            {[
              { key: 'box', emoji: '📦', label: 'Shoe Boxes & Paper' },
              { key: 'bottles', emoji: '🥤', label: 'Plastic Bottles' },
              { key: 'wood', emoji: '🪵', label: 'Wood Pallet Slats' },
            ].map(p => (
              <button
                key={p.key}
                onClick={(e) => { e.stopPropagation(); triggerPresetScan(p.key); }}
                className="w-full text-left sp-input text-[10px] px-3 py-2 rounded-sm flex items-center gap-2 transition-all hover:border-[#90b0d0] hover:bg-black/50 hover:shadow-[0_0_10px_rgba(140,170,210,0.2)]"
              >
                <span>{p.emoji}</span>
                <span className="truncate flex-1">{p.label}</span>
                <Sparkles className="h-3 w-3 text-[#90b0d0] flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={materialsInput}
          onChange={handleTextChange}
          placeholder="e.g. plastic bottle, cardboard boxes, wood pallets, newspaper..."
          className="sp-input h-20 resize-none w-full p-3 text-xs"
        />

        {isAnalyzingImage && (
          <div className="flex items-center gap-2 text-[#90b0d0] text-[10px] uppercase font-['Cinzel'] tracking-widest py-1">
            <RefreshCw className="animate-spin h-3.5 w-3.5" />
            Engaging optical scanners…
          </div>
        )}
      </div>

      {/* ── Tool Inventory ────────────────────── */}
      <div className="sp-panel p-5 space-y-4">
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'rgba(74,96,128,0.3)' }}>
          <div>
            <h3 className="sp-title text-sm" style={{ color: '#d8c4a0' }}>Tool Inventory</h3>
            <p className="sp-body text-[9px] mt-1">
              {selectedCount} tool{selectedCount !== 1 ? 's' : ''} selected — AI adapts the project to these only
            </p>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            {['crafter', 'handyman', 'none'].map(preset => (
              <button
                key={preset}
                onClick={() => applyToolPreset(preset)}
                className="text-[9px] font-bold px-3 py-1 rounded-sm bg-[#1a2535] text-[#90b0d0] border border-[#4a6080] hover:bg-[#2a3a4a] transition-all uppercase tracking-widest font-['Cinzel']"
              >
                {preset === 'none' ? 'Clear' : preset}
              </button>
            ))}
          </div>
        </div>

        {/* Search & filter */}
        <div className="grid grid-cols-3 gap-3">
          <select
            value={selectedToolCategory}
            onChange={(e) => setSelectedToolCategory(e.target.value)}
            className="col-span-1 sp-select text-[10px] py-2 px-3 rounded-sm"
          >
            {toolCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <div className="col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#7090b0]" />
            <input
              type="text"
              placeholder="Search tools…"
              value={toolSearch}
              onChange={(e) => setToolSearch(e.target.value)}
              className="sp-input pl-9 w-full text-[10px] py-2 rounded-sm"
            />
          </div>
        </div>

        {/* Tools grid */}
        <div className="h-40 overflow-y-auto sp-scroll pr-2">
          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {filteredTools.map(tool => (
                <div
                  key={tool.id}
                  onClick={() => toggleTool(tool.id)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-sm border cursor-pointer transition-all duration-150 ${
                    selectedTools[tool.id]
                      ? 'bg-[rgba(100,150,200,0.15)] border-[#7090b0] text-[#c0d0e0]'
                      : 'bg-black/30 border-[#2a3a4a] hover:bg-black/50 text-[#8a9aa0]'
                  }`}
                >
                  {selectedTools[tool.id]
                    ? <CheckSquare className="h-3.5 w-3.5 text-[#90b0d0] flex-shrink-0" />
                    : <Square className="h-3.5 w-3.5 text-[#4a6080] flex-shrink-0" />
                  }
                  <span className="text-[10px] font-['Lato'] font-bold leading-none truncate">{tool.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-[#7090b0] text-[10px] font-medium font-['Lato']">
              No tools match your search.
            </div>
          )}
        </div>
      </div>

      {/* ── Generate Button ────────────────────── */}
      <button
        onClick={generateProject}
        disabled={isGeneratingProject || isAnalyzingImage}
        className="btn-dark w-full py-3 text-sm flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
        style={{ borderColor: '#4a6080' }}
      >
        {isGeneratingProject ? (
          <>
            <RefreshCw className="animate-spin h-4 w-4" />
            <span>Drafting Blueprint…</span>
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 text-[#90b0d0]" />
            <span>Generate DIY Project with AI</span>
          </>
        )}
      </button>

      {errorMessage && (
        <div className="flex items-start gap-2 p-3 bg-red-950/40 border border-red-900 rounded text-red-400 text-[10px] font-['Lato']">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          {errorMessage}
        </div>
      )}

      {/* ── Generated Project Output ─────────────── */}
      {currentProject && (
        <div className="space-y-4 animate-slide-up">
          <div className="sp-parch-area p-6 space-y-5">

            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b pb-4" style={{ borderColor: 'rgba(139,105,20,0.3)' }}>
              <div className="flex-1">
                <p className="sp-label" style={{ color: '#8b6914' }}>Schematic Approved</p>
                <h3 className="sp-heading text-2xl mt-1 leading-tight text-[#1a0f07]">
                  {currentProject.title}
                </h3>
                <div className="flex flex-wrap items-center gap-4 mt-3">
                  <span className="flex items-center gap-1.5 text-[10px] text-[#3d2510] font-['Cinzel'] font-bold">
                    <Clock className="h-3.5 w-3.5 text-[#2a5a5a]" /> {currentProject.estimatedTime}
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] text-[#3d2510] font-['Cinzel'] font-bold">
                    <Compass className="h-3.5 w-3.5 text-[#8b6914]" /> {currentProject.dimensions}
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] text-[#3d2510] font-['Cinzel'] font-bold">
                    <Wrench className="h-3.5 w-3.5 text-[#c0523a]" /> {currentProject.difficulty}
                  </span>
                </div>
              </div>
              <span className="sp-chip text-[#1a0f07] border-[#8b6914] flex-shrink-0 text-[9px] py-1 px-2 flex items-center gap-1.5 bg-[#d4c49a]">
                <Grid3X3 className="h-2.5 w-2.5" /> Owned Tools Only
              </span>
            </div>

            {/* Split content */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="md:col-span-2 space-y-4">
                {/* Tools used chips */}
                <div>
                  <h4 className="sp-label flex items-center gap-1 border-b pb-1 mb-2" style={{ borderColor: 'rgba(139,105,20,0.3)', color: '#1a0f07' }}>
                    <Wrench className="h-3 w-3 text-[#8b6914]" /> Tools Required
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {currentProject.toolsUsed?.map((tool, idx) => (
                      <span key={idx} className="text-[9px] font-bold px-2 py-1 bg-[#251808] text-[#c4a882] border border-[#8b6914] font-['Cinzel'] tracking-wider">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Materials list */}
                <div>
                  <h4 className="sp-label flex items-center gap-1 border-b pb-1 mb-2" style={{ borderColor: 'rgba(139,105,20,0.3)', color: '#1a0f07' }}>
                    <Layers className="h-3 w-3 text-[#8b6914]" /> Materials List
                  </h4>
                  <ul className="space-y-1">
                    {currentProject.materialsRequired?.map((mat, idx) => (
                      <li key={idx} className="text-xs text-[#251808] font-['Lato'] font-bold flex items-start gap-2 py-1">
                        <span className="text-[#8b6914] text-xs leading-none mt-0.5 font-serif">❧</span>
                        {mat}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Build instructions */}
              <div className="md:col-span-3">
                <h4 className="sp-label flex items-center gap-1 border-b pb-1 mb-2" style={{ borderColor: 'rgba(139,105,20,0.3)', color: '#1a0f07' }}>
                  <Grid3X3 className="h-3 w-3 text-[#8b6914]" /> Build Sequence
                </h4>
                <div className="space-y-3">
                  {currentProject.instructions?.map((inst, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="text-[#8b3a2a] font-extrabold text-xs flex-shrink-0 mt-0.5 font-['Cinzel'] w-4">
                        {idx + 1}.
                      </div>
                      <p className="text-xs font-['Lato'] text-[#1a0f07] leading-relaxed border-b border-[#8b6914]/20 pb-3">{inst}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Safety pane */}
            {currentProject.safetyGuidelines?.length > 0 && (
              <div className="p-4 bg-[#8b3a2a]/10 border border-[#8b3a2a] rounded flex items-start gap-3 mt-4">
                <ShieldAlert className="h-5 w-5 text-[#8b3a2a] flex-shrink-0 animate-soft-pulse" />
                <div>
                  <p className="text-[10px] font-['Cinzel'] font-bold text-[#8b3a2a] mb-1.5 uppercase tracking-widest">Safety Directives</p>
                  <ul className="list-disc pl-4 text-xs font-['Lato'] text-[#3d2510] space-y-1 font-bold">
                    {currentProject.safetyGuidelines.map((safe, idx) => (
                      <li key={idx}>{safe}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* YouTube Video */}
          {projectVideos.length > 0 && (
            <div className="sp-panel p-5 space-y-4">
              <h4 className="sp-label flex items-center gap-1.5" style={{ color: '#90b0d0' }}>
                <Play className="h-3 w-3 text-[#4a6080] fill-[#4a6080]" /> Reference Broadcast
              </h4>
              {projectVideos.slice(0, 1).map(video => (
                <div key={video.videoId} className="overflow-hidden rounded border border-[#4a6080] shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
                  <div className="relative aspect-video w-full border-b border-[#4a6080]">
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={`https://www.youtube.com/embed/${video.videoId}`}
                      title={video.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="p-3 bg-[#0c121c]">
                    <p className="sp-title text-[10px] text-[#90b0d0] line-clamp-1">{video.title}</p>
                    <p className="sp-body text-[9px] mt-0.5 text-[#4a6080]">by {video.channelTitle}</p>
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
