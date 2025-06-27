# **GUÍA VISUAL Y EXPERIENCIA DE USUARIO**

## **Sistema de Comisiones Comerciales \- SERSA SAECA**

---

## **1\. DISEÑO VISUAL GENERAL**

### **1.1 Paleta de Colores**

```css
/* Colores Principales */
--primary: #006D77;        /* Azul verdoso corporativo */
--primary-light: #83C5BE;  /* Versión clara */
--secondary: #EDF6F9;      /* Fondo suave */

/* Estados */
--success: #4CAF50;        /* Verde - Metas alcanzadas */
--warning: #FFA726;        /* Naranja - Alertas */
--danger: #F44336;         /* Rojo - Errores/No cumplido */
--info: #2196F3;           /* Azul - Información */

/* Neutros */
--dark: #212121;           /* Texto principal */
--gray: #757575;           /* Texto secundario */
--light-gray: #E0E0E0;     /* Bordes */
--background: #F5F6F8;     /* Fondo general */
```

### **1.2 Tipografía**

* **Fuente Principal**: \-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto  
* **Títulos**: Bold, 16-24px  
* **Texto Normal**: Regular, 12-14px  
* **Valores Monetarios**: Monospace o Roboto Mono para mejor legibilidad

---

## **2\. LAYOUT Y ESTRUCTURA**

### **2.1 Diseño Desktop (1200px+)**

```
┌─────────────────────────────────────────────────────────┐
│ PANEL IZQUIERDO (320px) │      PANEL DERECHO (Flex)     │
├─────────────────────────┼─────────────────────────────────┤
│ ┌─────────────────────┐ │ ┌─────────────────────────────┐ │
│ │      HEADER         │ │ │    ESTADÍSTICAS (KPIs)     │ │
│ │  Logo + Botones     │ │ │  Nivel|Subtotal|Multi|Total │ │
│ └─────────────────────┘ │ └─────────────────────────────┘ │
│                         │                                 │
│ ┌─────────────────────┐ │ ┌─────────────────────────────┐ │
│ │ SELECTOR PERFILES   │ │ │   BARRAS DE PROGRESO       │ │
│ └─────────────────────┘ │ │   (6 cards interactivas)    │ │
│                         │ └─────────────────────────────┘ │
│ ┌─────────────────────┐ │                                 │
│ │                     │ │ ┌─────────────────────────────┐ │
│ │   FORMULARIO DE     │ │ │   BARRA SUBTOTAL VISUAL    │ │
│ │     ENTRADA         │ │ └─────────────────────────────┘ │
│ │                     │ │                                 │
│ │  • Volumen          │ │ ┌─────────────────────────────┐ │
│ │  • Llaves           │ │ │   MULTIPLICADORES          │ │
│ │  • Calidad          │ │ │   (4 tablas coloreadas)    │ │
│ │  • Otros            │ │ └─────────────────────────────┘ │
│ │                     │ │                                 │
│ └─────────────────────┘ │ ┌─────────────────────────────┐ │
│                         │ │  CÁLCULO Y SUGERENCIAS     │ │
│                         │ │    (lado a lado)           │ │
│                         │ └─────────────────────────────┘ │
└─────────────────────────┴─────────────────────────────────┘
```

### **2.2 Diseño Mobile (\<768px)**

* Panel izquierdo se convierte en menú hamburguesa  
* Cards apiladas verticalmente  
* Tablas con scroll horizontal  
* Botones más grandes (min 44px altura)

---

## **3\. COMPONENTES INTERACTIVOS**

### **3.1 Barras de Progreso Segmentadas**

```
MONTO INTERNO
┌──────┬──────┬──────┬──────┬──────┬──────┐
│      │      │  ██  │  ██  │      │      │
│Capilla│Junior│Sr. A │Sr. B │Máster│Genio │
│ 600M │ 800M │ 900M │ 1000M│ 1100M│ 1200M│
└──────┴──────┴──────┴──────┴──────┴──────┘
         ↑ Click para cargar valor
```

