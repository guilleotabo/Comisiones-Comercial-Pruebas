# Casos de Prueba

## Hoja 1: Casos de Cálculo

| ID  | Descripción         | Entrada                              | Salida Esperada                      | ¿Pasó? |
| --- | ------------------- | ------------------------------------ | ------------------------------------ | ------ |
| C01 | Senior A completo   | Interno: 900M, Externo: 150M         | Nivel: Senior A, Total: ~7.3M        | ☐      |
| C02 | Sin llave montos    | Cantidad: 5                          | Premios montos: 0                    | ☐      |
| C03 | Sin llave semanal   | Menor sem: 1                         | Premio cantidad: 0                   | ☐      |

## Hoja 2: Casos de Perfiles

| ID  | Descripción       | Pasos                                  | Resultado Esperado | ¿Pasó? |
| --- | ----------------- | -------------------------------------- | ------------------ | ------ |
| P01 | Cambiar perfil    | 1. Seleccionar Empresarial 1           | Recalcula todo     | ☐      |
| P02 | Guardar perfil    | 1. Cambiar valores 2. Recargar         | Mantiene cambios   | ☐      |

## Hoja 3: Casos de Admin

| ID  | Descripción     | Pasos                         | Resultado Esperado  | ¿Pasó? |
| --- | --------------- | ----------------------------- | ------------------- | ------ |
| A01 | Login correcto  | PIN: GT2520                   | Entra al panel      | ☐      |
| A02 | Cambiar base    | 1. Cambiar a 4M 2. Guardar    | Se refleja en app   | ☐      |
