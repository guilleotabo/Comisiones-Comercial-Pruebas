import { baseConfig } from './config.js';

function nivelPorValor(valor, metasArr) {
    let nivel = -1;
    for (let i = 0; i < metasArr.length; i++) {
        if (valor >= metasArr[i]) nivel = i;
    }
    return nivel;
}

export function calcularNivel(monto, tipo, config = baseConfig) {
    const metas = config.metas;
    switch (tipo) {
        case 'interno':
            return nivelPorValor(monto, metas.montoInterno);
        case 'externo':
            return nivelPorValor(monto, metas.montoExterno);
        case 'recuperado':
            return nivelPorValor(monto, metas.montoRecuperado);
        case 'cantidad':
            return nivelPorValor(monto, metas.cantidad);
        default:
            throw new Error(`Tipo inválido: ${tipo}`);
    }
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

export function calcularMultiplicador(tipo, valor, config = baseConfig) {
    switch (tipo) {
        case 'conversion':
            return getMult(valor, config.multConversion);
        case 'empatia':
            return getMult(valor, config.multEmpatia);
        case 'proceso':
            return getMult(valor, config.multProceso);
        case 'mora':
            return getMult(valor, config.multMora);
        default:
            throw new Error(`Tipo inválido: ${tipo}`);
    }
}

export function calcularComisionTotal(data, config = baseConfig) {
    const metas = config.metas;
    const pagos = config.pagos;

    const nivelInterno = calcularNivel(data.montoInterno, 'interno', config);
    const nivelExterno = calcularNivel(data.montoExterno, 'externo', config);
    const nivelRecuperado = calcularNivel(data.montoRecuperado, 'recuperado', config);
    const nivelCantidadCalc = data.menorSemana >= 2 ? calcularNivel(data.cantidad, 'cantidad', config) : -1;

    const nivelCarreraMes = Math.min(nivelInterno, nivelExterno, nivelRecuperado, nivelCantidadCalc === -1 ? -1 : nivelCantidadCalc);
    const nivelCarreraFinal = Math.min(nivelCarreraMes, data.nivelAnterior);

    const llaveMontos = data.cantidad >= 6;
    const premioCarrera = nivelCarreraFinal >= 0 ? pagos.carrera[nivelCarreraFinal] : 0;
    const premioInterno = llaveMontos ? pagos.montoInterno[nivelInterno] : 0;
    const premioExterno = llaveMontos ? pagos.montoExterno[nivelExterno] : 0;
    const premioRecuperado = llaveMontos ? pagos.montoRecuperado[nivelRecuperado] : 0;
    const premioCantidad = nivelCantidadCalc >= 0 ? pagos.cantidad[nivelCantidadCalc] : 0;
    const premioEquipo = (nivelCarreraFinal >= 2 && data.nivelEquipo >= 2)
        ? pagos.equipo[Math.min(nivelCarreraFinal, data.nivelEquipo)]
        : 0;

    const subtotal = pagos.base + premioCarrera + premioInterno + premioExterno + premioRecuperado + premioCantidad + premioEquipo;
    const parteVariable = subtotal - pagos.base;
    let multiplicadorTotal = calcularMultiplicador('conversion', data.conversion, config)
        * calcularMultiplicador('empatia', data.empatia, config)
        * calcularMultiplicador('proceso', data.proceso, config)
        * calcularMultiplicador('mora', data.mora, config);
    if (multiplicadorTotal < 0.1) multiplicadorTotal = 0.1;
    const totalVariable = parteVariable * multiplicadorTotal;
    const comisionFinal = pagos.base + totalVariable;

    return {
        total: comisionFinal,
        subtotal,
        multiplicador: multiplicadorTotal,
        nivelCarreraFinal,
        detalle: {
            base: pagos.base,
            carrera: premioCarrera,
            interno: premioInterno,
            externo: premioExterno,
            recuperado: premioRecuperado,
            cantidad: premioCantidad,
            equipo: premioEquipo
        }
    };
}
