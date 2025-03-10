document.addEventListener('DOMContentLoaded', () => {
  // Obtener el parámetro "sede" de la URL, con valor por defecto "pereira" si no existe
  const urlParams = new URLSearchParams(window.location.search);
  const sede = urlParams.get('sede') || 'pereira';

  // Referencias del DOM
  const clienteForm = document.getElementById('clienteForm');
  const vehiculosContainer = document.getElementById('vehiculosContainer');
  const agregarVehiculoBtn = document.getElementById('agregarVehiculoBtn');
  const guardarClienteBtn = document.getElementById('guardarClienteBtn');

  let vehiculoCount = 0;
  
  function crearFormularioVehiculo(index) {
    const card = document.createElement('div');
    card.className = 'card mb-3';
    card.innerHTML = `
      <div class="card-header d-flex justify-content-between align-items-center">
        <span>Vehículo ${index}</span>
        <button type="button" class="btn btn-danger btn-sm eliminarVehiculoBtn">
          <i class="bi bi-trash"></i>
        </button>
      </div>
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Marca</label>
            <input type="text" class="form-control" name="vehMarca" placeholder="Marca" required>
          </div>
          <div class="col-md-6">
            <label class="form-label">Modelo</label>
            <input type="text" class="form-control" name="vehModelo" placeholder="Modelo" required>
          </div>
          <div class="col-md-4">
            <label class="form-label">Año</label>
            <input type="number" class="form-control" name="vehAnio" placeholder="Año" required>
          </div>
          <div class="col-md-4">
            <label class="form-label">Color</label>
            <input type="text" class="form-control" name="vehColor" placeholder="Color" required>
          </div>
          <div class="col-md-4">
            <label class="form-label">Placa</label>
            <input type="text" class="form-control" name="vehPlaca" placeholder="Placa" required>
          </div>
        </div>
      </div>
    `;
    return card;
  }

  agregarVehiculoBtn.addEventListener('click', () => {
    vehiculoCount++;
    const vehiculoForm = crearFormularioVehiculo(vehiculoCount);
    vehiculosContainer.appendChild(vehiculoForm);
  });

  vehiculosContainer.addEventListener('click', (e) => {
    if (e.target.closest('.eliminarVehiculoBtn')) {
      const card = e.target.closest('.card');
      vehiculosContainer.removeChild(card);
    }
  });

  guardarClienteBtn.addEventListener('click', () => {
    // Se crea el objeto de cliente y se añade el campo sede automáticamente
    const clienteData = {
      empresa: document.getElementById('empresa').value,
      nombre: document.getElementById('nombre').value,
      telefono: document.getElementById('telefono').value,
      cedula: document.getElementById('cedula').value,
      email: document.getElementById('email').value,
      vehiculos: [],
      sede: sede  // se agrega la sede extraída de la URL
    };

    const vehiculoCards = vehiculosContainer.querySelectorAll('.card');
    vehiculoCards.forEach(card => {
      const vehiculo = {
        marca: card.querySelector('input[name="vehMarca"]').value,
        modelo: card.querySelector('input[name="vehModelo"]').value,
        anio: card.querySelector('input[name="vehAnio"]').value,
        color: card.querySelector('input[name="vehColor"]').value,
        placa: card.querySelector('input[name="vehPlaca"]').value
      };
      clienteData.vehiculos.push(vehiculo);
    });

    fetch('/crearCliente', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(clienteData)
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert("Cliente guardado correctamente.");
        clienteForm.reset();
        vehiculosContainer.innerHTML = "";
        vehiculoCount = 0;
      } else {
        alert("Error al guardar el cliente.");
      }
    })
    .catch(err => {
      console.error("Error:", err);
      alert("Error al guardar el cliente.");
    });
  });
});
