import { setupPDFGeneration } from './pdf-generator.js';
import { parseMoney, formatMoney } from './modules/validators.js';
import { defaultProfiles, cloneConfig } from './modules/config.js';
import { loadStoredProfiles } from './modules/storage.js';
import { calcularComisionTotal, calcularNivel } from './modules/calculations.js';
import { updateProgress, resetProgressBars, initProgressBars, initMoneyFormat, togglePDFMenu } from './modules/ui.js';

let niveles;
let metas;
let pagos;
let multConversion;
let multEmpatia;
let multProceso;
let multMora;

let donutChart;

function animateValue(el, start, end) {
    const duration = 500;
    const startTime = performance.now();
    function step(time) {
        const progress = Math.min((time - startTime) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        el.textContent = value.toLocaleString('es-ES');
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

function initChart() {
    const ctx = document.getElementById('chartComision');
    if (!ctx) return;
    donutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Base','Carrera','Interno','Externo','Recuperado','Cantidad','Equipo'],
            datasets: [{
                data: [0,0,0,0,0,0,0],
                backgroundColor: ['#006D77','#83C5BE','#4CAF50','#2196F3','#FF9800','#9C27B0','#795548']
            }]
        },
        options: { plugins: { legend: { display: false } } }
    });
}

let profiles = loadStoredProfiles() || cloneConfig(defaultProfiles);

let currentProfile = 'agil_1';

function applyProfile(id) {
    const p = profiles[id] || profiles.agil_1;
    currentProfile = p.id;
    localStorage.setItem('currentProfile', currentProfile);

    niveles = cloneConfig(p.config.niveles);
    metas = cloneConfig(p.config.metas);
    pagos = cloneConfig(p.config.pagos);
    multConversion = cloneConfig(p.config.multConversion);
    multEmpatia = cloneConfig(p.config.multEmpatia);
    multProceso = cloneConfig(p.config.multProceso);
    multMora = cloneConfig(p.config.multMora);

    const select = document.getElementById('profileSelect');
    if (select) select.value = currentProfile;

    if (typeof resetProgressBars === 'function') {
        resetProgressBars();
        initProgressBars(metas);
    }
}

function updateCalculations() {
    calcular();
}

function changeProfile(profileId) {
    applyProfile(profileId);
    updateCalculations();
}


function calcular() {
    const datos = {
        montoInterno: parseMoney(document.getElementById('montoInterno').value) || 0,
        montoExterno: parseMoney(document.getElementById('montoExterno').value) || 0,
        montoRecuperado: parseMoney(document.getElementById('montoRecuperado').value) || 0,
        cantidad: Number(document.getElementById('cantidad').value) || 0,
        menorSemana: Number(document.getElementById('menorSemana').value) || 0,
        conversion: Number(document.getElementById('conv').value) || 0,
        empatia: Number(document.getElementById('emp').value) || 0,
        proceso: Number(document.getElementById('proc').value) || 0,
        mora: Number(document.getElementById('mora').value) || 0,
        nivelAnterior: Number(document.getElementById('nivelAnterior').value),
        nivelEquipo: Number(document.getElementById('nivelEquipo').value)
    };

    const cfg = { metas, pagos, multConversion, multEmpatia, multProceso, multMora };
    const resultado = calcularComisionTotal(datos, cfg);
    updateProgress('progInterno', calcularNivel(datos.montoInterno, 'interno', cfg));
    updateProgress('progExterno', calcularNivel(datos.montoExterno, 'externo', cfg));
    updateProgress('progRecuperado', calcularNivel(datos.montoRecuperado, 'recuperado', cfg));
    updateProgress('progCantidad', calcularNivel(datos.cantidad, 'cantidad', cfg));

    const totalEl = document.getElementById('comisionTotal');
    const prev = parseMoney(totalEl.textContent) || 0;
    animateValue(totalEl, prev, resultado.total);

    document.getElementById('kpiNivel').innerText = resultado.nivelCarreraFinal >= 0 ? niveles[resultado.nivelCarreraFinal] : 'Sin nivel';
    document.getElementById('kpiSubtotal').innerText = resultado.subtotal.toLocaleString('es-ES');
    document.getElementById('kpiMultiplicador').innerText = resultado.multiplicador.toFixed(2);

    if (donutChart) {
        donutChart.data.datasets[0].data = [
            resultado.detalle.base,
            resultado.detalle.carrera,
            resultado.detalle.interno,
            resultado.detalle.externo,
            resultado.detalle.recuperado,
            resultado.detalle.cantidad,
            resultado.detalle.equipo
        ];
        donutChart.update();
    }

    document.getElementById('detalle').innerHTML = `
        <p>Nivel Carrera: ${resultado.nivelCarreraFinal >= 0 ? niveles[resultado.nivelCarreraFinal] : 'Sin nivel'}</p>
        <p>Subtotal: ${resultado.subtotal.toLocaleString('es-ES')}</p>
        <p>Multiplicador: ${resultado.multiplicador.toFixed(2)}</p>
    `;
}

function descargarPDF() {
    calcular();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text('Resumen de Comisión', 10, 10);
    doc.text(`Comisión Total: ${document.getElementById('comisionTotal').innerText} Gs`, 10, 20);
    doc.save('comision.pdf');
}

document.querySelectorAll('#datosForm input, #datosForm select').forEach(el => {
    el.addEventListener('input', calcular);
});


setupPDFGeneration();

window.calcular = calcular;
window.changeProfile = changeProfile;
window.togglePDFMenu = togglePDFMenu;
window.descargarPDF = descargarPDF;

const savedProfile = localStorage.getItem('currentProfile') || 'agil_1';
applyProfile(savedProfile);
initMoneyFormat();
initChart();
updateCalculations();
