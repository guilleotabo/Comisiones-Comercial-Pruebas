const Calculos = (function() {

    // --- FUNCIONES INTERNAS DE CÁLCULO ---

    function calcularMultiplicador(tipo, valor, multiplicadores) {
        const tabla = multiplicadores[tipo];
        if (!tabla) return 0;

        if (tipo === 'mora') {
            // La tabla de mora está invertida (mayor valor, menor multiplicador)
            for (let i = tabla.length - 1; i >= 0; i--) {
                if (valor >= tabla[i].min) return tabla[i].mult;
            }
            return 0;
        }

        // Para otros multiplicadores (mayor valor, mayor multiplicador)
        for (const item of tabla) {
            if (valor >= item.min) return item.mult;
        }
        return 0;
    }

    function getNivelAlcanzado(tipo, valor, metas) {
        const metas_array = metas[tipo];
        let nivelAlcanzado = -1;
        for (let i = 0; i < metas_array.length; i++) {
            if (valor >= metas_array[i]) {
                nivelAlcanzado = i;
            } else {
                break; // Optimización: si no cumple una meta, no cumplirá las siguientes
            }
        }
        return nivelAlcanzado;
    }
    
    // --- FUNCIONES PÚBLICAS ---

    // Obtiene información completa sobre un multiplicador (valor, texto de estado, clase css)
    function getMultiplicadorInfo(tipo, valor, multiplicadores) {
        const mult = calcularMultiplicador(tipo, valor, multiplicadores);
        let status = 'Mejorar';
        let badgeClass = 'danger';

        if (mult >= 1) {
            status = 'Óptimo';
            badgeClass = 'success';
        } else if (mult >= 0.8) {
            status = 'Regular';
            badgeClass = 'warning';
        }
        return { mult, status, badgeClass };
    }


    function generarSugerencias(values, results, config) {
        const { niveles, metas, pagos } = config;
        const { nivelCarrera, nivelInterno, nivelExterno, nivelRecuperado, nivelCantidadReal, subtotal, multiplicadores } = results;
        const sugerencias = [];

        // 1. PRIORIDAD ALTA - Tu limitante principal
        const limitantes = [
            { tipo: 'Monto Interno', nivel: nivelInterno },
            { tipo: 'Monto Externo', nivel: nivelExterno },
            { tipo: 'Recuperados', nivel: nivelRecuperado },
            { tipo: 'Cantidad', nivel: nivelCantidadReal }
        ].filter(l => l.nivel >= 0);

        if (limitantes.length > 0) {
            const limitante = limitantes.reduce((min, curr) => curr.nivel < min.nivel ? curr : min);
            if (limitante.nivel < 5) {
                const siguienteNivel = niveles[limitante.nivel + 1];
                const diferenciaPremio = pagos.carrera[limitante.nivel + 1] - pagos.carrera[limitante.nivel];
                if (diferenciaPremio > 0) {
                     sugerencias.push({
                        categoria: 'high-priority',
                        titulo: '🚨 Tu Limitante Principal',
                        texto: `Tu ${limitante.tipo} (${niveles[limitante.nivel]}) limita tu carrera. Alcanzando ${siguienteNivel} en este indicador sumarías ${UI.formatNumber(diferenciaPremio)} Gs en premio carrera.`
                    });
                }
            }
        }
        
        // 2. ALERTAS
        if (values.menorSemana < 2 && values.cantidad >= 6) {
            const premioPotencial = nivelCantidadReal >= 0 ? pagos.cantidad[nivelCantidadReal] : 0;
             sugerencias.push({
                categoria: 'alerts',
                titulo: '⚠️ Alertas',
                texto: `Sin 2 desembolsos/semana no cobrás premio por cantidad (estás perdiendo ${UI.formatNumber(premioPotencial)} Gs).`
            });
        }
        if (values.cantidad < 6 && (nivelInterno >= 0 || nivelExterno >= 0 || nivelRecuperado >= 0)) {
            sugerencias.push({
                categoria: 'alerts',
                titulo: '⚠️ Alertas',
                texto: `Te faltan ${6 - values.cantidad} desembolsos para activar los premios por montos (interno, externo, recuperado).`
            });
        }

        // 3. MEJORAS DE MULTIPLICADORES
        const peorMultiplicador = Object.entries(multiplicadores)
            .filter(([tipo]) => tipo !== 'mora' && tipo !== 'total')
            .map(([tipo, valor]) => ({ tipo, valor }))
            .reduce((min, curr) => curr.valor < min.valor ? curr : min);

        if (peorMultiplicador.valor < 1) {
            const mejoraPotencial = (subtotal - config.base) * (1 - peorMultiplicador.valor);
             sugerencias.push({
                categoria: 'multipliers',
                titulo: '⚡ Mejora de Multiplicadores',
                texto: `Tu ${peorMultiplicador.tipo} es tu punto más débil. Llevarlo al 100% podría sumar hasta ${UI.formatNumber(mejoraPotencial)} Gs a tu comisión.`
            });
        }

        return sugerencias;
    }


    // Función principal que centraliza todos los cálculos
    function computeAll(values, config) {
        const { base, metas, pagos, multiplicadores: multConfig } = config;

        // Niveles
        const nivelInterno = getNivelAlcanzado('montoInterno', values.montoInterno, metas);
        const nivelExterno = getNivelAlcanzado('montoExterno', values.montoExterno, metas);
        const nivelRecuperado = getNivelAlcanzado('montoRecuperado', values.montoRecuperado, metas);
        const nivelCantidadReal = getNivelAlcanzado('cantidad', values.cantidad, metas);

        // Nivel de carrera (el menor de los 4 indicadores principales de este mes, comparado con el mes anterior)
        const nivelesAlcanzadosEsteMes = [nivelInterno, nivelExterno, nivelRecuperado, nivelCantidadReal].filter(n => n >= 0);
        const nivelMinimoEsteMes = nivelesAlcanzadosEsteMes.length > 0 ? Math.min(...nivelesAlcanzadosEsteMes) : -1;
        const nivelCarrera = Math.min(nivelMinimoEsteMes, values.nivelAnterior);

        // Llaves
        const cumpleLlaveMonto = values.cantidad >= 6;
        const cumpleLlaveCantidad = values.menorSemana >= 2;
        const nivelCantidadLimitado = cumpleLlaveCantidad ? nivelCantidadReal : -1;

        // Bonos
        const bonusCarrera = nivelCarrera >= 0 ? pagos.carrera[nivelCarrera] : 0;
        const bonusInterno = (nivelInterno >= 0 && cumpleLlaveMonto) ? pagos.montoInterno[nivelInterno] : 0;
        const bonusExterno = (nivelExterno >= 0 && cumpleLlaveMonto) ? pagos.montoExterno[nivelExterno] : 0;
        const bonusRecuperado = (nivelRecuperado >= 0 && cumpleLlaveMonto) ? pagos.montoRecuperado[nivelRecuperado] : 0;
        const bonusCantidad = nivelCantidadLimitado >= 0 ? pagos.cantidad[nivelCantidadLimitado] : 0;
        
        let bonusEquipo = 0;
        if (nivelCarrera >= 2 && values.nivelEquipo >= 2) { // Requiere que el asesor y el equipo sean Senior A+
            bonusEquipo = pagos.equipo[values.nivelEquipo];
        }

        // Subtotal
        const subtotal = base + bonusCarrera + bonusInterno + bonusExterno + bonusRecuperado + bonusCantidad + bonusEquipo;
        
        // Multiplicadores
        const multiConversion = calcularMultiplicador('conversion', values.conversion, multConfig);
        const multiEmpatia = calcularMultiplicador('empatia', values.empatia, multConfig);
        const multiProceso = calcularMultiplicador('proceso', values.proceso, multConfig);
        const multiMora = calcularMultiplicador('mora', values.mora, multConfig);
        const multiplicadorTotal = Math.max(multiConversion * multiEmpatia * multiProceso * multiMora, 0.1);

        // Total
        const parteVariable = subtotal - base;
        const total = base + (parteVariable * multiplicadorTotal);

        return {
            nivelInterno,
            nivelExterno,
            nivelRecuperado,
            nivelCantidadReal,
            nivelCarrera,
            cumpleLlaveMonto,
            cumpleLlaveCantidad,
            bonos: {
                carrera: bonusCarrera,
                interno: bonusInterno,
                externo: bonusExterno,
                recuperado: bonusRecuperado,
                cantidad: bonusCantidad,
                equipo: bonusEquipo,
            },
            subtotal,
            multiplicadores: {
                conversion: multiConversion,
                empatia: multiEmpatia,
                proceso: multiProceso,
                mora: multiMora,
                total: multiplicadorTotal,
            },
            total
        };
    }

    // Exponer las funciones públicas
    return {
        computeAll,
        getMultiplicadorInfo,
        generarSugerencias
    };

})();
