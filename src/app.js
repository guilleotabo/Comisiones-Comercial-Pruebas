/* Niveles y metas */
const niveles = ['Capilla', 'Junior', 'Senior A', 'Senior B', 'Máster', 'Genio'];
const metas = {
    montoInterno: [600000000, 800000000, 900000000, 1000000000, 1100000000, 1200000000],
    montoExterno: [50000000, 100000000, 150000000, 200000000, 300000000, 400000000],
    montoRecuperado: [40000000, 60000000, 80000000, 100000000, 120000000, 150000000],
    cantidad: [6, 8, 9, 10, 12, 13]
};
const pagos = {
    base: 3000000,
    carrera: [0, 0, 500000, 1000000, 1500000, 2000000],
    montoInterno: [500000, 600000, 1000000, 1400000, 2000000, 2500000],
    montoExterno: [800000, 1000000, 1500000, 2000000, 2500000, 3300000],
    montoRecuperado: [300000, 400000, 500000, 600000, 800000, 1000000],
    cantidad: [0, 400000, 600000, 700000, 1000000, 1200000],
    equipo: [0, 0, 0, 500000, 800000, 1000000]
};

const multConversion = [
    {min: 10, mult: 1.1},
    {min: 8, mult: 1.0},
    {min: 7, mult: 0.8},
    {min: 6, mult: 0.7},
    {min: 5, mult: 0.6},
    {min: 4, mult: 0.5},
    {min: 0, mult: 0.3}
];
const multEmpatia = [
    {min: 96, mult: 1.0},
    {min: 90, mult: 0.9},
    {min: 80, mult: 0.5},
    {min: 70, mult: 0.3},
    {min: 0, mult: 0}
];
const multProceso = [
    {min: 95, mult: 1.0},
    {min: 90, mult: 0.95},
    {min: 85, mult: 0.8},
    {min: 70, mult: 0.3},
    {min: 0, mult: 0}
];
const multMora = [
    {min: 0, mult: 1.05},
    {min: 3, mult: 0.95},
    {min: 8, mult: 0.9},
    {min: 10, mult: 0.85},
    {min: 15, mult: 0.7}
];

function nivelPorValor(valor, metasArr) {
    let nivel = 0;
    for (let i = 0; i < metasArr.length; i++) {
        if (valor >= metasArr[i]) nivel = i;
    }
    return nivel;
}

function getMult(valor, tabla) {
    for (let i = 0; i < tabla.length; i++) {
        if (valor >= tabla[i].min) return tabla[i].mult;
    }
    return tabla[tabla.length - 1].mult;
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
    const nivelCantidad = menorSemana >= 2 ? nivelPorValor(cantidad, metas.cantidad) : -1;

    const nivelCarreraMes = Math.min(nivelInterno, nivelExterno, nivelRecuperado, nivelCantidad === -1 ? -1 : nivelCantidad);
    const nivelCarreraFinal = Math.min(nivelCarreraMes, nivelAnterior);

    const llaveMontos = cantidad >= 6;
    const premioCarrera = nivelCarreraFinal >= 0 ? pagos.carrera[nivelCarreraFinal] : 0;
    const premioInterno = llaveMontos ? pagos.montoInterno[nivelInterno] : 0;
    const premioExterno = llaveMontos ? pagos.montoExterno[nivelExterno] : 0;
    const premioRecuperado = llaveMontos ? pagos.montoRecuperado[nivelRecuperado] : 0;
    const premioCantidad = nivelCantidad >= 0 ? pagos.cantidad[nivelCantidad] : 0;
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

calcular();
