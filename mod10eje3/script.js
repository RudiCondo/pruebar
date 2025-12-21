/**
 * 1. BASE DE DATOS FICTICIA
 */
const products = [
    { id: 1, name: "MacBook Air M2", category: "electronics", price: 999, rating: 5, icon: "fa-laptop" },
    { id: 2, name: "Sudadera Oversize", category: "clothing", price: 45, rating: 4, icon: "fa-shirt" },
    { id: 3, name: "Cafetera Espresso", category: "home", price: 120, rating: 4, icon: "fa-mug-hot" },
    { id: 4, name: "Teclado Mecánico", category: "electronics", price: 85, rating: 5, icon: "fa-keyboard" },
    { id: 5, name: "Pantalón Denim", category: "clothing", price: 60, rating: 3, icon: "fa-socks" }, // approximated icon
    { id: 6, name: "Lámpara de Pie", category: "home", price: 35, rating: 2, icon: "fa-lightbulb" },
    { id: 7, name: "iPhone 15", category: "electronics", price: 800, rating: 5, icon: "fa-mobile-screen" },
    { id: 8, name: "Zapatillas Running", category: "clothing", price: 110, rating: 4, icon: "fa-shoe-prints" },
    { id: 9, name: "Set de Cuchillos", category: "home", price: 75, rating: 3, icon: "fa-utensils" },
    { id: 10, name: "Monitor 4K", category: "electronics", price: 400, rating: 4, icon: "fa-desktop" }
];

// Configuración de visualización
const ITEMS_PER_PAGE = 3;

// Referencias al DOM
const form = document.getElementById('filterForm');
const resultsGrid = document.getElementById('resultsGrid');
const resultsCount = document.getElementById('resultsCount');
const pageInfo = document.getElementById('pageInfo');
const priceLabel = document.getElementById('priceLabel');
const activeFiltersContainer = document.getElementById('activeFilters');

/**
 * 2. FUNCIÓN DEBOUNCE
 */
function debounce(func, delay = 400) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * 3. ACTUALIZAR URL Y ESTADO
 */
function syncFiltersToURL() {
    const formData = new FormData(form);
    const params = new URLSearchParams();

    formData.forEach((value, key) => {
        if (value && value !== "0") {
            params.set(key, value);
        }
    });

    params.set('page', '1');
    const newRelativePathQuery = window.location.pathname + '?' + params.toString();
    window.history.pushState(null, '', newRelativePathQuery);

    render();
}

/**
 * Renderiza los Chips de filtros activos
 */
function renderActiveFilters(params) {
    const q = params.get('q');
    const category = params.get('category');
    const maxPrice = params.get('maxPrice');
    const rating = params.get('rating');

    let html = '';

    if (q) html += `<div class="filter-chip" onclick="clearFilter('q')"><i class="fa-solid fa-magnifying-glass"></i> "${q}" <i class="fa-solid fa-xmark"></i></div>`;
    if (category) {
        const catName = document.querySelector(`option[value="${category}"]`)?.text || category;
        html += `<div class="filter-chip" onclick="clearFilter('category')"><i class="fa-solid fa-layer-group"></i> ${catName} <i class="fa-solid fa-xmark"></i></div>`;
    }
    // Solo mostramos precio si es menor al maximo (significa que filtraron)
    if (maxPrice && maxPrice != "1000") {
        html += `<div class="filter-chip" onclick="clearFilter('maxPrice')"><i class="fa-solid fa-tag"></i> < $${maxPrice} <i class="fa-solid fa-xmark"></i></div>`;
    }
    if (rating && rating != "0") {
        html += `<div class="filter-chip" onclick="clearFilter('rating')"><i class="fa-solid fa-star"></i> ${rating}+ Stars <i class="fa-solid fa-xmark"></i></div>`;
    }

    activeFiltersContainer.innerHTML = html;
}

