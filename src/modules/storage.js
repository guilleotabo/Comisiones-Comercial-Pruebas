// Functions for persisting profile configuration

export const STORAGE_KEY = 'commission_profiles';

export function loadStoredProfiles() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return null;
        const data = JSON.parse(stored);
        return data.profiles || null;
    } catch (e) {
        console.error('Error cargando perfiles almacenados:', e);
        return null;
    }
}

export function saveProfiles(profiles) {
    const data = { version: '1.0', timestamp: Date.now(), profiles };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
