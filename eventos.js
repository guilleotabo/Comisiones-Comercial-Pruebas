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
        if (!input.matches('input, select')) return;
        
        // Formatear campos de montos
        if (['montoInterno', 'montoExterno', 'montoRecuperado'].includes(input.id)) {
             const value = input.value.replace(/\D/g, ''); // Solo números
             const cursorPos = input.selectionStart;
             const oldLength = input.value.length;
             
             input.value = value ? UI.formatNumber(parseInt(value, 10)) : '';
             
             const newLength = input.value.length;
             if (cursorPos !== null) {
                input.setSelectionRange(cursorPos + (newLength - oldLength), cursorPos + (newLength - oldLength));
             }
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
        const target = event.target.closest('[data-tipo][data-valor]');

        if (target && (target.classList.contains('progress-segment') || target.classList.contains('multiplier-row'))) {
            const tipo = target.dataset.tipo;
            const valor = target.dataset.valor;
            let inputId = tipo;
            
            // Mapeo para nombres de inputs diferentes
            if (tipo === 'interno') inputId = 'montoInterno';
            if (tipo === 'externo') inputId = 'montoExterno';
            if (tipo === 'recuperado') inputId = 'montoRecuperado';
            if (tipo === 'cantidad') inputId = 'cantidadDesembolsos';

            const input = document.getElementById(inputId);
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
                // Disparar evento para actualizar la UI para cada campo reseteado
                el.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
            });
            localStorage.removeItem('draftCommission');
            // La actualización final se hará por el debounce
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
           btn.textContent = '➡️ Ocultar';
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
