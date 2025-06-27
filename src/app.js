let niveles;
let metas;
let pagos;
let multConversion;
let multEmpatia;
let multProceso;
let multMora;

const baseConfig = {
    niveles: ['Capilla', 'Junior', 'Senior A', 'Senior B', 'Máster', 'Genio'],
    metas: {
        montoInterno: [600000000, 800000000, 900000000, 1000000000, 1100000000, 1200000000],
        montoExterno: [50000000, 100000000, 150000000, 200000000, 300000000, 400000000],
        montoRecuperado: [40000000, 60000000, 80000000, 100000000, 120000000, 150000000],
        cantidad: [6, 8, 9, 10, 12, 13]
    },
    pagos: {
        base: 3000000,
        carrera: [0, 0, 500000, 1000000, 1500000, 2000000],
        montoInterno: [500000, 600000, 1000000, 1400000, 2000000, 2500000],
        montoExterno: [800000, 1000000, 1500000, 2000000, 2500000, 3300000],
        montoRecuperado: [300000, 400000, 500000, 600000, 800000, 1000000],
        cantidad: [0, 400000, 600000, 700000, 1000000, 1200000],
        equipo: [0, 0, 0, 500000, 800000, 1000000]
    },
    multConversion: [
        {min: 10, mult: 1.1},
        {min: 8, mult: 1.0},
        {min: 7, mult: 0.8},
        {min: 6, mult: 0.7},
        {min: 5, mult: 0.6},
        {min: 4, mult: 0.5},
        {min: 0, mult: 0.3}
    ],
    multEmpatia: [
        {min: 96, mult: 1.0},
        {min: 90, mult: 0.9},
        {min: 80, mult: 0.5},
        {min: 70, mult: 0.3},
        {min: 0, mult: 0}
    ],
    multProceso: [
        {min: 95, mult: 1.0},
        {min: 90, mult: 0.95},
        {min: 85, mult: 0.8},
        {min: 70, mult: 0.3},
        {min: 0, mult: 0}
    ],
    multMora: [
        {min: 0, mult: 1.05},
        {min: 3, mult: 0.95},
        {min: 8, mult: 0.9},
        {min: 10, mult: 0.85},
        {min: 15, mult: 0.7}
    ]
};

function cloneConfig(cfg) {
    return JSON.parse(JSON.stringify(cfg));
}

const profiles = {
    agil_1: { id: 'agil_1', name: 'Ágil 1', config: cloneConfig(baseConfig) },
    agil_2: { id: 'agil_2', name: 'Ágil 2', config: cloneConfig(baseConfig) },
    empresarial_1: { id: 'empresarial_1', name: 'Empresarial 1', config: cloneConfig(baseConfig) },
    empresarial_2: { id: 'empresarial_2', name: 'Empresarial 2', config: cloneConfig(baseConfig) }
};

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
        initProgressBars();
    }
}

function updateCalculations() {
    calcular();
}

function changeProfile(profileId) {
    applyProfile(profileId);
    updateCalculations();
}

function updateProgress(id, nivel) {
    const bar = document.getElementById(id);
    if (!bar) return;
    const segs = bar.children;
    for (let i = 0; i < segs.length; i++) {
        segs[i].classList.remove('reached', 'current');
        if (nivel > i) segs[i].classList.add('reached');
    }
    if (nivel >= 0 && nivel < segs.length) {
        segs[nivel].classList.add('current');
    }
}

function resetProgressBars() {
    ['progInterno', 'progExterno', 'progRecuperado', 'progCantidad'].forEach(id => {
        const bar = document.getElementById(id);
        if (!bar) return;
        const html = bar.innerHTML;
        bar.innerHTML = html; // remove previous listeners
    });
}

function initProgressBars() {
    const cfg = [
        {bar: 'progInterno', input: 'montoInterno', metas: metas.montoInterno},
        {bar: 'progExterno', input: 'montoExterno', metas: metas.montoExterno},
        {bar: 'progRecuperado', input: 'montoRecuperado', metas: metas.montoRecuperado},
        {bar: 'progCantidad', input: 'cantidad', metas: metas.cantidad}
    ];
    cfg.forEach(c => {
        const bar = document.getElementById(c.bar);
        if (!bar) return;
        Array.from(bar.children).forEach((seg, i) => {
            seg.addEventListener('click', () => {
                document.getElementById(c.input).value = c.metas[i];
                calcular();
            });
        });
    });
}

