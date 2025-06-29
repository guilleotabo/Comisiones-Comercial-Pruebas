/**
 * ⚡ JAVASCRIPT PARA LA APLICACIÓN TO-DO LIST
 * Este archivo maneja toda la interactividad del frontend
 */

// 🚀 INICIALIZACIÓN - Se ejecuta cuando la página termina de cargar
document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 Aplicación To-Do List iniciada');
    
    // Actualizar estadísticas al cargar
    updateStats();
    
    // Agregar eventos de teclado
    setupKeyboardShortcuts();
    
    // Mostrar mensaje de bienvenida
    showWelcomeMessage();
});

/**
 * ✅ FUNCIÓN PARA MARCAR/DESMARCAR TAREA COMO COMPLETADA
 * Se ejecuta cuando el usuario hace clic en el botón de completar
 */
async function toggleTask(taskId) {
    console.log(`🔄 Cambiando estado de tarea ${taskId}`);
    
    try {
        // Mostrar estado de carga
        const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
        taskElement.classList.add('loading');
        
        // Hacer petición al servidor
        const response = await fetch(`/toggle_task/${taskId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (response.ok) {
            // Recargar la página para mostrar cambios
            window.location.reload();
        } else {
            throw new Error('Error al actualizar la tarea');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
        alert('Hubo un error al actualizar la tarea. Inténtalo de nuevo.');
        
        // Quitar estado de carga
        const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
        taskElement.classList.remove('loading');
    }
}

/**
 * 🗑️ FUNCIÓN PARA ELIMINAR UNA TAREA
 * Se ejecuta cuando el usuario hace clic en el botón de eliminar
 */
async function deleteTask(taskId) {
    console.log(`🗑️ Eliminando tarea ${taskId}`);
    
    // Confirmar eliminación
    if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
        return;
    }
    
    try {
        // Mostrar estado de carga
        const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
        taskElement.classList.add('loading');
        
        // Hacer petición al servidor
        const response = await fetch(`/delete_task/${taskId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (response.ok) {
            // Animación de eliminación
            taskElement.style.animation = 'fadeOut 0.5s ease';
            
            setTimeout(() => {
                window.location.reload();
            }, 500);
        } else {
            throw new Error('Error al eliminar la tarea');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
        alert('Hubo un error al eliminar la tarea. Inténtalo de nuevo.');
        
        // Quitar estado de carga
        const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
        taskElement.classList.remove('loading');
    }
}

/**
 * 📊 FUNCIÓN PARA ACTUALIZAR ESTADÍSTICAS
 * Obtiene las estadísticas del servidor y las muestra en tiempo real
 */
async function updateStats() {
    try {
        const response = await fetch('/api/stats');
        const stats = await response.json();
        
        // Actualizar números en el DOM
        document.getElementById('totalTasks').textContent = stats.total;
        document.getElementById('completedTasks').textContent = stats.completed;
        document.getElementById('pendingTasks').textContent = stats.pending;
        
        console.log('📊 Estadísticas actualizadas:', stats);
        
    } catch (error) {
        console.error('❌ Error al obtener estadísticas:', error);
    }
}

/**
 * ⌨️ CONFIGURAR ATAJOS DE TECLADO
 * Mejora la experiencia del usuario con shortcuts
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(event) {
        // Ctrl + Enter para agregar tarea rápidamente
        if (event.ctrlKey && event.key === 'Enter') {
            const taskInput = document.querySelector('.task-input');
            if (taskInput.value.trim()) {
                document.querySelector('.add-task-form').submit();
            }
        }
        
        // Escape para limpiar el input
        if (event.key === 'Escape') {
            const taskInput = document.querySelector('.task-input');
            taskInput.value = '';
            taskInput.blur();
        }
    });
    
    console.log('⌨️ Atajos de teclado configurados');
    console.log('   - Ctrl + Enter: Agregar tarea');
    console.log('   - Escape: Limpiar input');
}

/**
 * 🎉 MOSTRAR MENSAJE DE BIENVENIDA
 * Solo se muestra la primera vez que se visita la página
 */
function showWelcomeMessage() {
    const hasVisited = localStorage.getItem('todoapp_visited');
    
    if (!hasVisited) {
        setTimeout(() => {
            alert('¡Bienvenido a tu Lista de Tareas! 🎉\n\nConsejos:\n• Usa Ctrl + Enter para agregar tareas rápidamente\n• Haz clic en el círculo para marcar como completada\n• Usa el botón de eliminar para borrar tareas');
            localStorage.setItem('todoapp_visited', 'true');
        }, 1000);
    }
}

/**
 * 🎨 FUNCIONES DE UTILIDAD PARA EFECTOS VISUALES
 */

// Agregar efecto de ondas al hacer clic
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('add-btn') || 
        event.target.classList.contains('complete-btn') || 
        event.target.classList.contains('delete-btn')) {
        
        const button = event.target;
        button.classList.add('success-animation');
        
        setTimeout(() => {
            button.classList.remove('success-animation');
        }, 600);
    }
});

// Mejorar el input con autocompletado
document.addEventListener('DOMContentLoaded', function() {
    const taskInput = document.querySelector('.task-input');
    
    if (taskInput) {
        // Placeholder dinámico
        const placeholders = [
            '¿Qué necesitas hacer hoy?',
            'Escribe tu próxima tarea...',
            'Organiza tu día aquí...',
            'Agrega una nueva tarea...'
        ];
        
        let currentPlaceholder = 0;
        
        setInterval(() => {
            if (!taskInput.value && document.activeElement !== taskInput) {
                taskInput.placeholder = placeholders[currentPlaceholder];
                currentPlaceholder = (currentPlaceholder + 1) % placeholders.length;
            }
        }, 3000);
        
        // Contador de caracteres
        taskInput.addEventListener('input', function() {
            const remaining = 200 - this.value.length;
            
            if (remaining < 20) {
                console.log(`⚠️ Quedan ${remaining} caracteres`);
            }
        });
    }
});

// Agregar animación de fade out para eliminar
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(-100%);
        }
    }
`;
document.head.appendChild(style);

console.log('✅ Archivo JavaScript cargado completamente');
