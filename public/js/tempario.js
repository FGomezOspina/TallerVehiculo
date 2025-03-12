document.addEventListener('DOMContentLoaded', function() {
    let productoModal = new bootstrap.Modal(document.getElementById('productoModal'));
    const openModalBtn = document.getElementById('openModalBtn');
    const saveProductoBtn = document.getElementById('saveProductoBtn');
    const productoForm = document.getElementById('productoForm');
    const productoIdInput = document.getElementById('productoId');
    const productoCategoriaInput = document.getElementById('productoCategoria');
    const productoDescripcionInput = document.getElementById('productoDescripcion');
    const productoTiempoInput = document.getElementById('productoTiempo');
    const productoPrecioInput = document.getElementById('productoPrecio');
    const temparioTableBody = document.getElementById('temparioTableBody');
  
    let productos = [];
  
    // Función para renderizar la tabla
    function renderTable() {
      temparioTableBody.innerHTML = '';
      productos.forEach((prod, index) => {
        const tr = document.createElement('tr');
        tr.setAttribute('data-id', prod.id);
        tr.innerHTML = `
          <td>${index + 1}</td>
          <td>${prod.categoria || ''}</td>
          <td>${prod.descripcion}</td>
          <td>${prod.tiempo}</td>
          <td>${prod.precio}</td>
          <td>
            <button type="button" class="btn btn-primary btn-sm editBtn">Editar</button>
            <button type="button" class="btn btn-danger btn-sm deleteBtn">Eliminar</button>
          </td>
        `;
        temparioTableBody.appendChild(tr);
      });
    }
  
    // Función para obtener los servicios desde el servidor
    function fetchProductos() {
      fetch('/getTempario')
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.tempario)) {
            productos = data.tempario;
            renderTable();
          }
        })
        .catch(err => console.error('Error al obtener tempario:', err));
    }
  
    // Abrir modal para agregar un nuevo servicio
    openModalBtn.addEventListener('click', function() {
      // Limpiar campos del formulario
      productoIdInput.value = '';
      productoCategoriaInput.value = '';
      productoDescripcionInput.value = '';
      productoTiempoInput.value = '';
      productoPrecioInput.value = '';
      document.getElementById('productoModalLabel').textContent = 'Guardar Producto';
      productoModal.show();
    });
  
    // Delegación para el botón "Editar" y "Eliminar" en cada fila
    temparioTableBody.addEventListener('click', function(e) {
      const tr = e.target.closest('tr');
      const id = tr.getAttribute('data-id');
  
      if (e.target.classList.contains('editBtn')) {
        const producto = productos.find(p => p.id === id);
        if (producto) {
          productoIdInput.value = producto.id;
          productoCategoriaInput.value = producto.categoria || '';
          productoDescripcionInput.value = producto.descripcion;
          productoTiempoInput.value = producto.tiempo;
          productoPrecioInput.value = producto.precio;
          document.getElementById('productoModalLabel').textContent = 'Editar Producto';
          productoModal.show();
        }
      } else if (e.target.classList.contains('deleteBtn')) {
        if (confirm('¿Desea eliminar este servicio?')) {
          fetch(`/tempario/${id}`, {
            method: 'DELETE'
          })
          .then(res => res.json())
          .then(response => {
            if (response.success) {
              alert('Servicio eliminado exitosamente!');
              fetchProductos();
            } else {
              alert('Error al eliminar el servicio');
            }
          })
          .catch(err => {
            console.error(err);
            alert('Error en la conexión al servidor');
          });
        }
      }
    });
  
    // Manejar el botón "Guardar" del modal
    saveProductoBtn.addEventListener('click', function() {
      const id = productoIdInput.value;
      const categoria = productoCategoriaInput.value;
      const descripcion = productoDescripcionInput.value.trim();
      const tiempo = productoTiempoInput.value.trim();
      const precio = productoPrecioInput.value.trim();
  
      if (!categoria || !descripcion || !tiempo || !precio) {
        alert('Por favor, complete todos los campos.');
        return;
      }
  
      const payload = { categoria, descripcion, tiempo, precio };
  
      if (id) {
        // Actualizar servicio existente
        fetch(`/tempario/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            alert('Servicio actualizado exitosamente!');
            productoModal.hide();
            fetchProductos();
          } else {
            alert('Error al actualizar el servicio.');
          }
        })
        .catch(err => {
          console.error(err);
          alert('Error en la conexión al servidor.');
        });
      } else {
        // Guardar nuevo servicio (se envía en formato arreglo)
        fetch('/saveTempario', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tempario: [payload] })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.ids && data.ids[0]) {
            alert('Servicio guardado exitosamente!');
            productoModal.hide();
            fetchProductos();
          } else {
            alert('Error al guardar el servicio.');
          }
        })
        .catch(err => {
          console.error(err);
          alert('Error en la conexión al servidor.');
        });
      }
    });
  
    // Cargar los servicios al iniciar
    fetchProductos();
});
  