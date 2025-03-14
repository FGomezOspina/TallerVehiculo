require('dotenv').config(); // Carga las variables de entorno
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const session = require('express-session');

// Carga las credenciales desde las variables de entorno
const serviceAccount = JSON.parse(process.env.GOOGLE_CREDENTIALS);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Inicializa Firestore
const db = admin.firestore();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de express-session
app.use(session({
  secret: 'tu_clave_secreta', // Reemplaza por una clave segura
  resave: false,
  saveUninitialized: false
}));

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
    // Guarda información del usuario en la sesión
    req.session.user = { username, role: 'admin' };
    // Para admin: redirige a la página de selección de sede con role=admin
    res.redirect('/dashboard?role=admin');
  } else if (username === 'patioPereira' && password === 'patio123') {
    req.session.user = { username, role: 'patio' };
    // Para usuario de patioPereira: redirige directamente al dashboard con sede y role=patio
    res.redirect('/dashboard?sede=pereira&role=patio');
  } else if (username === 'patioMedellin' && password === 'patio123') {
    req.session.user = { username, role: 'patio' };
    // Para usuario de patioMedellin: redirige directamente al dashboard con sede y role=patio
    res.redirect('/dashboard?sede=medellin&role=patio');
  } else {
    res.redirect('/?error=invalid');
  }
});

// Endpoint para cerrar sesión
app.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        console.error("Error al cerrar la sesión:", err);
        return res.status(500).send("Error al cerrar la sesión");
      }
      res.redirect('/');
    });
  } else {
    res.redirect('/');
  }
});

// Ruta para el dashboard con selección de sede

app.get("/dashboard", (req, res) => {
  if (!req.query.sede) {
    // No se ha seleccionado la sede: mostramos la pantalla de selección
    // Conservamos el parámetro role (o lo asumimos como admin si no se indica)
    const role = req.query.role || "admin";
    res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
          <meta charset="UTF-8">
          <title>Seleccionar Sede</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
          <script>
            function selectBranch(sede) {
              window.location.href = "/dashboard?sede=" + sede + "&role=${role}";
            }
          </script>
          <style>
            .branch-card {
              border: 2px solid #ccc;
              border-radius: 10px;
              padding: 20px;
              text-align: center;
              cursor: pointer;
              transition: 0.3s;
            }
            .branch-card:hover {
              border-color: #007bff;
              box-shadow: 0px 0px 10px rgba(0, 123, 255, 0.3);
            }
            .selected {
              border-color: #007bff !important;
              box-shadow: 0px 0px 10px rgba(0, 123, 255, 0.5);
            }
          </style>
      </head>
      <body>
          <div class="container mt-5">
              <h1 class="text-center">Selecciona una Sede</h1>
              <div class="row justify-content-center mt-4">
                  <div class="col-md-4">
                      <div class="branch-card" onclick="selectBranch('pereira')">
                          <h2>Sede Pereira</h2>
                          <p><strong>Ubicación:</strong> Centro, Pereira</p>
                          
                      </div>
                  </div>
                  <div class="col-md-4">
                      <div class="branch-card" onclick="selectBranch('medellin')">
                          <h2>Sede Medellín</h2>
                          <p><strong>Ubicación:</strong> Zona Norte, Medellín</p>
                          
                      </div>
                  </div>
              </div>
          </div>
      </body>
      </html>
    `);
  } else {
    // Se ha seleccionado la sede; se carga el dashboard principal.
    res.sendFile(path.join(__dirname, "public", "dashboard.html"));
  }
});

// -------------------- CLIENTES --------------------

// Crear un cliente (el objeto debe incluir el campo "sede")
app.post('/crearCliente', (req, res) => {
  const clienteData = req.body; // Debe incluir: empresa, nombre, teléfono, cédula, dirección, vehículos, sede, etc.
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
      console.error("Error eliminando cliente: ", err);
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

app.post('/saveTempario', (req, res) => {
  const { tempario } = req.body;
  if (!tempario || !Array.isArray(tempario)) {
    return res.status(400).json({ success: false, error: "Datos inválidos" });
  }

  // Se crea un documento por cada item en la colección "saveTempario"
  const promises = tempario.map(item => {
    return db.collection("saveTempario").add(item);
  });

  Promise.all(promises)
    .then(results => {
      res.json({ success: true, ids: results.map(doc => doc.id) });
    })
    .catch(err => {
      console.error("Error guardando tempario: ", err);
      res.status(500).json({ success: false, error: err.message });
    });
});

// Obtener todos los temparios guardados
app.get('/getTempario', (req, res) => {
  db.collection("saveTempario").get()
    .then(snapshot => {
      let temparioItems = [];
      snapshot.forEach(doc => {
        temparioItems.push({ id: doc.id, ...doc.data() });
      });
      res.json({ success: true, tempario: temparioItems });
    })
    .catch(err => {
      console.error("Error obteniendo tempario: ", err);
      res.status(500).json({ success: false, error: err.message });
    });
});

// Actualizar un producto del tempario
app.put('/tempario/:id', (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;
  db.collection("saveTempario").doc(id).update(updatedData)
    .then(() => {
      res.json({ success: true });
    })
    .catch(err => {
      console.error("Error actualizando tempario: ", err);
      res.status(500).json({ success: false, error: err.message });
    });
});

// Eliminar un producto del tempario
app.delete('/tempario/:id', (req, res) => {
  const id = req.params.id;
  db.collection("saveTempario").doc(id).delete()
    .then(() => {
      res.json({ success: true });
    })
    .catch(err => {
      console.error("Error eliminando tempario: ", err);
      res.status(500).json({ success: false, error: err.message });
    });
});



// -------------------- DETALLES VEHICULO --------------------

// Guardar el detalle completo del vehículo (crear uno nuevo)
// Ruta para guardar el detalle del vehículo
app.post('/guardarDetalle', (req, res) => {
  const detalleData = req.body;

  // Guardar en la colección "detallesVehiculo"
  db.collection("detallesVehiculo").add(detalleData)
    .then(docRef => {
      console.log("Detalle del vehículo guardado con ID: ", docRef.id);

      // Respondemos con éxito después de guardar el detalle del vehículo
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
