document.addEventListener('DOMContentLoaded', function() {
  // -------------------------------------------------------
  // DATOS INICIALES DEL VEHÍCULO
  // -------------------------------------------------------
  let vehicleData = {
    marca: 'Marca',
    modelo: 'Modelo',
    anio: 'año',
    color: 'Color',
    placa: 'Placa',
    kilometraje: 'kms', // en Kms
    combustible: 'Combustible' // en %
  };

  // Variable global para almacenar los productos del inventario
  let inventoryProducts = [];

  // Función para cargar el inventario desde Firebase (endpoint /productos)
  function loadInventory() {
    fetch('/productos')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          inventoryProducts = data.productos;
          // Poblar todos los select existentes de productos
          document.querySelectorAll('.product-select').forEach(select => {
            populateProductSelect(select);
          });
        } else {
          console.error("Error loading products:", data.error);
        }
      })
      .catch(err => console.error("Error fetching products:", err));
  }
  

  // Función para poblar un select con los productos del inventario
  function populateProductSelect(selectElement) {
    selectElement.innerHTML = '<option value="">Seleccione un producto</option>';
    inventoryProducts.forEach(product => {
      const option = document.createElement('option');
      option.value = product.id;
      option.textContent = product.nombre || 'Sin nombre';
      option.setAttribute('data-precio-base', product.precio.precioBase || 0);
      selectElement.appendChild(option);
    });
  }

  // Referencias para la pestaña Vehículo
  const vehTitle = document.getElementById('vehTitle');
  const vehSubtitle = document.getElementById('vehSubtitle');
  const vehKilometrajeDisplay = document.getElementById('vehKilometrajeDisplay');
  const fuelProgress = document.getElementById('fuelProgress');

  // Botón "Editar" y Modal para editar vehículo
  const btnEditarVehiculo = document.getElementById('btnEditarVehiculo');
  const editVehicleModalEl = document.getElementById('editVehicleModal');
  const editVehicleModal = new bootstrap.Modal(editVehicleModalEl);
  const modalVehMarca = document.getElementById('modalVehMarca');
  const modalVehModelo = document.getElementById('modalVehModelo');
  const modalVehAnio = document.getElementById('modalVehAnio');
  const modalVehColor = document.getElementById('modalVehColor');
  const modalVehPlaca = document.getElementById('modalVehPlaca');
  const modalVehKilometraje = document.getElementById('modalVehKilometraje');
  const modalVehCombustible = document.getElementById('modalVehCombustible');
  const btnGuardarVehiculo = document.getElementById('btnGuardarVehiculo');

  // Funciones para actualizar la pestaña Vehículo
  function updateVehicleTab() {
    vehTitle.textContent = `${vehicleData.marca} ${vehicleData.modelo}`;
    vehSubtitle.textContent = `${vehicleData.placa} - ${vehicleData.anio} - ${vehicleData.color}`;
    let kms = parseFloat(vehicleData.kilometraje) || 0;
    vehKilometrajeDisplay.textContent = kms.toLocaleString() + ' Kms';
    fuelProgress.style.width = vehicleData.combustible + '%';
    fuelProgress.setAttribute('aria-valuenow', vehicleData.combustible);
    fuelProgress.textContent = vehicleData.combustible + '%';
  }

  function fillModalFields() {
    modalVehMarca.value = vehicleData.marca;
    modalVehModelo.value = vehicleData.modelo;
    modalVehAnio.value = vehicleData.anio;
    modalVehColor.value = vehicleData.color;
    modalVehPlaca.value = vehicleData.placa;
    modalVehKilometraje.value = vehicleData.kilometraje;
    modalVehCombustible.value = vehicleData.combustible;
  }

  btnEditarVehiculo.addEventListener('click', () => {
    fillModalFields();
    editVehicleModal.show();
  });

  btnGuardarVehiculo.addEventListener('click', () => {
    vehicleData.marca = modalVehMarca.value;
    vehicleData.modelo = modalVehModelo.value;
    vehicleData.anio = parseInt(modalVehAnio.value) || 0;
    vehicleData.color = modalVehColor.value;
    vehicleData.placa = modalVehPlaca.value;
    vehicleData.kilometraje = parseInt(modalVehKilometraje.value) || 0;
    vehicleData.combustible = parseInt(modalVehCombustible.value) || 0;
    updateVehicleTab();
    editVehicleModal.hide();
  });

  // -------------------------------------------------------
  // LÓGICA DE LA TABLA DE SERVICIOS / PRODUCTOS
  // -------------------------------------------------------
  const tablaServicios = document.getElementById('tablaServicios');
  const agregarFilaBtn = document.getElementById('agregarFila');
  const totalServiciosEl = document.getElementById('totalServicios');

  // Actualizamos la función recalcularTotal para usar selectores por clase
  function recalcularTotal() {
    let total = 0;
    const filas = tablaServicios.querySelectorAll('tbody tr');
    filas.forEach((fila) => {
      const quantityInput = fila.querySelector('.quantity-input');
      const priceInput = fila.querySelector('.price-input');
      const cantidad = parseFloat(quantityInput.value) || 0;
      const precioU = parseFloat(priceInput.value) || 0;
      const subtotal = cantidad * precioU;
      const subtotalCell = fila.querySelector('.subtotal-cell');
      subtotalCell.textContent = `$${subtotal.toFixed(2)}`;
      total += subtotal;
    });
    totalServiciosEl.textContent = `$${total.toFixed(2)}`;
  }

  function agregarFila() {
    const tbody = tablaServicios.querySelector('tbody');
    const nuevaFila = document.createElement('tr');
    nuevaFila.innerHTML = `
      <td>
        <select class="form-select product-select">
          <option value="">Seleccione un producto</option>
        </select>
      </td>
      <td><input type="number" class="form-control quantity-input" value="1" min="1" /></td>
      <td><input type="number" class="form-control price-input" value="0" min="0" readonly /></td>
      <td class="align-middle text-end subtotal-cell">$0.00</td>
      <td class="text-center align-middle">
        <button class="btn btn-sm btn-danger eliminarFila">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(nuevaFila);

    // Poblar el select con los productos del inventario
    const selectElement = nuevaFila.querySelector('.product-select');
    populateProductSelect(selectElement);

    // Agregar evento para actualizar el precio unitario al seleccionar un producto
    selectElement.addEventListener('change', function(e) {
      const selectedOption = e.target.options[e.target.selectedIndex];
      const precioBase = parseFloat(selectedOption.getAttribute('data-precio-base')) || 0;
      const priceInput = nuevaFila.querySelector('.price-input');
      priceInput.value = precioBase;
      recalcularTotal();
    });

    recalcularTotal();
  }

  // Evento para eliminar una fila al hacer clic en el botón de borrar
  function eliminarFila(e) {
    if (e.target.closest('.eliminarFila')) {
      const fila = e.target.closest('tr');
      fila.remove();
      recalcularTotal();
    }
  }

  tablaServicios.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT') {
      recalcularTotal();
    }
  });
  tablaServicios.addEventListener('click', eliminarFila);
  agregarFilaBtn.addEventListener('click', agregarFila);

  // -------------------------------------------------------
  // LÓGICA DE PREVISUALIZACIÓN DE FOTOS (Múltiples)
  // -------------------------------------------------------
  const fotoAntesInput = document.getElementById('fotoAntes');
  const fotoDespuesInput = document.getElementById('fotoDespues');
  const previewFotosAntes = document.getElementById('previewFotosAntes');
  const previewFotosDespues = document.getElementById('previewFotosDespues');

  function previewMultiple(input, container) {
    container.innerHTML = ''; // Limpia el contenedor
    const files = input.files;
    if (files.length === 0) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = function(e) {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.classList.add('img-thumbnail', 'm-1');
        img.style.maxWidth = '120px';
        container.appendChild(img);
      };
      reader.readAsDataURL(file);
    });
  }

  fotoAntesInput.addEventListener('change', () => {
    previewMultiple(fotoAntesInput, previewFotosAntes);
  });
  fotoDespuesInput.addEventListener('change', () => {
    previewMultiple(fotoDespuesInput, previewFotosDespues);
  });

  // -------------------------------------------------------
  // BUSCADOR DE CLIENTES Y SELECCIÓN DE VEHÍCULO
  // -------------------------------------------------------
  const clientSearchInput = document.getElementById('clientSearch');
  const btnClientSearch = document.getElementById('btnClientSearch');
  const searchResults = document.getElementById('searchResults');
  const clientVehicleSelectContainer = document.getElementById('clientVehicleSelectContainer');
  const clientVehicleSelect = document.getElementById('clientVehicleSelect');
  const noClientMessage = document.getElementById('noClientMessage');

  let currentClient = null; // Almacena el cliente seleccionado

  function searchClientes(query) {
    fetch('/clientes')
      .then(response => response.json())
      .then(data => {
        searchResults.innerHTML = "";
        currentClient = null;
        clientVehicleSelectContainer.style.display = "none";
        noClientMessage.style.display = "none";
        if(data.success) {
          let resultados = data.clientes.filter(cliente => {
            const q = query.toLowerCase();
            const matchNombre = cliente.nombre.toLowerCase().includes(q);
            const matchCedula = cliente.cedula.toLowerCase().includes(q);
            let matchPlaca = false;
            if(cliente.vehiculos && Array.isArray(cliente.vehiculos)) {
              cliente.vehiculos.forEach(v => {
                if(v.placa && v.placa.toLowerCase().includes(q)) {
                  matchPlaca = true;
                }
              });
            }
            return matchNombre || matchCedula || matchPlaca;
          });
          if(resultados.length === 0) {
            noClientMessage.style.display = "block";
          }
          resultados.forEach(cliente => {
            const item = document.createElement("a");
            item.href = "#";
            item.className = "list-group-item list-group-item-action";
            item.dataset.id = cliente.id;
            item.innerHTML = `
              <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1">${cliente.nombre} (${cliente.empresa})</h5>
                <small>${cliente.telefono}</small>
              </div>
              <p class="mb-1">Cédula: ${cliente.cedula} | RUT: ${cliente.rut}</p>
              <small>Dirección: ${cliente.direccion}</small>
            `;
            item.addEventListener("click", () => {
              currentClient = cliente;
              searchResults.innerHTML = "";
              clientSearchInput.value = cliente.nombre;
              // Actualiza la información del cliente en la parte superior
              document.getElementById("clienteNombreDisplay").textContent = cliente.nombre;
              document.getElementById("clienteCedulaDisplay").textContent = cliente.cedula;
              document.getElementById("clienteTelefonoDisplay").textContent = cliente.telefono;
              if(cliente.vehiculos && cliente.vehiculos.length > 0) {
                if(cliente.vehiculos.length === 1) {
                  vehicleData = cliente.vehiculos[0];
                  updateVehicleTab();
                  clientVehicleSelectContainer.style.display = "none";
                } else {
                  clientVehicleSelect.innerHTML = "";
                  cliente.vehiculos.forEach((veh, idx) => {
                    const option = document.createElement("option");
                    option.value = idx;
                    option.textContent = `${veh.marca} ${veh.modelo} - ${veh.placa}`;
                    clientVehicleSelect.appendChild(option);
                  });
                  clientVehicleSelectContainer.style.display = "block";
                  vehicleData = cliente.vehiculos[0];
                  updateVehicleTab();
                }
              } else {
                alert("Este cliente no tiene vehículos registrados.");
              }
            });
            searchResults.appendChild(item);
          });
        } else {
          searchResults.innerHTML = "No se pudo obtener la lista de clientes.";
        }
      })
      .catch(err => {
        console.error("Error:", err);
        searchResults.innerHTML = "Error al buscar clientes.";
      });
  }

  btnClientSearch.addEventListener("click", () => {
    const query = clientSearchInput.value.trim();
    if(query !== "") {
      searchClientes(query);
    }
  });

  clientSearchInput.addEventListener("keypress", (e) => {
    if(e.key === "Enter") {
      const query = clientSearchInput.value.trim();
      if(query !== "") {
        searchClientes(query);
      }
    }
  });

  clientVehicleSelect.addEventListener("change", () => {
    if(currentClient && currentClient.vehiculos && currentClient.vehiculos.length > 1) {
      const idx = parseInt(clientVehicleSelect.value);
      vehicleData = currentClient.vehiculos[idx];
      updateVehicleTab();
    }
  });

  // -------------------------------------------------------
  // INICIALIZACIÓN
  // -------------------------------------------------------
  updateVehicleTab();
  recalcularTotal();
  loadInventory();

  // Agregar eventos al select del registro inicial en la tabla
  document.querySelectorAll('.product-select').forEach(select => {
    populateProductSelect(select);
    select.addEventListener('change', function(e) {
      const row = e.target.closest('tr');
      const selectedOption = e.target.options[e.target.selectedIndex];
      const precioBase = parseFloat(selectedOption.getAttribute('data-precio-base')) || 0;
      const priceInput = row.querySelector('.price-input');
      priceInput.value = precioBase;
      recalcularTotal();
    });
  });

  // -------------------------------------------------------
  // IMPLEMENTACIÓN DE SIGNATURE PAD PARA FIRMAS INDEPENDIENTES
  // -------------------------------------------------------
  // Firma del Cliente
  const signatureCanvasCliente = document.getElementById('signatureCanvasCliente');
  signatureCanvasCliente.width = signatureCanvasCliente.offsetWidth;
  signatureCanvasCliente.height = signatureCanvasCliente.offsetHeight;
  const signaturePadCliente = new SignaturePad(signatureCanvasCliente);
  const signatureModalClienteEl = document.getElementById('signatureModalCliente');
  const signatureModalCliente = new bootstrap.Modal(signatureModalClienteEl);

  signatureModalClienteEl.addEventListener('shown.bs.modal', () => {
    signatureCanvasCliente.width = signatureCanvasCliente.offsetWidth;
    signatureCanvasCliente.height = signatureCanvasCliente.offsetHeight;
    signaturePadCliente.clear();
  });
  
  document.getElementById('btnClearSignatureCliente').addEventListener('click', () => {
    signaturePadCliente.clear();
  });
  
  document.getElementById('btnSaveSignatureCliente').addEventListener('click', () => {
    if(signaturePadCliente.isEmpty()) {
      alert("Por favor, firma antes de guardar.");
    } else {
      const dataURL = signaturePadCliente.toDataURL();
      document.getElementById('signatureBoxCliente').innerHTML = `<img src="${dataURL}" alt="Firma digital del Cliente" style="max-width: 100%;">`;
      signatureModalCliente.hide();
    }
  });
  
  const signatureBoxCliente = document.getElementById('signatureBoxCliente');
  if(signatureBoxCliente) {
    signatureBoxCliente.addEventListener('click', () => {
      signaturePadCliente.clear();
      signatureModalCliente.show();
    });
  }
  
  // Firma del Taller
  const signatureCanvasTaller = document.getElementById('signatureCanvasTaller');
  signatureCanvasTaller.width = signatureCanvasTaller.offsetWidth;
  signatureCanvasTaller.height = signatureCanvasTaller.offsetHeight;
  const signaturePadTaller = new SignaturePad(signatureCanvasTaller);
  const signatureModalTallerEl = document.getElementById('signatureModalTaller');
  const signatureModalTaller = new bootstrap.Modal(signatureModalTallerEl);

  signatureModalTallerEl.addEventListener('shown.bs.modal', () => {
    signatureCanvasTaller.width = signatureCanvasTaller.offsetWidth;
    signatureCanvasTaller.height = signatureCanvasTaller.offsetHeight;
    signaturePadTaller.clear();
  });
  
  document.getElementById('btnClearSignatureTaller').addEventListener('click', () => {
    signaturePadTaller.clear();
  });
  
  document.getElementById('btnSaveSignatureTaller').addEventListener('click', () => {
    if(signaturePadTaller.isEmpty()) {
      alert("Por favor, firma antes de guardar.");
    } else {
      const dataURL = signaturePadTaller.toDataURL();
      document.getElementById('signatureBoxTaller').innerHTML = `<img src="${dataURL}" alt="Firma digital del Taller" style="max-width: 100%;">`;
      signatureModalTaller.hide();
    }
  });
  
  const signatureBoxTaller = document.getElementById('signatureBoxTaller');
  if(signatureBoxTaller) {
    signatureBoxTaller.addEventListener('click', () => {
      signaturePadTaller.clear();
      signatureModalTaller.show();
    });
  }

  // -------------------------------------------------------
  // INICIALIZACIÓN FINAL
  // -------------------------------------------------------
  updateVehicleTab();
  recalcularTotal();
});
