document.addEventListener('DOMContentLoaded', function() {
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
        // Reindexar filas (opcional) para mantener numeración
        const filas = tablaReportes.querySelectorAll('tbody tr');
        filas.forEach((tr, index) => {
          const tdNum = tr.querySelector('td');
          tdNum.textContent = index + 1;
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
      // Aquí podrías:
      // 1. Enviar datos a un servidor con fetch().
      // 2. Generar un PDF o abrir el diálogo de impresión.
      // 3. O simplemente hacer console.log() de la información.
      console.log('Datos listos para guardar o imprimir...');
      window.print(); // Ejemplo: abrir el diálogo de impresión
    });
  
    // Inicialización
    recalcularTotal();
  });
  