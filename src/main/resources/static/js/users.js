async function loadUsers() {
    const data = await api('/api/v1/users');
    if (!data) return;

    const currentEmail = getCurrentUserEmail();
    let html = '';

    data.responses.forEach(u => {
        const roleName = u.roles[0] === 'SUPER_ADMIN' ? 'Супер-админ' :
                         u.roles[0] === 'ADMIN' ? 'Администратор' : 'Учитель';
        const roleClass = u.roles[0].toLowerCase();

        // Проверяем, является ли этот пользователь текущим залогиненным
        const isSelf = u.email === currentEmail;

        html += `<tr>
            <td>${String(u.id).padStart(2, '0')}</td>
            <td>${u.email}</td>
            <td><span class="badge ${roleClass}">${roleName}</span></td>
            <td>
                ${isSelf ? '<div style="color:#94a3b8; font-size:13px; padding: 6px 16px; text-align: center;">Это вы</div>'
                         : `<button class="btn-delete" onclick="del(${u.id})">Удалить</button>`}
            </td>
        </tr>`;
    });
    document.getElementById('tableBody').innerHTML = html;
}

async function createUser() {
    const errorEl = document.getElementById('formError');
    errorEl.textContent = '';

    const body = {
        email: document.getElementById('uEmail').value,
        password: document.getElementById('uPassword').value,
        roles: [document.getElementById('uRole').value]
    };

    const res = await api('/api/v1/users/save', { method: 'POST', body: JSON.stringify(body) });
    if (res && res.error) {
        errorEl.textContent = 'Ошибка: ' + res.error;
        return;
    }
    document.getElementById('uEmail').value = '';
    document.getElementById('uPassword').value = '';
    loadUsers();
}

async function del(id) {
    if (!confirm('Удалить?')) return;
    await api('/api/v1/users/' + id, { method: 'DELETE' });
    loadUsers();
}
loadUsers();