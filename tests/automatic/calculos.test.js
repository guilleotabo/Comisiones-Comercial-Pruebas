// TESTS AUTOMÁTICOS - No te asustes, son como fórmulas de Excel

// Importar las funciones a probar
const { calcularNivel, calcularMultiplicador, calcularComisionTotal } = require('../../src/modules/calculations');

// GRUPO 1: Probar cálculo de niveles
describe('Pruebas de Niveles', () => {
    // Prueba 1: Nivel Capilla
    test('Monto de 700 millones debe dar nivel Capilla (0)', () => {
        const resultado = calcularNivel(700000000, 'interno');
        expect(resultado).toBe(0); // Esperamos nivel 0 (Capilla)
    });

    // Prueba 2: Nivel Senior A
    test('Monto de 950 millones debe dar nivel Senior A (2)', () => {
        const resultado = calcularNivel(950000000, 'interno');
        expect(resultado).toBe(2); // Esperamos nivel 2 (Senior A)
    });

    // Prueba 3: Sin alcanzar ningún nivel
    test('Monto de 100 millones no alcanza ningún nivel', () => {
        const resultado = calcularNivel(100000000, 'interno');
        expect(resultado).toBe(-1); // Esperamos -1 (sin nivel)
    });
});

// GRUPO 2: Probar multiplicadores
describe('Pruebas de Multiplicadores', () => {
    // Prueba de conversión
    test('Conversión 8% debe dar multiplicador 1.0', () => {
        const resultado = calcularMultiplicador('conversion', 8);
        expect(resultado).toBe(1.0);
    });

    // Prueba de empatía baja
    test('Empatía 50% debe dar multiplicador 0', () => {
        const resultado = calcularMultiplicador('empatia', 50);
        expect(resultado).toBe(0);
    });
});

// GRUPO 3: Probar cálculo completo
describe('Pruebas de Comisión Total', () => {
    test('Caso completo Senior A con todos los bonos', () => {
        const datos = {
            nivelAnterior: 2,
            montoInterno: 900000000,
            montoExterno: 150000000,
            montoRecuperado: 80000000,
            cantidad: 9,
            menorSemana: 2,
            conversion: 8,
            empatia: 96,
            proceso: 95,
            mora: 2,
            nivelEquipo: 2
        };

        const resultado = calcularComisionTotal(datos);

        // Verificar que hay comisión
        expect(resultado.total).toBeGreaterThan(0);

        // Verificar que el subtotal es correcto
        expect(resultado.subtotal).toBe(7100000);

        // Verificar multiplicador
        expect(resultado.multiplicador).toBeCloseTo(1.05);
    });
});
