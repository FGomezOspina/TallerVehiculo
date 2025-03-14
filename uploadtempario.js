const axios = require('axios');
const xlsx = require('xlsx');
const fs = require('fs');

// Cargar el archivo Excel
const workbook = xlsx.readFile('TEMPARIO_2024.xlsx');
const sheetName = workbook.SheetNames[0];
const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

let categorias = {};
let temparioData = [];
let currentCategory = null;

// Procesar los datos
for (let i = 0; i < data.length; i++) {
    let row = data[i];
    
    if (row[1] && !row[2] && !row[3]) {
        // Si la fila solo tiene la descripción y no tiene valores numéricos, es una categoría
        currentCategory = row[1];
    } else if (row[1] && row[2] && row[3] && currentCategory) {
        // Si la fila tiene descripción, tiempo y precio, es un item
        temparioData.push({
            categoria: currentCategory,
            descripcion: row[1],
            precio: parseFloat(row[3]), // Cambiar el orden
            tiempo: parseFloat(row[2])  // Cambiar el orden
        });
    }
}

async function uploadTempario() {
    try {
        const response = await axios.post('http://localhost:3000/saveTempario', { tempario: temparioData });
        console.log(`Datos enviados correctamente - Status: ${response.status}`);
    } catch (error) {
        console.error(`Error al enviar datos`, error.response ? error.response.data : error.message);
    }
}

uploadTempario();