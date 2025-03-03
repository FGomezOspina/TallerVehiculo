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
    res.redirect('/dashboard');
  } else {
    res.redirect('/?error=invalid');
  }
});

// Ruta para el dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Endpoint para guardar datos del vehículo (ejemplo)
app.post('/saveCar', (req, res) => {
  console.log('Datos del vehículo recibidos:', req.body);
  res.json({ success: true, message: 'Datos guardados correctamente' });
});

// Endpoint para crear un cliente
app.post('/crearCliente', (req, res) => {
  const clienteData = req.body; // Debe incluir: empresa, nombre, teléfono, cédula, rut, dirección, vehiculos, etc.
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

// Endpoint para obtener la lista de clientes
app.get('/clientes', (req, res) => {
  db.collection("clientes").get()
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

// Endpoint para actualizar un cliente
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

// Endpoint para eliminar un cliente
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

// Endpoint para guardar un producto en Firestore
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

// Endpoint para obtener la lista de productos
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

// Endpoint para actualizar un producto
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

// Endpoint para eliminar un producto
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

// Endpoint para guardar el detalle completo del vehículo (crear uno nuevo)
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

// NUEVOS ENDPOINTS para historial y edición

// GET: Obtener todos los detalles vehiculares (para historial)
app.get('/detallesVehiculo', (req, res) => {
  db.collection("detallesVehiculo").get()
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

// PUT: Actualizar un detalle vehicular existente (solo si no está cerrado)
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

// GET: Obtener un detalle vehicular específico por su ID
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

// PUT: Actualizar el estado a "Cerrado" (cerrar informe) y descontar el stock
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
