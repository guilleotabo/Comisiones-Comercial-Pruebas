# **GUÍA DE IMPLEMENTACIÓN \- SISTEMA DE COMISIONES**

## **Plan de Proyecto Fase por Fase**

### **📁 ESTRUCTURA DE ARCHIVOS EN TU REPO**

```
commission-calculator/
├── README.md                  # Resumen simple del proyecto
├── SPECIFICATIONS.md          # El documento completo que creamos
├── IMPLEMENTATION_GUIDE.md    # Este documento (fases)
├── src/                      # Código fuente
├── tests/                    # Pruebas
└── docs/                     # Documentación adicional
```

### **🎯 CÓMO USAR ESTA GUÍA**

1. Sube el documento completo que creamos como `SPECIFICATIONS.md`  
2. Sube esta guía como `IMPLEMENTATION_GUIDE.md`  
3. Ejecuta las fases en orden  
4. Marca ✅ cada punto completado  
5. Si algo falla, sigue las instrucciones de "Si sale mal"

---

## **📋 FASE 1: APLICACIÓN BASE**

**Objetivo**: Crear la versión básica funcional sin features avanzados

### **PROMPT PARA CODEX:**

```
Basándote en SPECIFICATIONS.md, implementa la versión BÁSICA de la aplicación:

CREAR:
- index.html (estructura según sección 7.1)
- comisiones.css (estilos según sección 7.2)
- app.js (un solo archivo con toda la lógica de las secciones 3-6)

INCLUIR:
- Los 6 niveles (Capilla a Genio)
- Cálculos de comisiones con las fórmulas de sección 6
- Llaves de 6 desembolsos y 2/semana (sección 4.1)
- Multiplicadores (sección 5)
- PDF simple básico

NO INCLUIR AÚN:
- Sistema de perfiles
- Panel admin
- PDF profesional
- Tests

Que funcione el cálculo básico completo primero.
```

### **VALIDACIÓN FASE 1:**

* \[ \] La aplicación abre en el navegador  
* \[ \] Puedo ingresar valores en todos los campos  
* \[ \] **TEST CÁLCULO**: Con estos valores exactos:  
  * Monto Interno: 900,000,000  
  * Monto Externo: 150,000,000  
  * Recuperados: 80,000,000  
  * Cantidad: 9  
  * Menor semana: 2  
  * Conversión: 8%  
  * Empatía: 96%  
  * Proceso: 95%  
  * Mora: 2%  
  * **DEBE DAR**: Comisión total \~7,305,000 Gs  
* \[ \] El PDF simple se descarga  
* \[ \] Las barras de progreso muestran niveles

### **SI SALE MAL:**

```
PROMPT DE CORRECCIÓN:
"El cálculo no está dando el resultado esperado. Según SPECIFICATIONS.md sección 6:
- Subtotal debe ser: base (3M) + carrera + bonos = 7,100,000
- Multiplicador debe ser: 1.0 × 1.0 × 1.0 × 1.05 = 1.05
- Total debe ser: 3M + (4.1M × 1.05) = 7,305,000

Actualmente da: [tu resultado]
Por favor corrige la lógica de cálculo."
```

---

## **📋 FASE 2: SISTEMA DE PERFILES**

**Objetivo**: Agregar los 4 perfiles comerciales

### **PREREQUISITOS:**

* \[✅\] Fase 1 completada y funcionando

### **PROMPT PARA CODEX:**

```
Agrega el sistema de perfiles según SPECIFICATIONS.md sección 19:

MODIFICAR:
- app.js: Separar la configuración en perfiles

AGREGAR:
- Selector de perfiles en el header
- 4 perfiles: Ágil 1, Ágil 2, Empresarial 1, Empresarial 2
- Todos con los mismos valores iniciales (los actuales)
- Guardar perfil seleccionado en localStorage

COMPORTAMIENTO:
- Al cambiar perfil → recalcular todo
- Al recargar → mantener último perfil
- Mostrar nombre del perfil actual

NO MODIFICAR:
- Lógica de cálculo existente
- Estructura HTML/CSS base
```

