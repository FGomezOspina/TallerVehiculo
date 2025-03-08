document.addEventListener('DOMContentLoaded', function() {
    let productos = [];
  
    const tableBody = document.querySelector('#tablaProductos tbody');
    const searchInput = document.getElementById('busquedaProducto');
    const modalProductoEl = document.getElementById('modalProducto');
    let modalProducto = new bootstrap.Modal(modalProductoEl);
  
    // Función para renderizar la tabla de productos
    function renderTabla() {
      const searchText = searchInput.value.toLowerCase();
      tableBody.innerHTML = ''; // Limpiar tabla
      productos.forEach(prod => {
        if (
          prod.nombre.toLowerCase().includes(searchText) ||
          prod.sku.toLowerCase().includes(searchText)
        ) {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${prod.sku}</td>
            <td>${prod.nombre}</td>
            <td>${prod.stock.cantidadDisponible}</td>
            <td>${parseFloat(prod.precio.precioBase).toFixed(2)}</td>
            <td>
              <button class="btn btn-primary btn-sm editar" data-id="${prod.id}">Editar</button>
              <button class="btn btn-danger btn-sm eliminar" data-id="${prod.id}">Eliminar</button>
            </td>
          `;
          tableBody.appendChild(row);
        }
      });
    }
  
    // Función para obtener los productos desde Firestore vía el endpoint
    function fetchProductos() {
      fetch('/productos')
        .then(response => response.json())
        .then(data => {
          if(data.success) {
            productos = data.productos;
            renderTabla();
          }
        })
        .catch(err => console.error('Error al obtener productos:', err));
    }
  
    // Obtiene los productos al cargar la página
    fetchProductos();
  
    // Filtrado de productos en la barra de búsqueda
    searchInput.addEventListener('keyup', renderTabla);
  
    // Delegación de eventos para eliminar producto
    tableBody.addEventListener('click', function(event) {
      if (event.target.classList.contains('eliminar')) {
        const prodId = event.target.getAttribute('data-id');
        if (confirm("¿Está seguro de eliminar este producto?")) {
          fetch(`/productos/${prodId}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
              if(data.success) {
                fetchProductos();
              } else {
                alert("Error eliminando el producto");
              }
            })
            .catch(err => {
              console.error('Error eliminando producto:', err);
              alert("Error eliminando el producto");
            });
        }
      }
    });
  
    // Delegación de eventos para editar producto
    tableBody.addEventListener('click', function(event) {
      if (event.target.classList.contains('editar')) {
        const prodId = event.target.getAttribute('data-id');
        // Buscar el producto a editar
        const prod = productos.find(p => p.id === prodId);
        if (prod) {
          // Llenar el formulario con los datos del producto
          document.getElementById('productoId').value = prod.id;
          document.getElementById('nombreProducto').value = prod.nombre;
          document.getElementById('skuProducto').value = prod.sku;
          document.getElementById('categoriaProducto').value = prod.categoria;
          document.getElementById('proveedorProducto').value = prod.proveedor;
          document.getElementById('ubicacionProducto').value = prod.ubicacion;
          document.getElementById('cantidadDisponible').value = prod.stock.cantidadDisponible;
          document.getElementById('stockMinimo').value = prod.stock.stockMinimo;
          document.getElementById('stockMaximo').value = prod.stock.stockMaximo;
          document.getElementById('precioBase').value = prod.precio.precioBase;
          document.getElementById('ivaProducto').value = prod.precio.iva;
          // Cambiar el título del modal para edición
          document.getElementById('modalProductoLabel').textContent = "Editar Producto";
          // Mostrar el modal
          modalProducto.show();
        }
      }
    });
  
    // Manejo del guardado de un nuevo producto o actualización (edición)
    document.getElementById('guardarProducto').addEventListener('click', function() {
      // Recoger datos del formulario
      const nuevoProducto = {
        sku: document.getElementById('skuProducto').value.trim(),
        nombre: document.getElementById('nombreProducto').value.trim(),
        categoria: document.getElementById('categoriaProducto').value.trim(),
        proveedor: document.getElementById('proveedorProducto').value.trim(),
        ubicacion: document.getElementById('ubicacionProducto').value.trim(),
        stock: {
          cantidadDisponible: parseInt(document.getElementById('cantidadDisponible').value) || 0,
          stockMinimo: parseInt(document.getElementById('stockMinimo').value) || 0,
          stockMaximo: parseInt(document.getElementById('stockMaximo').value) || 0
        },
        precio: {
          precioBase: parseFloat(document.getElementById('precioBase').value) || 0,
          iva: document.getElementById('ivaProducto').value
        }
      };
  
      // Validación mínima: nombre y SKU obligatorios
      if (!nuevoProducto.nombre || !nuevoProducto.sku) {
        alert("Por favor, ingrese al menos el nombre y el SKU del producto.");
        return;
      }
  
      const prodId = document.getElementById('productoId').value;
      if (prodId) {
        // Es una edición: enviar PUT a /productos/:id
        fetch(`/productos/${prodId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nuevoProducto)
        })
        .then(response => response.json())
        .then(data => {
          if(data.success) {
            fetchProductos();
            document.getElementById('formProducto').reset();
            document.getElementById('productoId').value = "";
            // Restaurar título del modal
            document.getElementById('modalProductoLabel').textContent = "Añadir Nuevo Producto";
            modalProducto.hide();
            alert("Producto actualizado exitosamente!");
          } else {
            alert("Error al actualizar el producto");
          }
        })
        .catch(err => {
          console.error("Error actualizando producto:", err);
          alert("Error al actualizar el producto");
        });
      } else {
        // Es un nuevo producto: enviar POST a /saveProducto
        fetch('/saveProducto', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nuevoProducto)
        })
        .then(response => response.json())
        .then(data => {
          if(data.success) {
            fetchProductos();
            document.getElementById('formProducto').reset();
            modalProducto.hide();
            alert("Producto agregado exitosamente!");
          } else {
            alert("Error al guardar el producto");
          }
        })
        .catch(err => {
          console.error('Error guardando producto:', err);
          alert("Error al guardar el producto");
        });
      }
    });

});
  