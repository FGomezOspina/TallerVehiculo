document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            console.log('Botón de logout presionado');
            window.location.href = '/logout';
        });
    } else {
        console.error('No se encontró el elemento con id "logout-btn"');
    }
});