function nivelPorValor(valor, metasArr) {
    let nivel = 0;
    for (let i = 0; i < metasArr.length; i++) {
        if (valor >= metasArr[i]) nivel = i;
    }
    return nivel;
}

function getMult(valor, tabla) {
    let mult = tabla[tabla.length - 1].mult;
    let bestMin = -Infinity;
    for (let i = 0; i < tabla.length; i++) {
        if (valor >= tabla[i].min && tabla[i].min >= bestMin) {
            bestMin = tabla[i].min;
            mult = tabla[i].mult;
        }
    }
    return mult;
}

function calcular() {
    const montoInterno = Number(document.getElementById('montoInterno').value) || 0;
    const montoExterno = Number(document.getElementById('montoExterno').value) || 0;
    const montoRecuperado = Number(document.getElementById('montoRecuperado').value) || 0;
    const cantidad = Number(document.getElementById('cantidad').value) || 0;
    const menorSemana = Number(document.getElementById('menorSemana').value) || 0;
    const conv = Number(document.getElementById('conv').value) || 0;
    const emp = Number(document.getElementById('emp').value) || 0;
    const proc = Number(document.getElementById('proc').value) || 0;
    const mora = Number(document.getElementById('mora').value) || 0;
    const nivelAnterior = Number(document.getElementById('nivelAnterior').value);
    const nivelEquipo = Number(document.getElementById('nivelEquipo').value);

    const nivelInterno = nivelPorValor(montoInterno, metas.montoInterno);
    const nivelExterno = nivelPorValor(montoExterno, metas.montoExterno);
    const nivelRecuperado = nivelPorValor(montoRecuperado, metas.montoRecuperado);
    const nivelCantidadCalc = menorSemana >= 2 ? nivelPorValor(cantidad, metas.cantidad) : -1;

    updateProgress('progInterno', nivelInterno);
    updateProgress('progExterno', nivelExterno);
    updateProgress('progRecuperado', nivelRecuperado);
    updateProgress('progCantidad', nivelPorValor(cantidad, metas.cantidad));

    const nivelCarreraMes = Math.min(nivelInterno, nivelExterno, nivelRecuperado, nivelCantidadCalc === -1 ? -1 : nivelCantidadCalc);
    const nivelCarreraFinal = Math.min(nivelCarreraMes, nivelAnterior);

    const llaveMontos = cantidad >= 6;
    const premioCarrera = nivelCarreraFinal >= 0 ? pagos.carrera[nivelCarreraFinal] : 0;
    const premioInterno = llaveMontos ? pagos.montoInterno[nivelInterno] : 0;
    const premioExterno = llaveMontos ? pagos.montoExterno[nivelExterno] : 0;
    const premioRecuperado = llaveMontos ? pagos.montoRecuperado[nivelRecuperado] : 0;
    const premioCantidad = nivelCantidadCalc >= 0 ? pagos.cantidad[nivelCantidadCalc] : 0;
    const premioEquipo = (nivelCarreraFinal >= 2 && nivelEquipo >= 2)
        ? pagos.equipo[Math.min(nivelCarreraFinal, nivelEquipo)]
        : 0;

    const subtotal = pagos.base + premioCarrera + premioInterno + premioExterno + premioRecuperado + premioCantidad + premioEquipo;
    const parteVariable = subtotal - pagos.base;
    let multiplicadorTotal = getMult(conv, multConversion) * getMult(emp, multEmpatia) * getMult(proc, multProceso) * getMult(mora, multMora);
    if (multiplicadorTotal < 0.1) multiplicadorTotal = 0.1;
    const totalVariable = parteVariable * multiplicadorTotal;
    const comisionFinal = pagos.base + totalVariable;

    document.getElementById('comisionTotal').innerText = comisionFinal.toLocaleString('es-ES');

    document.getElementById('detalle').innerHTML = `
        <p>Nivel Carrera: ${nivelCarreraFinal >= 0 ? niveles[nivelCarreraFinal] : 'Sin nivel'}</p>
        <p>Subtotal: ${subtotal.toLocaleString('es-ES')}</p>
        <p>Multiplicador: ${multiplicadorTotal.toFixed(2)}</p>
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

document.getElementById('pdfButton').addEventListener('click', descargarPDF);

const savedProfile = localStorage.getItem('currentProfile') || 'agil_1';
applyProfile(savedProfile);
updateCalculations();
