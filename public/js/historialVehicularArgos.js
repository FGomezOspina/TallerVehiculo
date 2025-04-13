document.addEventListener('DOMContentLoaded', async function() {
  // ---------------------------------------------------------
  // OBTENCIÓN DE SEDE Y ROL
  // ---------------------------------------------------------
  const sede = localStorage.getItem('sede') || 'pereira';
  const role = localStorage.getItem('role') || 'admin';

  // ---------------------------------------------------------
  // AJUSTE DE VISIBILIDAD DEL NAV (SIDEBAR) Y LOGO SEGÚN EL ROL
  // ---------------------------------------------------------
  const elementosARestrigir = [
    'navProveedores',
    'navInventario',
    'navClientes',
    'cardProveedores',
    'cardInventario',
    'cardClientes'
  ];

  if (role === 'patio') {
    // Ocultar los elementos que solo deben verse para administradores.
    elementosARestrigir.forEach(id => {
      const elem = document.getElementById(id);
      if (elem) {
        elem.style.display = 'none';
      }
    });
  } else {
    // Asegurarse de mostrar todos los elementos para admin.
    elementosARestrigir.forEach(id => {
      const elem = document.getElementById(id);
      if (elem) {
        elem.style.display = '';
      }
    });
  }

  // Configuración del logo según el rol
  const logo = document.getElementById('logo');
  if (logo) {
    logo.addEventListener('click', (e) => {
      e.preventDefault();
      if (role === 'patio') {
        window.location.href = `/dashboard?sede=${sede}&role=patio`;
      } else {
        window.location.href = '/dashboard?role=admin';
      }
    });
  }
  
  // ---------------------------------------------------------
  // OBTENCIÓN Y PINTADO DE LOS REGISTROS EN EL HISTORIAL
  // ---------------------------------------------------------
  const tablaBody = document.querySelector('#tablaHistorialArgos tbody');
  
  try {
    // Se asume que el endpoint GET /detallesVehiculoArgos devuelve:
    // { success: true, detalles: [ { id, ejecutor, equipo, fechaProgramada, horaProgramada, sede, ... }, ... ] }
    const response = await fetch('/detallesVehiculoArgos');
    if (!response.ok) {
      throw new Error('Error al obtener los datos.');
    }
    const data = await response.json();
    if (data.success) {
      let detalles = data.detalles;
      
      // Filtrar registros por sede: mostrar solo los documentos cuya sede
      // coincida (ignorando mayúsculas/minúsculas) con la sede actual del usuario.
      detalles = detalles.filter(detalle => detalle.sede && detalle.sede.toLowerCase() === sede.toLowerCase());
      
      if (detalles.length === 0) {
        tablaBody.innerHTML = '<tr><td colspan="7" class="text-center">No se encontraron registros.</td></tr>';
      } else {
        detalles.forEach((detalle, index) => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${detalle.ejecutor || ''}</td>
            <td>${detalle.equipo || ''}</td>
            <td>${detalle.fechaProgramada || ''}</td>
            <td>${detalle.horaProgramada || ''}</td>
            <td>${detalle.sede || ''}</td>
            <td>
              <a href="actualizarVehiculoArgos.html?id=${detalle.id}&sede=${sede}&role=${role}" class="btn btn-primary btn-sm">Editar</a>
            </td>
          `;
          tablaBody.appendChild(tr);
        });
      }
    } else {
      tablaBody.innerHTML = '<tr><td colspan="7" class="text-center">No se encontraron registros.</td></tr>';
    }
  } catch (err) {
    console.error(err);
    tablaBody.innerHTML = '<tr><td colspan="7" class="text-center">Error al cargar los datos.</td></tr>';
  }
});

