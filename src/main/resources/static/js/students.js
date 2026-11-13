async function loadStudents() {
    const data = await api('/api/v1/student');
    if (!data) return;

    const tbody = document.getElementById('tableBody');
    let html = '';

    data.response.forEach(s => {
        html += `<tr>
            <td>${String(s.id).padStart(2, '0')}</td>
            <td>${s.name}</td>
            <td>${s.surname}</td>
            <td id="phone-${s.id}">...</td>
            <td id="email-${s.id}">...</td>
            <td>${hasRole('ADMIN') ? `<button class="btn-delete" onclick="del(${s.id})">Удалить</button>` : ''}</td>
        </tr>`;
    });
    tbody.innerHTML = html;

    data.response.forEach(async s => {
        const full = await api('/api/v1/student/' + s.id);
        if (full) {
            document.getElementById(`phone-${s.id}`).textContent = full.phoneNumber || '-';
            document.getElementById(`email-${s.id}`).textContent = full.email || '-';
        }
    });
    if (hasRole('ADMIN')) {
        document.getElementById('adminPanel').style.display = 'block';
        document.getElementById('pageIllustration').src = '/img/admin-guy.png';
        document.getElementById('pageSubtitle').textContent = 'Управление списком студентов';
    } else {
        document.getElementById('adminPanel').style.display = 'none';
        document.getElementById('pageIllustration').src = '/img/teacher-girl.png';
        document.getElementById('pageSubtitle').textContent = 'Все студенты и их контактные данные';
    }
}

async function del(id) {
    if (!confirm('Удалить?')) return;
    await api('/api/v1/student/' + id, { method: 'DELETE' });
    loadStudents();
}

async function createStudent() {
    const errorEl = document.getElementById('formError');
    errorEl.textContent = '';

    const name = document.getElementById('sName').value.trim();
    const surname = document.getElementById('sSurname').value.trim();
    const email = document.getElementById('sEmail').value.trim();
    const phone = document.getElementById('sPhone').value.trim();

    if (!name || !surname) {
        errorEl.textContent = 'Ошибка: Имя и фамилия обязательны';
        return;
    }
    const data = await api('/api/v1/student');
    if (data && data.response) {
        const isDuplicate = data.response.some(s =>
            s.name.toLowerCase() === name.toLowerCase() &&
            s.surname.toLowerCase() === surname.toLowerCase()
        );
        if (isDuplicate) {
            errorEl.textContent = 'Ошибка: Студент с таким именем и фамилией уже существует';
            return;
        }
    }
    const body = { name, surname, phone_number: phone, email: email };
    const res = await api('/api/v1/student/save', { method: 'POST', body: JSON.stringify(body) });

    if (res && res.error) {
        errorEl.textContent = 'Ошибка: ' + res.error;
        return;
    }

    // Очистка полей и обновление таблицы
    document.getElementById('sName').value = '';
    document.getElementById('sSurname').value = '';
    document.getElementById('sPhone').value = '';
    document.getElementById('sEmail').value = '';
    loadStudents();
}

loadStudents();