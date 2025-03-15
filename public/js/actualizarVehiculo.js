document.addEventListener('DOMContentLoaded', function() {
  // Obtener el ID del detalle a actualizar desde la URL (por ejemplo: actualizarVehiculo.html?detalleId=abc123)
  const urlParams = new URLSearchParams(window.location.search);
  const detalleId = urlParams.get('detalleId');
  if (!detalleId) {
    alert("No se proporcionó el ID del detalle vehicular.");
    return;
  }

  // Variables globales
  let vehicleData = {
    marca: '',
    modelo: '',
    anio: 0,
    color: '',
    placa: '',
    kilometraje: 0,
    combustible: 0
  };

  let clientData = {};
  let inventoryProducts = [];
  let loadedDetail = null; // Guardará el documento cargado
  let temparioServicios = [];

  // -------------------------------------------------------
  // OBTENCIÓN DE LA SEDE Y ROL
  // -------------------------------------------------------
  const sede = localStorage.getItem('sede') || 'pereira';
  const role = localStorage.getItem('role') || 'admin'; // Obtener el rol

  // -------------------------------------------------------
  // AJUSTAR VISIBILIDAD DEL NAV Y LOGO SEGÚN EL ROL
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

    // Además, si en actualizarVehiculo se quiere ocultar la tabla de tempario:
    const temparioTableContainer = document.getElementById('temparioTableContainer');
    if (temparioTableContainer) {
      temparioTableContainer.style.display = 'none';
    }
  } else {
    // Para admin: asegurar que se muestren todos los elementos
    elementosARestrigir.forEach(id => {
      const elem = document.getElementById(id);
      if (elem) {
        elem.style.display = '';
      }
    });
    // Se muestra la tabla de tempario
    const temparioTableContainer = document.getElementById('temparioTableContainer');
    if (temparioTableContainer) {
      temparioTableContainer.style.display = '';
    }
    // Llamamos a la función para cargar los servicios de tempario
    loadTemparioServicios();
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
  // FUNCIONES PARA ACTUALIZAR VEHÍCULO Y CARGAR DATOS
  // -------------------------------------------------------
  // Función para actualizar únicamente el estado en la base de datos

  // 1) Carga de los servicios desde el backend
  function loadTemparioServicios() {
    return fetch('/getTempario')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.tempario)) {
          temparioServicios = data.tempario;
          return temparioServicios;
        }
      })
      .catch(err => {
        console.error('Error al obtener tempario:', err);
        return [];
      });
  }
  

  // 2) Función para popular el <select> y activar Select2
  // Función para popular el <select> y activar Select2
  function populateTemparioSelect(selectElement, selectedId = '') {
    const $select = $(selectElement);
    $select.empty().append('<option value="">Seleccione un servicio</option>');

    // Recorres tu array global de servicios
    temparioServicios.forEach(servicio => {
      const $option = $('<option>')
        .val(servicio.id)
        .text(servicio.descripcion)
        .attr('data-precio', servicio.precio); // Aquí es donde asignamos el precio

      // Verificar que el precio se está asignando correctamente
      //console.log('Servicio ID:', servicio.id);
      //console.log('Servicio Descripción:', servicio.descripcion);
      //console.log('Precio Asignado:', servicio.precio);

      if (servicio.id === selectedId) {
        $option.prop('selected', true);
      }

      $select.append($option);
    });

    // Inicializas Select2
    $select.select2({
      placeholder: 'Seleccione un servicio',
      allowClear: true
    });
  }
    
  
  

  
  // 3) Recalcular total de Tempario
  function recalcularTotalTempario() {
    let total = 0;
    const filas = document.querySelectorAll('#temparioTableBody tr');
  
    filas.forEach(fila => {
      const priceInput = fila.querySelector('.tempario-price');
      const precio = parseFloat(priceInput.value) || 0;
      total += precio;
    });
  
    document.getElementById('totalTempario').textContent = `$${total.toFixed(2)}`;
  }
  
  
  
  // 4) Agregar una nueva fila a la tabla de Tempario
  function agregarTemparioFila() {
    const tbody = document.getElementById('temparioTableBody');
    const nuevaFila = document.createElement('tr');
    nuevaFila.innerHTML = `
      <td>
        <select class="form-select tempario-select">
          <option value="">Seleccione un servicio</option>
        </select>
      </td>
      <td>
        <input type="number" class="form-control tempario-price" value="0" min="0" />
      </td>
      <td class="text-center align-middle">
        <button class="btn btn-sm btn-danger tempario-eliminarFila">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(nuevaFila);
  
    // Poblar el select con los servicios de tempario
    const newSelect = nuevaFila.querySelector('.tempario-select');
    temparioServicios.forEach(servicio => {
      const option = document.createElement('option');
      option.value = servicio.id;
      option.textContent = servicio.descripcion;
      option.setAttribute('data-precio', servicio.precio);
      newSelect.appendChild(option);
    });
  
    // Inicializar Select2 para el nuevo select
    $(newSelect).select2({
      placeholder: "Seleccione un servicio",
      allowClear: true
    });
  
    // Manejar el cambio en el select de servicio para actualizar el precio
    $(newSelect).on('change', function () {
      const selectedOption = this.options[this.selectedIndex];
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
  
  
  

  function obtenerTemparioDesdeTabla() {
    const temparioGuardado = [];
    const filas = document.querySelectorAll('#temparioTableBody tr');
  
    filas.forEach(fila => {
      const select = fila.querySelector('.tempario-select');
      const priceInput = fila.querySelector('.tempario-price');
  
      const servicioId = select.value;
      const servicioDescripcion = select.options[select.selectedIndex]?.text || '';
      const precio = parseFloat(priceInput.value) || 0;
  
      // Empujar al array final
      temparioGuardado.push({
        servicioId,
        servicioDescripcion,
        precio
      });
    });
  
    return temparioGuardado;
  }
  
  
  document.getElementById('temparioTableBody').addEventListener('click', function(e) {
    const deleteBtn = e.target.closest('.tempario-eliminarFila');
    if (deleteBtn) {
      const fila = deleteBtn.closest('tr');
      fila.remove();
      recalcularTotalTempario();
    }
  });
  
  // Ejemplo al cargar cada item de tempario
  function cargarTemparioGuardado(temparioArray) {
    const tbody = document.getElementById('temparioTableBody');
    tbody.innerHTML = ''; // Limpio filas previas
  
    temparioArray.forEach(item => {
      // Crear la fila
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>
          <select class="form-select tempario-select">
            <option value="">Seleccione un servicio</option>
          </select>
        </td>
        <td>
          <input type="number" class="form-control tempario-price" value="${item.precio || 0}" min="0" />
        </td>
        <td class="text-center align-middle">
          <button class="btn btn-sm btn-danger tempario-eliminarFila">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `;
      tbody.appendChild(fila);
  
      // Poblar el <select> con todos los servicios, marcando como seleccionado el que corresponda
      const select = fila.querySelector('.tempario-select');
      // <-- Fíjate que paso "item.servicioId"
      populateTemparioSelect(select, item.servicioId);
  
      // Al cambiar el select, poner el precio en el input
      select.addEventListener('change', function(e) {
        const selectedOption = e.target.options[e.target.selectedIndex];
        const precio = parseFloat(selectedOption.getAttribute('data-precio')) || 0;
        fila.querySelector('.tempario-price').value = precio;
        recalcularTotalTempario();
      });
  
      // Al cambiar manualmente el input de precio
      fila.querySelector('.tempario-price').addEventListener('input', () => {
        recalcularTotalTempario();
      });
  
      // Eliminar fila
      fila.querySelector('.tempario-eliminarFila').addEventListener('click', () => {
        fila.remove();
        recalcularTotalTempario();
      });
    });
  
    // Finalmente recalcular
    recalcularTotalTempario();
  }
  

  // 1) Cargar productos del inventario
  function loadInventory() {
    return fetch('/productos')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          inventoryProducts = data.productos;
          // Poblar los selects existentes (si ya hay filas en la tabla)
          document.querySelectorAll('.product-select').forEach(select => {
            populateProductSelect(select);
          });
        } else {
          console.error("Error al cargar productos:", data.error);
        }
      })
      .catch(err => {
        console.error("Error al cargar productos:", err);
      });
  }

  // 2) Función para poblar un select de producto e inicializarlo con Select2
  function populateProductSelect(selectElement, selectedId = '') {
    // Convertimos el select en un objeto jQuery
    const $select = $(selectElement);
  
    // Limpiamos opciones anteriores y agregamos la opción "Seleccione un producto"
    $select.empty().append('<option value="">Seleccione un producto</option>');
  
    // Recorremos los productos y creamos opciones
    inventoryProducts.forEach(product => {
      const $option = $('<option>')
        .val(product.id)
        .text(product.nombre || 'Sin nombre')
        .attr('data-precio-base', product.precio?.precioBase || 0);
  
      // Si el producto coincide con selectedId, lo marcamos seleccionado
      if (product.id === selectedId) {
        $option.prop('selected', true);
      }
  
      $select.append($option);
    });
  
    // Inicializamos Select2 en este <select>
    $select.select2({
      placeholder: 'Seleccione un producto',
      allowClear: true
    });
  }
  
  

  // Actualizar la pestaña Vehículo con los datos actuales
  function updateVehicleTab() {
    document.getElementById('vehTitle').textContent = `${vehicleData.marca} ${vehicleData.modelo}`;
    document.getElementById('vehSubtitle').textContent = `${vehicleData.placa} - ${vehicleData.anio} - ${vehicleData.color}`;
    let kms = parseFloat(vehicleData.kilometraje) || 0;
    document.getElementById('vehKilometrajeDisplay').textContent = kms.toLocaleString() + ' Kms';
    const fuelProgress = document.getElementById('fuelProgress');
    fuelProgress.style.width = vehicleData.combustible + '%';
    fuelProgress.setAttribute('aria-valuenow', vehicleData.combustible);
    fuelProgress.textContent = vehicleData.combustible + '%';
  }

  // 3) Recalcular totales de la tabla de servicios
  function recalcularTotal() {
    let total = 0;
    document.querySelectorAll('#tablaServicios tbody tr').forEach(row => {
      const qty = parseFloat(row.querySelector('.quantity-input').value) || 0;
      const price = parseFloat(row.querySelector('.price-input').value) || 0;
      const subtotal = qty * price;
      row.querySelector('.subtotal-cell').textContent = `$${subtotal.toFixed(2)}`;
      total += subtotal;
    });
    document.getElementById('totalServicios').textContent = `$${total.toFixed(2)}`;
  }
  
  

  // 4) Agregar una nueva fila a la tabla de servicios
  function agregarFila() {
    const tbody = tablaServicios.querySelector('tbody');
    const nuevaFila = document.createElement('tr');
    nuevaFila.innerHTML = `
      <td>
        <select class="form-select product-select select2">
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
  
    // Inicializar Select2 para el nuevo select
    $(selectElement).select2({
      placeholder: "Seleccione un producto",
      allowClear: true
    });
  
    // Manejar el cambio en el select de producto para actualizar el precio
    $(selectElement).on('change', function() {
      const selectedValue = $(this).val();  // Usamos Select2 para obtener el valor seleccionado
      const selectedOption = $(this).find(`option[value="${selectedValue}"]`);
      const precioBase = parseFloat(selectedOption.attr('data-precio-base')) || 0;
  
      // Asignamos el precio al campo de precio
      const priceInput = nuevaFila.querySelector('.price-input');
      priceInput.value = precioBase;
  
      // Recalcular el total cuando se seleccione un producto
      recalcularTotal();
    });
  
    // Recalcular el total después de agregar la fila
    recalcularTotal();
  }
  
  
  


  // Delegar eliminación de filas en la tabla de servicios
  document.querySelector('#tablaServicios tbody').addEventListener('click', (e) => {
    if(e.target.closest('.eliminarFila')) {
      e.target.closest('tr').remove();
      recalcularTotal();
    }
  });

  document.getElementById('agregarFila').addEventListener('click', agregarFila);

  // Funciones para previsualizar fotos (múltiples)
  function previewMultiple(input, container) {
    const files = input.files;
    if(files.length === 0) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = function(e) {
        const wrapper = document.createElement('div');
        wrapper.classList.add('image-preview');
        const img = document.createElement('img');
        img.src = e.target.result;
        img.alt = "Foto";
        img.addEventListener('click', () => showImageModal(e.target.result));
        const removeBtn = document.createElement('button');
        removeBtn.textContent = '×';
        removeBtn.classList.add('remove-btn');
        removeBtn.addEventListener('click', (ev) => {
          ev.stopPropagation();
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

  function showImageModal(src) {
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
    img.src = src;
    img.style.maxWidth = '90%';
    img.style.maxHeight = '90%';
    img.style.border = '5px solid #fff';
    img.style.borderRadius = '8px';
    modalOverlay.appendChild(img);
    modalOverlay.addEventListener('click', (e) => {
      if(e.target === modalOverlay) modalOverlay.remove();
    });
    document.body.appendChild(modalOverlay);
  }

  document.getElementById('fotoAntes').addEventListener('change', () => {
    previewMultiple(document.getElementById('fotoAntes'), document.getElementById('previewFotosAntes'));
  });
  document.getElementById('fotoDespues').addEventListener('change', () => {
    previewMultiple(document.getElementById('fotoDespues'), document.getElementById('previewFotosDespues'));
  });

  // Implementación de SignaturePad para firmas
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
  document.getElementById('btnClearSignatureCliente').addEventListener('click', () => signaturePadCliente.clear());
  document.getElementById('btnSaveSignatureCliente').addEventListener('click', () => {
    if(signaturePadCliente.isEmpty()){
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
  document.getElementById('btnClearSignatureTaller').addEventListener('click', () => signaturePadTaller.clear());
  document.getElementById('btnSaveSignatureTaller').addEventListener('click', () => {
    if(signaturePadTaller.isEmpty()){
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

  // Función para extraer los servicios desde la tabla
  function obtenerServiciosDesdeTabla() {
    const servicios = [];
    document.querySelectorAll('#tablaServicios tbody tr').forEach(row => {
      const select = row.querySelector('.product-select');
      const qty = parseFloat(row.querySelector('.quantity-input').value) || 0;
      const price = parseFloat(row.querySelector('.price-input').value) || 0;
      const subtotal = row.querySelector('.subtotal-cell').textContent;
      servicios.push({
        productoId: select.value,
        productoNombre: select.options[select.selectedIndex]?.text || '',
        cantidad: qty,
        precioUnitario: price,
        subtotal: subtotal
      });
    });
    return servicios;
  }

  // Cargar el detalle existente desde el servidor mediante GET /detallesVehiculo/:id
  function loadDetalle() {
    fetch(`/detallesVehiculo/${detalleId}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          const detalle = data.detalle;
          loadedDetail = detalle;
  
          // Cargar datos del cliente
          clientData = detalle.cliente || {};
          document.getElementById('clienteNombreDisplay').textContent = clientData.nombre || '';
          document.getElementById('clienteCedulaDisplay').textContent = clientData.cedula || '';
          document.getElementById('clienteTelefonoDisplay').textContent = clientData.telefono || '';
          document.getElementById('clienteEmpresaDisplay').textContent = clientData.empresa || '';
  
          // Cargar datos del vehículo
          vehicleData = detalle.vehiculo || {};
          updateVehicleTab();
  
          // Cargar descripción
          document.getElementById('descripcionVehiculo').value = detalle.descripcion || '';
  
          // ===============================
          //  CARGAR TABLA DE SERVICIOS
          // ===============================
          if (detalle.servicios && Array.isArray(detalle.servicios)) {
            const tbody = document.querySelector('#tablaServicios tbody');
            tbody.innerHTML = ''; // Limpiar contenido previo
  
            detalle.servicios.forEach(servicio => {
              const tr = document.createElement('tr');
              tr.innerHTML = `
                <td>
                  <select class="form-select product-select">
                    <option value="">Seleccione un producto</option>
                  </select>
                </td>
                <td>
                  <input type="number" class="form-control quantity-input" value="${servicio.cantidad}" min="1" />
                </td>
                <td>
                  <input type="number" class="form-control price-input" value="${servicio.precioUnitario}" min="0" readonly />
                </td>
                <td class="align-middle text-end subtotal-cell">$0.00</td>
                <td class="text-center align-middle">
                  <button class="btn btn-sm btn-danger eliminarFila">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              `;
              tbody.appendChild(tr);
  
              // Usar tu función populateProductSelect() para inicializar el select con Select2
              const select = tr.querySelector('.product-select');
              populateProductSelect(select, servicio.productoId);
  
              // Evento: cambiar de producto => actualizar precio base y recalcular
              select.addEventListener('change', function(e) {
                const selectedOption = e.target.options[e.target.selectedIndex];
                const precioBase = parseFloat(selectedOption.getAttribute('data-precio-base')) || 0;
                tr.querySelector('.price-input').value = precioBase;
                recalcularTotal();
              });
  
              // Evento: cambiar cantidad => recalcular
              // Delegación de eventos para manejar cambios en la cantidad
              tablaServicios.querySelector('tbody').addEventListener('input', function(e) {
                if (e.target && e.target.classList.contains('quantity-input')) {
                  recalcularTotal(); // Recalcular el total cuando cambie la cantidad
                }
              });

  
              // Evento: eliminar fila
              tr.querySelector('.eliminarFila').addEventListener('click', () => {
                tr.remove();
                recalcularTotal();
              });
            });
  
            // Recalcular total después de cargar todas las filas
            recalcularTotal();
          }
  
          // ===============================
          //  CARGAR TEMPARIO GUARDADO
          // ===============================
          if (detalle.tempario && Array.isArray(detalle.tempario)) {
            cargarTemparioGuardado(detalle.tempario);
          }
  
          // ===============================
          //  CARGAR FOTOS ANTES
          // ===============================
          const previewAntes = document.getElementById('previewFotosAntes');
          previewAntes.innerHTML = '';
          if (detalle.fotos && detalle.fotos.antes) {
            detalle.fotos.antes.forEach(src => {
              const wrapper = document.createElement('div');
              wrapper.classList.add('image-preview');
  
              const img = document.createElement('img');
              img.src = src;
              img.alt = "Foto Antes";
              img.addEventListener('click', () => showImageModal(src));
  
              const removeBtn = document.createElement('button');
              removeBtn.textContent = '×';
              removeBtn.classList.add('remove-btn');
              removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                wrapper.remove();
              });
  
              wrapper.appendChild(img);
              wrapper.appendChild(removeBtn);
              previewAntes.appendChild(wrapper);
            });
          }
  
          // ===============================
          //  CARGAR FOTOS DESPUÉS
          // ===============================
          const previewDespues = document.getElementById('previewFotosDespues');
          previewDespues.innerHTML = '';
          if (detalle.fotos && detalle.fotos.despues) {
            detalle.fotos.despues.forEach(src => {
              const wrapper = document.createElement('div');
              wrapper.classList.add('image-preview');
  
              const img = document.createElement('img');
              img.src = src;
              img.alt = "Foto Después";
              img.addEventListener('click', () => showImageModal(src));
  
              const removeBtn = document.createElement('button');
              removeBtn.textContent = '×';
              removeBtn.classList.add('remove-btn');
              removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                wrapper.remove();
              });
  
              wrapper.appendChild(img);
              wrapper.appendChild(removeBtn);
              previewDespues.appendChild(wrapper);
            });
          }
  
          // ===============================
          //  CARGAR FIRMAS
          // ===============================
          const signatureClienteBox = document.getElementById('signatureBoxCliente');
          signatureClienteBox.innerHTML = '';
          if (detalle.firmas && detalle.firmas.cliente) {
            signatureClienteBox.innerHTML = `<img src="${detalle.firmas.cliente}" alt="Firma Cliente" style="max-width: 100%;">`;
          }
  
          const signatureTallerBox = document.getElementById('signatureBoxTaller');
          signatureTallerBox.innerHTML = '';
          if (detalle.firmas && detalle.firmas.taller) {
            signatureTallerBox.innerHTML = `<img src="${detalle.firmas.taller}" alt="Firma Taller" style="max-width: 100%;">`;
          }
  
          // ===============================
          //  ESTADO DEL INFORME
          // ===============================
          if (detalle.estado && detalle.estado === 'Cerrado') {
            document.getElementById('estadoDisplay').textContent = 'Cerrado';
            // Deshabilitar elementos de edición, excepto los de impresión/ver
            document.querySelectorAll('input, select, textarea, button').forEach(el => {
              if (el.id !== 'btnImprimir' && el.id !== 'btnVer') {
                el.setAttribute('disabled', 'disabled');
              }
            });
            // Mensaje de estado
            const mensaje = document.createElement('div');
            mensaje.className = 'alert alert-info mt-3';
            mensaje.textContent = 'Este informe está cerrado y no puede ser editado.';
            document.querySelector('.container').prepend(mensaje);
          } else {
            // Si no está "Cerrado", lo mostramos como "Abierto"
            document.getElementById('estadoDisplay').textContent = 'Abierto';
          }
  
        } else {
          alert("Error al cargar el detalle.");
        }
      })
      .catch(err => {
        console.error(err);
        alert("Error al conectar con el servidor.");
      });
  }
  
  

  document.getElementById('agregarTemparioFila').addEventListener('click', agregarTemparioFila);

  

  // Evento para actualizar el detalle (PUT)
  document.getElementById('btnActualizar').addEventListener('click', () => {
    const updatedDetalle = {
      cliente: {
        nombre: document.getElementById('clienteNombreDisplay').textContent,
        cedula: document.getElementById('clienteCedulaDisplay').textContent,
        telefono: document.getElementById('clienteTelefonoDisplay').textContent,
        empresa: document.getElementById('clienteEmpresaDisplay').textContent
      },
      vehiculo: vehicleData, // Se asume que vehicleData se actualiza mediante la edición de la pestaña Vehículo
      descripcion: document.getElementById('descripcionVehiculo').value,
      servicios: obtenerServiciosDesdeTabla(),
      tempario: obtenerTemparioDesdeTabla(),
      fotos: {
        antes: Array.from(document.getElementById('previewFotosAntes').querySelectorAll('img')).map(img => img.src),
        despues: Array.from(document.getElementById('previewFotosDespues').querySelectorAll('img')).map(img => img.src)
      },
      firmas: {
        cliente: document.getElementById('signatureBoxCliente').querySelector('img') ? document.getElementById('signatureBoxCliente').querySelector('img').src : '',
        taller: document.getElementById('signatureBoxTaller').querySelector('img') ? document.getElementById('signatureBoxTaller').querySelector('img').src : ''
      },
      fecha: new Date().toISOString()
    };

    fetch(`/detallesVehiculo/${detalleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedDetalle)
    })
    .then(response => response.json())
    .then(data => {
      if(data.success) {
        alert("Detalle actualizado correctamente");
        window.location.href = '/historialVehicular.html';
      } else {
        alert("Error al actualizar: " + data.error);
      }
    })
    .catch(err => {
      console.error(err);
      alert("Error al conectar con el servidor.");
    });
  });


  // Inicializar
  loadInventory();
  loadTemparioServicios().then(() => {
    loadDetalle();
  });  
});
