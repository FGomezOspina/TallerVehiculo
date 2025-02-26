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
        tr.innerHTML = `
          <td>${fecha}</td>
          <td>${clienteNombre}</td>
          <td>${vehiculo}</td>
          <td><button class="btn btn-sm btn-primary btn-edit" data-id="${detalle.id}">Editar</button></td>
        `;
        tbody.appendChild(tr);
      });
      // Agregar evento a cada botón de editar: redirige a actualizarVehiculo.html con el detalleId en la URL
      document.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', () => {
          const detalleId = button.getAttribute('data-id');
          window.location.href = `/actualizarVehiculo.html?detalleId=${detalleId}`;
        });
      });
    }
  
    // Inicializar la carga del historial
    loadHistorial();
});
  