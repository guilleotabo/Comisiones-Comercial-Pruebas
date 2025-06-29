# 📋 Aplicación Web To-Do List

Una aplicación web completa desarrollada con **Flask + HTML + CSS + JavaScript** que demuestra cómo interactúan todas las tecnologías web.

## 🏗️ **Arquitectura del Proyecto**

```
webapp/
├── app.py                 # 🐍 SERVIDOR (Backend - Python/Flask)
├── templates/
│   └── index.html        # 🌐 INTERFAZ (Frontend - HTML)
├── static/
│   ├── css/
│   │   └── style.css     # 🎨 ESTILOS (CSS)
│   └── js/
│       └── app.js        # ⚡ INTERACTIVIDAD (JavaScript)
└── tasks.json            # 💾 BASE DE DATOS (se crea automáticamente)
```

## 🔄 **Cómo Funciona la Comunicación**

### **1. Frontend → Backend (Usuario → Servidor)**
```
Usuario completa formulario → HTML → JavaScript → Petición HTTP → Flask
```

### **2. Backend → Frontend (Servidor → Usuario)**
```
Flask procesa datos → Retorna JSON/HTML → JavaScript actualiza → Usuario ve cambios
```

### **3. Flujo Completo de Agregar Tarea**
```
1. Usuario escribe en input (HTML)
2. Hace clic en "Agregar" (JavaScript captura evento)
3. Formulario se envía a /add_task (Flask recibe datos)
4. Flask guarda en tasks.json (Python maneja archivos)
5. Flask retorna nueva página (HTML actualizado)
6. Navegador muestra la nueva tarea (CSS la estiliza)
```

## 🚀 **Cómo Ejecutar la Aplicación**

### **Paso 1: Navegar al directorio**
```bash
cd webapp
```

### **Paso 2: Ejecutar el servidor**
```bash
# Con el entorno virtual configurado
python app.py
```

### **Paso 3: Abrir en navegador**
```
http://localhost:5000
```

## 🧩 **Explicación de Cada Archivo**

### **🐍 `app.py` (Backend - Servidor)**
- **Función**: Maneja la lógica de negocio
- **Tecnología**: Python + Flask
- **Responsabilidades**:
  - Servir páginas HTML
  - Procesar formularios
  - Guardar/cargar datos
  - Crear APIs REST

### **🌐 `templates/index.html` (Frontend - Interfaz)**
- **Función**: Define la estructura visual
- **Tecnología**: HTML + Jinja2 (templating)
- **Responsabilidades**:
  - Mostrar datos dinámicos
  - Crear formularios
  - Estructura de la página
  - Conectar CSS y JavaScript

### **🎨 `static/css/style.css` (Presentación)**
- **Función**: Define cómo se ve todo
- **Tecnología**: CSS3 + Flexbox + Grid
- **Responsabilidades**:
  - Colores y tipografías
  - Layouts y espaciado
  - Animaciones y transiciones
  - Responsive design

### **⚡ `static/js/app.js` (Interactividad)**
- **Función**: Maneja eventos y dinamismos
- **Tecnología**: JavaScript ES6+ + Fetch API
- **Responsabilidades**:
  - Capturar clics y eventos
  - Hacer peticiones AJAX
  - Actualizar interfaz
  - Atajos de teclado

## 🎯 **Funcionalidades Implementadas**

### **✅ Funcionalidades Básicas**
- ➕ Agregar nuevas tareas
- ✅ Marcar tareas como completadas
- 🗑️ Eliminar tareas
- 📊 Ver estadísticas en tiempo real

### **🌟 Funcionalidades Avanzadas**
- 🎨 Interfaz moderna y responsive
- ⚡ Interacciones sin recargar página (AJAX)
- ⌨️ Atajos de teclado (Ctrl+Enter, Escape)
- 💾 Persistencia de datos en JSON
- 🎉 Animaciones y transiciones
- 📱 Diseño adaptativo para móviles

## 🔧 **APIs Disponibles**

La aplicación expone varias APIs REST:

```http
GET  /                     # Página principal
POST /add_task            # Agregar nueva tarea
POST /toggle_task/<id>    # Marcar como completada
DELETE /delete_task/<id>  # Eliminar tarea
GET  /api/stats          # Obtener estadísticas JSON
```

## 🎓 **Conceptos de Programación Demostrados**

### **Backend (Python/Flask)**
- Routing y decoradores
- Manejo de formularios
- APIs REST
- Persistencia de datos (JSON)
- Templating con Jinja2

### **Frontend (HTML/CSS/JS)**
- Estructura semántica HTML
- CSS Grid y Flexbox
- JavaScript asíncrono (async/await)
- Fetch API para AJAX
- Event handling
- DOM manipulation

### **Arquitectura Web**
- Separación frontend/backend
- Protocolo HTTP (GET, POST, DELETE)
- JSON como formato de intercambio
- Arquitectura MVC
- APIs RESTful

## 🏃‍♂️ **Para Probar la Aplicación**

1. **Agrega algunas tareas**
2. **Márcalas como completadas**
3. **Observa cómo cambian las estadísticas**
4. **Prueba los atajos de teclado**
5. **Elimina tareas**
6. **Revisa el archivo `tasks.json` que se crea**

## 🔍 **Para Entender Mejor**

- Abre las **Developer Tools** del navegador (F12)
- Ve la pestaña **Network** para ver las peticiones HTTP
- Ve la pestaña **Console** para ver los logs de JavaScript
- Inspecciona el código fuente de cada archivo
- Modifica los estilos en tiempo real
