export const STORAGE_KEY = 'commission_profiles';

export const ProfileStorage = {
    saveProfiles(profiles) {
        const data = {
            version: '1.0',
            timestamp: Date.now(),
            profiles
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    },

    loadProfiles() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return null;
            const data = JSON.parse(stored);
            return data.profiles || null;
        } catch (e) {
            console.error('Error cargando perfiles:', e);
            return null;
        }
    },

    exportProfiles() {
        const profiles = this.loadProfiles();
        const blob = new Blob([JSON.stringify(profiles || {}, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `perfiles_comisiones_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    },

    importProfiles(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const profiles = JSON.parse(e.target.result);
                    this.saveProfiles(profiles);
                    resolve(profiles);
                } catch (err) {
                    reject(err);
                }
            };
            reader.readAsText(file);
        });
    }
};
