document.addEventListener('DOMContentLoaded', async () => {

    // Función para obtener parámetros de la URL
    const getQueryParam = (param) => {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(param);
    };
  
    // Obtener el ID del documento a actualizar
    const id = getQueryParam('id');
    if (!id) {
      alert("No se proporcionó el ID del documento.");
      return;
    }
  
    // Función para cargar datos y rellenar el formulario
    async function loadData() {
      try {
        const response = await fetch(`/detallesVehiculoArgos/${id}`);
        if (!response.ok) {
          throw new Error('Error al obtener los datos del documento.');
        }
        const data = await response.json();
        if (data.success) {
          const detalle = data.detalle;
          // Datos de cabecera
          document.getElementById('ejecutor').value = detalle.ejecutor || '';
          document.getElementById('equipo').value = detalle.equipo || '';
          document.getElementById('fechaProgramada').value = detalle.fechaProgramada || '';
          document.getElementById('horaProgramada').value = detalle.horaProgramada || '';
          
          // Reportes
          const tbody = document.querySelector('#tablaReportes tbody');
          if (!tbody) {
            console.error("No se encontró el elemento tbody en la tabla de reportes.");
          } else {
            tbody.innerHTML = ''; // Limpiar filas existentes
            if (detalle.reportes && Array.isArray(detalle.reportes) && detalle.reportes.length > 0) {
              detalle.reportes.forEach((reporte, index) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                  <td class="align-middle text-center">${index + 1}</td>
                  <td>
                    <textarea class="form-control" rows="2">${reporte.reporteInicial || ''}</textarea>
                  </td>
                  <td>
                    <input type="text" class="form-control" value="${reporte.OT || ''}" />
                  </td>
                  <td>
                    <textarea class="form-control" rows="2">${reporte.trabajoOrdenado || ''}</textarea>
                  </td>
                  <td>
                    <textarea class="form-control" rows="2">${reporte.trabajoEjecutado || ''}</textarea>
                  </td>
                  <td>
                    <input type="text" class="form-control" placeholder="S/N" value="${reporte.cumple || ''}" />
                  </td>
                  <td>
                    <textarea class="form-control" rows="2">${reporte.comentarios || ''}</textarea>
                  </td>
                  <td class="text-center align-middle">
                    <button class="btn btn-sm btn-danger eliminarReporte">
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                `;
                tbody.appendChild(tr);
              });
            } else {
              // Si no existen reportes, agregar una fila de ejemplo
              const tr = document.createElement('tr');
              tr.innerHTML = `
                <td class="align-middle text-center">1</td>
                <td>
                  <textarea class="form-control" rows="2"></textarea>
                </td>
                <td>
                  <input type="text" class="form-control" />
                </td>
                <td>
                  <textarea class="form-control" rows="2"></textarea>
                </td>
                <td>
                  <textarea class="form-control" rows="2"></textarea>
                </td>
                <td>
                  <input type="text" class="form-control" placeholder="S/N" />
                </td>
                <td>
                  <textarea class="form-control" rows="2"></textarea>
                </td>
                <td class="text-center align-middle">
                  <button class="btn btn-sm btn-danger eliminarReporte">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              `;
              tbody.appendChild(tr);
            }
          }
  
          // Sección de Entrega / Recibe / Evaluación
          document.getElementById('entregaNombre').value = detalle.entregaNombre || '';
          document.getElementById('recibeNombre').value = detalle.recibeNombre || '';
          document.getElementById('recibeHora').value = detalle.recibeHora || '';
          document.getElementById('entregaHora').value = detalle.entregaHora || '';
          document.getElementById('checkSeguridad').checked = !!detalle.checkSeguridad;
          document.getElementById('checkAmbiente').checked = !!detalle.checkAmbiente;
          document.getElementById('checkCalidad').checked = !!detalle.checkCalidad;
          document.getElementById('recibeMantenimiento').value = detalle.recibeMantenimiento || '';
  
          // Mostrar firmas (si existen)
          if (detalle.firmaEjecutor) {
            document.getElementById('signatureBoxEjecutor').innerHTML = `<img src="${detalle.firmaEjecutor}" alt="Firma digital del Ejecutor" style="max-width: 100%;">`;
          }
          if (detalle.firmaRecibe) {
            document.getElementById('signatureBoxRecibe').innerHTML = `<img src="${detalle.firmaRecibe}" alt="Firma digital del Recibe" style="max-width: 100%;">`;
          }
          if (detalle.firmaMantenimiento) {
            document.getElementById('signatureBoxMantenimiento').innerHTML = `<img src="${detalle.firmaMantenimiento}" alt="Firma digital del Mantenimiento" style="max-width: 100%;">`;
          }
        } else {
          alert("No se encontró el documento.");
        }
      } catch (err) {
        console.error("Error al cargar los datos:", err);
        alert("Error al cargar los datos del documento.");
      }
    }
  
    await loadData();
  
    // Lógica para agregar reportes solo si el botón existe
    const agregarReporteBtn = document.getElementById('agregarReporte');
    const tablaReportes = document.getElementById('tablaReportes');
  
    if (agregarReporteBtn && tablaReportes) {
      function agregarReporte() {
        const tbody = tablaReportes.querySelector('tbody');
        if (!tbody) {
          console.error("No se encontró el <tbody> en la tabla de reportes.");
          return;
        }
        const numFila = tbody.querySelectorAll('tr').length + 1;
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
  
      agregarReporteBtn.addEventListener('click', agregarReporte);
  
      tablaReportes.addEventListener('click', (e) => {
        if (e.target.closest('.eliminarReporte')) {
          const fila = e.target.closest('tr');
          fila.remove();
          // Reindexar filas
          const filas = tablaReportes.querySelectorAll('tbody tr');
          filas.forEach((tr, index) => {
            tr.querySelector('td').textContent = index + 1;
          });
        }
      });
    } else {
      console.warn("El botón de agregar reporte o la tabla no se encontraron. Verifica el HTML.");
    }

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
  
    // Enviar el formulario actualizando el documento
    const btnGuardar = document.getElementById('btnGuardar');
    if (btnGuardar) {
      btnGuardar.addEventListener('click', async (e) => {
        e.preventDefault();
        const updatedData = {
          ejecutor: document.getElementById('ejecutor').value,
          equipo: document.getElementById('equipo').value,
          fechaProgramada: document.getElementById('fechaProgramada').value,
          horaProgramada: document.getElementById('horaProgramada').value,
          entregaNombre: document.getElementById('entregaNombre').value,
          recibeNombre: document.getElementById('recibeNombre').value,
          recibeHora: document.getElementById('recibeHora').value,
          entregaHora: document.getElementById('entregaHora').value,
          checkSeguridad: document.getElementById('checkSeguridad').checked,
          checkAmbiente: document.getElementById('checkAmbiente').checked,
          checkCalidad: document.getElementById('checkCalidad').checked,
          recibeMantenimiento: document.getElementById('recibeMantenimiento').value
        };
  
        // Recopilar reportes de la tabla
        const reportes = [];
        const filas = document.querySelectorAll('#tablaReportes tbody tr');
        filas.forEach(tr => {
          const celdas = tr.querySelectorAll('td');
          const reporte = {
            reporteInicial: celdas[1].querySelector('textarea').value,
            OT: celdas[2].querySelector('input').value,
            trabajoOrdenado: celdas[3].querySelector('textarea').value,
            trabajoEjecutado: celdas[4].querySelector('textarea').value,
            cumple: celdas[5].querySelector('input').value,
            comentarios: celdas[6].querySelector('textarea').value
          };
          reportes.push(reporte);
        });
        updatedData.reportes = reportes;
  
        // Conservar las firmas si existen
        updatedData.firmaEjecutor = document.getElementById('signatureBoxEjecutor').querySelector('img') ?
          document.getElementById('signatureBoxEjecutor').querySelector('img').src : '';
        updatedData.firmaRecibe = document.getElementById('signatureBoxRecibe').querySelector('img') ?
          document.getElementById('signatureBoxRecibe').querySelector('img').src : '';
        updatedData.firmaMantenimiento = document.getElementById('signatureBoxMantenimiento').querySelector('img') ?
          document.getElementById('signatureBoxMantenimiento').querySelector('img').src : '';
  
        try {
          const response = await fetch(`/detallesVehiculoArgos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
          });
          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              alert("Documento actualizado correctamente.");
              window.location.href = "historialVehicularArgos.html";
            } else {
              alert("Error al actualizar el documento.");
            }
          } else {
            alert("Error en la actualización.");
          }
        } catch (error) {
          console.error("Error al actualizar:", error);
          alert("Error al conectar con el servidor.");
        }
      });
    } else {
      console.warn("No se encontró el botón guardar.");
    }
});
  