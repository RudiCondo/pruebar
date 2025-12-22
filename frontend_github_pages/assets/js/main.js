// Main Logic
document.addEventListener('DOMContentLoaded', () => {
    setupMobileMenu();
    checkAuthState();
});

function setupMobileMenu() {
    const toggle = document.getElementById('mobile-toggle');
    const navLinks = document.getElementById('nav-links');

    if (toggle && navLinks) {
        toggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            // Change icon
            const icon = toggle.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
}

function checkAuthState() {
    const token = localStorage.getItem('token');
    const loginLink = document.getElementById('auth-link-login');
    const registerLink = document.getElementById('auth-link-register');

    // Create User Menu element if logged in
    if (token) {
        if (loginLink) loginLink.style.display = 'none';
        if (registerLink) registerLink.style.display = 'none';

        const navLinks = document.getElementById('nav-links');
        if (navLinks) {
            // Get user role
            let user = {};
            try {
                user = JSON.parse(localStorage.getItem('user')) || {};
            } catch (e) {
                console.error('Error parsing user data', e);
            }
            const role = user.rol || 'cliente'; // Default to cliente

            // Role based links
            if (role === 'cliente') {
                const cartLi = document.createElement('li');
                cartLi.innerHTML = '<a href="cart.html" class="nav-link">Carrito</a>';
                navLinks.appendChild(cartLi);

                const ordersLi = document.createElement('li');
                ordersLi.innerHTML = '<a href="orders.html" class="nav-link">Mis Pedidos</a>';
                navLinks.appendChild(ordersLi);
            } else if (role === 'emprendedor') {
                const myShopLi = document.createElement('li');
                myShopLi.innerHTML = '<a href="entrepreneur.html" class="nav-link">Mi Tienda</a>';
                navLinks.appendChild(myShopLi);

                const shopOrdersLi = document.createElement('li');
                shopOrdersLi.innerHTML = '<a href="entrepreneur-orders.html" class="nav-link">Gestionar Pedidos</a>';
                navLinks.appendChild(shopOrdersLi);
            } else if (role === 'admin') {
                const adminLi = document.createElement('li');
                adminLi.innerHTML = '<a href="admin.html" class="nav-link" style="color: var(--accent);">Panel Admin</a>';
                navLinks.appendChild(adminLi);
            }

            // Common authenticated links
            const profileLi = document.createElement('li');
            profileLi.innerHTML = '<a href="profile.html" class="nav-link">Perfil</a>';
            navLinks.appendChild(profileLi);

            const logoutLi = document.createElement('li');
            logoutLi.innerHTML = '<a href="#" class="btn btn-outline" onclick="logout()" style="padding: 8px 20px; font-size: 0.9rem;">Salir</a>';
            navLinks.appendChild(logoutLi);
        }
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}