### **VALIDACIÓN FASE 2:**

* \[ \] Aparece selector con 4 opciones  
* \[ \] Al cambiar de perfil se recalcula  
* \[ \] Al recargar página mantiene el perfil  
* \[ \] Los cálculos siguen funcionando igual  
* \[ \] Se ve el nombre del perfil seleccionado

### **SI SALE MAL:**

```
PROMPT DE CORRECCIÓN:
"El selector de perfiles no está funcionando. Necesito que:
1. Sea un <select> en el header
2. Al cambiar dispare evento 'change'
3. Recalcule con updateCalculations()
4. Guarde en localStorage('currentProfile', perfilId)

Revisa SPECIFICATIONS.md sección 19.2"
```

---

## **📋 FASE 3: PANEL DE ADMINISTRACIÓN**

**Objetivo**: Crear interfaz para modificar valores sin tocar código

### **PREREQUISITOS:**

* \[✅\] Fase 2 completada  
* \[✅\] Los 4 perfiles funcionan

### **PROMPT PARA CODEX:**

```
Implementa el panel admin según SPECIFICATIONS.md sección 20:

CREAR ARCHIVOS NUEVOS:
- admin.html (estructura sección 20.1)
- admin.js (lógica sección 20.2)
- admin.css (estilos sección 20.3)

FUNCIONALIDADES:
 - Login con PIN: GT2520
- 4 tabs (uno por perfil)
- Tablas editables para:
  * Base fija
  * Metas (4 tipos × 6 niveles)
  * Pagos (6 tipos × 6 niveles)
  * Multiplicadores (4 tipos)
- Botón guardar cambios
- Vista previa de cambios

IMPORTANTE:
- Los cambios se guardan en localStorage
- Al guardar, la app principal debe usar los nuevos valores
```

### **VALIDACIÓN FASE 3:**

* \[ \] Puedo acceder a /admin.html  
* \[ \] PIN incorrecto (111111) → no entra  
* \[ \] PIN correcto (GT2520) → entra
* \[ \] Veo 4 pestañas de perfiles  
* \[ \] **TEST CAMBIO**:  
  * Cambiar base de Ágil 1 a 3,500,000  
  * Guardar  
  * Ir a app principal  
  * Seleccionar Ágil 1  
  * La base debe mostrar 3,500,000  
* \[ \] Los cambios persisten al recargar

### **SI SALE MAL:**

```
PROMPT DE CORRECCIÓN:
"El panel admin no está guardando los cambios. Debe:
1. Guardar en localStorage key: 'commission_profiles'
2. La app principal debe leer este localStorage
3. Si existe, usar esos valores en lugar de los default

Ver SPECIFICATIONS.md sección 20.2 método saveChanges()"
```

---

## **📋 FASE 4: PDF PROFESIONAL**

**Objetivo**: Agregar reporte PDF con gráficos y diseño ejecutivo

### **PREREQUISITOS:**

* \[✅\] Fase 3 completada  
* \[✅\] Panel admin funciona

### **PROMPT PARA CODEX:**

```
Agrega PDF profesional según SPECIFICATIONS.md sección 21:

AGREGAR:
- Librería jsPDF (via CDN)
- Nueva opción en menú PDF

MODIFICAR:
- Convertir botón PDF en menú desplegable:
  * PDF Simple (existente)
  * PDF Profesional (nuevo)

PDF PROFESIONAL DEBE TENER:
- Header con título y fecha
- Datos del comercial (pedir nombre)
- Resumen con 4 KPIs principales
- Gráfico de torta (composición)
- Tablas detalladas
- Código de verificación

IMPORTANTE:
- Mantener PDF simple funcionando
- Usar los ejemplos de sección 21.1
```

### **VALIDACIÓN FASE 4:**

* \[ \] Aparece menú desplegable al hacer clic en PDF  
* \[ \] PDF Simple sigue funcionando igual  
* \[ \] PDF Profesional pide nombre  
* \[ \] **TEST PDF PRO**:  
  * Ingresar "Juan Pérez"  
  * El PDF muestra:  
    * Nombre: Juan Pérez  
    * Fecha actual  
    * Gráfico de torta  
    * Tablas con detalles  
    * Código verificación (8 caracteres)  
