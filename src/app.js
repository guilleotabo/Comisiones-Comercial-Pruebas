import { setupPDFGeneration } from './pdf-generator.js';
import { parseMoney, formatMoney } from './modules/validators.js';
import { defaultProfiles, cloneConfig } from './modules/config.js';
import { loadStoredProfiles } from './modules/storage.js';
import { calcularComisionTotal, calcularNivel } from './modules/calculations.js';
import { updateProgress, resetProgressBars, initProgressBars, initMoneyFormat, togglePDFMenu } from './modules/ui.js';
import { initGamification, checkAchievements, shareResults } from './modules/gamification.js';
import { saveProfiles as storeProfiles } from './modules/storage.js';

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
let progressChart;
let comparativoNewChart;
let generalGauge;

function animateValue(el, prev, next) {
    const duration = 500;
    const startTime = performance.now();
    const changeClass = next >= prev ? 'positive-change' : 'negative-change';
    el.classList.add(changeClass);
    function step(time) {
        const progress = Math.min((time - startTime) / duration, 1);
        const value = Math.floor(progress * (next - prev) + prev);
        el.textContent = formatMoney(value);
        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            el.classList.remove(changeClass);
        }
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

function initDashboard() {
    const pctx = document.getElementById('dashProgress');
    if (pctx) {
        progressChart = new Chart(pctx, {
            type: 'doughnut',
            data: { datasets:[{ data:[0,100], backgroundColor:['#4CAF50','#E0E0E0'], borderWidth:0 }] },
            options:{ responsive:false, cutout:'75%', plugins:{legend:{display:false}} }
        });
    }

    const cctx = document.getElementById('chartComparativoNew');
    if (cctx) {
        comparativoNewChart = new Chart(cctx, {
            type: 'bar',
            data:{
                labels:['Interno','Externo','Recuperado','Cantidad'],
                datasets:[
                    {label:'Actual', data:[0,0,0,0], backgroundColor:'#006D77'},
                    {label:'Meta', data:[0,0,0,0], backgroundColor:'#83C5BE'},
                    {label:'Potencial', data:[0,0,0,0], backgroundColor:'#4CAF50'}
                ]
            },
            options:{ responsive:true, scales:{ y:{ beginAtZero:true } } }
        });
    }

    generalGauge = createGauge('gaugeGeneral');

    ['simInterno','simExterno','simMult'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updateSimulador);
    });
    const aplicar = document.getElementById('simAplicar');
    if (aplicar) aplicar.addEventListener('click', aplicarSimulador);
}

function updateDashboard(resultado, datos) {
    if (progressChart) {
        const meta = metas.montoInterno[metas.montoInterno.length-1];
        const pct = Math.min(100, (resultado.total / (meta || 1)) * 100);
        progressChart.data.datasets[0].data[0] = pct;
        progressChart.data.datasets[0].data[1] = 100 - pct;
        progressChart.update();
    }

    if (comparativoNewChart) {
        const metasArr = [
            metas.montoInterno[metas.montoInterno.length-1],
            metas.montoExterno[metas.montoExterno.length-1],
            metas.montoRecuperado[metas.montoRecuperado.length-1],
            metas.cantidad[metas.cantidad.length-1]
        ];
        const actuales = [datos.montoInterno, datos.montoExterno, datos.montoRecuperado, datos.cantidad];
        const potencial = actuales.map((v,i)=>Math.min(metasArr[i], v * 1.1));
        comparativoNewChart.data.datasets[0].data = actuales;
        comparativoNewChart.data.datasets[1].data = metasArr;
        comparativoNewChart.data.datasets[2].data = potencial;
        comparativoNewChart.update();
    }

    if (generalGauge) {
        const pct = Math.min(100, resultado.multiplicador * 100);
        generalGauge.options.plugins.needle.value = pct;
        generalGauge.update();
    }

    const detalleBody = document.getElementById('tablaDetalle');
    if (detalleBody) {
        detalleBody.innerHTML = '';
        Object.entries(resultado.detalle).forEach(([k,v])=>{
            const tr = document.createElement('tr');
            const c1 = document.createElement('td');
            c1.textContent = k.charAt(0).toUpperCase()+k.slice(1);
            const c2 = document.createElement('td');
            c2.textContent = formatMoney(v);
            tr.appendChild(c1); tr.appendChild(c2);
            detalleBody.appendChild(tr);
        });
        document.getElementById('tablaSubtotal').textContent = formatMoney(resultado.subtotal);
        document.getElementById('tablaMulti').textContent = resultado.multiplicador.toFixed(2);
        document.getElementById('tablaTotal').textContent = formatMoney(resultado.total);
    }

    document.getElementById('dashComisionActual')?.textContent = formatMoney(resultado.total);
    document.getElementById('dashPotencialValor')?.textContent = formatMoney(resultado.total * 1.1);
    document.getElementById('potNivel')?.textContent = `Si alcanzas Senior B ganarías +${formatMoney(resultado.total*0.1)}`;
    document.getElementById('potConversion')?.textContent = `Mejorando conversión a 10% → +${formatMoney(resultado.total*0.05)}`;
    document.getElementById('potDesembolsos')?.textContent = `Con 2 desembolsos más → +${formatMoney(resultado.total*0.03)}`;
}

