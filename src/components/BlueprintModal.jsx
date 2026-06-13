import { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, ChevronUp, Play, Clock, Wrench, ChefHat, Shield, Layers, 
         Compass, Flame, Star, BookOpen, ExternalLink, Save, Check, Video } from 'lucide-react';
import { creationsService } from '../services/creationsService';
import { useNavigate } from 'react-router-dom';

function parseMarkdownBold(text) {
  if (!text) return '';
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-[#c9a84c]">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

function StepAccordion({ step, index, type }) {
  const [open, setOpen] = useState(index === 0);
  const isRecipe = type === 'recipe';
  const accentColor = isRecipe ? '#c9a84c' : '#90b0d0';
  const borderColor = isRecipe ? 'rgba(139,105,20,0.4)' : 'rgba(74,96,128,0.4)';

  const lines = typeof step === 'string' ? step.split('\n').filter(l => l.trim()) : [String(step)];
  const title = lines[0] || `Step ${index + 1}`;
  const body = lines.slice(1).join('\n');

  return (
    <div
      className="rounded-xl border overflow-hidden transition-all duration-300"
      style={{
        borderColor: open ? accentColor : borderColor,
        background: open
          ? isRecipe ? 'rgba(139,105,20,0.08)' : 'rgba(74,96,128,0.08)'
          : 'rgba(0,0,0,0.2)',
      }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start gap-3 p-4 text-left group"
      >
        <span
          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
          style={{
            background: open ? accentColor : 'transparent',
            border: `1.5px solid ${accentColor}`,
            color: open ? '#0a0604' : accentColor,
          }}
        >
          {index + 1}
        </span>
        <span className="flex-1 text-sm font-semibold leading-snug" style={{ color: open ? '#f2e8d0' : '#c4a882' }}>
          {parseMarkdownBold(title)}
        </span>
        <span style={{ color: accentColor }} className="flex-shrink-0 mt-0.5">
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>

      {open && body && (
        <div className="px-4 pb-4 pt-1 text-sm leading-relaxed text-[#c4a882] animate-fade-in">
          {body.split('\n').map((line, i) => {
            if (!line.trim()) return <div key={i} className="h-2" />;
            if (line.trim().startsWith('*') && line.trim().endsWith('*') && !line.trim().startsWith('**')) {
              return (
                <div key={i} className="mt-2 flex items-start gap-2 text-xs italic" style={{ color: accentColor }}>
                  <Star className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>{line.trim().replace(/^\*/, '').replace(/\*$/, '')}</span>
                </div>
              );
            }
            return (
              <p key={i} className="mt-1">{parseMarkdownBold(line)}</p>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function BlueprintModal({ blueprint, type, onClose, onNavigate }) {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('steps');
  const overlayRef = useRef(null);

  const isRecipe = type === 'recipe';
  const accentColor = isRecipe ? '#c9a84c' : '#90b0d0';
  const accentBorder = isRecipe ? 'rgba(139,105,20,0.5)' : 'rgba(74,96,128,0.5)';
  const bgDeep = isRecipe ? '#1a0f07' : '#0c121c';
  const bgPanel = isRecipe ? '#251808' : '#0e1520';

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleSave = async () => {
    if (saved || saving) return;
    setSaving(true);
    try {
      await creationsService.save(type, blueprint);
      setSaved(true);
    } catch (e) {
      console.error('Save failed', e);
    } finally {
      setSaving(false);
    }
  };

  const handleGetVideos = () => {
    onClose();
    if (onNavigate) {
      onNavigate(blueprint);
    } else {
      navigate(isRecipe ? '/recipe-maker' : '/thing-maker');
    }
  };

  if (!blueprint) return null;

  const ingredients = blueprint.ingredients || blueprint.materialsRequired || [];
  const steps = blueprint.instructions || [];
  const safety = blueprint.safetyGuidelines || [];
  const nutrition = blueprint.nutrition || null;
  const toolsUsed = blueprint.toolsUsed || [];

  const tabs = [
    { id: 'steps', label: isRecipe ? 'Procedure' : 'Build Steps', icon: BookOpen },
    { id: 'materials', label: isRecipe ? 'Ingredients' : 'Materials', icon: Layers },
    ...(safety.length > 0 ? [{ id: 'safety', label: 'Safety', icon: Shield }] : []),
    ...(nutrition ? [{ id: 'nutrition', label: 'Nutrition', icon: Flame }] : []),
  ];

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl flex flex-col animate-slide-up"
        style={{
          background: bgDeep,
          border: `1.5px solid ${accentBorder}`,
          boxShadow: `0 25px 80px rgba(0,0,0,0.9), 0 0 60px ${accentColor}18`,
        }}
      >
        {/* Decorative top glow bar */}
        <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} />

        {/* Header */}
        <div className="flex items-start gap-4 p-6 border-b flex-shrink-0" style={{ borderColor: accentBorder }}>
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl"
            style={{ background: `${accentColor}20`, border: `1px solid ${accentColor}40` }}
          >
            {isRecipe ? '🍳' : '🔨'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: accentColor }}>
              {isRecipe ? 'Recipe Blueprint' : 'Project Blueprint'}
            </p>
            <h2 className="text-xl font-bold text-[#f2e8d0] leading-tight truncate" style={{ fontFamily: 'Cinzel, serif' }}>
              {blueprint.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {(blueprint.estimatedTime || blueprint.totalTime) && (
                <span className="flex items-center gap-1 text-[10px] font-bold" style={{ color: '#c4a882' }}>
                  <Clock className="h-3 w-3" style={{ color: accentColor }} />
                  {blueprint.estimatedTime || blueprint.totalTime}
                </span>
              )}
              {blueprint.difficulty && (
                <span className="flex items-center gap-1 text-[10px] font-bold" style={{ color: '#c4a882' }}>
                  <Compass className="h-3 w-3" style={{ color: accentColor }} />
                  {blueprint.difficulty}
                </span>
              )}
              {blueprint.servings && (
                <span className="flex items-center gap-1 text-[10px] font-bold" style={{ color: '#c4a882' }}>
                  <ChefHat className="h-3 w-3" style={{ color: accentColor }} />
                  Serves {blueprint.servings}
                </span>
              )}
              {blueprint.dimensions && (
                <span className="flex items-center gap-1 text-[10px] font-bold" style={{ color: '#c4a882' }}>
                  <Wrench className="h-3 w-3" style={{ color: accentColor }} />
                  {blueprint.dimensions}
                </span>
              )}
              {blueprint.healthClassification && (
                <span
                  className="text-[9px] font-bold px-2 py-0.5 rounded-full border"
                  style={{ color: accentColor, borderColor: accentColor, background: `${accentColor}15` }}
                >
                  {blueprint.healthClassification}
                </span>
              )}
              {blueprint.category && (
                <span
                  className="text-[9px] font-bold px-2 py-0.5 rounded-full border"
                  style={{ color: '#c4a882', borderColor: 'rgba(196,168,130,0.4)', background: 'rgba(196,168,130,0.1)' }}
                >
                  {blueprint.category}
                </span>
              )}
            </div>
          </div>
          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all"
              style={{
                background: saved ? `${accentColor}30` : 'rgba(0,0,0,0.4)',
                border: `1px solid ${saved ? accentColor : 'rgba(255,255,255,0.1)'}`,
                color: saved ? accentColor : '#c4a882',
              }}
              title={saved ? 'Saved!' : 'Save Blueprint'}
            >
              {saved ? <Check className="h-3.5 w-3.5" /> : saving ? <div className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {saved ? 'Saved' : 'Save'}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
              style={{ color: '#8a7355' }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 flex-shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
              style={{
                background: activeTab === tab.id ? `${accentColor}20` : 'transparent',
                color: activeTab === tab.id ? accentColor : '#8a7355',
                border: activeTab === tab.id ? `1px solid ${accentColor}50` : '1px solid transparent',
              }}
            >
              <tab.icon className="h-3 w-3" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 pt-4 space-y-3">

          {/* Steps Tab */}
          {activeTab === 'steps' && (
            <div className="space-y-2.5">
              {steps.length === 0 ? (
                <div className="text-center py-8 text-[#8a7355] text-sm">No steps available.</div>
              ) : (
                steps.map((step, i) => (
                  <StepAccordion key={i} step={step} index={i} type={type} />
                ))
              )}
            </div>
          )}

          {/* Materials/Ingredients Tab */}
          {activeTab === 'materials' && (
            <div className="space-y-4">
              <div className="space-y-2">
                {ingredients.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl"
                    style={{ background: bgPanel, border: `1px solid ${accentBorder}` }}
                  >
                    <span className="text-lg flex-shrink-0 mt-0.5" style={{ color: accentColor }}>❧</span>
                    <span className="text-sm text-[#c4a882] leading-relaxed">{parseMarkdownBold(item)}</span>
                  </div>
                ))}
              </div>
              {toolsUsed.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: accentColor, fontFamily: 'Cinzel, serif' }}>
                    Tools Required
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {toolsUsed.map((tool, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-bold px-2 py-1 rounded border flex items-center gap-1"
                        style={{ color: '#c4a882', borderColor: accentBorder, background: bgPanel }}
                      >
                        <Wrench className="h-2.5 w-2.5" />
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Safety Tab */}
          {activeTab === 'safety' && safety.length > 0 && (
            <div className="space-y-2.5">
              {safety.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3.5 rounded-xl"
                  style={{ background: 'rgba(139,58,42,0.12)', border: '1px solid rgba(139,58,42,0.4)' }}
                >
                  <Shield className="h-4 w-4 text-[#c0523a] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-[#e8c4a0] leading-relaxed">{parseMarkdownBold(item)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Nutrition Tab */}
          {activeTab === 'nutrition' && nutrition && (
            <div>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Carbs', value: nutrition.carbs },
                  { label: 'Protein', value: nutrition.protein },
                  { label: 'Fats', value: nutrition.fats },
                  { label: 'Health', value: `${nutrition.healthScore || 0}/100` },
                ].map((n) => (
                  <div
                    key={n.label}
                    className="text-center p-3 rounded-xl"
                    style={{ background: bgPanel, border: `1px solid ${accentBorder}` }}
                  >
                    <p className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: '#8a7355', fontFamily: 'Cinzel, serif' }}>{n.label}</p>
                    <p className="text-lg font-bold" style={{ color: accentColor, fontFamily: 'Cinzel, serif' }}>{n.value || 'N/A'}</p>
                  </div>
                ))}
              </div>
              {nutrition.healthScore && (
                <div>
                  <div className="flex justify-between text-[10px] text-[#8a7355] mb-1">
                    <span>Health Score</span>
                    <span style={{ color: accentColor }}>{nutrition.healthScore}/100</span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.4)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${nutrition.healthScore}%`,
                        background: `linear-gradient(90deg, #8b3a2a, ${accentColor})`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between gap-3 p-4 flex-shrink-0 border-t"
          style={{ borderColor: accentBorder, background: `${bgPanel}80` }}
        >
          <div className="flex items-center gap-2">
            {blueprint.youtubeSearchQuery && (
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(blueprint.youtubeSearchQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all hover:opacity-80"
                style={{ background: 'rgba(255,0,0,0.12)', border: '1px solid rgba(255,0,0,0.3)', color: '#ff6666' }}
              >
                <Play className="h-3 w-3 fill-current" />
                Watch on YouTube
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            )}
          </div>
          <button
            onClick={handleGetVideos}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all hover:-translate-y-0.5"
            style={{
              background: `linear-gradient(135deg, ${accentColor}40, ${accentColor}20)`,
              border: `1px solid ${accentColor}`,
              color: accentColor,
              boxShadow: `0 0 20px ${accentColor}20`,
            }}
          >
            <Video className="h-3.5 w-3.5" />
            Get Suggested Videos
          </button>
        </div>

        {/* Bottom decorative glow */}
        <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} />
      </div>
    </div>
  );
}
