const CONFIG = {
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
    { min: 10, mult: 1.1 },
    { min: 8, mult: 1.0 },
    { min: 7, mult: 0.8 },
    { min: 6, mult: 0.7 },
    { min: 5, mult: 0.6 },
    { min: 4, mult: 0.5 },
    { min: 0, mult: 0.3 }
  ],
  multEmpatia: [
    { min: 96, mult: 1.0 },
    { min: 90, mult: 0.9 },
    { min: 80, mult: 0.5 },
    { min: 70, mult: 0.3 },
    { min: 0, mult: 0 }
  ],
  multProceso: [
    { min: 95, mult: 1.0 },
    { min: 90, mult: 0.95 },
    { min: 85, mult: 0.8 },
    { min: 70, mult: 0.3 },
    { min: 0, mult: 0 }
  ],
  multMora: [
    { min: 0, mult: 1.05 },
    { min: 3, mult: 0.95 },
    { min: 8, mult: 0.9 },
    { min: 10, mult: 0.85 },
    { min: 15, mult: 0.7 }
  ]
};

function nivelPorValor(valor, metasArr) {
  let nivel = -1;
  for (let i = 0; i < metasArr.length; i++) {
    if (valor >= metasArr[i]) nivel = i;
  }
  return nivel;
}

function calcularNivel(monto, tipo) {
  const map = {
    interno: 'montoInterno',
    externo: 'montoExterno',
    recuperado: 'montoRecuperado',
    cantidad: 'cantidad'
  };
  const key = map[tipo];
  if (!key) {
    throw new TypeError(`Tipo inválido: ${tipo}`);
  }
  return nivelPorValor(monto, CONFIG.metas[key]);
}

function calcularMultiplicador(tipo, valor) {
  const map = {
    conversion: CONFIG.multConversion,
    empatia: CONFIG.multEmpatia,
    proceso: CONFIG.multProceso,
    mora: CONFIG.multMora
  };
  const tabla = map[tipo];
  if (!tabla) {
    throw new TypeError(`Tipo inválido: ${tipo}`);
  }
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

function calcularComisionTotal(data) {
  const nivelInterno = calcularNivel(data.montoInterno, 'interno');
  const nivelExterno = calcularNivel(data.montoExterno, 'externo');
  const nivelRecuperado = calcularNivel(data.montoRecuperado, 'recuperado');
  const nivelCantidad = calcularNivel(data.cantidad, 'cantidad');
  const nivelCantidadCalc = data.menorSemana >= 2 ? nivelCantidad : -1;

  const nivelCarreraMes = Math.min(
    nivelInterno,
    nivelExterno,
    nivelRecuperado,
    nivelCantidadCalc === -1 ? -1 : nivelCantidadCalc
  );
  const nivelCarreraFinal = Math.min(nivelCarreraMes, data.nivelAnterior);

  const llaveMontos = data.cantidad >= 6;
  const bonusCarrera = nivelCarreraFinal >= 0 ? CONFIG.pagos.carrera[nivelCarreraFinal] : 0;
  const bonusInterno = llaveMontos ? CONFIG.pagos.montoInterno[nivelInterno] : 0;
  const bonusExterno = llaveMontos ? CONFIG.pagos.montoExterno[nivelExterno] : 0;
  const bonusRecuperado = llaveMontos ? CONFIG.pagos.montoRecuperado[nivelRecuperado] : 0;
  const bonusCantidad = nivelCantidadCalc >= 0 ? CONFIG.pagos.cantidad[nivelCantidadCalc] : 0;
  const bonusEquipo =
    nivelCarreraFinal >= 2 && data.nivelEquipo >= 2
      ? CONFIG.pagos.equipo[Math.min(nivelCarreraFinal, data.nivelEquipo)]
      : 0;

  const subtotal =
    CONFIG.pagos.base +
    bonusCarrera +
    bonusInterno +
    bonusExterno +
    bonusRecuperado +
    bonusCantidad +
    bonusEquipo;

  const parteVariable = subtotal - CONFIG.pagos.base;
  let multiplicador =
    calcularMultiplicador('conversion', data.conversion) *
    calcularMultiplicador('empatia', data.empatia) *
    calcularMultiplicador('proceso', data.proceso) *
    calcularMultiplicador('mora', data.mora);

  if (multiplicador < 0.1) multiplicador = 0.1;

  const totalVariable = parteVariable * multiplicador;
  const total = CONFIG.pagos.base + totalVariable;

  return {
    base: CONFIG.pagos.base,
    carrera: bonusCarrera,
    interno: bonusInterno,
    externo: bonusExterno,
    recuperado: bonusRecuperado,
    cantidad: bonusCantidad,
    equipo: bonusEquipo,
    subtotal,
    multiplicador,
    total
  };
}

module.exports = {
  calcularNivel,
  calcularMultiplicador,
  calcularComisionTotal
};