// Función global para limpiar un filtro específico desde el chip
window.clearFilter = (key) => {
    const params = new URLSearchParams(window.location.search);

    if (key === 'maxPrice') {
        params.set(key, '1000'); // Valor por defecto
        document.getElementById('maxPrice').value = 1000;
    } else if (key === 'rating') {
        params.delete(key);
        // Reset radio manually
        const radios = document.querySelectorAll('input[name="rating"]');
        radios.forEach(r => r.checked = (r.value === '0'));
    } else {
        params.delete(key);
        const input = form.elements[key];
        if (input) input.value = '';
    }

    window.history.pushState(null, '', '?' + params.toString());
    render();
    // Sincronizar inputs visuales
    const input = form.elements[key];
    if (input && key !== 'maxPrice' && key !== 'rating') input.value = '';
};

/**
 * 4. FUNCIÓN PRINCIPAL DE RENDERIZADO
 */
function render() {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q')?.toLowerCase() || "";
    const category = params.get('category') || "";
    const maxPrice = parseInt(params.get('maxPrice')) || 1000;
    const rating = parseInt(params.get('rating')) || 0;
    let page = parseInt(params.get('page')) || 1;

    // Renderizar Chips
    renderActiveFilters(params);

    // Filtrar
    const filtered = products.filter(item => {
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesCategory = category === "" || item.category === category;
        const matchesPrice = item.price <= maxPrice;
        const matchesRating = item.rating >= rating;
        return matchesName && matchesCategory && matchesPrice && matchesRating;
    });

    // Paginación
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
    if (page > totalPages) page = totalPages;

    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const itemsToShow = filtered.slice(start, end);

    // Inyectar HTML
    resultsGrid.innerHTML = itemsToShow.length > 0
        ? itemsToShow.map(p => `
            <article class="card">
                <div class="card-image">
                    <i class="fa-solid ${p.icon || 'fa-box-open'}"></i>
                </div>
                <h4>${p.name}</h4>
                <div class="card-meta">
                    <span>${p.category}</span>
                    <span><i class="fa-solid fa-star text-gold"></i> ${p.rating}</span>
                </div>
                <div class="card-price">$${p.price}</div>
            </article>
        `).join('')
        : `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
                <i class="fa-solid fa-ghost" style="font-size: 3rem; margin-bottom: 20px;"></i>
                <p>No se encontraron productos con esos filtros.</p>
           </div>`;

    // Textos y botones
    resultsCount.innerText = `${filtered.length} Resultados`;
    pageInfo.innerText = `${page} / ${totalPages}`;

    document.getElementById('prevBtn').disabled = (page <= 1);
    document.getElementById('nextBtn').disabled = (page >= totalPages);

    priceLabel.innerText = `$${maxPrice}`;
    document.getElementById('maxPrice').value = maxPrice; // Asegurar sync visual
}

/**
 * 5. GESTIÓN DE EVENTOS
 */

// Debounce para buscador
const handleSearchInput = debounce(() => syncFiltersToURL());
document.getElementById('search').addEventListener('input', handleSearchInput);

// Cambios inmediatos
form.addEventListener('change', (e) => {
    if (e.target.id !== 'search') {
        syncFiltersToURL();
    }
});

// Paginación
function changePage(offset) {
    const params = new URLSearchParams(window.location.search);
    let currentPage = parseInt(params.get('page')) || 1;
    params.set('page', currentPage + offset);

    window.history.pushState(null, '', `?${params.toString()}`);
    render();
}

document.getElementById('prevBtn').addEventListener('click', () => changePage(-1));
document.getElementById('nextBtn').addEventListener('click', () => changePage(1));

// Limpiar todo
document.getElementById('clearBtn').addEventListener('click', () => {
    form.reset();
    window.history.pushState(null, '', window.location.pathname);
    render();
});

/**
 * 6. INICIALIZACIÓN
 */
window.addEventListener('popstate', render);

window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    params.forEach((value, key) => {
        const input = form.elements[key];
        if (input) {
            if (input.type === 'radio') {
                if (input.value === value) input.checked = true;
            } else {
                input.value = value;
            }
        }
    });
    render();
});