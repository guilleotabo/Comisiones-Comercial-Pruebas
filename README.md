# Proyecto Limpio

Este proyecto ha sido limpiado y está listo para comenzar desde cero.

## 🐍 Configuración de Python

### Entorno Virtual
Este proyecto utiliza un entorno virtual para gestionar las dependencias de Python.

#### Crear y activar el entorno virtual:
```bash
# Crear entorno virtual (ya está creado)
py -m venv venv

# Activar entorno (Windows PowerShell)
cmd /c "venv\Scripts\activate.bat"
# O si tienes permisos:
# .\venv\Scripts\Activate.ps1
```

#### Instalar dependencias:
```bash
# Con el entorno activado
pip install -r requirements.txt
```

#### Desactivar entorno:
```bash
deactivate
```

## 📦 Gestión de dependencias

- **requirements.txt**: Lista de todas las dependencias del proyecto
- Para agregar una nueva librería:
  1. Instalar: `pip install nombre_libreria`
  2. Actualizar requirements: `pip freeze > requirements.txt`

## Cómo usar
1. Activa el entorno virtual de Python
2. Agrega tus archivos Python
3. Instala las librerías necesarias
4. Realiza commits para guardar tus cambios
5. Usa Git para colaborar y mantener tu proyecto organizado

## 📁 Estructura del proyecto

```
├── venv/                 # Entorno virtual (ignorado por git)
├── requirements.txt      # Dependencias de Python
├── .gitignore           # Archivos ignorados por git
├── Proyecto_prueba_viejo/ # Proyecto anterior
└── README.md           # Este archivo
```

## Información
Este README fue creado como parte de un curso rápido para aprender a usar Git y Python.
