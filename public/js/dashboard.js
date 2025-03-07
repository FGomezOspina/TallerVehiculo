// dashboardLogic.js
document.addEventListener('DOMContentLoaded', () => {
    // Capturamos los parámetros de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const sedeParam = urlParams.get('sede');
    const roleParam = urlParams.get('role');
  
    // Guardamos los parámetros en localStorage
    if (sedeParam) {
      localStorage.setItem('sede', sedeParam);
    } else {
      localStorage.removeItem('sede');
    }
  
    if (roleParam) {
      localStorage.setItem('role', roleParam);
    } else {
      localStorage.removeItem('role');
    }
  
    // Configuración del logo: al hacer clic redirige manteniendo los parámetros
    const logo = document.getElementById('logo');
    if (logo) {
      logo.addEventListener('click', (e) => {
        e.preventDefault();
        const storedSede = localStorage.getItem('sede');
        const storedRole = localStorage.getItem('role') || 'admin';
        if (storedSede) {
          window.location.href = `/dashboard?sede=${storedSede}&role=${storedRole}`;
        } else {
          window.location.href = `/dashboard?role=${storedRole}`;
        }
      });
    }
  
    // Lista de elementos que solo deben verse para admin (vista completa)
    // Los usuarios con role "patio" verán una vista restringida (solo se mostrará la opción de Ingreso de Vehículo)
    const elementosARestrigir = [
      'navProveedores',
      'navInventario',
      'navClientes',
      'cardProveedores',
      'cardInventario',
      'cardClientes'
    ];
  
    const role = localStorage.getItem('role');
    if (role === 'patio') {
      // Usuario de tipo patio: ocultar elementos adicionales
      elementosARestrigir.forEach(id => {
        const elem = document.getElementById(id);
        if (elem) {
          elem.style.display = 'none';
        }
      });
    } else if (role === 'admin') {
      // Usuario admin: asegurarse que se muestren todos los elementos
      elementosARestrigir.forEach(id => {
        const elem = document.getElementById(id);
        if (elem) {
          elem.style.display = '';
        }
      });
    }
  });
  