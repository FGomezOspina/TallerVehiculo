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
          // Se extrae o define el estado, por defecto "Abierto"
          const estado = detalle.estado || 'Abierto';
        
          tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${detalle.ejecutor || ''}</td>
            <td>${detalle.equipo || ''}</td>
            <td>${detalle.fechaProgramada || ''}</td>
            <td>${detalle.horaProgramada || ''}</td>
            <td>${detalle.sede || ''}</td>
            <td></td>
          `;
        
          const actionsCell = tr.querySelector('td:last-child');
        
          if (estado === 'Abierto') {
            // Botón "Cerrar"
            const cerrarBtn = document.createElement('button');
            cerrarBtn.className = 'btn btn-sm btn-danger me-2';
            cerrarBtn.textContent = 'Cerrar';
            cerrarBtn.addEventListener('click', () => {
              if (confirm("¿Estás seguro de que deseas cerrar este informe?")) {
                fetch(`/detallesVehiculoArgos/${detalle.id}/cerrar`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ estado: 'Cerrado' })
                })
                .then(response => response.json())
                .then(data => {
                  if (data.success) {
                    alert("El informe se ha cerrado correctamente.");
                    // Recargar la página o volver a cargar los datos del historial
                    location.reload();
                  } else {
                    alert("Error al cerrar el informe: " + data.error);
                  }
                })
                .catch(err => {
                  console.error(err);
                  alert("Error al conectar con el servidor.");
                });
              }
            });
            actionsCell.appendChild(cerrarBtn);
        
            // Botón "Editar" para informes abiertos
            const editBtn = document.createElement('a');
            editBtn.href = `actualizarVehiculoArgos.html?id=${detalle.id}&sede=${sede}&role=${role}`;
            editBtn.className = 'btn btn-sm btn-primary';
            editBtn.textContent = 'Editar';
            actionsCell.appendChild(editBtn);
          } else if (estado === 'Cerrado') {
            // Botón "Imprimir" para informes cerrados
            const imprimirBtn = document.createElement('button');
            imprimirBtn.className = 'btn btn-sm btn-info me-2';
            imprimirBtn.textContent = 'Imprimir';
            imprimirBtn.addEventListener('click', () => {
              window.location.href = `/imprimirInformeArgos.html?detalleId=${detalle.id}&sede=${sede}`;
            });
            actionsCell.appendChild(imprimirBtn);
        
            // Botón "Ver" para informes cerrados
            const verBtn = document.createElement('button');
            verBtn.className = 'btn btn-sm btn-secondary';
            verBtn.textContent = 'Ver';
            verBtn.addEventListener('click', () => {
              window.location.href = `actualizarVehiculoArgos.html?id=${detalle.id}&sede=${sede}`;
            });
            actionsCell.appendChild(verBtn);
          }
        
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

