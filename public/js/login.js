document.addEventListener('DOMContentLoaded', function() {
    // Verifica si hay mensaje de error en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    if (error === 'invalid') {
        document.getElementById('errorMsg').textContent = 'Credenciales inválidas. Intenta de nuevo.';
    }
});
