# Plan de Mejoras y Auditoría

Este documento replantea las fases del proyecto **Sistema de Comisiones Comerciales** poniendo énfasis en la experiencia del usuario. También define tareas para solucionar problemas comunes y evitar conflictos de fusión.

## 1. Fases Replanteadas

1. **Diseño UI/UX Inicial**
   - Revisión del flujo principal (selección de perfil, ingreso de datos y resultados en tiempo real).
   - Implementar prototipos simples siguiendo la guía `UI_UX_GUIDE.md`.
   - Validar accesibilidad y feedback inmediato.

2. **Lógica de Cálculo y Pruebas**
   - Ajustar las funciones de `src/modules/calculations.js`.
   - Ejecutar `npm test` para comprobar que los cálculos básicos siguen funcionando.

3. **Sistema de Perfiles Mejorado**
   - Asegurar que el selector de perfiles responda de forma instantánea.
   - Guardar la última selección en `localStorage`.
   - Documentar el flujo de usuario para cambio de perfiles.

4. **Panel de Administración**
   - Revisar `admin.html` y `admin.js` para simplificar la edición de valores.
   - Incluir validaciones de formulario para evitar datos corruptos.
   - Sincronizar los cambios con la aplicación principal sin recargar la página.

5. **Generación de PDFs y Gráficos**
   - Verificar que `pdf-generator.js` renderice correctamente los gráficos con Chart.js.
   - Añadir controles de error si el gráfico no puede generarse.
   - Mantener la opción de PDF simple para compatibilidad.

6. **Testing y Documentación Continua**
   - Mantener actualizados los archivos de pruebas en `tests/`.
   - Registrar cualquier bug en `tests/BUG_TEMPLATE.md`.
   - Documentar pasos de auditoría para cada fase.

## 2. Tareas de Corrección

- [ ] Revisar y ajustar estilos en `admin.css` y `comisiones.css` para mejorar la legibilidad.
- [ ] Unificar la lógica de formateo de valores con las utilidades de `validators.js`.
- [ ] Confirmar que `storage.js` maneja correctamente errores de JSON.
- [ ] Actualizar el menú de descarga de PDF para evitar superposiciones y garantizar compatibilidad móvil.

## 3. Auditoría y Prevención de Conflictos

1. **Revisión Semanal de Código**
   - Ejecutar `npm test` antes de cada fusión.
   - Verificar que no existan modificaciones locales en los archivos de dependencias.

2. **Control de Cambios en Documentación**
   - Mantener este archivo actualizado con el progreso real de las fases.
   - Registrar nuevos problemas detectados en `tests/casos-de-prueba.md`.

3. **Buenas Prácticas de Merge**
   - Trabajar en ramas separadas y actualizar desde `main` antes de cada PR.
   - Evitar cambios masivos en los mismos archivos para reducir conflictos.

---
Última actualización: $(date -I)
