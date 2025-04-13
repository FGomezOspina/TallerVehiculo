document.addEventListener('DOMContentLoaded', async function() {
    const tablaBody = document.querySelector('#tablaHistorialArgos tbody');
  
    try {
      // Se asume que el endpoint GET /detallesVehiculoArgos devuelve:
      // { success: true, detalles: [ { id, ejecutor, equipo, fechaProgramada, horaProgramada, sede, ... }, ... ] }
      const response = await fetch('/detallesVehiculoArgos');
      if (!response.ok) {
        throw new Error('Error al obtener los datos.');
      }
      const data = await response.json();
      if (data.success) {
        const detalles = data.detalles;
        if (detalles.length === 0) {
          tablaBody.innerHTML = '<tr><td colspan="7" class="text-center">No se encontraron registros.</td></tr>';
        } else {
          detalles.forEach((detalle, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
              <td>${index + 1}</td>
              <td>${detalle.ejecutor || ''}</td>
              <td>${detalle.equipo || ''}</td>
              <td>${detalle.fechaProgramada || ''}</td>
              <td>${detalle.horaProgramada || ''}</td>
              <td>${detalle.sede || ''}</td>
              <td>
                <a href="actualizarVehiculoArgos.html?id=${detalle.id}" class="btn btn-primary btn-sm">Editar</a>
              </td>
            `;
            tablaBody.appendChild(tr);
          });
        }
      } else {
        tablaBody.innerHTML = '<tr><td colspan="7" class="text-center">No se encontraron registros.</td></tr>';
      }
    } catch (err) {
      console.error(err);
      tablaBody.innerHTML = '<tr><td colspan="7" class="text-center">Error al cargar los datos.</td></tr>';
    }
});
  