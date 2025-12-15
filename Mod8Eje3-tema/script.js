// Seleccionar elementos
const themeToggle = document.getElementById('themeToggle');
const body = document.body;
const icon = themeToggle.querySelector('.icon');

/**
 * Cambiar el tema entre claro y oscuro
 */
function toggleTheme() {
    // Cycle: light -> dark -> gamer -> light
    const current = localStorage.getItem('theme') || (body.classList.contains('dark-mode') ? 'dark' : (body.classList.contains('gamer-mode') ? 'gamer' : 'light'));
    let next;
    if (current === 'light') next = 'dark';
    else if (current === 'dark') next = 'gamer';
    else next = 'light';

    // Remove all theme classes first
    body.classList.remove('dark-mode', 'gamer-mode');
    if (next === 'dark') body.classList.add('dark-mode');
    if (next === 'gamer') body.classList.add('gamer-mode');

    // Update icon and aria-label
    icon.textContent = next === 'light' ? '🌞' : next === 'dark' ? '🌙' : '🎮';
    themeToggle.setAttribute('aria-label', `Tema: ${next}`);

    // Save
    localStorage.setItem('theme', next);
    console.log(`Tema cambiado a: ${next}`);
}

/**
 * Cargar tema guardado al inicio
 */
function loadTheme() {
    // Obtener tema guardado de localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        icon.textContent = '🌙';
    } else if (savedTheme === 'gamer') {
        body.classList.add('gamer-mode');
        icon.textContent = '🎮';
    } else {
        // Tema claro por defecto
        body.classList.remove('dark-mode', 'gamer-mode');
        icon.textContent = '🌞';
    }
    themeToggle.setAttribute('aria-label', `Tema: ${savedTheme || 'light'}`);
    console.log(`Tema cargado: ${savedTheme || 'light (por defecto)'}`);
}

/**
 * BONUS: Detectar preferencia del sistema
 */
function detectSystemTheme() {
    // Solo si no hay preferencia guardada
    if (!localStorage.getItem('theme')) {
        // Verificar si el sistema prefiere modo oscuro
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            body.classList.add('dark-mode');
            icon.textContent = '🌙';
            console.log('Tema del sistema detectado: Oscuro');
        }
    }
}

// Event listener para el botón
themeToggle.addEventListener('click', toggleTheme);

// Atajos de teclado (opcional)
document.addEventListener('keydown', (e) => {
    // Ctrl + D para cambiar tema
    if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        toggleTheme();
    }
});

// Cargar tema al iniciar
loadTheme();

// (Opcional) Detectar preferencia del sistema
detectSystemTheme();

// Agregar animación al cambiar tema
themeToggle.addEventListener('click', () => {
    // Efecto de rotación al hacer clic
    themeToggle.style.transform = 'rotate(360deg)';
    setTimeout(() => {
        themeToggle.style.transform = '';
    }, 300);
});
