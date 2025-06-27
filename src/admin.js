import { PROFILES } from './modules/profiles.js';
import { ProfileStorage } from './modules/storage.js';

class AdminPanel {
    constructor() {
        this.profiles = this.loadProfiles();
        this.currentProfileId = 'agil_1';
        this.changes = [];
        this.isAuthenticated = false;
    }

    // Autenticación simple
    authenticate(pin) {
        // PIN hardcodeado por simplicidad - en producción usar hash
        const ADMIN_PIN = '123456';

        if (pin === ADMIN_PIN) {
            this.isAuthenticated = true;
            this.showAdminPanel();
            return true;
        }
        return false;
    }

    loadProfiles() {
        // Cargar perfiles guardados o usar defaults
        return ProfileStorage.loadProfiles() || PROFILES;
    }

    showAdminPanel() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        this.renderAdminPanel();
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
                ${Object.values(this.profiles).map(profile => `
                    <button
                        class="profile-tab ${profile.id === this.currentProfileId ? 'active' : ''}"
                        onclick="admin.selectProfile('${profile.id}')"
                    >
                        ${profile.name}
                    </button>
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

        this.showHistory();
    }

    renderConfigSections() {
        const profile = this.profiles[this.currentProfileId];
        const config = profile.config;

        return `
            <!-- Base Fija -->
            <section class="config-section">
                <h2>💰 Salario Base</h2>
                <div class="config-field">
                    <label>Base Fija (Gs):</label>
                    <input
                        type="number"
                        value="${config.base}"
                        onchange="admin.updateValue('base', this.value)"
                        class="money-input"
                    >
                </div>
            </section>

            <!-- Metas -->
            <section class="config-section">
                <h2>🎯 Metas por Nivel</h2>
                ${this.renderMetasTable(config.metas, config.niveles)}
            </section>

            <!-- Pagos -->
            <section class="config-section">
                <h2>💵 Pagos/Bonos por Nivel</h2>
                ${this.renderPagosTable(config.pagos, config.niveles)}
            </section>

            <!-- Multiplicadores -->
            <section class="config-section">
                <h2>📊 Multiplicadores</h2>
                ${this.renderMultiplicadores(config.multiplicadores)}
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
                            <td>
                                <input
                                    type="number"
                                    value="${metas.montoInterno[i]}"
                                    onchange="admin.updateMeta('montoInterno', ${i}, this.value)"
                                    class="table-input money"
                                >
                            </td>
                            <td>
                                <input
                                    type="number"
                                    value="${metas.montoExterno[i]}"
                                    onchange="admin.updateMeta('montoExterno', ${i}, this.value)"
                                    class="table-input money"
                                >
                            </td>
                            <td>
                                <input
                                    type="number"
                                    value="${metas.montoRecuperado[i]}"
                                    onchange="admin.updateMeta('montoRecuperado', ${i}, this.value)"
                                    class="table-input money"
                                >
                            </td>
                            <td>
                                <input
                                    type="number"
                                    value="${metas.cantidad[i]}"
                                    onchange="admin.updateMeta('cantidad', ${i}, this.value)"
                                    class="table-input"
                                >
                            </td>
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
                            <td>
                                <input
                                    type="number"
                                    value="${pagos.carrera[i]}"
                                    onchange="admin.updatePago('carrera', ${i}, this.value)"
                                    class="table-input money"
                                >
                            </td>
                            <td>
                                <input
                                    type="number"
                                    value="${pagos.montoInterno[i]}"
                                    onchange="admin.updatePago('montoInterno', ${i}, this.value)"
                                    class="table-input money"
                                >
                            </td>
                            <td>
                                <input
                                    type="number"
                                    value="${pagos.montoExterno[i]}"
                                    onchange="admin.updatePago('montoExterno', ${i}, this.value)"
                                    class="table-input money"
                                >
                            </td>
                            <td>
                                <input
                                    type="number"
                                    value="${pagos.montoRecuperado[i]}"
                                    onchange="admin.updatePago('montoRecuperado', ${i}, this.value)"
                                    class="table-input money"
                                >
                            </td>
                            <td>
                                <input
                                    type="number"
                                    value="${pagos.cantidad[i]}"
                                    onchange="admin.updatePago('cantidad', ${i}, this.value)"
                                    class="table-input money"
                                >
                            </td>
                            <td>
                                <input
                                    type="number"
                                    value="${pagos.equipo[i]}"
                                    onchange="admin.updatePago('equipo', ${i}, this.value)"
                                    class="table-input money"
                                >
                            </td>
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
                                <tr>
                                    <th>Rango</th>
                                    <th>Multiplicador</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${valores.map((item, i) => `
                                    <tr>
                                        <td>${item.text}</td>
                                        <td>
                                            <input
                                                type="number"
                                                value="${item.mult}"
                                                step="0.05"
                                                min="0"
                                                max="2"
                                                onchange="admin.updateMultiplicador('${tipo}', ${i}, this.value)"
                                                class="mult-input"
                                            > = ${Math.round(item.mult * 100)}%
                                        </td>
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

    // Métodos de actualización
    updateValue(field, value) {
        const numValue = parseInt(value, 10);
        this.profiles[this.currentProfileId].config[field] = numValue;
        this.trackChange(`Base fija`, `Cambio a ${this.formatMoney(numValue)}`);
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
        this.profiles[this.currentProfileId].config.multiplicadores[tipo][index].mult = numValue;
        const porcentaje = Math.round(numValue * 100);
        this.trackChange(`Multiplicador ${tipo}`, `Rango ${index + 1}: ${porcentaje}%`);
        this.showPreview();
    }

    // Tracking de cambios
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
                ${this.changes.map(change => `
                    <div class="change-item">
                        <span class="change-field">${change.campo}:</span>
                        <span class="change-detail">${change.detalle}</span>
                        <span class="change-profile">(${this.profiles[change.profile].name})</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Guardar cambios
    saveChanges() {
        if (this.changes.length === 0) {
            alert('No hay cambios para guardar');
            return;
        }

        if (confirm(`¿Guardar ${this.changes.length} cambios?`)) {
            // Guardar en localStorage
            ProfileStorage.saveProfiles(this.profiles);

            // Guardar historial
            this.saveHistory();

            // Limpiar cambios
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

        // Mantener solo últimos 50 registros
        if (history.length > 50) {
            history.shift();
        }

        localStorage.setItem('admin_history', JSON.stringify(history));
        this.showHistory();
    }

    showHistory() {
        const history = JSON.parse(localStorage.getItem('admin_history') || '[]');
        const historyDiv = document.getElementById('changeHistory');

        historyDiv.innerHTML = `
            <table class="history-table">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Usuario</th>
                        <th>Cambios</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${history.reverse().slice(0, 10).map((entry, i) => `
                        <tr>
                            <td>${new Date(entry.date).toLocaleString('es-PY')}</td>
                            <td>${entry.user}</td>
                            <td>${entry.changes}</td>
                            <td>
                                <button onclick="admin.showHistoryDetail(${i})" class="btn-detail">
                                    Ver detalle
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    // Utilidades
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
            } catch (error) {
                alert('❌ Error al importar: ' + error.message);
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

    showHistoryDetail(index) {
        const history = JSON.parse(localStorage.getItem('admin_history') || '[]');
        const entry = history.reverse()[index];
        if (entry) {
            alert(JSON.stringify(entry.details, null, 2));
        }
    }
}

// Inicializar
const admin = new AdminPanel();

// Login handler
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const pin = document.getElementById('adminPin').value;

    if (!admin.authenticate(pin)) {
        alert('❌ PIN incorrecto');
        document.getElementById('adminPin').value = '';
    }
});

// Exportar para uso global
window.admin = admin;
