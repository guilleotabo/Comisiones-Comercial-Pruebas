// Default configuration objects and helpers

export const baseConfig = {
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

export const metas = baseConfig.metas;

export function cloneConfig(cfg) {
    return JSON.parse(JSON.stringify(cfg));
}

export const defaultProfiles = {
    agil_1: { id: 'agil_1', name: 'Ágil 1', config: cloneConfig(baseConfig) },
    agil_2: { id: 'agil_2', name: 'Ágil 2', config: cloneConfig(baseConfig) },
    empresarial_1: { id: 'empresarial_1', name: 'Empresarial 1', config: cloneConfig(baseConfig) },
    empresarial_2: { id: 'empresarial_2', name: 'Empresarial 2', config: cloneConfig(baseConfig) }
};
