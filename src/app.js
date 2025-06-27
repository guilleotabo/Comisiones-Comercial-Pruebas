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
let barChart;
let gaugeCharts = {};

function animateValue(el, start, end) {
    const duration = 500;
    const startTime = performance.now();
    function step(time) {
        const progress = Math.min((time - startTime) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        el.textContent = formatMoney(value);
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

function initBarChart() {
    const ctx = document.getElementById('chartComparativo');
    if (!ctx) return;
    barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Interno','Externo','Recuperado','Cantidad'],
            datasets: [{
                label: '% Cumplimiento',
                data: [0,0,0,0],
                backgroundColor: ['#F44336','#F44336','#F44336','#F44336']
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true, max: 100, ticks: { callback:v=>v+'%' } }
            },
            plugins: { legend: { display: false } }
        }
    });
}

const needlePlugin = {
    id: 'needle',
    afterDatasetDraw(chart, args, options) {
        const { ctx } = chart;
        const val = options.value || 0;
        const angle = chart.options.rotation + (chart.options.circumference * (val / 100));
        const cx = chart.getDatasetMeta(0).data[0].x;
        const cy = chart.getDatasetMeta(0).data[0].y;
        const r = chart.getDatasetMeta(0).data[0].outerRadius;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.lineTo(r,0);
        ctx.strokeStyle = options.color || '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = options.color || '#000';
        ctx.fillText(val.toFixed(0), cx, cy + 15);
    }
};

function createGauge(id) {
    const el = document.getElementById(id);
    if (!el) return null;
    return new Chart(el, {
        type: 'doughnut',
        data: {
            labels: ['Bajo','Medio','Alto'],
            datasets:[{
                data:[50,30,20],
                backgroundColor:['#F44336','#FFA726','#4CAF50'],
                borderWidth:0
            }]
        },
        options:{
            responsive:true,
            circumference:180,
            rotation:-90,
            cutout:'70%',
            plugins:{ legend:{ display:false }, needle:{ value:0 } }
        },
        plugins:[needlePlugin]
    });
}

function initGaugeCharts() {
    gaugeCharts.conv = createGauge('gaugeConv');
    gaugeCharts.emp = createGauge('gaugeEmp');
    gaugeCharts.proc = createGauge('gaugeProc');
    gaugeCharts.mora = createGauge('gaugeMora');
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    const toggle = document.getElementById('themeToggle');
    if (toggle) toggle.checked = theme === 'dark';
}

function toggleTheme() {
    const current = localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
}

function initTheme() {
    const stored = localStorage.getItem('theme') || 'light';
    applyTheme(stored);
    const toggle = document.getElementById('themeToggle');
    if (toggle) toggle.addEventListener('change', toggleTheme);
}

function initTour() {
    const hide = localStorage.getItem('hideTour');
    if (!hide) {
        const overlay = document.getElementById('tourOverlay');
        if (overlay) overlay.classList.remove('hidden');
    }
}

function closeTour() {
    const dont = document.getElementById('dontShowTour');
    if (dont && dont.checked) {
        localStorage.setItem('hideTour', '1');
    }
    const overlay = document.getElementById('tourOverlay');
    if (overlay) overlay.classList.add('hidden');
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
    document.getElementById('kpiSubtotal').innerText = formatMoney(resultado.subtotal);
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

    if (barChart) {
        const progress = [
            datos.montoInterno / metas.montoInterno[metas.montoInterno.length-1] * 100,
            datos.montoExterno / metas.montoExterno[metas.montoExterno.length-1] * 100,
            datos.montoRecuperado / metas.montoRecuperado[metas.montoRecuperado.length-1] * 100,
            datos.cantidad / metas.cantidad[metas.cantidad.length-1] * 100
        ].map(v => Math.min(v, 100));
        barChart.data.datasets[0].data = progress;
        barChart.data.datasets[0].backgroundColor = progress.map(v => v >= 80 ? '#4CAF50' : v >= 50 ? '#FFA726' : '#F44336');
        barChart.update();
    }

    const map = { conv: 'conversion', emp: 'empatia', proc: 'proceso', mora: 'mora' };
    Object.entries(gaugeCharts).forEach(([key, chart]) => {
        if (!chart) return;
        let val = datos[map[key]] || 0;
        if (key === 'mora') val = Math.max(0, 100 - val);
        chart.options.plugins.needle.value = val;
        chart.update();
    });

    document.getElementById('detalle').innerHTML = `
        <p>Nivel Carrera: ${resultado.nivelCarreraFinal >= 0 ? niveles[resultado.nivelCarreraFinal] : 'Sin nivel'}</p>
        <p>Subtotal: ${formatMoney(resultado.subtotal)}</p>
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
window.toggleTheme = toggleTheme;
window.closeTour = closeTour;

const savedProfile = localStorage.getItem('currentProfile') || 'agil_1';
applyProfile(savedProfile);
initMoneyFormat();
initChart();
initBarChart();
initGaugeCharts();
initTheme();
initTour();
updateCalculations();
