document.addEventListener('DOMContentLoaded', () => {
  // Obtener el parámetro "sede" de la URL, con valor por defecto "pereira" si no existe
  const sede = localStorage.getItem('sede') || 'pereira';
  

  // ——— AÑADIR: Ajustar sidebar según rol ———
  const role = localStorage.getItem('role') || 'admin';
  if (role === 'patio') {
      // Ocultar módulos que el "patio" no debe ver
      ['navProveedores', 'navInventario', /* si tienes más IDs, agrégalas aquí */]
        .forEach(id => {
          const el = document.getElementById(id);
         if (el) el.style.display = 'none';
        });

      // DEJAR navClientes visible, pero ocultar solo el enlace "Crear Clientes"
      document
        .querySelectorAll('#collapseClientes a[href$="crearClientes.html"]')
        .forEach(link => {
          const li = link.closest('li');
          if (li) li.style.display = 'none';
        });
  }
  // ———————————————————————————————

  // -------------------------------------------------------
  // CONFIGURACIÓN DEL LOGO
  // -------------------------------------------------------
  // Al hacer clic en el logo, se redirige:
  // - Si es usuario patio: a /dashboard?sede=<sede>&role=patio
  // - Si es admin: a /dashboard?role=admin
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
  let vehiculoSeleccionadoGlobal = null;

  function mostrarOpcionesVehiculo(vehiculo) {
    vehiculoSeleccionadoGlobal = vehiculo;
    // Mostrar el modal de opciones del vehículo usando Bootstrap
    const modalEl = document.getElementById('vehiculoOptionsModal');
    const vehiculoModal = new bootstrap.Modal(modalEl);
    vehiculoModal.show();
  }
  
  // Función para obtener y renderizar clientes desde el servidor, filtrando por sede
  function renderClientes(query = "") {
    fetch(`/clientes?sede=${sede}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          clientesContainer.innerHTML = "";
          data.clientes.forEach(cliente => {
            // Filtro: si se ingresa consulta, buscar en nombre, cédula, empresa o en alguna placa de los vehículos.
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
  
            // Si se ingresa consulta y no coincide con ninguno de los filtros, no se muestra el cliente.
            if (query && !(coincideNombre || coincideCedula || coincidePlaca || coincideEmpresa)) {
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
  
            // **Asignar el eventListener al hacer clic en el cliente**
            item.addEventListener('click', () => {
              currentClienteData = cliente; // Asigna el cliente seleccionado a currentClienteData
              // Aquí puedes hacer más acciones como actualizar la UI, si lo necesitas
              console.log(currentClienteData); // Aquí podrías ver los datos del cliente en la consola
            });
  
            // Botón para ver vehículos
            const verVehiculosBtn = item.querySelector(".verVehiculosBtn");
            verVehiculosBtn.addEventListener("click", () => {
              const vehiculosList = item.querySelector(".vehiculos-list");
              if (vehiculosList.style.display === "none") {
                vehiculosList.style.display = "block";
                if (cliente.vehiculos && cliente.vehiculos.length > 0) {
                  // Renderizar cada vehículo como hipervínculo
                  vehiculosList.innerHTML = "<strong>Vehículos:</strong><ul>" + 
                    cliente.vehiculos.map((v, index) => {
                      return `<li>
                        <a href="#" class="vehiculoLink" data-index="${index}">
                          ${v.marca} ${v.modelo} - ${v.placa}
                        </a>
                      </li>`;
                    }).join("") +
                    "</ul>";
  
                  // Asignar listener a cada enlace de vehículo
                  const vehiculoLinks = vehiculosList.querySelectorAll('.vehiculoLink');
                  vehiculoLinks.forEach(link => {
                    link.addEventListener('click', (e) => {
                      e.preventDefault();
                      const idx = e.target.getAttribute('data-index');
                      const vehiculoSeleccionado = cliente.vehiculos[idx];
                      mostrarOpcionesVehiculo(vehiculoSeleccionado);
                    });
                  });
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
            // ocultar en patio
            if (role === 'patio') {
              eliminarClienteBtn.style.display = 'none';
            }
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

    // ——— NUEVO: si es patio, bloquear edición de datos de cliente ———
    if (role === 'patio') {
      ['editEmpresa','editNombre','editTelefono','editCedula','editEmail']
        .forEach(id => document.getElementById(id).disabled = true);
    } else {
      ['editEmpresa','editNombre','editTelefono','editCedula','editEmail']
        .forEach(id => document.getElementById(id).disabled = false);
    }
       // ——————————————————————————————————————————————
    
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
  

  document.getElementById('btnCrearOrden').addEventListener('click', () => {
    if (vehiculoSeleccionadoGlobal) {
      const params = new URLSearchParams();
      params.set('marca', vehiculoSeleccionadoGlobal.marca);
      params.set('modelo', vehiculoSeleccionadoGlobal.modelo);
      params.set('anio', vehiculoSeleccionadoGlobal.anio);
      params.set('color', vehiculoSeleccionadoGlobal.color);
      params.set('placa', vehiculoSeleccionadoGlobal.placa);

      // Datos del cliente
      params.set('clienteNombre', currentClienteData.nombre);
      params.set('clienteCedula', currentClienteData.cedula);
      params.set('clienteTelefono', currentClienteData.telefono);
      params.set('clienteEmpresa', currentClienteData.empresa);
      window.location.href = `detallevehiculoTodos.html?${params.toString()}`;
    }
  });
  
  document.getElementById('btnHistorialVehicular').addEventListener('click', () => {
    if (vehiculoSeleccionadoGlobal) {
      const params = new URLSearchParams();
      params.set('placa', vehiculoSeleccionadoGlobal.placa);
      window.location.href = `historialVehicular.html?${params.toString()}`;
    }
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
