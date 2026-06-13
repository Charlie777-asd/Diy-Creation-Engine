import { useState, useEffect } from 'react';
import { creationsService } from '../services/creationsService';
import { Loader2, Wrench, ChefHat, Calendar, Search, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BlueprintModal from './BlueprintModal';

export default function CollectionsPage() {
  const [creations, setCreations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [usingLocal, setUsingLocal] = useState(false);
  const [selectedBlueprint, setSelectedBlueprint] = useState(null);
  const [selectedType, setSelectedType] = useState('thing');
  const [hoveredId, setHoveredId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCreations();
  }, []);

  const fetchCreations = async () => {
    setIsLoading(true);
    setUsingLocal(creationsService.isUsingLocalStorage());
    try {
      const data = await creationsService.fetchAll();
      setCreations(data || []);
    } catch (error) {
      console.error('Error fetching creations:', error);
      setCreations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Remove this blueprint from your archive?')) return;
    try {
      await creationsService.delete(id);
      setCreations(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const filteredCreations = creations.filter(c => {
    const matchesFilter = filter === 'all' || c.type === filter;
    const title = (c.data?.title || '').toLowerCase();
    const matchesSearch = !searchQuery || title.includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const openBlueprint = (item) => {
    setSelectedBlueprint(item.data || {});
    setSelectedType(item.type);
  };

  return (
    <div className="flex-1 w-full overflow-y-auto" style={{ background: 'linear-gradient(135deg, #0a0604 0%, #0e0a06 100%)' }}>
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Cinzel, serif', color: '#e8d9b8' }}>
              My Archive
            </h1>
            <p className="text-sm text-[#8a7355] uppercase tracking-widest">
              Your generated blueprints & recipes
            </p>
            {usingLocal && (
              <span className="inline-block mt-1.5 text-[10px] text-[#5c4020] bg-[#1a1008] border border-[#3d2510] px-2 py-0.5 rounded-full">
                Saved locally — connect Supabase to sync across devices
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4">
            {[
              { label: 'Total', value: creations.length, color: '#c9a84c' },
              { label: 'Projects', value: creations.filter(c => c.type === 'thing').length, color: '#90b0d0' },
              { label: 'Recipes', value: creations.filter(c => c.type === 'recipe').length, color: '#c9a84c' },
            ].map(stat => (
              <div key={stat.label} className="text-center px-4 py-2 rounded-xl" style={{ background: 'rgba(37,24,8,0.6)', border: '1px solid rgba(60,40,20,0.6)' }}>
                <p className="text-xl font-bold" style={{ color: stat.color, fontFamily: 'Cinzel, serif' }}>{stat.value}</p>
                <p className="text-[9px] text-[#8a7355] uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filters + Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
          {/* Filter tabs */}
          <div className="flex bg-[#120a05] p-1 rounded-xl border border-[#2a1a0e] flex-shrink-0">
            {['all', 'thing', 'recipe'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all"
                style={{
                  background: filter === f ? 'linear-gradient(135deg, #3d2510, #2a1a0e)' : 'transparent',
                  color: filter === f ? '#c9a84c' : '#8a7355',
                  border: filter === f ? '1px solid rgba(139,105,20,0.4)' : '1px solid transparent',
                  boxShadow: filter === f ? '0 2px 8px rgba(0,0,0,0.4)' : 'none',
                }}
              >
                {f === 'thing' ? '🔨 Projects' : f === 'recipe' ? '🍳 Recipes' : '✨ All'}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#5c4020]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search blueprints..."
              className="w-full bg-[#120a05] border border-[#2a1a0e] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#d8c4a0] placeholder:text-[#3d2510] focus:outline-none focus:border-[#5c4020] transition-colors"
            />
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative">
              <Loader2 className="h-10 w-10 text-[#8b6914] animate-spin" />
              <div className="absolute inset-0 rounded-full blur-md opacity-30" style={{ background: '#8b6914' }} />
            </div>
            <p className="text-[#8a7355] text-sm uppercase tracking-widest animate-soft-pulse">Accessing Archives...</p>
          </div>
        ) : filteredCreations.length === 0 ? (
          <div className="text-center py-24 rounded-2xl" style={{ background: 'rgba(18,10,5,0.8)', border: '1px dashed rgba(60,40,20,0.5)' }}>
            <div className="text-5xl mb-4">📜</div>
            <h3 className="text-xl font-bold text-[#c4a882] mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
              {searchQuery ? 'No Results Found' : 'The Archives are Empty'}
            </h3>
            <p className="text-[#8a7355] text-sm mb-8 max-w-xs mx-auto leading-relaxed">
              {searchQuery
                ? `No blueprints match "${searchQuery}". Try a different search.`
                : "You haven't saved any blueprints yet. Head to the makers to forge something new!"}
            </p>
            <div className="flex justify-center gap-4">
              <button onClick={() => navigate('/thing-maker')}
                className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:-translate-y-1"
                style={{ background: 'rgba(37,24,8,0.8)', border: '1px solid rgba(90,60,20,0.8)', color: '#c9a84c' }}>
                🔨 Thing Maker
              </button>
              <button onClick={() => navigate('/recipe-maker')}
                className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:-translate-y-1"
                style={{ background: 'rgba(37,24,8,0.8)', border: '1px solid rgba(90,60,20,0.8)', color: '#c9a84c' }}>
                🍳 Recipe Maker
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCreations.map((item, idx) => {
              const data = item.data || {};
              const isRecipe = item.type === 'recipe';
              const Icon = isRecipe ? ChefHat : Wrench;
              const accentColor = isRecipe ? '#c9a84c' : '#90b0d0';
              const isHovered = hoveredId === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => openBlueprint(item)}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="relative rounded-xl p-5 cursor-pointer transition-all duration-400 group"
                  style={{
                    background: 'linear-gradient(135deg, rgba(26,16,8,0.95), rgba(18,10,5,0.98))',
                    border: `1px solid ${isHovered ? accentColor + '80' : 'rgba(60,40,20,0.5)'}`,
                    transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                    boxShadow: isHovered
                      ? `0 20px 40px rgba(0,0,0,0.5), 0 0 20px ${accentColor}15`
                      : '0 4px 16px rgba(0,0,0,0.3)',
                    borderLeft: `3px solid ${accentColor}`,
                    animationDelay: `${idx * 50}ms`,
                  }}
                >
                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDelete(e, item.id)}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all hover:bg-red-900/30"
                    style={{ color: '#8a7355' }}
                    title="Delete blueprint"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>

                  <div className="flex justify-between items-start mb-4">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-all"
                      style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}40` }}>
                      <Icon className="h-5 w-5" style={{ color: accentColor }} />
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg"
                      style={{ background: 'rgba(10,6,3,0.8)', border: '1px solid rgba(40,25,10,0.8)', color: '#5c4020' }}>
                      <Calendar className="h-2.5 w-2.5" />
                      {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <h3 className="text-base font-bold mb-2 line-clamp-2 leading-snug" style={{ fontFamily: 'Playfair Display, serif', color: '#e8d9b8' }}>
                    {data.title || 'Untitled Blueprint'}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-[#8a7355] mb-3">
                    {isRecipe ? (
                      <>
                        <span>Prep: <span style={{ color: '#c4a882' }}>{data.prepTime || 'N/A'}</span></span>
                        <span>Cook: <span style={{ color: '#c4a882' }}>{data.cookTime || 'N/A'}</span></span>
                        {data.servings && <span>Serves: <span style={{ color: '#c4a882' }}>{data.servings}</span></span>}
                      </>
                    ) : (
                      <>
                        <span>Time: <span style={{ color: '#c4a882' }}>{data.estimatedTime || 'N/A'}</span></span>
                        <span>Diff: <span style={{ color: '#c4a882' }}>{data.difficulty || 'N/A'}</span></span>
                      </>
                    )}
                  </div>

                  <p className="text-xs text-[#8a7355] line-clamp-2 leading-relaxed mb-4">
                    {isRecipe
                      ? `Ingredients: ${(data.ingredients || []).slice(0, 3).join(', ')}${(data.ingredients || []).length > 3 ? '...' : ''}`
                      : `Materials: ${(data.materialsRequired || []).slice(0, 2).join(', ')}${(data.materialsRequired || []).length > 2 ? '...' : ''}`}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                        style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}40`, color: accentColor }}>
                        {item.type}
                      </span>
                      <span className="text-[9px] text-[#5c4020]">
                        {(data.instructions || []).length} steps
                      </span>
                    </div>
                    <span className="text-xs font-bold flex items-center gap-1 transition-colors group-hover:translate-x-1"
                      style={{ color: accentColor }}>
                      View Blueprint →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedBlueprint && (
        <BlueprintModal
          blueprint={selectedBlueprint}
          type={selectedType}
          onClose={() => setSelectedBlueprint(null)}
          onNavigate={() => {
            setSelectedBlueprint(null);
            navigate(selectedType === 'recipe' ? '/recipe-maker' : '/thing-maker');
          }}
        />
      )}
    </div>
  );
}
