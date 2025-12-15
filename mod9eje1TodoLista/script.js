// Estado de la aplicación
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';

// Elementos del DOM
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clearCompleted');

// Funciones principales
function addTodo() {
    const text = todoInput.value.trim();
    if (text === ''){
        alert('Escribe una tarea antes de agregar');
        todoInput.focus();
        return;
    }
    // evitar duplicados (ignore case)
    if (todos.some(t => t.text.trim().toLowerCase() === text.toLowerCase())){
        alert('Esa tarea ya existe');
        todoInput.focus();
        return;
    }
    
    const todo = {
        id: Date.now(),
        text: text,
        completed: false
    };
    
    todos.push(todo);
    todoInput.value = '';
    saveTodos();
    renderTodos();
}

function deleteTodo(id) {
    if (!confirm('¿Eliminar esta tarea?')) return;
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
    }
}

function clearCompleted() {
    const completedCount = todos.filter(t => t.completed).length;
    if (completedCount === 0) {
        alert('No hay tareas completadas para limpiar');
        return;
    }
    if (!confirm(`¿Eliminar las ${completedCount} tareas completadas?`)) return;
    todos = todos.filter(todo => !todo.completed);
    saveTodos();
    renderTodos();
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function renderTodos() {
    // Filtrar todos según el filtro actual
    let filteredTodos = todos;
    if (currentFilter === 'active') {
        filteredTodos = todos.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filteredTodos = todos.filter(t => t.completed);
    }
    
    // Limpiar lista
    todoList.innerHTML = '';
    
    // Renderizar cada todo
    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        
        li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} aria-label="Marcar tarea completada">
            <span class="todo-text" tabindex="0">${todo.text}</span>
            <button class="delete-btn" aria-label="Eliminar tarea">Eliminar</button>
        `;
        
        // Event listeners
        const checkbox = li.querySelector('.todo-checkbox');
        checkbox.addEventListener('change', () => toggleTodo(todo.id));
        
        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => deleteTodo(todo.id));
        
        // doble clic o Enter para editar texto
        const textEl = li.querySelector('.todo-text');
        textEl.addEventListener('dblclick', () => enableEdit(li, todo.id));
        textEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') enableEdit(li, todo.id);
        });
        
        todoList.appendChild(li);
    });
    
    updateCounts();
}

// Habilitar edición inline
function enableEdit(li, id) {
    const span = li.querySelector('.todo-text');
    const old = span.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = old;
    input.className = 'edit-input';
    input.style.flex = '1';
    li.replaceChild(input, span);
    input.focus();
    input.select();

    function finish(save = true) {
        const val = input.value.trim();
        if (save) {
            if (val === '') { alert('El texto no puede estar vacío'); input.focus(); return; }
            // evitar duplicados
            if (todos.some(t => t.id !== id && t.text.trim().toLowerCase() === val.toLowerCase())){ alert('Otro todo ya tiene ese texto'); input.focus(); return; }
            const t = todos.find(t => t.id === id);
            if (t) { t.text = val; saveTodos(); }
        }
        const newSpan = document.createElement('span');
        newSpan.className = 'todo-text';
        newSpan.tabIndex = 0;
        newSpan.textContent = save ? val : old;
        newSpan.addEventListener('dblclick', () => enableEdit(li, id));
        newSpan.addEventListener('keydown', (e) => { if (e.key === 'Enter') enableEdit(li, id); });
        li.replaceChild(newSpan, input);
        renderTodos();
    }

    input.addEventListener('blur', () => finish(true));
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') finish(true);
        if (e.key === 'Escape') finish(false);
    });
}

function updateCounts() {
    const activeCount = todos.filter(t => !t.completed).length;
    const completedCount = todos.filter(t => t.completed).length;
    
    document.getElementById('allCount').textContent = todos.length;
    document.getElementById('activeCount').textContent = activeCount;
    document.getElementById('completedCount').textContent = completedCount;
    document.getElementById('itemsLeft').textContent = `${activeCount} tareas pendientes`;
}

// Event listeners
addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTodos();
    });
});

clearCompletedBtn.addEventListener('click', clearCompleted);

// Inicializar
renderTodos();