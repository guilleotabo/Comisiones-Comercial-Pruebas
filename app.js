// Variable global para la configuración
let appConfig = {};

// Función principal que se ejecuta para actualizar todos los cálculos y la interfaz
function updateCalculations() {
    // 1. Obtener todos los valores actuales de los campos de entrada
    const values = UI.getFormValues();

    // 2. Validar y mostrar alerta si es necesario
    if (values.montoInterno > 0 && values.montoRecuperado > values.montoInterno * 0.5) {
        if (!updateCalculations.recAlertShown) {
            alert('⚠️ Recuperados superan el 50% del monto interno');
            updateCalculations.recAlertShown = true; // Evita mostrar la alerta repetidamente
        }
    } else {
        updateCalculations.recAlertShown = false;
    }

    // 3. Realizar todos los cálculos de negocio (devuelve los resultados, no toca la UI)
    const results = Calculos.computeAll(values, appConfig);

    // 4. Actualizar toda la interfaz de usuario con los nuevos resultados
    UI.renderAll(values, results, appConfig);

    // 5. Generar y mostrar las sugerencias personalizadas
    const suggestions = Calculos.generarSugerencias(values, results, appConfig);
    UI.renderSuggestions(suggestions);
}

// Lógica de autoguardado y restauración de borrador
(function() {
    let saveTimer;
    const indicator = document.getElementById('saveIndicator');

    function showIndicator() {
        if (indicator) {
            indicator.textContent = '⚡ Guardando...';
            indicator.classList.add('saving');
        }
    }

    function hideIndicator() {
        if (indicator) {
            indicator.classList.remove('saving');
            indicator.textContent = '';
        }
    }

    function restoreDraft() {
        try {
            const draft = JSON.parse(localStorage.getItem('draftCommission') || '{}');
            Object.entries(draft).forEach(([id, val]) => {
                const el = document.getElementById(id);
                if (!el) return;
                el.value = val;
                if (el.classList.contains('required')) {
                    el.classList.toggle('filled', !!val);
                    el.classList.toggle('empty', !val);
                }
            });
        } catch (e) {
            console.warn('No se pudo restaurar el borrador.', e);
        }
    }

    function autosave(e) {
        const el = e.target;
        if (!el.id || !el.closest('.left-panel')) return; // Solo guardar campos del panel izquierdo
        
        const draft = JSON.parse(localStorage.getItem('draftCommission') || '{}');
        draft[el.id] = el.value;
        
        showIndicator();
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
            localStorage.setItem('draftCommission', JSON.stringify(draft));
            hideIndicator();
        }, 500);
    }
    
    // Asignar el evento al contenedor principal para delegación
    document.addEventListener('input', autosave);
    
    // Exponer la función para que pueda ser llamada desde `eventos.js`
    window.restoreDraft = restoreDraft;
})();


// --- Inicialización de la aplicación ---
// Se ejecuta cuando el DOM está completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    // Cargar la configuración global
    appConfig = getConfig(); 
    
    // Configurar los eventos de la aplicación
    Eventos.init(); 
    
    // Restaurar datos guardados si existen
    if(window.restoreDraft) {
        window.restoreDraft();
    }
    
    // Realizar el cálculo inicial con los valores por defecto o restaurados
    updateCalculations();
});

// Función para obtener la configuración (de config.js o localStorage)
function getConfig() {
    const savedConfig = localStorage.getItem('comisionesConfig');
    return savedConfig ? JSON.parse(savedConfig) : (typeof CONFIG !== 'undefined' ? CONFIG : {});
}
