document.addEventListener('DOMContentLoaded', () => {
  let detalles = []; // Arreglo para almacenar los documentos del historial

  // Obtener el parámetro "sede" de la URL
  const sede = localStorage.getItem('sede') || 'pereira';
  const role = localStorage.getItem('role') || 'admin'; // Obtener el rol

  // Cargar historial desde el endpoint /detallesVehiculo, incluyendo el parámetro sede
  function loadHistorial() {
    fetch(`/detallesVehiculo?sede=${sede}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          detalles = data.detalles; // Se asume que data.detalles es un arreglo de documentos
          populateHistorialTable();
        } else {
          console.error("Error al cargar historial:", data.error);
        }
      })
      .catch(err => console.error("Error:", err));
  }

  // Rellenar la tabla del historial
  function populateHistorialTable() {
    const tbody = document.querySelector('#historialTable tbody');
    tbody.innerHTML = '';
    detalles.forEach(detalle => {
      const tr = document.createElement('tr');
      // Formatear la fecha
      const fecha = new Date(detalle.fecha).toLocaleString();
      const clienteEmpresa = detalle.cliente?.empresa || '';
      const vehiculo = detalle.vehiculo ? `${detalle.vehiculo.marca} ${detalle.vehiculo.modelo} (${detalle.vehiculo.placa})` : '';
      const estado = detalle.estado || 'Abierto';
      tr.innerHTML = `
        <td>${fecha}</td>
        <td>${clienteEmpresa}</td>
        <td>${vehiculo}</td>
        <td>${estado}</td>
        <td></td>
      `;

      const actionsCell = tr.querySelector('td:last-child');

      if (estado === 'Cerrado') {
        // Si el informe está cerrado, mostrar botones de Imprimir y Ver
        const imprimirBtn = document.createElement('button');
        imprimirBtn.className = 'btn btn-sm btn-info me-2';
        imprimirBtn.textContent = 'Imprimir';
        imprimirBtn.addEventListener('click', () => {
          window.location.href = `/imprimirInformeTodos.html?detalleId=${detalle.id}&sede=${sede}`;
        });
        actionsCell.appendChild(imprimirBtn);

        const verBtn = document.createElement('button');
        verBtn.className = 'btn btn-sm btn-secondary';
        verBtn.textContent = 'Ver';
        verBtn.addEventListener('click', () => {
          window.location.href = `/actualizarVehiculo.html?detalleId=${detalle.id}&sede=${sede}`;
        });
        actionsCell.appendChild(verBtn);
      } else {
        // Permitir edición mientras el informe no esté cerrado
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-sm btn-primary';
        editBtn.textContent = 'Editar';
        editBtn.addEventListener('click', () => {
          window.location.href = `/actualizarVehiculo.html?detalleId=${detalle.id}&sede=${sede}`;
        });
        actionsCell.appendChild(editBtn);
      }

      tbody.appendChild(tr);
    });
  }

  // -------------------------------------------------------
  // AJUSTAR VISIBILIDAD DEL NAV Y LOGO SEGÚN EL ROL
  // -------------------------------------------------------
  const elementosARestrigir = [
    'navProveedores',
    'navInventario',
    'navClientes',
    'cardProveedores',
    'cardInventario',
    'cardClientes'
  ];

  if (role === 'patio') {
    elementosARestrigir.forEach(id => {
      const elem = document.getElementById(id);
      if (elem) {
        elem.style.display = 'none';
      }
    });
  } else {
    elementosARestrigir.forEach(id => {
      const elem = document.getElementById(id);
      if (elem) {
        elem.style.display = '';
      }
    });
  }

  // -------------------------------------------------------
  // CONFIGURACIÓN DEL LOGO
  // -------------------------------------------------------
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

  // -------------------------------------------------------
  // INICIALIZACIÓN DEL HISTORIAL
  // -------------------------------------------------------
  loadHistorial();
});
