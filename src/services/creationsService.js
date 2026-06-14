import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEY = 'creaforge_creations';
const GUEST_ID_KEY = 'creaforge_guest_id';

async function getGuestId() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.auth.getSession();
    if (data?.session?.user) {
      return data.session.user.id;
    }
    const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
    if (!authError && authData?.user) {
      return authData.user.id;
    }
    console.warn("Failed anonymous sign-in, falling back to local ID", authError);
  }

  let guestId = localStorage.getItem(GUEST_ID_KEY);
  if (!guestId) {
    guestId = 'guest_' + (crypto.randomUUID?.() || String(Date.now()));
    localStorage.setItem(GUEST_ID_KEY, guestId);
  }
  return guestId;
}

function readLocalCreations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocalCreations(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export const creationsService = {
  async save(type, data) {
    const guestId = await getGuestId();
    const record = {
      id: crypto.randomUUID?.() || String(Date.now()),
      user_id: guestId,
      type,
      data,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        const { data: saved, error } = await supabase
          .from('creations')
          .insert([{ user_id: guestId, type, data }])
          .select()
          .single();
        if (!error && saved) return saved;
        if (error) console.warn('Supabase save failed, using local storage:', error.message);
      } catch (err) {
        console.warn('Supabase unavailable, using local storage:', err);
      }
    }

    const local = readLocalCreations();
    local.unshift(record);
    writeLocalCreations(local);
    return record;
  },

  async fetchAll() {
    const guestId = await getGuestId();
    const localData = readLocalCreations();
    
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('creations')
          .select('*')
          .eq('user_id', guestId)
          .order('created_at', { ascending: false })
          .limit(100);
          
        if (!error && data) {
          const supabaseIds = new Set(data.map(d => d.id));
          const offlineOnly = localData.filter(d => !supabaseIds.has(d.id));
          return [...data, ...offlineOnly].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
        if (error) console.warn('Supabase fetch failed, using local storage:', error.message);
      } catch (err) {
        console.warn('Supabase unavailable, using local storage:', err);
      }
    }

    return localData;
  },

  isUsingLocalStorage() {
    return !isSupabaseConfigured;
  },

  async delete(id) {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('creations').delete().eq('id', id);
        if (!error) {
          // Also clean local cache
          const local = readLocalCreations().filter(c => c.id !== id);
          writeLocalCreations(local);
          return;
        }
        console.warn('Supabase delete failed, deleting locally:', error.message);
      } catch (err) {
        console.warn('Supabase unavailable:', err);
      }
    }
    const local = readLocalCreations().filter(c => c.id !== id);
    writeLocalCreations(local);
  },
};