function updateSimulador() {
    const base = getDatosFormulario();
    const deltaI = Number(document.getElementById('simInterno').value) / 100;
    const deltaE = Number(document.getElementById('simExterno').value) / 100;
    const deltaM = Number(document.getElementById('simMult').value) / 100;

    document.getElementById('simInternoVal').textContent = `${Math.round(deltaI*100)}%`;
    document.getElementById('simExternoVal').textContent = `${Math.round(deltaE*100)}%`;
    document.getElementById('simMultVal').textContent = `${Math.round(deltaM*100)}%`;

    const simDatos = { ...base };
    simDatos.montoInterno += simDatos.montoInterno * deltaI;
    simDatos.montoExterno += simDatos.montoExterno * deltaE;
    simDatos.conversion += simDatos.conversion * deltaM;
    simDatos.empatia += simDatos.empatia * deltaM;
    simDatos.proceso += simDatos.proceso * deltaM;
    simDatos.mora = Math.max(0, simDatos.mora - simDatos.mora * deltaM);

    const cfg = { metas, pagos, multConversion, multEmpatia, multProceso, multMora };
    const r = calcularComisionTotal(simDatos, cfg);
    document.getElementById('simComision').textContent = formatMoney(r.total);
}

function aplicarSimulador() {
    const deltaI = Number(document.getElementById('simInterno').value) / 100;
    const deltaE = Number(document.getElementById('simExterno').value) / 100;
    const deltaM = Number(document.getElementById('simMult').value) / 100;

    const datos = getDatosFormulario();
    document.getElementById('montoInterno').value = Math.round(datos.montoInterno * (1 + deltaI));
    document.getElementById('montoExterno').value = Math.round(datos.montoExterno * (1 + deltaE));
    document.getElementById('conv').value = Math.round(datos.conversion * (1 + deltaM));
    document.getElementById('emp').value = Math.round(datos.empatia * (1 + deltaM));
    document.getElementById('proc').value = Math.round(datos.proceso * (1 + deltaM));
    document.getElementById('mora').value = Math.max(0, Math.round(datos.mora * (1 - deltaM)));
    calcular();
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

function getDatosFormulario() {
    return {
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
}


function calcular() {
    const datos = getDatosFormulario();

    const cfg = { metas, pagos, multConversion, multEmpatia, multProceso, multMora };
    const resultado = calcularComisionTotal(datos, cfg);
    updateProgress('progInterno', calcularNivel(datos.montoInterno, 'interno', cfg));
    updateProgress('progExterno', calcularNivel(datos.montoExterno, 'externo', cfg));
    updateProgress('progRecuperado', calcularNivel(datos.montoRecuperado, 'recuperado', cfg));
    updateProgress('progCantidad', calcularNivel(datos.cantidad, 'cantidad', cfg));

    const totalEl = // Animar el cambio de valor
const totalElement = document.getElementById('comisionTotal');
const oldValue = parseInt(totalElement.textContent.replace(/\D/g, '')) || 0;
const newValue = resultado.total;

// Agregar clase de animación
totalElement.classList.add('updating');

// Animar contador
let current = oldValue;
const increment = (newValue - oldValue) / 30;
const timer = setInterval(() => {
    current += increment;
    if ((increment > 0 && current >= newValue) || (increment < 0 && current <= newValue)) {
        current = newValue;
        clearInterval(timer);
        totalElement.classList.remove('updating');
    }
    totalElement.textContent = Math.round(current).toLocaleString('es-PY');
}, 30);
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

    updateDashboard(resultado, datos);

    checkAchievements(resultado);
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
window.shareResults = shareResults;

function toggleQuickSettings() {
    const panel = document.getElementById('quickSettingsPanel');
    const btn = document.getElementById('quickSettingsBtn');
    if (!panel || !btn) return;
    const open = panel.classList.toggle('open');
    btn.classList.toggle('rotate', open);
    panel.classList.toggle('hidden', !open);
    panel.setAttribute('aria-hidden', String(!open));
}

function exportProfiles() {
    const data = localStorage.getItem('commission_profiles') || '{}';
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'perfiles_comisiones.json';
    a.click();
    recordHistory('Se exportaron perfiles');
}

function importProfiles() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
        try {
            const file = e.target.files[0];
            const text = await file.text();
            localStorage.setItem('commission_profiles', text);
            profiles = JSON.parse(text).profiles || profiles;
            storeProfiles(profiles);
            applyProfile(currentProfile);
            recordHistory('Se importaron perfiles');
        } catch (err) {
            alert('Error al importar: ' + err.message);
        }
    };
    input.click();
}

function recordHistory(entry) {
    const history = JSON.parse(localStorage.getItem('qs_history') || '[]');
    history.unshift({ entry, date: new Date().toLocaleString() });
    localStorage.setItem('qs_history', JSON.stringify(history.slice(0, 10)));
    updateHistory();
}

function updateHistory() {
    const list = document.getElementById('qsHistory');
    if (!list) return;
    list.innerHTML = '';
    const history = JSON.parse(localStorage.getItem('qs_history') || '[]');
    history.forEach(h => {
        const li = document.createElement('li');
        li.textContent = `${h.entry} - ${h.date}`;
        list.appendChild(li);
    });
}

function initQuickSettings() {
    const btn = document.getElementById('quickSettingsBtn');
    const closeBtn = document.getElementById('closeQsBtn');
    if (btn) btn.addEventListener('click', toggleQuickSettings);
    if (closeBtn) closeBtn.addEventListener('click', toggleQuickSettings);

    const qsProfile = document.getElementById('qsProfile');
    if (qsProfile) {
        Object.values(profiles).forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = p.name || p.id;
            qsProfile.appendChild(opt);
        });
        qsProfile.value = currentProfile;
        qsProfile.addEventListener('change', e => changeProfile(e.target.value));
    }

    const qsTheme = document.getElementById('qsTheme');
    if (qsTheme) {
        qsTheme.value = localStorage.getItem('theme') || 'light';
        qsTheme.addEventListener('change', e => applyTheme(e.target.value));
    }

    const exportBtn = document.getElementById('qsExport');
    const importBtn = document.getElementById('qsImport');
    if (exportBtn) exportBtn.addEventListener('click', exportProfiles);
    if (importBtn) importBtn.addEventListener('click', importProfiles);

    updateHistory();
}

const savedProfile = localStorage.getItem('currentProfile') || 'agil_1';
applyProfile(savedProfile);
initMoneyFormat();
initChart();
initBarChart();
initGaugeCharts();
initDashboard();
initTheme();
initTour();
initGamification();
initQuickSettings();
updateCalculations();
