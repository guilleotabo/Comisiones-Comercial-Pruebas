const Eventos = (function() {

    // --- LÓGICA DE EVENTOS ---

    let debounceTimer;
    // La función de debounce espera a que el usuario deje de teclear para ejecutar el cálculo,
    // mejorando el rendimiento.
    function debounceUpdate() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            updateCalculations();
        }, 300); // Espera 300ms después de la última tecla
    }

    function handleFormInput(event) {
        const input = event.target;
        
        // Validar y formatear campos numéricos
        if (['montoInterno', 'montoExterno', 'montoRecuperado'].includes(input.id)) {
             const value = input.value.replace(/\D/g, ''); // Solo números
             const cursorPos = input.selectionStart;
             const oldLength = input.value.length;
             
             input.value = value ? UI.formatNumber(parseInt(value, 10)) : '';
             
             const newLength = input.value.length;
             input.setSelectionRange(cursorPos + (newLength - oldLength), cursorPos + (newLength - oldLength));
        }
        
        // Validar campos de porcentaje
        if (['conversion', 'empatia', 'proceso', 'mora'].includes(input.id)) {
            let value = parseInt(input.value.replace(/\D/g, ''), 10);
            if (isNaN(value) || value < 0) value = 0;
            if (value > 100) value = 100;
            input.value = value;
        }

        // Marcar campos requeridos como llenos o vacíos
        if (input.classList.contains('required')) {
            input.classList.toggle('filled', !!input.value);
            input.classList.toggle('empty', !input.value);
        }

        debounceUpdate();
    }
    
    // Delegación de eventos para clics en elementos dinámicos
    function handleContainerClick(event) {
        const target = event.target.closest('[data-tipo]');

        if (target && (target.classList.contains('progress-segment') || target.classList.contains('multiplier-row'))) {
            const tipo = target.dataset.tipo;
            const valor = target.dataset.valor;
            const input = document.getElementById(tipo);
            if (input) {
                input.value = valor;
                // Disparar un evento de input para que se actualice todo
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }
    }
    
    function limpiarTodo() {
        if (confirm('¿Seguro que querés limpiar todos los datos?')) {
            document.querySelectorAll('.left-panel input, .left-panel select').forEach(el => {
                const defaultValue = {
                    'nivelAnterior': '2',
                    'nivelEquipo': '2',
                    'menorSemana': '2',
                    'conversion': '8',
                    'empatia': '96',
                    'proceso': '95',
                    'mora': '2'
                }[el.id] || '';
                
                el.value = defaultValue;
                el.dispatchEvent(new Event('input', { bubbles: true })); // Para que se actualice la UI
            });
            localStorage.removeItem('draftCommission');
            updateCalculations();
        }
    }

    function toggleSidebar() {
       const panel = document.querySelector('.left-panel');
       const btn = document.getElementById('toggleSidebarBtn');
       const openBtn = document.getElementById('openSidebarBtn');
       panel.classList.toggle('collapsed');

       if (panel.classList.contains('collapsed')) {
           btn.textContent = '➡️ Mostrar';
           if (openBtn) openBtn.style.display = 'block';
       } else {
           btn.textContent = '⬅️ Ocultar';
           if (openBtn) openBtn.style.display = 'none';
       }
    }


    // --- FUNCIÓN DE INICIALIZACIÓN ---
    
    function init() {
        const leftPanel = document.querySelector('.left-panel');
        const rightPanel = document.querySelector('.right-panel');

        // Eventos en el panel izquierdo (con debounce)
        leftPanel.addEventListener('input', handleFormInput);

        // Eventos en el panel derecho (para elementos dinámicos)
        rightPanel.addEventListener('click', handleContainerClick);

        // Botones del header
        document.getElementById('limpiarBtn').addEventListener('click', limpiarTodo);
        document.getElementById('reporteBtn').addEventListener('click', generarPDFMejorado);
        document.getElementById('toggleSidebarBtn').addEventListener('click', toggleSidebar);
        document.getElementById('openSidebarBtn').addEventListener('click', toggleSidebar);
    }

    return {
        init
    };

})();
