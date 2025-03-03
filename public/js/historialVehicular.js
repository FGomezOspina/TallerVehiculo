document.addEventListener('DOMContentLoaded', () => {
    let detalles = []; // Arreglo para almacenar los documentos del historial
  
    // Cargar historial desde el endpoint /detallesVehiculo
    function loadHistorial() {
      fetch('/detallesVehiculo')
        .then(response => response.json())
        .then(data => {
          if(data.success) {
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
        const clienteNombre = detalle.cliente?.nombre || '';
        const vehiculo = detalle.vehiculo ? `${detalle.vehiculo.marca} ${detalle.vehiculo.modelo} (${detalle.vehiculo.placa})` : '';
        const estado = detalle.estado || 'Abierto';
        tr.innerHTML = `
          <td>${fecha}</td>
          <td>${clienteNombre}</td>
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
            window.location.href = `/imprimirInforme.html?detalleId=${detalle.id}`;
          });
          actionsCell.appendChild(imprimirBtn);
  
          const verBtn = document.createElement('button');
          verBtn.className = 'btn btn-sm btn-secondary';
          verBtn.textContent = 'Ver';
          verBtn.addEventListener('click', () => {
            // Redirige a la misma página de actualizarVehiculo, que al cargar verificará que el estado es Cerrado y deshabilitará la edición.
            window.location.href = `/actualizarVehiculo.html?detalleId=${detalle.id}`;
          });
          actionsCell.appendChild(verBtn);
        } else {
          // Permitir edición mientras el informe no esté cerrado
          const editBtn = document.createElement('button');
          editBtn.className = 'btn btn-sm btn-primary';
          editBtn.textContent = 'Editar';
          editBtn.addEventListener('click', () => {
            window.location.href = `/actualizarVehiculo.html?detalleId=${detalle.id}`;
          });
          actionsCell.appendChild(editBtn);
        }
  
        tbody.appendChild(tr);
      });
    }
  
    // Inicializar la carga del historial
    loadHistorial();
});
