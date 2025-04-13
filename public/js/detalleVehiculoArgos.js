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
  // BOTÓN GUARDAR / IMPRIMIR
  // ---------------------------------------------------------
  const btnGuardar = document.getElementById('btnGuardar');
  btnGuardar.addEventListener('click', async () => {
    // Se extraen los datos del formulario, incluyendo la sede y el rol
    const data = {
      ejecutor: document.getElementById('ejecutor').value,
      equipo: document.getElementById('equipo').value,
      fechaProgramada: document.getElementById('fechaProgramada').value,
      horaProgramada: document.getElementById('horaProgramada').value,
      reportes: Array.from(tablaReportes.querySelectorAll('tbody tr')).map(tr => {
        const celdas = tr.querySelectorAll('td');
        return {
          reporteInicial: celdas[1].querySelector('textarea')?.value || '',
          OT: celdas[2].querySelector('input')?.value || '',
          trabajoOrdenado: celdas[3].querySelector('textarea')?.value || '',
          trabajoEjecutado: celdas[4].querySelector('textarea')?.value || '',
          cumple: celdas[5].querySelector('input')?.value || '',
          comentarios: celdas[6].querySelector('textarea')?.value || ''
        };
      }),
      firmaEjecutor: document.getElementById('signatureBoxEjecutor').querySelector('img')?.src || '',
      firmaRecibe: document.getElementById('signatureBoxRecibe').querySelector('img')?.src || '',
      firmaMantenimiento: document.getElementById('signatureBoxMantenimiento').querySelector('img')?.src || '',
      sede: sede, // Se agrega la sede obtenida
      role: role  // Se agrega el rol obtenido
    };
  
    try {
      const response = await fetch('/guardarDetalleArgos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        const result = await response.json();
        alert('Datos guardados correctamente, ID: ' + result.id);
        // Opcional: se puede llamar a window.print() o realizar otra acción
        //window.print();
      } else {
        alert('Error al guardar los datos');
      }
    } catch (err) {
      console.error('Error en la conexión', err);
      alert('Error en la conexión al servidor.');
    }
  });
  
  // ---------------------------------------------------------
  // SIGNATURE PAD: Implementación para firmas (Ejecutor, Recibe y Mantenimiento)
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

  // Firma del Mantenimiento
  const signatureCanvasMantenimiento = document.getElementById('signatureCanvasMantenimiento');
  signatureCanvasMantenimiento.width = signatureCanvasMantenimiento.offsetWidth;
  signatureCanvasMantenimiento.height = signatureCanvasMantenimiento.offsetHeight;
  const signaturePadMantenimiento = new SignaturePad(signatureCanvasMantenimiento);
  const signatureModalMantenimientoEl = document.getElementById('signatureModalMantenimiento');
  const signatureModalMantenimiento = new bootstrap.Modal(signatureModalMantenimientoEl);

  signatureModalMantenimientoEl.addEventListener('shown.bs.modal', () => {
    signatureCanvasMantenimiento.width = signatureCanvasMantenimiento.offsetWidth;
    signatureCanvasMantenimiento.height = signatureCanvasMantenimiento.offsetHeight;
    signaturePadMantenimiento.clear();
  });

  document.getElementById('btnClearSignatureMantenimiento').addEventListener('click', () => {
    signaturePadMantenimiento.clear();
  });

  document.getElementById('btnSaveSignatureMantenimiento').addEventListener('click', () => {
    if(signaturePadMantenimiento.isEmpty()) {
      alert("Por favor, firma antes de guardar.");
    } else {
      const dataURL = signaturePadMantenimiento.toDataURL();
      document.getElementById('signatureBoxMantenimiento').innerHTML = `<img src="${dataURL}" alt="Firma digital del Mantenimiento" style="max-width: 100%;">`;
      signatureModalMantenimiento.hide();
    }
  });

  const signatureBoxMantenimiento = document.getElementById('signatureBoxMantenimiento');
  if(signatureBoxMantenimiento) {
    signatureBoxMantenimiento.addEventListener('click', () => {
      signaturePadMantenimiento.clear();
      signatureModalMantenimiento.show();
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
