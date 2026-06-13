import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEY = 'creaforge_creations';
const GUEST_ID_KEY = 'creaforge_guest_id';

function getGuestId() {
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
    const guestId = getGuestId();
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
    const guestId = getGuestId();
    
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('creations')
          .select('*')
          .eq('user_id', guestId)
          .order('created_at', { ascending: false });
        if (!error && data) return data;
        if (error) console.warn('Supabase fetch failed, using local storage:', error.message);
      } catch (err) {
        console.warn('Supabase unavailable, using local storage:', err);
      }
    }

    return readLocalCreations();
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