* \[ \] El PDF se ve profesional

### **SI SALE MAL:**

```
PROMPT DE CORRECCIÓN:
"El PDF profesional no está generando el gráfico. Necesito:
1. Crear canvas temporal con Chart.js
2. Generar gráfico tipo doughnut
3. Convertir a imagen con canvas.toDataURL()
4. Agregar al PDF con doc.addImage()

Ver ejemplo en SPECIFICATIONS.md sección 21.1 método addVisualComposition()"
```

---

## **📋 FASE 5: TESTING Y DOCUMENTACIÓN**

**Objetivo**: Agregar tests y documentación de uso

### **PREREQUISITOS:**

* \[✅\] Fases 1-4 completadas  
* \[✅\] Todo funciona correctamente

### **PROMPT PARA CODEX:**

```
Implementa testing según SPECIFICATIONS.md sección 16:

CREAR:
- tests/manual/checklist.md (sección 16.2 PASO 3)
- tests/automatic/calculos.test.js (ejemplos básicos)
- tests/casos-de-prueba.md (plantilla)

AGREGAR EN package.json:
- Scripts de test
- Dependencia jest (dev)

DOCUMENTAR:
- Cómo ejecutar tests
- Qué validar manualmente
- Formato para reportar bugs

MANTENER SIMPLE:
- Solo tests esenciales
- Enfoque en tests manuales
- Documentación para no-programadores
```

### **VALIDACIÓN FASE 5:**

* \[ \] Existe carpeta tests/ con archivos  
* \[ \] checklist.md tiene todas las pruebas  
* \[ \] `npm test` ejecuta (aunque fallen)  
* \[ \] Documentación clara y simple  
* \[ \] Un README.md actualizado

### **SI SALE MAL:**

```
PROMPT DE CORRECCIÓN:
"Los tests no están configurados. Necesito:
1. Agregar en package.json:
   "devDependencies": { "jest": "^27.0.0" }
   "scripts": { "test": "jest" }
2. Los tests pueden fallar, solo importa la estructura
3. El checklist manual es lo más importante

Ver SPECIFICATIONS.md sección 16.2"
```

---

## **🎯 VALIDACIÓN FINAL**

### **CHECKLIST COMPLETO:**

* \[ \] **CÁLCULOS**: Caso Senior A da 7,305,000 Gs  
* \[ \] **PERFILES**: Los 4 funcionan independientes  
* \[ \] **ADMIN**: Puedo cambiar cualquier valor  
* \[ \] **PDF**: Ambos tipos se generan  
* \[ \] **TESTS**: Tengo forma de validar  
* \[ \] **PERSISTENCIA**: Todo se guarda al recargar

### **TEST DE INTEGRACIÓN FINAL:**

1. Seleccionar perfil "Empresarial 1"  
2. Ir a admin y cambiar su base a 4,000,000  
3. Volver a la app  
4. Verificar que usa 4,000,000  
5. Generar PDF profesional  
6. Verificar que el PDF muestra 4,000,000

---

## **🚀 COMANDOS RÁPIDOS**

```shell
# Después de cada fase exitosa:
git add .
git commit -m "Fase X completada: [descripción]"

# Si necesitas volver atrás:
git reset --hard HEAD~1

# Para ver tu progreso:
git log --oneline
```

---

## **📞 SOPORTE**

Si algo no funciona después de 3 intentos:

1. Documenta exactamente qué falla  
2. Toma capturas de pantalla  
3. Copia el error de la consola (F12)  
4. Pregunta con contexto completo

---

## **✅ REGISTRO DE COMPLETADO**

| Fase | Fecha Inicio | Fecha Fin | Problemas | Resuelto |
| ----- | ----- | ----- | ----- | ----- |
| 1 |  |  |  |  |
| 2 |  |  |  |  |
| 3 |  |  |  |  |
| 4 |  |  |  |  |
| 5 |  |  |  |  |

**Proyecto iniciado por**: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_  
 **Fecha**: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

