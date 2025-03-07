document.addEventListener('DOMContentLoaded', function() {
  // ---------------------------------------------------------
  // OBTENCIÓN DE LA SEDE Y ROL
  // ---------------------------------------------------------
  const sede = localStorage.getItem('sede') || 'pereira';
  const role = localStorage.getItem('role') || 'admin'; // Obtener el rol

  // ---------------------------------------------------------
  // LÓGICA DE LA TABLA DE REPORTES (OT / MITTO)
  // ---------------------------------------------------------
  const tablaReportes = document.getElementById('tablaReportes');
  const agregarReporteBtn = document.getElementById('agregarReporte');

  function agregarReporte() {
    const tbody = tablaReportes.querySelector('tbody');
    const numFila = tbody.querySelectorAll('tr').length + 1; // índice
    const nuevaFila = document.createElement('tr');
    nuevaFila.innerHTML = `
      <td class="align-middle text-center">${numFila}</td>
      <td><textarea class="form-control" rows="2"></textarea></td>
      <td><input type="text" class="form-control" /></td>
      <td><textarea class="form-control" rows="2"></textarea></td>
      <td><textarea class="form-control" rows="2"></textarea></td>
      <td><input type="text" class="form-control" placeholder="S/N" /></td>
      <td><textarea class="form-control" rows="2"></textarea></td>
      <td class="text-center align-middle">
        <button class="btn btn-sm btn-danger eliminarReporte">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(nuevaFila);
  }

  function eliminarReporte(e) {
    if (e.target.closest('.eliminarReporte')) {
      const fila = e.target.closest('tr');
      fila.remove();
      // Reindexar filas para mantener la numeración
      const filas = tablaReportes.querySelectorAll('tbody tr');
      filas.forEach((tr, index) => {
        tr.querySelector('td').textContent = index + 1;
      });
    }
  }

  // Evento: agregar reporte
  agregarReporteBtn.addEventListener('click', agregarReporte);

  // Evento: eliminar reporte
  tablaReportes.addEventListener('click', eliminarReporte);

  // ---------------------------------------------------------
  // LÓGICA DE LA TABLA DE SERVICIOS (cálculo de costos)
  // ---------------------------------------------------------
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

  tablaServicios.addEventListener('input', function(e) {
    if (e.target.tagName === 'INPUT') {
      recalcularTotal();
    }
  });
  tablaServicios.addEventListener('click', eliminarFila);
  agregarFilaBtn.addEventListener('click', agregarFila);

  // ---------------------------------------------------------
  // BOTÓN GUARDAR / IMPRIMIR
  // ---------------------------------------------------------
  const btnGuardar = document.getElementById('btnGuardar');
  btnGuardar.addEventListener('click', () => {
    console.log('Datos listos para guardar o imprimir...');
    window.print();
  });

  // Inicialización
  recalcularTotal();

  // ---------------------------------------------------------
  // SIGNATURE PAD: Implementación para firmas (Ejecutor y Recibe)
  // ---------------------------------------------------------
  // Firma del Ejecutor
  const signatureCanvasEjecutor = document.getElementById('signatureCanvasEjecutor');
  signatureCanvasEjecutor.width = signatureCanvasEjecutor.offsetWidth;
  signatureCanvasEjecutor.height = signatureCanvasEjecutor.offsetHeight;
  const signaturePadEjecutor = new SignaturePad(signatureCanvasEjecutor);
  const signatureModalEjecutorEl = document.getElementById('signatureModalEjecutor');
  const signatureModalEjecutor = new bootstrap.Modal(signatureModalEjecutorEl);

  signatureModalEjecutorEl.addEventListener('shown.bs.modal', () => {
    signatureCanvasEjecutor.width = signatureCanvasEjecutor.offsetWidth;
    signatureCanvasEjecutor.height = signatureCanvasEjecutor.offsetHeight;
    signaturePadEjecutor.clear();
  });
  
  document.getElementById('btnClearSignatureEjecutor').addEventListener('click', () => {
    signaturePadEjecutor.clear();
  });
  
  document.getElementById('btnSaveSignatureEjecutor').addEventListener('click', () => {
    if(signaturePadEjecutor.isEmpty()) {
      alert("Por favor, firma antes de guardar.");
    } else {
      const dataURL = signaturePadEjecutor.toDataURL();
      document.getElementById('signatureBoxEjecutor').innerHTML = `<img src="${dataURL}" alt="Firma digital del Ejecutor" style="max-width: 100%;">`;
      signatureModalEjecutor.hide();
    }
  });
  
  const signatureBoxEjecutor = document.getElementById('signatureBoxEjecutor');
  if(signatureBoxEjecutor) {
    signatureBoxEjecutor.addEventListener('click', () => {
      signaturePadEjecutor.clear();
      signatureModalEjecutor.show();
    });
  }

  // Firma de Recibe
  const signatureCanvasRecibe = document.getElementById('signatureCanvasRecibe');
  signatureCanvasRecibe.width = signatureCanvasRecibe.offsetWidth;
  signatureCanvasRecibe.height = signatureCanvasRecibe.offsetHeight;
  const signaturePadRecibe = new SignaturePad(signatureCanvasRecibe);
  const signatureModalRecibeEl = document.getElementById('signatureModalRecibe');
  const signatureModalRecibe = new bootstrap.Modal(signatureModalRecibeEl);

  signatureModalRecibeEl.addEventListener('shown.bs.modal', () => {
    signatureCanvasRecibe.width = signatureCanvasRecibe.offsetWidth;
    signatureCanvasRecibe.height = signatureCanvasRecibe.offsetHeight;
    signaturePadRecibe.clear();
  });
  
  document.getElementById('btnClearSignatureRecibe').addEventListener('click', () => {
    signaturePadRecibe.clear();
  });
  
  document.getElementById('btnSaveSignatureRecibe').addEventListener('click', () => {
    if(signaturePadRecibe.isEmpty()) {
      alert("Por favor, firma antes de guardar.");
    } else {
      const dataURL = signaturePadRecibe.toDataURL();
      document.getElementById('signatureBoxRecibe').innerHTML = `<img src="${dataURL}" alt="Firma digital del Recibe" style="max-width: 100%;">`;
      signatureModalRecibe.hide();
    }
  });
  
  const signatureBoxRecibe = document.getElementById('signatureBoxRecibe');
  if(signatureBoxRecibe) {
    signatureBoxRecibe.addEventListener('click', () => {
      signaturePadRecibe.clear();
      signatureModalRecibe.show();
    });
  }

  // ---------------------------------------------------------
  // AJUSTE DE VISIBILIDAD DEL NAV Y LOGO SEGÚN EL ROL
  // ---------------------------------------------------------
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

  // ---------------------------------------------------------
  // CONFIGURACIÓN DEL LOGO
  // ---------------------------------------------------------
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
});
