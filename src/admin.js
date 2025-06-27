class ProfileStorage {
    static STORAGE_KEY = 'commission_profiles';

    static saveProfiles(profiles) {
        const data = {
            version: '1.0',
            timestamp: Date.now(),
            profiles: profiles
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    }

    static loadProfiles() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (!stored) return null;
            const data = JSON.parse(stored);
            return data.profiles || null;
        } catch (e) {
            console.error('Error cargando perfiles:', e);
            return null;
        }
    }

    static exportProfiles() {
        const profiles = this.loadProfiles() || DEFAULT_PROFILES;
        const blob = new Blob([JSON.stringify(profiles, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `perfiles_comisiones_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    }

    static importProfiles(file) {
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
}

const DEFAULT_BASE_CONFIG = {
    niveles: ['Capilla', 'Junior', 'Senior A', 'Senior B', 'Máster', 'Genio'],
    metas: {
        montoInterno: [600000000, 800000000, 900000000, 1000000000, 1100000000, 1200000000],
        montoExterno: [50000000, 100000000, 150000000, 200000000, 300000000, 400000000],
        montoRecuperado: [40000000, 60000000, 80000000, 100000000, 120000000, 150000000],
        cantidad: [6, 8, 9, 10, 12, 13]
    },
    pagos: {
        base: 3000000,
        carrera: [0, 0, 500000, 1000000, 1500000, 2000000],
        montoInterno: [500000, 600000, 1000000, 1400000, 2000000, 2500000],
        montoExterno: [800000, 1000000, 1500000, 2000000, 2500000, 3300000],
        montoRecuperado: [300000, 400000, 500000, 600000, 800000, 1000000],
        cantidad: [0, 400000, 600000, 700000, 1000000, 1200000],
        equipo: [0, 0, 0, 500000, 800000, 1000000]
    },
    multConversion: [
        {min: 10, mult: 1.1, text: '10%+'},
        {min: 8, mult: 1.0, text: '8%'},
        {min: 7, mult: 0.8, text: '7%'},
        {min: 6, mult: 0.7, text: '6%'},
        {min: 5, mult: 0.6, text: '5%'},
        {min: 4, mult: 0.5, text: '4%'},
        {min: 0, mult: 0.3, text: '<4%'}
    ],
    multEmpatia: [
        {min: 96, mult: 1.0, text: '96%+'},
        {min: 90, mult: 0.9, text: '90%'},
        {min: 80, mult: 0.5, text: '80%'},
        {min: 70, mult: 0.3, text: '70%'},
        {min: 0, mult: 0, text: '<70%'}
    ],
    multProceso: [
        {min: 95, mult: 1.0, text: '95%+'},
        {min: 90, mult: 0.95, text: '90%'},
        {min: 85, mult: 0.8, text: '85%'},
        {min: 70, mult: 0.3, text: '70%'},
        {min: 0, mult: 0, text: '<70%'}
    ],
    multMora: [
        {min: 0, mult: 1.05, text: '0-2%'},
        {min: 3, mult: 0.95, text: '3-7%'},
        {min: 8, mult: 0.9, text: '8-9%'},
        {min: 10, mult: 0.85, text: '10-14%'},
        {min: 15, mult: 0.7, text: '15%+'}
    ]
};

function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

const DEFAULT_PROFILES = {
    agil_1: { id: 'agil_1', name: 'Ágil 1', config: clone(DEFAULT_BASE_CONFIG) },
    agil_2: { id: 'agil_2', name: 'Ágil 2', config: clone(DEFAULT_BASE_CONFIG) },
    empresarial_1: { id: 'empresarial_1', name: 'Empresarial 1', config: clone(DEFAULT_BASE_CONFIG) },
    empresarial_2: { id: 'empresarial_2', name: 'Empresarial 2', config: clone(DEFAULT_BASE_CONFIG) }
};

class AdminPanel {
    constructor() {
        this.profiles = this.loadProfiles();
        this.currentProfileId = 'agil_1';
        this.changes = [];
        this.isAuthenticated = false;
    }

    authenticate(pin) {
        const ADMIN_PIN = '123456';
        if (pin === ADMIN_PIN) {
            this.isAuthenticated = true;
            this.showAdminPanel();
            return true;
        }
        return false;
    }

    loadProfiles() {
        return ProfileStorage.loadProfiles() || clone(DEFAULT_PROFILES);
    }

    showAdminPanel() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        this.renderAdminPanel();
        this.showHistory();
    }

    renderAdminPanel() {
        const panel = document.getElementById('adminPanel');
        panel.innerHTML = `
            <header class="admin-header">
                <h1>🛠️ Panel de Administración - Comisiones</h1>
                <div class="admin-actions">
                    <button onclick="admin.saveChanges()" class="btn-save">💾 Guardar Cambios</button>
                    <button onclick="admin.exportConfig()" class="btn-export">📥 Exportar</button>
                    <button onclick="admin.importConfig()" class="btn-import">📤 Importar</button>
                    <button onclick="admin.logout()" class="btn-logout">🚪 Salir</button>
                </div>
            </header>
            <div class="profile-tabs">
                ${Object.values(this.profiles).map(p => `
                    <button class="profile-tab ${p.id === this.currentProfileId ? 'active' : ''}" onclick="admin.selectProfile('${p.id}')">${p.name}</button>
                `).join('')}
            </div>
            <div class="config-sections">
                ${this.renderConfigSections()}
            </div>
            <div class="preview-section">
                <h3>Vista Previa de Cambios</h3>
                <div id="changePreview"></div>
            </div>
            <div class="history-section">
                <h3>Historial de Cambios</h3>
                <div id="changeHistory"></div>
            </div>
        `;
    }

    renderConfigSections() {
        const profile = this.profiles[this.currentProfileId];
        const config = profile.config;
        return `
            <section class="config-section">
                <h2>💰 Salario Base</h2>
                <div class="config-field">
                    <label>Base Fija (Gs):</label>
                    <input type="number" value="${config.pagos.base}" onchange="admin.updateValue('base', this.value)" class="money-input">
                </div>
            </section>
            <section class="config-section">
                <h2>🎯 Metas por Nivel</h2>
                ${this.renderMetasTable(config.metas, config.niveles)}
            </section>
            <section class="config-section">
                <h2>💵 Pagos/Bonos por Nivel</h2>
                ${this.renderPagosTable(config.pagos, config.niveles)}
            </section>
            <section class="config-section">
                <h2>📊 Multiplicadores</h2>
                ${this.renderMultiplicadores({conversion: config.multConversion, empatia: config.multEmpatia, proceso: config.multProceso, mora: config.multMora})}
            </section>
        `;
    }

    renderMetasTable(metas, niveles) {
        return `
            <table class="config-table">
                <thead>
                    <tr>
                        <th>Nivel</th>
                        <th>Monto Interno</th>
                        <th>Monto Externo</th>
                        <th>Recuperados</th>
                        <th>Cantidad</th>
                    </tr>
                </thead>
                <tbody>
                    ${niveles.map((nivel, i) => `
                        <tr>
                            <td><strong>${nivel}</strong></td>
                            <td><input type="number" value="${metas.montoInterno[i]}" onchange="admin.updateMeta('montoInterno', ${i}, this.value)" class="table-input money"></td>
                            <td><input type="number" value="${metas.montoExterno[i]}" onchange="admin.updateMeta('montoExterno', ${i}, this.value)" class="table-input money"></td>
                            <td><input type="number" value="${metas.montoRecuperado[i]}" onchange="admin.updateMeta('montoRecuperado', ${i}, this.value)" class="table-input money"></td>
                            <td><input type="number" value="${metas.cantidad[i]}" onchange="admin.updateMeta('cantidad', ${i}, this.value)" class="table-input"></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    renderPagosTable(pagos, niveles) {
        return `
            <table class="config-table">
                <thead>
                    <tr>
                        <th>Nivel</th>
                        <th>Carrera</th>
                        <th>Interno</th>
                        <th>Externo</th>
                        <th>Recuperado</th>
                        <th>Cantidad</th>
                        <th>Equipo</th>
                    </tr>
                </thead>
                <tbody>
                    ${niveles.map((nivel, i) => `
                        <tr>
                            <td><strong>${nivel}</strong></td>
                            <td><input type="number" value="${pagos.carrera[i]}" onchange="admin.updatePago('carrera', ${i}, this.value)" class="table-input money"></td>
                            <td><input type="number" value="${pagos.montoInterno[i]}" onchange="admin.updatePago('montoInterno', ${i}, this.value)" class="table-input money"></td>
                            <td><input type="number" value="${pagos.montoExterno[i]}" onchange="admin.updatePago('montoExterno', ${i}, this.value)" class="table-input money"></td>
                            <td><input type="number" value="${pagos.montoRecuperado[i]}" onchange="admin.updatePago('montoRecuperado', ${i}, this.value)" class="table-input money"></td>
                            <td><input type="number" value="${pagos.cantidad[i]}" onchange="admin.updatePago('cantidad', ${i}, this.value)" class="table-input money"></td>
                            <td><input type="number" value="${pagos.equipo[i]}" onchange="admin.updatePago('equipo', ${i}, this.value)" class="table-input money"></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    renderMultiplicadores(multiplicadores) {
        return `
            <div class="multiplicadores-grid">
                ${Object.entries(multiplicadores).map(([tipo, valores]) => `
                    <div class="multiplicador-config">
                        <h4>${this.getTipoLabel(tipo)}</h4>
                        <table class="mult-table">
                            <thead>
                                <tr><th>Rango</th><th>Multiplicador</th></tr>
                            </thead>
                            <tbody>
                                ${valores.map((item, i) => `
                                    <tr>
                                        <td>${item.text}</td>
                                        <td><input type="number" value="${item.mult}" step="0.05" min="0" max="2" onchange="admin.updateMultiplicador('${tipo}', ${i}, this.value)" class="mult-input"> = ${Math.round(item.mult * 100)}%</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getTipoLabel(tipo) {
        const labels = {
            conversion: '% Conversión',
            empatia: '% Empatía/Mystery',
            proceso: '% Proceso/CRM',
            mora: '% Mora'
        };
        return labels[tipo] || tipo;
    }

    updateValue(field, value) {
        const numValue = parseInt(value, 10);
        this.profiles[this.currentProfileId].config.pagos.base = numValue;
        this.trackChange('Base fija', `Cambio a ${this.formatMoney(numValue)}`);
        this.showPreview();
    }

    updateMeta(tipo, index, value) {
        const numValue = parseInt(value, 10);
        this.profiles[this.currentProfileId].config.metas[tipo][index] = numValue;
        const nivel = this.profiles[this.currentProfileId].config.niveles[index];
        this.trackChange(`Meta ${tipo}`, `${nivel}: ${this.formatMoney(numValue)}`);
        this.showPreview();
    }

    updatePago(tipo, index, value) {
        const numValue = parseInt(value, 10);
        this.profiles[this.currentProfileId].config.pagos[tipo][index] = numValue;
        const nivel = this.profiles[this.currentProfileId].config.niveles[index];
        this.trackChange(`Pago ${tipo}`, `${nivel}: ${this.formatMoney(numValue)}`);
        this.showPreview();
    }

    updateMultiplicador(tipo, index, value) {
        const numValue = parseFloat(value);
        const key = this.getMultipKey(tipo);
        this.profiles[this.currentProfileId].config[key][index].mult = numValue;
        const porcentaje = Math.round(numValue * 100);
        this.trackChange(`Multiplicador ${tipo}`, `Rango ${index + 1}: ${porcentaje}%`);
        this.showPreview();
    }

    getMultipKey(tipo) {
        return {
            conversion: 'multConversion',
            empatia: 'multEmpatia',
            proceso: 'multProceso',
            mora: 'multMora'
        }[tipo];
    }

    trackChange(campo, detalle) {
        this.changes.push({
            timestamp: new Date(),
            profile: this.currentProfileId,
            campo,
            detalle
        });
    }

    showPreview() {
        const preview = document.getElementById('changePreview');
        if (this.changes.length === 0) {
            preview.innerHTML = '<p class="no-changes">Sin cambios pendientes</p>';
            return;
        }
        preview.innerHTML = `
            <div class="changes-list">
                ${this.changes.map(c => `<div class="change-item"><span class="change-field">${c.campo}:</span><span class="change-detail">${c.detalle}</span><span class="change-profile">(${this.profiles[c.profile].name})</span></div>`).join('')}
            </div>
        `;
    }

    saveChanges() {
        if (this.changes.length === 0) {
            alert('No hay cambios para guardar');
            return;
        }
        if (confirm(`¿Guardar ${this.changes.length} cambios?`)) {
            ProfileStorage.saveProfiles(this.profiles);
            this.saveHistory();
            this.changes = [];
            this.showPreview();
            alert('✅ Cambios guardados exitosamente');
        }
    }

    saveHistory() {
        const history = JSON.parse(localStorage.getItem('admin_history') || '[]');
        history.push({
            date: new Date().toISOString(),
            user: 'Admin',
            changes: this.changes.length,
            details: this.changes
        });
        if (history.length > 50) history.shift();
        localStorage.setItem('admin_history', JSON.stringify(history));
        this.showHistory();
    }

    showHistory() {
        const history = JSON.parse(localStorage.getItem('admin_history') || '[]');
        const historyDiv = document.getElementById('changeHistory');
        historyDiv.innerHTML = `
            <table class="history-table">
                <thead><tr><th>Fecha</th><th>Usuario</th><th>Cambios</th><th>Acciones</th></tr></thead>
                <tbody>
                    ${history.slice().reverse().slice(0,10).map((entry, i) => `
                        <tr>
                            <td>${new Date(entry.date).toLocaleString('es-PY')}</td>
                            <td>${entry.user}</td>
                            <td>${entry.changes}</td>
                            <td><button onclick="admin.showHistoryDetail(${i})" class="btn-detail">Ver detalle</button></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    showHistoryDetail(index) {
        const history = JSON.parse(localStorage.getItem('admin_history') || '[]');
        const entry = history.slice().reverse()[index];
        if (!entry) return;
        alert(entry.details.map(d => `${d.campo}: ${d.detalle}`).join('\n'));
    }

    formatMoney(value) {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' Gs';
    }

    selectProfile(profileId) {
        this.currentProfileId = profileId;
        this.renderAdminPanel();
    }

    exportConfig() {
        ProfileStorage.exportProfiles();
    }

    async importConfig() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            try {
                const file = e.target.files[0];
                const profiles = await ProfileStorage.importProfiles(file);
                this.profiles = profiles;
                this.renderAdminPanel();
                alert('✅ Configuración importada exitosamente');
            } catch (err) {
                alert('❌ Error al importar: ' + err.message);
            }
        };
        input.click();
    }

    logout() {
        if (confirm('¿Salir del panel de administración?')) {
            this.isAuthenticated = false;
            window.location.reload();
        }
    }
}

const admin = new AdminPanel();

document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const pin = document.getElementById('adminPin').value;
    if (!admin.authenticate(pin)) {
        alert('❌ PIN incorrecto');
        document.getElementById('adminPin').value = '';
    }
});

window.admin = admin;
