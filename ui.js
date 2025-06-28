const UI = (function() {

    // --- FUNCIONES DE UTILIDAD ---

    function formatNumber(num) {
        if (isNaN(num)) return "0";
        return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
    
    function getElement(id) {
        return document.getElementById(id);
    }
    
    function getNumericValue(id) {
        const input = getElement(id);
        if (!input) return 0;
        return parseInt(input.value.replace(/\D/g, ''), 10) || 0;
    }

    // --- FUNCIONES DE RENDERIZADO ---

    function updateProgressBar(tipo, valor, nivelAlcanzado, config) {
        const { niveles, metas, pagos } = config;
        const tipoLower = tipo.toLowerCase();
        const container = getElement(`barra${tipo}`);
        const info = getElement(`info${tipo}`);
        if (!container || !info) return;

        let maxMeta;
        if (tipo === 'Interno') maxMeta = 1200000000;
        else if (tipo === 'Externo') maxMeta = 400000000;
        else if (tipo === 'Recuperado') maxMeta = 150000000;
        else if (tipo === 'Cantidad') maxMeta = 13;
        
        let html = '<div class="progress-segments">';
        for (let i = 0; i < niveles.length; i++) {
            const className = `progress-segment ${i <= nivelAlcanzado ? 'reached' : ''} ${i === nivelAlcanzado ? 'current' : ''}`;
            const metaTexto = tipo === 'Cantidad' ? metas.cantidad[i] : formatNumber(metas[tipoLower][i] / 1000000) + 'M';
            const premioTexto = formatNumber(pagos[tipoLower][i]);
            
            html += `<div class="${className}" data-tipo="${tipoLower}" data-valor="${metas[tipoLower][i]}">
                        <div class="level">${niveles[i]}</div>
                        <div class="meta">Meta: ${metaTexto}</div>
                        <div class="premio">Premio: ${premioTexto}</div>
                    </div>`;
        }
        html += '</div>';
        container.innerHTML = html;
        
        const progreso = maxMeta > 0 ? Math.round((valor / maxMeta) * 100) : 0;
        const nivelTexto = nivelAlcanzado >= 0 ? niveles[nivelAlcanzado] : 'Ninguno';
        const premioTexto = nivelAlcanzado >= 0 ? formatNumber(pagos[tipoLower][nivelAlcanzado]) : '0';
        
        info.innerHTML = `Progreso: ${tipo === 'Cantidad' ? valor : formatNumber(valor)} / ${tipo === 'Cantidad' ? maxMeta : formatNumber(maxMeta)} (${progreso}%)<br>
                         Nivel alcanzado: <strong>${nivelTexto}</strong> | Premio: <strong>${premioTexto} Gs</strong>`;
    }

    function updateCarreraBar(nivelCarrera, config) {
        const { niveles, pagos } = config;
        const container = getElement('barraCarrera');
        const info = getElement('infoCarrera');
        if (!container || !info) return;

        let html = '<div class="progress-segments">';
        for (let i = 0; i < niveles.length; i++) {
            const className = `progress-segment ${i <= nivelCarrera ? 'reached' : ''} ${i === nivelCarrera ? 'current' : ''}`;
            const premio = pagos.carrera[i];
            html += `<div class="${className}" style="${premio === 0 ? 'opacity: 0.5;' : ''}">
                        <div class="level">${niveles[i]}</div>
                        <div class="premio">Premio: ${formatNumber(premio)}</div>
                    </div>`;
        }
        html += '</div>';
        container.innerHTML = html;

        const nivelTexto = nivelCarrera >= 0 ? niveles[nivelCarrera] : 'Sin carrera';
        const premioCarrera = nivelCarrera >= 0 ? pagos.carrera[nivelCarrera] : 0;
        info.innerHTML = `Tu nivel de carrera: <strong>${nivelTexto}</strong> | Premio: <strong>${formatNumber(premioCarrera)} Gs</strong><br>
                         <span class="text-muted">Definido por el menor nivel de los últimos 2 meses</span>`;
    }

     function updateEquipoBar(nivelEquipo, nivelCarrera, bonus, config) {
        const { niveles, pagos } = config;
        const container = getElement('barraEquipo');
        const info = getElement('infoEquipo');
        const requisitos = getElement('equipoRequisitos');
        if (!container || !info || !requisitos) return;

        let html = '<div class="progress-segments">';
        for (let i = 0; i < niveles.length; i++) {
             const className = `progress-segment ${i === nivelEquipo ? 'current' : ''}`;
             const premio = pagos.equipo[i];
             html += `<div class="${className}" style="${premio === 0 ? 'opacity: 0.5;' : ''}">
                        <div class="level">${niveles[i]}</div>
                        <div class="premio">Premio: ${formatNumber(premio)}</div>
                    </div>`;
        }
        html += '</div>';
        container.innerHTML = html;

        info.innerHTML = `Menor nivel del equipo: <strong>${niveles[nivelEquipo] || 'N/A'}</strong> | Tu nivel: <strong>${niveles[nivelCarrera] || 'N/A'}</strong> | Premio: <strong>${formatNumber(bonus)} Gs</strong>`;

        if (nivelCarrera < 2) {
            requisitos.style.display = 'block';
            requisitos.innerHTML = '⚠️ Necesitas ser Senior A+ para cobrar premio equipo';
        } else if (nivelEquipo < 2) {
             requisitos.style.display = 'block';
             requisitos.innerHTML = '⚠️ El equipo necesita ser Senior A+ para activar el premio';
        } else {
             requisitos.style.display = 'block';
             requisitos.innerHTML = '✅ Premio de equipo activado';
        }
    }


    function updateMultiplicadorTables(values, results, config) {
        const { multiplicadores: multConfig } = config;
        const container = getElement('multiplicadorTables');
        if(!container) return;

        let html = '';
        const tipos = ['conversion', 'empatia', 'proceso', 'mora'];

        tipos.forEach(tipo => {
            const valorActual = values[tipo];
            const { mult, badgeClass } = Calculos.getMultiplicadorInfo(tipo, valorActual, multConfig);
            
            html += `<div class="multiplier-table ${badgeClass}">
                        <div class="multiplier-title">${tipo.charAt(0).toUpperCase() + tipo.slice(1)}</div>`;
            
            multConfig[tipo].forEach(item => {
                const tabla = multConfig[tipo];
                let isActive = false;
                if (tipo === 'mora') {
                    const index = tabla.findIndex(t => t.min === item.min);
                    const nextItem = tabla[index + 1];
                    isActive = valorActual >= item.min && (!nextItem || valorActual < nextItem.min);
                } else {
                    const index = tabla.findIndex(t => t.min === item.min);
                    const nextItem = tabla[index - 1]; // En estas tablas el orden es descendente
                    isActive = valorActual >= item.min && (!nextItem || valorActual < nextItem.min);
                }

                html += `<div class="multiplier-row ${isActive ? 'active' : ''}" data-tipo="${tipo}" data-valor="${item.min}">
                            <span>${item.text}</span>
                            <span>→ ${Math.round(item.mult * 100)}%</span>
                         </div>`;
            });

            html += `<div class="multiplier-current">Tu valor: ${valorActual}%</div></div>`;
        });
        container.innerHTML = html;

        const { conversion, empatia, proceso, mora, total } = results.multiplicadores;
        getElement('multiplicadorCalc').textContent = `Cálculo: ${conversion.toFixed(2)} × ${empatia.toFixed(2)} × ${proceso.toFixed(2)} × ${mora.toFixed(2)} = ${(total*100).toFixed(1)}%`;
    }

    function renderSuggestions(sugerencias) {
        const container = getElement('sugerencias');
        if (!container) return;
        if (sugerencias.length === 0) {
            container.innerHTML = '<div class="suggestion-item">¡Excelente trabajo! Estás optimizando todos tus indicadores.</div>';
            return;
        }
        
        container.innerHTML = sugerencias.map(s => `
            <div class="suggestion-category ${s.categoria}">
                <div class="suggestion-category-title">${s.titulo}</div>
                <div class="suggestion-item">${s.texto}</div>
            </div>
        `).join('');
    }

    // --- FUNCIÓN PÚBLICA PRINCIPAL ---

    function renderAll(values, results, config) {
        // Stats superiores
        getElement('statNivel').textContent = results.nivelCarrera >= 0 ? config.niveles[results.nivelCarrera] : 'N/A';
        getElement('statSubtotal').textContent = formatNumber(results.subtotal) + ' Gs';
        getElement('statMulti').textContent = (results.multiplicadores.total * 100).toFixed(1) + '%';
        getElement('statComision').textContent = formatNumber(results.total) + ' Gs';

        // Barras de progreso
        updateProgressBar('Interno', values.montoInterno, results.nivelInterno, config);
        updateProgressBar('Externo', values.montoExterno, results.nivelExterno, config);
        updateProgressBar('Recuperado', values.montoRecuperado, results.nivelRecuperado, config);
        updateProgressBar('Cantidad', values.cantidad, results.nivelCantidadReal, config);
        
        // Barras especiales
        updateCarreraBar(results.nivelCarrera, config);
        updateEquipoBar(values.nivelEquipo, results.nivelCarrera, results.bonos.equipo, config);

        // Barra de subtotal
        const maxSubtotal = config.base + config.pagos.carrera[5] + config.pagos.montoInterno[5] + config.pagos.montoExterno[5] + config.pagos.montoRecuperado[5] + config.pagos.cantidad[5] + config.pagos.equipo[5];
        const subtotalPercent = maxSubtotal > 0 ? (results.subtotal / maxSubtotal) * 100 : 0;
        getElement('subtotalFill').style.width = `${Math.min(subtotalPercent, 100)}%`;
        getElement('subtotalMonto').textContent = formatNumber(results.subtotal) + ' Gs';
        getElement('subtotalMonto').nextElementSibling.textContent = formatNumber(maxSubtotal) + ' Gs';

        // Tabla de multiplicadores
        updateMultiplicadorTables(values, results, config);

        // Desglose de cálculo final
        getElement('calcBase').textContent = formatNumber(config.base) + ' Gs';
        getElement('calcCarrera').textContent = formatNumber(results.bonos.carrera) + ' Gs';
        getElement('calcInterno').textContent = formatNumber(results.bonos.interno) + ' Gs';
        getElement('calcExterno').textContent = formatNumber(results.bonos.externo) + ' Gs';
        getElement('calcRecuperado').textContent = formatNumber(results.bonos.recuperado) + ' Gs';
        getElement('calcCantidad').textContent = formatNumber(results.bonos.cantidad) + ' Gs';
        getElement('calcEquipo').textContent = formatNumber(results.bonos.equipo) + ' Gs';
        getElement('calcSubtotal').textContent = formatNumber(results.subtotal) + ' Gs';
        getElement('calcMultiplicador').textContent = (results.multiplicadores.total * 100).toFixed(1) + '%';
        getElement('totalComision').textContent = formatNumber(results.total) + ' Gs';
    }
    
    // --- OBTENER VALORES DEL FORMULARIO ---
    function getFormValues() {
        return {
            nivelAnterior: parseInt(getElement('nivelAnterior').value, 10),
            montoInterno: getNumericValue('montoInterno'),
            montoExterno: getNumericValue('montoExterno'),
            montoRecuperado: getNumericValue('montoRecuperado'),
            cantidad: getNumericValue('cantidadDesembolsos'),
            menorSemana: getNumericValue('menorSemana'),
            conversion: parseFloat(getElement('conversion').value) || 0,
            empatia: parseFloat(getElement('empatia').value) || 0,
            proceso: parseFloat(getElement('proceso').value) || 0,
            mora: parseFloat(getElement('mora').value) || 0,
            nivelEquipo: parseInt(getElement('nivelEquipo').value, 10)
        };
    }

    return {
        renderAll,
        getFormValues,
        formatNumber // Exponer para sugerencias y otros módulos
    };
})();
