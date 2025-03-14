document.addEventListener('DOMContentLoaded', () => {
  // Obtener el parámetro "sede" de la URL, con valor por defecto "pereira" si no existe
  const sede = localStorage.getItem('sede') || 'pereira';

  // Referencias a elementos del DOM
  const clientesContainer = document.getElementById("clientesContainer");
  const searchQueryInput = document.getElementById("searchQuery");
  const btnBuscar = document.getElementById("btnBuscar");
  
  const editClienteModalEl = document.getElementById("editClienteModal");
  const editClienteModal = new bootstrap.Modal(editClienteModalEl);
  const guardarEditClienteBtn = document.getElementById("guardarEditClienteBtn");
  const editVehiculosContainer = document.getElementById("editVehiculosContainer");
  
  let currentClienteId = null;
  let currentClienteData = null;
  
  // Función para obtener y renderizar clientes desde el servidor, filtrando por sede
  function renderClientes(query = "") {
    fetch(`/clientes?sede=${sede}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          clientesContainer.innerHTML = "";
          data.clientes.forEach(cliente => {
            // Filtro: si se ingresa consulta, buscar en nombre, cédula o en alguna placa de los vehículos.
            const q = query.toLowerCase();
            const coincideEmpresa = cliente.empresa.toLowerCase().includes(q);
            const coincideNombre = cliente.nombre.toLowerCase().includes(q);
            const coincideCedula = cliente.cedula.toLowerCase().includes(q);
            let coincidePlaca = false;
            if (cliente.vehiculos && Array.isArray(cliente.vehiculos)) {
              cliente.vehiculos.forEach(v => {
                if (v.placa && v.placa.toLowerCase().includes(q)) {
                  coincidePlaca = true;
                }
              });
            }
  
            // Modificación aquí: si coincide con cualquiera de los filtros, mostrar el cliente.
            if (query && !(
              coincideNombre || 
              coincideCedula || 
              coincidePlaca || 
              coincideEmpresa
            )) {
              return;
            }
  
            // Crear item de lista para cliente
            const item = document.createElement("div");
            item.className = "list-group-item";
            item.dataset.id = cliente.id;
            item.innerHTML = `
              <div class="d-flex w-100 justify-content-between">
                <div>
                  <h5 class="mb-1">${cliente.nombre} (${cliente.empresa})</h5>
                  <p class="mb-1">Cédula: ${cliente.cedula} | Email: ${cliente.email}</p>
                </div>
                <div>
                  <button class="btn btn-sm btn-info verVehiculosBtn me-1">
                    <i class="bi bi-eye"></i> Vehículos
                  </button>
                  <button class="btn btn-sm btn-outline-primary editarClienteBtn me-1">
                    <i class="bi bi-pencil"></i> Editar
                  </button>
                  <button class="btn btn-sm btn-danger eliminarClienteBtn">
                    <i class="bi bi-trash"></i> Eliminar
                  </button>
                </div>
              </div>
              <div class="vehiculos-list mt-2" style="display:none;"></div>
            `;
            
            // Botón para ver vehículos
            const verVehiculosBtn = item.querySelector(".verVehiculosBtn");
            verVehiculosBtn.addEventListener("click", () => {
              const vehiculosList = item.querySelector(".vehiculos-list");
              if (vehiculosList.style.display === "none") {
                vehiculosList.style.display = "block";
                if (cliente.vehiculos && cliente.vehiculos.length > 0) {
                  vehiculosList.innerHTML = "<strong>Vehículos:</strong><ul>" + 
                    cliente.vehiculos.map(v => `<li>${v.marca} ${v.modelo} - ${v.placa}</li>`).join("") + 
                    "</ul>";
                } else {
                  vehiculosList.innerHTML = "<em>No tiene vehículos registrados.</em>";
                }
              } else {
                vehiculosList.style.display = "none";
              }
            });
  
            // Botón para editar cliente
            const editarClienteBtn = item.querySelector(".editarClienteBtn");
            editarClienteBtn.addEventListener("click", () => {
              currentClienteId = cliente.id;
              currentClienteData = cliente;
              fillEditForm(cliente);
              editClienteModal.show();
            });
  
            // Botón para eliminar cliente
            const eliminarClienteBtn = item.querySelector(".eliminarClienteBtn");
            eliminarClienteBtn.addEventListener("click", () => {
              if (confirm(`¿Seguro que desea eliminar el cliente ${cliente.nombre}?`)) {
                fetch(`/clientes/${cliente.id}`, { method: "DELETE" })
                  .then(response => response.json())
                  .then(data => {
                    if (data.success) {
                      alert("Cliente eliminado correctamente");
                      renderClientes();
                    } else {
                      alert("Error al eliminar cliente");
                    }
                  })
                  .catch(err => {
                    console.error("Error:", err);
                    alert("Error al eliminar cliente");
                  });
              }
            });
  
            clientesContainer.appendChild(item);
          });
        } else {
          clientesContainer.innerHTML = "No se pudo obtener la lista de clientes.";
        }
      })
      .catch(err => {
        console.error("Error:", err);
        clientesContainer.innerHTML = "Error al cargar clientes.";
      });
  }
  
  // Función para llenar el formulario de edición (cliente y vehículos)
  function fillEditForm(cliente) {
    document.getElementById("editEmpresa").value = cliente.empresa || "";
    document.getElementById("editNombre").value = cliente.nombre || "";
    document.getElementById("editTelefono").value = cliente.telefono || "";
    document.getElementById("editCedula").value = cliente.cedula || "";
    document.getElementById("editEmail").value = cliente.email || "";
    
    // Limpiar contenedor de vehículos
    editVehiculosContainer.innerHTML = "";
    if (cliente.vehiculos && Array.isArray(cliente.vehiculos)) {
      cliente.vehiculos.forEach((vehiculo, index) => {
        const vehiculoForm = crearFormularioVehiculoEdit(index + 1, vehiculo);
        editVehiculosContainer.appendChild(vehiculoForm);
      });
    }
  }
  
  // Función para crear formulario de vehículo en el modal de edición
  function crearFormularioVehiculoEdit(index, vehiculo = {}) {
    const card = document.createElement("div");
    card.className = "card mb-3";
    card.innerHTML = `
      <div class="card-header d-flex justify-content-between align-items-center">
        <span>Vehículo ${index}</span>
        <button type="button" class="btn btn-danger btn-sm eliminarVehiculoEditBtn">
          <i class="bi bi-trash"></i>
        </button>
      </div>
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Marca</label>
            <input type="text" class="form-control" name="vehMarca" placeholder="Marca" value="${vehiculo.marca || ''}" required>
          </div>
          <div class="col-md-6">
            <label class="form-label">Modelo</label>
            <input type="text" class="form-control" name="vehModelo" placeholder="Modelo" value="${vehiculo.modelo || ''}" required>
          </div>
          <div class="col-md-4">
            <label class="form-label">Año</label>
            <input type="number" class="form-control" name="vehAnio" placeholder="Año" value="${vehiculo.anio || ''}" required>
          </div>
          <div class="col-md-4">
            <label class="form-label">Color</label>
            <input type="text" class="form-control" name="vehColor" placeholder="Color" value="${vehiculo.color || ''}" required>
          </div>
          <div class="col-md-4">
            <label class="form-label">Placa</label>
            <input type="text" class="form-control" name="vehPlaca" placeholder="Placa" value="${vehiculo.placa || ''}" required>
          </div>
        </div>
      </div>
    `;
    return card;
  }
  
  // Botón de búsqueda: un único input
  btnBuscar.addEventListener("click", () => {
    const query = searchQueryInput.value.trim();
    renderClientes(query);
  });
  
  // Evento para guardar cambios del cliente (incluyendo vehículos) en el modal
  guardarEditClienteBtn.addEventListener("click", () => {
    // Se agrega la sede automáticamente (sin campo en el formulario)
    const updatedData = {
      empresa: document.getElementById("editEmpresa").value,
      nombre: document.getElementById("editNombre").value,
      telefono: document.getElementById("editTelefono").value,
      cedula: document.getElementById("editCedula").value,
      email: document.getElementById("editEmail").value,
      sede, // se utiliza la sede extraída de la URL
      vehiculos: []
    };
    
    const vehiculoCards = editVehiculosContainer.querySelectorAll('.card');
    vehiculoCards.forEach(card => {
      const vehiculo = {
        marca: card.querySelector('input[name="vehMarca"]').value,
        modelo: card.querySelector('input[name="vehModelo"]').value,
        anio: card.querySelector('input[name="vehAnio"]').value,
        color: card.querySelector('input[name="vehColor"]').value,
        placa: card.querySelector('input[name="vehPlaca"]').value
      };
      updatedData.vehiculos.push(vehiculo);
    });
    
    fetch(`/clientes/${currentClienteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData)
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert("Cliente actualizado correctamente");
        editClienteModal.hide();
        renderClientes();
      } else {
        alert("Error actualizando cliente");
      }
    })
    .catch(err => {
      console.error("Error:", err);
      alert("Error actualizando cliente");
    });
  });
  
  // Evento para agregar un nuevo vehículo en el modal de edición
  document.getElementById("agregarVehiculoEditBtn").addEventListener("click", () => {
    const index = editVehiculosContainer.querySelectorAll('.card').length + 1;
    const vehiculoForm = crearFormularioVehiculoEdit(index);
    editVehiculosContainer.appendChild(vehiculoForm);
  });
  
  // Delegar la eliminación de vehículo en el modal de edición
  editVehiculosContainer.addEventListener("click", (e) => {
    if (e.target.closest(".eliminarVehiculoEditBtn")) {
      const card = e.target.closest(".card");
      editVehiculosContainer.removeChild(card);
    }
  });
  
  // Inicializa la lista de clientes al cargar la página
  renderClientes();
});
