// dashboard.js
document.addEventListener('DOMContentLoaded', () => {
  // Capturar y guardar parámetros en localStorage
  const params = new URLSearchParams(window.location.search);
  const sede = params.get('sede');
  const roleParam = params.get('role');

  if (sede) {
    localStorage.setItem('sede', sede);
  } else {
    localStorage.removeItem('sede');
  }

  if (roleParam) {
    localStorage.setItem('role', roleParam);
  } else {
    localStorage.removeItem('role');
  }

  // Logo: al hacer clic, vuelve al dashboard manteniendo parámetros
  const logo = document.getElementById('logo');
  if (logo) {
    logo.addEventListener('click', e => {
      e.preventDefault();
      const storedSede = localStorage.getItem('sede');
      const storedRole = localStorage.getItem('role') || 'admin';
      const query = storedSede
        ? `?sede=${storedSede}&role=${storedRole}`
        : `?role=${storedRole}`;
      window.location.href = `/dashboard${query}`;
    });
  }

  const role = localStorage.getItem('role');

  if (role === 'patio') {
    // Ocultar módulos completos
    ['navProveedores', 'navInventario', 'cardProveedores', 'cardInventario']
      .forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
      });

    // Ocultar únicamente los enlaces "Crear Clientes"
    document.querySelectorAll('a[href$="crearClientes.html"]').forEach(link => {
      const li = link.closest('li');
      if (li) li.style.display = 'none';
    });
  }
});
