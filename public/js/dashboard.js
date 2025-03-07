document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sede = urlParams.get('sede');
    if (sede) {
      localStorage.setItem('sede', sede);
    }
  });