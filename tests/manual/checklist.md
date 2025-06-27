# CHECKLIST DE PRUEBAS MANUALES

## 🟢 PRUEBAS BÁSICAS (Hacer siempre)

### 1. Prueba de Carga Inicial
- [ ] Abrir la aplicación
- [ ] ¿Aparece el selector de perfiles?
- [ ] ¿Los campos tienen valores predeterminados?
- [ ] ¿No hay errores en la consola? (F12 → Console)

### 2. Prueba de Cálculo Básico
- [ ] Seleccionar perfil "Ágil 1"
- [ ] Ingresar estos valores exactos:
  - Monto Interno: 900,000,000
  - Monto Externo: 150,000,000
  - Cantidad: 9
  - Menor semana: 2
- [ ] ¿El nivel muestra "Senior A"?
- [ ] ¿La comisión total es mayor a 0?

### 3. Prueba de Llaves
- [ ] Poner Cantidad en 5 (menos de 6)
- [ ] ¿Los premios de montos muestran 0?
- [ ] Poner Cantidad en 6
- [ ] ¿Los premios de montos ahora muestran valores?

### 4. Prueba de Llave Semanal
- [ ] Poner Menor Semana en 1
- [ ] ¿El premio de cantidad muestra 0?
- [ ] Poner Menor Semana en 2
- [ ] ¿El premio de cantidad muestra valor?

## 🟡 PRUEBAS DE PERFILES

### 5. Cambio de Perfiles
- [ ] Cambiar a perfil "Empresarial 1"
- [ ] ¿Los cálculos se actualizan?
- [ ] Cambiar a perfil "Ágil 2"
- [ ] ¿Se mantienen los valores ingresados?

## 🔴 PRUEBAS DE ADMIN

### 6. Acceso a Admin
- [ ] Ir a /admin.html
- [ ] Ingresar PIN incorrecto (111111)
- [ ] ¿Muestra error?
- [ ] Ingresar PIN correcto (GT2520)
- [ ] ¿Entra al panel?

### 7. Modificar Valores
- [ ] Cambiar Base Fija de Ágil 1 a 3,500,000
- [ ] Guardar cambios
- [ ] Volver a la aplicación principal
- [ ] Seleccionar Ágil 1
- [ ] ¿La base muestra 3,500,000?

## 📄 PRUEBAS DE PDF

### 8. PDF Simple
- [ ] Click en PDF → PDF Simple
- [ ] ¿Se descarga un PDF?
- [ ] ¿Tiene todos los datos?

### 9. PDF Profesional
- [ ] Click en PDF → PDF Profesional
- [ ] Ingresar nombre "Juan Pérez"
- [ ] ¿Se descarga PDF con gráficos?
- [ ] ¿Aparece el nombre en el PDF?
