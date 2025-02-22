document.addEventListener('DOMContentLoaded', () => {
    const clientesContainer = document.getElementById("clientesContainer");
    const editClienteModalEl = document.getElementById("editClienteModal");
    const editClienteModal = new bootstrap.Modal(editClienteModalEl);
    const guardarEditClienteBtn = document.getElementById("guardarEditClienteBtn");
    let currentClienteId = null;
  
    // Función para obtener y renderizar la lista de clientes
    function renderClientes() {
      fetch('/clientes')
        .then(response => response.json())
        .then(data => {
          if(data.success) {
            clientesContainer.innerHTML = "";
            data.clientes.forEach(cliente => {
              const item = document.createElement("a");
              item.href = "#";
              item.className = "list-group-item list-group-item-action";
              item.dataset.id = cliente.id;
              item.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                  <h5 class="mb-1">${cliente.nombre} (${cliente.empresa})</h5>
                  <small>${cliente.telefono}</small>
                </div>
                <p class="mb-1">Cédula: ${cliente.cedula} | RUT: ${cliente.rut}</p>
                <small>Dirección: ${cliente.direccion}</small>
              `;
              item.addEventListener("click", () => {
                currentClienteId = cliente.id;
                fillEditForm(cliente);
                editClienteModal.show();
              });
              clientesContainer.appendChild(item);
            });
          } else {
            clientesContainer.innerHTML = "No se pudo obtener la lista de clientes.";
          }
        })
        .catch(err => {
          console.error("Error:", err);
          clientesContainer.innerHTML = "Error al cargar clientes.";
        });
    }
  
    // Función para llenar el formulario de edición
    function fillEditForm(cliente) {
      document.getElementById("editEmpresa").value = cliente.empresa || "";
      document.getElementById("editNombre").value = cliente.nombre || "";
      document.getElementById("editTelefono").value = cliente.telefono || "";
      document.getElementById("editCedula").value = cliente.cedula || "";
      document.getElementById("editRut").value = cliente.rut || "";
      document.getElementById("editDireccion").value = cliente.direccion || "";
    }
  
    guardarEditClienteBtn.addEventListener("click", () => {
      const updatedData = {
        empresa: document.getElementById("editEmpresa").value,
        nombre: document.getElementById("editNombre").value,
        telefono: document.getElementById("editTelefono").value,
        cedula: document.getElementById("editCedula").value,
        rut: document.getElementById("editRut").value,
        direccion: document.getElementById("editDireccion").value
      };
  
      fetch(`/clientes/${currentClienteId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedData)
      })
      .then(response => response.json())
      .then(data => {
        if(data.success) {
          alert("Cliente actualizado correctamente");
          editClienteModal.hide();
          renderClientes();
        } else {
          alert("Error actualizando cliente");
        }
      })
      .catch(err => {
        console.error("Error:", err);
        alert("Error actualizando cliente");
      });
    });
  
    renderClientes();
});
  