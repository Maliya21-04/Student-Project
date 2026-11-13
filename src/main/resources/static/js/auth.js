const TOKEN_KEY = 'jwt_token';
const ROLES_KEY = 'jwt_roles';

function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function getRoles() {
    return JSON.parse(localStorage.getItem(ROLES_KEY) || '[]');
}

function hasRole(role) {
    return getRoles().includes('ROLE_' + role);
}

function logout() {
    localStorage.clear();
    location.href = '/login.html';
}
async function api(url, options = {}) {
    const headers = options.headers || {};
    headers['Content-Type'] = 'application/json';
    const t = getToken();
    if (t) headers['Authorization'] = 'Bearer ' + t;
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
        logout();
        return null;
    }
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        return { error: err.message || 'Произошла ошибка' };
    }
    return res.status === 204 ? {} : res.json();
}

async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
        const errEl = document.getElementById('error');
        if (errEl) errEl.textContent = 'Неверный email или пароль';
        return;
    }

    const data = await res.json();
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(ROLES_KEY, JSON.stringify(data.roles));
    if (data.roles.includes('ROLE_SUPER_ADMIN')) {
        location.href = '/users.html';
    } else {
        location.href = '/students.html';
    }
}
if (!location.pathname.includes('login.html') && !getToken()) {
    location.href = '/login.html';
}
document.addEventListener('DOMContentLoaded', () => {
    const roleBadge = document.getElementById('roleBadge');

    if (roleBadge) {
        if (hasRole('SUPER_ADMIN')) {
            roleBadge.textContent = 'Супер-администратор';
        } else if (hasRole('ADMIN')) {
            roleBadge.textContent = 'Администратор';
        } else if (hasRole('TEACHER')) {
            roleBadge.textContent = 'Учитель';
        }
    }
});

function getCurrentUserEmail() {
    try {
        const payload = JSON.parse(atob(getToken().split('.')[1]));
        return payload.sub;
    } catch (e) {
        return null;
    }
}