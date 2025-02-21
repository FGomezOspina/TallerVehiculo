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
    combustible: 'Combustible'     // en %
  };

  // Referencias a elementos (pestaña Vehículo)
  const vehTitle = document.getElementById('vehTitle');
  const vehSubtitle = document.getElementById('vehSubtitle');
  const vehKilometrajeDisplay = document.getElementById('vehKilometrajeDisplay');
  const fuelProgress = document.getElementById('fuelProgress');

  // Botón "Editar" que abre el modal y el modal con sus campos
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

  // -------------------------------------------------------
  // FUNCIONES PARA VEHÍCULO
  // -------------------------------------------------------

  function updateVehicleTab() {
    vehTitle.textContent = `${vehicleData.marca} ${vehicleData.modelo}`;
    vehSubtitle.textContent = `${vehicleData.placa} - ${vehicleData.anio} - ${vehicleData.color}`;
    vehKilometrajeDisplay.textContent = vehicleData.kilometraje.toLocaleString() + ' Kms';
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
  // LÓGICA DE LA TABLA DE SERVICIOS
  // -------------------------------------------------------
  const tablaServicios = document.getElementById('tablaServicios');
  const agregarFilaBtn = document.getElementById('agregarFila');
  const totalServiciosEl = document.getElementById('totalServicios');

  function recalcularTotal() {
    let total = 0;
    const filas = tablaServicios.querySelectorAll('tbody tr');
    filas.forEach((fila) => {
      const inputs = fila.querySelectorAll('input');
      const cantidad = parseFloat(inputs[1].value) || 0;
      const precioU = parseFloat(inputs[2].value) || 0;
      const subtotal = cantidad * precioU;
      const subtotalCell = fila.querySelectorAll('td')[3];
      subtotalCell.textContent = `$${subtotal.toFixed(2)}`;
      total += subtotal;
    });
    totalServiciosEl.textContent = `$${total.toFixed(2)}`;
  }

  function agregarFila() {
    const tbody = tablaServicios.querySelector('tbody');
    const nuevaFila = document.createElement('tr');
    nuevaFila.innerHTML = `
      <td><input type="text" class="form-control" placeholder="Nuevo servicio" /></td>
      <td><input type="number" class="form-control" value="1" min="1" /></td>
      <td><input type="number" class="form-control" value="0" min="0" /></td>
      <td class="align-middle text-end">$0.00</td>
      <td class="text-center align-middle">
        <button class="btn btn-sm btn-danger eliminarFila">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(nuevaFila);
    recalcularTotal();
  }

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

  // Botón Guardar / Imprimir
  const btnGuardar = document.getElementById('btnGuardar');
  btnGuardar.addEventListener('click', () => {
    console.log('Datos guardados/impresión lista!');
    window.print();
  });

  // -------------------------------------------------------
  // LÓGICA DE PREVISUALIZACIÓN DE FOTOS
  // -------------------------------------------------------
  // Usaremos dos contenedores: uno para "Foto Antes" y otro para "Foto Después"
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
  // INICIALIZACIÓN
  // -------------------------------------------------------
  updateVehicleTab();
  recalcularTotal();
});
