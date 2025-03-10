require('dotenv').config(); // Carga las variables de entorno
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

// Carga las credenciales desde las variables de entorno
const serviceAccount = JSON.parse(process.env.GOOGLE_CREDENTIALS);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Inicializa Firestore
const db = admin.firestore();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración del body parser para procesar formularios y aumentar el límite (50MB)
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));

// Servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para la página de login
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Procesamiento del login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    // Para admin: redirige a la página de selección de sede con role=admin
    res.redirect('/dashboard?role=admin');
  } else if (username === 'patioPereira' && password === 'patio123') {
    // Para usuario de patioPereira: redirige directamente al dashboard con sede y role=patio
    res.redirect('/dashboard?sede=pereira&role=patio');
  } else if (username === 'patioMedellin' && password === 'patio123') {
    // Para usuario de patioMedellin: redirige directamente al dashboard con sede y role=patio
    res.redirect('/dashboard?sede=medellin&role=patio');
  } else {
    res.redirect('/?error=invalid');
  }
});


// Ruta para el dashboard con selección de sede
app.get('/dashboard', (req, res) => {
  if (!req.query.sede) {
    // No se ha seleccionado la sede: mostramos la pantalla de selección
    // Conservamos el parámetro role (o lo asumimos como admin si no se indica)
    const role = req.query.role || 'admin';
    res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
          <meta charset="UTF-8">
          <title>Seleccionar Sede</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
      </head>
      <body>
          <div class="container mt-5">
              <h1>Selecciona una Sede</h1>
              <div class="d-flex justify-content-around mt-4">
                  <a href="/dashboard?sede=pereira&role=${role}" class="btn btn-primary">Pereira</a>
                  <a href="/dashboard?sede=medellin&role=${role}" class="btn btn-secondary">Medellín</a>
              </div>
          </div>
      </body>
      </html>
    `);
  } else {
    // Se ha seleccionado la sede; se carga el dashboard principal.
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
  }
});


// -------------------- CLIENTES --------------------

// Crear un cliente (el objeto debe incluir el campo "sede")
app.post('/crearCliente', (req, res) => {
  const clienteData = req.body; // Debe incluir: empresa, nombre, teléfono, cédula, rut, dirección, vehículos, sede, etc.
  db.collection("clientes").add(clienteData)
    .then(docRef => {
      console.log("Cliente guardado con ID: ", docRef.id);
      res.json({ success: true, id: docRef.id });
    })
    .catch(err => {
      console.error("Error agregando cliente: ", err);
      res.status(500).json({ success: false, error: err.message });
    });
});

// Obtener la lista de clientes filtrando por sede (se envía ?sede=pereira o ?sede=medellin)
app.get('/clientes', (req, res) => {
  const sede = req.query.sede;
  if (!sede) {
    return res.status(400).json({ success: false, error: "Falta el parámetro sede" });
  }
  db.collection("clientes").where("sede", "==", sede).get()
    .then(snapshot => {
      let clientes = [];
      snapshot.forEach(doc => {
        clientes.push({ id: doc.id, ...doc.data() });
      });
      res.json({ success: true, clientes });
    })
    .catch(err => {
      console.error("Error obteniendo clientes: ", err);
      res.status(500).json({ success: false, error: err.message });
    });
});

// Actualizar un cliente
app.put('/clientes/:id', (req, res) => {
  const clienteId = req.params.id;
  const updatedData = req.body;
  db.collection("clientes").doc(clienteId).update(updatedData)
    .then(() => {
      res.json({ success: true });
    })
    .catch(err => {
      console.error("Error actualizando cliente:", err);
      res.status(500).json({ success: false, error: err.message });
    });
});

// Eliminar un cliente
app.delete('/clientes/:id', (req, res) => {
  const clienteId = req.params.id;
  db.collection("clientes").doc(clienteId).delete()
    .then(() => {
      res.json({ success: true });
    })
    .catch(err => {
      console.error("Error eliminando cliente:", err);
      res.status(500).json({ success: false, error: err.message });
    });
});

// -------------------- PRODUCTOS (comunes a ambas sedes) --------------------

// Guardar un producto
app.post('/saveProducto', (req, res) => {
  const productoData = req.body;
  db.collection("productos").add(productoData)
    .then(docRef => {
      console.log("Producto guardado con ID: ", docRef.id);
      res.json({ success: true, id: docRef.id });
    })
    .catch(err => {
      console.error("Error agregando producto: ", err);
      res.status(500).json({ success: false, error: err.message });
    });
});

// Obtener la lista de productos (sin filtro de sede)
app.get('/productos', (req, res) => {
  db.collection("productos").get()
    .then(snapshot => {
      let productos = [];
      snapshot.forEach(doc => {
        productos.push({ id: doc.id, ...doc.data() });
      });
      res.json({ success: true, productos });
    })
    .catch(err => {
      console.error("Error obteniendo productos: ", err);
      res.status(500).json({ success: false, error: err.message });
    });
});

// Actualizar un producto
app.put('/productos/:id', (req, res) => {
  const productId = req.params.id;
  const updatedData = req.body;
  db.collection("productos").doc(productId).update(updatedData)
    .then(() => {
      res.json({ success: true });
    })
    .catch(err => {
      console.error("Error actualizando producto:", err);
      res.status(500).json({ success: false, error: err.message });
    });
});

// Eliminar un producto
app.delete('/productos/:id', (req, res) => {
  const productId = req.params.id;
  db.collection("productos").doc(productId).delete()
    .then(() => {
      res.json({ success: true });
    })
    .catch(err => {
      console.error("Error eliminando producto: ", err);
      res.status(500).json({ success: false, error: err.message });
    });
});

// -------------------- DETALLES VEHICULO --------------------

// Guardar el detalle completo del vehículo (crear uno nuevo)
// El objeto debe incluir el campo "sede" para identificar a qué sede pertenece.
app.post('/guardarDetalle', (req, res) => {
  // Medir el tamaño del payload
  const payloadStr = JSON.stringify(req.body);
  const payloadSizeBytes = Buffer.byteLength(payloadStr, 'utf8');
  const payloadSizeMB = payloadSizeBytes / (1024 * 1024);
  console.log(`Payload size: ${payloadSizeMB.toFixed(2)} MB`);

  const detalleData = req.body;
  db.collection("detallesVehiculo").add(detalleData)
    .then(docRef => {
      console.log("Detalle del vehículo guardado con ID: ", docRef.id);
      res.json({ success: true, id: docRef.id });
    })
    .catch(err => {
      console.error("Error guardando detalle del vehículo:", err);
      res.status(500).json({ success: false, error: err.message });
    });
});

// Obtener todos los detalles vehiculares filtrando por sede
app.get('/detallesVehiculo', (req, res) => {
  const sede = req.query.sede;
  if (!sede) {
    return res.status(400).json({ success: false, error: "Falta el parámetro sede" });
  }
  db.collection("detallesVehiculo").where("sede", "==", sede).get()
    .then(snapshot => {
      let detalles = [];
      snapshot.forEach(doc => {
        detalles.push({ id: doc.id, ...doc.data() });
      });
      res.json({ success: true, detalles });
    })
    .catch(err => {
      console.error("Error obteniendo detalles vehiculares:", err);
      res.status(500).json({ success: false, error: err.message });
    });
});

// Actualizar un detalle vehicular existente (solo si no está cerrado)
app.put('/detallesVehiculo/:id', (req, res) => {
  const detalleId = req.params.id;
  const updatedData = req.body;
  const docRef = db.collection("detallesVehiculo").doc(detalleId);
  docRef.get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ success: false, error: "Detalle no encontrado" });
      }
      const detalleData = doc.data();
      if (detalleData.estado && detalleData.estado === 'Cerrado') {
        return res.status(400).json({ success: false, error: "El informe está cerrado y no puede ser editado" });
      }
      return docRef.update(updatedData);
    })
    .then(() => {
      res.json({ success: true });
    })
    .catch(err => {
      console.error("Error actualizando detalle vehicular:", err);
      res.status(500).json({ success: false, error: err.message });
    });
});

// Obtener un detalle vehicular específico por su ID
app.get('/detallesVehiculo/:id', (req, res) => {
  const detalleId = req.params.id;
  db.collection("detallesVehiculo").doc(detalleId).get()
    .then(doc => {
      if (!doc.exists) {
        res.status(404).json({ success: false, error: "Detalle no encontrado" });
      } else {
        res.json({ success: true, detalle: { id: doc.id, ...doc.data() } });
      }
    })
    .catch(err => {
      console.error("Error obteniendo detalle vehicular:", err);
      res.status(500).json({ success: false, error: err.message });
    });
});

// Actualizar el estado a "Cerrado" (cerrar informe) y descontar el stock
app.put('/detallesVehiculo/:id/cerrar', (req, res) => {
  const detalleId = req.params.id;
  const docRef = db.collection("detallesVehiculo").doc(detalleId);
  docRef.get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ success: false, error: "Detalle no encontrado" });
      }
      const detalleData = doc.data();
      if (detalleData.estado && detalleData.estado === 'Cerrado') {
        return res.status(400).json({ success: false, error: "El informe ya está cerrado" });
      }
      // Actualizamos el estado a "Cerrado"
      return docRef.update({ estado: 'Cerrado' }).then(() => detalleData);
    })
    .then((detalleData) => {
      // Si el detalle no tiene servicios o es nulo, saltamos la actualización de stock
      if (!detalleData || !Array.isArray(detalleData.servicios)) {
        return;
      }
      // Iterar sobre cada servicio y descontar stock del producto correspondiente
      let promises = detalleData.servicios.map(serv => {
        if (serv.productoId && serv.cantidad) {
          const productRef = db.collection("productos").doc(serv.productoId);
          return productRef.get().then(productDoc => {
            if (productDoc.exists) {
              const productData = productDoc.data();
              const currentStock = (productData.stock && productData.stock.cantidadDisponible) ? productData.stock.cantidadDisponible : 0;
              const newStock = currentStock - parseInt(serv.cantidad);
              // Actualizar el stock del producto
              return productRef.update({
                'stock.cantidadDisponible': newStock
              });
            }
            return Promise.resolve();
          });
        }
        return Promise.resolve();
      });
      return Promise.all(promises);
    })
    .then(() => {
      res.json({ success: true, mensaje: "Informe cerrado correctamente y stock actualizado." });
    })
    .catch(err => {
      console.error("Error al cerrar el informe:", err);
      res.status(500).json({ success: false, error: err.message });
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
