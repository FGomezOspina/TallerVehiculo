document.addEventListener('DOMContentLoaded', () => {
  let detalles = []; // Arreglo para almacenar los documentos del historial

  // Obtener el parámetro "sede" de la URL
  const sede = localStorage.getItem('sede') || 'pereira';
  const role = localStorage.getItem('role') || 'admin'; // Obtener el rol

  // Obtener el parámetro "placa" de la URL
  const urlParams = new URLSearchParams(window.location.search); 
  const placaUrl = urlParams.get('placa'); // Placa pasada por URL

  // Cargar historial desde el endpoint /detallesVehiculo, incluyendo el parámetro sede
  function loadHistorial() {
    fetch(`/detallesVehiculo?sede=${sede}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          detalles = data.detalles; // Se asume que data.detalles es un arreglo de documentos
          
          // Si se pasa una placa por URL, filtrar los detalles por placa
          if (placaUrl) {
            const filteredDetails = detalles.filter(detalle => detalle.vehiculo?.placa.toLowerCase() === placaUrl.toLowerCase());
            populateHistorialTable(filteredDetails); // Pasar los detalles filtrados a la tabla
          } else {
            populateHistorialTable(detalles); // Mostrar todos los detalles si no hay placa
          }
        } else {
          console.error("Error al cargar historial:", data.error);
        }
      })
      .catch(err => console.error("Error:", err));
  }

  // Rellenar la tabla del historial con los datos filtrados
  function populateHistorialTable(filteredDetails) {
    const tbody = document.querySelector('#historialTable tbody');
    tbody.innerHTML = ''; // Limpiar tabla antes de agregar datos

    // Verificar si no hay vehículos
    if (filteredDetails.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td colspan="5" class="text-center">No hay vehículos disponibles</td>
      `;
      tbody.appendChild(tr); // Agregar fila con el mensaje
      return; // Terminar la ejecución si no hay datos
    }

    // Rellenar la tabla con los detalles
    filteredDetails.forEach(detalle => {
      const tr = document.createElement('tr');
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

      if (estado === 'Abierto') {
        const cerrarBtn = document.createElement('button');
        cerrarBtn.className = 'btn btn-sm btn-danger me-2';
        cerrarBtn.textContent = 'Cerrar';
        cerrarBtn.addEventListener('click', () => {
          if (confirm("¿Estás seguro de que deseas cerrar este informe?")) {
            fetch(`/detallesVehiculo/${detalle.id}/cerrar`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ estado: 'Cerrado' })
            })
            .then(response => response.json())
            .then(data => {
              if (data.success) {
                alert("El informe se ha cerrado correctamente.");
                loadHistorial();
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
      }

      if (estado === 'Cerrado') {
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

  // Filtrar los registros según los campos de búsqueda
  function filterHistorial() {
    const fecha = document.getElementById('searchFecha').value;
    const empresa = document.getElementById('searchEmpresa').value.toLowerCase();
    const placa = document.getElementById('searchPlaca').value.toLowerCase();

    // Obtener solo la fecha (sin la hora) para comparar, en formato YYYY-MM-DD
    const formatDate = (date) => {
      const d = new Date(date);
      return d.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    };

    const filteredDetails = detalles.filter(detalle => {
      const detalleFecha = formatDate(detalle.fecha); // Convertir la fecha del detalle al formato YYYY-MM-DD
      const fechaMatch = fecha ? detalleFecha === formatDate(fecha) : true; // Comparar solo fechas (sin horas)
      const empresaMatch = detalle.cliente?.empresa.toLowerCase().includes(empresa) || false;
      const placaMatch = detalle.vehiculo?.placa.toLowerCase().includes(placa) || false;
      
      return fechaMatch && empresaMatch && placaMatch;
    });

    populateHistorialTable(filteredDetails);
  }

  // Botón de búsqueda
  document.getElementById('searchBtn').addEventListener('click', filterHistorial);

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
