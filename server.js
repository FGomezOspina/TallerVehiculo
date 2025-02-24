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

// Configuración del body parser para procesar formularios
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
