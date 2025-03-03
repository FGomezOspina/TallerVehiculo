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
  
    // Función para actualizar únicamente el estado en la base de datos
    function updateEstado(nuevoEstado) {
      fetch(`/detallesVehiculo/${detalleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      })
      .then(response => response.json())
      .then(data => {
        if(data.success) {
          document.getElementById('estadoDisplay').textContent = nuevoEstado;
        } else {
          console.error("Error actualizando estado:", data.error);
        }
      })
      .catch(err => console.error("Error conectando para actualizar estado:", err));
    }
  
    // Cargar productos del inventario
    function loadInventory() {
      fetch('/productos')
        .then(response => response.json())
        .then(data => {
          if(data.success) {
            inventoryProducts = data.productos;
            // Poblar selects existentes (por ejemplo, la fila inicial de servicios)
            document.querySelectorAll('.product-select').forEach(select => {
              populateProductSelect(select);
            });
          } else {
            console.error("Error al cargar productos:", data.error);
          }
        })
        .catch(err => console.error(err));
    }
  
    // Función para poblar un select de producto
    function populateProductSelect(selectElement, selectedId = '') {
      selectElement.innerHTML = '<option value="">Seleccione un producto</option>';
      inventoryProducts.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = product.nombre || 'Sin nombre';
        option.setAttribute('data-precio-base', product.precio.precioBase || 0);
        if(product.id === selectedId) {
          option.selected = true;
        }
        selectElement.appendChild(option);
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
  
    // Recalcular totales de la tabla de servicios
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
  
    // Agregar una nueva fila a la tabla de servicios
    function agregarFila() {
      const tbody = document.querySelector('#tablaServicios tbody');
      const tr = document.createElement('tr');
      tr.innerHTML = `
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
      tbody.appendChild(tr);
      const select = tr.querySelector('.product-select');
      populateProductSelect(select);
      select.addEventListener('change', function(e) {
        const selectedOption = e.target.options[e.target.selectedIndex];
        const precioBase = parseFloat(selectedOption.getAttribute('data-precio-base')) || 0;
        tr.querySelector('.price-input').value = precioBase;
        recalcularTotal();
      });
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
          if(data.success) {
            const detalle = data.detalle;
            loadedDetail = detalle;
            // Cargar datos del cliente
            clientData = detalle.cliente || {};
            document.getElementById('clienteNombreDisplay').textContent = clientData.nombre || '';
            document.getElementById('clienteCedulaDisplay').textContent = clientData.cedula || '';
            document.getElementById('clienteTelefonoDisplay').textContent = clientData.telefono || '';
            // Cargar datos del vehículo
            vehicleData = detalle.vehiculo || {};
            updateVehicleTab();
            // Cargar descripción
            document.getElementById('descripcionVehiculo').value = detalle.descripcion || '';
            // Cargar la tabla de servicios
            if(detalle.servicios && Array.isArray(detalle.servicios)) {
              const tbody = document.querySelector('#tablaServicios tbody');
              tbody.innerHTML = '';
              detalle.servicios.forEach(servicio => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                  <td>
                    <select class="form-select product-select">
                      <option value="">Seleccione un producto</option>
                    </select>
                  </td>
                  <td><input type="number" class="form-control quantity-input" value="${servicio.cantidad}" min="1" /></td>
                  <td><input type="number" class="form-control price-input" value="${servicio.precioUnitario}" min="0" readonly /></td>
                  <td class="align-middle text-end subtotal-cell">$0.00</td>
                  <td class="text-center align-middle">
                    <button class="btn btn-sm btn-danger eliminarFila">
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                `;
                tbody.appendChild(tr);
                const select = tr.querySelector('.product-select');
                populateProductSelect(select, servicio.productoId);
                select.addEventListener('change', function(e) {
                  const selectedOption = e.target.options[e.target.selectedIndex];
                  const precioBase = parseFloat(selectedOption.getAttribute('data-precio-base')) || 0;
                  tr.querySelector('.price-input').value = precioBase;
                  recalcularTotal();
                });
              });
              recalcularTotal();
            }
            // Cargar fotos
            const previewAntes = document.getElementById('previewFotosAntes');
            previewAntes.innerHTML = '';
            if(detalle.fotos && detalle.fotos.antes) {
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
            const previewDespues = document.getElementById('previewFotosDespues');
            previewDespues.innerHTML = '';
            if(detalle.fotos && detalle.fotos.despues) {
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
            // Cargar firmas
            const signatureClienteBox = document.getElementById('signatureBoxCliente');
            signatureClienteBox.innerHTML = '';
            if(detalle.firmas && detalle.firmas.cliente) {
              signatureClienteBox.innerHTML = `<img src="${detalle.firmas.cliente}" alt="Firma Cliente" style="max-width: 100%;">`;
            }
            const signatureTallerBox = document.getElementById('signatureBoxTaller');
            signatureTallerBox.innerHTML = '';
            if(detalle.firmas && detalle.firmas.taller) {
              signatureTallerBox.innerHTML = `<img src="${detalle.firmas.taller}" alt="Firma Taller" style="max-width: 100%;">`;
            }
            // Mostrar estado del informe y restringir edición si está cerrado
            if(detalle.estado && detalle.estado === 'Cerrado'){
              document.getElementById('estadoDisplay').textContent = 'Cerrado';
              document.querySelectorAll('input, select, textarea, button').forEach(el => {
                if(el.id !== 'btnImprimir' && el.id !== 'btnVer'){
                  el.setAttribute('disabled', 'disabled');
                }
              });
              const mensaje = document.createElement('div');
              mensaje.className = 'alert alert-info mt-3';
              mensaje.textContent = 'Este informe está cerrado y no puede ser editado.';
              document.querySelector('.container').prepend(mensaje);
            } else {
              // Si no es Cerrado, lo mostramos como Abierto
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
  
    // Evento para actualizar el detalle (PUT)
    document.getElementById('btnActualizar').addEventListener('click', () => {
      const updatedDetalle = {
        cliente: {
          nombre: document.getElementById('clienteNombreDisplay').textContent,
          cedula: document.getElementById('clienteCedulaDisplay').textContent,
          telefono: document.getElementById('clienteTelefonoDisplay').textContent
        },
        vehiculo: vehicleData, // Se asume que vehicleData se actualiza mediante la edición de la pestaña Vehículo
        descripcion: document.getElementById('descripcionVehiculo').value,
        servicios: obtenerServiciosDesdeTabla(),
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
  
    // Evento para cerrar el informe (cambiar estado a "Cerrado")
    // Este botón debe existir en el HTML con id "btnCerrar"
    document.getElementById('btnCerrar').addEventListener('click', () => {
      if(confirm("¿Estás seguro de que deseas cerrar este informe?")) {
        fetch(`/detallesVehiculo/${detalleId}/cerrar`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ estado: 'Cerrado' })
        })
        .then(response => response.json())
        .then(data => {
          if(data.success) {
            alert("El informe se ha cerrado correctamente.");
            // Deshabilitar controles para evitar futuras ediciones
            document.querySelectorAll('input, select, textarea, button').forEach(el => {
              if(el.id !== 'btnImprimir' && el.id !== 'btnVer'){
                el.setAttribute('disabled', 'disabled');
              }
            });
            document.getElementById('estadoDisplay').textContent = 'Cerrado';
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
  
    // Inicializar
    loadInventory();
    loadDetalle();
});
