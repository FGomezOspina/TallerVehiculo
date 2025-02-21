const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
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
        // Login correcto, redirige al dashboard
        res.redirect('/dashboard');
    } else {
        // Login fallido, redirige a login con mensaje de error
        res.redirect('/?error=invalid');
    }
});

// Ruta para el dashboard (pantalla inicial tras el login)
app.get('/dashboard', (req, res) => {
    // En un sistema real se debería verificar la sesión
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});


// Endpoint para guardar datos del vehículo
app.post('/saveCar', (req, res) => {
    // Aquí se procesarían y almacenarían los datos (por ejemplo, en una base de datos)
    console.log('Datos del vehículo recibidos:', req.body);
    res.json({ success: true, message: 'Datos guardados correctamente' });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