**Estados Visuales**:

* **No alcanzado**: Gris claro (\#F5F5F5)  
* **Alcanzado**: Verde suave (\#C8E6C9)  
* **Actual**: Azul verdoso (\#006D77) \+ borde más grueso  
* **Hover**: Escala 102% \+ sombra suave  
* **Click**: Animación de ondas (ripple)

### **3.2 Campos de Entrada**

```
┌─────────────────────────┐
│ 900.000.000            │ ← Formato automático
└─────────────────────────┘
```

**Estados**:

* **Vacío requerido**: Borde rojo \+ fondo rosa claro  
* **Vacío opcional**: Borde naranja \+ fondo amarillo claro  
* **Lleno**: Borde verde \+ check icon  
* **Focus**: Borde azul \+ sombra \+ escala 101%  
* **Error**: Shake animation \+ mensaje debajo

### **3.3 Tablas de Multiplicadores**

```
┌─────────────────────┐
│   CONVERSIÓN (%)    │ ← Header con color según estado
├─────────────────────┤
│ 10%+ → 110% ✓      │ ← Fila activa resaltada
│  8%  → 100%        │
│  7%  →  80%        │
└─────────────────────┘
```

**Colores por Performance**:

* **Óptimo (≥90%)**: Verde (\#4CAF50)  
* **Regular (70-89%)**: Amarillo (\#FFA726)  
* **Crítico (\<70%)**: Rojo (\#F44336)

---

## **4\. ANIMACIONES Y TRANSICIONES**

### **4.1 Micro-interacciones**

* **Hover en botones**: Transform scale(1.05) \+ shadow  
* **Click en barras**: Ripple effect desde punto de click  
* **Cambio de valores**: Números con countUp animation  
* **Aparición de sugerencias**: Slide in from right  
* **Loading**: Spinner circular con logo

### **4.2 Tiempos**

```css
/* Estándar para todas las transiciones */
--transition-fast: 200ms ease-out;
--transition-normal: 300ms ease-in-out;
--transition-slow: 500ms cubic-bezier(0.4, 0, 0.2, 1);
```

---

## **5\. FEEDBACK VISUAL**

### **5.1 Guardado Automático**

```
┌─────────────────────────────┐
│ ⚡ Guardando...             │ ← Aparece 500ms después de cambio
└─────────────────────────────┘
    ↓ (fade out después de guardar)
```

### **5.2 Alertas y Validaciones**

```
⚠️ Recuperados superan 50% del monto interno
   ───────────────────────────────────────
   Fondo amarillo + borde naranja + icono warning
```

### **5.3 Tooltips**

```
     ┌─────────────────────┐
     │ Click para cargar   │
     │ este valor          │
     └──────────▼──────────┘
              [?]
```

---

## **6\. DISEÑO DE CARDS**

### **6.1 Card Estándar**

```
┌─────────────────────────────────┐
│ 📊 TÍTULO DE LA SECCIÓN         │ ← Icono + título bold
├─────────────────────────────────┤
│                                 │
│     [Contenido principal]       │ ← Padding interno 16px
│                                 │
├─────────────────────────────────┤
│ Info adicional | Estado: ✓     │ ← Footer opcional
└─────────────────────────────────┘
```

**Efectos**:

* Sombra: 0 2px 8px rgba(0,0,0,0.08)  
* Border-radius: 8px  
* Hover: Sombra más pronunciada

### **6.2 Card de Sugerencias**

```
┌─────────────────────────────────┐
│ 🚨 Tu Limitante Principal      │ ← Color según prioridad
├─────────────────────────────────┤
│ Tu Monto Interno limita tu     │
│ carrera. Alcanzando Senior B   │
│ sumarías +500,000 Gs           │
└─────────────────────────────────┘
```

---

## **7\. PANEL DE ADMINISTRACIÓN**

### **7.1 Pantalla de Login**

```
┌─────────────────────────────────┐
│                                 │
│        🔐 ADMINISTRACIÓN        │
│                                 │
│     ┌─────────────────────┐     │
│     │ • • • • • •         │     │ ← PIN con bullets
│     └─────────────────────┘     │
│                                 │
│     [ INGRESAR ]                │
│                                 │
└─────────────────────────────────┘
```

### **7.2 Tablas Editables**

```
┌─────────────────────────────────────┐
│ Nivel  │ Meta Internal │ Premio    │
├────────┼───────────────┼───────────┤
│ Capilla│ [600,000,000] │ [500,000] │ ← Inputs editables
│ Junior │ [800,000,000] │ [600,000] │
└────────┴───────────────┴───────────┘
```

---

## **8\. PDF PROFESIONAL \- DISEÑO**

### **8.1 Header**

```
╔═══════════════════════════════════╗
║        SERSA SAECA                ║ ← Fondo color primario
║   LIQUIDACIÓN DE COMISIONES       ║
║        MARZO 2024                 ║
╚═══════════════════════════════════╝
```

### **8.2 KPIs Visuales**

```
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│ NIVEL   │ │SUBTOTAL │ │ MULTI   │ │  TOTAL  │
│ Senior A│ │ 7.1M Gs │ │  105%   │ │ 7.5M Gs │
└─────────┘ └─────────┘ └─────────┘ └─────────┘
```

---

## **9\. RESPONSIVE BREAKPOINTS**

```css
/* Mobile First */
@media (min-width: 576px) { /* Landscape phones */ }
@media (min-width: 768px) { /* Tablets */ }
@media (min-width: 992px) { /* Desktop */ }
@media (min-width: 1200px) { /* Large desktop */ }
```

---

## **10\. ACCESIBILIDAD VISUAL**

### **10.1 Contraste**

* Texto sobre fondo claro: mínimo 4.5:1  
* Texto grande: mínimo 3:1  
* Elementos interactivos: mínimo 3:1

### **10.2 Focus States**

```css
/* Focus visible para teclado */
:focus-visible {
    outline: 3px solid #006D77;
    outline-offset: 2px;
}
```

### **10.3 Indicadores de Estado**

* ✓ Checkmark para completado  
* ⚠️ Warning para alertas  
* ❌ X para errores  
* 🔒 Lock para bloqueado

---

## **11\. MEJORES PRÁCTICAS UX**

### **11.1 Principios**

1. **Feedback inmediato**: Cada acción tiene respuesta visual  
2. **Prevención de errores**: Validación en tiempo real  
3. **Recuperación**: Siempre hay forma de deshacer/corregir  
4. **Consistencia**: Mismos patrones en toda la app

### **11.2 Flujo Ideal del Usuario**

1. Selecciona perfil → 2\. Ingresa datos → 3\. Ve resultados en tiempo real → 4\. Recibe sugerencias → 5\. Genera PDF

### **11.3 Optimizaciones**

* **Valores predeterminados** optimistas en calidad  
* **Cálculo automático** sin botón "calcular"  
* **Guardado automático** sin perder datos  
* **Atajos visuales**: Click en barras para cargar valores

---

## **12\. EJEMPLOS DE CÓDIGO CSS**

### **12.1 Card con Hover Effect**

```css
.card {
    background: white;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    transition: all 0.3s ease;
}

.card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
}
```

### **12.2 Animación de Entrada**

```css
@keyframes slideInRight {
    from {
        opacity: 0;
        transform: translateX(20px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.suggestion-item {
    animation: slideInRight 0.3s ease-out;
}
```

### **12.3 Loading Spinner**

```css
.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #006D77;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
```

---

Esta guía visual complementa las especificaciones técnicas y proporciona una dirección clara para la implementación de la interfaz de usuario.

