const { calculateCommission } = require('../../src/app');

test('SPEC 9.1 total equals 7,305,000 Gs', () => {
  const result = calculateCommission({
    nivelAnterior: 2, // Senior A
    montoInterno: 900000000,
    montoExterno: 150000000,
    montoRecuperado: 80000000,
    cantidad: 9,
    menorSemana: 2,
    conv: 8,
    emp: 96,
    proc: 95,
    mora: 2,
    nivelEquipo: 0
  });
  expect(result.total).toBe(7305000);
});
