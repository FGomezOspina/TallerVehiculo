document.addEventListener('DOMContentLoaded', function() {
  // -------------------------------------------------------
  // OBTENCIÓN DE LA SEDE
  // -------------------------------------------------------
  // Se obtiene la sede desde la URL o desde localStorage (valor por defecto "pereira")
  const urlParams = new URLSearchParams(window.location.search);
  const sede = urlParams.get('sede') || localStorage.getItem('sede') || 'pereira';
  // Si la sede viene en la URL, se guarda en localStorage para usarla en otras páginas
  if(urlParams.get('sede')) {
    localStorage.setItem('sede', urlParams.get('sede'));
  }

  // -------------------------------------------------------
  // OBTENCIÓN DEL ROL
  // -------------------------------------------------------
  // Se recupera el rol del localStorage; si no existe, se asume 'admin'
  const role = localStorage.getItem('role') || 'admin';

  // -------------------------------------------------------
  // AJUSTE DE LA VISTA (NAV Y TARJETAS) SEGÚN ROL
  // -------------------------------------------------------
  // Los elementos que solo deben verse para admin
  const elementosARestrigir = [
    'navProveedores',
    'navInventario',
    'navClientes',
    'cardProveedores',
    'cardInventario',
    'cardClientes'
  ];

  if (role === 'patio') {
    // Para usuarios tipo patio: ocultar elementos
    elementosARestrigir.forEach(id => {
      const elem = document.getElementById(id);
      if (elem) {
        elem.style.display = 'none';
      }
    });
  } else {
    // Para admin: asegurar que se muestren todos los elementos
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

  // -------------------------------------------------------
  // REFERENCIAS Y LÓGICA DE LA PESTAÑA VEHÍCULO
  // -------------------------------------------------------
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
    if (vehicleData) {
      vehTitle.textContent = `${vehicleData.marca} ${vehicleData.modelo}`;
      vehSubtitle.textContent = `${vehicleData.placa} - ${vehicleData.anio} - ${vehicleData.color}`;
      let kms = parseFloat(vehicleData.kilometraje) || 0;
      vehKilometrajeDisplay.textContent = kms.toLocaleString() + ' Kms';
      fuelProgress.style.width = vehicleData.combustible + '%';
      fuelProgress.setAttribute('aria-valuenow', vehicleData.combustible);
      fuelProgress.textContent = vehicleData.combustible + '%';
    }
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

    const selectElement = nuevaFila.querySelector('.product-select');
    populateProductSelect(selectElement);

    selectElement.addEventListener('change', function(e) {
      const selectedOption = e.target.options[e.target.selectedIndex];
      const precioBase = parseFloat(selectedOption.getAttribute('data-precio-base')) || 0;
      const priceInput = nuevaFila.querySelector('.price-input');
      priceInput.value = precioBase;
      recalcularTotal();
    });

    recalcularTotal();
  }

  tablaServicios.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT') {
      recalcularTotal();
    }
  });
  tablaServicios.addEventListener('click', (e) => {
    if (e.target.closest('.eliminarFila')) {
      const fila = e.target.closest('tr');
      fila.remove();
      recalcularTotal();
    }
  });
  agregarFilaBtn.addEventListener('click', agregarFila);

  // -------------------------------------------------------
  // LÓGICA DE PREVISUALIZACIÓN DE FOTOS (Múltiples)
  // -------------------------------------------------------
  const fotoAntesInput = document.getElementById('fotoAntes');
  const fotoDespuesInput = document.getElementById('fotoDespues');
  const previewFotosAntes = document.getElementById('previewFotosAntes');
  const previewFotosDespues = document.getElementById('previewFotosDespues');

  function showImageModal(imageSrc) {
    const modalOverlay = document.createElement('div');
    modalOverlay.style.position = 'fixed';
    modalOverlay.style.top = '0';
    modalOverlay.style.left = '0';
    modalOverlay.style.width = '100%';
    modalOverlay.style.height = '100%';
    modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    modalOverlay.style.display = 'flex';
    modalOverlay.style.justifyContent = 'center';
    modalOverlay.style.alignItems = 'center';
    modalOverlay.style.zIndex = '1050';

    const img = document.createElement('img');
    img.src = imageSrc;
    img.alt = "Imagen ampliada";
    img.style.maxWidth = '90%';
    img.style.maxHeight = '90%';
    img.style.border = '5px solid #fff';
    img.style.borderRadius = '8px';

    modalOverlay.appendChild(img);

    modalOverlay.addEventListener('click', function(e) {
      if(e.target === modalOverlay) {
        modalOverlay.remove();
      }
    });

    document.body.appendChild(modalOverlay);
  }

  function previewMultiple(input, container) {
    const files = input.files;
    if (files.length === 0) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = function(e) {
        const wrapper = document.createElement('div');
        wrapper.classList.add('image-preview');
        
        const img = document.createElement('img');
        img.src = e.target.result;
        img.alt = "Foto";
        img.addEventListener('click', () => {
          showImageModal(e.target.result);
        });
        
        const removeBtn = document.createElement('button');
        removeBtn.textContent = '×';
        removeBtn.classList.add('remove-btn');
        removeBtn.addEventListener('click', (event) => {
          event.stopPropagation();
          wrapper.remove();
        });
        
        wrapper.appendChild(img);
        wrapper.appendChild(removeBtn);
        container.appendChild(wrapper);
      };
      reader.readAsDataURL(file);
    });
    input.value = '';
  }

  fotoAntesInput.addEventListener('change', () => {
    previewMultiple(fotoAntesInput, previewFotosAntes);
  });
  fotoDespuesInput.addEventListener('change', () => {
    previewMultiple(fotoDespuesInput, previewFotosDespues);
  });

  // -------------------------------------------------------
  // TEMPARIO
  // -------------------------------------------------------

   // Cargar los servicios de tempario
   function loadTemparioServicios() {
    fetch('/getTempario')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.tempario)) {
          temparioServicios = data.tempario;
          populateTemparioSelect();
        }
      })
      .catch(err => console.error('Error al obtener tempario:', err));
  }

   // Poblar el select de servicios de tempario
   function populateTemparioSelect() {
    const selects = document.querySelectorAll('.tempario-select');
    selects.forEach(select => {
      select.innerHTML = '<option value="">Seleccione un servicio</option>';
      temparioServicios.forEach(servicio => {
        const option = document.createElement('option');
        option.value = servicio.id;
        option.textContent = servicio.descripcion;
        option.setAttribute('data-precio', servicio.precio);
        select.appendChild(option);
      });
    });
  }

  loadTemparioServicios(); // Llamada para cargar los servicios de tempario

  // Función para recalcular el total de la tabla de tempario
  function recalcularTotalTempario() {
    let total = 0;
    const filas = document.querySelectorAll('#temparioTableBody tr');
    filas.forEach((fila) => {
      const priceInput = fila.querySelector('.tempario-price');
      const precio = parseFloat(priceInput.value) || 0; // Usamos el precio editable
      total += precio; // Acumulamos el total
    });
    document.getElementById('totalTempario').textContent = `$${total.toFixed(2)}`; // Mostrar el total
  }



  // Función para agregar una nueva fila de tempario
  function agregarTemparioFila() {
    const tbody = document.getElementById('temparioTableBody');
    const nuevaFila = document.createElement('tr');
    nuevaFila.innerHTML = `
      <td>
        <select class="form-select tempario-select">
          <option value="">Seleccione un servicio</option>
        </select>
      </td>
      <td><input type="number" class="form-control tempario-price" value="0" min="0" /></td>
      <td class="text-center align-middle">
        <button class="btn btn-sm btn-danger tempario-eliminarFila">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(nuevaFila);

    // Poblar el select con los servicios de tempario
    populateTemparioSelect();

    // Manejar el cambio en el select de servicio
    nuevaFila.querySelector('.tempario-select').addEventListener('change', (e) => {
      const selectedOption = e.target.options[e.target.selectedIndex];
      const precio = parseFloat(selectedOption.getAttribute('data-precio')) || 0;
      nuevaFila.querySelector('.tempario-price').value = precio;
      recalcularTotalTempario(); // Recalcular el total cuando se seleccione un servicio
    });

    // Manejar el cambio en el precio editable
    nuevaFila.querySelector('.tempario-price').addEventListener('input', () => {
      recalcularTotalTempario(); // Recalcular el total cuando se modifique el precio
    });

    recalcularTotalTempario();
  }




  // Delegación para el botón "Eliminar" en cada fila de tempario
  document.getElementById('temparioTableBody').addEventListener('click', function(e) {
    if (e.target.classList.contains('tempario-eliminarFila')) {
      const fila = e.target.closest('tr');
      fila.remove();
      recalcularTotalTempario(); // Recalcular total después de eliminar una fila
    }
  });


  // Agregar una fila al hacer clic en el botón "Agregar Servicio"
  document.getElementById('agregarTemparioFila').addEventListener('click', agregarTemparioFila);

  // Función para obtener los temparios desde la tabla
  function obtenerTemparioDesdeTabla() {
    const temparioServicios = [];
    const filas = document.querySelectorAll('#temparioTableBody tr');
    filas.forEach((fila) => {
      const selectServicio = fila.querySelector('.tempario-select');
      const priceInput = fila.querySelector('.tempario-price');
      
      const tempario = {
        servicioId: selectServicio.value,
        servicioDescripcion: selectServicio.options[selectServicio.selectedIndex]?.text || '',
        precio: parseFloat(priceInput.value) || 0
      };
      temparioServicios.push(tempario);
    });
    return temparioServicios;
  }


  // -------------------------------------------------------
  // BUSCADOR DE CLIENTES Y SELECCIÓN DE VEHÍCULO
  // -------------------------------------------------------
  // Se filtran los clientes de acuerdo a la sede actual
  const clientSearchInput = document.getElementById('clientSearch');
  const btnClientSearch = document.getElementById('btnClientSearch');
  const searchResults = document.getElementById('searchResults');
  const clientVehicleSelectContainer = document.getElementById('clientVehicleSelectContainer');
  const clientVehicleSelect = document.getElementById('clientVehicleSelect');
  const noClientMessage = document.getElementById('noClientMessage');

  let currentClient = null;

  function searchClientes(query) {
    // Se añade el parámetro de sede a la petición
    fetch(`/clientes?sede=${sede}`)
      .then(response => response.json())
      .then(data => {
        searchResults.innerHTML = "";
        currentClient = null;
        clientVehicleSelectContainer.style.display = "none";
        noClientMessage.style.display = "none";
        if (data.success) {
          let resultados = data.clientes.filter(cliente => {
            const q = query.toLowerCase();
            const matchEmpresa = cliente.empresa.toLowerCase().includes(q);
            const matchNombre = cliente.nombre.toLowerCase().includes(q);
            const matchCedula = cliente.cedula.toLowerCase().includes(q);
            let matchPlaca = false;
            if (cliente.vehiculos && Array.isArray(cliente.vehiculos)) {
              cliente.vehiculos.forEach(v => {
                if (v.placa && v.placa.toLowerCase().includes(q)) {
                  matchPlaca = true;
                }
              });
            }
            return matchNombre || matchCedula || matchEmpresa || matchPlaca;
          });
          if (resultados.length === 0) {
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
              <p class="mb-1">Cédula: ${cliente.cedula} | Email: ${cliente.email}</p>
            `;
            item.addEventListener("click", () => {
              currentClient = cliente;
              searchResults.innerHTML = "";
              clientSearchInput.value = cliente.nombre;
              document.getElementById("clienteNombreDisplay").textContent = cliente.nombre;
              document.getElementById("clienteCedulaDisplay").textContent = cliente.cedula;
              document.getElementById("clienteTelefonoDisplay").textContent = cliente.telefono;
              document.getElementById("clienteEmpresaDisplay").textContent = cliente.empresa;
              
              // Si el cliente tiene vehículos
              if (cliente.vehiculos && cliente.vehiculos.length > 0) {
                if (cliente.vehiculos.length === 1) {
                  // Solo tiene un vehículo, se muestra la información directamente
                  vehicleData = cliente.vehiculos[0];
                  updateVehicleTab();
                  clientVehicleSelectContainer.style.display = "none"; // Ocultar la selección de vehículos
                } else {
                  // Tiene más de un vehículo, mostrar los vehículos en el select
                  clientVehicleSelect.innerHTML = "";
                  cliente.vehiculos.forEach((veh, idx) => {
                    const option = document.createElement("option");
                    option.value = idx;
                    option.textContent = `${veh.marca} ${veh.modelo} - ${veh.placa}`;
                    clientVehicleSelect.appendChild(option);
                  });
                  clientVehicleSelectContainer.style.display = "block"; // Mostrar la selección de vehículos
                  vehicleData = cliente.vehiculos[0]; // Seleccionamos el primer vehículo por defecto
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
  // IMPLEMENTACIÓN DE SIGNATURE PAD PARA FIRMAS
  // -------------------------------------------------------
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
  // FUNCIONALIDAD: GUARDAR TODOS LOS DATOS
  // -------------------------------------------------------
  function obtenerServiciosDesdeTabla() {
    const servicios = [];
    const filas = tablaServicios.querySelectorAll('tbody tr');
    filas.forEach((fila) => {
      const selectProducto = fila.querySelector('.product-select');
      const quantityInput = fila.querySelector('.quantity-input');
      const priceInput = fila.querySelector('.price-input');
      const subtotalCell = fila.querySelector('.subtotal-cell');
      
      const servicio = {
        productoId: selectProducto.value,
        productoNombre: selectProducto.options[selectProducto.selectedIndex]?.text || '',
        cantidad: parseFloat(quantityInput.value) || 0,
        precioUnitario: parseFloat(priceInput.value) || 0,
        subtotal: subtotalCell.textContent
      };
      servicios.push(servicio);
    });
    return servicios;
  }
  
  document.getElementById('btnGuardar').addEventListener('click', () => {
    const detalleData = {
      cliente: {
        nombre: document.getElementById("clienteNombreDisplay").textContent,
        cedula: document.getElementById("clienteCedulaDisplay").textContent,
        telefono: document.getElementById("clienteTelefonoDisplay").textContent,
        empresa: document.getElementById("clienteEmpresaDisplay").textContent
      },
      vehiculo: vehicleData,
      tempario: obtenerTemparioDesdeTabla(), // Aquí estamos obteniendo los temparios
      servicios: obtenerServiciosDesdeTabla(), // Aquí estamos obteniendo los productos/servicios
      descripcion: document.querySelector("textarea").value,
      fotos: {
        antes: Array.from(previewFotosAntes.querySelectorAll('img')).map(img => img.src),
        despues: Array.from(previewFotosDespues.querySelectorAll('img')).map(img => img.src)
      },
      firmas: {
        cliente: document.getElementById('signatureBoxCliente').querySelector('img') ? document.getElementById('signatureBoxCliente').querySelector('img').src : '',
        taller: document.getElementById('signatureBoxTaller').querySelector('img') ? document.getElementById('signatureBoxTaller').querySelector('img').src : ''
      },
      fecha: new Date().toISOString(),
      sede: sede
    };
  
    fetch('/guardarDetalle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(detalleData)
    })
    .then(response => response.json())
    .then(data => {
      if(data.success){
        alert("Detalle guardado correctamente con ID: " + data.id);
      } else {
        alert("Error guardando el detalle: " + data.error);
      }
    })
    .catch(err => {
      console.error("Error en la petición:", err);
      alert("Error al conectar con el servidor.");
    });
  });


  // -------------------------------------------------------
  // INICIALIZACIÓN FINAL
  // -------------------------------------------------------
  updateVehicleTab();
  recalcularTotal();
  loadInventory();

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
});
