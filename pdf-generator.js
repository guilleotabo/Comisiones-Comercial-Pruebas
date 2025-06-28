// Generador de Reporte Digital para Sistema de Comisiones

// Función principal para generar el PDF en una nueva pestaña
function generarPDFMejorado() {
    // --- FUNCIONES AUXILIARES ---

    // Formatea un número a un string con separadores de miles (ej: 1000000 -> "1.000.000")
    function formatNumber(num) {
        if (isNaN(num)) return "0";
        return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    // Escapa caracteres HTML para evitar problemas de renderizado
    function escapeHTML(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    // Obtiene de forma segura el valor de un elemento del DOM
    function getValue(id, prop = 'value') {
        const el = document.getElementById(id);
        const value = el ? el[prop] : '';
        return escapeHTML(value);
    }
    
    // Obtiene un número de un elemento del DOM, limpiando el formato
    function getNumericValue(id, prop = 'textContent') {
        const el = document.getElementById(id);
        const value = el ? el[prop] : '0';
        return parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
    }


    // --- RECOLECCIÓN DE DATOS ---
    
    const fecha = new Date();
    const mesActual = fecha.toLocaleDateString('es-PY', { month: 'long', year: 'numeric' });
    const fechaHora = fecha.toLocaleDateString('es-PY') + ' ' + fecha.toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' });
    
    // Datos del asesor
    const nivelActual = getValue('statNivel', 'textContent');
    const comisionTotal = getValue('totalComision', 'textContent');
    const multiplicadorFinal = getValue('statMulti', 'textContent');
    const subtotal = getValue('calcSubtotal', 'textContent');
    
    // Valores de montos
    const montoInterno = getNumericValue('montoInterno', 'value');
    const montoExterno = getNumericValue('montoExterno', 'value');
    const montoRecuperado = getNumericValue('montoRecuperado', 'value');
    const totalDesembolsado = montoInterno + montoExterno + montoRecuperado;
    const cantidadDesembolsos = getValue('cantidadDesembolsos') || '0';
    
    // Valores de premios para el gráfico
    const premioBase = getNumericValue('calcBase');
    const premioCarrera = getNumericValue('calcCarrera');
    const premioInterno = getNumericValue('calcInterno');
    const premioExterno = getNumericValue('calcExterno');
    const premioRecuperado = getNumericValue('calcRecuperado');
    const premioCantidad = getNumericValue('calcCantidad');
    const premioEquipo = getNumericValue('calcEquipo');

    // Obtener configuración para umbrales y multiplicadores
    const config = getConfig();

    // --- LÓGICA PARA EL REPORTE ---

    // Lógica para barras de progreso
    function getProgressHTML(label, value, max, unit) {
        const percentage = Math.min((value / max) * 100, 100);
        const isComplete = percentage >= 100;
        return `
            <div class="progress-item">
                <div class="progress-header">
                    <span><strong>${label}</strong></span>
                    <span>${formatNumber(value)} ${unit}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ${isComplete ? 'complete' : ''}" style="width: ${percentage}%">
                        ${Math.round(percentage)}%
                    </div>
                </div>
            </div>`;
    }

    // Lógica para la tabla de indicadores de calidad
    function getQualityIndicatorsHTML() {
        const indicadores = ['conversion', 'empatia', 'proceso', 'mora'];
        let rowsHTML = '';

        indicadores.forEach(tipo => {
            const valor = parseFloat(getValue(tipo)) || 0;
            const { mult, status, badgeClass } = Calculos.getMultiplicadorInfo(tipo, valor, config.multiplicadores);
            
            rowsHTML += `
                <tr>
                    <td>${tipo.charAt(0).toUpperCase() + tipo.slice(1)}</td>
                    <td class="text-center">${valor}%</td>
                    <td class="text-center">${(mult * 100).toFixed(0)}%</td>
                    <td class="text-center">
                        <span class="badge ${badgeClass}">${status}</span>
                    </td>
                </tr>`;
        });
        return rowsHTML;
    }
    
    // Lógica para el desglose de comisiones
    function getCommissionBreakdownHTML() {
        const subtotalNum = getNumericValue('calcSubtotal');
        if (subtotalNum === 0) return '<tr><td colspan="3">No hay comisiones para mostrar.</td></tr>';

        const items = [
            { nombre: 'Base Fija', valor: premioBase },
            { nombre: 'Premio Carrera', valor: premioCarrera },
            { nombre: 'Premio Monto Interno', valor: premioInterno },
            { nombre: 'Premio Monto Externo', valor: premioExterno },
            { nombre: 'Premio Recuperados', valor: premioRecuperado },
            { nombre: 'Premio Cantidad', valor: premioCantidad },
            { nombre: 'Premio Equipo', valor: premioEquipo }
        ];

        let html = '';
        items.forEach(item => {
            if (item.valor > 0) {
                const porcentaje = ((item.valor / subtotalNum) * 100).toFixed(1);
                html += `
                    <tr>
                        <td>${item.nombre}</td>
                        <td class="text-right">${formatNumber(item.valor)} Gs</td>
                        <td class="text-center">${porcentaje}%</td>
                    </tr>`;
            }
        });
        
        html += `
            <tr style="background: #f8f9fa; font-weight: 600;">
                <td>SUBTOTAL</td>
                <td class="text-right">${formatNumber(subtotalNum)} Gs</td>
                <td class="text-center">100%</td>
            </tr>`;
        return html;
    }

    // --- CREACIÓN DE LA VENTANA Y EL HTML DEL REPORTE ---
    
    const ventana = window.open('', '_blank');
    ventana.document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Reporte de Comisiones - ${mesActual}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f7fa; color: #2d3748; line-height: 1.6; }
                .container { max-width: 900px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #006D77 0%, #83C5BE 100%); color: white; padding: 30px; border-radius: 15px; margin-bottom: 30px; box-shadow: 0 5px 15px rgba(0,109,119,0.2); }
                .header h1 { font-size: 28px; margin-bottom: 5px; font-weight: 300; }
                .header .subtitle { font-size: 18px; opacity: 0.9; }
                .header .date { font-size: 14px; opacity: 0.8; margin-top: 10px; }
                .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
                .summary-card { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); text-align: center; }
                .summary-card.primary { background: linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%); color: white; }
                .summary-card .label { font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.8; margin-bottom: 8px; }
                .summary-card .value { font-size: 28px; font-weight: 600; line-height: 1.2; }
                .summary-card .detail { font-size: 14px; margin-top: 5px; opacity: 0.7; }
                .section { background: white; border-radius: 12px; padding: 25px; margin-bottom: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
                .section-title { font-size: 20px; font-weight: 600; color: #006D77; margin-bottom: 20px; }
                .progress-item { margin-bottom: 20px; }
                .progress-header { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
                .progress-bar { height: 24px; background: #e9ecef; border-radius: 12px; overflow: hidden; }
                .progress-fill { height: 100%; background: linear-gradient(90deg, #006D77 0%, #83C5BE 100%); border-radius: 12px; transition: width 0.3s ease; display: flex; align-items: center; justify-content: flex-end; padding-right: 10px; color: white; font-size: 12px; font-weight: 600; }
                .progress-fill.complete { background: linear-gradient(90deg, #2E7D32 0%, #4CAF50 100%); }
                table { width: 100%; border-collapse: collapse; }
                th { background: #f8f9fa; padding: 12px 15px; text-align: left; font-weight: 600; font-size: 13px; text-transform: uppercase; color: #6c757d; border-bottom: 2px solid #e9ecef; }
                td { padding: 15px; border-bottom: 1px solid #e9ecef; font-size: 14px; }
                tr:last-child td { border-bottom: none; }
                .text-right { text-align: right; }
                .text-center { text-align: center; }
                .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
                .badge.success { background: #E8F5E9; color: #2E7D32; }
                .badge.warning { background: #FFF3E0; color: #F57C00; }
                .badge.danger { background: #FFEBEE; color: #D32F2F; }
                .chart-container { display: flex; justify-content: center; align-items: center; margin: 20px 0; }
                .chart-legend { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 20px; }
                .legend-item { display: flex; align-items: center; gap: 8px; font-size: 14px; }
                .legend-color { width: 16px; height: 16px; border-radius: 4px; }
                .total-section { background: linear-gradient(135deg, #006D77 0%, #83C5BE 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0; }
                .total-label { font-size: 16px; opacity: 0.9; margin-bottom: 10px; }
                .total-amount { font-size: 42px; font-weight: 700; margin: 10px 0; }
                .footer { text-align: center; color: #6c757d; font-size: 12px; margin-top: 40px; padding: 20px; }
                @media print { body { background: white; print-color-adjust: exact; -webkit-print-color-adjust: exact; } .container { max-width: 100%; } }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Reporte de Comisiones</h1>
                    <div class="subtitle">SERSA SAECA - Sistema Comercial</div>
                    <div class="date">Período: ${mesActual}</div>
                </div>
                
                <div class="summary-grid">
                    <div class="summary-card primary">
                        <div class="label">Comisión Total</div>
                        <div class="value">${comisionTotal}</div>
                        <div class="detail">Guaraníes</div>
                    </div>
                    <div class="summary-card">
                        <div class="label">Nivel Alcanzado</div>
                        <div class="value">${nivelActual}</div>
                        <div class="detail">Este mes</div>
                    </div>
                    <div class="summary-card">
                        <div class="label">Total Desembolsado</div>
                        <div class="value">${formatNumber(totalDesembolsado)}</div>
                        <div class="detail">Gs</div>
                    </div>
                    <div class="summary-card">
                        <div class="label">Multiplicador</div>
                        <div class="value">${multiplicadorFinal}</div>
                        <div class="detail">Calidad</div>
                    </div>
                </div>
                
                <div class="section">
                    <h2 class="section-title">📊 Progreso de Metas</h2>
                    ${getProgressHTML('Monto Interno', montoInterno, 1200000000, 'Gs')}
                    ${getProgressHTML('Monto Externo', montoExterno, 400000000, 'Gs')}
                    ${getProgressHTML('Recuperados', montoRecuperado, 150000000, 'Gs')}
                    ${getProgressHTML('Cantidad Desembolsos', parseInt(cantidadDesembolsos), 13, 'operaciones')}
                </div>
                
                <div class="section">
                    <h2 class="section-title">⭐ Indicadores de Calidad</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Indicador</th>
                                <th class="text-center">Valor</th>
                                <th class="text-center">Multiplicador</th>
                                <th class="text-center">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                           ${getQualityIndicatorsHTML()}
                        </tbody>
                    </table>
                </div>
                
                <div class="section">
                    <h2 class="section-title">💰 Distribución de Comisión</h2>
                    <div class="chart-container">
                        <canvas id="pieChart" width="300" height="300"></canvas>
                    </div>
                    <div class="chart-legend" id="chartLegend"></div>
                    <table style="margin-top: 20px;">
                        <thead>
                            <tr>
                                <th>Concepto</th>
                                <th class="text-right">Monto (Gs)</th>
                                <th class="text-center">%</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${getCommissionBreakdownHTML()}
                        </tbody>
                    </table>
                </div>
                
                <div class="total-section">
                    <div class="total-label">COMISIÓN TOTAL DEL MES</div>
                    <div class="total-amount">${comisionTotal}</div>
                    <div style="font-size: 14px; opacity: 0.9;">
                        Subtotal: ${subtotal} × Multiplicador: ${multiplicadorFinal}
                    </div>
                </div>
                
                <div class="footer">
                    <p>Reporte generado el ${fechaHora}</p>
                    <p>Sistema de Comisiones Comerciales - SERSA SAECA</p>
                </div>
            </div>
            
            <script>
                // Script para dibujar el gráfico de torta una vez cargada la página
                window.onload = function() {
                    const canvas = document.getElementById('pieChart');
                    if (!canvas) return;
                    const ctx = canvas.getContext('2d');
                    const centerX = canvas.width / 2;
                    const centerY = canvas.height / 2;
                    const radius = 120;
                    
                    const data = [
                        ${premioBase > 0 ? `{label: 'Base Fija', value: ${premioBase}, color: '#006D77'},` : ''}
                        ${premioCarrera > 0 ? `{label: 'Carrera', value: ${premioCarrera}, color: '#83C5BE'},` : ''}
                        ${premioInterno > 0 ? `{label: 'Interno', value: ${premioInterno}, color: '#4CAF50'},` : ''}
                        ${premioExterno > 0 ? `{label: 'Externo', value: ${premioExterno}, color: '#FFA726'},` : ''}
                        ${premioRecuperado > 0 ? `{label: 'Recuperados', value: ${premioRecuperado}, color: '#AB47BC'},` : ''}
                        ${premioCantidad > 0 ? `{label: 'Cantidad', value: ${premioCantidad}, color: '#EF5350'},` : ''}
                        ${premioEquipo > 0 ? `{label: 'Equipo', value: ${premioEquipo}, color: '#42A5F5'},` : ''}
                    ].filter(Boolean); // Filtra los elementos nulos/vacíos
                    
                    if(data.length === 0) return;

                    const total = data.reduce((sum, item) => sum + item.value, 0);
                    let currentAngle = -Math.PI / 2;
                    
                    data.forEach(item => {
                        const sliceAngle = (item.value / total) * 2 * Math.PI;
                        ctx.beginPath();
                        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
                        ctx.lineTo(centerX, centerY);
                        ctx.fillStyle = item.color;
                        ctx.fill();
                        ctx.strokeStyle = 'white';
                        ctx.lineWidth = 2;
                        ctx.stroke();
                        currentAngle += sliceAngle;
                    });
                    
                    const legendHTML = data.map(item => {
                        const percentage = ((item.value / total) * 100).toFixed(1);
                        return \`
                            <div class="legend-item">
                                <div class="legend-color" style="background: \${item.color}"></div>
                                <span>\${item.label} (\${percentage}%)</span>
                            </div>\`;
                    }).join('');
                    document.getElementById('chartLegend').innerHTML = legendHTML;
                };
            <\/script>
        </body>
        </html>
    `);
    
    ventana.document.close();
}
