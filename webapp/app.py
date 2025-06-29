"""
📋 To-Do List Web Application
Una aplicación web completa usando Flask + HTML + CSS + JavaScript

Este archivo es el SERVIDOR (backend) - maneja la lógica de negocio
"""

from flask import Flask, render_template, request, jsonify, redirect, url_for
import json
import os
from datetime import datetime

# Crear la aplicación Flask
app = Flask(__name__)

# Archivo donde guardaremos las tareas
TASKS_FILE = 'tasks.json'

def load_tasks():
    """Carga las tareas desde el archivo JSON"""
    if os.path.exists(TASKS_FILE):
        try:
            with open(TASKS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            return []
    return []

def save_tasks(tasks):
    """Guarda las tareas en el archivo JSON"""
    with open(TASKS_FILE, 'w', encoding='utf-8') as f:
        json.dump(tasks, f, ensure_ascii=False, indent=2)

# 🏠 RUTA PRINCIPAL - Muestra la página web
@app.route('/')
def home():
    """
    Esta función se ejecuta cuando alguien visita http://localhost:5000/
    Retorna la página HTML principal
    """
    tasks = load_tasks()
    return render_template('index.html', tasks=tasks)

# ➕ RUTA PARA AGREGAR TAREAS - Recibe datos del formulario
@app.route('/add_task', methods=['POST'])
def add_task():
    """
    Esta función se ejecuta cuando el usuario envía el formulario
    Agrega una nueva tarea a la lista
    """
    task_text = request.form.get('task')
    if task_text:
        tasks = load_tasks()
        new_task = {
            'id': len(tasks) + 1,
            'text': task_text,
            'completed': False,
            'created_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        tasks.append(new_task)
        save_tasks(tasks)
    
    return redirect(url_for('home'))

# ✅ RUTA PARA MARCAR COMO COMPLETADA - API REST
@app.route('/toggle_task/<int:task_id>', methods=['POST'])
def toggle_task(task_id):
    """
    Esta función se ejecuta cuando el usuario hace clic en completar
    Cambia el estado de completado de una tarea
    """
    tasks = load_tasks()
    for task in tasks:
        if task['id'] == task_id:
            task['completed'] = not task['completed']
            break
    
    save_tasks(tasks)
    return jsonify({'success': True})

# 🗑️ RUTA PARA ELIMINAR TAREAS - API REST
@app.route('/delete_task/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """
    Esta función elimina una tarea de la lista
    """
    tasks = load_tasks()
    tasks = [task for task in tasks if task['id'] != task_id]
    save_tasks(tasks)
    return jsonify({'success': True})

# 📊 RUTA PARA OBTENER ESTADÍSTICAS - API REST
@app.route('/api/stats')
def get_stats():
    """
    API que retorna estadísticas de las tareas en formato JSON
    """
    tasks = load_tasks()
    total = len(tasks)
    completed = sum(1 for task in tasks if task['completed'])
    pending = total - completed
    
    return jsonify({
        'total': total,
        'completed': completed,
        'pending': pending
    })

if __name__ == '__main__':
    print("🚀 Iniciando servidor web...")
    print("📱 Abre tu navegador en: http://localhost:5000")
    print("⏹️  Para detener: Ctrl+C")
    
    # Ejecutar el servidor en modo desarrollo
    app.run(debug=True, host='localhost', port=5000)
